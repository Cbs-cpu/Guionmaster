import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Camara, camaraEn } from "./movimiento";
import { AjustesFondo, DefCapa, LineaTexto, Nota, Objeto, Papel, Titular } from "./piezas";

// Un plano y su secuenciación, comunes a todas las composiciones del motor.
//
// Las escenas se describen como datos (esta interfaz) y no como JSX: retocar
// el ritmo o mover un objeto es cambiar un número en una tabla, que es lo que
// permite iterar rápido sobre el montaje sin romper nada.

export interface DefNota {
  texto: string;
  x: number;
  y: number;
  ancho?: number;
  retardo?: number;
  tam?: number;
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

/**
 * Resuelve la clave de una capa a su archivo. Devuelve `null` si esa imagen
 * todavía no está generada, para que la escena pueda previsualizarse igual.
 */
export type ResolverCapa = (clave: string) => string | null;

/**
 * Un plano completo.
 *
 * El orden de los hijos es el orden de pintado, y con `mixBlendMode` eso
 * importa: el papel va primero porque es el fondo contra el que multiplican
 * los objetos. Dentro de `capas`, las de más profundidad se listan antes para
 * que el plano principal quede por encima del bokeh.
 */
export const Escena: React.FC<{ def: DefEscena; resolver: ResolverCapa }> = ({
  def,
  resolver,
}) => {
  const frame = useCurrentFrame();
  const camara = camaraEn(frame, def.duracion, def.camara);

  return (
    <AbsoluteFill>
      <Papel camara={camara} ajustes={def.fondo} />

      {def.capas.map((c, i) => {
        const src = resolver(c.capa);
        return src ? (
          <Objeto key={`${c.capa}-${i}`} def={c} src={src} camara={camara} />
        ) : (
          <CapaPendiente key={`${c.capa}-${i}`} def={c} />
        );
      })}

      {def.notas?.map((n, i) => (
        <Nota key={i} {...n} />
      ))}

      <Titular {...def.titular} />
    </AbsoluteFill>
  );
};

/**
 * Hueco de una capa cuya imagen todavía no existe.
 *
 * Se dibuja a propósito como un recuadro discontinuo con el nombre de la
 * clave, no como un espacio en blanco: así se puede revisar el movimiento y la
 * composición antes de tener las fotos, y a la vez es imposible confundir un
 * render incompleto con uno terminado.
 */
const CapaPendiente: React.FC<{ def: DefCapa }> = ({ def }) => {
  const { width, height } = useVideoConfig();
  const lado = def.tam * width;
  return (
    <div
      style={{
        position: "absolute",
        left: def.x * width - lado / 2,
        top: def.y * height - lado / 2,
        width: lado,
        height: lado,
        border: "3px dashed rgba(200,60,60,0.55)",
        color: "rgba(200,60,60,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        fontSize: 22,
        textAlign: "center",
      }}
    >
      falta “{def.capa}”
    </div>
  );
};

/**
 * Envuelve una escena en su tramo de la línea de tiempo.
 *
 * Se usa `Sequence` con el layout por defecto (un AbsoluteFill sin transform
 * ni opacidad): cualquier otra cosa crearía un stacking context y dejaría los
 * objetos multiplicados en blanco.
 */
export const PlanoSecuenciado: React.FC<{
  def: DefEscena;
  desde: number;
  resolver: ResolverCapa;
}> = ({ def, desde, resolver }) => (
  <Sequence from={desde} durationInFrames={def.duracion}>
    <Escena def={def} resolver={resolver} />
  </Sequence>
);

/** Fotograma de arranque de cada escena, acumulado. */
export function arranques(escenas: DefEscena[]): number[] {
  return escenas.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + escenas[i - 1].duracion);
    return acc;
  }, []);
}
