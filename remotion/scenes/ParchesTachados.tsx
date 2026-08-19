import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  ChapterMark,
  Eyebrow,
  Headline,
  LineArt,
  PaperBackground,
  StrikeThrough,
  TiraRoja,
} from "../vox/components";
import { beat, ramp, SLAM } from "../vox/motion";
import { vox } from "../vox/theme";
import { CAPAS } from "../capas";

// Capítulo 1 — "El punto ciego de casi todas las empresas".
//
// La nota de producción pide "rótulos rápidos en pantalla: 'más gente',
// 'otro CRM', 'más presión', tachados uno a uno". Eso es exactamente el
// gesto Vox: cada parche entra de golpe, se tacha en rojo, y cuando ya
// están los tres tachados se caen para dejar ver lo que había debajo.
//
// El remate ("síntoma, no causa") es la frase literal del capítulo: se ha
// tratado un síntoma como si fuera la causa.

const PARCHES = ["Más gente", "Otro CRM", "Más presión"] as const;

const PRIMER_PARCHE = 30;
const CADENCIA = 44;
const CAIDA = PRIMER_PARCHE + PARCHES.length * CADENCIA + 24;
const REVELADO = CAIDA + 14;

export const PARCHES_DURACION = REVELADO + 172;

export const ParchesTachados: React.FC<{ src?: string }> = ({ src = CAPAS.parche }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Los tres parches se van a la vez, como quien barre la mesa.
  const caida = ramp(frame, CAIDA, CAIDA + 26);

  return (
    <PaperBackground>
      <div style={{ position: "absolute", left: 148, top: 96, opacity: ramp(frame, 6, 22) }}>
        <Eyebrow>El punto ciego</Eyebrow>
      </div>

      {/* ── Acto 1: los tres parches, tachados uno a uno ── */}
      <div
        style={{
          position: "absolute",
          left: 148,
          top: 232,
          display: "flex",
          flexDirection: "column",
          gap: 34,
          opacity: 1 - caida,
          transform: `translateY(${caida * 300}px)`,
        }}
      >
        {PARCHES.map((parche, i) => {
          const inicio = PRIMER_PARCHE + i * CADENCIA;
          const p = beat({ frame, fps, delay: inicio, config: SLAM });
          const tachado = ramp(frame, inicio + 17, inicio + 33);

          return (
            <div
              key={parche}
              style={{
                position: "relative",
                alignSelf: "flex-start",
                opacity: p,
                transform: `translateX(${(1 - p) * -56}px) scale(${0.94 + p * 0.06})`,
              }}
            >
              <div
                style={{
                  backgroundColor: vox.color.paperCard,
                  border: `2px solid ${vox.color.rule}`,
                  boxShadow: vox.shadow.card,
                  padding: "16px 38px",
                }}
              >
                <Headline size={62} color={tachado > 0.6 ? vox.color.inkSoft : vox.color.ink}>
                  {parche}
                </Headline>
              </div>
              <StrikeThrough progress={tachado} seed={`parche-${i}`} />
            </div>
          );
        })}
      </div>

      {/* ── Acto 2: lo que había debajo ── */}
      <LineArt
        src={src}
        size={620}
        x={168}
        y={236}
        reveal={ramp(frame, REVELADO, REVELADO + 30)}
        seed="parche-art"
      />

      <div style={{ position: "absolute", left: 900, top: 380, width: 880 }}>
        <div
          style={{
            opacity: ramp(frame, REVELADO + 22, REVELADO + 40),
            transform: `translateX(${(1 - ramp(frame, REVELADO + 22, REVELADO + 44)) * 40}px)`,
          }}
        >
          <Headline size={78}>Se arregla la pieza.</Headline>
        </div>
        <div style={{ marginTop: 34 }}>
          <TiraRoja delay={REVELADO + 52} size={54}>
            El sistema sigue igual.
          </TiraRoja>
        </div>
      </div>

      <ChapterMark label="Cap. 1 · El punto ciego" />
    </PaperBackground>
  );
};
