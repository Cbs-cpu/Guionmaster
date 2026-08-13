"use client";

import {
  CAROUSEL_SLIDE_LABELS,
  type CarouselBackground,
  type CarouselSlide,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// Un slide se dibuja a proporción 4:5 y toda su tipografía se mide en `cqw`
// (porcentaje del ancho del propio slide), así que el mismo componente sirve
// para la miniatura del editor y para la vista grande sin recalcular tamaños.
// Las medidas están pensadas sobre un lienzo de 1080×1350: 1cqw = 10,8px.

const SURFACE: Record<CarouselBackground, string> = {
  claro: "bg-paper-raised text-ink",
  oscuro: "bg-ink text-paper",
  degradado: "carousel-gradient text-paper",
};

function tagColor(fondo: CarouselBackground): string {
  if (fondo === "claro") return "text-accent";
  if (fondo === "oscuro") return "text-accent-soft";
  return "text-paper/70";
}

function softColor(fondo: CarouselBackground): string {
  if (fondo === "claro") return "text-ink-soft";
  return "text-paper/70";
}

function ruleColor(fondo: CarouselBackground): string {
  return fondo === "claro" ? "border-rule" : "border-white/15";
}

export function CarouselSlideView({
  slide,
  index,
  total,
  className,
}: {
  slide: CarouselSlide;
  index: number;
  total: number;
  className?: string;
}) {
  const centered = slide.kind === "portada" || slide.kind === "cta";
  const isLast = index === total - 1;
  const numbered = slide.kind === "pasos";

  return (
    <div
      className={cn("relative aspect-[4/5] w-full overflow-hidden [container-type:inline-size]", SURFACE[slide.fondo], className)}
    >
      <div
        className={cn(
          "flex h-full flex-col",
          centered ? "justify-center" : "justify-end",
          "px-[8.5cqw] pt-[9cqw] pb-[13cqw]"
        )}
      >
        {slide.etiqueta && (
          <p className={cn("label-caps text-[2.4cqw] leading-none mb-[4cqw]", tagColor(slide.fondo))}>
            {slide.etiqueta}
          </p>
        )}

        <h3
          className={cn(
            "font-display leading-[1.12] tracking-[-0.01em]",
            centered ? "text-[8.6cqw]" : "text-[7.2cqw]"
          )}
        >
          {slide.titular || CAROUSEL_SLIDE_LABELS[slide.kind]}
        </h3>

        {slide.cuerpo && (
          <p className={cn("mt-[3.5cqw] text-[3.4cqw] leading-[1.5]", softColor(slide.fondo))}>{slide.cuerpo}</p>
        )}

        {slide.puntos.length > 0 && (
          <ul className="mt-[4cqw]">
            {slide.puntos.map((punto, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-[3.5cqw] border-b py-[2.6cqw] last:border-b-0",
                  ruleColor(slide.fondo)
                )}
              >
                {numbered ? (
                  <span
                    className={cn(
                      "font-display text-[6cqw] font-light leading-none min-w-[8cqw]",
                      tagColor(slide.fondo)
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                ) : (
                  <span
                    className={cn("mt-[1.4cqw] h-[1.4cqw] w-[1.4cqw] shrink-0 rounded-full", dotColor(slide.fondo))}
                  />
                )}
                <span className="text-[3.3cqw] leading-[1.45]">{punto}</span>
              </li>
            ))}
          </ul>
        )}

        {slide.kind === "cta" && (
          <span className="mt-[6cqw] inline-flex w-fit items-center rounded-full bg-paper px-[6cqw] py-[3cqw] text-[3.3cqw] font-medium text-accent">
            {slide.cuerpo ? "Guarda esto" : "Sígueme"}
          </span>
        )}
      </div>

      <ProgressBar index={index} total={total} fondo={slide.fondo} />
      {!isLast && <SwipeArrow fondo={slide.fondo} />}
    </div>
  );
}

function dotColor(fondo: CarouselBackground): string {
  if (fondo === "claro") return "bg-accent";
  if (fondo === "oscuro") return "bg-accent-soft";
  return "bg-paper";
}

function ProgressBar({ index, total, fondo }: { index: number; total: number; fondo: CarouselBackground }) {
  const pct = ((index + 1) / total) * 100;
  const light = fondo === "claro";
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-[2.5cqw] px-[8.5cqw] pb-[5cqw] pt-[4cqw]">
      <span
        className={cn("h-[0.7cqw] flex-1 overflow-hidden rounded-full", light ? "bg-ink/10" : "bg-white/20")}
      >
        <span
          className={cn("block h-full rounded-full", light ? "bg-accent" : "bg-paper")}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className={cn("text-[2.6cqw] leading-none", light ? "text-ink-faint" : "text-paper/60")}>
        {index + 1}/{total}
      </span>
    </div>
  );
}

function SwipeArrow({ fondo }: { fondo: CarouselBackground }) {
  const light = fondo === "claro";
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 flex w-[11cqw] items-center justify-center bg-gradient-to-r from-transparent",
        light ? "to-ink/[0.06]" : "to-white/10"
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[5.5cqw] w-[5.5cqw]">
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={light ? "text-ink/25" : "text-paper/40"}
        />
      </svg>
    </div>
  );
}
