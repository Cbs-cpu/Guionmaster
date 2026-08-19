"use client";

import { useRef, useState } from "react";
import {
  MARK_DEFS,
  MARK_ORDER,
  markSnippet,
  parseScriptMarks,
  type MarkDef,
  type MarkKey,
} from "@/lib/script-marks";
import type { VisualResource } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Captions,
  Clapperboard,
  Pause,
  Scissors,
  Sparkles,
  StickyNote,
  ZoomIn,
} from "lucide-react";

const MARK_ICONS: Record<MarkKey, React.ComponentType<{ className?: string }>> = {
  sub: Captions,
  anim: Sparkles,
  corte: Scissors,
  zoom: ZoomIn,
  broll: Clapperboard,
  grafico: BarChart3,
  pausa: Pause,
  nota: StickyNote,
};

const TONE_CLASSES: Record<MarkDef["tone"], string> = {
  accent: "border-accent/40 bg-accent-soft text-accent",
  blueprint: "border-blueprint/40 bg-blueprint-soft text-blueprint",
  ink: "border-rule-strong bg-paper-sunken text-ink-soft",
};

/**
 * El texto hablado con sus marcas reveladas: para grabar y para montar.
 *
 * `visuals` son los recursos del guion. Sirven para resolver las anclas
 * `[[clave|frase]]`: la clave es el id de la composición de Remotion, y el
 * recurso registrado se llama `visual_anim_<clave>` (lo nombra así
 * scripts/render-animacion.mjs al enganchar el MP4 al guion).
 */
export function MarkedText({
  text,
  visuals,
  className,
}: {
  text: string;
  visuals?: VisualResource[];
  className?: string;
}) {
  const tokens = parseScriptMarks(text);

  if (!text.trim()) {
    return <p className={cn("text-ink-faint italic", className)}>Este bloque todavía está vacío.</p>;
  }

  return (
    <p className={cn("whitespace-pre-wrap", className)}>
      {tokens.map((token, i) => {
        if (token.kind === "texto") return <span key={i}>{token.text}</span>;
        if (token.kind === "enfasis")
          return (
            <span key={i} className="underline decoration-accent decoration-2 underline-offset-[6px]">
              {token.text}
            </span>
          );
        if (token.kind === "clave")
          return (
            <mark key={i} className="bg-accent-soft text-ink px-1 rounded-[2px] box-decoration-clone">
              {token.text}
            </mark>
          );
        if (token.kind === "ancla")
          return (
            <AnclaAnimacion
              key={i}
              clave={token.clave}
              texto={token.text}
              visual={visuals?.find((v) => v.id === `visual_anim_${token.clave}`)}
            />
          );
        return <MarkChip key={i} def={token.def} text={token.text} />;
      })}
    </p>
  );
}

/**
 * Un tramo de texto hablado enlazado a su animación de contexto.
 *
 * La tarjeta va en `position: fixed` y no dentro del propio span. Parece un
 * rodeo, pero el guion se lee dentro de un contenedor con scroll: una tarjeta
 * posicionada en el flujo se recortaría contra el borde del panel justo cuando
 * el ancla está cerca del final, que es la mitad de las veces.
 */
function AnclaAnimacion({
  clave,
  texto,
  visual,
}: {
  clave: string;
  texto: string;
  visual?: VisualResource;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [caja, setCaja] = useState<{ x: number; y: number; arriba: boolean } | null>(null);

  const ALTO_TARJETA = 250;

  function abrir() {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    // Si no cabe por arriba, la tarjeta cae por debajo de la frase.
    const arriba = r.top > ALTO_TARJETA + 16;
    setCaja({ x: r.left + r.width / 2, y: arriba ? r.top - 10 : r.bottom + 10, arriba });
  }

  return (
    <span
      ref={ref}
      onMouseEnter={abrir}
      onMouseLeave={() => setCaja(null)}
      className={cn(
        "relative cursor-help underline decoration-2 underline-offset-[6px] transition-colors box-decoration-clone",
        visual
          ? "decoration-blueprint hover:bg-blueprint-soft"
          : "decoration-dotted decoration-ink-faint hover:bg-paper-sunken"
      )}
    >
      {texto}
      {caja && (
        <span
          className="pointer-events-none fixed z-50 block w-[380px] -translate-x-1/2 rounded-sm border border-rule-strong bg-paper p-2 shadow-lg"
          style={{
            left: caja.x,
            top: caja.y,
            transform: `translateX(-50%) ${caja.arriba ? "translateY(-100%)" : ""}`,
          }}
        >
          {visual ? (
            <video
              src={`/api/media/${visual.filePath}`}
              muted
              loop
              autoPlay
              playsInline
              className="block w-full rounded-[2px] bg-paper-sunken"
            />
          ) : (
            <span className="block px-2 py-6 text-center text-[12px] leading-relaxed text-ink-faint">
              La animación <code className="text-ink-soft">{clave}</code> todavía no está
              renderizada.
              <br />
              <span className="text-[11px]">npm run anim:render -- {clave} --script=…</span>
            </span>
          )}
          <span className="label-caps mt-1.5 flex items-center gap-1 px-0.5 text-[9.5px] text-ink-faint">
            <Sparkles className="h-2.5 w-2.5" />
            {clave}
          </span>
        </span>
      )}
    </span>
  );
}

function MarkChip({ def, text }: { def: MarkDef; text: string }) {
  const Icon = MARK_ICONS[def.key];
  return (
    <span
      className={cn(
        "label-caps mx-1 inline-flex translate-y-[-0.1em] items-center gap-1 rounded-full border px-2 py-0.5 align-middle text-[10px] leading-none",
        TONE_CLASSES[def.tone]
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {def.label}
      {text && <span className="font-body normal-case tracking-normal opacity-80">· {text}</span>}
    </span>
  );
}

/** Botonera para anotar el texto sin memorizar la sintaxis. */
export function MarkToolbar({
  onInsert,
  className,
}: {
  onInsert: (snippet: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      <span className="label-caps text-[9.5px] text-ink-faint mr-0.5">Marcar</span>
      <ToolbarButton label="Énfasis" onClick={() => onInsert("*texto*")} />
      <ToolbarButton label="Clave" onClick={() => onInsert("**texto**")} />
      <ToolbarButton
        label="Ancla"
        icon={<Sparkles className="h-2.5 w-2.5" />}
        onClick={() => onInsert("[[id-animacion|frase hablada]]")}
      />
      {MARK_ORDER.map((key) => {
        const def = MARK_DEFS[key];
        const Icon = MARK_ICONS[key];
        return (
          <ToolbarButton
            key={key}
            label={def.label}
            icon={<Icon className="h-2.5 w-2.5" />}
            onClick={() => onInsert(markSnippet(def))}
          />
        );
      })}
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press label-caps inline-flex items-center gap-1 rounded-full border border-rule px-2 py-0.5 text-[9.5px] text-ink-faint transition-colors hover:border-accent hover:text-accent"
    >
      {icon}
      {label}
    </button>
  );
}

export function MarkLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-faint">
      <span className="inline-flex items-center gap-1.5">
        <span className="underline decoration-accent decoration-2 underline-offset-2 text-ink-soft">subrayado</span>
        dilo con intención
      </span>
      <span className="inline-flex items-center gap-1.5">
        <mark className="bg-accent-soft text-ink px-1 rounded-[2px]">resaltado</mark>
        la idea que no se puede perder
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="underline decoration-blueprint decoration-2 underline-offset-2 text-ink-soft">
          con animación
        </span>
        pasa el ratón para verla
      </span>
      <span>· marcas de edición en píldora ·</span>
    </div>
  );
}
