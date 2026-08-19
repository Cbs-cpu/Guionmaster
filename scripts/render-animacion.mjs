// Renderiza una animación de contexto (carpeta `remotion/`) y la deja
// enganchada al guion en un solo paso.
//
// El "en un solo paso" es a propósito: la regla del proyecto es que nada
// generado se quede suelto en data/media sin estar anclado a un guion, así
// que renderizar y registrar el VisualResource es la misma operación y no
// dos que se puedan olvidar por la mitad.
//
//   node scripts/render-animacion.mjs <composicion> --script=<id> [--chapter=<id>] [--notes="..."]
//
// El id del recurso se deriva del nombre de la composición, así que volver a
// lanzarlo sobre la misma composición reemplaza el vídeo y su registro en
// vez de acumular duplicados.

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import Database from "better-sqlite3";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA_DIR = path.join(ROOT, "data", "media");
const DB_PATH = path.join(ROOT, "data", "studio.db");

function parseArgs(argv) {
  const [composicion, ...rest] = argv;
  if (!composicion || composicion.startsWith("--")) {
    console.error(
      "Uso: node scripts/render-animacion.mjs <composicion> --script=<id> [--chapter=<id>] [--notes=...]"
    );
    process.exit(1);
  }
  const flags = {};
  for (const arg of rest) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) flags[match[1]] = match[2];
  }
  return { composicion, flags };
}

const { composicion, flags } = parseArgs(process.argv.slice(2));
if (!flags.script) {
  console.error("Falta --script=<id del guion al que se engancha la animación>.");
  process.exit(1);
}

const relPath = `generated/anim_${composicion}.mp4`;
const outputLocation = path.join(MEDIA_DIR, relPath);
fs.mkdirSync(path.dirname(outputLocation), { recursive: true });

console.log(`▸ Empaquetando remotion/ …`);
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "remotion", "index.ts"),
  // Las imágenes generadas con Kie.ai viven en data/media, no en public/,
  // así que `staticFile()` tiene que resolver desde ahí.
  publicDir: MEDIA_DIR,
  onProgress: () => {},
});

console.log(`▸ Resolviendo composición "${composicion}" …`);
const composition = await selectComposition({ serveUrl, id: composicion });

console.log(
  `▸ Renderizando ${composition.width}x${composition.height}, ${composition.durationInFrames} fotogramas …`
);
let ultimoPorcentaje = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  crf: 18,
  outputLocation,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct >= ultimoPorcentaje + 10) {
      ultimoPorcentaje = pct;
      process.stdout.write(`  ${pct}%\n`);
    }
  },
});

const duracionSeg = composition.durationInFrames / composition.fps;
console.log(`✓ ${relPath} (${duracionSeg.toFixed(1)}s)`);

// ── Registro en el guion ────────────────────────────────────────────────
const db = new Database(DB_PATH);
const row = db.prepare("SELECT value FROM store_kv WHERE key = 'scripts'").get();
if (!row) {
  console.error("No hay guiones guardados en data/studio.db.");
  process.exit(1);
}

const scripts = JSON.parse(row.value);
const script = scripts.find((s) => s.id === flags.script);
if (!script) {
  console.error(`No existe ningún guion con id ${flags.script}.`);
  process.exit(1);
}
if (flags.chapter && !script.chapters?.some((c) => c.id === flags.chapter)) {
  console.error(`El guion ${flags.script} no tiene ningún capítulo ${flags.chapter}.`);
  process.exit(1);
}

const visualId = `visual_anim_${composicion}`;
const visual = {
  id: visualId,
  kind: "animacion",
  prompt: flags.notes || `Animación de contexto — ${composicion}`,
  model: "remotion",
  filePath: relPath,
  ...(flags.chapter ? { chapterId: flags.chapter } : {}),
  notes: `${composition.width}x${composition.height} · ${duracionSeg.toFixed(1)}s · sin audio`,
  createdAt: new Date().toISOString(),
};

const visuals = script.visuals ?? [];
const yaEstaba = visuals.findIndex((v) => v.id === visualId);
if (yaEstaba >= 0) {
  // Se conserva la fecha original para no reordenar la galería al re-renderizar.
  visual.createdAt = visuals[yaEstaba].createdAt;
  visuals[yaEstaba] = visual;
} else {
  visuals.push(visual);
}
script.visuals = visuals;
script.updatedAt = new Date().toISOString();

db.prepare(
  "INSERT INTO store_kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
).run("scripts", JSON.stringify(scripts), new Date().toISOString());
db.close();

console.log(
  `✓ Enganchada a "${script.title}"${flags.chapter ? ` (capítulo ${flags.chapter})` : ""} como ${visualId}`
);
console.log("  Si tienes la app abierta, refresca para verla.");
