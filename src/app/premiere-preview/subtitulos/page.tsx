"use client";

import { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import { SubtitulosTranscripcion } from "../../../../remotion/scenes/subtitulos/guion";
import { ESTILO_POR_DEFECTO, buscarEstilo } from "../../../../remotion/scenes/subtitulos/estilos";
import { subtitulos } from "../../../../remotion/scenes/subtitulos/estilo";

// Preview en vivo del subtítulo animado, pensado para vivir dentro de un
// <iframe> del panel de Premiere (premiere/client/), NO como página que
// alguien visite directamente en la web.
//
// Por qué existe: /api/ai/subtitulos/render hornea un vídeo real (Chromium +
// ffmpeg, medio minuto largo) — perfecto para el archivo final, pésimo para
// "a ver cómo queda este estilo". @remotion/player renderiza la MISMA
// composición React en el propio navegador, sin tocar el servidor, así que
// cambiar de estilo aquí es instantáneo. El panel manda los datos por
// postMessage en vez de por querystring porque una transcripción larga no
// cabe cómoda en una URL.
//
// Mensajes que escucha (window.postMessage desde el padre):
//   { type: "scc-datos", lineas: LineaFrames[], estiloId: string }
// No hace falta comprobar origin al recibir: este preview no hace nada con
// los datos salvo pintarlos, y solo vive embebido por el propio panel.

interface Linea {
  inicio: number;
  duracion: number;
  tokens: { texto: string; clave?: boolean }[];
}

interface DatosMensaje {
  type: "scc-datos";
  lineas: Linea[];
  estiloId: string;
}

function esDatosMensaje(v: unknown): v is DatosMensaje {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as { type?: unknown }).type === "scc-datos" &&
    Array.isArray((v as { lineas?: unknown }).lineas)
  );
}

export default function PreviewSubtitulosPage() {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [estiloId, setEstiloId] = useState<string>(ESTILO_POR_DEFECTO);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!esDatosMensaje(e.data)) return;
      setLineas(e.data.lineas);
      setEstiloId(e.data.estiloId || ESTILO_POR_DEFECTO);
    }
    window.addEventListener("message", onMessage);
    // Avisa al padre de que ya puede mandar datos — si el postMessage inicial
    // del panel llega antes de que este listener exista, se pierde.
    window.parent.postMessage({ type: "scc-preview-listo" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const ultima = lineas[lineas.length - 1];
  const duracionFrames = Math.max(30, ultima ? ultima.inicio + ultima.duracion + 30 : 90);
  const estilo = buscarEstilo(estiloId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Tablero de ajedrez: es la única forma fiable de "ver" un canal
        // alfa en una página normal — el .mov real no lleva este fondo.
        backgroundImage:
          "linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        backgroundColor: "#1a1a1a",
      }}
    >
      {lineas.length === 0 ? (
        <p style={{ color: "#888", fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
          Esperando la transcripción…
        </p>
      ) : (
        <Player
          component={SubtitulosTranscripcion}
          inputProps={{ lineas, estiloId, fondoPreview: false }}
          durationInFrames={duracionFrames}
          fps={subtitulos.canvas.fps}
          compositionWidth={subtitulos.canvas.width}
          compositionHeight={subtitulos.canvas.height}
          style={{ width: "100%", height: "100%" }}
          controls
          loop
          autoPlay
          key={estilo.id}
        />
      )}
    </div>
  );
}
