import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Detección de silencios en un archivo de audio/vídeo, vía el filtro
// `silencedetect` de ffmpeg — determinista y gratis, no hace falta ningún
// modelo para esto. `ffmpeg -af silencedetect` no escribe ningún archivo:
// analiza el audio y escribe pares "silence_start" / "silence_end" en
// stderr, así que basta con parsear esa salida, no hace falta -f null -
// tampoco escribe vídeo si se le pide un output nulo.

export interface RangoSilencio {
  /** Segundos desde el arranque del archivo de origen (no de la secuencia). */
  inicioSeg: number;
  finSeg: number;
  duracionSeg: number;
}

export interface OpcionesDeteccion {
  /** dB por debajo del cual se considera silencio. Más negativo = más permisivo (detecta menos). */
  umbralDb?: number;
  /** Segundos mínimos de silencio seguido para contar como corte. */
  duracionMinSeg?: number;
  /**
   * Margen que se resta a cada lado del rango detectado — lo que queda de
   * silencio SIN cortar en cada punto de corte, para que suene como una
   * respiración natural en vez de un salto seco. 0.12s se sentía a golpe
   * de robot; 0.18 ya se nota como una pausa real.
   */
  margenSeg?: number;
  /**
   * Si dos silencios detectados quedan separados por menos de esto de
   * palabra hablada, se fusionan en un único corte — esa palabra suelta
   * de menos de medio segundo entre dos silencios es casi siempre ruido
   * de fondo o una muletilla cortada a medias, y dejarla como su propio
   * fragmento entre dos cortes es lo que se notaba como "microrecorte".
   */
  distanciaMinSeg?: number;
}

const POR_DEFECTO: Required<OpcionesDeteccion> = {
  umbralDb: -32,
  duracionMinSeg: 0.6,
  margenSeg: 0.18,
  distanciaMinSeg: 0.4,
};

const RE_INICIO = /silence_start:\s*(-?[\d.]+)/;
const RE_FIN = /silence_end:\s*(-?[\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/;

/**
 * Corre `silencedetect` sobre el archivo indicado y devuelve los rangos de
 * silencio ya con margen aplicado (así el llamador puede usarlos tal cual
 * como puntos de corte sin comerse la primera/última sílaba de la palabra
 * siguiente/anterior).
 */
export async function detectarSilencios(
  rutaAbsoluta: string,
  opciones: OpcionesDeteccion = {}
): Promise<RangoSilencio[]> {
  // Fusión campo a campo con `??`, no `{...POR_DEFECTO, ...opciones}`: la
  // ruta de la API siempre manda las tres claves aunque el panel no las
  // rellene (quedan `undefined`, no ausentes), y un spread normal SÍ copia
  // esa clave — pisa el valor por defecto con `undefined` en vez de dejarlo
  // caer. Mismo fallo ya documentado en agrupar.ts; aquí se coló porque no
  // se copió esa misma cautela al escribir esta función.
  const cfg = {
    umbralDb: opciones.umbralDb ?? POR_DEFECTO.umbralDb,
    duracionMinSeg: opciones.duracionMinSeg ?? POR_DEFECTO.duracionMinSeg,
    margenSeg: opciones.margenSeg ?? POR_DEFECTO.margenSeg,
    distanciaMinSeg: opciones.distanciaMinSeg ?? POR_DEFECTO.distanciaMinSeg,
  };

  let stderr = "";
  try {
    // ffmpeg escribe TODO su log (incluido silencedetect) en stderr, aunque
    // termine en código 0 — que es el caso normal aquí, no un error.
    const res = await execFileAsync(
      "ffmpeg",
      [
        "-i",
        rutaAbsoluta,
        "-af",
        `silencedetect=noise=${cfg.umbralDb}dB:d=${cfg.duracionMinSeg}`,
        "-f",
        "null",
        "-",
      ],
      { timeout: 5 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 }
    );
    stderr = res.stderr;
  } catch (error) {
    // ffmpeg con -f null NO produce archivo de salida y aun así sale con
    // código 0 en el caso normal; si llega aquí es un fallo real (archivo
    // corrupto, códec no soportado…), pero stderr trae el log igualmente —
    // silencedetect ya habrá escrito lo que encontró antes de fallar, así
    // que se sigue intentando parsear en vez de tirar la toalla.
    stderr = error && typeof error === "object" && "stderr" in error ? String((error as { stderr?: string }).stderr) : "";
    if (!stderr.includes("silence_start")) {
      // El log completo va a la consola del servidor (la terminal de
      // `npm run dev`) — un mensaje de error en el panel de Premiere tiene
      // sitio para poco texto, y la causa real de ffmpeg suele estar al
      // FINAL del log (la última línea antes de morir), no al principio.
      console.error("[silencios/detectar] ffmpeg falló analizando", rutaAbsoluta, "\n", stderr);
      const cola = stderr.trim().slice(-800);
      throw new Error(
        `ffmpeg no pudo analizar el archivo (log completo en la terminal de "npm run dev"): ...${cola || (error instanceof Error ? error.message : String(error))}`
      );
    }
  }
  const lineas = stderr.split("\n");
  const rangos: RangoSilencio[] = [];
  let inicioPendiente: number | null = null;

  for (const linea of lineas) {
    const mInicio = RE_INICIO.exec(linea);
    if (mInicio) {
      inicioPendiente = parseFloat(mInicio[1]);
      continue;
    }
    const mFin = RE_FIN.exec(linea);
    if (mFin && inicioPendiente !== null) {
      const fin = parseFloat(mFin[1]);
      const duracion = parseFloat(mFin[2]);
      rangos.push({ inicioSeg: inicioPendiente, finSeg: fin, duracionSeg: duracion });
      inicioPendiente = null;
    }
  }

  // Fusión: dos silencios separados por menos de `distanciaMinSeg` de
  // palabra hablada se tratan como UNO — esa palabra suelta de menos de
  // medio segundo entre dos cortes es lo que se sentía como "microrecorte"
  // (un fragmento de vídeo casi invisible entre dos saltos, que el ojo lee
  // como un tartamudeo del montaje, no como una palabra de verdad). Los
  // silencios ya llegan ordenados por tiempo (así los escribe ffmpeg).
  const fusionados: RangoSilencio[] = [];
  for (const r of rangos) {
    const anterior = fusionados[fusionados.length - 1];
    if (anterior && r.inicioSeg - anterior.finSeg < cfg.distanciaMinSeg) {
      anterior.finSeg = r.finSeg;
      anterior.duracionSeg = anterior.finSeg - anterior.inicioSeg;
    } else {
      fusionados.push({ ...r });
    }
  }

  // Margen: se aplica DESPUÉS de fusionar y de calcular duracionSeg (con la
  // duración real detectada, no la recortada) para que la duración
  // informada al usuario sea la real, aunque el rango que se vaya a cortar
  // sea un pelín más corto por seguridad — y para que quede un resto de
  // silencio real a cada lado del corte (una respiración, no un salto seco).
  return fusionados
    .map((r) => ({
      inicioSeg: Math.max(0, r.inicioSeg + cfg.margenSeg),
      finSeg: Math.max(0, r.finSeg - cfg.margenSeg),
      duracionSeg: r.duracionSeg,
    }))
    .filter((r) => r.finSeg > r.inicioSeg);
}
