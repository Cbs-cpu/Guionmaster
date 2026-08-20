import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Aplica un LUT `.cube` a un vídeo con ffmpeg (`-vf lut3d=...`), horneándolo
// en un archivo nuevo — igual que el recorte de silencios, en vez de tocar
// nada dentro de Premiere: verificado en vivo que la API QE de esta versión
// de Premiere no añade el efecto Lumetri Color de forma fiable (addOk pero
// cero componentes reales, mismo tipo de fallo silencioso que razor()).
// Solo la SUSTITUCIÓN del clip en el timeline (quitar + volver a insertar
// en el mismo sitio) se hace con la API de Premiere — esa sí se verificó
// exacta (ver host/index.jsx, sccSustituirClips).

/**
 * `-vf lut3d` necesita la ruta del `.cube` sin caracteres que rompan el
 * parser del filtro (dos puntos, comas, corchetes) — en Windows la unidad
 * "C:" ya lleva uno. Se escapa igual que recomienda la documentación de
 * ffmpeg para filtros con ruta de archivo.
 */
function escaparRutaParaFiltro(ruta: string): string {
  return ruta.replace(/\\/g, "/").replace(/:/g, "\\:");
}

export async function aplicarLutAVideo(rutaEntrada: string, rutaLut: string, rutaSalida: string): Promise<void> {
  const filtro = `lut3d=file='${escaparRutaParaFiltro(rutaLut)}'`;
  await execFileAsync(
    "ffmpeg",
    ["-y", "-i", rutaEntrada, "-vf", filtro, "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-c:a", "copy", rutaSalida],
    { timeout: 20 * 60 * 1000, maxBuffer: 32 * 1024 * 1024 }
  ).catch((error) => {
    const stderr = error && typeof error === "object" && "stderr" in error ? String((error as { stderr?: string }).stderr) : "";
    throw new Error(`ffmpeg no pudo aplicar el LUT: ${stderr.slice(-800) || (error instanceof Error ? error.message : String(error))}`);
  });
}
