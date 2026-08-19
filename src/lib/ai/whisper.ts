import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { AiConfigError } from "./client";

// Cliente de transcripción con marcas de tiempo — la base del sistema de
// subtítulos animados: sin timestamps por palabra no hay forma de saber
// cuándo debe entrar cada `Palabra` de remotion/scenes/subtitulos/.
//
// Groq preferido sobre OpenAI (más barato y más rápido, mismo modelo
// whisper-large-v3 por debajo, misma forma de API) — mismo criterio que ya
// usa la skill `watch` para transcribir vídeos de referencia. Se cae a
// OpenAI si no hay GROQ_API_KEY.

const execFileAsync = promisify(execFile);

export type WhisperBackend = "groq" | "openai";

export interface PalabraTranscrita {
  texto: string;
  /** Segundos desde el arranque del archivo. */
  inicio: number;
  fin: number;
}

export interface Transcripcion {
  backend: WhisperBackend;
  idioma: string | null;
  duracion: number;
  texto: string;
  palabras: PalabraTranscrita[];
}

function backendDisponible(): WhisperBackend {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.OPENAI_API_KEY) return "openai";
  throw new AiConfigError(
    "Falta GROQ_API_KEY o OPENAI_API_KEY. Añade una a tu .env.local para transcribir (Groq es más barato: console.groq.com/keys)."
  );
}

interface RespuestaWhisperVerbose {
  language?: string;
  duration?: number;
  text: string;
  words?: { word: string; start: number; end: number }[];
  segments?: { text: string; start: number; end: number }[];
}

const ENDPOINTS: Record<WhisperBackend, { url: string; model: string; envKey: string }> = {
  groq: {
    url: "https://api.groq.com/openai/v1/audio/transcriptions",
    model: "whisper-large-v3",
    envKey: "GROQ_API_KEY",
  },
  openai: {
    url: "https://api.openai.com/v1/audio/transcriptions",
    model: "whisper-1",
    envKey: "OPENAI_API_KEY",
  },
};

const LIMITE_API = 25 * 1024 * 1024;

/**
 * Extrae solo el audio con ffmpeg (mono, 16 kHz, 64 kbps — ~0.5 MB/min), la
 * misma receta que ya usa la skill `watch` para transcribir vídeos de
 * referencia. Reduce CUALQUIER archivo de entrada — vídeo pesado o audio ya
 * comprimido — a algo que entra de sobra en el límite de 25 MB de la API,
 * así que se aplica siempre, no solo cuando el original ya se pasa: es más
 * simple mantener un solo camino que decidir caso por caso cuándo hace
 * falta, y de paso normaliza formatos raros de entrada a algo que Whisper
 * siempre digiere bien.
 *
 * Pasa por disco (no por pipe): ffmpeg necesita poder buscar en el
 * contenedor de entrada para sniffear el códec en varios formatos, y eso no
 * es fiable metiéndolo por stdin sin más pistas.
 */
async function extraerAudio(buffer: Buffer, fileName: string): Promise<{ buffer: Buffer; fileName: string }> {
  const ext = path.extname(fileName) || ".bin";
  const base = path.join(os.tmpdir(), `scc-audio-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const entrada = base + ext;
  const salida = base + ".mp3";

  try {
    await fs.writeFile(entrada, buffer);
    await execFileAsync("ffmpeg", ["-y", "-i", entrada, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k", salida], {
      timeout: 5 * 60 * 1000,
    });
    const extraido = await fs.readFile(salida);
    return { buffer: extraido, fileName: path.basename(fileName, ext) + ".mp3" };
  } catch (error) {
    const stderr = error && typeof error === "object" && "stderr" in error ? String((error as { stderr?: string }).stderr) : "";
    throw new Error(
      `No se ha podido extraer el audio con ffmpeg: ${stderr.slice(-500) || (error instanceof Error ? error.message : String(error))}`
    );
  } finally {
    await fs.rm(entrada, { force: true });
    await fs.rm(salida, { force: true });
  }
}

/**
 * Transcribe un buffer de audio/vídeo con marcas de tiempo por palabra.
 *
 * Primero se le quita el vídeo y se comprime el audio con ffmpeg
 * (`extraerAudio`) — así un archivo de cualquier tamaño llega ya por debajo
 * del límite de 25 MB de la API sin que quien llame tenga que pensar en
 * ello. El límite se comprueba igualmente DESPUÉS de extraer, como red de
 * seguridad para una grabación excepcionalmente larga (a 64 kbps, 25 MB son
 * más de 50 minutos de audio).
 */
export async function transcribir(params: {
  buffer: Buffer;
  fileName: string;
  backend?: WhisperBackend;
}): Promise<Transcripcion> {
  const backend = params.backend ?? backendDisponible();
  const config = ENDPOINTS[backend];
  const apiKey = process.env[config.envKey];
  if (!apiKey) {
    throw new AiConfigError(`Falta ${config.envKey} en .env.local para usar ${backend}.`);
  }

  const audio = await extraerAudio(params.buffer, params.fileName);

  if (audio.buffer.byteLength > LIMITE_API) {
    throw new Error(
      `El audio extraído pesa ${(audio.buffer.byteLength / 1024 / 1024).toFixed(1)} MB; el límite de la API de transcripción es 25 MB (a 64 kbps, son más de 50 minutos). Recorta el archivo antes de transcribirlo.`
    );
  }

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio.buffer)]), audio.fileName);
  form.append("model", config.model);
  form.append("response_format", "verbose_json");
  // Se piden las dos granularidades: si el backend no da nivel de palabra
  // (a veces Groq no lo trae para according a la duración), queda el nivel
  // de segmento como red de seguridad para no perder la transcripción entera.
  form.append("timestamp_granularities[]", "word");
  form.append("timestamp_granularities[]", "segment");

  const res = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Transcripción (${backend}) falló (HTTP ${res.status}): ${raw.slice(0, 300)}`);
  }

  let parsed: RespuestaWhisperVerbose;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Respuesta de ${backend} no es JSON válido: ${raw.slice(0, 200)}`);
  }

  const palabras: PalabraTranscrita[] = (parsed.words ?? []).map((w) => ({
    texto: w.word.trim(),
    inicio: w.start,
    fin: w.end,
  }));

  // Sin nivel de palabra: se reparte cada segmento en partes iguales entre
  // sus propias palabras. Es una aproximación (el habla no es uniforme),
  // pero da timing utilizable en vez de fallar del todo.
  if (palabras.length === 0 && parsed.segments?.length) {
    for (const seg of parsed.segments) {
      const trozos = seg.text.trim().split(/\s+/).filter(Boolean);
      if (!trozos.length) continue;
      const paso = (seg.end - seg.start) / trozos.length;
      trozos.forEach((texto, i) => {
        palabras.push({ texto, inicio: seg.start + i * paso, fin: seg.start + (i + 1) * paso });
      });
    }
  }

  return {
    backend,
    idioma: parsed.language ?? null,
    duracion: parsed.duration ?? (palabras.length ? palabras[palabras.length - 1].fin : 0),
    texto: parsed.text,
    palabras,
  };
}
