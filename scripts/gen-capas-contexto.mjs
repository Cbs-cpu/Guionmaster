// Genera con Kie.ai los recortes fotográficos de las animaciones de contexto
// del vídeo "Tu empresa no es una lista de departamentos. Es un sistema."
// (script_2s7nio1s6a), en la identidad blanco + amarillo.
//
//   node scripts/gen-capas-contexto.mjs [clave...]   // sin claves = todas
//
// Mismo truco que el reel: se pide el objeto sobre blanco puro CON su sombra
// proyectada sobre ese blanco, porque en Remotion se compone con
// `mixBlendMode: multiply` — el blanco desaparece contra el papel y la sombra
// sobrevive. Con fondo transparente se perdería la sombra, que es lo que hace
// que el objeto parezca apoyado en vez de pegado.
//
// La diferencia con el reel: aquí se empuja deliberadamente hacia el amarillo
// de marca en los objetos que admiten ser amarillos (herramientas, cintas,
// tiritas, canicas). Así el color de Modula está en la fotografía y no solo
// en los vectores dibujados encima, que es lo que separa una identidad de
// verdad de un filtro de color puesto por encima.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "remotion", "scenes", "contexto", "capas.generadas.json");
const ENDPOINT = "http://localhost:3000/api/ai/visuals/generate";

const ESTILO =
  "Studio product photograph, the subject isolated on a plain pure white seamless background, " +
  "soft natural directional light from the upper left, realistic soft grey drop shadow cast onto " +
  "the white surface, sharp focus, true-to-life colours, no text, no watermark, no logo, " +
  "no extra props, nothing else in frame.";

/** Amarillo de marca, descrito en palabras que el modelo entiende bien. */
const AMARILLO = "bright warm industrial safety yellow";

