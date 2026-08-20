import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recortarSilenciosDeVideo } from "@/lib/silencios/recortar";
import { mediaAbsolutePath, mediaPublicUrl } from "@/lib/media-store";
import { makeId } from "@/lib/utils";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

// Genera el vídeo YA RECORTADO (silencios fuera) — ver la cabecera de
// src/lib/silencios/recortar.ts para el porqué de este camino en vez de
// editar la secuencia de Premiere en directo.

export const runtime = "nodejs";
export const maxDuration = 600;

const RangoSchema = z.object({
  inicioSeg: z.number(),
  finSeg: z.number(),
  duracionSeg: z.number().optional(),
});

const InputSchema = z.object({
  localPath: z.string().min(1),
  silencios: z.array(RangoSchema).min(1),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    const abs = path.resolve(body.localPath);
    const info = await fs.stat(abs).catch(() => null);
    if (!info || !info.isFile()) {
      return NextResponse.json({ error: `No existe el archivo: ${abs}` }, { status: 400, headers: CORS_HEADERS });
    }

    const id = makeId("recorte");
    const ext = path.extname(body.localPath) || ".mp4";
    const relPath = `generated/recorte-silencios-${id}${ext}`;
    const salidaAbs = mediaAbsolutePath(relPath);
    await fs.mkdir(path.dirname(salidaAbs), { recursive: true });

    const silencios = body.silencios.map((s) => ({ ...s, duracionSeg: s.duracionSeg ?? s.finSeg - s.inicioSeg }));
    const resultado = await recortarSilenciosDeVideo(abs, silencios, salidaAbs);

    return NextResponse.json(
      {
        id,
        filePath: relPath,
        url: mediaPublicUrl(relPath),
        tramosConservados: resultado.tramosConservados,
        duracionFinalSeg: resultado.duracionFinalSeg,
        silenciosQuitados: body.silencios.length,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400, headers: CORS_HEADERS });
    }
    const message = error instanceof Error ? error.message : "Error inesperado recortando el vídeo.";
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}
