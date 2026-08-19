"use client";

import { useRef } from "react";
import { Play } from "lucide-react";
import { isPlayableVisual, type VisualResource } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExpandOverlay } from "./Lightbox";

// Miniatura de un recurso visual, que lo mismo es una imagen fija que una
// animación de contexto (MP4 renderizado con Remotion, carpeta `remotion/`).
//
// Las animaciones son 16:9 y la rejilla es cuadrada, así que se muestran
// enteras sobre papel en vez de recortadas: si se recortara a cuadrado se
// perdería justo la columna de texto que hace reconocible el clip. Se
// reproducen al pasar el ratón por encima — así la galería no carga seis
// vídeos a la vez solo por abrirla.

export function VisualThumb({
  visual,
  onOpen,
  className,
}: {
  visual: Pick<VisualResource, "kind" | "filePath" | "prompt">;
  /** Si se pasa, la miniatura se vuelve clicable y muestra la lupa al pasar el ratón. */
  onOpen?: () => void;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = `/api/media/${visual.filePath}`;

  if (!isPlayableVisual(visual)) {
    return (
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className={cn("group/expand relative block w-full disabled:cursor-default", className)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={visual.prompt} title={visual.prompt} className="aspect-square w-full object-cover" />
        {onOpen && <ExpandOverlay />}
      </button>
    );
  }

  function handleEnter() {
    videoRef.current?.play().catch(() => {
      // Si el navegador bloquea la reproducción automática, se queda en el
      // primer fotograma: no es un fallo que merezca romper nada.
    });
  }

  function handleLeave() {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className={cn(
        "group/expand relative block aspect-square w-full bg-paper-sunken disabled:cursor-default",
        className
      )}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <video
        ref={videoRef}
        src={src}
        title={visual.prompt}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
      />
      <span className="pointer-events-none absolute bottom-1 right-1 rounded-sm bg-ink/70 p-1 text-paper opacity-80">
        <Play className="h-2.5 w-2.5 fill-current" />
      </span>
      {onOpen && <ExpandOverlay />}
    </button>
  );
}
