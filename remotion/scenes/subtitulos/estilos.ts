// Catálogo de estilos de subtítulo animado.
//
// Los cuatro comparten motor (mismo componente Palabra, mismos datos de
// transcripción) pero difieren en tratamiento — no es un cambio de color por
// encima del mismo dibujo, cada uno resuelve "cómo se lee una palabra que
// llega" de una forma distinta. NINGUNO pinta ya una caja sólida sobre el
// plano — el requisito es "solo las letras": el acento se marca con color,
// contorno, resplandor o un subrayado fino, nunca tapando vídeo detrás.
//
//   - modula   → la identidad de marca: contorno duro, rebote marcado, la
//                palabra clave cambia a amarillo. El más "hormonas".
//   - minimal  → sin contorno, solo sombra suave y un fundido con subida
//                corta. Para cuando el texto no puede competir con el plano
//                — entrevistas, voces en off sobre imagen ya cargada.
//   - bloques  → CADA palabra (no solo la clave) lleva su propio subrayado,
//                estilo etiqueta apilada sin relleno — el ritmo "captions de
//                TikTok" sin tapar el vídeo.
//   - glow     → hermano del fondo oscuro+verde de scenes/glow/: sin
//                contorno, con resplandor de color en vez de trazo, entrada
//                blanda sin rebote.

export type TratamientoTexto = "contorno" | "sombra-suave" | "glow";
export type TratamientoPalabra = "simple" | "bloque-todas" | "caja-clave";
export type TipoMuelle = "punch" | "posado";
/**
 * Cómo se marca una palabra que lleva `tratamientoPalabra` distinto de
 * "simple": "caja" pinta un relleno sólido detrás (el look "pastilla"),
 * "subrayado" solo traza una línea bajo la palabra — mismo agrupado visual
 * por palabra, sin tapar nada del plano detrás. Los cuatro estilos del
 * catálogo usan "subrayado" o ninguno: ningún estilo pinta ya una caja
 * sólida sobre el vídeo.
 */
export type EnvoltorioPalabra = "caja" | "subrayado";

export interface EstiloSubtitulos {
  id: string;
  nombre: string;
  descripcion: string;
  fontWeight: number;
  fontSizeBase: number;
  colorTexto: string;
  /** Texto cuando va sobre un bloque/caja de color (necesita contraste con `colorAcento`). */
  colorSobreAcento: string;
  colorAcento: string;
  /** Solo lo usa "bloque-todas": el color de la marca (caja o subrayado) que NO es la palabra clave. */
  colorBloqueBase?: string;
  tratamientoTexto: TratamientoTexto;
  tratamientoPalabra: TratamientoPalabra;
  /** Solo importa si `tratamientoPalabra` no es "simple". Por defecto "subrayado". */
  envoltorioPalabra?: EnvoltorioPalabra;
  muelle: TipoMuelle;
  aberracionCromatica: boolean;
  rotacion: boolean;
  /** Fondo de la previsualización web (no forma parte del archivo real). */
  fondoPreview: string;
}

export const ESTILOS: EstiloSubtitulos[] = [
  {
    id: "modula",
    nombre: "Modula",
    descripcion:
      "Blanco y amarillo de marca. Contorno duro, rebote marcado, la palabra clave pasa a amarillo — sin caja detrás. El más enérgico de los cuatro.",
    fontWeight: 800,
    fontSizeBase: 64,
    colorTexto: "#FAFAFA",
    colorSobreAcento: "#141414",
    colorAcento: "#FFC300",
    tratamientoTexto: "contorno",
    tratamientoPalabra: "simple",
    muelle: "punch",
    aberracionCromatica: true,
    rotacion: true,
    fondoPreview: "linear-gradient(155deg, #1B1F1C 0%, #0B0D0B 60%, #050605 100%)",
  },
  {
    id: "minimal",
    nombre: "Minimal",
    descripcion:
      "Sin contorno ni caja. Fundido con subida corta, la palabra clave solo cambia de color. Para cuando el plano ya está cargado.",
    fontWeight: 600,
    fontSizeBase: 52,
    colorTexto: "#F5F5F0",
    colorSobreAcento: "#F5F5F0",
    colorAcento: "#FFC300",
    tratamientoTexto: "sombra-suave",
    tratamientoPalabra: "simple",
    muelle: "posado",
    aberracionCromatica: false,
    rotacion: false,
    fondoPreview: "linear-gradient(155deg, #2A2A28 0%, #171715 100%)",
  },
  {
    id: "bloques",
    nombre: "Bloques",
    descripcion:
      "Cada palabra lleva su propio subrayado — etiquetas apiladas, no solo la clave, pero sin relleno que tape el vídeo. El look de captions cortas de reels.",
    fontWeight: 800,
    fontSizeBase: 56,
    colorTexto: "#FAFAFA",
    colorSobreAcento: "#141414",
    colorAcento: "#FFC300",
    colorBloqueBase: "rgba(250,250,250,0.55)",
    tratamientoTexto: "contorno",
    tratamientoPalabra: "bloque-todas",
    envoltorioPalabra: "subrayado",
    muelle: "punch",
    aberracionCromatica: false,
    rotacion: true,
    fondoPreview: "linear-gradient(155deg, #202020 0%, #0A0A0A 100%)",
  },
  {
    id: "glow",
    nombre: "Glow",
    descripcion:
      "Hermano del fondo oscuro con resplandor verde. Sin contorno, con brillo de color en vez de trazo, entrada blanda sin rebote.",
    fontWeight: 700,
    fontSizeBase: 58,
    colorTexto: "#F2F5F1",
    colorSobreAcento: "#0A0D0B",
    colorAcento: "#6FEFA0",
    tratamientoTexto: "glow",
    tratamientoPalabra: "caja-clave",
    muelle: "posado",
    aberracionCromatica: false,
    rotacion: false,
    fondoPreview: "radial-gradient(circle at 50% 55%, rgba(111,239,160,0.18) 0%, #0A0D0B 62%)",
  },
];

export const ESTILO_POR_DEFECTO = ESTILOS[0].id;

export function buscarEstilo(id: string): EstiloSubtitulos {
  const encontrado = ESTILOS.find((e) => e.id === id);
  if (!encontrado) {
    throw new Error(`No existe el estilo de subtítulos "${id}". Disponibles: ${ESTILOS.map((e) => e.id).join(", ")}`);
  }
  return encontrado;
}
