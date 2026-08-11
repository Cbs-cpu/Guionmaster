import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText, extractJson } from "@/lib/ai/client";
import { buildCoreSystemPrompt, buildJsonInstruction } from "@/lib/ai/systemPrompt";
import { aiErrorResponse } from "@/lib/ai/respond";
import { findConceptsByTerms } from "@/lib/knowledge-base";
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
  tituloElegido: z.string().min(1),
});

const ChapterSchema = z.object({
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
});

const OutputSchema = z.object({
  hook: z.string().min(1),
  promesa: z.string().min(1),
  chapters: z.array(ChapterSchema).min(2).max(10),
});

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());
    const knowledgeHits = findConceptsByTerms(body.conceptos.split(",").map((c) => c.trim()));

    const system = `${buildCoreSystemPrompt()}

TAREA: escribir el guion completo de un vídeo de YouTube (${body.duracion}, tipo "${YOUTUBE_TYPE_LABELS[body.tipo]}") con este título ya elegido: "${body.tituloElegido}".

Entrega:
1. hook: apertura del vídeo (primeros ~15-20 segundos), que engancha sin prometer de más.
2. promesa: una frase que dice explícitamente qué va a aprender o conseguir el espectador si se queda.
3. chapters: divide el vídeo en el número de capítulos que tenga sentido para la duración (normalmente entre 3 y 7). Cada capítulo incluye:
   - titulo: título corto del capítulo (aparecerá como marcador de capítulo en YouTube).
   - resumen: 1-2 frases de qué trata.
   - guion: el desarrollo hablado completo de ese capítulo, con la profundidad adecuada a la duración total del vídeo. Sigue la regla de enseñar primero y mostrar la tecnología (si aplica) solo al final, apoyándote en el método OBSERVAR→MAPEAR→ENTENDER→DIAGNOSTICAR→DISEÑAR→IMPLEMENTAR→MEDIR→OPTIMIZAR cuando sea relevante.
   - visual: para ese capítulo, describe qué mostrar en pantalla (queMostrar), qué se está explicando mientras tanto (queExplicar), sugerencias de b-roll, de capturas de pantalla (de Odoo u otra herramienta si aplica) y de diagramas o canvas de sistema que ayudarían a visualizarlo.

No inventes estadísticas ni casos reales con datos concretos; usa ejemplos genéricos ("imagina una empresa que...").

${buildJsonInstruction(`{"hook": "string", "promesa": "string", "chapters": [{"titulo": "string", "resumen": "string", "guion": "string", "visual": {"queMostrar": "string", "queExplicar": "string", "bRoll": "string", "capturas": "string", "diagramas": "string"}}]}`)}`;

    const user = `Tema: ${body.tema}
Público objetivo: ${body.publico}
Objetivo del vídeo: ${body.objetivo}
Conceptos a tratar: ${body.conceptos}
Duración objetivo: ${body.duracion}
Tipo de vídeo: ${YOUTUBE_TYPE_LABELS[body.tipo]}
Título elegido: ${body.tituloElegido}
${knowledgeHits.length ? `\nConceptos de la base de conocimiento relacionados (usa esta interpretación, no inventes otra definición):\n${knowledgeHits.map((k) => `- ${k.termino} (${k.categoria}): ${k.definicion}`).join("\n")}` : ""}`;

    const raw = await askForText({ system, user, maxTokens: 8000 });
    const parsed = OutputSchema.parse(extractJson(raw));
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
