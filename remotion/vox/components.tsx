import React from "react";
import { AbsoluteFill, Img, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "./fonts";
import { beat, paperIdle, ramp, ripClipPath, SLAM } from "./motion";
import { STROKE, vox } from "./theme";

// Piezas comunes a todas las escenas. Todo lo que aparece en pantalla sale
// de aquí, que es lo que mantiene la misma "mano" en las seis animaciones.

/**
 * Fondo de papel: crema plano + grano fibroso + viñeta muy suave.
 * El grano se pinta con feTurbulence en vez de con una textura en disco
 * para que la pieza no dependa de ningún asset externo.
 */
export const PaperBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: vox.color.paper, fontFamily }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="vox-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={3} seed={7} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {children}

      {/* Grano por encima de todo, para que también "ensucie" las capas. */}
      <AbsoluteFill
        style={{
          filter: "url(#vox-grain)",
          opacity: 0.055,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
      {/* Viñeta: apenas perceptible, solo asienta los bordes. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(31,30,27,0.07) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Imagen de line-art generada con Kie.ai colocada sobre el papel.
 *
 * El truco está en `mixBlendMode: multiply`: esas imágenes vienen con fondo
 * casi blanco, y al multiplicarlo sobre el crema el fondo desaparece y solo
 * queda el trazo. Sin esto se ve un recuadro blanco flotando encima del
 * papel y se rompe la ilusión de collage.
 *
 * OJO con dónde se pone el blend: `clip-path`, `transform` y `filter` crean
 * un stacking context nuevo, y dentro de él la capa ya no tiene el fondo de
 * papel con el que mezclarse (se queda blanca). Por eso el multiply va en
 * el div exterior, que no lleva ninguna de esas tres cosas, y el rasgado y
 * la deriva van por dentro. Este componente existe precisamente para que
 * ese orden quede encapsulado y no haya que recordarlo en cada escena.
 */
export const LineArt: React.FC<{
  src: string;
  /** Lado del cuadro donde se encaja la imagen. */
  size: number;
  /** Esquina superior izquierda dentro del lienzo. */
  x: number;
  y: number;
  /** 0→1 de revelado con borde rasgado. Por defecto, ya revelada. */
  reveal?: number;
  /**
   * Opacidad de la capa. Va aquí y no en un div de fuera a propósito: un
   * ancestro con `opacity` o `transform` rompería el multiply (ver arriba).
   * Para encadenar actos, pásala por esta prop en vez de envolver.
   */
  opacity?: number;
  seed?: string;
  idle?: boolean;
}> = ({ src, size, x, y, reveal = 1, opacity = 1, seed = "art", idle = true }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        opacity,
        mixBlendMode: "multiply",
      }}
    >
      <div style={{ clipPath: ripClipPath(reveal, seed), width: "100%", height: "100%" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: idle ? paperIdle(frame, seed, 0.5) : undefined,
          }}
        >
          <Img
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              // El line-art de Kie sale con un negro algo lavado; un poco de
              // contraste lo iguala al peso de trazo que dibujamos nosotros.
              filter: "contrast(1.12) saturate(0.9)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/** Etiqueta pequeña en caja alta. El "rótulo de recorte" del lenguaje Vox. */
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = vox.color.inkFaint, style }) => (
  <div
    style={{
      ...vox.font.label,
      fontFamily,
      fontSize: 21,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Titular. Peso 800, tracking cerrado, nunca una frase entera. */
export const Headline: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 76, color = vox.color.ink, style }) => (
  <div
    style={{
      ...vox.font.display,
      fontFamily,
      fontSize: size,
      lineHeight: 1.04,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Tarjeta de papel recortado. La sombra dura y desplazada (sin difuminar)
 * es lo que la hace leer como una capa apoyada encima y no como una caja
 * dibujada dentro del fondo.
 */
export const PaperCard: React.FC<{
  children: React.ReactNode;
  seed?: string;
  tone?: "card" | "deep" | "accent";
  lifted?: boolean;
  idle?: boolean;
  style?: React.CSSProperties;
}> = ({ children, seed = "card", tone = "card", lifted = false, idle = true, style }) => {
  const frame = useCurrentFrame();
  const bg =
    tone === "accent"
      ? vox.color.accent
      : tone === "deep"
        ? vox.color.paperDeep
        : vox.color.paperCard;

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `${STROKE.hairline}px solid ${tone === "accent" ? vox.color.accent : vox.color.rule}`,
        boxShadow: lifted ? vox.shadow.cardLifted : vox.shadow.card,
        padding: "22px 30px",
        transform: idle ? paperIdle(frame, seed) : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Tachón rojo trazado a mano por encima de un elemento. Dos pasadas
 * ligeramente distintas, como cuando se tacha de verdad con un rotulador.
 */
export const StrikeThrough: React.FC<{
  progress: number;
  seed?: string;
  color?: string;
}> = ({ progress, seed = "strike", color = vox.color.accent }) => {
  const wobble = (k: string) => (random(`${seed}-${k}`) * 2 - 1) * 6;
  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: -6, width: "calc(100% + 12px)", overflow: "visible" }}
    >
      <path
        d={`M 1 ${16 + wobble("a")} Q 34 ${12 + wobble("b")} 66 ${16 + wobble("c")} T 99 ${14 + wobble("d")}`}
        fill="none"
        stroke={color}
        strokeWidth={3.2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
      <path
        d={`M 2 ${19 + wobble("e")} Q 40 ${15 + wobble("f")} 98 ${18 + wobble("g")}`}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.75}
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.max(0, progress * 1.25 - 0.25)}
      />
    </svg>
  );
};

/**
 * Revelado con borde rasgado. Envuelve a sus hijos y los va descubriendo de
 * izquierda a derecha con un borde dentado, como si se apartara el papel.
 */
export const RipReveal: React.FC<{
  progress: number;
  seed?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ progress, seed = "rip", children, style }) => (
  <div style={{ clipPath: ripClipPath(progress, seed), ...style }}>{children}</div>
);

