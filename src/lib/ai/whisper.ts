import { AiConfigError } from "./client";

// Cliente de transcripción con marcas de tiempo — la base del sistema de
// subtítulos animados: sin timestamps por palabra no hay forma de saber
// cuándo debe entrar cada `Palabra` de remotion/scenes/subtitulos/.
//
// Groq preferido sobre OpenAI (más barato y más rápido, mismo modelo
// whisper-large-v3 por debajo, misma forma de API) — mismo criterio que ya
// usa la skill `watch` para transcribir vídeos de referencia. Se cae a
// OpenAI si no hay GROQ_API_KEY.

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

/**
 * Transcribe un buffer de audio/vídeo con marcas de tiempo por palabra.
 *
 * Se manda el archivo tal cual (mp4, mov, mp3, wav, webm...) sin pasar por
 * ffmpeg primero: la API de Whisper acepta contenedores de vídeo
 * directamente y extrae el audio ella sola. Límite duro de ~25 MB por
 * archivo (de la propia API) — para un vídeo más pesado, hay que extraer el
 * audio a mp3 antes de mandarlo, pero eso no lo resuelve este cliente.
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

  if (params.buffer.byteLength > 25 * 1024 * 1024) {
    throw new Error(
      `El archivo pesa ${(params.buffer.byteLength / 1024 / 1024).toFixed(1)} MB; el límite de la API de transcripción es 25 MB. Extrae solo el audio primero (ffmpeg -i video.mp4 -vn -ac 1 -ar 16000 -b:a 64k audio.mp3).`
    );
  }

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(params.buffer)]), params.fileName);
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
