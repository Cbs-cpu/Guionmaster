import { NextResponse } from "next/server";
import { z } from "zod";
import { askForText, extractJson } from "@/lib/ai/client";
import { buildCoreSystemPrompt, buildJsonInstruction } from "@/lib/ai/systemPrompt";
import { aiErrorResponse } from "@/lib/ai/respond";
import { CANVAS_NODE_LABELS } from "@/lib/types";

const InputSchema = z.object({
  topic: z.string().min(1),
});

const NODE_TYPES = Object.keys(CANVAS_NODE_LABELS) as [string, ...string[]];

const OutputSchema = z.object({
  nodes: z
    .array(z.object({ ref: z.string().min(1), type: z.enum(NODE_TYPES), label: z.string().min(1) }))
    .min(2)
    .max(12),
  edges: z.array(z.object({ from: z.string().min(1), to: z.string().min(1), label: z.string().optional() })),
});

export async function POST(req: Request) {
  try {
    const body = InputSchema.parse(await req.json());

    const system = `${buildCoreSystemPrompt()}

TAREA: proponer un diagrama de sistema (whiteboard) que ayude a explicar visualmente el tema dado, como el ejemplo del spec: LEAD → CRM → VENTA → ODOO → FACTURACIÓN → CLIENTE.
Usa nodos de estos tipos: ${Object.entries(CANVAS_NODE_LABELS).map(([k, v]) => `${k} (${v})`).join(", ")}.
Piensa en términos de sistema: inputs, procesos, personas, herramientas, cuellos de botella y outputs. Entre 4 y 9 nodos, con flechas (edges) que muestren el flujo entre ellos. Cada nodo tiene un "ref" corto en minúsculas sin espacios (ej: "lead", "crm", "cuello_facturacion") que se usa para conectar los edges.

${buildJsonInstruction(`{"nodes": [{"ref": "string", "type": "${NODE_TYPES.join('"|"')}", "label": "string"}], "edges": [{"from": "ref", "to": "ref", "label": "string opcional"}]}`)}`;

    const user = `Tema / concepto a representar: ${body.topic}`;

    const raw = await askForText({ system, user, maxTokens: 1600 });
    const parsed = OutputSchema.parse(extractJson(raw));
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida.", details: error.issues }, { status: 400 });
    }
    return aiErrorResponse(error);
  }
}
