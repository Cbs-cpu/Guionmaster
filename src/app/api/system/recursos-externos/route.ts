import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

// Lista el árbol de data/recursos-externos — el kit de LUTs/SFX/overlays/
// presets/fuentes de terceros que el usuario descargó, extraído en local
// (nunca en git, ver .gitignore). A diferencia de /api/system/paths (que
// deliberadamente solo da la raíz para no ser un explorador de archivos
// genérico), aquí SÍ hace falta listar contenido: es la única forma de que
// el panel de Premiere pueda enseñar "todo lo que hay" sin que el usuario
// tenga que ir a mano a Explorador de Windows. El listado queda acotado a
// esta única carpeta (rutaSegura la valida), así que sigue sin ser un
// explorador de disco arbitrario.

export const runtime = "nodejs";

const RAIZ = path.join(process.cwd(), "data", "recursos-externos");

/** Igual que mediaAbsolutePath pero para esta carpeta — bloquea salidas (../). */
function rutaSegura(relPath: string): string {
  const resuelta = path.resolve(RAIZ, relPath || ".");
  const raizConSep = RAIZ.endsWith(path.sep) ? RAIZ : RAIZ + path.sep;
  if (resuelta !== RAIZ && !resuelta.startsWith(raizConSep)) {
    throw new Error("Ruta fuera de recursos-externos.");
  }
  return resuelta;
}

// Archivos de ruido que ningún flujo de importación quiere ver.
const IGNORAR = /^(\.DS_Store|\._.*|Thumbs\.db|desktop\.ini)$/i;

export interface NodoRecursoExterno {
  nombre: string;
  tipo: "carpeta" | "archivo";
  rutaRelativa: string;
  /** Solo en archivos. */
  tamanoBytes?: number;
  /** Solo en carpetas: cuántos archivos hay dentro, recursivo — para no tener que abrir para saber si está vacía. */
  totalArchivos?: number;
  hijos?: NodoRecursoExterno[];
}

async function listarCarpeta(relPath: string): Promise<NodoRecursoExterno[]> {
  const abs = rutaSegura(relPath);
  const entradas = await fs.readdir(abs, { withFileTypes: true }).catch(() => []);
  const nodos: NodoRecursoExterno[] = [];

  for (const entrada of entradas) {
    if (IGNORAR.test(entrada.name)) continue;
    const rel = relPath ? `${relPath}/${entrada.name}` : entrada.name;

    if (entrada.isDirectory()) {
      const hijos = await listarCarpeta(rel);
      const totalArchivos = hijos.reduce(
        (acc, h) => acc + (h.tipo === "archivo" ? 1 : (h.totalArchivos ?? 0)),
        0
      );
      nodos.push({ nombre: entrada.name, tipo: "carpeta", rutaRelativa: rel, hijos, totalArchivos });
    } else {
      const info = await fs.stat(path.join(abs, entrada.name)).catch(() => null);
      nodos.push({
        nombre: entrada.name,
        tipo: "archivo",
        rutaRelativa: rel,
        tamanoBytes: info?.size ?? 0,
      });
    }
  }

  // Carpetas primero, luego archivos, alfabético dentro de cada grupo.
  nodos.sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === "carpeta" ? -1 : 1;
    return a.nombre.localeCompare(b.nombre, "es");
  });
  return nodos;
}

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  try {
    const existe = await fs
      .stat(RAIZ)
      .then((s) => s.isDirectory())
      .catch(() => false);
    if (!existe) {
      return NextResponse.json({ arbol: [], raiz: RAIZ, existe: false }, { headers: CORS_HEADERS });
    }
    const arbol = await listarCarpeta("");
    return NextResponse.json({ arbol, raiz: RAIZ, existe: true }, { headers: CORS_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado listando recursos externos.";
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}
