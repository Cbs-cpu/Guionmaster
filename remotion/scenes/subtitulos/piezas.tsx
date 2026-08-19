import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { muelle, rampa } from "../../lienzo/movimiento";
import type { EstiloSubtitulos } from "./estilos";

// Piezas de los subtítulos animados. Palabra a palabra, no letra a letra: en
// un rótulo grande ("STOCK", "LA SUMA") la caída letra a letra se lee entera
// en medio segundo y funciona. Aquí el texto es una frase hablada completa,
// y leer letra a letra una frase larga tarda demasiado y se desincroniza del
// audio — por eso la unidad de animación es la PALABRA.
//
// Un único componente `Palabra` cubre los cuatro estilos del catálogo
// (estilos.ts): lo que cambia entre "Modula" y "Minimal" no es una paleta
// por encima del mismo dibujo, son banderas de tratamiento (contorno vs
// sombra vs glow, caja vs bloque vs nada, rebote vs aterrizaje blando) que
// vienen en el objeto `EstiloSubtitulos`. Reescribirlo por estilo habría
// duplicado la física del muelle cuatro veces para cambiar cuatro líneas.

/** Muelle con rebote de verdad: poco amortiguado, `spring()` se pasa de 1 antes de asentarse. */
const PUNCH = { damping: 9, stiffness: 260, mass: 0.7 } as const;
/** Aterrizaje blando, sin rebote — para los estilos que no quieren "hormonas". */
const POSADO = { damping: 26, stiffness: 150, mass: 0.85 } as const;

export interface Token {
  texto: string;
  /** La palabra que no se puede perder: recibe el tratamiento de acento del estilo. */
  clave?: boolean;
}

function textShadowContorno(color: string): string {
  return [`-2px -2px 0 ${color}`, `2px -2px 0 ${color}`, `-2px 2px 0 ${color}`, `2px 2px 0 ${color}`, `0 4px 10px rgba(0,0,0,0.5)`].join(
    ", "
  );
}

/**
 * Una palabra suelta. Entra con el muelle del estilo (rebote o posado),
 * arrastra un filo cromático si el estilo lo pide, y una vez asentada
 * respira con un balanceo mínimo para no quedarse muerta en pantalla.
 */
