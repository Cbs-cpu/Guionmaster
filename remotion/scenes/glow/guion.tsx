import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { camaraEn } from "../../lienzo/movimiento";
import { Avatar, AcabadoGlow, BotonPildora, FondoGlow, Rotulo, TarjetaUI } from "./piezas";

// Demo de la identidad "glow": un plano de 6s que enseña las piezas — fondo
// con resplandor derivando, una tarjeta de interfaz que entra flotando con
// avatares y un botón, y un rótulo con acento serif itálico.
//
// No está atada a ningún guion todavía (por eso no hay archivo de anclas
// como en scenes/contexto/): existe para que la identidad se pueda ver y
// aprobar antes de construir algo concreto sobre ella.

export const DURACION_DEMO = 180;

export const GlowDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const camara = camaraEn(frame, DURACION_DEMO, { dx: 46, dy: -30, zoom: 1.04 });

  return (
    <AbsoluteFill>
      <FondoGlow camara={camara} anillo />

      <TarjetaUI x={0.5} y={0.46} ancho={0.32} entrada={18} seed="demo">
        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center", padding: "8px 4px" }}>
          <div style={{ display: "flex" }}>
            <Avatar tam={40} tono={10} />
            <div style={{ marginLeft: -12 }}>
              <Avatar tam={40} tono={40} />
            </div>
            <div style={{ marginLeft: -12 }}>
              <Avatar tam={40} tono={70} />
            </div>
          </div>
          <BotonPildora>Empezar ahora</BotonPildora>
        </div>
      </TarjetaUI>

      <Rotulo antes="Hecho para" acento="equipos de producto" x={0.5} y={0.78} tam={38} retardo={40} />

      <AcabadoGlow />
    </AbsoluteFill>
  );
};
