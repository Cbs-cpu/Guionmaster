// Genera con Kie.ai los recortes fotográficos que usa la animación
// "reel-clon" (remotion/scenes/reel/). Se ejecuta contra la ruta del propio
// proyecto (`/api/ai/visuals/generate`), nunca contra api.kie.ai a pelo, para
// no sacar la KIE_API_KEY de .env.local.
//
//   node scripts/gen-capas-reel.mjs [clave...]   // sin claves = todas
//
// Cada objeto se pide sobre fondo blanco liso y con su sombra proyectada
// encima de ese blanco: es lo que permite luego componerlo en Remotion con
// `mixBlendMode: multiply` sobre el papel crema, de forma que el blanco
// desaparece y la sombra sobrevive. Si se pidiera "fondo transparente" se
// perdería la sombra, que es justo lo que da el aire de objeto apoyado.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "remotion", "scenes", "reel", "capas.generadas.json");
const ENDPOINT = "http://localhost:3000/api/ai/visuals/generate";

// Bloque de estilo repetido palabra por palabra en los 16 prompts. Es lo que
// hace que las cuatro escenas se lean como un mismo set y no como fotos
// sueltas de bancos de imágenes distintos (imagen-prompt-craft §3).
const ESTILO =
  "Studio product photograph, the subject isolated on a plain pure white seamless background, " +
  "soft natural directional light from the upper left, realistic soft grey drop shadow cast onto " +
  "the white surface, sharp focus, true-to-life colours, no text, no watermark, no logo, " +
  "no extra props, nothing else in frame.";

const CAPAS = [
  // ── Escena 2 — "You're Making 1 MILLION Dollars" ──────────────────────
  {
    clave: "billetes_fajo",
    prompt: `A single banded stack of US one hundred dollar bills seen from a three-quarter view slightly from above, the paper band around the middle, crisp edges. ${ESTILO}`,
  },
  {
    clave: "billetes_fajo_lado",
    prompt: `A single banded stack of US one hundred dollar bills lying flat, photographed almost edge-on at a low angle so the layered edges of the notes are visible. ${ESTILO}`,
  },
  {
    clave: "billetes_pila",
    prompt: `Three banded stacks of US one hundred dollar bills piled on top of each other, slightly misaligned, seen from a three-quarter view. ${ESTILO}`,
  },
  {
    clave: "billetes_abanico",
    prompt: `Six loose US one hundred dollar bills fanned out in an overlapping spread, seen straight from above. ${ESTILO}`,
  },

  // ── Escena 3 — "Using BITCOIN" ────────────────────────────────────────
  {
    clave: "moneda_frontal",
    prompt: `One physical gold Bitcoin commemorative coin lying flat, photographed straight from above, the B symbol centred and fully readable, brushed gold metal with fine milled edge. ${ESTILO}`,
  },
  {
    clave: "moneda_inclinada",
    prompt: `One physical gold Bitcoin commemorative coin tilted at about forty degrees towards the camera, the B symbol foreshortened, brushed gold metal with fine milled edge. ${ESTILO}`,
  },
  {
    clave: "moneda_canto",
    prompt: `One physical gold Bitcoin commemorative coin standing on its edge, photographed from the side so the milled rim is the main feature and the face is barely visible. ${ESTILO}`,
  },
  {
    clave: "moneda_par",
    prompt: `Two physical gold Bitcoin commemorative coins, one lying flat and one leaning against it at an angle, brushed gold metal with fine milled edge. ${ESTILO}`,
  },

  // ── Escena 4 — "True value always Shine" ──────────────────────────────
  {
    clave: "farol",
    prompt: `A vintage kerosene hurricane lantern with an aged pewter frame and a warm glowing amber flame inside the glass, standing upright, seen from the front slightly below eye level. ${ESTILO}`,
  },
  {
    clave: "rama_alta",
    prompt: `A leafy green branch of a small-leaved tree entering the frame from the top right corner and reaching down and to the left, fresh bright green foliage, thin dark woody stem. ${ESTILO}`,
  },
  {
    clave: "rama_baja",
    prompt: `A leafy green branch of a small-leaved tree entering the frame from the bottom left corner and reaching up and to the right, fresh bright green foliage, thin dark woody stem. ${ESTILO}`,
  },
  {
    clave: "hojas_sueltas",
    prompt: `Three separate small green leaves falling freely, spaced apart from each other, each one at a different angle. ${ESTILO}`,
  },

  // ── Escena 5 — "Mastermind is always BEHIND" ──────────────────────────
  {
    clave: "cuadro_frontal",
    prompt: `An ornate carved gilded baroque picture frame holding a Renaissance oil portrait of a seated woman with a faint smile, hands folded, dark landscape behind her, photographed straight from the front. ${ESTILO}`,
  },
  {
    clave: "cuadro_angulo",
    prompt: `An ornate carved gilded baroque picture frame holding a Renaissance oil portrait of a seated woman with a faint smile, photographed from a three-quarter angle from the right so the frame shows depth and thickness. ${ESTILO}`,
  },
  {
    clave: "marco_esquina",
    prompt: `A close-up of the top left corner of an ornate carved gilded baroque picture frame, showing the scrollwork and gold leaf in detail, the canvas inside out of focus. ${ESTILO}`,
  },
  {
    clave: "rama_lateral",
    prompt: `A leafy green branch of a small-leaved tree entering the frame horizontally from the left edge, fresh bright green foliage, thin dark woody stem, more sparse than a full canopy. ${ESTILO}`,
  },
];

