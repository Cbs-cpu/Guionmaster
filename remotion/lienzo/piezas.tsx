import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../vox/fonts";
import { usePaleta } from "./paleta";
import { arrastre, EstadoCamara, LETRA, muelle, rampa } from "./movimiento";

// Piezas del motor de animación.
//
// Nada de aquí conoce un color concreto ni un tamaño de lienzo: los colores
// vienen de <PaletaProvider> y las medidas de useVideoConfig(). Es lo que
// permite que el reel 9:16 de papel marfil y las animaciones de contexto
// 16:9 en blanco y amarillo sean literalmente el mismo código.

// ─────────────────────────────────────────────────────────────────────────
// Fondo
// ─────────────────────────────────────────────────────────────────────────

export interface AjustesFondo {
  /** Ángulo en grados de la banda ancha de fondo. `null` = esta escena no la lleva. */
  arco?: number | null;
  /** Semilla de las curvas finas, para que dos escenas no compartan trazado. */
  semilla?: string;
  /** Lado de la celda de retícula. Por defecto, ~11 columnas de ancho. */
  celda?: number;
}

/**
 * Papel de fondo: degradado, retícula que solo se intuye a parches, dos
 * curvas de trazo finísimo y, en algunas escenas, una banda ancha y suave.
 *
 * Se mueve con la cámara igual que los objetos, pero a profundidad 0,25: el
 * fondo tiene que quedarse casi quieto para que el paralaje se note.
 */
