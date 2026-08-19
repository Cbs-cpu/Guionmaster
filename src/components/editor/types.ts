import type { ReelBeatKey } from "@/lib/types";

export type ActiveBlock =
  | { kind: "beat"; key: ReelBeatKey }
  | { kind: "meta" }
  | { kind: "chapter"; id: string }
  | { kind: "slide"; id: string };

/** Cómo se está mirando el guion: editándolo, leyéndolo, preparándolo para
 * grabar, o repasando los guiones de tablero de sus capítulos. */
export type ViewMode = "edicion" | "lectura" | "guion" | "tableros";
