import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText, extractJson } from "@/lib/ai/client";
import { buildCoreSystemPrompt, buildJsonInstruction } from "@/lib/ai/systemPrompt";
import { aiErrorResponse } from "@/lib/ai/respond";
import { findConceptsByTerms } from "@/lib/knowledge-base";
import { CAROUSEL_SEQUENCE_LABELS, SERVICIO_LABELS } from "@/lib/types";

const InputSchema = z.object({
  servicio: z.enum(["odoo", "entrenadores", "general"]),
  publico: z.string().min(1),
  problema: z.string().min(1),
  concepto: z.string().min(1),
  objetivo: z.string().min(1),
  secuencia: z.enum(["estandar", "listicle", "tutorial", "comparacion"]),
  numSlides: z.number().int().min(4).max(10),
  tono: z.string().min(1),
});

const SlideSchema = z.object({
  kind: z.enum(["portada", "problema", "solucion", "claves", "detalle", "pasos", "item", "cta"]),
  etiqueta: z.string(),
  titular: z.string().min(1),
  cuerpo: z.string(),
  puntos: z.array(z.string()).default([]),
  notaVisual: z.string(),
});

const OutputSchema = z.object({
  titulo: z.string().min(1),
  caption: z.string().min(1),
  slides: z.array(SlideSchema).min(4),
});

const SEQUENCE_GUIDES: Record<z.infer<typeof InputSchema>["secuencia"], string> = {
  estandar:
    "portada (gancho) → problema → solucion → claves → pasos → cta. Adapta el número de slides intermedios al total pedido.",
  listicle:
    "portada (gancho con el número) → un slide 'item' por cada punto de la lista → cta. Cada item con su propio titular corto.",
  tutorial: "portada (gancho) → problema (por qué importa) → varios 'pasos' → detalle (resultado esperado) → cta.",
  comparacion:
    "portada (qué se compara) → detalle (opción A) → detalle (opción B) → claves (veredicto) → cta.",
};

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());
    const knowledgeHits = findConceptsByTerms([body.concepto]);

    const system = `${buildCoreSystemPrompt()}

TAREA: escribir un carrusel de Instagram de exactamente ${body.numSlides} slides, formato ${CAROUSEL_SEQUENCE_LABELS[body.secuencia]}.

ESTRUCTURA
${SEQUENCE_GUIDES[body.secuencia]}
El primer slide es siempre "portada" y el último siempre "cta".

REGLAS DEL PRIMER SLIDE (es lo único que decide si alguien deja de hacer scroll)
- Formatos que funcionan: afirmación incómoda ("Automatizar un proceso roto solo hace el caos más rápido"), número + beneficio, pregunta que duele, resultado concreto, inversión de expectativa.
- NUNCA empieces por el nombre de la marca ni por una presentación.
- El gancho promete algo que los slides siguientes tienen que cumplir de verdad.

REGLAS DE ESCRITURA PARA CADA SLIDE
- Un slide = una idea. Si necesitas dos frases para explicarla, es que son dos slides.
- titular: 4-12 palabras, la idea del slide. Es lo que se lee de un vistazo.
- cuerpo: 0-30 palabras que rematan el titular. Puede ir vacío ("") si el titular se basta.
- puntos: entre 0 y 4 frases muy cortas (máximo 12 palabras cada una). Úsalos cuando el slide enumere señales, pasos o características; deja el array vacío si no aporta.
- etiqueta: 1-3 palabras en mayúsculas que sitúan el slide ("EL PROBLEMA", "PASO 2", "SEÑAL 3"). Puede ir vacía en la portada si el titular ya es suficientemente fuerte.
- notaVisual: qué imagen, captura o diagrama acompañaría al slide. Es una nota de producción, no se imprime en la imagen.
- El slide "cta" cierra pidiendo una sola acción concreta y coherente con lo enseñado (guardar, comentar una palabra, escribir por privado). Nada de "contáctanos para más información".

También escribe el "caption": el pie de publicación, 2-4 frases, que amplía el carrusel en vez de repetirlo, y termina con la misma llamada a la acción del último slide. Sin hashtags.

${buildJsonInstruction(`{"titulo": "string (título interno del carrusel para la biblioteca)", "caption": "string", "slides": [{"kind": "portada"|"problema"|"solucion"|"claves"|"detalle"|"pasos"|"item"|"cta", "etiqueta": "string", "titular": "string", "cuerpo": "string", "puntos": ["string"], "notaVisual": "string"}] (exactamente ${body.numSlides} elementos)}`)}`;

    const user = `Servicio: ${SERVICIO_LABELS[body.servicio]}
Público objetivo: ${body.publico}
Problema: ${body.problema}
Concepto principal: ${body.concepto}
Objetivo del carrusel: ${body.objetivo}
Número de slides: ${body.numSlides}
Tono: ${body.tono}
${knowledgeHits.length ? `\nConceptos de la base de conocimiento relacionados:\n${knowledgeHits.map((k) => `- ${k.termino} (${k.categoria}): ${k.definicion}`).join("\n")}` : ""}`;

    const raw = await askForText({ system, user, maxTokens: 3200 });
    const parsed = OutputSchema.parse(extractJson(raw));

    // El ritmo visual (claro → oscuro → claro… y cierre sobre degradado) no se
    // le pide al modelo: se impone aquí para que ningún carrusel salga plano.
    const slides = parsed.slides.map((slide, i) => ({
      ...slide,
      fondo:
        i === parsed.slides.length - 1
          ? ("degradado" as const)
          : i % 2 === 0
          ? ("claro" as const)
          : ("oscuro" as const),
    }));

    return NextResponse.json({ ...parsed, slides });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
