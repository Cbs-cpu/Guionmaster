import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText, extractJson } from "@/lib/ai/client";
import { buildCoreSystemPrompt, buildJsonInstruction } from "@/lib/ai/systemPrompt";
import { aiErrorResponse } from "@/lib/ai/respond";
import { findConceptsByTerms } from "@/lib/knowledge-base";
import { HOOK_TYPE_LABELS, SERVICIO_LABELS } from "@/lib/types";

const InputSchema = z.object({
  servicio: z.enum(["odoo", "entrenadores", "general"]),
  publico: z.string().min(1),
  problema: z.string().min(1),
  concepto: z.string().min(1),
  objetivo: z.string().min(1),
  duracion: z.string().min(1),
  tono: z.string().min(1),
});

const OutputSchema = z.object({
  hooks: z
    .array(
      z.object({
        tipo: z.enum([
          "problema",
          "curiosity_gap",
          "contrarian",
          "pregunta",
          "error_comun",
          "historia",
          "resultado",
          "directo",
        ]),
        texto: z.string().min(1),
      })
    )
    .length(5),
});

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());
    const knowledgeHits = findConceptsByTerms([body.concepto]);

    const system = `${buildCoreSystemPrompt()}

TAREA: generar 5 hooks (primeras 1-3 frases habladas) para un Reel/Short vertical de ${body.duracion}.
Elige 5 tipos DIFERENTES entre estos 8, los más adecuados al input: ${Object.entries(HOOK_TYPE_LABELS)
      .map(([k, v]) => `${k} (${v})`)
      .join(", ")}.
Cada hook debe poder decirse en voz alta en menos de 3 segundos y detener el scroll sin caer en clickbait vacío.

${buildJsonInstruction(`{"hooks": [{"tipo": "problema" | "curiosity_gap" | "contrarian" | "pregunta" | "error_comun" | "historia" | "resultado" | "directo", "texto": "string"}] (exactamente 5 elementos, tipos distintos)}`)}`;

    const user = `Servicio: ${SERVICIO_LABELS[body.servicio]}
Público objetivo: ${body.publico}
Problema que sufre ese público: ${body.problema}
Concepto principal a transmitir: ${body.concepto}
Objetivo del reel: ${body.objetivo}
Duración: ${body.duracion}
Tono: ${body.tono}
${knowledgeHits.length ? `\nConceptos de la base de conocimiento relacionados (úsalos como trasfondo, no los cites literalmente si no aporta):\n${knowledgeHits.map((k) => `- ${k.termino} (${k.categoria}): ${k.definicion}`).join("\n")}` : ""}`;

    const raw = await askForText({ system, user, maxTokens: 1400 });
    const parsed = OutputSchema.parse(extractJson(raw));
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
