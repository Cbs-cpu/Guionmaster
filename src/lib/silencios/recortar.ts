import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { RangoSilencio } from "./detectar";

const execFileAsync = promisify(execFile);

// Genera el vídeo YA RECORTADO (silencios fuera) con ffmpeg — en vez de
// intentar editar la secuencia de Premiere en directo.
//
// Se probó primero el camino "razor + rippleDelete" sobre la API QE
// (histórica, no documentada) de Premiere, verificado en vivo contra
// Premiere real vía el MCP Bridge: los cortes aterrizaban en posiciones
// erráticas, con desfases de entre 0.08s y 1.6s sin ningún patrón
// corregible por software (confirmado con llamadas aisladas, con y sin
// pausa entre medias). No es seguro para un corte de precisión, así que en
// vez de insistir con una API que no se porta bien, el recorte de verdad se
// hace aquí — con ffmpeg, la misma herramienta que ya usa la detección
// (100% fiable) — y el resultado se importa/inserta con los botones de
// siempre, que nunca han fallado.

/** Duración total del archivo en segundos, vía ffprobe. */
export async function duracionSeg(rutaAbsoluta: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    rutaAbsoluta,
  ]);
  const seg = parseFloat(stdout.trim());
  if (isNaN(seg)) throw new Error("ffprobe no pudo determinar la duración del archivo.");
  return seg;
}

/**
 * Recorta `rutaEntrada` quitando los `silencios` indicados, escribiendo el
 * resultado en `rutaSalida`. Reconstruye por `filter_complex` (trim +
 * concat) los tramos que SÍ se quedan — el complemento de los silencios —
 * en vez de intentar borrar los tramos malos, que es más frágil con
 * fronteras que no caen en keyframe.
 */
export async function recortarSilenciosDeVideo(
  rutaEntrada: string,
  silencios: RangoSilencio[],
  rutaSalida: string
): Promise<{ tramosConservados: number; duracionFinalSeg: number }> {
  const duracionOriginal = await duracionSeg(rutaEntrada);

  const silenciosOrdenados = [...silencios].sort((a, b) => a.inicioSeg - b.inicioSeg);

  // Tramos a CONSERVAR: el complemento de los silencios, acotados a
  // [0, duracionOriginal]. Un silencio pegado al principio o al final del
  // archivo simplemente no deja tramo antes/después — no es un caso
  // especial, sale solo de la aritmética.
  const tramos: { inicio: number; fin: number }[] = [];
  let cursor = 0;
  for (const s of silenciosOrdenados) {
    if (s.inicioSeg > cursor) tramos.push({ inicio: cursor, fin: Math.min(s.inicioSeg, duracionOriginal) });
    cursor = Math.max(cursor, s.finSeg);
  }
  if (cursor < duracionOriginal) tramos.push({ inicio: cursor, fin: duracionOriginal });

  const tramosValidos = tramos.filter((t) => t.fin - t.inicio > 0.01);
  if (!tramosValidos.length) {
    throw new Error("No queda ningún tramo tras quitar los silencios seleccionados — revisa la selección.");
  }

  const filtrosTrim: string[] = [];
  // El filtro `concat` de ffmpeg espera las entradas INTERCALADAS por
  // tramo — [v0][a0][v1][a1]…, no todos los vídeos seguidos de todos los
  // audios. Mandarlas en el orden equivocado no da un error claro: lanza
  // "Media type mismatch" apuntando a un filtro interno, nada que diga
  // "reordena tus etiquetas" — se pilló probando de verdad, no adivinando.
  const etiquetasIntercaladas: string[] = [];

  tramosValidos.forEach((t, i) => {
    filtrosTrim.push(`[0:v]trim=start=${t.inicio.toFixed(3)}:end=${t.fin.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
    filtrosTrim.push(`[0:a]atrim=start=${t.inicio.toFixed(3)}:end=${t.fin.toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`);
    etiquetasIntercaladas.push(`[v${i}]`, `[a${i}]`);
  });

  const n = tramosValidos.length;
  const concat = `${etiquetasIntercaladas.join("")}concat=n=${n}:v=1:a=1[outv][outa]`;
  const filterComplex = [...filtrosTrim, concat].join(";");

  await execFileAsync(
    "ffmpeg",
    [
      "-y",
      "-i",
      rutaEntrada,
      "-filter_complex",
      filterComplex,
      "-map",
      "[outv]",
      "-map",
      "[outa]",
      "-c:v",
      "libx264",
      "-crf",
      "16",
      "-preset",
      "medium",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      rutaSalida,
    ],
    { timeout: 20 * 60 * 1000, maxBuffer: 32 * 1024 * 1024 }
  ).catch((error) => {
    const stderr = error && typeof error === "object" && "stderr" in error ? String((error as { stderr?: string }).stderr) : "";
    throw new Error(`ffmpeg no pudo recortar el vídeo: ${stderr.slice(-800) || (error instanceof Error ? error.message : String(error))}`);
  });

  const duracionFinalSeg = tramosValidos.reduce((acc, t) => acc + (t.fin - t.inicio), 0);
  return { tramosConservados: tramosValidos.length, duracionFinalSeg };
}
