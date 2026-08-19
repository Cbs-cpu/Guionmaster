import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

// Archivos generados (infografías, imágenes de contexto, fotos de
// referencia subidas por el usuario, PDFs/presentaciones) se guardan en
// disco bajo data/media — mismo espíritu que data/studio.db: contenido
// personal, gitignored, no depende de un CDN externo cuya URL caduca.

const MEDIA_ROOT = path.join(process.cwd(), "data", "media");

/** Resuelve una ruta relativa dentro de data/media, bloqueando salidas (../). */
export function mediaAbsolutePath(relPath: string): string {
  const resolved = path.resolve(MEDIA_ROOT, relPath);
  const rootWithSep = MEDIA_ROOT.endsWith(path.sep) ? MEDIA_ROOT : MEDIA_ROOT + path.sep;
  if (resolved !== MEDIA_ROOT && !resolved.startsWith(rootWithSep)) {
    throw new Error("Ruta de media inválida.");
  }
  return resolved;
}

export async function saveBuffer(relPath: string, data: Buffer): Promise<void> {
  const abs = mediaAbsolutePath(relPath);
  await fsp.mkdir(path.dirname(abs), { recursive: true });
  await fsp.writeFile(abs, data);
}

/** Descarga una URL remota (p. ej. el resultado de Kie.ai, que caduca en 24h) y la fija en disco. */
export async function saveFromUrl(relPath: string, url: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar el archivo generado (HTTP ${res.status}).`);
  const buf = Buffer.from(await res.arrayBuffer());
  await saveBuffer(relPath, buf);
}

export async function readAsBase64(relPath: string): Promise<string> {
  const abs = mediaAbsolutePath(relPath);
  const buf = await fsp.readFile(abs);
  return buf.toString("base64");
}

export function mediaExists(relPath: string): boolean {
  try {
    return fs.existsSync(mediaAbsolutePath(relPath));
  } catch {
    return false;
  }
}

/** Ruta pública servida por src/app/api/media/[...path]/route.ts */
export function mediaPublicUrl(relPath: string): string {
  return `/api/media/${relPath.split(path.sep).join("/")}`;
}

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function guessExtensionFromUrl(url: string): string {
  const match = url.match(/\.(png|jpe?g|webp|gif)(?:\?|$)/i);
  if (match) return match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  return "png";
}

export function extensionFromContentType(contentType: string | null): string | undefined {
  if (!contentType) return undefined;
  return EXT_BY_CONTENT_TYPE[contentType.split(";")[0].trim().toLowerCase()];
}

export const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  // Animaciones de contexto renderizadas con Remotion (carpeta remotion/).
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  // Estilo de subtítulos (Advanced SubStation Alpha), descargable desde /recursos.
  ass: "text/x-ssa",
};
