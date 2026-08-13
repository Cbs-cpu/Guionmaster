"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReadFlowSection {
  id: string;
  label: string;
  content: React.ReactNode;
}

// Vista de lectura continua compartida por el editor de guiones y la
// biblioteca de conocimiento: todas las secciones en un único scroll, con
// un contador + Anterior/Siguiente (y flechas de teclado) para moverse sin
// perder el sitio, y sincronización del índice actual al hacer scroll a mano.
export function ReadFlow({
  sections,
  initialId,
  onIndexChange,
  onExit,
  modeLabel,
  toolbar,
}: {
  sections: ReadFlowSection[];
  initialId?: string;
  onIndexChange?: (section: ReadFlowSection, index: number) => void;
  onExit: () => void;
  modeLabel?: string;
  toolbar?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const initialIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === initialId)
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    sectionRefs.current[initialIndex]?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(index: number, behavior: ScrollBehavior = "smooth") {
    const clamped = Math.max(0, Math.min(sections.length - 1, index));
    setCurrentIndex(clamped);
    onIndexChange?.(sections[clamped], clamped);
    sectionRefs.current[clamped]?.scrollIntoView({ block: "start", behavior });
  }

  function handleScroll() {
    const container = containerRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;
    let closest = 0;
    let closestDistance = Infinity;
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const distance = Math.abs(el.getBoundingClientRect().top - containerTop);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    });
    setCurrentIndex(closest);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "textarea" || tag === "input") return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(currentIndex + 1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goTo(currentIndex - 1);
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-3 border-b border-rule bg-paper-raised shrink-0">
        <span className="flex min-w-0 items-center gap-2">
          {modeLabel && (
            <span className="label-caps shrink-0 rounded-full bg-ink px-2 py-0.5 text-[9px] text-paper">
              {modeLabel}
            </span>
          )}
          <span className="label-caps text-[10px] text-ink-faint truncate">
            {currentIndex + 1} / {sections.length} · {sections[currentIndex]?.label}
          </span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {toolbar}
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="press label-caps flex items-center gap-1 text-[10px] text-ink-soft hover:text-accent disabled:opacity-30 disabled:pointer-events-none px-2 py-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === sections.length - 1}
            className="press label-caps flex items-center gap-1 text-[10px] text-ink-soft hover:text-accent disabled:opacity-30 disabled:pointer-events-none px-2 py-1"
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onExit}
            className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-faint hover:text-accent ml-2 pl-2 border-l border-rule"
          >
            <Minimize2 className="h-3 w-3" />
            Salir
          </button>
        </div>
      </div>

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
        {sections.map((section, i) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className={cn("max-w-3xl mx-auto px-5 sm:px-8 py-10", i > 0 && "border-t border-rule")}
          >
            <p className="label-caps text-[11px] text-accent mb-3">
              {String(i + 1).padStart(2, "0")} · {section.label}
            </p>
            {section.content}
          </div>
        ))}
        <div className="h-[40vh]" />
      </div>
    </div>
  );
}
