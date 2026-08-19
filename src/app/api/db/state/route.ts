import { NextResponse } from "next/server";
import { hasAnyState, readState, writeState, STATE_KEYS, type StateKey } from "@/lib/db/client";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

// Rutas Node (no edge): better-sqlite3 es un módulo nativo.
export const runtime = "nodejs";

/** Preflight para el panel de Premiere, que pide desde otro origen. */
export async function OPTIONS() {
  return corsPreflight();
}

/** Todo el estado persistido de golpe, para hidratar el store al arrancar. */
export async function GET() {
  const state = readState();
  return NextResponse.json({ state, empty: !hasAnyState() }, { headers: CORS_HEADERS });
}

/**
 * Sobrescribe una o varias claves del estado. El body es un objeto parcial
 * `{ scripts?, knowledgeNotes?, customKnowledge?, sources?, seededScriptIds? }`;
 * solo se escriben las claves presentes.
 */
export async function PUT(req: Request) {
  const body = (await req.json()) as Record<string, unknown>;
  const patch: Partial<Record<StateKey, unknown>> = {};
  for (const key of STATE_KEYS) {
    if (key in body) patch[key] = body[key];
  }
  writeState(patch);
  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
