import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const idGen = customAlphabet(alphabet, 10);

export function makeId(prefix: string): string {
  return `${prefix}_${idGen()}`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateSpeakingSeconds(text: string): number {
  // ~150 palabras/minuto en habla natural.
  return Math.round((wordCount(text) / 150) * 60);
}

export function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}
