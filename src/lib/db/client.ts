import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// Persistencia real en disco para que nada se pierda al limpiar el navegador
// o cambiar de máquina, siempre que sea el mismo servidor/proyecto. Se guarda
// como pocas filas clave→JSON (una por cada slice del store de zustand) en
// vez de normalizar cada tabla: los guiones tienen formas anidadas muy
// distintas según el tipo (reel / youtube / carrusel) y no merece la pena
// modelarlas en columnas separadas para una app de un solo usuario.
//
// `next dev` recarga módulos en caliente; sin un singleton en globalThis se
// abrirían varias conexiones a la vez y sqlite se quejaría del lock.
declare global {
  var __studioDb: Database.Database | undefined;
}

const DB_PATH = path.join(process.cwd(), "data", "studio.db");

function createDb(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return db;
}

function getDb(): Database.Database {
  if (!globalThis.__studioDb) {
    globalThis.__studioDb = createDb();
  }
  return globalThis.__studioDb;
}

/** Las claves que componen el estado persistido, una fila por cada una. */
export const STATE_KEYS = [
  "scripts",
  "knowledgeNotes",
  "customKnowledge",
  "sources",
  "referenceImages",
  "subtitleStyles",
  "seededScriptIds",
] as const;

export type StateKey = (typeof STATE_KEYS)[number];

/** Lee todo el estado guardado. Las claves ausentes (primer arranque) no aparecen. */
export function readState(): Partial<Record<StateKey, unknown>> {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM store_kv").all() as { key: string; value: string }[];
  const out: Partial<Record<StateKey, unknown>> = {};
  for (const row of rows) {
    if ((STATE_KEYS as readonly string[]).includes(row.key)) {
      try {
        out[row.key as StateKey] = JSON.parse(row.value);
      } catch {
        // fila corrupta: se ignora en vez de tirar abajo toda la lectura
      }
    }
  }
  return out;
}

/** Sobrescribe el valor de las claves recibidas. Las demás no se tocan. */
export function writeState(patch: Partial<Record<StateKey, unknown>>): void {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(
    "INSERT INTO store_kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  );
  const tx = db.transaction((entries: [string, unknown][]) => {
    for (const [key, value] of entries) {
      stmt.run(key, JSON.stringify(value), now);
    }
  });
  tx(Object.entries(patch));
}

export function hasAnyState(): boolean {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as n FROM store_kv").get() as { n: number };
  return row.n > 0;
}
