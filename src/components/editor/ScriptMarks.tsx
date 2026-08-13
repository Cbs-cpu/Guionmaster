"use client";

import {
  MARK_DEFS,
  MARK_ORDER,
  markSnippet,
  parseScriptMarks,
  type MarkDef,
  type MarkKey,
} from "@/lib/script-marks";
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

/** El texto hablado con sus marcas reveladas: para grabar y para montar. */
export function MarkedText({ text, className }: { text: string; className?: string }) {
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
        return <MarkChip key={i} def={token.def} text={token.text} />;
      })}
    </p>
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
      <span>· marcas de edición en píldora ·</span>
    </div>
  );
}
