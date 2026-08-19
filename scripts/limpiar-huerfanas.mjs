// Lista (y opcionalmente borra) las imágenes generadas que ya no referencia
// nadie: ni un manifiesto de capas, ni el campo `visuals` de un guion, ni
// remotion/capas.ts.
//
//   node scripts/limpiar-huerfanas.mjs              → solo lista
//   node scripts/limpiar-huerfanas.mjs --borrar     → borra de verdad
//
// Por defecto NO borra nada. Cada archivo de data/media/generated costó
// crédito real de Kie.ai, así que la decisión de tirarlos es del usuario y no
// del script; y una imagen huérfana no molesta a nadie salvo en disco.
//
// De dónde salen huérfanas: normalmente de regenerar una capa (la ruta nueva
// sustituye a la vieja en el manifiesto y la anterior se queda suelta), o de
// una generación duplicada.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "media", "generated");
const borrar = process.argv.includes("--borrar");

const referenciados = new Set();

// 1. Manifiestos de capas de cada familia de animaciones.
for (const rel of [
  "remotion/scenes/contexto/capas.generadas.json",
  "remotion/scenes/reel/capas.generadas.json",
]) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  for (const v of Object.values(JSON.parse(fs.readFileSync(p, "utf8")))) {
    if (typeof v === "string") referenciados.add(path.basename(v));
  }
}

// 2. remotion/capas.ts (las capas de las animaciones Vox, citadas a mano).
const capasTs = path.join(ROOT, "remotion", "capas.ts");
if (fs.existsSync(capasTs)) {
  for (const m of fs.readFileSync(capasTs, "utf8").matchAll(/generated\/([\w.-]+)/g)) {
    referenciados.add(m[1]);
  }
}

// 3. Todo lo enganchado a un guion en la base de datos.
const db = new Database(path.join(ROOT, "data", "studio.db"));
const row = db.prepare("SELECT value FROM store_kv WHERE key = 'scripts'").get();
if (row) {
  for (const s of JSON.parse(row.value)) {
    for (const v of s.visuals ?? []) referenciados.add(path.basename(v.filePath));
  }
}
db.close();

const enDisco = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)) : [];
const huerfanas = enDisco.filter((f) => !referenciados.has(f));

const bytes = huerfanas.reduce((n, f) => n + fs.statSync(path.join(DIR, f)).size, 0);
const mb = (bytes / 1048576).toFixed(0);

console.log(`${enDisco.length} imágenes en disco · ${enDisco.length - huerfanas.length} en uso · ${huerfanas.length} huérfanas (${mb} MB)`);

if (!huerfanas.length) process.exit(0);

for (const f of huerfanas) console.log(`  ${f}`);

if (!borrar) {
  console.log("\nNo se ha borrado nada. Para borrarlas:");
  console.log("  node scripts/limpiar-huerfanas.mjs --borrar");
  process.exit(0);
}

for (const f of huerfanas) fs.rmSync(path.join(DIR, f));
console.log(`\n✓ ${huerfanas.length} archivos borrados (${mb} MB liberados)`);
