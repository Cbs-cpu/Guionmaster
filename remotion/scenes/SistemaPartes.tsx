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
import { CAPAS } from "../capas";

// Capítulo 2 — "Qué es realmente el pensamiento sistémico".
//
// El capítulo enumera lo que hay que mirar en un sistema y remata diciendo
// que hay dos cosas "que casi nadie mira": los bucles de retroalimentación
// y los retrasos. Esa jerarquía es la que manda en la animación: las tres
// primeras entran en tinta normal y las dos últimas en rojo.
//
// El segundo acto se lo lleva el retraso, que es el concepto que explica
// por qué la causa real queda oculta — y por tanto el que más falta hace
// ver dibujado.

const PIEZAS = [
  { texto: "Entradas", clave: false },
  { texto: "Salidas", clave: false },
  { texto: "Dependencias", clave: false },
  { texto: "Bucles", clave: true },
  { texto: "Retrasos", clave: true },
] as const;

const PRIMERA = 44;
const CADENCIA = 34;
const FIN_LISTA = PRIMERA + PIEZAS.length * CADENCIA;
const ACTO2 = FIN_LISTA + 46;

export const SISTEMA_DURACION = ACTO2 + 190;

export const SistemaPartes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Corte seco entre actos: el papel se retira y entra el siguiente.
  const salida = ramp(frame, ACTO2, ACTO2 + 22);
  const acto1 = 1 - salida;

  return (
    <PaperBackground>
      <div style={{ position: "absolute", left: 150, top: 96, opacity: ramp(frame, 6, 22) }}>
        <Eyebrow>Un sistema</Eyebrow>
      </div>

      {/* ── Acto 1: las partes que hay que mirar ──
          Las ilustraciones van sueltas, fuera del div del acto: si quedaran
          dentro de algo con `transform` u `opacity`, el multiply se aislaría
          y volverían a verse con recuadro blanco. */}
      <LineArt
        src={CAPAS.red}
        size={640}
        x={150}
        y={240}
        reveal={ramp(frame, 14, 44)}
        opacity={acto1}
        seed="red-nodos"
      />

      <div style={{ opacity: acto1, transform: `translateY(${salida * -70}px)` }}>
        <div style={{ position: "absolute", left: 900, top: 268, width: 880 }}>
          {PIEZAS.map((pieza, i) => {
            const p = beat({ frame, fps, delay: PRIMERA + i * CADENCIA, config: SLAM });
            return (
              <div
                key={pieza.texto}
                style={{
                  height: 92,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 22,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 46}px)`,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: pieza.clave ? vox.color.accent : vox.color.rule,
                  }}
                />
                <Headline size={56} color={pieza.clave ? vox.color.accent : vox.color.ink}>
                  {pieza.texto}
                </Headline>
              </div>
            );
          })}

          <div
            style={{
              marginTop: 16,
              opacity: ramp(frame, FIN_LISTA - 10, FIN_LISTA + 12),
            }}
          >
            <Eyebrow color={vox.color.inkSoft}>Las dos que casi nadie mira</Eyebrow>
          </div>
        </div>
      </div>

      {/* ── Acto 2: el retraso ── */}
      <LineArt
        src={CAPAS.retraso}
        size={620}
        x={190}
        y={250}
        reveal={ramp(frame, ACTO2 + 10, ACTO2 + 44)}
        opacity={salida}
        seed="reloj"
      />

      <div style={{ opacity: salida }}>
        <div style={{ position: "absolute", left: 920, top: 400, width: 860 }}>
          <div
            style={{
              opacity: ramp(frame, ACTO2 + 30, ACTO2 + 50),
              transform: `translateX(${(1 - ramp(frame, ACTO2 + 30, ACTO2 + 54)) * 44}px)`,
            }}
          >
            <Headline size={76}>El efecto llega tarde.</Headline>
          </div>
          <div style={{ marginTop: 34 }}>
            <TiraRoja delay={ACTO2 + 66} size={48}>
              Por eso no ves la causa.
            </TiraRoja>
          </div>
        </div>
      </div>

      <ChapterMark label="Cap. 2 · Pensamiento sistémico" />
    </PaperBackground>
  );
};
