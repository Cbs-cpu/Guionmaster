import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText, extractJson } from "@/lib/ai/client";
import { buildCoreSystemPrompt, buildJsonInstruction } from "@/lib/ai/systemPrompt";
import { aiErrorResponse } from "@/lib/ai/respond";
import { REEL_BEAT_ORDER, REEL_BEAT_LABELS, SERVICIO_LABELS } from "@/lib/types";

const InputSchema = z.object({
  direction: z.enum(["reel_to_youtube", "youtube_to_reel"]),
  servicio: z.enum(["odoo", "entrenadores", "general"]),
  sourceTitle: z.string().min(1),
  sourceText: z.string().min(1),
});

const ReelBeatSchema = z.object({
  key: z.enum(REEL_BEAT_ORDER as [string, ...string[]]),
  textoHablado: z.string().min(1),
  tiempoAprox: z.string().min(1),
  visualSugerido: z.string().min(1),
  textoPantalla: z.string().min(1),
});

const ReelToYoutubeOutput = z.object({
  titulo: z.string().min(1),
  hook: z.string().min(1),
  promesa: z.string().min(1),
  chapters: z
    .array(
      z.object({
        titulo: z.string().min(1),
        resumen: z.string().min(1),
        guion: z.string().min(1),
        visual: z.object({
          queMostrar: z.string().min(1),
          queExplicar: z.string().min(1),
          bRoll: z.string().min(1),
          capturas: z.string().min(1),
          diagramas: z.string().min(1),
        }),
      })
    )
    .min(2),
});

const YoutubeToReelOutput = z.object({
  hookTipo: z.string().min(1),
  beats: z.array(ReelBeatSchema).length(REEL_BEAT_ORDER.length),
});

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    if (body.direction === "reel_to_youtube") {
      const system = `${buildCoreSystemPrompt()}

TAREA: expandir un guion de Reel/Short corto en un guion de vídeo largo de YouTube (5-30 min) sobre el mismo concepto, desarrollando en profundidad lo que en el reel solo se insinúa. Mantén la misma idea central y el mismo servicio, pero añade contexto, pasos intermedios, matices y ejemplos que en el formato corto no cabían.

${buildJsonInstruction(`{"titulo": "string", "hook": "string", "promesa": "string", "chapters": [{"titulo": "string", "resumen": "string", "guion": "string", "visual": {"queMostrar": "string", "queExplicar": "string", "bRoll": "string", "capturas": "string", "diagramas": "string"}}] (entre 3 y 6 capítulos)}`)}`;

      const user = `Servicio: ${SERVICIO_LABELS[body.servicio]}\nTítulo/idea original del reel: ${body.sourceTitle}\n\nGuion original del reel:\n"""\n${body.sourceText}\n"""`;

      const raw = await askForText({ system, user, maxTokens: 6000 });
      const parsed = ReelToYoutubeOutput.parse(extractJson(raw));
      return NextResponse.json(parsed);
    } else {
      const system = `${buildCoreSystemPrompt()}

TAREA: condensar un guion de vídeo largo de YouTube en un Reel/Short vertical de 30-90 segundos, conservando la idea más fuerte y accionable del vídeo original. Sigue esta estructura exacta, en este orden: ${REEL_BEAT_ORDER.map((k) => REEL_BEAT_LABELS[k]).join(" → ")}.

${buildJsonInstruction(`{"hookTipo": "problema"|"curiosity_gap"|"contrarian"|"pregunta"|"error_comun"|"historia"|"resultado"|"directo", "beats": [{"key": "hook"|"problema"|"consecuencia"|"insight"|"sistema"|"beneficio"|"cta", "textoHablado": "string", "tiempoAprox": "string", "visualSugerido": "string", "textoPantalla": "string"}] (exactamente 7 elementos, en el orden indicado)}`)}`;

      const user = `Servicio: ${SERVICIO_LABELS[body.servicio]}\nTítulo/tema original del vídeo: ${body.sourceTitle}\n\nGuion original (o resumen) del vídeo largo:\n"""\n${body.sourceText}\n"""`;

      const raw = await askForText({ system, user, maxTokens: 2800 });
      const parsed = YoutubeToReelOutput.parse(extractJson(raw));
      return NextResponse.json(parsed);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
