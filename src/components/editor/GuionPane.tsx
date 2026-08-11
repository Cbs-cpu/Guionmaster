"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldShell, Input, Textarea } from "@/components/ui/Field";
import { REEL_BEAT_LABELS, REEL_BEAT_ORDER, type ReelBeat, type ScriptRecord, type YoutubeChapter } from "@/lib/types";
import { estimateSpeakingSeconds, formatSeconds, cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import type { ActiveBlock } from "./types";

interface Section {
  active: ActiveBlock;
  label: string;
  text: string;
  onChange: (v: string) => void;
}

function useSections(
  script: ScriptRecord,
  onUpdateBeat: (key: ReelBeat["key"], patch: Partial<ReelBeat>) => void,
  onUpdateChapter: (id: string, patch: Partial<YoutubeChapter>) => void,
  onUpdateMeta: (patch: { youtubeHook?: string; promesa?: string }) => void
): Section[] {
  return useMemo(() => {
    if (script.type === "reel") {
      return REEL_BEAT_ORDER.map((key) => {
        const beat = script.beats?.find((b) => b.key === key);
        return {
          active: { kind: "beat", key } as ActiveBlock,
          label: REEL_BEAT_LABELS[key],
          text: beat?.textoHablado ?? "",
          onChange: (v: string) => onUpdateBeat(key, { textoHablado: v }),
        };
      });
    }
    const metaSection: Section = {
      active: { kind: "meta" } as ActiveBlock,
      label: "Hook (apertura)",
      text: script.youtubeHook ?? "",
      onChange: (v: string) => onUpdateMeta({ youtubeHook: v }),
    };
    const chapterSections: Section[] = (script.chapters ?? []).map((c) => ({
      active: { kind: "chapter", id: c.id } as ActiveBlock,
      label: c.titulo,
      text: c.guion,
      onChange: (v: string) => onUpdateChapter(c.id, { guion: v }),
    }));
    return [metaSection, ...chapterSections];
  }, [script, onUpdateBeat, onUpdateChapter, onUpdateMeta]);
}

function sameActive(a: ActiveBlock, b: ActiveBlock): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "beat" && b.kind === "beat") return a.key === b.key;
  if (a.kind === "chapter" && b.kind === "chapter") return a.id === b.id;
  return a.kind === "meta";
}

