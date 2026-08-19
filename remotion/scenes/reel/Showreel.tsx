import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../../vox/fonts";
import { showreel } from "./estilo";
import { ARRANQUES, DURACION_TOTAL, ReelLimpio } from "./guion";

// Envoltorio de showreel: el 9:16 montado sobre fondo negro morado, con borde
// neón y un panel falso de línea de tiempo de After Effects debajo, inclinado
// en perspectiva.
//
// Es la capa de "mira cómo está hecho" de la referencia, y su gracia es que no
// duplica nada: mete dentro el mismo <ReelLimpio /> que se publica como reel.
// Si cambia una escena, cambian las dos composiciones a la vez.
//
// Detalle que parece menor y no lo es: la tarjeta escala el reel con
// `transform`, lo que crea un stacking context nuevo. Los objetos del reel
// usan `mixBlendMode: multiply` y necesitan tener debajo el papel con el que
// mezclarse — como el papel viaja DENTRO del subárbol escalado, el blend sigue
// funcionando. Sacar el fondo fuera de la tarjeta dejaría los objetos blancos.

const TARJETA = { x: 140, y: 58, ancho: 800 } as const;
const PANEL = { x: 46, y: 1524, ancho: 988, alto: 344 } as const;

/** Deriva lenta y continua, para que nada quede clavado como una captura. */
function deriva(frame: number, semilla: string, amplitud: number): number {
  const fase = random(semilla) * Math.PI * 2;
  const velocidad = 0.008 + random(`${semilla}-v`) * 0.005;
  return Math.sin(frame * velocidad + fase) * amplitud;
}

// ─────────────────────────────────────────────────────────────────────────
// Panel falso de línea de tiempo
// ─────────────────────────────────────────────────────────────────────────

const FILAS = 21;
const ALTO_FILA = 13;
const ANCHO_LISTA = 0.36;

interface Fila {
  color: string;
  inicio: number;
  ancho: number;
  claves: number[];
  sangria: number;
  anchoNombre: number;
  esCabecera: boolean;
}

/**
 * Filas de la línea de tiempo, derivadas de la escena que se está viendo.
 *
 * Cambian de una escena a otra a propósito: en la referencia el proyecto de
 * After Effects se ve distinto en cada plano, porque cada plano es una
 * composición distinta. Si las barras fueran siempre las mismas, el panel se
 * leería como un adorno pegado encima en vez de como el proyecto real.
 */
function filasDe(escena: number): Fila[] {
  return Array.from({ length: FILAS }, (_, i) => {
    const r = (k: string) => random(`ae-${escena}-${i}-${k}`);
    const esCabecera = r("h") > 0.78;
    const inicio = r("a") * 0.34;
    return {
      color: showreel.barras[Math.floor(r("c") * showreel.barras.length)],
      inicio,
      ancho: 0.3 + r("w") * (0.96 - inicio - 0.3),
      claves: Array.from({ length: Math.floor(r("k") * 4) }, (_, j) => 0.1 + r(`k${j}`) * 0.8),
      sangria: esCabecera ? 0 : Math.floor(r("s") * 3) * 7,
      // Nombres cortos: en After Effects las capas se llaman "Shape Layer 3",
      // no ocupan media columna. Con barras largas la lista se lee como
      // rayado de televisión en vez de como una lista de capas.
      anchoNombre: 0.18 + r("n") * 0.34,
      esCabecera,
    };
  });
}

