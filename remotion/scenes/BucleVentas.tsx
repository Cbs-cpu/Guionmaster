import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  ChapterMark,
  Eyebrow,
  Flecha,
  Headline,
  LineArt,
  PaperBackground,
  TiraRoja,
} from "../vox/components";
import { beat, paperIdle, ramp, SLAM } from "../vox/motion";
import { STROKE, vox } from "../vox/theme";
import { fontFamily } from "../vox/fonts";
import { CAPAS } from "../capas";

// Capítulo 3 — "Un ejemplo, para que se vea, no solo se entienda".
//
// La nota de producción pide "animación simple del bucle con flecha de
// vuelta", y es la pieza clave del vídeo: el capítulo entero existe para
// que se vea que el problema no está en ninguna de las tres áreas, sino en
// cómo se conectan.
//
// Por eso la flecha de vuelta (los descuentos de atención al cliente, que
// realimentan el volumen que producción no absorbe) entra la última, en
// rojo y despacio: es el momento en el que el diagrama deja de ser una
// cadena y se convierte en un bucle.

const CAJAS = [
  { titulo: "Ventas", x: 150 },
  { titulo: "Producción", x: 760 },
  { titulo: "Atención", x: 1370 },
] as const;

const ANCHO = 400;
const ALTO = 128;
const CAJA_Y = 430;
const CENTRO_Y = CAJA_Y + ALTO / 2;

const T_CAJA = [26, 66, 136];
const T_FLECHA = [50, 120];
const T_ACUMULACION = 92;
const T_VUELTA = 182;
const T_TIRA = 262;

export const BUCLE_DURACION = T_TIRA + 126;

export const BucleVentas: React.FC<{ src?: string }> = ({ src = CAPAS.acumulacion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const vuelta = ramp(frame, T_VUELTA, T_VUELTA + 52);

  return (
    <PaperBackground>
      <div style={{ position: "absolute", left: 150, top: 96, opacity: ramp(frame, 6, 22) }}>
        <Eyebrow>Un ejemplo</Eyebrow>
      </div>

      {/* Lo que se acumula delante del cuello de botella, encima de Producción. */}
      <LineArt
        src={src}
        size={300}
        x={810}
        y={104}
        reveal={ramp(frame, T_ACUMULACION, T_ACUMULACION + 30)}
        seed="acumula"
      />

      <svg
        width={vox.canvas.width}
        height={vox.canvas.height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {/* Cadena de ida: cada área optimiza lo suyo y se lo pasa a la siguiente. */}
        {T_FLECHA.map((inicio, i) => {
          const desde = CAJAS[i].x + ANCHO + 12;
          const hasta = CAJAS[i + 1].x - 12;
          return (
            <Flecha
              key={i}
              d={`M ${desde} ${CENTRO_Y} L ${hasta} ${CENTRO_Y}`}
              progress={ramp(frame, inicio, inicio + 22)}
              head={{ x: hasta, y: CENTRO_Y, angle: 0 }}
              width={STROKE.regular}
            />
          );
        })}

        {/* Flecha de vuelta: los descuentos que cierran el bucle. */}
        <Flecha
          d={`M ${CAJAS[2].x + ANCHO / 2} ${CAJA_Y + ALTO + 10}
              C ${CAJAS[2].x + ANCHO / 2} 830, ${CAJAS[0].x + ANCHO / 2} 830, ${CAJAS[0].x + ANCHO / 2} ${CAJA_Y + ALTO + 14}`}
          progress={vuelta}
          head={{ x: CAJAS[0].x + ANCHO / 2, y: CAJA_Y + ALTO + 14, angle: -Math.PI / 2 }}
          color={vox.color.accent}
          width={STROKE.regular}
        />
      </svg>

      {/* Las tres áreas. */}
      {CAJAS.map((caja, i) => {
        const p = beat({ frame, fps, delay: T_CAJA[i], config: SLAM });
        return (
          <div
            key={caja.titulo}
            style={{
              position: "absolute",
              left: caja.x,
              top: CAJA_Y,
              width: ANCHO,
              height: ALTO,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: vox.color.paperCard,
              border: `2px solid ${vox.color.rule}`,
              boxShadow: vox.shadow.card,
              opacity: p,
              transform: `translateY(${(1 - p) * -46}px) ${paperIdle(frame, `caja-${i}`, 0.3)}`,
            }}
          >
            <Headline size={54}>{caja.titulo}</Headline>
          </div>
        );
      })}

      {/* Etiqueta de la flecha de vuelta. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 848,
          width: vox.canvas.width,
          textAlign: "center",
          opacity: ramp(frame, T_VUELTA + 34, T_VUELTA + 52),
        }}
      >
        <span
          style={{
            ...vox.font.label,
            fontFamily,
            fontSize: 26,
            color: vox.color.accent,
            backgroundColor: vox.color.paper,
            padding: "0 22px",
          }}
        >
          Más descuentos
        </span>
      </div>

      <div style={{ position: "absolute", left: 150, top: 892 }}>
        <TiraRoja delay={T_TIRA} size={46}>
          Nadie diseñó las conexiones.
        </TiraRoja>
      </div>

      <ChapterMark label="Cap. 3 · El bucle" />
    </PaperBackground>
  );
};
