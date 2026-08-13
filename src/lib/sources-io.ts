import type { ContentSource, SourcePlatform } from "./types";
import { makeId } from "./utils";

export class SourceImportError extends Error {}

const PLATFORMS: SourcePlatform[] = ["reel", "youtube", "instagram"];

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(asString).filter(Boolean);
  const single = asString(value);
  return single ? single.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function asPlatform(value: unknown): SourcePlatform {
  const raw = asString(value).toLowerCase();
  if (PLATFORMS.includes(raw as SourcePlatform)) return raw as SourcePlatform;
  if (raw.includes("you") || raw.includes("yt")) return "youtube";
  if (raw.includes("reel") || raw.includes("short") || raw.includes("tiktok")) return "reel";
  return "instagram";
}

/**
 * Acepta `{"fuentes": [...]}`, `{"sources": [...]}` o un array pelado, y tolera
 * campos ausentes: el archivo puede venir de sitios muy distintos y lo único
 * innegociable es que cada entrada tenga título y transcripción.
 */
export function parseImportedSources(raw: string): ContentSource[] {
  let data: unknown;
  try {
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    data = JSON.parse((fence ? fence[1] : raw).trim());
  } catch {
    throw new SourceImportError("Eso no es JSON válido. Revisa que no falte una llave o una coma.");
  }

  const list = Array.isArray(data)
    ? data
    : ((data as Record<string, unknown>)?.fuentes ?? (data as Record<string, unknown>)?.sources);

  if (!Array.isArray(list)) {
    throw new SourceImportError('No encuentro la lista de fuentes. Espero {"fuentes": [...]} o un array.');
  }

  const now = new Date().toISOString();
  const sources: ContentSource[] = [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const titulo = asString(row.titulo) || asString(row.title);
    const transcripcion = asString(row.transcripcion) || asString(row.transcript);
    if (!titulo || !transcripcion) continue;

    sources.push({
      id: asString(row.id) || makeId("source"),
      plataforma: asPlatform(row.plataforma ?? row.platform),
      titulo,
      autor: asString(row.autor) || asString(row.author) || undefined,
      url: asString(row.url) || undefined,
      publicadoEn: asString(row.publicadoEn) || asString(row.published_at) || undefined,
      duracion: asString(row.duracion) || asString(row.duration) || undefined,
      transcripcion,
      resumen: asString(row.resumen) || asString(row.summary) || undefined,
      temas: asStringArray(row.temas ?? row.topics ?? row.tags),
      notas: asString(row.notas) || undefined,
      anadidoEn: now,
    });
  }

  if (sources.length === 0) {
    throw new SourceImportError("No he encontrado ninguna entrada con título y transcripción.");
  }
  return sources;
}
