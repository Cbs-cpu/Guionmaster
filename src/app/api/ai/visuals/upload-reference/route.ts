import { NextResponse } from "next/server";
import { z } from "zod";
import { saveBuffer, mediaPublicUrl, extensionFromContentType, guessExtensionFromUrl } from "@/lib/media-store";
import { makeId } from "@/lib/utils";

// Guarda localmente una foto de referencia (p. ej. una foto del usuario) para
// poder reutilizarla luego como input_urls en generaciones image-to-image de
// Kie.ai. No sube nada a Kie.ai todavía — eso pasa bajo demanda dentro de
// /api/ai/visuals/generate, porque los archivos subidos a Kie.ai caducan a
// los pocos días y este archivo local es la copia que manda.

const InputSchema = z.object({
  label: z.string().min(1),
  fileName: z.string().min(1),
  base64Data: z.string().min(1),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    const dataUrlMatch = body.base64Data.match(/^data:([^;]+);base64,([\s\S]*)$/);
    const contentType = dataUrlMatch?.[1] ?? null;
    const rawBase64 = dataUrlMatch ? dataUrlMatch[2] : body.base64Data;
    const buffer = Buffer.from(rawBase64, "base64");

    const ext =
      extensionFromContentType(contentType) ?? guessExtensionFromUrl(body.fileName) ?? "png";
    const id = makeId("ref");
    const relPath = `refs/${id}.${ext}`;
    await saveBuffer(relPath, buffer);

    return NextResponse.json({
      id,
      filePath: relPath,
      url: mediaPublicUrl(relPath),
      label: body.label,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "No se pudo guardar la imagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
