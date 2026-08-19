// Sistema de diseño del reel clonado.
//
// Ojo: esto NO es el lenguaje `vox` del resto de la carpeta (collage de papel
// recortado, tinta carbón, acento rojo). Es otro sistema distinto y convive
// aparte a propósito: papel marfil casi blanco, objetos fotográficos reales
// con su sombra, tipografía neo-grotesca enorme y cámara con paralaje. Si se
// mezclaran las dos paletas en un mismo archivo acabarían contaminándose.
//
// Los valores están muestreados de la referencia fotograma a fotograma, no
// elegidos a ojo.

import type { Paleta } from "../../lienzo/paleta";

export const reel = {
  /** Vertical de reel. La referencia es 9:16 a 30 fps y dura 14 s exactos. */
  canvas: { width: 1080, height: 1920, fps: 30 },

  color: {
    /** Marfil cálido de la esquina superior izquierda del papel. */
    papelCalido: "#F4EDDD",
    /** Tono medio, el que ocupa casi todo el lienzo. */
    papel: "#F8F4EA",
    /** Casi blanco de la esquina inferior derecha. */
    papelFrio: "#FDFCF9",
    /** Retícula de fondo: se intuye, no se lee. */
    reticula: "#E0D7C4",
    /** Curvas finísimas de una sola pasada. */
    filete: "#D6CEBE",
    /** Arco gris grande y suave que barre el fondo. */
    arco: "#E9E2D4",

    /** Tinta del titular ya asentado. */
    tinta: "#141311",
    /** Gris del titular de las escenas frías (el "Shine" / "BEHIND"). */
    tintaGris: "#4C4A47",
    /** Color de la letra que todavía no ha aterrizado. */
    tintaFantasma: "#B3AEA4",
    /** Línea pequeña sobre el titular. */
    tintaLinea: "#3A3936",
    /** Párrafos diminutos de relleno. */
    tintaNota: "#8E8A81",
  },

  /**
   * Aberración cromática del revelado: la letra que entra arrastra un borde
   * rojo por un lado y cian por el otro, que se cierra al asentarse. Es un
   * detalle de dos fotogramas, pero es la diferencia entre "texto que aparece"
   * y "texto animado por alguien que sabe".
   */
  fringe: { rojo: "rgba(255, 42, 90, 0.55)", cian: "rgba(0, 190, 255, 0.5)" },

  font: {
    /** Línea pequeña de arriba: peso medio, sin apretar. */
    linea: { fontWeight: 500, letterSpacing: "0.005em" },
    /** Titular: peso 800 y tracking cerrado. */
    titular: { fontWeight: 800, letterSpacing: "-0.028em" },
    /** Párrafo de relleno: minúsculo, interlineado abierto. */
    nota: { fontWeight: 400, letterSpacing: "0.01em", lineHeight: 1.5 },
  },
} as const;

/**
 * La misma paleta en el formato que consume el motor (remotion/lienzo).
 *
 * `acento: null` a propósito: el reel clonado no tiene color de marca — todo
 * su color sale de los objetos fotográficos. Es lo que lo distingue de las
 * animaciones de contexto de Modula, que sí llevan amarillo.
 */
export const PALETA_REEL: Paleta = {
  papelCalido: reel.color.papelCalido,
  papel: reel.color.papel,
  papelFrio: reel.color.papelFrio,
  reticula: reel.color.reticula,
  filete: reel.color.filete,
  arco: reel.color.arco,
  tinta: reel.color.tinta,
  tintaGris: reel.color.tintaGris,
  tintaFantasma: reel.color.tintaFantasma,
  tintaLinea: reel.color.tintaLinea,
  tintaNota: reel.color.tintaNota,
  acento: null,
  fringe: reel.fringe,
};

/** Paleta del envoltorio de showreel (fondo negro morado + neón violeta). */
export const showreel = {
  fondo: "#080410",
  fondoAlto: "#150725",
  glowLejos: "rgba(124, 44, 191, 0.55)",
  glowCerca: "rgba(190, 110, 255, 0.85)",
  borde: "#C77DFF",
  bordeApagado: "#7B3FB8",

  /** Panel falso de línea de tiempo (los grises reales de After Effects). */
  panel: {
    fondo: "#1D1D1D",
    lista: "#232323",
    fila: "#2A2A2A",
    filaAlt: "#242424",
    texto: "#9A9A9A",
    textoTenue: "#5F5F5F",
    playhead: "#E8483F",
  },

  /** Colores de las barras de capa, tal y como se ven en la referencia. */
  barras: ["#8C3A46", "#3E6E6B", "#3B4A7A", "#6B4A7A", "#4A4A4A", "#7A5A3A"],
} as const;
