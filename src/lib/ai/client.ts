import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiConfigError(
      "Falta ANTHROPIC_API_KEY. Añádela a tu archivo .env.local (ver .env.example) para activar la generación con IA."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

export class AiConfigError extends Error {}

export async function askForText(params: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    temperature: params.temperature ?? 0.9,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("La IA no devolvió texto.");
  }
  return block.text;
}

export function extractJson<T>(raw: string): T {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }
  const firstBrace = text.search(/[[{]/);
  const lastBrace = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (firstBrace >= 0 && lastBrace >= 0) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("No se pudo interpretar la respuesta de la IA como JSON.");
  }
}
