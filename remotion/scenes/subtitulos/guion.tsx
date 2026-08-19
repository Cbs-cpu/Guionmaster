import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { buscarEstilo, ESTILO_POR_DEFECTO } from "./estilos";
import { LineaSubtitulo, type Token } from "./piezas";

// Demo de los subtítulos animados: tres frases cortas, cada una con su
// palabra clave resaltada, para enseñar el ritmo completo (pop → respira →
// sale) de cualquiera de los cuatro estilos del catálogo (estilos.ts) antes
// de aplicarlo a la transcripción real de un vídeo.
//
// Cada estilo se renderiza en DOS composiciones desde el mismo componente
// (ver Root.tsx, que las genera con un .map sobre ESTILOS):
//   - `subtitulos-<id>-preview` → con el fondo del propio estilo, para verlo
//     en la web (H.264).
//   - `subtitulos-<id>-overlay` → sin fondo, canal alfa (ProRes 4444) — el
//     archivo real que se arrastra a una pista de Premiere por encima del
//     vídeo. Es literalmente el mismo React; solo cambia si se pinta un
//     fondo por debajo, así que lo que se ve en la web es lo que se obtiene
//     en Premiere.

interface Linea {
  inicio: number;
  duracion: number;
  tokens: Token[];
}

/**
 * Divide una frase en tokens de una palabra cada uno, marcando como clave
 * las que aparezcan en `claves`. Una transcripción real (Whisper) ya viene
 * palabra a palabra — esto es solo para que el DEMO tenga la misma
 * granularidad, porque el estilo "bloques" pone un bloque POR PALABRA: si
 * aquí se pasara la frase entera como un único token, "bloques" pondría
 * toda la frase en un solo bloque en vez de uno por palabra, y el resto de
 * estilos perderían el escalonado palabra a palabra en todo menos la
 * última palabra.
 */
function palabras(frase: string, claves: string[] = []): Token[] {
  const clavesNorm = new Set(claves.map((c) => c.toUpperCase()));
  return frase.split(" ").map((texto) => ({ texto, clave: clavesNorm.has(texto.toUpperCase()) }));
}

const LINEAS: Linea[] = [
  {
    inicio: 0,
    duracion: 72,
    tokens: palabras("casi nunca es un problema de RECURSOS", ["RECURSOS"]),
  },
  {
    inicio: 84,
    duracion: 68,
    tokens: palabras("es un problema de SISTEMA", ["SISTEMA"]),
  },
  {
    inicio: 164,
    duracion: 76,
    tokens: palabras("un sistema mejor diseñado RINDE MÁS", ["RINDE", "MÁS"]),
  },
];

export const DURACION_SUBTITULOS_DEMO = 240;

export const SubtitulosDemo: React.FC<{ estiloId?: string; fondoPreview?: boolean }> = ({
  estiloId = ESTILO_POR_DEFECTO,
  fondoPreview = true,
}) => {
  const frame = useCurrentFrame();
  const estilo = buscarEstilo(estiloId);

  return (
    <AbsoluteFill>
      {fondoPreview && <AbsoluteFill style={{ background: estilo.fondoPreview }} />}
      {LINEAS.map((linea, i) => {
        const frameLocal = frame - linea.inicio;
        if (frameLocal < 0 || frameLocal >= linea.duracion) return null;
        return (
          <LineaSubtitulo
            key={i}
            tokens={linea.tokens}
            frameLocal={frameLocal}
            duracion={linea.duracion}
            estilo={estilo}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Composición genérica: recibe una transcripción real (lista de líneas ya
 * agrupadas — ver agrupar.ts) en vez del demo hardcodeado de arriba. Es la
 * que usa el render por API/CLI para un vídeo concreto.
 */
export const SubtitulosTranscripcion: React.FC<{
  lineas: Linea[];
  estiloId?: string;
  fondoPreview?: boolean;
}> = ({ lineas, estiloId = ESTILO_POR_DEFECTO, fondoPreview = true }) => {
  const frame = useCurrentFrame();
  const estilo = buscarEstilo(estiloId);

  return (
    <AbsoluteFill>
      {fondoPreview && <AbsoluteFill style={{ background: estilo.fondoPreview }} />}
      {lineas.map((linea, i) => {
        const frameLocal = frame - linea.inicio;
        if (frameLocal < 0 || frameLocal >= linea.duracion) return null;
        return (
          <LineaSubtitulo
            key={i}
            tokens={linea.tokens}
            frameLocal={frameLocal}
            duracion={linea.duracion}
            estilo={estilo}
          />
        );
      })}
    </AbsoluteFill>
  );
};
