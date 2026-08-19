import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { PaletaProvider } from "../../lienzo/paleta";
import { Camara, camaraEn } from "../../lienzo/movimiento";
import {
  Acabado,
  AjustesFondo,
  DefCapa,
  LineaTexto,
  Nota,
  Objeto,
  Papel,
  Titular,
} from "../../lienzo/piezas";
import { capa } from "./capas";
import { PALETA_REEL, reel } from "./estilo";

// El guion del reel: qué se ve en cada plano y cómo se mueve.
//
// Toda la pieza está descrita aquí como datos, no como componentes sueltos.
// Retocar el ritmo o mover un objeto es cambiar un número en esta tabla, no
// tocar JSX — que es lo que hace que se pueda iterar rápido sobre el montaje
// sin romper nada.
//
// Los planos duran lo que duran en la referencia, medido fotograma a
// fotograma: 115 / 80 / 85 / 70 / 70 = 420 = 14,0 s exactos a 30 fps.

/** Párrafo de relleno de la escena de Bitcoin. Va tal cual en la referencia. */
const NOTA_BITCOIN =
  "Bitcoin is a new type of digital money that lets people send cash " +
  "online without any banks or central governments.s";

export interface DefNota {
  texto: string;
  x: number;
  y: number;
  ancho?: number;
  retardo?: number;
}

export interface DefEscena {
  id: string;
  duracion: number;
  camara: Camara;
  fondo?: AjustesFondo;
  capas: DefCapa[];
  titular: {
    lineas: LineaTexto[];
    x: number;
    y: number;
    retardo?: number;
    centrado?: boolean;
    ancho?: number;
  };
  notas?: DefNota[];
}

export const ESCENAS: DefEscena[] = [
  // ── 1. El plano de apertura: papel vacío, solo tipografía ──────────────
  {
    id: "peticion",
    duracion: 115,
    camara: { dx: 44, dy: -76, zoom: 1.05 },
    fondo: { arco: null, semilla: "peticion" },
    capas: [],
    titular: {
      x: 0.1,
      y: 0.44,
      centrado: true,
      retardo: 10,
      lineas: [
        {
          tam: 62,
          corridas: [
            { texto: "Client ask : neat and ", peso: 400 },
            { texto: "clean", peso: 800 },
          ],
        },
        { tam: 62, corridas: [{ texto: "animation...", peso: 800 }] },
      ],
    },
  },

  // ── 2. El millón: fajos de billetes cruzando en diagonal ───────────────
  {
    id: "millon",
    duracion: 80,
    camara: { dx: -92, dy: 128, zoom: 1.06 },
    fondo: { arco: null, semilla: "millon" },
    capas: [
      {
        capa: "billetes_pila",
        x: -0.04,
        y: 0.96,
        tam: 0.62,
        rot: -6,
        desenfoque: 10,
        profundidad: 2.2,
        desdeY: 0.26,
      },
      {
        capa: "billetes_abanico",
        x: 0.86,
        y: 0.92,
        tam: 0.5,
        rot: 14,
        desenfoque: 8,
        profundidad: 1.9,
        entrada: 6,
        desdeX: 0.2,
      },
      {
        capa: "billetes_fajo_lado",
        x: 0.11,
        y: 0.56,
        tam: 0.5,
        rot: 8,
        desenfoque: 2,
        profundidad: 1.35,
        entrada: 3,
        desdeX: -0.22,
        desdeY: 0.12,
      },
      {
        capa: "billetes_fajo",
        x: 0.79,
        y: 0.19,
        tam: 0.44,
        rot: -10,
        profundidad: 1,
        desdeX: 0.25,
        desdeY: -0.1,
      },
    ],
    titular: {
      x: 0.12,
      y: 0.33,
      retardo: 6,
      lineas: [
        { tam: 54, peso: 500, color: reel.color.tintaLinea, corridas: [{ texto: "You're Making" }] },
        { tam: 118, peso: 800, tracking: "-0.035em", corridas: [{ texto: "1 MILLION" }] },
        {
          tam: 62,
          peso: 700,
          sangria: 120,
          margenSuperior: -6,
          corridas: [{ texto: "Dollars" }],
        },
      ],
    },
  },

  // ── 3. Bitcoin: moneda nítida al centro, dos copias fuera de foco ──────
  {
    id: "bitcoin",
    duracion: 85,
    camara: { dx: 72, dy: -112, zoom: 1.05 },
    fondo: { arco: null, semilla: "bitcoin" },
    capas: [
      // El bokeh tiene que seguir siendo reconocible: si se pasa de desenfoque,
      // la moneda deja de leerse como moneda y se convierte en una mancha
      // dorada. En la referencia las copias de primer plano están fuera de
      // foco pero se les distingue el canto y la B.
      {
        capa: "moneda_par",
        x: 0.82,
        y: 0.92,
        tam: 0.6,
        desenfoque: 11,
        profundidad: 2.3,
        desdeY: 0.2,
      },
      {
        capa: "moneda_inclinada",
        x: 0.03,
        y: 0.04,
        tam: 0.44,
        desenfoque: 9,
        profundidad: 1.8,
        entrada: 2,
        desdeX: -0.15,
      },
      {
        capa: "moneda_frontal",
        x: 0.4,
        y: 0.32,
        tam: 0.5,
        profundidad: 1,
        desdeY: -0.12,
      },
    ],
    notas: [
      { texto: NOTA_BITCOIN, x: 0.34, y: 0.18, ancho: 0.3, retardo: 12 },
      { texto: NOTA_BITCOIN, x: 0.13, y: 0.6, ancho: 0.28, retardo: 20 },
    ],
    titular: {
      x: 0.13,
      y: 0.44,
      retardo: 6,
      lineas: [
        { tam: 54, peso: 500, color: reel.color.tintaLinea, corridas: [{ texto: "Using" }] },
        { tam: 108, peso: 800, tracking: "-0.03em", corridas: [{ texto: "BITCOIN" }] },
      ],
    },
  },

  // ── 4. El farol: primera escena con arco y vegetación ──────────────────
  {
    id: "brillo",
    duracion: 70,
    camara: { dx: -62, dy: -94, zoom: 1.05 },
    fondo: { arco: -12, semilla: "brillo" },
    capas: [
      {
        capa: "rama_baja",
        x: 0.12,
        y: 0.9,
        tam: 0.7,
        desenfoque: 9,
        profundidad: 1.9,
        desdeY: 0.18,
      },
      {
        capa: "rama_alta",
        x: 0.86,
        y: 0.04,
        tam: 0.76,
        desenfoque: 2,
        profundidad: 1.2,
        entrada: 2,
        desdeY: -0.15,
      },
      {
        capa: "hojas_sueltas",
        x: 0.63,
        y: 0.27,
        tam: 0.26,
        desenfoque: 4,
        profundidad: 1.5,
        entrada: 10,
        desdeX: 0.1,
      },
      {
        capa: "farol",
        x: 0.17,
        y: 0.38,
        tam: 0.82,
        profundidad: 1,
        desdeX: -0.18,
      },
    ],
    titular: {
      x: 0.42,
      y: 0.39,
      retardo: 5,
      lineas: [
        {
          tam: 50,
          peso: 500,
          color: reel.color.tintaLinea,
          corridas: [{ texto: "True value always" }],
        },
        {
          tam: 104,
          peso: 800,
          color: reel.color.tintaGris,
          tracking: "-0.03em",
          corridas: [{ texto: "Shine" }],
        },
      ],
    },
  },

  // ── 5. El cuadro: cierre. El último plano se queda quieto para congelar ─
  {
    id: "detras",
    duracion: 70,
    camara: { dx: 84, dy: 96, zoom: 1.06 },
    fondo: { arco: 8, semilla: "detras" },
    capas: [
      {
        capa: "rama_baja",
        x: 0.08,
        y: 0.84,
        tam: 0.72,
        desenfoque: 9,
        profundidad: 1.9,
        desdeY: 0.16,
      },
      {
        capa: "marco_esquina",
        x: 0.96,
        y: 0.72,
        tam: 0.46,
        desenfoque: 11,
        profundidad: 2.3,
        entrada: 4,
        desdeX: 0.18,
      },
      {
        capa: "rama_alta",
        x: 0.58,
        y: 0.02,
        tam: 0.74,
        desenfoque: 2,
        profundidad: 1.2,
        entrada: 2,
        desdeY: -0.12,
      },
      {
        capa: "cuadro_frontal",
        x: 0.72,
        y: 0.31,
        tam: 0.7,
        rot: 3,
        profundidad: 1,
        desdeX: 0.2,
      },
    ],
    titular: {
      x: 0.09,
      y: 0.39,
      retardo: 5,
      lineas: [
        {
          tam: 48,
          peso: 500,
          color: reel.color.tintaLinea,
          corridas: [{ texto: "Mastermind is always" }],
        },
        {
          tam: 96,
          peso: 800,
          color: reel.color.tintaGris,
          tracking: "-0.03em",
          corridas: [{ texto: "BEHIND" }],
        },
      ],
    },
  },
];

