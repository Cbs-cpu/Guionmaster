// Renderiza una composición de subtítulos ya resuelta en líneas (fotogramas,
// no segundos — eso ya lo hizo el agrupador en src/lib/subtitulos/agrupar.ts)
// a sus dos archivos reales: preview .mp4 (con fondo, para /recursos) y
// overlay .mov con canal alfa (ProRes 4444, para Premiere).
//
// Vive como script aparte y no como código importado dentro de una ruta de
// Next.js a propósito: @remotion/bundler arrastra esbuild, y el bundler de
// desarrollo de Next (Turbopack) se atraganta intentando tipar los archivos
// internos de los paquetes de plataforma de esbuild (@esbuild/win32-x64/
// README.md, por ejemplo) si algo los importa dentro del árbol de Next. Los
// demás renders del proyecto (render-contexto.mjs, render-animacion.mjs) ya
// evitan esto siendo procesos `node scripts/*.mjs` sueltos — este sigue la
// misma regla. src/app/api/ai/subtitulos/render/route.ts lo invoca con
// child_process, nunca con un import.
//
//   node scripts/render-subtitulos.mjs --lineas=<ruta.json> --estilo=<id> --out=<id>
//
// <ruta.json> es `{ lineas: [{inicio,duracion,tokens}], estiloId }` — el
// resultado ya en fotogramas del agrupador, no la transcripción cruda.
// Imprime una única línea de JSON en stdout al terminar, que es lo que lee
// la ruta de la API.

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
if (!flags.lineas || !flags.out) {
  console.error(
    "Uso: node scripts/render-subtitulos.mjs --lineas=<ruta.json> --estilo=<id> --out=<id>"
  );
  process.exit(1);
}

const entrada = JSON.parse(fs.readFileSync(flags.lineas, "utf8"));
const lineas = entrada.lineas;
const estiloId = flags.estilo || entrada.estiloId;
if (!lineas?.length) {
  console.error("El archivo de líneas está vacío.");
  process.exit(1);
}

const previewRel = `generated/subtitulos-render-${flags.out}-preview.mp4`;
const overlayRel = `generated/subtitulos-render-${flags.out}-overlay.mov`;
const previewAbs = path.join(MEDIA_DIR, previewRel);
const overlayAbs = path.join(MEDIA_DIR, overlayRel);
fs.mkdirSync(path.dirname(previewAbs), { recursive: true });

const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "remotion", "index.ts"),
  publicDir: MEDIA_DIR,
  onProgress: () => {},
});

const composition = await selectComposition({
  serveUrl,
  id: "subtitulos-transcripcion",
  inputProps: { lineas, estiloId, fondoPreview: true },
});

// Preview (.mp4) y overlay (.mov con alfa) son dos codificaciones
// independientes del mismo bundle/composición ya resueltos arriba — no hay
// ninguna dependencia entre ellas, así que corren en paralelo en vez de en
// serie. Cada una abre su propia instancia de Chromium por debajo
// (@remotion/renderer se encarga de eso), así que el coste no es 2x tiempo
// de CPU, es 2x tiempo en paralelo ≈ el tiempo de la más lenta de las dos.
await Promise.all([
  renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 18,
    outputLocation: previewAbs,
    inputProps: { lineas, estiloId, fondoPreview: true },
    onProgress: () => {},
  }),
  renderMedia({
    composition,
    serveUrl,
    codec: "prores",
    proResProfile: "4444",
    pixelFormat: "yuva444p10le",
    imageFormat: "png",
    outputLocation: overlayAbs,
    inputProps: { lineas, estiloId, fondoPreview: false },
    onProgress: () => {},
  }),
]);

// Única línea de salida, para que el proceso que invoca esto (la ruta de la
// API) no tenga que separar logs de progreso del resultado real.
console.log(
  JSON.stringify({
    ok: true,
    estiloId,
    lineas: lineas.length,
    duracionFrames: composition.durationInFrames,
    previewPath: previewRel,
    filePath: overlayRel,
  })
);
