import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { EstadoCamara, muelle, rampa } from "../../lienzo/movimiento";
import { glow } from "./estilo";
import { sans, serif } from "./fonts";

/**
 * Aterrizaje blando, sin rebote: en la referencia las tarjetas y los rótulos
 * se posan, no saltan. No vive en lienzo/movimiento.ts porque es un matiz de
 * ESTA identidad (Modula sí quiere el pequeño rebote de ENTRADA) — mover algo
 * así al módulo compartido cambiaría el reel y las animaciones ya aprobadas.
 */
const POSADO = { damping: 26, stiffness: 140, mass: 0.9 } as const;

// Piezas de la identidad "glow": fondo con resplandor, tarjetas de interfaz
// flotantes, texto grotesco + acento serif itálico.
//
// A diferencia de remotion/lienzo/piezas.tsx, aquí no hay `mixBlendMode:
// multiply` ni fotos: todo es color y forma dibujados directamente, así que
// las piezas son más simples — no hay que encapsular el truco del blanco que
// desaparece porque no hay blanco que desaparecer.

// ─────────────────────────────────────────────────────────────────────────
// Fondo
// ─────────────────────────────────────────────────────────────────────────

/**
 * Fondo oscuro con un resplandor que deriva despacio y respira (un pulso
 * lento de tamaño). En la referencia el glow nunca está quieto del todo —
 * si se dejara estático, el fondo se leería como una imagen y no como una
 * pieza viva.
 */
export const FondoGlow: React.FC<{
  camara: EstadoCamara;
  /** Posición del centro del resplandor, en fracción del lienzo. */
  x?: number;
  y?: number;
  /** Con anillo (halo) alrededor, como el plano del "sol" de la referencia. */
  anillo?: boolean;
}> = ({ camara, x = 0.5, y = 0.42, anillo = false }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const PROF = 0.3;

  const respiro = 1 + Math.sin(frame * 0.018) * 0.05;
  const cx = x * width - camara.x * PROF;
  const cy = y * height - camara.y * PROF;

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: glow.color.fondo, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: width * 0.46 * respiro,
          height: width * 0.46 * respiro,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow.color.glow} 0%, ${glow.color.glowSuave} 46%, transparent 72%)`,
          filter: "blur(38px)",
          opacity: 0.85,
        }}
      />
      {anillo && (
        <div
          style={{
            position: "absolute",
            left: cx,
            top: cy,
            width: width * 0.3,
            height: width * 0.3,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `${width * 0.018}px solid ${glow.color.glow}`,
            filter: "blur(6px)",
            opacity: 0.55,
          }}
        />
      )}
      {/* El resplandor central, más pequeño y nítido: el núcleo del glow. */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: width * 0.12,
          height: width * 0.12,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, #FFFFFF 0%, ${glow.color.glow} 60%, transparent 100%)`,
          filter: "blur(2px)",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -height * 0.2,
          background: `radial-gradient(ellipse at ${x * 100}% ${y * 100 + 20}%, rgba(111,239,160,0.06) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, ${glow.color.fondoProfundo} 0%, transparent 60%)`,
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Tarjeta de interfaz
// ─────────────────────────────────────────────────────────────────────────

/**
 * Tarjeta oscura flotante: la unidad básica de esta identidad, el
 * equivalente al recorte fotográfico en remotion/lienzo/. Entra con un
 * muelle blando (sin rebote — la referencia posa las tarjetas, no las hace
 * saltar) y respira una deriva mínima el resto del plano.
 */
export const TarjetaUI: React.FC<{
  x: number;
  y: number;
  ancho: number;
  entrada?: number;
  seed?: string;
  children: React.ReactNode;
}> = ({ x, y, ancho, entrada = 0, seed = "tarjeta", children }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const p = muelle(frame, fps, entrada, POSADO);
  const deriva = Math.sin(frame * 0.02 + random(seed) * 10) * 4;

  return (
    <div
      style={{
        position: "absolute",
        left: x * width,
        top: y * height,
        width: ancho * width,
        transform: `translate(-50%, -50%) translateY(${interpolate(p, [0, 1], [26, 0]) + deriva}px) scale(${interpolate(
          p,
          [0, 1],
          [0.94, 1]
        )})`,
        opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        backgroundColor: glow.color.tarjeta,
        border: `1px solid ${glow.color.tarjetaBorde}`,
        borderRadius: width * 0.014,
        boxShadow: `0 ${width * 0.012}px ${width * 0.03}px ${glow.color.tarjetaSombra}`,
        padding: width * 0.02,
      }}
    >
      {children}
    </div>
  );
};

/** Círculo de avatar con relleno en degradado — nunca una foto, solo forma y luz. */
export const Avatar: React.FC<{ tam: number; tono?: number }> = ({ tam, tono = 0 }) => (
  <div
    style={{
      width: tam,
      height: tam,
      borderRadius: "50%",
      background: `linear-gradient(155deg, ${glow.color.glow} ${tono}%, #2B3A2F 100%)`,
      border: `1px solid ${glow.color.tarjetaBorde}`,
      flexShrink: 0,
    }}
  />
);

/** Botón píldora con relleno claro y texto oscuro — el único elemento "positivo" (claro sobre oscuro) de la pieza. */
export const BotonPildora: React.FC<{ children: React.ReactNode; tam?: number }> = ({ children, tam = 22 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      padding: `${tam * 0.42}px ${tam * 0.85}px`,
      background: `linear-gradient(155deg, #FFFFFF 0%, ${glow.color.glow} 130%)`,
      color: "#0A0D0B",
      fontFamily: sans,
      fontWeight: 600,
      fontSize: tam,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// Texto
// ─────────────────────────────────────────────────────────────────────────

/**
 * Rótulo de una línea, grotesco fino con una palabra en serif itálica. Sube
 * y se desenfoca de entrada — un cruce suave, no la caída seca de Modula: en
 * esta identidad el texto acompaña, no protagoniza.
 */
export const Rotulo: React.FC<{
  antes?: string;
  acento: string;
  despues?: string;
  x: number;
  y: number;
  tam?: number;
  retardo?: number;
  centrado?: boolean;
}> = ({ antes, acento, despues, x, y, tam = 40, retardo = 0, centrado = true }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const p = muelle(frame, fps, retardo, POSADO);

  return (
    <div
      style={{
        position: "absolute",
        left: x * width,
        top: y * height,
        transform: `translate(${centrado ? "-50%" : "0"}, -50%) translateY(${interpolate(p, [0, 1], [16, 0])}px)`,
        opacity: interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        filter: `blur(${interpolate(p, [0, 0.6], [6, 0], { extrapolateRight: "clamp" })}px)`,
        fontFamily: sans,
        fontSize: tam,
        color: glow.color.texto,
        whiteSpace: "nowrap",
        textAlign: centrado ? "center" : "left",
      }}
    >
      {antes && <span style={glow.font.sans}>{antes} </span>}
      <span style={{ ...glow.font.serifItalica, fontFamily: serif }}>{acento}</span>
      {despues && <span style={glow.font.sans}> {despues}</span>}
    </div>
  );
};

/** Textura fina + viñeta, igual de discreta que en el resto del proyecto. */
export const AcabadoGlow: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);

/** Progreso de una escena entre dos fotogramas, para orquestar la secuencia del demo. */
export function progresoEscena(frame: number, desde: number, hasta: number): number {
  return rampa(frame, desde, hasta);
}
