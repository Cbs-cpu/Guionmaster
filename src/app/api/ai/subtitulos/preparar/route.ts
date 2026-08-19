import { NextResponse } from "next/server";
import { z } from "zod";
import { agruparEnLineas, lineasAFrames } from "@/lib/subtitulos/agrupar";
import { mediaAbsolutePath } from "@/lib/media-store";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";
import fs from "node:fs/promises";

// Agrupa una transcripción ya guardada en líneas de subtítulo, SIN
// renderizar nada — es JavaScript puro (agrupar.ts), no toca Remotion ni
// Chromium, así que responde en milisegundos.
//
// Existe para separar "tengo los datos para previsualizar" de "quiero el
// archivo final horneado": el panel de Premiere llama aquí justo después de
// transcribir para alimentar el preview en vivo (@remotion/player, en
// /premiere-preview/subtitulos), y solo llama a /api/ai/subtitulos/render
// —el que sí abre Chromium y tarda— cuando el usuario ya eligió estilo y
// confirma. Cambiar de estilo en el preview no pasa por aquí en absoluto:
// las líneas no cambian con el estilo, solo el estiloId que ya vive en el
// navegador.

export const runtime = "nodejs";

const InputSchema = z.object({
  transcriptPath: z.string().min(1),
  claves: z.array(z.string()).optional(),
  maxPalabras: z.number().int().positive().optional(),
  maxDuracionSeg: z.number().positive().optional(),
  pausaCorteSeg: z.number().positive().optional(),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    const transcriptAbs = mediaAbsolutePath(body.transcriptPath);
    const transcriptRaw = await fs.readFile(transcriptAbs, "utf8").catch(() => {
      throw new Error(`No existe la transcripción: ${body.transcriptPath}`);
    });
    const transcripcion = JSON.parse(transcriptRaw) as {
      palabras: { texto: string; inicio: number; fin: number }[];
    };

    if (!transcripcion.palabras?.length) {
      return NextResponse.json(
        { error: "Esa transcripción no tiene ninguna palabra con marca de tiempo." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const lineasSeg = agruparEnLineas(transcripcion.palabras, {
      maxPalabras: body.maxPalabras,
      maxDuracionSeg: body.maxDuracionSeg,
      pausaCorteSeg: body.pausaCorteSeg,
      claves: body.claves,
    });
    const lineas = lineasAFrames(lineasSeg, 30);

    return NextResponse.json({ lineas }, { headers: CORS_HEADERS });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Entrada inválida.", details: error.issues },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const message = error instanceof Error ? error.message : "Error inesperado agrupando la transcripción.";
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}
