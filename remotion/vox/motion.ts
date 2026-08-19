import { interpolate, random, spring } from "remotion";

// Vocabulario de movimiento del collage de papel.
//
// La regla que gobierna todo esto: el movimiento explica, no decora. Nada
// se desvanece suavemente ni flota — el papel entra de golpe, se rasga, se
// desliza y se posa. Si un movimiento no aclara la frase que se está
// diciendo encima, sobra.

/** Entra rápido, se pasa un pelo y frena en seco. Para etiquetas y cifras. */
export const SLAM = { damping: 14, stiffness: 240, mass: 0.55 } as const;
/** Aterrizaje blando, sin rebote. Para capas grandes que se posan. */
export const SETTLE = { damping: 26, stiffness: 140, mass: 0.9 } as const;
/** Instantáneo y seco, sin rebote. Para cortes y cambios de estado. */
export const SNAP = { damping: 200, stiffness: 320, mass: 0.4 } as const;

type SpringConfig = { damping: number; stiffness: number; mass: number };

interface BeatArgs {
  frame: number;
  fps: number;
  /** Fotogramas de espera antes de arrancar. */
  delay?: number;
  config?: SpringConfig;
}

/** Progreso 0→1 de un muelle, con retardo. Base de casi todo lo demás. */
export function beat({ frame, fps, delay = 0, config = SLAM }: BeatArgs): number {
  return spring({ frame: frame - delay, fps, config, durationInFrames: undefined });
}

/**
 * Golpe de entrada: la pieza cae desde arriba, se pasa de tamaño y para.
 * Devuelve un style listo para pegar en un div.
 */
export function slamIn(args: BeatArgs & { from?: number }): React.CSSProperties {
  const p = beat({ ...args, config: args.config ?? SLAM });
  const from = args.from ?? -70;
  return {
    opacity: interpolate(p, [0, 0.18], [0, 1], { extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(p, [0, 1], [from, 0])}px) scale(${interpolate(
      p,
      [0, 1],
      [1.14, 1]
    )})`,
  };
}

/**
 * Capa de papel que se posa: baja poco, se endereza desde un ángulo ligero
 * y la sombra crece con ella. El ángulo inicial depende de la semilla, para
 * que dos capas hermanas no caigan exactamente igual.
 */
export function paperSettle(
  args: BeatArgs & { seed: string; tilt?: number }
): React.CSSProperties {
  const p = beat({ ...args, config: args.config ?? SETTLE });
  const tilt = (args.tilt ?? 2.4) * (random(args.seed) * 2 - 1);
  return {
    opacity: interpolate(p, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(p, [0, 1], [-26, 0])}px) rotate(${interpolate(
      p,
      [0, 1],
      [tilt, 0]
    )}deg)`,
  };
}

/**
 * Reposo del papel ya colocado: una deriva de menos de un grado, lenta y
 * continua. Es lo que evita que una capa quieta parezca una captura de
 * pantalla en vez de un recorte apoyado en una mesa.
 */
export function paperIdle(frame: number, seed: string, amount = 0.35): string {
  const phase = random(seed) * Math.PI * 2;
  const speed = 0.012 + random(`${seed}-s`) * 0.006;
  return `rotate(${Math.sin(frame * speed + phase) * amount}deg)`;
}

/** Progreso lineal suavizado entre dos fotogramas. Para trazos y barridos. */
export function ramp(frame: number, start: number, end: number): number {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Borde rasgado para revelar una capa. Devuelve un `clip-path` de polígono
 * cuyo borde de avance va dentado, como papel roto a mano, en vez de recto.
 * `progress` 0→1 barre de izquierda a derecha.
 */
export function ripClipPath(progress: number, seed: string, teeth = 22): string {
  const x = progress * 118 - 9; // se pasa por ambos lados para no dejar borde visible
  const points: string[] = ["0% 100%", "0% 0%"];
  for (let i = 0; i <= teeth; i++) {
    const t = i / teeth;
    const jag = (random(`${seed}-${i}`) * 2 - 1) * 2.6;
    points.push(`${(x + jag).toFixed(2)}% ${(t * 100).toFixed(2)}%`);
  }
  return `polygon(${points.join(", ")})`;
}

/**
 * Trazo que se dibuja solo. Se usa con `pathLength={1}` en el SVG para no
 * tener que medir la longitud real de cada curva.
 */
export function strokeDraw(progress: number): React.SVGAttributes<SVGPathElement> {
  return {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - progress,
  };
}

/** Pulso de atención: dos latidos y se queda quieto. Para marcar "aquí". */
export function pulse(frame: number, start: number, fps: number): number {
  const t = (frame - start) / fps;
  if (t < 0) return 0;
  if (t > 1.6) return 0;
  return Math.sin(t * Math.PI * 2.5) * Math.exp(-t * 1.8);
}
