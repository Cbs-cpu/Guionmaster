// Renderiza una o varias frases de la variante "kinético" de glow
// (remotion/scenes/glow/kinetico.tsx) a un .mp4 A PANTALLA COMPLETA MUDO
// (fondo oscuro + resplandor de verdad, sin audio) — el sonido ya NO va
// horneado en el vídeo: se inserta como clips de audio sueltos en el
// timeline de Premiere (ver premiere/host/index.jsx, sccInsertarConSonidos,
// y el "sidecar" .sonidos.json que escribe este script).
//
//   node scripts/render-glow-kinetico.mjs --frases=<ruta.json>
//
// <ruta.json> es un array de: { tokens: [{texto, clave?}], out, estilo? }
// La duración YA NO se pasa a mano — se calcula sola a partir del número
// de letras (calcularDuracionYCues de abajo, que tiene que dar EXACTAMENTE
// el mismo resultado que calcularTiemposFrase en kinetico.tsx: misma
// matemática, duplicada aquí en JS plano porque este script no puede
// importar un .tsx sin arrastrar el bundler de Remotion para algo que es
// aritmética pura).
//
// Imprime una única línea de JSON en stdout con la lista de resultados,
// cada uno con `filePath` (el .mp4 mudo) y `sonidosPath` (el sidecar).

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA_DIR = path.join(ROOT, "data", "media");
const FPS = 30;

// Debe coincidir exactamente con remotion/scenes/glow/kinetico.tsx.
const ESCALONADO_LETRA = 4;
const ASENTAR_ULTIMA_LETRA = 20;
const HOLD_FRAMES = 34;
const SALIDA_FRAMES = 16;

function calcularDuracionYCues(tokens) {
  const totalLetras = tokens.reduce((acc, t) => acc + t.texto.length, 0);
  const duracion = Math.max(1, totalLetras - 1) * ESCALONADO_LETRA + ASENTAR_ULTIMA_LETRA + HOLD_FRAMES + SALIDA_FRAMES;

  const cues = [{ tipo: "whoosh-entrada", frameOffset: 0 }];
  let indiceLetraGlobal = 0;
  for (const tok of tokens) {
    for (let i = 0; i < tok.texto.length; i++) {
      if (tok.texto[i] !== " ") cues.push({ tipo: "tecla", frameOffset: indiceLetraGlobal * ESCALONADO_LETRA });
      indiceLetraGlobal++;
    }
  }
  cues.push({ tipo: "whoosh-salida", frameOffset: duracion - SALIDA_FRAMES });

  return { duracion, cues };
}

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

  const { duracion, cues } = calcularDuracionYCues(frase.tokens);
  const inputProps = { tokens: frase.tokens, duracion, estilo: estiloProp, fondoPreview: true };

  const composition = await selectComposition({
    serveUrl,
    id: "glow-kinetico-frase",
    inputProps,
  });

  const salidaRel = `generated/glow-kinetico-${frase.out}.mp4`;
  const salidaAbs = path.join(MEDIA_DIR, salidaRel);
  fs.mkdirSync(path.dirname(salidaAbs), { recursive: true });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 16,
    outputLocation: salidaAbs,
    inputProps,
    onProgress: () => {},
  });

  // Sidecar de sonidos: SEGUNDOS (no fotogramas) desde el arranque de ESTA
  // frase, más la ruta del SFX de cada tipo — así el panel solo tiene que
  // sumar el tiempoSeg de la ancla y mandarlo a insertar, sin repetir esta
  // aritmética en JavaScript de navegador.
  const rutaPorTipo = {
    tecla: "sfx/tecla.mp3",
    "whoosh-entrada": "sfx/whoosh-entrada.wav",
    "whoosh-salida": "sfx/whoosh-salida.mp3",
  };
  const sonidos = cues.map((c) => ({ sfxPath: rutaPorTipo[c.tipo], offsetSeg: c.frameOffset / FPS }));
  const sonidosRel = `generated/glow-kinetico-${frase.out}.sonidos.json`;
  fs.writeFileSync(path.join(MEDIA_DIR, sonidosRel), JSON.stringify(sonidos));

  resultados.push({
    out: frase.out,
    filePath: salidaRel,
    sonidosPath: sonidosRel,
    duracionFrames: duracion,
    duracionSeg: duracion / FPS,
  });
}

console.log(JSON.stringify({ ok: true, resultados }));
