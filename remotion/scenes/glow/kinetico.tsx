import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camaraEn, muelle, rampa } from "../../lienzo/movimiento";
import { glow } from "./estilo";
import { sans, serif } from "./fonts";
import { AcabadoGlow, FondoGlow } from "./piezas";

// Variante "kinético" de la identidad glow: en vez de una tarjeta de
// interfaz con un rótulo fijo debajo (ver guion.tsx / GlowDemo), aquí solo
// hay texto — una frase corta reemplaza a la siguiente en el centro del
// plano, cada una con su propia entrada (sube + desenfoque, como Rotulo) y
// salida (funde antes de que llegue la próxima). Nace de adaptar la paleta
// de un reel de referencia (fondo casi negro + resplandor cálido en vez del
// verde de producto) al motor que ya existe aquí — no un estilo nuevo, la
// misma pieza (FondoGlow, AcabadoGlow, muelle/rampa) con `acento` distinto.
//
// Reutiliza FondoGlow y AcabadoGlow tal cual; el reveal de frase no
// reutiliza `Rotulo` de piezas.tsx porque Rotulo no funde de SALIDA (nunca
// lo necesitó — el demo actual solo tiene un rótulo fijo) y no vale la pena
// añadirle esa complejidad a un componente que otras piezas ya usan sin
// necesitarla.

/** Igual de blando que el resto de la identidad — nunca rebote, la pieza posa. */
const POSADO = { damping: 24, stiffness: 140, mass: 0.85 } as const;

export interface FraseKineticaDef {
  /** Fotograma en el que arranca la entrada. */
  inicio: number;
  /** Duración total en pantalla, entrada+salida incluidas. */
  duracion: number;
  antes?: string;
  /** Palabra o grupo de palabras que va en serif itálica con el color de acento. */
  acento: string;
  despues?: string;
}

const SALIDA_FRAMES = 10;

const FraseKinetica: React.FC<{ def: FraseKineticaDef; frameLocal: number; colorAcento: string }> = ({
  def,
  frameLocal,
  colorAcento,
}) => {
  const { fps } = useVideoConfig();
  const p = muelle(frameLocal, fps, 0, POSADO);
  const salida = rampa(frameLocal, def.duracion - SALIDA_FRAMES, def.duracion);

  const opacidad = interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }) * (1 - salida);
  const desenfoqueEntrada = interpolate(p, [0, 0.6], [6, 0], { extrapolateRight: "clamp" });
  const desenfoqueSalida = interpolate(salida, [0, 1], [0, 5]);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translateY(${interpolate(p, [0, 1], [16, 0])}px)`,
        opacity: opacidad,
        filter: `blur(${desenfoqueEntrada + desenfoqueSalida}px)`,
        fontFamily: sans,
        fontSize: 46,
        color: glow.color.texto,
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      {def.antes && <span style={glow.font.sans}>{def.antes} </span>}
      <span style={{ ...glow.font.serifItalica, fontFamily: serif, color: colorAcento }}>{def.acento}</span>
      {def.despues && <span style={glow.font.sans}> {def.despues}</span>}
    </div>
  );
};

export interface EstiloKinetico {
  acento: string;
  acentoSuave: string;
}

/** Rojo cálido — la variante que motivó este archivo. Verde (glow.color.glow) sigue siendo el de producto. */
export const KINETICO_ROJO: EstiloKinetico = {
  acento: "#FF5A45",
  acentoSuave: "rgba(255, 90, 69, 0.16)",
};

export const DURACION_KINETICO_DEMO = 210;

const FRASES_DEMO: FraseKineticaDef[] = [
  { inicio: 0, duracion: 55, antes: "así se ve", acento: "el texto", despues: "en movimiento" },
  { inicio: 50, duracion: 50, acento: "sube", despues: "y se desenfoca al entrar" },
  { inicio: 95, duracion: 55, antes: "listo para", acento: "cualquier titular", despues: "corto" },
  { inicio: 145, duracion: 65, acento: "una frase", despues: "a la vez, nunca dos" },
];

/**
 * Demo de la variante kinética: cuatro frases cortas se suceden en el mismo
 * punto de la pantalla, cada una con su propia entrada y salida. Existe
 * para aprobar la paleta/ritmo antes de anclarla a un guion concreto — igual
 * que GlowDemo en guion.tsx.
 */
export const GlowKineticoDemo: React.FC<{ estilo?: EstiloKinetico }> = ({ estilo = KINETICO_ROJO }) => {
  const frame = useCurrentFrame();
  const camara = camaraEn(frame, DURACION_KINETICO_DEMO, { dx: 30, dy: -18, zoom: 1.03 });

  return (
    <AbsoluteFill>
      <FondoGlow camara={camara} acento={estilo.acento} acentoSuave={estilo.acentoSuave} />
      {FRASES_DEMO.map((def, i) => {
        const frameLocal = frame - def.inicio;
        if (frameLocal < 0 || frameLocal >= def.duracion) return null;
        return <FraseKinetica key={i} def={def} frameLocal={frameLocal} colorAcento={estilo.acento} />;
      })}
      <AcabadoGlow />
    </AbsoluteFill>
  );
};
