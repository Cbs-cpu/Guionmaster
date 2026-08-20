import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { aplicarLutAVideo } from "@/lib/luts/aplicar";
import { mediaAbsolutePath, mediaPublicUrl } from "@/lib/media-store";
import { makeId } from "@/lib/utils";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

// Aplica un LUT a uno o varios clips de golpe — uno por cada vídeo
// seleccionado en el timeline (el panel ya sabe cuáles son, vía
// sccObtenerSeleccion en host/index.jsx). Cada clip se procesa por
// separado y un fallo en uno no aborta el resto.

export const runtime = "nodejs";
export const maxDuration = 600;

const ClipSchema = z.object({
  /** Ruta absoluta del archivo de origen del clip (viene de projectItem.getMediaPath()). */
  mediaPath: z.string().min(1),
});

const InputSchema = z.object({
  clips: z.array(ClipSchema).min(1),
  /** Ruta absoluta del .cube, dentro de data/recursos-externos. */
  lutPath: z.string().min(1),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    const lutAbs = path.resolve(body.lutPath);
    const lutInfo = await fs.stat(lutAbs).catch(() => null);
    if (!lutInfo || !lutInfo.isFile()) {
      return NextResponse.json({ error: `No existe el LUT: ${lutAbs}` }, { status: 400, headers: CORS_HEADERS });
    }

    const resultados: { mediaPath: string; ok: boolean; filePath?: string; url?: string; error?: string }[] = [];

    for (const clip of body.clips) {
      const entradaAbs = path.resolve(clip.mediaPath);
      try {
        const info = await fs.stat(entradaAbs).catch(() => null);
        if (!info || !info.isFile()) throw new Error(`No existe el archivo: ${entradaAbs}`);

        const id = makeId("lut");
        const ext = path.extname(clip.mediaPath) || ".mp4";
        const relPath = `generated/lut-${id}${ext}`;
        const salidaAbs = mediaAbsolutePath(relPath);
        await fs.mkdir(path.dirname(salidaAbs), { recursive: true });

        await aplicarLutAVideo(entradaAbs, lutAbs, salidaAbs);

        resultados.push({ mediaPath: clip.mediaPath, ok: true, filePath: relPath, url: mediaPublicUrl(relPath) });
      } catch (error) {
        resultados.push({
          mediaPath: clip.mediaPath,
          ok: false,
          error: error instanceof Error ? error.message : "Error inesperado aplicando el LUT.",
        });
      }
    }

    return NextResponse.json({ resultados }, { headers: CORS_HEADERS });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400, headers: CORS_HEADERS });
    }
    const message = error instanceof Error ? error.message : "Error inesperado aplicando LUTs.";
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}
