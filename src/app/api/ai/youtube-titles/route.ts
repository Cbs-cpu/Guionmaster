import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText, extractJson } from "@/lib/ai/client";
import { buildCoreSystemPrompt, buildJsonInstruction } from "@/lib/ai/systemPrompt";
import { aiErrorResponse } from "@/lib/ai/respond";
import { YOUTUBE_TYPE_LABELS } from "@/lib/types";

const InputSchema = z.object({
  tema: z.string().min(1),
  publico: z.string().min(1),
  objetivo: z.string().min(1),
  conceptos: z.string().min(1),
  duracion: z.string().min(1),
  tipo: z.enum([
    "educativo",
    "analisis",
    "caso_practico",
    "storytelling",
    "explicacion",
    "opinion",
    "tutorial",
  ]),
});

const OutputSchema = z.object({ titulos: z.array(z.string().min(1)).length(5) });

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    const system = `${buildCoreSystemPrompt()}

TAREA: proponer 5 títulos para un vídeo de YouTube de tipo "${YOUTUBE_TYPE_LABELS[body.tipo]}".
Los títulos deben generar curiosidad o prometer un resultado claro, sin ser sensacionalistas ni clickbait vacío, y sin sonar a anuncio de producto. Varía el ángulo entre los 5 (pregunta, afirmación contraintuitiva, promesa concreta, error común, historia).

${buildJsonInstruction(`{"titulos": ["string", "string", "string", "string", "string"]}`)}`;

    const user = `Tema: ${body.tema}
Público objetivo: ${body.publico}
Objetivo del vídeo: ${body.objetivo}
Conceptos a tratar: ${body.conceptos}
Duración: ${body.duracion}
Tipo de vídeo: ${YOUTUBE_TYPE_LABELS[body.tipo]}`;

    const raw = await askForText({ system, user, maxTokens: 900 });
    const parsed = OutputSchema.parse(extractJson(raw));
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