const PanelTimeline: React.FC<{ escena: number; progreso: number }> = ({ escena, progreso }) => {
  const filas = filasDe(escena);
  const anchoLista = PANEL.ancho * ANCHO_LISTA;
  const anchoPista = PANEL.ancho - anchoLista;

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Columna de capas */}
      <div
        style={{
          width: anchoLista,
          backgroundColor: showreel.panel.lista,
          paddingTop: 16,
          flexShrink: 0,
        }}
      >
        {filas.map((fila, i) => (
          <div
            key={i}
            style={{
              height: ALTO_FILA,
              display: "flex",
              alignItems: "center",
              gap: 4,
              paddingLeft: 6 + fila.sangria,
              paddingRight: 6,
              backgroundColor: i % 2 ? showreel.panel.fila : showreel.panel.filaAlt,
            }}
          >
            {/* Los interruptores de ojo / solo / bloqueo de cada capa. */}
            {[0, 1, 2, 3].map((k) => (
              <div
                key={k}
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: random(`sw-${escena}-${i}-${k}`) > 0.5 ? "#6E6E6E" : "#3A3A3A",
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
            ))}
            <div
              style={{
                width: 6,
                height: 6,
                backgroundColor: fila.color,
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                height: 4,
                width: `${fila.anchoNombre * 100}%`,
                backgroundColor: fila.esCabecera ? showreel.panel.texto : showreel.panel.textoTenue,
                borderRadius: 2,
              }}
            />
            {/* Columnas de modo de fusión y padre, a la derecha de la lista:
                son las que hacen que se lea como el panel de After Effects y
                no como una lista genérica. */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 5, flexShrink: 0 }}>
              {[0, 1].map((k) => (
                <div
                  key={k}
                  style={{
                    width: 16 + random(`v-${escena}-${i}-${k}`) * 10,
                    height: 4,
                    backgroundColor: "#4A4A4A",
                    borderRadius: 1,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Columna de pistas */}
      <div style={{ flex: 1, position: "relative", backgroundColor: showreel.panel.fondo }}>
        {/* Regla de tiempo */}
        <div
          style={{
            height: 16,
            borderBottom: "1px solid #333",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          {Array.from({ length: 26 }, (_, i) => (
            <div
              key={i}
              style={{
                width: anchoPista / 26,
                height: i % 5 === 0 ? 7 : 4,
                borderLeft: `1px solid ${i % 5 === 0 ? "#585858" : "#3B3B3B"}`,
              }}
            />
          ))}
        </div>

        {filas.map((fila, i) => (
          <div
            key={i}
            style={{
              height: ALTO_FILA,
              position: "relative",
              backgroundColor: i % 2 ? showreel.panel.fila : showreel.panel.filaAlt,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${fila.inicio * 100}%`,
                top: 2,
                width: `${fila.ancho * 100}%`,
                height: ALTO_FILA - 4,
                backgroundColor: fila.color,
                opacity: 0.85,
                borderRadius: 1,
              }}
            />
            {fila.claves.map((k, j) => (
              <div
                key={j}
                style={{
                  position: "absolute",
                  left: `${k * 100}%`,
                  top: ALTO_FILA / 2 - 3,
                  width: 5,
                  height: 5,
                  backgroundColor: "#D8D8D8",
                  transform: "rotate(45deg)",
                }}
              />
            ))}
          </div>
        ))}

        {/* Cabezal de reproducción: la única cosa del panel que va sincronizada
            de verdad con el vídeo, y por eso la que vende que está sonando. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${progreso * 100}%`,
            width: 1.5,
            backgroundColor: showreel.panel.playhead,
          }}
        >
          <div
            style={{
              width: 9,
              height: 7,
              marginLeft: -3.75,
              backgroundColor: showreel.panel.playhead,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Composición
// ─────────────────────────────────────────────────────────────────────────

export const Showreel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const altoTarjeta = (TARJETA.ancho * 16) / 9;
  const escalaReel = TARJETA.ancho / width;
  const progreso = Math.min(1, frame / DURACION_TOTAL);

  let escena = 0;
  for (let i = 0; i < ARRANQUES.length; i++) if (frame >= ARRANQUES[i]) escena = i;

  // Entrada del conjunto: el marco aparece con un fundido corto para no
  // arrancar en negro absoluto.
  const entrada = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: showreel.fondo, fontFamily }}>
      {/* Halo morado. Dos manchas de distinto tamaño y no centradas: un solo
          degradado radial simétrico se lee como un fondo de plantilla. */}
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(60% 34% at 2% ${46 + deriva(frame, "halo1", 3)}%, ${showreel.glowLejos}, transparent 72%)`,
            `radial-gradient(46% 26% at 96% 74%, rgba(124, 44, 191, 0.34), transparent 70%)`,
            `radial-gradient(120% 60% at 50% 42%, rgba(96, 32, 150, 0.28), transparent 68%)`,
            `linear-gradient(168deg, ${showreel.fondoAlto} 0%, ${showreel.fondo} 55%)`,
          ].join(", "),
        }}
      />

      {/* Tarjeta con el reel */}
      <div
        style={{
          position: "absolute",
          left: TARJETA.x,
          top: TARJETA.y + deriva(frame, "tarjeta", 4),
          width: TARJETA.ancho,
          height: altoTarjeta,
          borderRadius: 20,
          border: `2.5px solid ${showreel.borde}`,
          boxShadow: [
            `0 0 2px ${showreel.borde}`,
            `0 0 26px rgba(199, 125, 255, 0.55)`,
            `0 0 84px rgba(124, 44, 191, 0.5)`,
            `0 0 170px rgba(124, 44, 191, 0.34)`,
          ].join(", "),
          overflow: "hidden",
          opacity: entrada,
        }}
      >
        <div
          style={{
            width,
            height: (width * 16) / 9,
            transform: `scale(${escalaReel})`,
            transformOrigin: "0 0",
          }}
        >
          <ReelLimpio />
        </div>
      </div>

      {/* Panel de línea de tiempo, tumbado hacia atrás */}
      <div
        style={{
          position: "absolute",
          left: PANEL.x,
          top: PANEL.y + deriva(frame, "panel", 3),
          width: PANEL.ancho,
          height: PANEL.alto,
          perspective: 1250,
          opacity: entrada,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `rotateX(${17 + deriva(frame, "rot", 0.7)}deg) rotateZ(-0.5deg)`,
            transformOrigin: "50% 0%",
            borderRadius: 12,
            border: `2.5px solid ${showreel.borde}`,
            boxShadow: [
              `0 0 2px ${showreel.borde}`,
              `0 0 24px rgba(199, 125, 255, 0.5)`,
              `0 0 76px rgba(124, 44, 191, 0.45)`,
            ].join(", "),
            overflow: "hidden",
            backgroundColor: showreel.panel.fondo,
          }}
        >
          <PanelTimeline escena={escena} progreso={progreso} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