const Palabra: React.FC<{ texto: string; retardo: number; clave?: boolean; estilo: EstiloSubtitulos }> = ({
  texto,
  retardo,
  clave = false,
  estilo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const config = estilo.muelle === "punch" ? PUNCH : POSADO;
  const p = muelle(frame, fps, retardo, config);
  const seed = `${texto}-${retardo}`;

  const escala = interpolate(p, [0, 1], [estilo.muelle === "punch" ? 0.35 : 0.75, 1], { extrapolateRight: "extend" });
  const respiro = p > 0.9 ? Math.sin((frame - retardo) * 0.16) * 0.012 : 0;
  const subida = interpolate(p, [0, 1], [estilo.muelle === "punch" ? 18 : 10, 0], { extrapolateRight: "extend" });
  const giro = estilo.rotacion
    ? interpolate(p, [0, 1], [(random(seed) * 2 - 1) * 7, 0], { extrapolateRight: "extend" })
    : 0;
  const desenfoque = interpolate(p, [0, 0.45], [estilo.muelle === "punch" ? 6 : 3, 0], { extrapolateRight: "clamp" });
  const dx = estilo.aberracionCromatica ? interpolate(p, [0, 0.55], [8, 0], { extrapolateRight: "clamp" }) : 0;
  const opacidad = interpolate(p, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  // Dos formas de marcar la clave, según lleve bloque o no:
  //   - "simple" (Minimal): no hay bloque debajo, así que el propio texto se
  //     pinta con el color de acento — es la única señal que tiene.
  //   - "caja-clave" / "bloque-todas": el bloque de acento va detrás, y el
  //     texto necesita el color de CONTRASTE con ese bloque, no el de acento
  //     (texto amarillo sobre bloque amarillo sería invisible).
  // Con "simple" o "subrayado" no hay relleno de color detrás de la palabra
  // clave, así que el texto usa el color de acento directamente. Solo
  // "colorSobreAcento" (pensado para contrastar con un relleno) se usa si
  // algún día vuelve a existir un envoltorio de caja sólida.
  const color = !clave
    ? estilo.colorTexto
    : estilo.tratamientoPalabra === "simple" || estilo.envoltorioPalabra !== "caja"
      ? estilo.colorAcento
      : estilo.colorSobreAcento;

  let textShadow: string | undefined;
  if (estilo.tratamientoTexto === "contorno" && !(clave && estilo.tratamientoPalabra !== "simple")) {
    textShadow = textShadowContorno("rgba(0,0,0,0.85)");
  } else if (estilo.tratamientoTexto === "sombra-suave") {
    textShadow = "0 2px 8px rgba(0,0,0,0.55)";
  } else if (estilo.tratamientoTexto === "glow") {
    const colorGlow = clave ? estilo.colorAcento : estilo.colorAcento;
    textShadow = `0 0 ${clave ? 18 : 10}px ${colorGlow}, 0 2px 6px rgba(0,0,0,0.6)`;
  }
  if (dx > 0.3) {
    textShadow = `${textShadow ? textShadow + ", " : ""}${dx}px 0 0 rgba(255,42,90,0.6), ${-dx}px 0 0 rgba(0,190,255,0.55)`;
  }

  return (
    <span
      style={{
        display: "inline-block",
        opacity: opacidad,
        color,
        textShadow,
        transform: `translateY(${subida}px) scale(${escala + respiro}) rotate(${giro}deg)`,
        filter: desenfoque > 0.1 ? `blur(${desenfoque}px)` : undefined,
      }}
    >
      {texto}
    </span>
  );
};

/**
 * Envoltorio de bloque/caja detrás de una palabra: lo comparten
 * "caja-clave" (solo la palabra clave) y "bloque-todas" (todas). Entra un
 * pelín antes que el texto para que ya esté "cayendo" cuando el texto
 * aparece encima — si entran a la vez, se leen como dos elementos sueltos.
 */
const Bloque: React.FC<{
  retardo: number;
  estilo: EstiloSubtitulos;
  acentuado: boolean;
  children: React.ReactNode;
}> = ({ retardo, estilo, acentuado, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const config = estilo.muelle === "punch" ? PUNCH : POSADO;
  const p = muelle(frame, fps, retardo - 3, config);
  const escala = interpolate(p, [0, 1], [0.5, 1], { extrapolateRight: "extend" });

  const esGlow = estilo.tratamientoTexto === "glow";
  const esSubrayado = !esGlow && estilo.envoltorioPalabra !== "caja";
  const colorBloque = acentuado ? estilo.colorAcento : estilo.colorBloqueBase ?? estilo.colorAcento;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: esSubrayado ? "0.08em 0.05em 0.14em" : "0.08em 0.22em",
        margin: "0 0.06em",
        borderRadius: esSubrayado ? 0 : "0.1em",
        backgroundColor: esGlow || esSubrayado ? "transparent" : colorBloque,
        border: esGlow ? `2px solid ${estilo.colorAcento}` : undefined,
        borderBottom: esSubrayado ? `0.1em solid ${colorBloque}` : undefined,
        boxShadow: esGlow ? `0 0 22px ${estilo.colorAcento}` : undefined,
        transform: `scale(${escala})`,
        opacity: interpolate(p, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      {children}
    </span>
  );
};

/**
 * Una línea de subtítulo completa: reparte las palabras con un escalonado
 * corto (cascada rápida, no tecleo) y las hace desaparecer juntas al final
 * de su ventana. `frameLocal` es el fotograma relativo al arranque de ESTA
 * línea, no el de la composición — así una línea se define sin saber dónde
 * cae en el guion completo.
 */
export const LineaSubtitulo: React.FC<{
  tokens: Token[];
  frameLocal: number;
  duracion: number;
  estilo: EstiloSubtitulos;
  escalonado?: number;
}> = ({ tokens, frameLocal, duracion, estilo, escalonado = 2.5 }) => {
  const salida = rampa(frameLocal, duracion - 9, duracion);

  return (
    <div
      style={{
        position: "absolute",
        left: "8%",
        right: "8%",
        bottom: "12%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.28em 0.22em",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: estilo.fontWeight,
        fontSize: estilo.fontSizeBase,
        lineHeight: 1.1,
        letterSpacing: "-0.01em",
        textAlign: "center",
        opacity: 1 - salida,
        transform: `scale(${1 - salida * 0.05})`,
      }}
    >
      {tokens.map((tok, i) => {
        const retardo = i * escalonado;
        const clave = Boolean(tok.clave);
        const palabra = <Palabra key={i} texto={tok.texto} retardo={retardo} clave={clave} estilo={estilo} />;

        const llevaBloque =
          estilo.tratamientoPalabra === "bloque-todas" || (clave && estilo.tratamientoPalabra === "caja-clave");

        return llevaBloque ? (
          <Bloque key={`b-${i}`} retardo={retardo} estilo={estilo} acentuado={clave}>
            {palabra}
          </Bloque>
        ) : (
          palabra
        );
      })}
    </div>
  );
};