/** Filete horizontal de pauta, del ancho que se le pase. */
export const Rule: React.FC<{ progress?: number; color?: string; height?: number }> = ({
  progress = 1,
  color = vox.color.rule,
  height = STROKE.hairline,
}) => (
  <div
    style={{
      height,
      width: `${progress * 100}%`,
      backgroundColor: color,
    }}
  />
);

/**
 * Tira de papel rojo con la frase de remate. Es el único sitio donde el
 * acento ocupa superficie en vez de una línea, así que se reserva para el
 * cierre: una frase corta por pieza, nunca dos.
 */
export const TiraRoja: React.FC<{
  children: React.ReactNode;
  delay: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, delay, size = 40, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = beat({ frame, fps, delay, config: SLAM });

  return (
    <div
      style={{
        display: "inline-block",
        backgroundColor: vox.color.accent,
        color: vox.color.paper,
        padding: "18px 34px",
        boxShadow: vox.shadow.cardLifted,
        ...vox.font.display,
        fontFamily,
        fontSize: size,
        opacity: interpolate(p, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(p, [0, 1], [-40, 0])}px) ${paperIdle(frame, "tira", 0.25)}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Punta de flecha como triángulo, orientada por el ángulo de llegada. */
function puntaFlecha(x: number, y: number, angulo: number, tam: number): string {
  const puntos = [
    [x, y],
    [x - tam * Math.cos(angulo - 0.4), y - tam * Math.sin(angulo - 0.4)],
    [x - tam * Math.cos(angulo + 0.4), y - tam * Math.sin(angulo + 0.4)],
  ];
  return puntos.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
}

/**
 * Flecha que se dibuja sola y remata con la punta de golpe al llegar.
 * El trazo y la punta van por separado a propósito: si la punta se dibujara
 * con el mismo dash que la línea, aparecería recortada por la mitad.
 */
export const Flecha: React.FC<{
  d: string;
  progress: number;
  /** Punto y ángulo (en radianes) donde clava la punta. */
  head: { x: number; y: number; angle: number };
  color?: string;
  width?: number;
  headSize?: number;
}> = ({ d, progress, head, color = vox.color.ink, width = STROKE.thin, headSize = 20 }) => {
  const puntaVisible = ramp(progress * 100, 88, 100);
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
      <polygon
        points={puntaFlecha(head.x, head.y, head.angle, headSize)}
        fill={color}
        opacity={puntaVisible}
        transform={`translate(${head.x} ${head.y}) scale(${0.7 + puntaVisible * 0.3}) translate(${-head.x} ${-head.y})`}
      />
    </g>
  );
};

/**
 * Marca de agua discreta con el nombre del capítulo, abajo a la izquierda.
 * Sirve para saber de un vistazo a qué parte del guion pertenece un clip
 * cuando hay seis en la carpeta de montaje.
 */
export const ChapterMark: React.FC<{ label: string; delay?: number }> = ({ label, delay = 8 }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, delay, delay + 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        bottom: 58,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: p * 0.75,
      }}
    >
      <div style={{ width: 34 * p, height: 3, backgroundColor: vox.color.accent }} />
      <Eyebrow style={{ fontSize: 17 }}>{label}</Eyebrow>
    </div>
  );
};
