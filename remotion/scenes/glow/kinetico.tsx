import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camaraEn, muelle, rampa } from "../../lienzo/movimiento";
import { glow } from "./estilo";
import { sans, serif } from "./fonts";
import { AcabadoGlow, FondoGlow } from "./piezas";

// Variante "kinético" de la identidad glow: en vez de una tarjeta de
// interfaz con un rótulo fijo debajo (ver guion.tsx / GlowDemo), aquí solo
// hay texto — una frase corta reemplaza a la siguiente en el centro del
// plano. Nace de adaptar la paleta de un reel de referencia (fondo casi
// negro + resplandor cálido en vez del verde de producto) al motor que ya
// existe aquí — no un estilo nuevo, la misma pieza (FondoGlow, AcabadoGlow,
// muelle/rampa) con `acento` distinto.
//
// Segunda vuelta: las palabras salen UNA A UNA (no la frase entera de
// golpe) con un "tecleo" — cada palabra dispara su propio golpe de tecla,
// como el motor de subtítulos (piezas.tsx de scenes/subtitulos/) pero con
// audio real por palabra, no solo el muelle visual.

/** Igual de blando que el resto de la identidad — nunca rebote, la pieza posa. */
const POSADO = { damping: 24, stiffness: 140, mass: 0.85 } as const;
/** Fotogramas entre el arranque de una palabra y la siguiente — tecleo, no cascada lenta. */
const ESCALONADO_PALABRA = 6;
const SALIDA_FRAMES = 10;
/** El sonido de tecla es más corto que el hueco entre palabras, así que no hace falta recortarlo. */
const SFX_TECLA = staticFile("sfx/tecla.mp3");
/** Whoosh de entrada/salida — del pack de recursos (Creator Pack/SFXs/Whooshes). */
const SFX_WHOOSH_ENTRADA = staticFile("sfx/whoosh-entrada.wav");
const SFX_WHOOSH_SALIDA = staticFile("sfx/whoosh-salida.mp3");

export interface TokenKinetico {
  texto: string;
  /** La palabra que lleva el color de acento — normalmente la más importante de la frase. */
  clave?: boolean;
}

export interface FraseKineticaDef {
  /** Fotograma en el que arranca la entrada. */
  inicio: number;
  /** Duración total en pantalla, entrada+salida incluidas. */
  duracion: number;
  tokens: TokenKinetico[];
}

const PalabraKinetica: React.FC<{
  texto: string;
  clave: boolean;
  retardo: number;
  colorAcento: string;
}> = ({ texto, clave, retardo, colorAcento }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = muelle(frame, fps, retardo, POSADO);

  const opacidad = interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  const desenfoque = interpolate(p, [0, 0.6], [6, 0], { extrapolateRight: "clamp" });
  const color = clave ? colorAcento : glow.color.texto;

  return (
    <span
      style={{
        display: "inline-block",
        opacity: opacidad,
        filter: desenfoque > 0.1 ? `blur(${desenfoque}px)` : undefined,
        transform: `translateY(${interpolate(p, [0, 1], [14, 0])}px)`,
        fontFamily: clave ? serif : sans,
        fontStyle: clave ? "italic" : "normal",
        color: color,
      }}
    >
      {texto}
    </span>
  );
};

const FraseKinetica: React.FC<{ def: FraseKineticaDef; frameLocal: number; colorAcento: string }> = ({
  def,
  frameLocal,
  colorAcento,
}) => {
  const salida = rampa(frameLocal, def.duracion - SALIDA_FRAMES, def.duracion);
  const desenfoqueSalida = interpolate(salida, [0, 1], [0, 5]);

  return (
    <div
      style={{
        position: "absolute",
        left: "8%",
        right: "8%",
        top: "50%",
        transform: "translateY(-50%)",
        opacity: 1 - salida,
        filter: desenfoqueSalida > 0.1 ? `blur(${desenfoqueSalida}px)` : undefined,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.3em 0.3em",
        fontFamily: sans,
        fontSize: 46,
        lineHeight: 1.2,
        textAlign: "center",
      }}
    >
      {def.tokens.map((tok, i) => {
        const retardo = i * ESCALONADO_PALABRA;
        return (
          <React.Fragment key={i}>
            <PalabraKinetica texto={tok.texto} clave={Boolean(tok.clave)} retardo={retardo} colorAcento={colorAcento} />
            {/* Un golpe de tecla por palabra, disparado justo cuando arranca su muelle. */}
            {frameLocal >= retardo && frameLocal < retardo + 6 && <Audio src={SFX_TECLA} startFrom={0} volume={0.7} />}
          </React.Fragment>
        );
      })}
      {/* Whoosh de entrada (frame 0) y de salida (arrancando la ventana de
          salida, no al final exacto — así el whoosh ya está sonando cuando
          el plano termina de desvanecerse, no empieza después). Volumen
          más bajo que el tecleo: son la cama, no el protagonista. */}
      {frameLocal === 0 && <Audio src={SFX_WHOOSH_ENTRADA} volume={0.5} />}
      {frameLocal === def.duracion - SALIDA_FRAMES && <Audio src={SFX_WHOOSH_SALIDA} volume={0.55} />}
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

/** Amarillo de marca (#FFC300, igual que remotion/scenes/contexto/) — para anclar este motor a un vídeo de la identidad Modula. */
export const KINETICO_AMARILLO: EstiloKinetico = {
  acento: "#FFC300",
  acentoSuave: "rgba(255, 195, 0, 0.16)",
};

export const DURACION_KINETICO_DEMO = 210;

function palabras(frase: string, clave?: string): TokenKinetico[] {
  const claveNorm = clave ? clave.toUpperCase() : null;
  return frase.split(" ").map((texto) => ({ texto, clave: claveNorm ? texto.toUpperCase() === claveNorm : false }));
}

const FRASES_DEMO: FraseKineticaDef[] = [
  { inicio: 0, duracion: 55, tokens: palabras("así se ve el texto", "texto") },
  { inicio: 50, duracion: 50, tokens: palabras("sube y se desenfoca", "sube") },
  { inicio: 95, duracion: 55, tokens: palabras("listo para cualquier titular", "titular") },
  { inicio: 145, duracion: 65, tokens: palabras("una frase a la vez", "frase") },
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

/**
 * Composición genérica: UNA sola frase por render (no una secuencia de
 * varias como el demo) — es la que usa el render de un ancla concreta de
 * un vídeo real. `fondoPreview` sigue el mismo contrato que subtitulos/
 * guion.tsx: con fondo para verlo en la web, sin fondo (canal alfa) para
 * el archivo que se monta en Premiere.
 */
export const GlowKineticoFrase: React.FC<{
  tokens: TokenKinetico[];
  duracion: number;
  estilo?: EstiloKinetico;
  fondoPreview?: boolean;
}> = ({ tokens, duracion, estilo = KINETICO_AMARILLO, fondoPreview = true }) => {
  const frame = useCurrentFrame();
  const camara = camaraEn(frame, duracion, { dx: 14, dy: -8, zoom: 1.015 });
  const def: FraseKineticaDef = { inicio: 0, duracion, tokens };

  return (
    <AbsoluteFill>
      {fondoPreview && <FondoGlow camara={camara} acento={estilo.acento} acentoSuave={estilo.acentoSuave} />}
      <FraseKinetica def={def} frameLocal={frame} colorAcento={estilo.acento} />
      {fondoPreview && <AcabadoGlow />}
    </AbsoluteFill>
  );
};
