import { staticFile } from "remotion";

// Las ilustraciones que usan las animaciones, en un solo sitio.
//
// Kie.ai nombra los archivos con un id aleatorio (`generated/visual_xxx.png`),
// así que si cada escena citara su ruta a pelo habría que ir escena por
// escena cada vez que se regenera una imagen. Aquí se traduce una vez de
// nombre con sentido a nombre de archivo, y las escenas solo hablan de
// `CAPAS.acumulacion`.
//
// Se resuelven contra `data/media` (no contra `public/`), que es lo que se
// le pasa al renderizador como publicDir en scripts/render-animacion.mjs.

export const CAPAS = {
  // ── Generadas para estas animaciones ──
  /** Cap. 1 — engranaje agrietado con una tirita encima. */
  parche: staticFile("generated/visual_li3bxfjyjz.png"),
  /** Cap. 2 — reloj de arena con un bucle de realimentación alrededor. */
  retraso: staticFile("generated/visual_se7juek4br.png"),
  /** Cap. 3 — pila de cajas que entra rápido y sale a goteo. */
  acumulacion: staticFile("generated/visual_5maqpaiffm.png"),
  /** Cap. 4 — caja de archivo cerrada con candado. */
  informacion: staticFile("generated/visual_re0mxog5oz.png"),
  /** Cap. 6 — lupa sobre una red pequeña de nodos. */
  lupa: staticFile("generated/visual_02xvwsux5f.png"),

  // ── Ya existían, generadas junto al guion ──
  /** Red de nodos interconectados. */
  red: staticFile("generated/visual_o7x2i33iji.png"),
  /** Cuatro silos aislados, uno rojo. */
  silos: staticFile("generated/visual_rmq6znhpol.png"),
  /** Embudo que se estrecha: el cuello de botella. */
  embudo: staticFile("generated/visual_fwu6p2rvru.png"),
  /** Ciclo de 8 segmentos con engranaje central. */
  ciclo: staticFile("generated/visual_xt8qbdxm50.png"),
} as const;
