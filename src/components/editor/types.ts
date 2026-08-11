import type { ReelBeatKey } from "@/lib/types";

export type ActiveBlock =
  | { kind: "beat"; key: ReelBeatKey }
  | { kind: "meta" }
  | { kind: "chapter"; id: string };
