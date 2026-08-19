// Identidad de los subtítulos animados — se renderizan como VÍDEO con canal
// alfa, no como archivo de subtítulos. Premiere Pro no lee `.ass`, y aunque
// lo leyera, `.ass` no puede dar el rebote/pop por palabra que se pide aquí:
// eso es una animación, no un formato de texto. La solución real es la misma
// que usa cualquier plugin de subtítulos animados para Premiere: renderizar
// el texto como un clip de vídeo transparente (ProRes 4444, canal alfa) y
// arrastrarlo a una pista por encima del vídeo real.

export const subtitulos = {
  canvas: { width: 1920, height: 1080, fps: 30 },

  color: {
    /** Texto hablado normal. */
    texto: "#FAFAFA",
    /** Tinta oscura para cuando el texto va sobre la caja amarilla. */
    tintaSobreAcento: "#141414",
    /** Amarillo de marca — la caja que aparece detrás de la palabra clave. */
    acento: "#FFC300",
    /** Contorno falso del texto normal (varias sombras apiladas). */
    contorno: "rgba(0,0,0,0.85)",
  },

  fringe: { rojo: "rgba(255, 42, 90, 0.6)", cian: "rgba(0, 190, 255, 0.55)" },
} as const;
