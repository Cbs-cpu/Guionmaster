import { NextResponse } from "next/server";
import { AiConfigError } from "./client";

export function aiErrorResponse(error: unknown): NextResponse {
  if (error instanceof AiConfigError) {
    return NextResponse.json({ error: error.message, code: "missing_api_key" }, { status: 412 });
  }
  const message = error instanceof Error ? error.message : "Error inesperado generando contenido.";
  console.error("[ai]", error);
  return NextResponse.json({ error: message, code: "generation_failed" }, { status: 502 });
}