const CAPAS = [
  // ── 1. Parches sueltos ────────────────────────────────────────────────
  { clave: "tirita", prompt: `A single ${AMARILLO} adhesive bandage plaster, slightly peeling at one corner, lying flat at a small angle. ${ESTILO}` },
  { clave: "engranaje_agrietado", prompt: `One heavy cast iron gear wheel with a visible crack running through its rim, lying flat, seen from directly above. ${ESTILO}` },
  { clave: "tornillo_suelto", prompt: `Three loose steel hex bolts of different sizes scattered apart from each other, seen from above. ${ESTILO}` },
  { clave: "cinta_adhesiva", prompt: `A roll of ${AMARILLO} adhesive tape with a short loose end unrolled, standing at a three-quarter angle. ${ESTILO}` },

  // ── 2. El problema que vuelve ─────────────────────────────────────────
  { clave: "tuberia_fuga", prompt: `A short section of galvanised metal pipe with a small hole in its side and a single drop of water forming at the hole, lying horizontally. ${ESTILO}` },
  { clave: "tapon", prompt: `One ${AMARILLO} rubber stopper plug, cone shaped, standing upright. ${ESTILO}` },
  { clave: "gota_agua", prompt: `Three separate falling water droplets, spaced apart, each catching a small highlight. ${ESTILO}` },

  // ── 3. Tocar aquí mueve aquello ───────────────────────────────────────
  { clave: "domino_fila", prompt: `Five ${AMARILLO} domino tiles standing upright in a row, evenly spaced, seen from a low three-quarter angle. ${ESTILO}` },
  { clave: "domino_suelto", prompt: `One single ${AMARILLO} domino tile lying flat on its face, seen from a three-quarter angle above. ${ESTILO}` },
  { clave: "cuerda_tensa", prompt: `A thick natural fibre rope pulled taut horizontally across the frame, its two cut ends visible. ${ESTILO}` },

  // ── 4. El conjunto no es la suma ──────────────────────────────────────
  { clave: "engranajes_sueltos", prompt: `Four steel gear wheels of different sizes lying flat and separated from each other, not touching, seen from directly above. ${ESTILO}` },
  { clave: "mecanismo_montado", prompt: `Three steel gear wheels meshed together with their teeth interlocking as a working mechanism, lying flat, seen from directly above. ${ESTILO}` },
  { clave: "engranaje_amarillo", prompt: `One gear wheel painted ${AMARILLO}, lying flat, seen from directly above, clean machined teeth. ${ESTILO}` },

  // ── 5. Bucles de retroalimentación ────────────────────────────────────
  { clave: "cuerda_bucle", prompt: `A thick natural fibre rope arranged in a single closed loop like a circle, its ends overlapping. ${ESTILO}` },
  { clave: "cinta_bucle", prompt: `A strip of ${AMARILLO} ribbon twisted into a continuous Möbius-like loop, standing on edge. ${ESTILO}` },
  { clave: "eslabones", prompt: `Four heavy steel chain links joined together in a short closed loop, lying flat. ${ESTILO}` },

  // ── 6. Retrasos ───────────────────────────────────────────────────────
  { clave: "reloj_arena", prompt: `A wooden framed hourglass with ${AMARILLO} sand, half of it already fallen through, standing upright. ${ESTILO}` },
  { clave: "interruptor", prompt: `One industrial toggle switch with a ${AMARILLO} lever, mounted on a small metal plate, seen from a three-quarter angle. ${ESTILO}` },
  { clave: "bombilla", prompt: `One clear glass filament light bulb, unlit, standing upright on its base. ${ESTILO}` },

  // ── 7. La decisión aislada ────────────────────────────────────────────
  { clave: "etiqueta_precio", prompt: `One blank ${AMARILLO} cardboard price tag with a string loop, lying flat at a slight angle, no text printed on it. ${ESTILO}` },
  { clave: "palanca", prompt: `One industrial control lever with a ${AMARILLO} handle mounted on a small steel base, pulled to one side, seen from the side. ${ESTILO}` },
  { clave: "tijeras", prompt: `One pair of scissors with ${AMARILLO} handles, half open, lying flat seen from above. ${ESTILO}` },

  // ── 8. El stock que se acumula ────────────────────────────────────────
  { clave: "cajas_pila", prompt: `Six plain cardboard boxes stacked into an unstable leaning pile, seen from a three-quarter angle. ${ESTILO}` },
  { clave: "caja_suelta", prompt: `One plain closed cardboard box seen from a three-quarter angle above. ${ESTILO}` },
  { clave: "cajas_desbordadas", prompt: `Ten plain cardboard boxes piled up and spilling sideways out of the pile, seen from a three-quarter angle. ${ESTILO}` },

  // ── 9. Silos de información ───────────────────────────────────────────
  { clave: "archivador_candado", prompt: `One closed grey metal filing cabinet drawer with a ${AMARILLO} padlock hanging from its handle, seen from a three-quarter angle. ${ESTILO}` },
  { clave: "carpetas", prompt: `Four closed manila document folders stacked slightly offset from each other, seen from a three-quarter angle above. ${ESTILO}` },
  { clave: "silo_metalico", prompt: `One corrugated metal grain silo with a conical roof, standing upright, seen from the front slightly below eye level. ${ESTILO}` },
  { clave: "llave", prompt: `One small brass key lying flat, seen from directly above. ${ESTILO}` },

  // ── 10. El cuello de botella ──────────────────────────────────────────
  { clave: "embudo", prompt: `One clear glass laboratory funnel with a long narrow stem, standing upright, seen from the front slightly above. ${ESTILO}` },
  { clave: "canicas", prompt: `Twelve ${AMARILLO} glass marbles clustered together in a loose heap, seen from a three-quarter angle above. ${ESTILO}` },
  { clave: "botella_cuello", prompt: `One clear empty glass bottle with a long narrow neck, lying on its side horizontally. ${ESTILO}` },

  // ── 11. Optimizar donde no toca ───────────────────────────────────────
  { clave: "valvula", prompt: `One industrial pipe valve with a ${AMARILLO} round handwheel, seen from a three-quarter angle. ${ESTILO}` },
  { clave: "canicas_atascadas", prompt: `Twenty ${AMARILLO} glass marbles crammed and piled tightly against each other in a dense heap, seen from the front. ${ESTILO}` },
  { clave: "engranaje_veloz", prompt: `One small steel gear wheel seen from directly above, its teeth sharp and clean, noticeably smaller than a coin. ${ESTILO}` },

  // ── 12. Mapear el flujo completo ──────────────────────────────────────
  { clave: "plano_enrollado", prompt: `One rolled up architectural blueprint paper, partly unrolled so the curl is visible, lying flat, the paper blank with no drawing on it. ${ESTILO}` },
  { clave: "lapiz", prompt: `One ${AMARILLO} wooden pencil, sharpened, lying flat at a diagonal, seen from directly above. ${ESTILO}` },
  { clave: "regla", prompt: `One straight metal ruler lying flat at a diagonal, seen from directly above, no numbers or markings printed on it. ${ESTILO}` },
  { clave: "cinta_metrica", prompt: `One ${AMARILLO} retractable tape measure case with a short length of blank tape pulled out and curling, seen from a three-quarter angle. ${ESTILO}` },

  // ── 13. La tecnología entra al final ──────────────────────────────────
  { clave: "caja_herramientas", prompt: `One closed ${AMARILLO} metal toolbox with a folding handle, seen from a three-quarter angle. ${ESTILO}` },
  { clave: "llave_inglesa", prompt: `One adjustable steel wrench lying flat at a diagonal, seen from directly above. ${ESTILO}` },
  { clave: "destornillador", prompt: `One screwdriver with a ${AMARILLO} handle lying flat at a diagonal, seen from directly above. ${ESTILO}` },

  // ── 14. El ciclo de ocho pasos ────────────────────────────────────────
  { clave: "engranaje_central", prompt: `One large heavy steel gear wheel with a hexagonal hole in its centre, lying perfectly flat, seen from directly above, centred in frame. ${ESTILO}` },
  { clave: "rueda_dentada", prompt: `One ${AMARILLO} painted gear wheel with wide teeth, lying perfectly flat, seen from directly above, centred in frame. ${ESTILO}` },

  // ── 15. Medir y optimizar ─────────────────────────────────────────────
  { clave: "medidor", prompt: `One round analogue pressure gauge with a chrome bezel and a red needle, seen from directly in front, no numbers printed on the dial. ${ESTILO}` },
  { clave: "calibre", prompt: `One steel vernier caliper, jaws slightly open, lying flat at a diagonal, seen from directly above. ${ESTILO}` },
  { clave: "nivel_burbuja", prompt: `One ${AMARILLO} spirit level tool lying flat horizontally, the bubble vial visible in its centre. ${ESTILO}` },

  // ── 16. Las cuatro preguntas ──────────────────────────────────────────
  { clave: "lupa", prompt: `One magnifying glass with a dark wooden handle, lying flat at a diagonal with the lens fully visible, seen from directly above. ${ESTILO}` },
  { clave: "cuaderno", prompt: `One closed ${AMARILLO} hardcover notebook with an elastic band closure, lying flat, seen from a three-quarter angle above. ${ESTILO}` },
  { clave: "boligrafo", prompt: `One simple ballpoint pen with a ${AMARILLO} barrel, capped, lying flat at a diagonal, seen from directly above. ${ESTILO}` },
  { clave: "notas_adhesivas", prompt: `Four blank ${AMARILLO} square sticky notes scattered apart from each other at slightly different angles, seen from directly above, nothing written on them. ${ESTILO}` },
];

