import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { detectarSilencios } from "@/lib/silencios/detectar";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

// Detecta silencios en un archivo local (el clip bajo el cursor en Premiere,
// vía /api/system/paths, igual que /api/ai/subtitulos/transcribir) y
// devuelve los rangos SIN tocar nada — el recorte real en la secuencia lo
// hace el panel llamando a sccRecortarSilencios en host/index.jsx, y solo
// después de que el usuario apruebe la lista. Esta ruta es puro análisis:
// puede llamarse tantas veces como haga falta (probar otro umbral, otra
// duración mínima) sin ningún efecto en el proyecto de Premiere.

export const runtime = "nodejs";
export const maxDuration = 300;

const InputSchema = z.object({
  localPath: z.string().min(1),
  umbralDb: z.number().negative().optional(),
  duracionMinSeg: z.number().positive().optional(),
  margenSeg: z.number().min(0).optional(),
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

    const silencios = await detectarSilencios(abs, {
      umbralDb: body.umbralDb,
      duracionMinSeg: body.duracionMinSeg,
      margenSeg: body.margenSeg,
    });

    const ahorroSeg = silencios.reduce((acc, r) => acc + (r.finSeg - r.inicioSeg), 0);

    return NextResponse.json({ silencios, ahorroSeg, total: silencios.length }, { headers: CORS_HEADERS });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400, headers: CORS_HEADERS });
    }
    const message = error instanceof Error ? error.message : "Error inesperado detectando silencios.";
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}