export const DURACION_TOTAL = ESCENAS.reduce((n, e) => n + e.duracion, 0);

/** Fotograma en el que arranca cada escena, acumulado. */
export const ARRANQUES = ESCENAS.reduce<number[]>((acc, e, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + ESCENAS[i - 1].duracion);
  return acc;
}, []);

/**
 * Un plano completo.
 *
 * El orden de los hijos es el orden de pintado, y con `mixBlendMode` eso
 * importa: el papel va primero porque es el fondo contra el que multiplican
 * los objetos. Dentro de `capas`, las de más profundidad se listan antes para
 * que el plano principal quede por encima del bokeh.
 */
export const Escena: React.FC<{ def: DefEscena }> = ({ def }) => {
  const frame = useCurrentFrame();
  const camara = camaraEn(frame, def.duracion, def.camara);

  return (
    <AbsoluteFill>
      <Papel camara={camara} ajustes={def.fondo} />

      {def.capas.map((c, i) => (
        <Objeto key={`${c.capa}-${i}`} def={c} src={capa(c.capa)} camara={camara} />
      ))}

      {def.notas?.map((n, i) => (
        <Nota key={i} {...n} />
      ))}

      <Titular {...def.titular} />
    </AbsoluteFill>
  );
};

/** El 9:16 limpio, sin envoltorio: esto es lo publicable como reel. */
export const ReelLimpio: React.FC = () => (
  <PaletaProvider value={PALETA_REEL}>
    <AbsoluteFill style={{ backgroundColor: reel.color.papel }}>
      {ESCENAS.map((def, i) => (
        <PlanoSecuenciado key={def.id} def={def} desde={ARRANQUES[i]} />
      ))}
      <Acabado />
    </AbsoluteFill>
  </PaletaProvider>
);

/**
 * Envuelve una escena en su tramo de la línea de tiempo.
 *
 * Se usa `Sequence` con el layout por defecto (un AbsoluteFill sin transform
 * ni opacidad): cualquier otra cosa crearía un stacking context y dejaría los
 * objetos multiplicados en blanco.
 */
const PlanoSecuenciado: React.FC<{ def: DefEscena; desde: number }> = ({ def, desde }) => (
  <Sequence from={desde} durationInFrames={def.duracion}>
    <Escena def={def} />
  </Sequence>
);
