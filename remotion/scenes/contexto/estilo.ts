import type { Paleta } from "../../lienzo/paleta";

// Identidad de Modula para las animaciones de contexto: blanco y amarillo.
//
// El amarillo (#FFC300) NO se reparte por la pieza. Aparece en tres sitios y
// solo en tres: la banda ancha del fondo (en versión muy lavada), la barra de
// resalte que se abre detrás de una palabra por escena, y los propios objetos
// fotográficos, que se piden a Kie.ai amarillos siempre que el objeto lo
// admita (cinta, tiritas, herramientas, canicas). Ese último punto es el que
// hace que el color sea de la marca y no un filtro puesto por encima.

export const contexto = {
  /** Overlay 16:9 para montar sobre la grabación a cámara. */
  canvas: { width: 1920, height: 1080, fps: 30 },

  /** Duración estándar de un clip: cubre una frase hablada y sobra un poco. */
  duracion: 180,

  color: {
    papelCalido: "#FFFDF4",
    papel: "#FAFAF7",
    papelFrio: "#FFFFFF",
    reticula: "#E8E5DA",
    filete: "#DCD8CC",
    /** Banda de fondo: el amarillo de marca lavado casi hasta el papel. */
    arco: "#FFF3CE",
    tinta: "#141414",
    tintaGris: "#4A4A48",
    tintaFantasma: "#BFBCB4",
    tintaLinea: "#3A3A38",
    tintaNota: "#8C8981",
    /** Amarillo Modula. */
    acento: "#FFC300",
  },
} as const;

export const PALETA_CONTEXTO: Paleta = {
  papelCalido: contexto.color.papelCalido,
  papel: contexto.color.papel,
  papelFrio: contexto.color.papelFrio,
  reticula: contexto.color.reticula,
  filete: contexto.color.filete,
  arco: contexto.color.arco,
  tinta: contexto.color.tinta,
  tintaGris: contexto.color.tintaGris,
  tintaFantasma: contexto.color.tintaFantasma,
  tintaLinea: contexto.color.tintaLinea,
  tintaNota: contexto.color.tintaNota,
  acento: contexto.color.acento,
  fringe: { rojo: "rgba(255, 42, 90, 0.5)", cian: "rgba(0, 190, 255, 0.45)" },
};

/** Cuerpos tipográficos calibrados para 1920×1080. */
export const TIPO = {
  linea: 46,
  titular: 118,
  titularLargo: 96,
  paso: 54,
  nota: 22,
} as const;
