import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText, extractJson } from "@/lib/ai/client";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

// Dado el SRT/transcripción del vídeo YA GRABADO Y CORTADO (no el guion
// escrito), le pide a la IA que elija los momentos donde debería ir una
// animación, infografía o imagen de contexto — el mismo juicio que antes
// se aplicaba a mano con las marcas [[clave|frase]] del guion, pero ahora
// sobre lo que de verdad se dijo delante de la cámara, con sus tiempos
// reales. Esta ruta NO genera ningún recurso ni toca la base de datos — se
// limita a proponer; el guardado (VisualResource + AnclaTemporal) lo hace
// el que llama, después de que el usuario revise la propuesta.

export const runtime = "nodejs";

const SegmentoSchema = z.object({
  texto: z.string(),
  inicio: z.number(),
  fin: z.number(),
});

const InputSchema = z.object({
  segmentos: z.array(SegmentoSchema).min(1),
  /** Contexto libre: de qué trata el vídeo, para que la IA no elija a ciegas. */
  contexto: z.string().optional(),
  /** Cuántos anclajes proponer como máximo — no todas las frases necesitan un recurso encima. */
  maxAnclas: z.number().int().positive().max(40).optional(),
});

const TIPOS = ["animacion-contexto", "infografia", "imagen-contexto", "glow-kinetico"] as const;

interface AnclaPropuesta {
  tiempoSeg: number;
  palabra: string;
  tipo: (typeof TIPOS)[number];
  motivo: string;
}

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());
    const maxAnclas = body.maxAnclas ?? 12;

    const transcripcion = body.segmentos
      .map((s) => `[${s.inicio.toFixed(1)}s–${s.fin.toFixed(1)}s] ${s.texto}`)
      .join("\n");

    const system = [
      "Eres el editor de vídeo de System Content Studio. Recibes la transcripción",
      "cronometrada de un vídeo YA GRABADO (no un guion) y decides en qué frases",
      "concretas debería aparecer un recurso visual de apoyo — nunca en todas: solo",
      "donde de verdad ayuda a entender o retiene la atención (una cifra, un",
      "concepto abstracto, un giro, una idea que se repite y merece un rótulo).",
      "",
      "Tipos disponibles:",
      "- animacion-contexto: objeto fotográfico + texto, identidad Modula (blanco/amarillo).",
      "- infografia: datos, pasos o comparación — cuando se dice una cifra o una lista.",
      "- imagen-contexto: una sola imagen de apoyo, sin animación de texto.",
      "- glow-kinetico: frase corta en texto grande, para un titular o remate.",
      "",
      `Propón como máximo ${maxAnclas} anclas — menos si el vídeo no da para más, nunca inventes.`,
      "Responde solo JSON: un array de objetos {tiempoSeg, palabra, tipo, motivo}.",
      "`tiempoSeg` es el segundo exacto (dentro del rango del segmento) donde debe",
      "empezar el recurso. `palabra` es la frase corta (2-6 palabras) tal cual",
      "aparece en la transcripción, para poder localizarla. `motivo` es una frase,",
      "para que el usuario entienda por qué se sugiere sin tener que adivinar.",
    ].join("\n");

    const user = [
      body.contexto ? `Contexto del vídeo: ${body.contexto}\n` : "",
      "Transcripción:",
      transcripcion,
    ].join("\n");

    const raw = await askForText({ system, user, maxTokens: 2048, temperature: 0.4 });
    const propuestas = extractJson<AnclaPropuesta[]>(raw);

    if (!Array.isArray(propuestas)) {
      throw new Error("La IA no devolvió una lista de anclas.");
    }
    const limpias = propuestas
      .filter((p) => TIPOS.includes(p.tipo) && typeof p.tiempoSeg === "number" && p.palabra)
      .slice(0, maxAnclas);

    return NextResponse.json({ anclas: limpias }, { headers: CORS_HEADERS });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400, headers: CORS_HEADERS });
    }
    const message = error instanceof Error ? error.message : "Error inesperado proponiendo anclas.";
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}
