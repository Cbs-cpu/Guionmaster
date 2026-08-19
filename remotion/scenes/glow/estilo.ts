// Identidad "glow" — oscuro + resplandor verde, maquetas de interfaz.
//
// Segunda familia de animación del estudio, aparte de la de Modula
// (papel blanco + amarillo) y del reel clonado (papel marfil). Nace de
// desmontar un reel de referencia con formato "storyboard → render final":
// fondo casi negro, un resplandor verde difuso que deriva despacio detrás de
// todo, y tarjetas de interfaz oscuras (no objetos fotografiados) que entran
// flotando. No tiene todavía un vídeo concreto asignado — existe como
// capacidad, para cuando haga falta un lenguaje de "demo de producto" en vez
// del collage de papel.
//
// Diferencia de fondo con remotion/lienzo/: allí todo es fotografía
// compuesta con `mixBlendMode: multiply` sobre un papel claro. Aquí no hay
// papel ni fotos — es vector puro (tarjetas, avatares, botones) sobre un
// fondo oscuro, así que no comparte piezas.tsx con el resto; solo reutiliza
// las matemáticas de movimiento (muelle, cámara, rampas), que son agnósticas
// de estilo.

export const glow = {
  canvas: { width: 1920, height: 1080, fps: 30 },

  color: {
    /** Fondo base: casi negro con un pelín de verde, nunca negro puro. */
    fondo: "#0A0D0B",
    fondoProfundo: "#050705",
    /** Resplandor: el único color con superficie real en toda la pieza. */
    glow: "#6FEFA0",
    glowSuave: "rgba(111, 239, 160, 0.16)",
    /** Tarjeta de interfaz: gris oscuro, nunca negro puro (para que se note que flota). */
    tarjeta: "#161A17",
    tarjetaBorde: "rgba(255, 255, 255, 0.08)",
    tarjetaSombra: "rgba(0, 0, 0, 0.55)",
    /** Texto. */
    texto: "#F2F5F1",
    textoSuave: "#8C948B",
    textoFaint: "#565C57",
  },

  font: {
    /** Cuerpo: grotesco fino, la voz "neutra" de la pieza. */
    sans: { fontWeight: 400, letterSpacing: "-0.005em" },
    /** La palabra que se acentúa: serif itálica, una sola por rótulo. */
    serifItalica: { fontStyle: "italic" as const, fontWeight: 400 },
  },
} as const;
