import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camaraEn, muelle, rampa } from "../../lienzo/movimiento";
import { glow } from "./estilo";
import { sans, serif } from "./fonts";
import { AcabadoGlow, FondoGlow } from "./piezas";

// Variante "kinético" de la identidad glow: en vez de una tarjeta de
// interfaz con un rótulo fijo debajo (ver guion.tsx / GlowDemo), aquí solo
// hay texto — una frase corta reemplaza a la siguiente en el centro del
// plano, a pantalla completa (fondo horneado, plano de corte — no un
// overlay transparente). Nace de adaptar la paleta de un reel de
// referencia (fondo casi negro + resplandor cálido en vez del verde de
// producto) al motor que ya existe aquí.
//
// Tercera vuelta: LETRA A LETRA, no palabra a palabra — y SIN audio
// horneado en el render. El sonido de tecleo/whoosh ya no vive dentro del
// vídeo: se inserta como clips de audio SUELTOS en el timeline de
// Premiere, en el mismo instante que el vídeo — así quedan editables
// (moverlos, silenciar alguno, bajar volumen) en vez de fijos para
// siempre en un archivo. La lista de qué sonido va en qué segundo la
// calcula `calcularCuesDeSonido` (misma matemática que usa el reveal
// visual, para que audio y letra coincidan exactamente) y la consume
// scripts/render-glow-kinetico.mjs para escribir el "sidecar" que lee el
// panel al insertar (ver premiere/host/index.jsx, sccInsertarConSonidos).

/** Igual de blando que el resto de la identidad — nunca rebote, la pieza posa. */
const POSADO = { damping: 24, stiffness: 140, mass: 0.85 } as const;
/** Fotogramas entre el arranque de una LETRA y la siguiente — el tecleo real. */
export const ESCALONADO_LETRA = 4;
/** Fotogramas que tarda el muelle de una letra en asentarse visualmente, para calcular cuánto dura el plano tras la última letra. */
const ASENTAR_ULTIMA_LETRA = 20;
/** Fotogramas que la frase entera se queda quieta, ya completa, antes de empezar a salir. */
const HOLD_FRAMES = 34;
export const SALIDA_FRAMES = 16;

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

/** Una letra suelta, con su índice de "tecleo" (retardo = índice * ESCALONADO_LETRA). */
interface LetraPlana {
  char: string;
  clave: boolean;
  /** Índice dentro de su palabra (0 = primera letra) — solo para el `key` de React. */
  posEnPalabra: number;
}

/** Aplana los tokens en letras, palabra por palabra (para poder envolver cada palabra en su propio span y que el ajuste de línea no parta una palabra por la mitad). */
function aplanarEnPalabras(tokens: TokenKinetico[]): LetraPlana[][] {
  return tokens.map((tok) =>
    tok.texto.split("").map((char, i) => ({ char, clave: Boolean(tok.clave), posEnPalabra: i }))
  );
}

export interface CueSonido {
  tipo: "tecla" | "whoosh-entrada" | "whoosh-salida";
  /** Fotograma, relativo al arranque de LA FRASE (frame 0 = primer fotograma del plano). */
  frameOffset: number;
}

/**
 * Cuántos fotogramas dura la frase completa y en qué fotograma va cada
 * sonido — la MISMA función que usa el render para el vídeo (mudo) y para
 * el sidecar de audio, así que nunca pueden desincronizarse entre sí.
 * Sin JSX, sin Remotion: es matemática pura, para poder llamarla también
 * desde scripts/render-glow-kinetico.mjs sin arrastrar React.
 */
export function calcularTiemposFrase(tokens: TokenKinetico[]): { duracion: number; cues: CueSonido[] } {
  const totalLetras = tokens.reduce((acc, t) => acc + t.texto.length, 0);
  const duracion = Math.max(1, totalLetras - 1) * ESCALONADO_LETRA + ASENTAR_ULTIMA_LETRA + HOLD_FRAMES + SALIDA_FRAMES;

  const cues: CueSonido[] = [{ tipo: "whoosh-entrada", frameOffset: 0 }];
  let indiceLetraGlobal = 0;
  for (const tok of tokens) {
    for (let i = 0; i < tok.texto.length; i++) {
      if (tok.texto[i] !== " ") {
        cues.push({ tipo: "tecla", frameOffset: indiceLetraGlobal * ESCALONADO_LETRA });
      }
      indiceLetraGlobal++;
    }
  }
  cues.push({ tipo: "whoosh-salida", frameOffset: duracion - SALIDA_FRAMES });

  return { duracion, cues };
}

const LetraKinetica: React.FC<{
  letra: LetraPlana;
  retardo: number;
  colorAcento: string;
}> = ({ letra, retardo, colorAcento }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = muelle(frame, fps, retardo, POSADO);

  const opacidad = interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  const desenfoque = interpolate(p, [0, 0.6], [5, 0], { extrapolateRight: "clamp" });
  const color = letra.clave ? colorAcento : glow.color.texto;

  return (
    <span
      style={{
        display: "inline-block",
        opacity: opacidad,
        filter: desenfoque > 0.1 ? `blur(${desenfoque}px)` : undefined,
        transform: `translateY(${interpolate(p, [0, 1], [10, 0])}px)`,
        fontFamily: letra.clave ? serif : sans,
        fontStyle: letra.clave ? "italic" : "normal",
        color: color,
      }}
    >
      {letra.char}
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
  const palabras = aplanarEnPalabras(def.tokens);

  let indiceLetraGlobal = 0;

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
      {palabras.map((letras, pi) => (
        <span key={pi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {letras.map((letra, li) => {
            const retardo = indiceLetraGlobal * ESCALONADO_LETRA;
            indiceLetraGlobal++;
            return <LetraKinetica key={li} letra={letra} retardo={retardo} colorAcento={colorAcento} />;
          })}
        </span>
      ))}
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

function palabras(frase: string, clave?: string): TokenKinetico[] {
  const claveNorm = clave ? clave.toUpperCase() : null;
  return frase.split(" ").map((texto) => ({ texto, clave: claveNorm ? texto.toUpperCase() === claveNorm : false }));
}

const FRASES_DEMO_TOKENS: TokenKinetico[][] = [
  palabras("así se ve el texto", "texto"),
  palabras("letra a letra", "letra"),
  palabras("listo para cualquier titular", "titular"),
];

function construirDemo(): FraseKineticaDef[] {
  let cursor = 0;
  return FRASES_DEMO_TOKENS.map((tokens) => {
    const { duracion } = calcularTiemposFrase(tokens);
    const def: FraseKineticaDef = { inicio: cursor, duracion, tokens };
    cursor += duracion;
    return def;
  });
}

const FRASES_DEMO = construirDemo();
export const DURACION_KINETICO_DEMO = FRASES_DEMO.reduce((acc, f) => Math.max(acc, f.inicio + f.duracion), 0);

/**
 * Demo de la variante kinética: unas frases cortas se suceden en el mismo
 * punto de la pantalla, cada una con su propia entrada y salida. Existe
 * para aprobar la paleta/ritmo antes de anclarla a un guion concreto — igual
 * que GlowDemo en guion.tsx. Sin audio (ver cabecera del archivo) — para
 * escuchar el tecleo real, hay que insertarlo en Premiere.
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
 * guion.tsx: con fondo para verlo en la web, sin fondo para cuando hiciera
 * falta un overlay transparente (hoy no se usa así, pero se deja la
 * opción — ver GlowKineticoFrase en Root.tsx).
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
