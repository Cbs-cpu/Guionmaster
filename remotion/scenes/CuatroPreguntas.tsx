import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  ChapterMark,
  Eyebrow,
  Headline,
  LineArt,
  PaperBackground,
  TiraRoja,
} from "../vox/components";
import { beat, ramp, SLAM } from "../vox/motion";
import { vox } from "../vox/theme";
import { fontFamily } from "../vox/fonts";
import { CAPAS } from "../capas";

// Capítulo 6 — "Cómo empezar a pensarlo en tu propia empresa".
//
// La nota de producción pide las cuatro preguntas en pantalla, una por una.
// Se añade lo que el propio capítulo dice que revela cada una (cuello de
// botella, dependencia, bucle, silo) como etiqueta roja: es la parte que
// convierte la lista de preguntas en un diagnóstico, y sin ella las cuatro
// preguntas se quedan en algo que suena bien y no se usa.

const PREGUNTAS = [
  { pregunta: "¿Dónde se acumula el trabajo?", revela: "Cuello de botella" },
  { pregunta: "¿A quién esperas para avanzar?", revela: "Dependencia" },
  { pregunta: "¿Qué se decide sin avisar?", revela: "Bucle" },
  { pregunta: "¿Qué dato está duplicado?", revela: "Silo" },
] as const;

const PRIMERA = 44;
const CADENCIA = 58;
const FIN = PRIMERA + PREGUNTAS.length * CADENCIA;

export const PREGUNTAS_DURACION = FIN + 168;

export const CuatroPreguntas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <PaperBackground>
      <div style={{ position: "absolute", left: 150, top: 96, opacity: ramp(frame, 6, 22) }}>
        <Eyebrow>Cuatro preguntas</Eyebrow>
      </div>

      <LineArt
        src={CAPAS.lupa}
        size={540}
        x={170}
        y={286}
        reveal={ramp(frame, 14, 46)}
        seed="lupa"
      />

      <div style={{ position: "absolute", left: 820, top: 232, width: 980 }}>
        {PREGUNTAS.map(({ pregunta, revela }, i) => {
          const inicio = PRIMERA + i * CADENCIA;
          const p = beat({ frame, fps, delay: inicio, config: SLAM });
          const etiqueta = ramp(frame, inicio + 16, inicio + 32);

          return (
            <div
              key={pregunta}
              style={{
                height: 140,
                opacity: p,
                transform: `translateX(${(1 - p) * 44}px)`,
              }}
            >
              <Headline size={50}>{pregunta}</Headline>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: etiqueta,
                }}
              >
                <div style={{ width: 26 * etiqueta, height: 3, backgroundColor: vox.color.accent }} />
                <span
                  style={{
                    ...vox.font.label,
                    fontFamily,
                    fontSize: 22,
                    color: vox.color.accent,
                  }}
                >
                  {revela}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 170, top: 890 }}>
        <TiraRoja delay={FIN + 18} size={44}>
          No es falta de recursos.
        </TiraRoja>
      </div>

      <ChapterMark label="Cap. 6 · Las cuatro preguntas" />
    </PaperBackground>
  );
};
