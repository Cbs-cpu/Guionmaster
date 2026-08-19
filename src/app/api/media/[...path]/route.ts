import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { mediaAbsolutePath, MIME_BY_EXT } from "@/lib/media-store";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";

/**
 * Sirve cualquier archivo guardado bajo data/media.
 *
 * Soporta peticiones por rango (HTTP 206) porque las animaciones de contexto
 * son vídeo: `<video>` pide `Range: bytes=…` para poder buscar dentro del
 * clip, y si siempre se le responde con el archivo entero y un 200, la barra
 * de progreso no funciona. Para las imágenes la ruta se comporta igual que
 * antes, porque el navegador simplemente no manda cabecera Range.
 */
/** Preflight para el panel de Premiere, que pide desde otro origen. */
export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const relPath = segments.join("/");

  let abs: string;
  try {
    abs = mediaAbsolutePath(relPath);
  } catch {
    return NextResponse.json({ error: "Ruta inválida." }, { status: 400, headers: CORS_HEADERS });
  }

  const ext = relPath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
  const cacheHeaders = {
    "Content-Type": contentType,
    "Cache-Control": "private, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    ...CORS_HEADERS,
  };

  let handle: Awaited<ReturnType<typeof fs.open>>;
  try {
    handle = await fs.open(abs, "r");
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404, headers: CORS_HEADERS });
  }

  try {
    const { size } = await handle.stat();
    const range = parseRange(req.headers.get("range"), size);

    if (range === "invalid") {
      return new NextResponse(null, {
        status: 416,
        headers: { ...cacheHeaders, "Content-Range": `bytes */${size}` },
      });
    }

    if (!range) {
      const data = await handle.readFile();
      return new NextResponse(new Uint8Array(data), {
        headers: { ...cacheHeaders, "Content-Length": String(size) },
      });
    }

    const length = range.end - range.start + 1;
    const buf = Buffer.alloc(length);
    await handle.read(buf, 0, length, range.start);

    return new NextResponse(new Uint8Array(buf), {
      status: 206,
      headers: {
        ...cacheHeaders,
        "Content-Length": String(length),
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      },
    });
  } finally {
    await handle.close();
  }
}

/**
 * Interpreta una cabecera `Range` de un solo tramo.
 * Devuelve null si no hay cabecera (respuesta completa), "invalid" si pide
 * algo fuera del archivo, o el tramo resuelto.
 */
function parseRange(
  header: string | null,
  size: number
): { start: number; end: number } | null | "invalid" {
  if (!header) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return null;

  // Forma "-N": los últimos N bytes.
  if (!rawStart) {
    const suffix = Number(rawEnd);
    if (!suffix) return "invalid";
    return { start: Math.max(0, size - suffix), end: size - 1 };
  }

  const start = Number(rawStart);
  const end = rawEnd ? Math.min(Number(rawEnd), size - 1) : size - 1;
  if (start >= size || end < start) return "invalid";

  return { start, end };
}
