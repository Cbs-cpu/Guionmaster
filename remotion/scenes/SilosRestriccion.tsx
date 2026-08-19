import React from "react";
import { useCurrentFrame } from "remotion";
import {
  ChapterMark,
  Eyebrow,
  Headline,
  LineArt,
  PaperBackground,
  TiraRoja,
} from "../vox/components";
import { ramp } from "../vox/motion";
import { CAPAS } from "../capas";

// Capítulo 4 — "Por qué esto es literalmente lo que hago con Odoo".
//
// El capítulo nombra dos problemas concretos y en este orden: primero los
// silos de información, después el cuello de botella. La animación va en
// dos actos por eso mismo, y no por buscar variedad.
//
// El segundo acto se queda con la idea contraintuitiva del capítulo, que es
// la que más se resiste a entrar: mejorar una parte que no es la restricción
// no mejora el resultado global.

const ACTO2 = 196;

export const SILOS_DURACION = ACTO2 + 196;

export const SilosRestriccion: React.FC = () => {
  const frame = useCurrentFrame();

  const salida = ramp(frame, ACTO2, ACTO2 + 22);
  const acto1 = 1 - salida;

  return (
    <PaperBackground>
      <div style={{ position: "absolute", left: 150, top: 96, opacity: ramp(frame, 6, 22) }}>
        <Eyebrow>{salida > 0.5 ? "La restricción" : "Lo que aparece siempre"}</Eyebrow>
      </div>

      {/* ── Acto 1: silos de información ──
          Las ilustraciones van sueltas, fuera del div del acto: dentro de
          algo con `transform` u `opacity` el multiply se aísla y volverían
          a verse con recuadro blanco. */}
      <LineArt
        src={CAPAS.informacion}
        size={500}
        x={210}
        y={236}
        reveal={ramp(frame, 16, 48)}
        opacity={acto1}
        seed="candado"
      />
      <LineArt
        src={CAPAS.silos}
        size={500}
        x={1010}
        y={236}
        reveal={ramp(frame, 60, 92)}
        opacity={acto1}
        seed="silos"
      />

      <div style={{ opacity: acto1, transform: `translateY(${salida * -70}px)` }}>
        <div
          style={{
            position: "absolute",
            left: 210,
            top: 784,
            width: 500,
            textAlign: "center",
            opacity: ramp(frame, 44, 64),
          }}
        >
          <Headline size={46}>Información atrapada</Headline>
        </div>
        <div
          style={{
            position: "absolute",
            left: 1010,
            top: 784,
            width: 500,
            textAlign: "center",
            opacity: ramp(frame, 88, 108),
          }}
        >
          <Headline size={46}>Cada equipo, su versión</Headline>
        </div>
      </div>

      {/* ── Acto 2: el cuello de botella ── */}
      <LineArt
        src={CAPAS.embudo}
        size={580}
        x={210}
        y={250}
        reveal={ramp(frame, ACTO2 + 10, ACTO2 + 44)}
        opacity={salida}
        seed="embudo"
      />

      <div style={{ opacity: salida }}>
        <div style={{ position: "absolute", left: 900, top: 372, width: 880 }}>
          <div
            style={{
              opacity: ramp(frame, ACTO2 + 28, ACTO2 + 48),
              transform: `translateX(${(1 - ramp(frame, ACTO2 + 28, ACTO2 + 52)) * 44}px)`,
            }}
          >
            <Headline size={74}>Aquí está la restricción.</Headline>
          </div>
          <div style={{ marginTop: 34 }}>
            <TiraRoja delay={ACTO2 + 64} size={46}>
              Mejorar el resto no sirve.
            </TiraRoja>
          </div>
        </div>
      </div>

      <ChapterMark label="Cap. 4 · Silos y restricción" />
    </PaperBackground>
  );
};
