import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText } from "@/lib/ai/client";
import { buildCoreSystemPrompt } from "@/lib/ai/systemPrompt";
import { aiErrorResponse } from "@/lib/ai/respond";
import { EDITOR_COMMAND_LABELS, EDITOR_COMMAND_ORDER } from "@/lib/types";

const InputSchema = z.object({
  command: z.enum(EDITOR_COMMAND_ORDER as [string, ...string[]]),
  text: z.string().min(1),
  context: z.string().optional(),
});

const COMMAND_INSTRUCTIONS: Record<string, string> = {
  mejorar: "Mejora este fragmento en general: claridad, ritmo, naturalidad y fuerza de la idea. No cambies el mensaje de fondo.",
  mas_natural: "Reescríbelo para que suene exactamente a como lo diría una persona real hablando a cámara, sin ninguna rigidez de guion leído.",
  mas_directo: "Hazlo más directo y concreto: frases más cortas, menos rodeos, ve al grano antes.",
  mas_polemico: "Dale un ángulo más contrarian/polémico, cuestionando una creencia común del sector, sin caer en falacias ni en afirmaciones sin fundamento.",
  mejorar_hook: "Trátalo como un hook: haz que las primeras palabras generen tensión, curiosidad o identificación inmediata.",
  mejorar_cta: "Trátalo como una llamada a la acción: hazla clara, específica y sin desesperación ni lenguaje de venta agresivo.",
  acortar: "Acórtalo manteniendo la idea central intacta. Elimina todo lo prescindible.",
  expandir: "Expándelo añadiendo matices, un ejemplo o un paso intermedio que lo haga más completo, sin perder ritmo.",
  cambiar_angulo: "Mantén el tema pero cámbialo de ángulo: aborda el mismo concepto desde una perspectiva distinta (por ejemplo, desde la consecuencia en vez de la causa, o desde una historia en vez de una afirmación).",
  anadir_storytelling: "Añade un elemento narrativo (una situación, una escena, un antes/después) que haga el fragmento más humano.",
  anadir_ejemplo: "Añade un ejemplo concreto y genérico (sin inventar datos reales) que ilustre la idea.",
  crear_analogia: "Sustituye o acompaña la explicación con una analogía sencilla que haga el concepto instantáneamente entendible.",
};

const OutputSchema = z.object({ text: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    const system = `${buildCoreSystemPrompt()}

TAREA: aplicar el siguiente comando de edición a un fragmento de guion: "${EDITOR_COMMAND_LABELS[body.command as keyof typeof EDITOR_COMMAND_LABELS]}".
${COMMAND_INSTRUCTIONS[body.command]}

Responde ÚNICAMENTE con el texto reescrito, sin comillas, sin explicaciones, sin JSON, sin markdown. Solo el texto final listo para usar en el guion.`;

    const user = `${body.context ? `Contexto: ${body.context}\n\n` : ""}Fragmento a editar:\n"""\n${body.text}\n"""`;

    const raw = await askForText({ system, user, maxTokens: 1800, temperature: 0.85 });
    const parsed = OutputSchema.parse({ text: raw.trim().replace(/^"|"$/g, "") });
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
