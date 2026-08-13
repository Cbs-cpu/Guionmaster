"use client";

import { useRef, useState } from "react";
import { CarouselSlideView } from "./CarouselSlideView";
import { SystemMark } from "@/components/nav/Sidebar";
import type { CarouselSlide } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, Send } from "lucide-react";

/**
 * Vista previa del carrusel tal y como se verá en el feed: se pasa con el
 * dedo, con la rueda o con las flechas, y cada slide es exactamente la
 * imagen que luego se publica.
 */
export function CarouselDeck({
  slides,
  caption,
  className,
}: {
  slides: CarouselSlide[];
  caption?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function scrollTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  function go(delta: number) {
    const next = Math.max(0, Math.min(slides.length - 1, index + delta));
    setIndex(next);
    scrollTo(next);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next === index || next < 0 || next >= slides.length) return;
    setIndex(next);
  }

  if (slides.length === 0) {
    return (
      <div className={cn("paper-panel rounded-sm px-6 py-10 text-center", className)}>
        <p className="text-sm text-ink-faint">Este carrusel todavía no tiene slides.</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-[26rem]", className)}>
      <div className="paper-panel overflow-hidden rounded-sm">
        <div className="flex items-center gap-2.5 border-b border-rule px-3.5 py-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-rule bg-paper">
            <SystemMark className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium leading-tight">system.content.studio</p>
            <p className="truncate text-[10.5px] text-ink-faint">Una empresa es un sistema</p>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {slides.map((slide, i) => (
            <div key={slide.id} className="w-full shrink-0 snap-center">
              <CarouselSlideView slide={slide} index={i} total={slides.length} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
          <div className="flex items-center gap-3 text-ink-soft">
            <Heart className="h-4 w-4" />
            <MessageCircle className="h-4 w-4" />
            <Send className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => {
                  setIndex(i);
                  scrollTo(i);
                }}
                aria-label={`Ir al slide ${i + 1}`}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === index ? "bg-accent" : "bg-rule-strong"
                )}
              />
            ))}
          </div>
          <Bookmark className="h-4 w-4 text-ink-soft" />
        </div>

        {caption && (
          <p className="border-t border-rule px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">system.content.studio</span> {caption}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="press label-caps flex items-center gap-1 text-[10px] text-ink-soft hover:text-accent disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Anterior
        </button>
        <span className="label-caps text-[10px] text-ink-faint">
          {index + 1} / {slides.length}
        </span>
        <button
          onClick={() => go(1)}
          disabled={index === slides.length - 1}
          className="press label-caps flex items-center gap-1 text-[10px] text-ink-soft hover:text-accent disabled:pointer-events-none disabled:opacity-30"
        >
          Siguiente
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
