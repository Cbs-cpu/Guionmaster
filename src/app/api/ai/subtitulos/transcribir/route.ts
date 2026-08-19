import fs from "node:fs/promises";
import path from "node:path";
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
//
// Dos formas de mandar el archivo, según quién llama:
//   - `base64Data`: la web (input file del navegador, que solo ve bytes).
//   - `localPath`: el panel de Premiere. El servidor y Premiere corren en la
//     MISMA máquina, así que en vez de leer el archivo en el panel,
//     codificarlo en base64 en JavaScript y mandarlo por HTTP (lento y
//     redundante para un vídeo de varios MB), el panel manda la ruta
//     absoluta y el servidor lee el archivo él mismo del disco.

export const runtime = "nodejs";

const InputSchema = z
  .object({
    fileName: z.string().min(1),
    base64Data: z.string().min(1).optional(),
    localPath: z.string().min(1).optional(),
    backend: z.enum(["groq", "openai"]).optional(),
  })
  .refine((v) => Boolean(v.base64Data) !== Boolean(v.localPath), {
    message: "Manda exactamente uno de base64Data o localPath, no los dos ni ninguno.",
  });

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    let buffer: Buffer;
    if (body.localPath) {
      // Ruta absoluta que ya viene resuelta desde el panel (a través de
      // /api/system/paths + File.fsName de ExtendScript) — no desde el
      // usuario tecleando, así que no hace falta el mismo escrutinio que a
      // una ruta libre, pero sí confirmar que apunta a un archivo real antes
      // de leerlo entero en memoria.
      const abs = path.resolve(body.localPath);
      const info = await fs.stat(abs).catch(() => null);
      if (!info || !info.isFile()) {
        return NextResponse.json(
          { error: `No existe el archivo: ${abs}` },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      buffer = await fs.readFile(abs);
    } else {
      const dataUrlMatch = body.base64Data!.match(/^data:([^;]+);base64,([\s\S]*)$/);
      const rawBase64 = dataUrlMatch ? dataUrlMatch[2] : body.base64Data!;
      buffer = Buffer.from(rawBase64, "base64");
    }

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
