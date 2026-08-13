// Marcas de edición del "modo guion".
//
// El texto hablado se escribe en plano, pero se puede anotar para grabar y
// montar sin tener que recordar nada: qué palabra se dice con fuerza, dónde
// entra un rótulo, dónde se corta. La sintaxis vive dentro del propio texto
// (así viaja con el guion, se exporta y se puede escribir a mano o pedírsela
// a la IA) y solo se "revela" en el modo guion.
//
//   *palabra*            → énfasis: subrayado, se dice con intención
//   **palabra**          → clave: la idea que no se puede perder
//   [pausa]              → marca sin contenido
//   [sub: Texto rótulo]  → marca con contenido

export type MarkKey = "sub" | "anim" | "corte" | "zoom" | "broll" | "grafico" | "pausa" | "nota";

export interface MarkDef {
  key: MarkKey;
  label: string;
  /** Qué escribir tras los dos puntos; vacío si la marca no lleva contenido. */
  placeholder: string;
  tone: "accent" | "blueprint" | "ink";
}

export const MARK_DEFS: Record<MarkKey, MarkDef> = {
  sub: { key: "sub", label: "Subtítulo", placeholder: "texto en pantalla", tone: "blueprint" },
  anim: { key: "anim", label: "Animación", placeholder: "qué se anima", tone: "accent" },
  corte: { key: "corte", label: "Corte", placeholder: "", tone: "ink" },
  zoom: { key: "zoom", label: "Zoom", placeholder: "", tone: "ink" },
  broll: { key: "broll", label: "B-roll", placeholder: "qué se ve", tone: "blueprint" },
  grafico: { key: "grafico", label: "Gráfico", placeholder: "qué se dibuja", tone: "blueprint" },
  pausa: { key: "pausa", label: "Pausa", placeholder: "", tone: "ink" },
  nota: { key: "nota", label: "Nota", placeholder: "recordatorio", tone: "ink" },
};

export const MARK_ORDER: MarkKey[] = ["sub", "anim", "broll", "grafico", "corte", "zoom", "pausa", "nota"];

const ALIASES: Record<string, MarkKey> = {
  sub: "sub",
  subtitulo: "sub",
  subtitulos: "sub",
  rotulo: "sub",
  texto: "sub",
  anim: "anim",
  animacion: "anim",
  animar: "anim",
  corte: "corte",
  cut: "corte",
  zoom: "zoom",
  broll: "broll",
  brroll: "broll",
  zoomin: "zoom",
  grafico: "grafico",
  grafica: "grafico",
  diagrama: "grafico",
  pausa: "pausa",
  silencio: "pausa",
  nota: "nota",
};

const ACCENTED = "áàäâãéèëêíìïîóòöôõúùüûñç";
const PLAIN = "aaaaaeeeeiiiiooooouuuunc";

function normalize(raw: string): string {
  let out = "";
  for (const ch of raw.toLowerCase()) {
    const i = ACCENTED.indexOf(ch);
    if (i >= 0) out += PLAIN[i];
    else if (!/[\s_-]/.test(ch)) out += ch;
  }
  return out;
}

export type MarkToken =
  | { kind: "texto"; text: string }
  | { kind: "enfasis"; text: string }
  | { kind: "clave"; text: string }
  | { kind: "marca"; def: MarkDef; text: string };

const TOKEN_RE = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|\[([^\]:\n]+?)(?::([^\]\n]*))?\]/g;

export function parseScriptMarks(input: string): MarkToken[] {
  const tokens: MarkToken[] = [];
  let cursor = 0;

  for (const match of input.matchAll(TOKEN_RE)) {
    const start = match.index ?? 0;
    const [full, clave, enfasis, marca, contenido] = match;

    // Un corchete que no corresponde a ninguna marca conocida se deja tal cual:
    // el usuario puede estar escribiendo entre corchetes por otro motivo.
    const def = marca ? MARK_DEFS[ALIASES[normalize(marca)]] : undefined;
    if (marca && !def) continue;

    if (start > cursor) tokens.push({ kind: "texto", text: input.slice(cursor, start) });

    if (clave) tokens.push({ kind: "clave", text: clave });
    else if (enfasis) tokens.push({ kind: "enfasis", text: enfasis });
    else if (def) tokens.push({ kind: "marca", def, text: (contenido ?? "").trim() });

    cursor = start + full.length;
  }

  if (cursor < input.length) tokens.push({ kind: "texto", text: input.slice(cursor) });
  return tokens;
}

/** El texto tal y como se dice a cámara, sin la sintaxis de marcas. */
export function stripScriptMarks(input: string): string {
  return parseScriptMarks(input)
    .map((t) => (t.kind === "marca" ? "" : t.text))
    .join("")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function markSnippet(def: MarkDef): string {
  return def.placeholder ? `[${def.key}: ${def.placeholder}]` : `[${def.key}]`;
}