export const Papel: React.FC<{ camara: EstadoCamara; ajustes?: AjustesFondo }> = ({
  camara,
  ajustes = {},
}) => {
  const c = usePaleta();
  const { width: w, height: h } = useVideoConfig();
  const { arco = null, semilla = "fondo", celda = Math.round(w / 11.25) } = ajustes;
  const PROF = 0.25;

  // Dos curvas, no más, y muy abiertas: en la referencia son un apunte de
  // geometría al fondo, no un garabato. Con radios cortos el papel deja de
  // leerse como fondo y empieza a competir con el titular.
  const curva = (i: number) => {
    const r = (k: string) => random(`${semilla}-${i}-${k}`);
    const y0 = h * (0.1 + r("b") * 0.8);
    const y1 = h * (0.1 + r("d") * 0.8);
    const cx = w * (0.3 + r("e") * 0.4);
    const cy = y0 + (y1 - y0) * (0.2 + r("f") * 0.6);
    return `M ${-w * 0.15} ${y0} Q ${cx} ${cy} ${w * 1.15} ${y1}`;
  };

  // La banda se define contra la dimensión menor del lienzo, no contra el
  // ancho: así conserva la misma curvatura aparente en vertical y en
  // horizontal en vez de aplanarse al pasar a 16:9.
  const menor = Math.min(w, h);

  return (
    <div
      style={{
        position: "absolute",
        inset: -Math.round(menor * 0.15),
        transform: `translate(${-camara.x * PROF}px, ${-camara.y * PROF}px) scale(${
          1 + (camara.escala - 1) * 0.6
        })`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(152deg, ${c.papelCalido} 0%, ${c.papel} 44%, ${c.papelFrio} 100%)`,
        }}
      />
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          {/* La retícula no se ve entera en ningún fotograma: aparece a
              manchas. Esta máscara es la que produce esos parches. */}
          <radialGradient id={`mancha-${semilla}-1`}>
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`mancha-${semilla}-2`}>
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`parches-${semilla}`}>
            <ellipse
              cx={w * (0.26 + random(`${semilla}-m1x`) * 0.48)}
              cy={h * (0.22 + random(`${semilla}-m1y`) * 0.26)}
              rx={w * 0.4}
              ry={h * 0.27}
              fill={`url(#mancha-${semilla}-1)`}
            />
            <ellipse
              cx={w * (0.28 + random(`${semilla}-m2x`) * 0.48)}
              cy={h * (0.56 + random(`${semilla}-m2y`) * 0.32)}
              rx={w * 0.44}
              ry={h * 0.22}
              fill={`url(#mancha-${semilla}-2)`}
            />
          </mask>
          <pattern
            id={`reticula-${semilla}`}
            width={celda}
            height={celda}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${celda} 0 L 0 0 0 ${celda}`}
              fill="none"
              stroke={c.reticula}
              strokeWidth={1.4}
            />
          </pattern>
        </defs>

        {/* Banda ancha de fondo. Va como círculo completo con el centro fuera
            del lienzo en vez de como un `path A ...`: con el arco elíptico hay
            que acertar el radio, y en cuanto se queda corto respecto a la
            cuerda el navegador lo agranda solo hasta convertirlo en un
            semicírculo, que es justo lo que lo hace desaparecer. */}
        {arco !== null ? (
          <g transform={`rotate(${arco} ${w / 2} ${h / 2})`}>
            <circle
              cx={-menor * 0.18}
              cy={h * 0.71}
              r={menor * 1.06}
              fill="none"
              stroke={c.arco}
              strokeWidth={menor * 0.145}
            />
          </g>
        ) : null}

        <rect
          width={w}
          height={h}
          fill={`url(#reticula-${semilla})`}
          mask={`url(#parches-${semilla})`}
          opacity={0.85}
        />

        {[0, 1].map((i) => (
          <path key={i} d={curva(i)} fill="none" stroke={c.filete} strokeWidth={1.5} opacity={0.42} />
        ))}
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Objetos fotográficos
// ─────────────────────────────────────────────────────────────────────────

export interface DefCapa {
  /** Clave en el manifiesto de capas de la composición. */
  capa: string;
  /** Posición del centro, en fracción del lienzo (0→1). Se sale del marco a propósito. */
  x: number;
  y: number;
  /** Lado del cuadro, en fracción del ancho del lienzo. */
  tam: number;
  rot?: number;
  /** Desenfoque base en px. >5 = capa de primer plano fuera de foco (bokeh). */
  desenfoque?: number;
  /**
   * Multiplicador de paralaje. 1 = plano principal, <1 fondo, >1 primer plano.
   * Es el único número que de verdad decide si la escena tiene profundidad.
   */
  profundidad?: number;
  /** Fotograma en el que entra. */
  entrada?: number;
  /** Dirección desde la que entra, en fracción del lienzo. */
  desdeX?: number;
  desdeY?: number;
  opacidad?: number;
}

/**
 * Un recorte fotográfico apoyado sobre el papel.
 *
 * `mixBlendMode: multiply` es lo que hace que funcione: las imágenes de Kie.ai
 * vienen sobre fondo blanco puro, y al multiplicarlas contra el papel el
 * blanco desaparece pero la sombra proyectada sobrevive. Por eso los prompts
 * piden "white background + drop shadow on the white surface" en vez de fondo
 * transparente: con transparencia se perdería la sombra, que es justo lo que
 * hace que el objeto parezca apoyado y no pegado.
 *
 * El orden de los divs no es decorativo. El blend va en el div de fuera, que
 * solo lleva posición y opacidad; `filter` y `transform` van por dentro. Si el
 * blend compartiera div con un `transform`, la capa se quedaría blanca.
 */
export const Objeto: React.FC<{ def: DefCapa; src: string; camara: EstadoCamara }> = ({
  def,
  src,
  camara,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const prof = def.profundidad ?? 1;
  const entrada = muelle(frame, fps, def.entrada ?? 0);

  const lado = def.tam * width;
  const desdeX = (def.desdeX ?? 0) * width;
  const desdeY = (def.desdeY ?? 0) * height;

  // La cámara desplaza cada capa multiplicada por su profundidad: el primer
  // plano barre y el fondo apenas se mueve.
  const x = def.x * width - lado / 2 - camara.x * prof + desdeX * (1 - entrada);
  const y = def.y * height - lado / 2 - camara.y * prof + desdeY * (1 - entrada);

  const desenfoque = (def.desenfoque ?? 0) + arrastre(camara.velocidad, prof);
  const borroso = (def.desenfoque ?? 0) > 5;
  const escala = (1 + (camara.escala - 1) * prof) * interpolate(entrada, [0, 1], [1.09, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: lado,
        height: lado,
        opacity:
          (def.opacidad ?? 1) *
          interpolate(entrada, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        mixBlendMode: "multiply",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          // Una capa fuera de foco no solo está borrosa: también está lavada.
          // Pero el lavado tiene que hacerse SOLO con `brightness`: bajar el
          // contraste acerca el blanco al gris medio, y como el fondo de estas
          // imágenes es blanco puro, el multiply lo pintaría como un recuadro
          // gris perfectamente visible alrededor del objeto.
          filter: borroso
            ? `blur(${desenfoque}px) brightness(1.12) saturate(0.94)`
            : `blur(${desenfoque}px)`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `rotate(${def.rot ?? 0}deg) scale(${escala})`,
          }}
        >
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Texto
// ─────────────────────────────────────────────────────────────────────────

export interface Corrida {
  texto: string;
  peso?: number;
  color?: string;
}

export interface LineaTexto {
  corridas: Corrida[];
  tam: number;
  peso?: number;
  color?: string;
  tracking?: string;
  /** Sangría en px respecto al bloque. */
  sangria?: number;
  margenSuperior?: number;
  /**
   * Barra del color de marca que se abre por detrás de la línea justo cuando
   * termina de aterrizar. Solo una línea por escena debería llevarla.
   */
  resalte?: boolean;
}

/**
 * Una letra aterrizando.
 *
 * Cuatro cosas pasan a la vez y ninguna sobra: sube desde abajo, pasa de gris
 * fantasma a tinta, se desenfoca un pelo y arrastra un borde rojo/cian que se
 * cierra al pararse. Quitar la aberración cromática es lo que hace que un
 * texto animado parezca salido de una plantilla.
 */
const Letra: React.FC<{ ch: string; retardo: number; color: string }> = ({
  ch,
  retardo,
  color,
}) => {
  const c = usePaleta();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = muelle(frame, fps, retardo, LETRA);

  if (ch === " ") return <span style={{ whiteSpace: "pre" }}> </span>;

  const dx = interpolate(p, [0, 0.72], [9, 0], { extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        whiteSpace: "pre",
        opacity: interpolate(p, [0, 0.22], [0, 1], { extrapolateRight: "clamp" }),
        color: interpolateColors(Math.min(1, p), [0, 1], [c.tintaFantasma, color]),
        transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scaleY(${interpolate(
          p,
          [0, 1],
          [1.14, 1]
        )})`,
        filter:
          p < 0.96
            ? `blur(${interpolate(p, [0, 0.55], [5, 0], { extrapolateRight: "clamp" })}px)`
            : undefined,
        textShadow:
          dx > 0.2 ? `${dx}px 0 0 ${c.fringe.rojo}, ${-dx}px 0 0 ${c.fringe.cian}` : undefined,
      }}
    >
      {ch}
    </span>
  );
};

/**
 * Bloque de titular revelado letra a letra.
 *
 * El paso entre letras se calcula a partir del total de caracteres en vez de
 * ser fijo: una frase tarda más o menos lo mismo en escribirse tenga siete
 * letras o treinta y cinco. Con un paso fijo, "BITCOIN" iría bien y una frase
 * larga tardaría el triple.
 */
export const Titular: React.FC<{
  lineas: LineaTexto[];
  x: number;
  y: number;
  retardo?: number;
  centrado?: boolean;
  ancho?: number;
}> = ({ lineas, x, y, retardo = 0, centrado = false, ancho }) => {
  const c = usePaleta();
  const { width, height } = useVideoConfig();
  const total = lineas.reduce(
    (n, l) => n + l.corridas.reduce((m, cr) => m + cr.texto.length, 0),
    0
  );
  const paso = Math.min(2.3, 30 / Math.max(1, total));

  let indice = 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x * width,
        top: y * height,
        width: ancho ?? (centrado ? width - x * width * 2 : undefined),
        fontFamily,
        textAlign: centrado ? "center" : "left",
      }}
    >
      {lineas.map((linea, i) => {
        const nodos: React.ReactNode[] = [];
        for (const corrida of linea.corridas) {
          const color = corrida.color ?? linea.color ?? c.tinta;
          for (const ch of corrida.texto) {
            const retardoLetra = retardo + indice * paso;
            indice += 1;
            nodos.push(
              <span
                key={`${i}-${nodos.length}`}
                style={{ fontWeight: corrida.peso ?? linea.peso ?? 500 }}
              >
                <Letra ch={ch} retardo={retardoLetra} color={color} />
              </span>
            );
          }
        }

        const cuerpo = (
          <div
            style={{
              fontSize: linea.tam,
              lineHeight: 1.06,
              letterSpacing: linea.tracking ?? "-0.01em",
              marginLeft: linea.sangria ?? 0,
              marginTop: linea.margenSuperior ?? 0,
            }}
          >
            {nodos}
          </div>
        );

        if (!linea.resalte || !c.acento) return <React.Fragment key={i}>{cuerpo}</React.Fragment>;

        // La barra arranca cuando la última letra de la línea ya ha caído: si
        // sale antes, compite con el propio revelado del texto.
        return (
          <Resalte key={i} retardo={retardo + indice * paso + 2} color={c.acento}>
            {cuerpo}
          </Resalte>
        );
      })}
    </div>
  );
};

/**
 * Barra del color de marca que se abre por detrás del texto.
 *
 * Va detrás y no delante, y se abre de izquierda a derecha con un borde recto:
 * es un subrayado grueso de rotulador, no un fundido. Con `mixBlendMode:
 * multiply` la tinta negra del texto sigue leyéndose encima del amarillo sin
 * tener que cambiarle el color a la letra.
 */
const Resalte: React.FC<{ retardo: number; color: string; children: React.ReactNode }> = ({
  retardo,
  color,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = rampa(frame, retardo, retardo + 10);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          position: "absolute",
          left: "-0.12em",
          right: "-0.12em",
          top: "0.16em",
          bottom: "0.14em",
          backgroundColor: color,
          transformOrigin: "0% 50%",
          transform: `scaleX(${p})`,
        }}
      />
      <div style={{ position: "relative", mixBlendMode: "multiply" }}>{children}</div>
    </div>
  );
};

/**
 * Párrafo diminuto de relleno. No está para leerse: es textura tipográfica
 * que llena el espacio negativo y da escala al titular.
 */
export const Nota: React.FC<{
  texto: string;
  x: number;
  y: number;
  ancho?: number;
  retardo?: number;
  tam?: number;
}> = ({ texto, x, y, ancho = 0.34, retardo = 0, tam = 19 }) => {
  const c = usePaleta();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = rampa(frame, retardo, retardo + 14);

  return (
    <div
      style={{
        position: "absolute",
        left: x * width,
        top: y * height,
        width: ancho * width,
        fontFamily,
        fontSize: tam,
        fontWeight: 400,
        letterSpacing: "0.01em",
        lineHeight: 1.5,
        color: c.tintaNota,
        opacity: p * 0.9,
      }}
    >
      {texto}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Acabado
// ─────────────────────────────────────────────────────────────────────────

/**
 * Grano y viñeta por encima de todo. Sin esto la pieza se ve digital y plana:
 * el grano une capas que vienen de sitios distintos (objetos de Kie, vectores
 * dibujados, tipografía) y hace que parezcan la misma toma.
 */
export const Acabado: React.FC<{ semilla?: number }> = ({ semilla = 11 }) => (
  <>
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={`grano-${semilla}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={semilla} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </svg>
    <AbsoluteFill
      style={{
        filter: `url(#grano-${semilla})`,
        opacity: 0.045,
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 42% 40%, rgba(0,0,0,0) 52%, rgba(30,26,20,0.10) 100%)",
        pointerEvents: "none",
      }}
    />
  </>
);
