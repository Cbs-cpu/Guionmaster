import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText, extractJson } from "@/lib/ai/client";
import { buildCoreSystemPrompt, buildJsonInstruction } from "@/lib/ai/systemPrompt";
import { aiErrorResponse } from "@/lib/ai/respond";
import { findConceptsByTerms } from "@/lib/knowledge-base";
import { REEL_BEAT_ORDER, REEL_BEAT_LABELS, SERVICIO_LABELS } from "@/lib/types";

const InputSchema = z.object({
  servicio: z.enum(["odoo", "entrenadores", "general"]),
  publico: z.string().min(1),
  problema: z.string().min(1),
  concepto: z.string().min(1),
  objetivo: z.string().min(1),
  duracion: z.string().min(1),
  tono: z.string().min(1),
  hookTexto: z.string().min(1),
  hookTipo: z.string().min(1),
});

const BeatSchema = z.object({
  key: z.enum(REEL_BEAT_ORDER as [string, ...string[]]),
  textoHablado: z.string().min(1),
  tiempoAprox: z.string().min(1),
  visualSugerido: z.string().min(1),
  textoPantalla: z.string().min(1),
});

const OutputSchema = z.object({ beats: z.array(BeatSchema).length(REEL_BEAT_ORDER.length) });

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());
    const knowledgeHits = findConceptsByTerms([body.concepto]);

    const system = `${buildCoreSystemPrompt()}

TAREA: desarrollar el guion completo de un Reel/Short de ${body.duracion} a partir de un hook ya elegido, siguiendo EXACTAMENTE esta estructura en este orden:
${REEL_BEAT_ORDER.map((k, i) => `${i + 1}. ${REEL_BEAT_LABELS[k]}`).join("\n")}

Para el beat "hook" reutiliza y pule ligeramente (si hace falta) el texto de hook ya seleccionado — no cambies su idea.
Reparte el tiempo total (${body.duracion}) de forma realista entre los 7 beats.
Para cada beat entrega:
- textoHablado: lo que se dice a cámara, natural, sin lenguaje corporativo (ver reglas).
- tiempoAprox: por ejemplo "0-3s" o "~5s".
- visualSugerido: qué se ve en pantalla (plano, acción, gráfico, captura, cara a cámara, b-roll...).
- textoPantalla: el texto superpuesto en pantalla (corto, tipo subtítulo/rótulo), o "" si no aplica.

${buildJsonInstruction(`{"beats": [{"key": "hook"|"problema"|"consecuencia"|"insight"|"sistema"|"beneficio"|"cta", "textoHablado": "string", "tiempoAprox": "string", "visualSugerido": "string", "textoPantalla": "string"}] (exactamente 7 elementos, en el orden indicado)}`)}`;

    const user = `Servicio: ${SERVICIO_LABELS[body.servicio]}
Público objetivo: ${body.publico}
Problema: ${body.problema}
Concepto principal: ${body.concepto}
Objetivo del reel: ${body.objetivo}
Duración total: ${body.duracion}
Tono: ${body.tono}
Hook elegido (tipo ${body.hookTipo}): "${body.hookTexto}"
${knowledgeHits.length ? `\nConceptos de la base de conocimiento relacionados:\n${knowledgeHits.map((k) => `- ${k.termino} (${k.categoria}): ${k.definicion}`).join("\n")}` : ""}`;

    const raw = await askForText({ system, user, maxTokens: 2800 });
    const parsed = OutputSchema.parse(extractJson(raw));
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
