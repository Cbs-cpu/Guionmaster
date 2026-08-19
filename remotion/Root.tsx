import React from "react";
import { Composition } from "remotion";
import { ANIMACIONES, Animacion } from "./scenes/contexto/guion";
import { contexto } from "./scenes/contexto/estilo";
import { DURACION_DEMO as GLOW_DURACION, GlowDemo } from "./scenes/glow/guion";
import { glow } from "./scenes/glow/estilo";
import { DURACION_TOTAL as REEL_DURACION, ReelLimpio } from "./scenes/reel/guion";
import { reel } from "./scenes/reel/estilo";
import { Showreel } from "./scenes/reel/Showreel";
import { ESTILO_POR_DEFECTO, ESTILOS } from "./scenes/subtitulos/estilos";
import {
  DURACION_SUBTITULOS_DEMO,
  SubtitulosDemo,
  SubtitulosTranscripcion,
} from "./scenes/subtitulos/guion";
import { subtitulos } from "./scenes/subtitulos/estilo";

// Catálogo de composiciones del estudio.
//
// Todo lo que se renderiza sale de aquí. Tres familias:
//
//   - `reel-clon` / `reel-showreel`: el reel vertical 9:16, papel marfil, sin
//     color de marca.
//   - Las 16 animaciones de contexto 16:9 en la identidad de Modula (blanco y
//     amarillo), una por punto subrayado del guion del vídeo largo.
//   - `glow-demo`: identidad oscura + resplandor verde con tarjetas de
//     interfaz (scenes/glow/), sin fotos ni papel. Existe como capacidad, no
//     está anclada a ningún guion todavía.
//
// Todas son mudas: la voz la pone la grabación a cámara.
//
// Las seis animaciones de estilo Vox (papel crema y rojo) que había aquí se
// dieron de baja al sustituirse por la familia de contexto. Su código sigue en
// remotion/scenes/*.tsx y remotion/vox/ por si hay que recuperarlas — no está
// en git, así que no se borra.

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── Reel 9:16 ────────────────────────────────────────────────────
          Estas dos no son animaciones de contexto: son un reel vertical
          completo (con su propia paleta y su propio lenguaje de movimiento,
          en scenes/reel/). `reel-clon` es la pieza publicable; `reel-showreel`
          la envuelve en el marco de presentación con la línea de tiempo
          falsa, reutilizando exactamente la misma animación por dentro. */}
      <Composition
        id="reel-clon"
        component={ReelLimpio}
        durationInFrames={REEL_DURACION}
        fps={reel.canvas.fps}
        width={reel.canvas.width}
        height={reel.canvas.height}
      />
      <Composition
        id="reel-showreel"
        component={Showreel}
        durationInFrames={REEL_DURACION}
        fps={reel.canvas.fps}
        width={reel.canvas.width}
        height={reel.canvas.height}
      />

      {/* ── Animaciones de contexto (identidad Modula, blanco y amarillo) ──
          Una composición por punto subrayado del guion de "Tu empresa no es
          una lista de departamentos. Es un sistema.". El id de cada una es
          también la clave que usa la marca [[clave|texto]] dentro del texto
          del capítulo, así que renombrar una composición obliga a actualizar
          el guion en la base de datos. */}
      {ANIMACIONES.map((def) => (
        <Composition
          key={def.id}
          id={def.id}
          component={Animacion}
          defaultProps={{ def }}
          durationInFrames={def.duracion}
          fps={contexto.canvas.fps}
          width={contexto.canvas.width}
          height={contexto.canvas.height}
        />
      ))}

      {/* ── Identidad "glow" (oscuro + resplandor verde) ────────────────── */}
      <Composition
        id="glow-demo"
        component={GlowDemo}
        durationInFrames={GLOW_DURACION}
        fps={glow.canvas.fps}
        width={glow.canvas.width}
        height={glow.canvas.height}
      />

      {/* ── Subtítulos animados: un par (preview/overlay) por cada estilo
          del catálogo (scenes/subtitulos/estilos.ts). `-preview` lleva el
          fondo propio del estilo (para verse en la web, H.264); `-overlay`
          no pinta fondo y se exporta en ProRes 4444 con canal alfa — ese
          .mov es el que se arrastra a una pista de Premiere. */}
      {ESTILOS.map((e) => (
        <React.Fragment key={e.id}>
          <Composition
            id={`subtitulos-${e.id}-preview`}
            component={SubtitulosDemo}
            defaultProps={{ estiloId: e.id, fondoPreview: true }}
            durationInFrames={DURACION_SUBTITULOS_DEMO}
            fps={subtitulos.canvas.fps}
            width={subtitulos.canvas.width}
            height={subtitulos.canvas.height}
          />
          <Composition
            id={`subtitulos-${e.id}-overlay`}
            component={SubtitulosDemo}
            defaultProps={{ estiloId: e.id, fondoPreview: false }}
            durationInFrames={DURACION_SUBTITULOS_DEMO}
            fps={subtitulos.canvas.fps}
            width={subtitulos.canvas.width}
            height={subtitulos.canvas.height}
          />
        </React.Fragment>
      ))}

      {/* Composición dinámica: la usa /api/ai/subtitulos/render con una
          transcripción real (líneas ya agrupadas por src/lib/subtitulos/
          agrupar.ts) en vez del demo hardcodeado. `durationInFrames` no se
          fija aquí — depende de cuánto dure la transcripción, así que se
          calcula con `calculateMetadata` a partir de la última línea. */}
      <Composition
        id="subtitulos-transcripcion"
        component={SubtitulosTranscripcion}
        defaultProps={{ lineas: [], estiloId: ESTILO_POR_DEFECTO, fondoPreview: true }}
        fps={subtitulos.canvas.fps}
        width={subtitulos.canvas.width}
        height={subtitulos.canvas.height}
        calculateMetadata={({ props }) => {
          const lineas = (props.lineas as { inicio: number; duracion: number }[]) ?? [];
          const ultima = lineas[lineas.length - 1];
          // +30 fotogramas (1s) de margen tras la última línea, para que el
          // clip no corte a cuchillo justo cuando la línea final desaparece.
          const duracion = ultima ? ultima.inicio + ultima.duracion + 30 : 90;
          return { durationInFrames: Math.max(30, duracion) };
        }}
      />
    </>
  );
};
