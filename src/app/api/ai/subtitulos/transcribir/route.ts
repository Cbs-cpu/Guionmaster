import { NextResponse } from "next/server";
import { z } from "zod";
import { aiErrorResponse } from "@/lib/ai/respond";
import { transcribir, type WhisperBackend } from "@/lib/ai/whisper";
import { saveBuffer, mediaPublicUrl } from "@/lib/media-store";
import { makeId } from "@/lib/utils";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

// Transcribe un archivo de audio/vídeo con marcas de tiempo por palabra y
// guarda el resultado en data/media/generated/transcripts/<id>.json — así la
// transcripción sobrevive aunque se cambie de estilo de subtítulos después
// (transcribir cuesta una llamada a la API de Whisper; probar tres estilos
// sobre la misma transcripción no debería costar tres).

export const runtime = "nodejs";

const InputSchema = z.object({
  fileName: z.string().min(1),
  base64Data: z.string().min(1),
  backend: z.enum(["groq", "openai"]).optional(),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    const dataUrlMatch = body.base64Data.match(/^data:([^;]+);base64,([\s\S]*)$/);
    const rawBase64 = dataUrlMatch ? dataUrlMatch[2] : body.base64Data;
    const buffer = Buffer.from(rawBase64, "base64");

    const resultado = await transcribir({
      buffer,
      fileName: body.fileName,
      backend: body.backend as WhisperBackend | undefined,
    });

    const id = makeId("transcript");
    const relPath = `generated/transcripts/${id}.json`;
    const payload = {
      id,
      fuente: body.fileName,
      creadaEn: new Date().toISOString(),
      ...resultado,
    };
    await saveBuffer(relPath, Buffer.from(JSON.stringify(payload, null, 2)));

    return NextResponse.json(
      { id, filePath: relPath, url: mediaPublicUrl(relPath), ...resultado },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Entrada inválida.", details: error.issues },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const respuesta = aiErrorResponse(error);
    for (const [k, v] of Object.entries(CORS_HEADERS)) respuesta.headers.set(k, v);
    return respuesta;
  }
}
