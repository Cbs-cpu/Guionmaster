// Escribe en el guion las marcas de ancla que enlazan una frase hablada con su
// animación de contexto.
//
//   node scripts/anclar-guion.mjs [--dry]
//
// Lee remotion/scenes/contexto/anclas.json (única fuente de verdad, compartida
// con las escenas de Remotion) y envuelve cada frase del campo `guion` del
// capítulo correspondiente en `[[clave|frase]]`.
//
// Dos garantías que importan más de lo que parece:
//
//   - Es idempotente. Volver a lanzarlo no anida marcas ni duplica nada, así
//     que se puede correr cada vez que se añade un punto nuevo.
//   - Aborta si una frase no aparece EXACTAMENTE una vez en el capítulo. El
//     texto hablado se retoca a mano constantemente; un ancla que ya no
//     coincide es un error que hay que ver, no algo que arreglar a medias
//     dejando el guion a medio anclar.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ANCLAS = path.join(ROOT, "remotion", "scenes", "contexto", "anclas.json");
const DB_PATH = path.join(ROOT, "data", "studio.db");

const dry = process.argv.includes("--dry");
const { guion: guionId, puntos } = JSON.parse(fs.readFileSync(ANCLAS, "utf8"));

const db = new Database(DB_PATH);
const row = db.prepare("SELECT value FROM store_kv WHERE key = 'scripts'").get();
if (!row) {
  console.error("No hay guiones guardados en data/studio.db.");
  process.exit(1);
}

const scripts = JSON.parse(row.value);
const script = scripts.find((s) => s.id === guionId);
if (!script) {
  console.error(`No existe ningún guion con id ${guionId}.`);
  process.exit(1);
}

const problemas = [];
let escritas = 0;
let yaEstaban = 0;

for (const [clave, { capitulo, ancla }] of Object.entries(puntos)) {
  const cap = script.chapters?.find((c) => c.id === capitulo);
  if (!cap) {
    problemas.push(`${clave}: el capítulo ${capitulo} no existe en el guion`);
    continue;
  }

  if (cap.guion.includes(`[[${clave}|`)) {
    yaEstaban += 1;
    continue;
  }

  // Se busca sobre el texto sin marcas previas para no partir un ancla ya
  // escrita por otra clave.
  const apariciones = cap.guion.split(ancla).length - 1;
  if (apariciones === 0) {
    problemas.push(`${clave}: la frase no aparece en ${capitulo}\n      « ${ancla} »`);
    continue;
  }
  if (apariciones > 1) {
    problemas.push(`${clave}: la frase aparece ${apariciones} veces en ${capitulo}, es ambigua`);
    continue;
  }

  cap.guion = cap.guion.replace(ancla, `[[${clave}|${ancla}]]`);
  escritas += 1;
  console.log(`  ancla  ${clave.padEnd(28)} → ${capitulo}`);
}

if (problemas.length) {
  console.error(`\n⛔ ${problemas.length} ancla(s) sin poder colocar:`);
  for (const p of problemas) console.error(`   · ${p}`);
  console.error("\nNo se ha escrito nada. Corrige `ancla` en anclas.json para que");
  console.error("coincida literalmente con el texto del capítulo, y vuelve a lanzarlo.");
  process.exit(1);
}

console.log(`\n${escritas} anclas nuevas, ${yaEstaban} ya estaban.`);

if (dry) {
  console.log("--dry: no se ha tocado la base de datos.");
  process.exit(0);
}

if (escritas > 0) {
  script.updatedAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO store_kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).run("scripts", JSON.stringify(scripts), new Date().toISOString());
  console.log(`✓ Guardado en ${path.relative(ROOT, DB_PATH)}`);
  console.log("  Si tienes la app abierta, refresca para verlo.");
}

db.close();
