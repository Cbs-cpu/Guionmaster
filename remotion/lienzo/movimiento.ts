import { interpolate, spring } from "remotion";

// Vocabulario de movimiento del reel.
//
// Dos ideas gobiernan la pieza y explican por qué la referencia se ve cara:
//
// 1. NADA está quieto. Hay una cámara que deriva despacio durante toda la
//    escena y cada capa la sigue multiplicada por su profundidad, así que el
//    primer plano barre rápido y el fondo casi no se mueve. Eso es el
//    paralaje, y es lo que convierte un collage plano en un espacio.
// 2. El texto no aparece: aterriza letra a letra, cada una desde gris y
//    desplazada, con un borde cromático que se cierra al pararse.

/** Entrada rápida con un pelín de exceso. Para objetos que entran en plano. */
export const ENTRADA = { damping: 20, stiffness: 130, mass: 0.9 } as const;
/** Aterrizaje de letra: seco, sin rebote, para que el texto no "gelatinee". */
export const LETRA = { damping: 200, stiffness: 220, mass: 0.6 } as const;

/** Progreso 0→1 de un muelle con retardo en fotogramas. */
export function muelle(
  frame: number,
  fps: number,
  delay: number,
  config: { damping: number; stiffness: number; mass: number } = ENTRADA
): number {
  return spring({ frame: frame - delay, fps, config });
}

/** Rampa lineal recortada entre dos fotogramas. */
export function rampa(frame: number, desde: number, hasta: number): number {
  return interpolate(frame, [desde, hasta], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Suavizado en coseno: arranca y para sin esquinas. Para la deriva de cámara. */
export function suave(t: number): number {
  return 0.5 - Math.cos(Math.min(1, Math.max(0, t)) * Math.PI) / 2;
}

export interface Camara {
  /** Desplazamiento total de la cámara en píxeles a lo largo de la escena. */
  dx: number;
  dy: number;
  /** Zoom al final de la escena (1 = sin zoom). */
  zoom: number;
}

export interface EstadoCamara {
  x: number;
  y: number;
  escala: number;
  /** Velocidad instantánea en px/fotograma. Alimenta el desenfoque de arrastre. */
  velocidad: number;
}

/**
 * Estado de la cámara en un fotograma dado.
 *
 * La deriva es casi lineal (no un muelle): la referencia mantiene una
 * velocidad constante durante toda la escena y corta en seco al cambiar de
 * plano. Un easing fuerte aquí delataría el corte.
 */
export function camaraEn(frame: number, duracion: number, cam: Camara): EstadoCamara {
  const posicion = (f: number) => {
    // Un 12% de suavizado sobre lineal: quita el arranque brusco del primer
    // fotograma sin llegar a frenar al final.
    const t = Math.min(1, Math.max(0, f / duracion));
    return t * 0.88 + suave(t) * 0.12;
  };
  const t = posicion(frame);
  const tPrevio = posicion(frame - 1);
  const avance = t - tPrevio;

  return {
    x: cam.dx * t,
    y: cam.dy * t,
    escala: 1 + (cam.zoom - 1) * t,
    velocidad: Math.hypot(cam.dx * avance, cam.dy * avance),
  };
}

/**
 * Desenfoque de arrastre. En la referencia los objetos que cruzan rápido no
 * están nítidos: llevan el rastro del obturador. Se aproxima sumando
 * desenfoque proporcional a la velocidad de la capa, con un techo para que un
 * primer plano muy profundo no se convierta en una mancha.
 */
export function arrastre(velocidad: number, profundidad: number): number {
  return Math.min(9, velocidad * profundidad * 0.55);
}
