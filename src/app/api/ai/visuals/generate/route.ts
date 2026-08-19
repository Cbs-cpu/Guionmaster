import { NextResponse } from "next/server";
import { z } from "zod";
import { aiErrorResponse } from "@/lib/ai/respond";
import { KIE_MODELS, kieGenerateImages, kieUploadBase64 } from "@/lib/ai/kie";
import { guessExtensionFromUrl, mediaPublicUrl, readAsBase64, saveFromUrl } from "@/lib/media-store";
import { makeId } from "@/lib/utils";

// Genera una imagen con Kie.ai (infografía, imagen de contexto, o una
// composición con fotos de referencia del usuario) y la descarga a
// data/media/generated de inmediato, porque las URLs que devuelve Kie.ai
// caducan a las 24h. Esta ruta solo genera y guarda el archivo: quien la
// llama decide si lo asocia a un guion/capítulo (PATCH manual del registro
// en el store, o vía la propia app).

const InputSchema = z.object({
  kind: z.enum(["infografia", "imagen-contexto", "imagen-usuario", "otro"]),
  prompt: z.string().min(1),
  aspectRatio: z.string().optional(),
  resolution: z.enum(["1K", "2K", "4K"]).optional(),
  /** Rutas relativas bajo data/media (p. ej. "refs/abc.png") de fotos ya subidas con /upload-reference. */
  referenceImagePaths: z.array(z.string()).max(16).optional(),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());
    const aspect_ratio = body.aspectRatio ?? "auto";
    const resolution = body.resolution ?? "2K";

    let model: string = KIE_MODELS.textToImage;
    const input: Record<string, unknown> = { prompt: body.prompt, aspect_ratio, resolution };

    if (body.referenceImagePaths?.length) {
      const uploadedUrls: string[] = [];
      for (const relPath of body.referenceImagePaths) {
        const base64 = await readAsBase64(relPath);
        const fileName = relPath.split("/").pop() ?? "referencia.png";
        const url = await kieUploadBase64({ base64Data: `data:image/png;base64,${base64}`, fileName });
        uploadedUrls.push(url);
      }
      model = KIE_MODELS.imageToImage;
      input.input_urls = uploadedUrls;
    }

    const resultUrls = await kieGenerateImages({ model, input });
    const resultUrl = resultUrls[0];

    const id = makeId("visual");
    const ext = guessExtensionFromUrl(resultUrl);
    const relPath = `generated/${id}.${ext}`;
    await saveFromUrl(relPath, resultUrl);

    return NextResponse.json({
      id,
      kind: body.kind,
      prompt: body.prompt,
      model,
      filePath: relPath,
      url: mediaPublicUrl(relPath),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
