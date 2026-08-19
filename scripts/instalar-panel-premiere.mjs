// Instala (o desinstala) el panel de System Content Studio en Premiere Pro.
//
//   node scripts/instalar-panel-premiere.mjs           → instala
//   node scripts/instalar-panel-premiere.mjs --quitar   → desinstala
//   node scripts/instalar-panel-premiere.mjs --copiar   → copia en vez de enlazar
//
// Qué hace exactamente, porque toca cosas fuera del proyecto:
//
//  1. Crea un ENLACE SIMBÓLICO de `premiere/` dentro de la carpeta de
//     extensiones CEP del usuario. Enlace y no copia a propósito: así editar
//     el panel en el repo se refleja en Premiere con solo recargar, sin
//     reinstalar. Con --copiar se hace copia real (útil para instalarlo en
//     otro ordenador donde no esté el repo).
//
//  2. Activa `PlayerDebugMode` en el registro de Windows. Sin esto Premiere
//     se niega a cargar cualquier panel que no esté firmado por Adobe, y el
//     panel simplemente no aparece en el menú (sin ningún mensaje de error,
//     que es lo que lo hace tan desesperante de diagnosticar).
//     Es una clave por usuario (HKCU), reversible con --quitar.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGEN = path.join(ROOT, "premiere");
const NOMBRE = "com.modula.systemcontentstudio";

const quitar = process.argv.includes("--quitar");
const copiar = process.argv.includes("--copiar");

/** Carpeta de extensiones CEP del usuario (no la de sistema: no requiere admin). */
function carpetaExtensiones() {
  if (process.platform === "win32") {
    return path.join(os.homedir(), "AppData", "Roaming", "Adobe", "CEP", "extensions");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Adobe", "CEP", "extensions");
  }
  throw new Error(`Plataforma no soportada por CEP: ${process.platform}`);
}

/**
 * PlayerDebugMode, en todas las versiones de CSXS que puedan estar
 * instaladas. Premiere 2024+ usa CSXS.11/12, pero se ponen varias porque
 * cuál aplica depende de la versión exacta del host y equivocarse significa
 * que el panel no carga.
 */
const VERSIONES_CSXS = ["10", "11", "12"];

function activarModoDebug(activar) {
  if (process.platform !== "win32") {
    console.log(
      activar
        ? "  En macOS, actívalo con:\n    defaults write com.adobe.CSXS.11 PlayerDebugMode 1"
        : "  En macOS, desactívalo con:\n    defaults delete com.adobe.CSXS.11 PlayerDebugMode"
    );
    return;
  }

  for (const v of VERSIONES_CSXS) {
    const clave = `HKCU\\Software\\Adobe\\CSXS.${v}`;
    try {
      if (activar) {
        execFileSync("reg", ["add", clave, "/v", "PlayerDebugMode", "/t", "REG_SZ", "/d", "1", "/f"], {
          stdio: "pipe",
        });
      } else {
        execFileSync("reg", ["delete", clave, "/v", "PlayerDebugMode", "/f"], { stdio: "pipe" });
      }
    } catch {
      // Que falle una versión concreta es normal (esa CSXS no existe en este
      // equipo). Solo importa que al menos una haya funcionado.
    }
  }
  console.log(`  PlayerDebugMode ${activar ? "activado" : "retirado"} (CSXS ${VERSIONES_CSXS.join(", ")})`);
}

const destinoRaiz = carpetaExtensiones();
const destino = path.join(destinoRaiz, NOMBRE);

if (quitar) {
  if (fs.existsSync(destino)) {
    const info = fs.lstatSync(destino);
    if (info.isSymbolicLink()) fs.unlinkSync(destino);
    else fs.rmSync(destino, { recursive: true, force: true });
    console.log(`✓ Panel retirado de ${destino}`);
  } else {
    console.log("  El panel no estaba instalado.");
  }
  activarModoDebug(false);
  console.log("\nReinicia Premiere Pro para que desaparezca del menú.");
  process.exit(0);
}

if (!fs.existsSync(ORIGEN)) {
  console.error(`No encuentro la carpeta del panel en ${ORIGEN}`);
  process.exit(1);
}

fs.mkdirSync(destinoRaiz, { recursive: true });

if (fs.existsSync(destino)) {
  const info = fs.lstatSync(destino);
  if (info.isSymbolicLink()) fs.unlinkSync(destino);
  else fs.rmSync(destino, { recursive: true, force: true });
}

let modo;
if (copiar) {
  fs.cpSync(ORIGEN, destino, { recursive: true });
  modo = "copiado";
} else {
  try {
    // "junction" en Windows: a diferencia de un symlink normal, NO necesita
    // permisos de administrador ni modo desarrollador.
    fs.symlinkSync(ORIGEN, destino, process.platform === "win32" ? "junction" : "dir");
    modo = "enlazado";
  } catch (e) {
    console.log(`  No se ha podido enlazar (${e.code}); copiando en su lugar.`);
    fs.cpSync(ORIGEN, destino, { recursive: true });
    modo = "copiado";
  }
}

console.log(`✓ Panel ${modo} en ${destino}`);
activarModoDebug(true);

console.log(`
Siguiente paso:
  1. Arranca el estudio:  npm run dev
  2. Abre (o reinicia) Premiere Pro
  3. Ventana → Extensiones → System Content Studio

Si el panel no aparece en el menú, casi siempre es PlayerDebugMode: cierra
Premiere DEL TODO (que no quede en la bandeja) y vuelve a abrirlo, porque la
clave del registro solo se lee al arrancar.

Para depurar el panel, con él abierto: http://localhost:8092 en Chrome.
`);
