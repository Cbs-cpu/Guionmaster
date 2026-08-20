// Renderiza una o varias frases de la variante "kinético" de glow
// (remotion/scenes/glow/kinetico.tsx) a su .mov con canal alfa — mismo
// patrón que render-subtitulos.mjs (proceso aparte, no import dentro de
// Next.js, ver la cabecera de ese archivo para el porqué).
//
//   node scripts/render-glow-kinetico.mjs --frases=<ruta.json>
//
// <ruta.json> es un array de:
//   { tokens: [{texto, clave?}], duracion, out, estilo? }
// `estilo` es "amarillo" (por defecto) o "rojo" — ver KINETICO_AMARILLO/
// KINETICO_ROJO en kinetico.tsx. El bundle se hace UNA vez y se reutiliza
// para todas las frases del lote, no una por cada una.
//
// Imprime una única línea de JSON en stdout con la lista de resultados.

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA_DIR = path.join(ROOT, "data", "media");

function parseArgs(argv) {
  const flags = {};
  for (const arg of argv) {
    const m = /^--([^=]+)=(.*)$/.exec(arg);
    if (m) flags[m[1]] = m[2];
  }
  return flags;
}

const flags = parseArgs(process.argv.slice(2));
if (!flags.frases) {
  console.error("Uso: node scripts/render-glow-kinetico.mjs --frases=<ruta.json>");
  process.exit(1);
}

const frases = JSON.parse(fs.readFileSync(flags.frases, "utf8"));
if (!frases?.length) {
  console.error("El archivo de frases está vacío.");
  process.exit(1);
}

const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "remotion", "index.ts"),
  publicDir: MEDIA_DIR,
  onProgress: () => {},
});

const resultados = [];

for (const frase of frases) {
  const estiloProp =
    frase.estilo === "rojo"
      ? { acento: "#FF5A45", acentoSuave: "rgba(255, 90, 69, 0.16)" }
      : { acento: "#FFC300", acentoSuave: "rgba(255, 195, 0, 0.16)" };

  const inputProps = { tokens: frase.tokens, duracion: frase.duracion, estilo: estiloProp, fondoPreview: false };

  const composition = await selectComposition({
    serveUrl,
    id: "glow-kinetico-frase",
    inputProps,
  });

  const overlayRel = `generated/glow-kinetico-${frase.out}.mov`;
  const overlayAbs = path.join(MEDIA_DIR, overlayRel);
  fs.mkdirSync(path.dirname(overlayAbs), { recursive: true });

  await renderMedia({
    composition,
    serveUrl,
    codec: "prores",
    proResProfile: "4444",
    pixelFormat: "yuva444p10le",
    imageFormat: "png",
    outputLocation: overlayAbs,
    inputProps,
    onProgress: () => {},
  });

  resultados.push({
    out: frase.out,
    filePath: overlayRel,
    duracionFrames: composition.durationInFrames,
  });
}

console.log(JSON.stringify({ ok: true, resultados }));