export function GuionPane({
  script,
  active,
  readMode,
  onToggleReadMode,
  onNavigateActive,
  onUpdateBeat,
  onUpdateChapter,
  onUpdateMeta,
}: {
  script: ScriptRecord;
  active: ActiveBlock;
  readMode: boolean;
  onToggleReadMode: () => void;
  onNavigateActive: (active: ActiveBlock) => void;
  onUpdateBeat: (key: ReelBeat["key"], patch: Partial<ReelBeat>) => void;
  onUpdateChapter: (id: string, patch: Partial<YoutubeChapter>) => void;
  onUpdateMeta: (patch: { youtubeHook?: string; promesa?: string }) => void;
}) {
  const sections = useSections(script, onUpdateBeat, onUpdateChapter, onUpdateMeta);

  if (readMode) {
    return (
      <ReadMode sections={sections} active={active} onNavigateActive={onNavigateActive} onExit={onToggleReadMode} />
    );
  }

  const header = (
    <button
      onClick={onToggleReadMode}
      className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-faint hover:text-accent shrink-0"
    >
      <Maximize2 className="h-3 w-3" />
      Modo lectura
    </button>
  );

  if (active.kind === "beat") {
    const beat = script.beats?.find((b) => b.key === active.key);
    if (!beat) return <EmptyState />;
    return (
      <div className="mx-auto max-w-2xl p-5 sm:p-6">
        <SpokenText
          label={`${REEL_BEAT_LABELS[active.key]} · texto hablado`}
          value={beat.textoHablado}
          onChange={(v) => onUpdateBeat(active.key, { textoHablado: v })}
          headerRight={header}
        />

        <div className="mt-6 pt-6 border-t border-rule space-y-4">
          <p className="label-caps text-[10px] text-ink-faint">Notas de producción</p>
          <div className="grid sm:grid-cols-[10rem_1fr] gap-2 sm:gap-4 items-start">
            <FieldShell label="Tiempo aprox.">
              <Input
                value={beat.tiempoAprox}
                onChange={(e) => onUpdateBeat(active.key, { tiempoAprox: e.target.value })}
                className="text-xs py-1.5"
              />
            </FieldShell>
            <FieldShell label="Texto en pantalla">
              <Input
                value={beat.textoPantalla}
                onChange={(e) => onUpdateBeat(active.key, { textoPantalla: e.target.value })}
                className="text-xs py-1.5"
              />
            </FieldShell>
          </div>
          <FieldShell label="Visual sugerido">
            <Textarea
              value={beat.visualSugerido}
              onChange={(e) => onUpdateBeat(active.key, { visualSugerido: e.target.value })}
              rows={2}
              className="text-xs"
            />
          </FieldShell>
        </div>
      </div>
    );
  }

  if (active.kind === "meta") {
    return (
      <div className="mx-auto max-w-2xl p-5 sm:p-6">
        <SpokenText
          label="Hook (apertura)"
          value={script.youtubeHook ?? ""}
          onChange={(v) => onUpdateMeta({ youtubeHook: v })}
          headerRight={header}
        />
        <div className="mt-6 pt-6 border-t border-rule">
          <FieldShell label="Promesa" hint="Qué aprenderá el espectador si se queda">
            <Textarea value={script.promesa ?? ""} onChange={(e) => onUpdateMeta({ promesa: e.target.value })} rows={2} />
          </FieldShell>
        </div>
      </div>
    );
  }

  const chapter = script.chapters?.find((c) => c.id === active.id);
  if (!chapter) return <EmptyState />;

  return (
    <div className="mx-auto max-w-2xl p-5 sm:p-6">
      <div className="space-y-4 mb-6 pb-6 border-b border-rule">
        <FieldShell label="Título del capítulo">
          <Input value={chapter.titulo} onChange={(e) => onUpdateChapter(chapter.id, { titulo: e.target.value })} />
        </FieldShell>
        <FieldShell label="Resumen">
          <Textarea value={chapter.resumen} onChange={(e) => onUpdateChapter(chapter.id, { resumen: e.target.value })} rows={2} />
        </FieldShell>
      </div>

      <SpokenText
        label="Guion"
        value={chapter.guion}
        onChange={(v) => onUpdateChapter(chapter.id, { guion: v })}
        headerRight={header}
      />

      <div className="mt-6 pt-6 border-t border-rule space-y-4">
        <p className="label-caps text-[10px] text-ink-faint">Notas de producción</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldShell label="Qué mostrar">
            <Textarea
              value={chapter.visual.queMostrar}
              onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, queMostrar: e.target.value } })}
              rows={2}
              className="text-xs"
            />
          </FieldShell>
          <FieldShell label="Qué explicar">
            <Textarea
              value={chapter.visual.queExplicar}
              onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, queExplicar: e.target.value } })}
              rows={2}
              className="text-xs"
            />
          </FieldShell>
          <FieldShell label="B-roll">
            <Textarea
              value={chapter.visual.bRoll}
              onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, bRoll: e.target.value } })}
              rows={2}
              className="text-xs"
            />
          </FieldShell>
          <FieldShell label="Capturas">
            <Textarea
              value={chapter.visual.capturas}
              onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, capturas: e.target.value } })}
              rows={2}
              className="text-xs"
            />
          </FieldShell>
          <div className="sm:col-span-2">
            <FieldShell label="Diagramas">
              <Textarea
                value={chapter.visual.diagramas}
                onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, diagramas: e.target.value } })}
                rows={2}
                className="text-xs"
              />
            </FieldShell>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadMode({
  sections,
  active,
  onNavigateActive,
  onExit,
}: {
  sections: Section[];
  active: ActiveBlock;
  onNavigateActive: (active: ActiveBlock) => void;
  onExit: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const initialIndex = Math.max(
    0,
    sections.findIndex((s) => sameActive(s.active, active))
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Al entrar en modo lectura, sitúa la vista en la sección que estaba activa.
  useEffect(() => {
    sectionRefs.current[initialIndex]?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(index: number, behavior: ScrollBehavior = "smooth") {
    const clamped = Math.max(0, Math.min(sections.length - 1, index));
    setCurrentIndex(clamped);
    onNavigateActive(sections[clamped].active);
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
        <span className="label-caps text-[10px] text-ink-faint">
          {currentIndex + 1} / {sections.length} · {sections[currentIndex]?.label}
        </span>
        <div className="flex items-center gap-1">
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
            key={i}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className={cn(
              "max-w-3xl mx-auto px-5 sm:px-8 py-10",
              i > 0 && "border-t border-rule"
            )}
          >
            <p className="label-caps text-[11px] text-accent mb-3">
              {String(i + 1).padStart(2, "0")} · {section.label}
            </p>
            <Textarea
              value={section.text}
              onChange={(e) => section.onChange(e.target.value)}
              rows={Math.max(4, Math.ceil(section.text.length / 45))}
              placeholder="Escribe aquí el texto que se dice a cámara…"
              className="font-display text-2xl sm:text-[1.75rem] leading-[1.75] border-none bg-transparent shadow-none px-0 py-1 focus:ring-0 resize-none"
            />
            <p className="text-[11px] text-ink-faint mt-2">~{formatSeconds(estimateSpeakingSeconds(section.text))} al leerlo</p>
          </div>
        ))}
        <div className="h-[40vh]" />
      </div>
    </div>
  );
}

function SpokenText({
  label,
  value,
  onChange,
  headerRight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  headerRight: React.ReactNode;
}) {
  const seconds = estimateSpeakingSeconds(value);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="label-caps text-[10px] text-ink-faint">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-ink-faint whitespace-nowrap">~{formatSeconds(seconds)} al leerlo</span>
          {headerRight}
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Escribe aquí el texto que se dice a cámara…"
        className="font-display leading-[1.75] text-[15px]"
      />
    </div>
  );
}

function EmptyState() {
  return <div className="p-6 text-sm text-ink-faint">Selecciona un bloque de la estructura.</div>;
}