// ── Cerrojo contra ejecuciones simultáneas ──────────────────────────────
// Dos copias de este script a la vez generan las MISMAS claves por duplicado
// (cada una ve el manifiesto sin lo que está escribiendo la otra) y la última
// en escribir se lleva por delante lo que apuntó la primera. Eso ya pasó una
// vez: 47 imágenes pagadas dos veces y dos claves que se perdieron del
// manifiesto pese a estar en disco. El cerrojo es barato; el crédito no.
const LOCK = path.join(path.dirname(MANIFEST), ".gen.lock");

function tomarCerrojo() {
  try {
    fs.writeFileSync(LOCK, String(process.pid), { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const duenno = fs.readFileSync(LOCK, "utf8").trim();
    console.error(`⛔ Ya hay una generación en marcha (pid ${duenno}).`);
    console.error(`   Si estás seguro de que no, borra ${path.relative(ROOT, LOCK)} y reintenta.`);
    process.exit(1);
  }
  const soltar = () => {
    try {
      fs.rmSync(LOCK);
    } catch {
      // El cerrojo ya no está: nada que soltar.
    }
  };
  process.on("exit", soltar);
  process.on("SIGINT", () => process.exit(130));
}

tomarCerrojo();

const manifiesto = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

// Sin argumentos se generan solo las que faltan, no las 51: así relanzarlo
// tras un fallo a mitad del lote no vuelve a pagar por lo que ya está hecho.
// Con claves explícitas sí se regenera, que es como se pide una segunda
// versión de una imagen que no ha convencido.
const pedidas = process.argv.slice(2);
const objetivo = pedidas.length
  ? CAPAS.filter((c) => pedidas.includes(c.clave))
  : CAPAS.filter((c) => !manifiesto[c.clave]);

if (!objetivo.length) {
  console.log(pedidas.length ? "Ninguna capa coincide con esas claves." : "Nada que generar: ya están todas.");
  process.exit(0);
}

/**
 * Errores que no van a arreglarse reintentando.
 *
 * Distinguirlos importa: quedarse sin saldo y reintentar tres veces por cada
 * una de las 47 imágenes restantes son 141 llamadas inútiles que además
 * disparan el limitador de frecuencia de Kie.ai, y entonces el log se llena de
 * "call frequency too high" y tapa la causa real, que era el saldo.
 */
function esDefinitivo(error) {
  return /credit|balance|insufficient|unauthor|invalid api key/i.test(error?.message ?? "");
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Kie.ai se pasa del timeout de 120 s del cliente con bastante frecuencia
// cuando hay cola; un fallo aislado casi nunca significa que el prompt esté mal.
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
      if (esDefinitivo(error)) throw error;
      if (i < intentos) {
        // Espera creciente: reintentar al instante es lo que convierte un
        // fallo puntual en un bloqueo por frecuencia.
        const espera = 4000 * 2 ** (i - 1);
        console.log(`  …   ${clave.padEnd(22)} intento ${i} fallido, reintento en ${espera / 1000}s`);
        await esperar(espera);
      }
    }
  }
  throw ultimo;
}

