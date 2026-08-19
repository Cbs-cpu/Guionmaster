// Paleta y tipografía de las animaciones de contexto.
//
// Los valores no son inventados: están muestreados directamente de las
// imágenes que ya se generaron con Kie.ai para este vídeo (data/media/
// generated/*.png), para que una animación puesta al lado de una de esas
// imágenes se lea como la misma familia y no como una pieza de otro sitio.
//   - `paper`  ← fondo de visual_rmq6znhpol.png (silos)  #F4EFE5
//   - `accent` ← torre roja de esa misma imagen          #812D2E
//   - `inkSoft`← torre oscura de esa misma imagen        #45494D
//
// Estética de referencia: Vox explainer (collage de papel recortado, fondo
// crema, tinta negra, un solo acento) cruzada con el line-art editorial
// sobrio que ya usa el proyecto.

export const vox = {
  color: {
    /** Fondo base: papel crema cálido. */
    paper: "#F4EFE5",
    /** Capa de papel recortado que se apoya encima del fondo. */
    paperCard: "#FBF8F2",
    /** Papel de una capa más profunda (cajas hundidas, sombras de capa). */
    paperDeep: "#E7DFD0",
    /** Tinta principal: los titulares y el trazo grueso. */
    ink: "#1F1E1B",
    /** Tinta secundaria: texto ya "gastado", pasos que ya pasaron. */
    inkSoft: "#45494D",
    /** Tinta muy tenue: numeración, notas al margen. */
    inkFaint: "#8C8779",
    /** Líneas de pauta y bordes de recorte. */
    rule: "#C9BFAE",
    /** Único color de acento. Se reserva para "aquí está el problema". */
    accent: "#812D2E",
    /** Acento lavado, para rellenos y resaltados suaves. */
    accentWash: "rgba(129, 45, 46, 0.12)",
  },

  /**
   * Una sola familia tipográfica en toda la pieza (regla de la estética Vox:
   * nunca mezclar typefaces entre planos). Se rellena en runtime desde
   * `loadFont()` de fonts.ts.
   */
  font: {
    family: "Inter",
    /** Titulares: pesado y con tracking negativo, aire editorial. */
    display: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    /** Etiquetas de recorte: pequeñas, en caja alta, muy espaciadas. */
    label: {
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase" as const,
    },
  },

  /**
   * Sombra de papel: siempre desplazada hacia abajo-derecha y muy poco
   * difusa. Es lo que hace que una capa parezca recortada y apoyada encima
   * en vez de dibujada dentro del fondo.
   */
  shadow: {
    card: "6px 7px 0 rgba(31, 30, 27, 0.10)",
    cardLifted: "10px 12px 0 rgba(31, 30, 27, 0.13)",
    label: "3px 3px 0 rgba(31, 30, 27, 0.12)",
  },

  /** Lienzo por defecto: overlay 16:9 para meter dentro del vídeo de YouTube. */
  canvas: {
    width: 1920,
    height: 1080,
    fps: 30,
  },
} as const;

/** Grosor de trazo coherente con el line-art de las imágenes generadas. */
export const STROKE = {
  hairline: 2,
  thin: 3,
  regular: 5,
  bold: 8,
} as const;
