// Renderiza las 16 animaciones de contexto y las engancha al guion, en una
// sola pasada.
//
//   node scripts/render-contexto.mjs [--solo=clave,clave] [--forzar]
//
// Se empaqueta remotion/ UNA vez y se reutiliza el bundle para las 16: hacerlo
// con `render-animacion.mjs` en bucle volvería a empaquetar cada vez, que es
// con diferencia la parte más lenta del proceso.
//
// Antes de renderizar nada comprueba que existan todas las imágenes que las
// escenas necesitan, y se planta si falta alguna. Es a propósito: una escena a
// la que le falta una capa renderiza igual, pero con un recuadro rojo de
// "falta X" incrustado en el MP4, y eso es peor que no tener el archivo —
// parece terminado y no lo está. Con --forzar se salta la comprobación.
//
// Al final retira las seis animaciones de estilo Vox del guion: la decisión de
// sustituirlas se aplica después de registrar las nuevas, nunca antes, para
// que el guion no se quede ni un momento sin material.

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import Database from "better-sqlite3";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA_DIR = path.join(ROOT, "data", "media");
const DB_PATH = path.join(ROOT, "data", "studio.db");
const ANCLAS = path.join(ROOT, "remotion", "scenes", "contexto", "anclas.json");
const MANIFIESTO = path.join(ROOT, "remotion", "scenes", "contexto", "capas.generadas.json");

/** Ids de las composiciones Vox que se sustituyen. */
const VOX = [
  "parches-tachados",
  "sistema-partes",
  "bucle-ventas",
  "silos-restriccion",
  "ciclo-ocho-pasos",
  "cuatro-preguntas",
];

const args = process.argv.slice(2);
const forzar = args.includes("--forzar");
const soloArg = args.find((a) => a.startsWith("--solo="));
const solo = soloArg ? soloArg.slice("--solo=".length).split(",").filter(Boolean) : null;

const { guion: guionId, puntos } = JSON.parse(fs.readFileSync(ANCLAS, "utf8"));
const disponibles = new Set(Object.keys(JSON.parse(fs.readFileSync(MANIFIESTO, "utf8"))));

const claves = solo ?? Object.keys(puntos);
const desconocidas = claves.filter((c) => !puntos[c]);
if (desconocidas.length) {
  console.error(`No existen en anclas.json: ${desconocidas.join(", ")}`);
  process.exit(1);
}

// ── Comprobación previa de capas ────────────────────────────────────────
// Se leen del propio bundle más abajo; aquí basta con mirar el manifiesto
// contra las claves que las escenas declaran, extraídas del fuente.
const fuenteEscenas = fs.readFileSync(
  path.join(ROOT, "remotion", "scenes", "contexto", "guion.tsx"),
  "utf8"
);
const usadas = [...fuenteEscenas.matchAll(/capa: "([^"]+)"/g)].map((m) => m[1]);
const faltan = [...new Set(usadas)].filter((c) => !disponibles.has(c)).sort();

if (faltan.length && !forzar) {
  console.error(`⛔ Faltan ${faltan.length} imágenes de las ${new Set(usadas).size} que usan las escenas:`);
  console.error(`   ${faltan.join(", ")}`);
  console.error("\n   Genéralas antes de renderizar:");
  console.error("     node scripts/gen-capas-contexto.mjs");
  console.error("\n   (o --forzar para renderizar igualmente, con huecos marcados en rojo)");
  process.exit(1);
}

console.log("▸ Empaquetando remotion/ …");
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "remotion", "index.ts"),
  publicDir: MEDIA_DIR,
  onProgress: () => {},
});

const registrados = [];

for (const clave of claves) {
  const relPath = `generated/anim_${clave}.mp4`;
  const outputLocation = path.join(MEDIA_DIR, relPath);
  fs.mkdirSync(path.dirname(outputLocation), { recursive: true });

  const composition = await selectComposition({ serveUrl, id: clave });
  process.stdout.write(`  ${clave.padEnd(28)} `);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf: 18,
    outputLocation,
    onProgress: () => {},
  });
  const segundos = composition.durationInFrames / composition.fps;
  console.log(`${composition.width}×${composition.height} · ${segundos.toFixed(1)}s`);

  registrados.push({
    id: `visual_anim_${clave}`,
    kind: "animacion",
    prompt: `Animación de contexto — ${clave}`,
    model: "remotion",
    filePath: relPath,
    chapterId: puntos[clave].capitulo,
    notes: `${composition.width}x${composition.height} · ${segundos.toFixed(1)}s · sin audio · identidad Modula`,
    createdAt: new Date().toISOString(),
  });
}

// ── Registro en el guion ────────────────────────────────────────────────
const db = new Database(DB_PATH);
const row = db.prepare("SELECT value FROM store_kv WHERE key = 'scripts'").get();
const scripts = JSON.parse(row.value);
const script = scripts.find((s) => s.id === guionId);
if (!script) {
  console.error(`No existe ningún guion con id ${guionId}.`);
  process.exit(1);
}

const visuals = script.visuals ?? [];
for (const visual of registrados) {
  const i = visuals.findIndex((v) => v.id === visual.id);
  if (i >= 0) {
    // Se conserva la fecha original para no reordenar la galería al repetir.
    visual.createdAt = visuals[i].createdAt;
    visuals[i] = visual;
  } else {
    visuals.push(visual);
  }
}

// ── Retirada de las animaciones Vox ─────────────────────────────────────
//
// El guard de `acabaDeRegistrarse` no es paranoia: una composición nueva puede
// llamarse igual que una Vox retirada (pasó con `cuatro-preguntas`), y entonces
// comparten id de recurso e incluso nombre de MP4. Sin este filtro, la retirada
// borra el archivo que se acaba de renderizar en esta misma pasada y el guion
// se queda con una animación menos sin que salte ningún error.
const acabaDeRegistrarse = new Set(registrados.map((v) => v.id));
let retiradas = 0;
if (!solo) {
  for (const viejo of VOX) {
    const id = `visual_anim_${viejo}`;
    if (acabaDeRegistrarse.has(id)) {
      console.log(`  (se conserva ${id}: lo ocupa ahora una animación nueva del mismo nombre)`);
      continue;
    }
    const i = visuals.findIndex((v) => v.id === id);
    if (i < 0) continue;
    const archivo = path.join(MEDIA_DIR, visuals[i].filePath);
    if (fs.existsSync(archivo)) fs.rmSync(archivo);
    visuals.splice(i, 1);
    retiradas += 1;
  }
}

script.visuals = visuals;
script.updatedAt = new Date().toISOString();
db.prepare(
  "INSERT INTO store_kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
).run("scripts", JSON.stringify(scripts), new Date().toISOString());
db.close();

console.log(`\n✓ ${registrados.length} animaciones enganchadas a "${script.title}"`);
if (retiradas) console.log(`✓ ${retiradas} animaciones Vox retiradas y sus MP4 borrados`);
console.log("  Si tienes la app abierta, refresca para verlo.");