const LOTE = 3;
let hechas = 0;
for (let i = 0; i < objetivo.length; i += LOTE) {
  const lote = objetivo.slice(i, i + LOTE);
  // Ojo con `lote.map(generar)` a secas: map pasa el índice como segundo
  // argumento y se colaría como número de intentos.
  const resultados = await Promise.allSettled(lote.map((c) => generar(c)));
  resultados.forEach((r, j) => {
    const { clave } = lote[j];
    if (r.status === "fulfilled") {
      manifiesto[clave] = r.value.filePath;
      hechas += 1;
      console.log(`  ok   ${clave.padEnd(22)} ${r.value.filePath}`);
    } else {
      console.error(`  FALLO ${clave.padEnd(22)} ${r.reason?.message ?? r.reason}`);
    }
  });
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifiesto, null, 2)}\n`);
  console.log(`  — ${i + lote.length}/${objetivo.length} pedidas, ${hechas} ok —`);

  // Si el lote entero se ha caído por algo definitivo (saldo, credenciales),
  // seguir con los 15 lotes siguientes solo sirve para alargar el log.
  const definitivo = resultados.find((r) => r.status === "rejected" && esDefinitivo(r.reason));
  if (definitivo) {
    console.error(`\n⛔ ${definitivo.reason.message}`);
    console.error("   Se para aquí. Recarga saldo en Kie.ai y vuelve a lanzar el script:");
    console.error("   node scripts/gen-capas-contexto.mjs   (genera solo las que falten)");
    break;
  }
}

console.log(`\n${Object.keys(manifiesto).length} capas en ${path.relative(ROOT, MANIFEST)}`);
