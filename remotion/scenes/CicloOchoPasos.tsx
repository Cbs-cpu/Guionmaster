import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ChapterMark, Eyebrow, Headline, LineArt, PaperBackground } from "../vox/components";
import { CAPAS } from "../capas";
import { beat, paperIdle, ramp, SLAM, SNAP } from "../vox/motion";
import { STROKE, vox } from "../vox/theme";
import { fontFamily } from "../vox/fonts";

// Capítulo 5 — "El método, paso a paso".
//
// La nota de producción del capítulo pide literalmente esto: el ciclo de 8
// segmentos con engranaje central "con las 8 palabras superpuestas como
// texto en pantalla (no dentro de la imagen)". Así que la imagen generada
// con Kie.ai se usa tal cual como ilustración, y las palabras las pone
// Remotion encima — que además es la única forma de que se lean bien y de
// que vayan apareciendo al ritmo del que habla.
//
// El remate no es decorativo: el capítulo termina diciendo que un sistema
// bien diseñado "no es un proyecto que termina", y por eso el anillo cierra
// dando una vuelta completa antes del rótulo final.

const PASOS = [
  "Observar",
  "Mapear",
  "Entender",
  "Diagnosticar",
  "Diseñar",
  "Implementar",
  "Medir",
  "Optimizar",
] as const;

/** Fotograma en el que entra cada paso. */
const PRIMER_PASO = 46;
const CADENCIA = 38;
const ULTIMO_PASO = PRIMER_PASO + (PASOS.length - 1) * CADENCIA;
/** A partir de aquí el anillo cierra la vuelta y entra el rótulo final. */
const CIERRE = ULTIMO_PASO + 40;

export const CICLO_DURACION = CIERRE + 132;

export const CicloOchoPasos: React.FC<{ src?: string }> = ({ src = CAPAS.ciclo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cuántos pasos se han "encendido" ya, con decimales para que el anillo
  // avance de forma continua en vez de a saltos.
  const avance = Math.max(0, Math.min(PASOS.length, (frame - PRIMER_PASO) / CADENCIA + 1));

  // Vuelta de cierre: el anillo se completa del todo y late una vez.
  const cierre = ramp(frame, CIERRE, CIERRE + 34);
  const progresoAnillo = Math.max(avance / PASOS.length, cierre);

  // El anillo orbita justo por fuera de las flechas dibujadas en la imagen
  // (que llegan hasta ~0.42 del lado), sin llegar a tocarlas.
  const LADO = 700;
  const RADIO = 320;
  const CENTRO = { x: 478, y: 548 };

  return (
    <PaperBackground>
      {/* ── Columna izquierda: la ilustración generada + el anillo de avance ── */}
      <LineArt
        src={src}
        size={LADO}
        x={CENTRO.x - LADO / 2}
        y={CENTRO.y - LADO / 2}
        reveal={ramp(frame, 12, 40)}
        seed="ciclo-art"
      />

      <svg
        width={vox.canvas.width}
        height={vox.canvas.height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <g transform={`rotate(-90 ${CENTRO.x} ${CENTRO.y})`}>
          {/* Pauta del anillo: por dónde va a pasar el rojo. */}
          <circle
            cx={CENTRO.x}
            cy={CENTRO.y}
            r={RADIO}
            fill="none"
            stroke={vox.color.rule}
            strokeWidth={STROKE.hairline}
            opacity={ramp(frame, 20, 44) * 0.8}
          />
          {/* Avance rojo, un octavo por paso. */}
          <circle
            cx={CENTRO.x}
            cy={CENTRO.y}
            r={RADIO}
            fill="none"
            stroke={vox.color.accent}
            strokeWidth={7}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progresoAnillo}
          />
        </g>

        {/* Marcas de los 8 segmentos, para que se vea que son ocho y no un aro. */}
        {PASOS.map((_, i) => {
          const ang = (i / PASOS.length) * Math.PI * 2 - Math.PI / 2;
          const encendido = avance > i + 0.5;
          const r1 = RADIO - 13;
          const r2 = RADIO + 13;
          return (
            <line
              key={i}
              x1={CENTRO.x + Math.cos(ang) * r1}
              y1={CENTRO.y + Math.sin(ang) * r1}
              x2={CENTRO.x + Math.cos(ang) * r2}
              y2={CENTRO.y + Math.sin(ang) * r2}
              stroke={encendido ? vox.color.accent : vox.color.rule}
              strokeWidth={encendido ? 4 : STROKE.hairline}
              opacity={ramp(frame, 20, 44)}
            />
          );
        })}
      </svg>

      {/* ── Columna derecha: los ocho pasos, uno por uno ── */}
      <div style={{ position: "absolute", left: 980, top: 128, width: 860 }}>
        <div style={{ opacity: ramp(frame, 6, 22) }}>
          <Eyebrow>El método</Eyebrow>
          <div
            style={{
              height: 3,
              width: `${ramp(frame, 14, 34) * 100}%`,
              backgroundColor: vox.color.ink,
              marginTop: 14,
              marginBottom: 26,
            }}
          />
        </div>

        {PASOS.map((paso, i) => {
          const inicio = PRIMER_PASO + i * CADENCIA;
          const p = beat({ frame, fps, delay: inicio, config: SLAM });
          // Mientras se van nombrando, el paso activo va en tinta plena y
          // los ya dichos se apagan, para que la vista caiga siempre en el
          // que se está diciendo. Cuando ya están los ocho, vuelven todos a
          // tinta plena: el último plano se queda fijo bastante rato en el
          // montaje y ahí interesa poder leer el método entero de un vistazo.
          const completo = avance >= PASOS.length;
          const esActivo = !completo && avance >= i + 1 && avance < i + 2;
          const apagado = completo
            ? 0
            : ramp(frame, inicio + CADENCIA, inicio + CADENCIA + 16);

          return (
            <div
              key={paso}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 26,
                height: 88,
                opacity: p,
                transform: `translateX(${(1 - p) * 44}px)`,
              }}
            >
              <div
                style={{
                  fontFamily,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: esActivo ? vox.color.accent : vox.color.inkFaint,
                  width: 44,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <Headline
                size={52}
                color={apagado > 0.5 ? vox.color.inkSoft : vox.color.ink}
                style={{ opacity: apagado > 0.5 ? 0.55 : 1 }}
              >
                {paso}
              </Headline>
            </div>
          );
        })}

        {/* Remate: la frase del capítulo, en tira de papel rojo. */}
        <div
          style={{
            marginTop: 26,
            opacity: beat({ frame, fps, delay: CIERRE + 18, config: SNAP }),
            transform: `translateY(${(1 - beat({ frame, fps, delay: CIERRE + 18, config: SLAM })) * -34}px) ${paperIdle(frame, "tira", 0.25)}`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: vox.color.accent,
              color: vox.color.paper,
              padding: "18px 34px",
              boxShadow: vox.shadow.cardLifted,
              ...vox.font.display,
              fontFamily,
              fontSize: 40,
            }}
          >
            No termina. Se repite.
          </div>
        </div>
      </div>

      <ChapterMark label="Cap. 5 · El método" />
    </PaperBackground>
  );
};