const pedidas = process.argv.slice(2);
const objetivo = pedidas.length ? CAPAS.filter((c) => pedidas.includes(c.clave)) : CAPAS;
if (!objetivo.length) {
  console.error(`Ninguna capa coincide. Claves: ${CAPAS.map((c) => c.clave).join(", ")}`);
  process.exit(1);
}

const manifiesto = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

// Kie.ai se pasa del timeout de 120 s del cliente con bastante frecuencia
// cuando hay cola, así que un fallo aislado no significa que el prompt esté
// mal: casi siempre basta con volver a pedirlo. Se reintenta dos veces antes
// de darlo por perdido.
async function generar({ clave, prompt }, intentos = 3) {
  let ultimo;
  for (let i = 1; i <= intentos; i++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "imagen-contexto",
          prompt,
          aspectRatio: "1:1",
          resolution: "2K",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || JSON.stringify(json).slice(0, 200));
      return json;
    } catch (error) {
      ultimo = error;
      if (i < intentos) console.log(`  …   ${clave.padEnd(20)} intento ${i} fallido, reintentando`);
    }
  }
  throw ultimo;
}

// De tres en tres: Kie.ai tarda entre 15 y 90 s por imagen, y lanzar las 16 a
// la vez es la forma más rápida de comerse un rate limit a mitad del set.
const LOTE = 3;
for (let i = 0; i < objetivo.length; i += LOTE) {
  const lote = objetivo.slice(i, i + LOTE);
  // Ojo con `lote.map(generar)` a secas: map pasa el índice como segundo
  // argumento y se colaría como número de intentos.
  const resultados = await Promise.allSettled(lote.map((c) => generar(c)));
  resultados.forEach((r, j) => {
    const { clave } = lote[j];
    if (r.status === "fulfilled") {
      manifiesto[clave] = r.value.filePath;
      console.log(`  ok   ${clave.padEnd(20)} ${r.value.filePath}`);
    } else {
      console.error(`  FALLO ${clave.padEnd(20)} ${r.reason?.message ?? r.reason}`);
    }
  });
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifiesto, null, 2)}\n`);
}

console.log(`\n${Object.keys(manifiesto).length} capas en ${path.relative(ROOT, MANIFEST)}`);
