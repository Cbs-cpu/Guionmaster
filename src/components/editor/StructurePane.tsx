"use client";

import { useState } from "react";
import { Input, Select, FieldShell } from "@/components/ui/Field";
import { StaticTag } from "@/components/ui/Chip";
import { LayoutGrid, Plus, Star, Trash2 } from "lucide-react";
import {
  CAROUSEL_SLIDE_LABELS,
  REEL_BEAT_LABELS,
  REEL_BEAT_ORDER,
  SCRIPT_STATUSES,
  SERVICIO_LABELS,
  STATUS_LABELS,
  type CarouselSlide,
  type ScriptRecord,
} from "@/lib/types";
import { cn, makeId } from "@/lib/utils";
import type { ActiveBlock } from "./types";

export function StructurePane({
  script,
  active,
  onSelectActive,
  onPatch,
}: {
  script: ScriptRecord;
  active: ActiveBlock;
  onSelectActive: (a: ActiveBlock) => void;
  onPatch: (patch: Partial<ScriptRecord>) => void;
}) {
  const [tagDraft, setTagDraft] = useState("");

  function addTag() {
    const t = tagDraft.trim();
    if (!t || script.concepts.includes(t)) return;
    onPatch({ concepts: [...script.concepts, t] });
    setTagDraft("");
  }

  function removeTag(t: string) {
    onPatch({ concepts: script.concepts.filter((c) => c !== t) });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3.5 border-b border-rule">
        <FieldShell label="Título">
          <Input value={script.title} onChange={(e) => onPatch({ title: e.target.value })} />
        </FieldShell>

        <div className="grid grid-cols-2 gap-3">
          <FieldShell label="Estado">
            <Select
              value={script.status}
              onChange={(e) => onPatch({ status: e.target.value as ScriptRecord["status"] })}
            >
              {SCRIPT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FieldShell>
          <FieldShell label="Servicio">
            <Select
              value={script.service}
              onChange={(e) => onPatch({ service: e.target.value as ScriptRecord["service"] })}
            >
              {Object.entries(SERVICIO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </FieldShell>
        </div>

        <button
          onClick={() => onPatch({ favorite: !script.favorite })}
          className="press flex items-center gap-1.5 text-xs text-ink-soft hover:text-accent"
        >
          <Star className={cn("h-3.5 w-3.5", script.favorite && "fill-accent text-accent")} />
          {script.favorite ? "En favoritos" : "Marcar como favorito"}
        </button>

        <div>
          <span className="label-caps block text-[10px] text-ink-faint mb-1.5">Conceptos</span>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {script.concepts.map((t) => (
              <button key={t} onClick={() => removeTag(t)} className="press">
                <StaticTag tone="blueprint">{t} ×</StaticTag>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Añadir concepto…"
              className="text-xs py-1.5"
            />
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <p className="label-caps text-[10px] text-ink-faint px-2 py-2">Estructura</p>

        {script.type === "carrusel" ? (
          <SlideList script={script} active={active} onSelectActive={onSelectActive} onPatch={onPatch} />
        ) : script.type === "reel" ? (
          <ul className="space-y-0.5">
            {REEL_BEAT_ORDER.map((key, i) => {
              const isActive = active.kind === "beat" && active.key === key;
              return (
                <li key={key}>
                  <button
                    onClick={() => onSelectActive({ kind: "beat", key })}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-sm text-sm flex items-center gap-2.5 transition-colors",
                      isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-sunken hover:text-ink"
                    )}
                  >
                    <span className={cn("label-caps text-[10px]", isActive ? "text-paper/60" : "text-ink-faint")}>
                      {i + 1}
                    </span>
                    {REEL_BEAT_LABELS[key]}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => onSelectActive({ kind: "meta" })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-sm text-sm flex items-center gap-2.5 transition-colors",
                  active.kind === "meta" ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-sunken hover:text-ink"
                )}
              >
                <span className={cn("label-caps text-[10px]", active.kind === "meta" ? "text-paper/60" : "text-ink-faint")}>
                  ·
                </span>
                Hook &amp; promesa
              </button>
            </li>
            {(script.chapters ?? []).map((ch, i) => {
              const isActive = active.kind === "chapter" && active.id === ch.id;
              return (
                <li key={ch.id}>
                  <button
                    onClick={() => onSelectActive({ kind: "chapter", id: ch.id })}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-sm text-sm flex items-center gap-2.5 transition-colors",
                      isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-sunken hover:text-ink"
                    )}
                  >
                    <span className={cn("label-caps text-[10px] shrink-0", isActive ? "text-paper/60" : "text-ink-faint")}>
                      {i + 1}
                    </span>
                    <span className="truncate flex-1">{ch.titulo}</span>
                    {ch.board?.needed && (
                      <LayoutGrid
                        className={cn("h-3 w-3 shrink-0", isActive ? "text-paper/70" : "text-blueprint")}
                        aria-label="Necesita tablero"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
}

function SlideList({
  script,
  active,
  onSelectActive,
  onPatch,
}: {
  script: ScriptRecord;
  active: ActiveBlock;
  onSelectActive: (a: ActiveBlock) => void;
  onPatch: (patch: Partial<ScriptRecord>) => void;
}) {
  const slides = script.slides ?? [];

  function addSlide() {
    const slide: CarouselSlide = {
      id: makeId("slide"),
      kind: "item",
      fondo: slides.length % 2 === 0 ? "claro" : "oscuro",
      etiqueta: "",
      titular: "",
      cuerpo: "",
      puntos: [],
      notaVisual: "",
    };
    // El CTA se queda siempre al final: es el único slide sin flecha de swipe.
    const ctaIndex = slides.findIndex((s) => s.kind === "cta");
    const next =
      ctaIndex >= 0
        ? [...slides.slice(0, ctaIndex), slide, ...slides.slice(ctaIndex)]
        : [...slides, slide];
    onPatch({ slides: next });
    onSelectActive({ kind: "slide", id: slide.id });
  }

  function removeSlide(id: string) {
    onPatch({ slides: slides.filter((s) => s.id !== id) });
  }

  return (
    <>
      <ul className="space-y-0.5">
        {slides.map((slide, i) => {
          const isActive = active.kind === "slide" && active.id === slide.id;
          return (
            <li key={slide.id} className="group flex items-center gap-1">
              <button
                onClick={() => onSelectActive({ kind: "slide", id: slide.id })}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2.5 rounded-sm px-3 py-2 text-left text-sm transition-colors",
                  isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-sunken hover:text-ink"
                )}
              >
                <span className={cn("label-caps text-[10px] shrink-0", isActive ? "text-paper/60" : "text-ink-faint")}>
                  {i + 1}
                </span>
                <span className="truncate">{slide.titular || CAROUSEL_SLIDE_LABELS[slide.kind]}</span>
              </button>
              {slides.length > 1 && (
                <button
                  onClick={() => removeSlide(slide.id)}
                  aria-label="Eliminar slide"
                  className="press shrink-0 p-1 text-ink-faint opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <button
        onClick={addSlide}
        className="press mt-1 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-ink-faint transition-colors hover:bg-paper-sunken hover:text-accent"
      >
        <Plus className="h-3.5 w-3.5" />
        Añadir slide
      </button>
    </>
  );
}
