"use client";

import { useMemo, useRef } from "react";
import { FieldShell, Input, Select, Textarea } from "@/components/ui/Field";
import { ReadFlow, type ReadFlowSection } from "@/components/ui/ReadFlow";
import { CarouselSlideView } from "@/components/carousel/CarouselSlideView";
import { MarkedText, MarkLegend, MarkToolbar } from "./ScriptMarks";
import {
  CAROUSEL_SLIDE_LABELS,
  REEL_BEAT_LABELS,
  REEL_BEAT_ORDER,
  type CarouselBackground,
  type CarouselSlide,
  type CarouselSlideKind,
  type ReelBeat,
  type ScriptRecord,
  type YoutubeChapter,
} from "@/lib/types";
import { estimateSpeakingSeconds, formatSeconds } from "@/lib/utils";
import { stripScriptMarks } from "@/lib/script-marks";
import { LayoutGrid, Maximize2, SquarePen } from "lucide-react";
import type { ActiveBlock, ViewMode } from "./types";
import { BOARD_DEPTH_LABELS, type BoardDepth, type ChapterBoard } from "@/lib/types";

interface Cue {
  label: string;
  value: string;
}

interface Section {
  id: string;
  active: ActiveBlock;
  label: string;
  text: string;
  onChange: (v: string) => void;
  cues: Cue[];
}

function activeToId(active: ActiveBlock): string {
  if (active.kind === "beat") return `beat:${active.key}`;
  if (active.kind === "chapter") return `chapter:${active.id}`;
  if (active.kind === "slide") return `slide:${active.id}`;
  return "meta";
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
        const active: ActiveBlock = { kind: "beat", key };
        return {
          id: activeToId(active),
          active,
          label: REEL_BEAT_LABELS[key],
          text: beat?.textoHablado ?? "",
          onChange: (v: string) => onUpdateBeat(key, { textoHablado: v }),
          cues: [
            { label: "Tiempo", value: beat?.tiempoAprox ?? "" },
            { label: "En pantalla", value: beat?.textoPantalla ?? "" },
            { label: "Visual", value: beat?.visualSugerido ?? "" },
          ].filter((c) => c.value),
        };
      });
    }
    const metaActive: ActiveBlock = { kind: "meta" };
    const metaSection: Section = {
      id: activeToId(metaActive),
      active: metaActive,
      label: "Hook (apertura)",
      text: script.youtubeHook ?? "",
      onChange: (v: string) => onUpdateMeta({ youtubeHook: v }),
      cues: script.promesa ? [{ label: "Promesa", value: script.promesa }] : [],
    };
    const chapterSections: Section[] = (script.chapters ?? []).map((c) => {
      const active: ActiveBlock = { kind: "chapter", id: c.id };
      return {
        id: activeToId(active),
        active,
        label: c.titulo,
        text: c.guion,
        onChange: (v: string) => onUpdateChapter(c.id, { guion: v }),
        cues: [
          { label: "Qué mostrar", value: c.visual.queMostrar },
          { label: "B-roll", value: c.visual.bRoll },
          { label: "Capturas", value: c.visual.capturas },
          { label: "Diagramas", value: c.visual.diagramas },
        ].filter((cue) => cue.value),
      };
    });
    return [metaSection, ...chapterSections];
  }, [script, onUpdateBeat, onUpdateChapter, onUpdateMeta]);
}

export function GuionPane({
  script,
  active,
  viewMode,
  onSetViewMode,
  onNavigateActive,
  onUpdateBeat,
  onUpdateChapter,
  onUpdateMeta,
  onUpdateSlide,
}: {
  script: ScriptRecord;
  active: ActiveBlock;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onNavigateActive: (active: ActiveBlock) => void;
  onUpdateBeat: (key: ReelBeat["key"], patch: Partial<ReelBeat>) => void;
  onUpdateChapter: (id: string, patch: Partial<YoutubeChapter>) => void;
  onUpdateMeta: (patch: { youtubeHook?: string; promesa?: string }) => void;
  onUpdateSlide: (id: string, patch: Partial<CarouselSlide>) => void;
}) {
  const sections = useSections(script, onUpdateBeat, onUpdateChapter, onUpdateMeta);
  const slides = script.slides ?? [];

  if (script.type === "carrusel" && viewMode !== "edicion") {
    const flowSections: ReadFlowSection[] = slides.map((slide, i) => ({
      id: `slide:${slide.id}`,
      label: CAROUSEL_SLIDE_LABELS[slide.kind],
      content: (
        <div className="mx-auto max-w-sm space-y-4">
          <CarouselSlideView slide={slide} index={i} total={slides.length} className="rounded-sm border border-rule" />
          {viewMode === "guion" && slide.notaVisual && (
            <CueRail cues={[{ label: "Visual", value: slide.notaVisual }]} />
          )}
        </div>
      ),
    }));
    return (
      <ReadFlow
        sections={flowSections}
        initialId={activeToId(active)}
        modeLabel={viewMode === "guion" ? "Modo guion" : "Modo lectura"}
        onIndexChange={(_, i) => onNavigateActive({ kind: "slide", id: slides[i].id })}
        onExit={() => onSetViewMode("edicion")}
      />
    );
  }

  if (viewMode === "lectura") {
    const flowSections: ReadFlowSection[] = sections.map((s) => ({
      id: s.id,
      label: s.label,
      content: (
        <>
          <Textarea
            value={s.text}
            onChange={(e) => s.onChange(e.target.value)}
            rows={Math.max(4, Math.ceil(s.text.length / 45))}
            placeholder="Escribe aquí el texto que se dice a cámara…"
            className="font-display text-2xl sm:text-[1.75rem] leading-[1.75] border-none bg-transparent shadow-none px-0 py-1 focus:ring-0 resize-none"
          />
          <p className="text-[11px] text-ink-faint mt-2">~{formatSeconds(speakingSeconds(s.text))} al leerlo</p>
        </>
      ),
    }));
    return (
      <ReadFlow
        sections={flowSections}
        initialId={activeToId(active)}
        modeLabel="Modo lectura"
        onIndexChange={(_, i) => onNavigateActive(sections[i].active)}
        onExit={() => onSetViewMode("edicion")}
      />
    );
  }

  if (viewMode === "guion") {
    const flowSections: ReadFlowSection[] = sections.map((s) => ({
      id: s.id,
      label: s.label,
      content: (
        <>
          <MarkedText
            text={s.text}
            visuals={script.visuals}
            className="font-display text-2xl sm:text-[1.75rem] leading-[1.75]"
          />
          <p className="text-[11px] text-ink-faint mt-3">~{formatSeconds(speakingSeconds(s.text))} al leerlo</p>
          {s.cues.length > 0 && <CueRail cues={s.cues} className="mt-5" />}
        </>
      ),
    }));
    return (
      <ReadFlow
        sections={flowSections}
        initialId={activeToId(active)}
        modeLabel="Modo guion"
        toolbar={<MarkLegendToggle />}
        onIndexChange={(_, i) => onNavigateActive(sections[i].active)}
        onExit={() => onSetViewMode("edicion")}
      />
    );
  }

  if (viewMode === "tableros") {
    const chapters = script.chapters ?? [];
    const withBoard = chapters.filter((c) => c.board?.needed || c.board?.script);
    if (withBoard.length === 0) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-3 border-b border-rule bg-paper-raised shrink-0">
            <span className="label-caps text-[10px] text-ink-faint">Modo tableros</span>
            <button
              onClick={() => onSetViewMode("edicion")}
              className="press label-caps text-[10px] text-ink-faint hover:text-accent"
            >
              Salir
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <p className="max-w-sm text-sm text-ink-faint leading-relaxed">
              Ningún capítulo tiene tablero marcado todavía. En Modo edición, abre un capítulo y
              activa &quot;Necesita tablero&quot; en Notas de producción → Tablero.
            </p>
          </div>
        </div>
      );
    }
    const flowSections: ReadFlowSection[] = withBoard.map((c) => ({
      id: `chapter:${c.id}`,
      label: c.titulo,
      content: c.board?.script ? (
        <>
          {c.board.depth && (
            <p className="label-caps text-[10px] text-blueprint mb-3">{BOARD_DEPTH_LABELS[c.board.depth]}</p>
          )}
          <pre className="whitespace-pre-wrap font-label text-[13px] leading-relaxed text-ink">
            {c.board.script}
          </pre>
        </>
      ) : (
        <p className="text-sm text-ink-faint">
          Marcado como &quot;necesita tablero&quot; pero todavía no tiene guion de tablero. Pídeselo a
          Claude Code (skill <code className="text-ink-soft">guionizador</code>) o pégalo en Modo edición.
        </p>
      ),
    }));
    return (
      <ReadFlow
        sections={flowSections}
        initialId={active.kind === "chapter" ? `chapter:${active.id}` : undefined}
        modeLabel="Modo tableros"
        onIndexChange={(_, i) => onNavigateActive({ kind: "chapter", id: withBoard[i].id })}
        onExit={() => onSetViewMode("edicion")}
      />
    );
  }

  const header = (
    <ModeButtons onSetViewMode={onSetViewMode} showTableros={script.type === "youtube"} />
  );

  if (script.type === "carrusel") {
    const slide = slides.find((s) => active.kind === "slide" && s.id === active.id) ?? slides[0];
    if (!slide) return <EmptyState />;
    const position = slides.indexOf(slide);
    return (
      <div className="mx-auto max-w-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="label-caps text-[10px] text-ink-faint">
            Slide {position + 1} · {CAROUSEL_SLIDE_LABELS[slide.kind]}
          </span>
          {header}
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_15rem]">
          <SlideForm slide={slide} onUpdate={(patch) => onUpdateSlide(slide.id, patch)} />
          <div className="order-first sm:order-last">
            <CarouselSlideView
              slide={slide}
              index={position}
              total={slides.length}
              className="rounded-sm border border-rule"
            />
            <p className="mt-2 text-[11px] text-ink-faint">Vista previa 4:5</p>
          </div>
        </div>
      </div>
    );
  }

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

  const chapter = script.chapters?.find((c) => active.kind === "chapter" && c.id === active.id);
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

      <ChapterBoardFields
        board={chapter.board}
        onChange={(board) => onUpdateChapter(chapter.id, { board })}
      />
    </div>
  );
}

function ChapterBoardFields({
  board,
  onChange,
}: {
  board: ChapterBoard | undefined;
  onChange: (board: ChapterBoard) => void;
}) {
  const needed = board?.needed ?? false;

  function patch(p: Partial<ChapterBoard>) {
    onChange({ needed, script: board?.script, depth: board?.depth, ...p, updatedAt: new Date().toISOString() });
  }

  return (
    <div className="mt-6 pt-6 border-t border-rule space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="label-caps text-[10px] text-ink-faint">Tablero</p>
        <label className="flex items-center gap-2 text-xs text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={needed}
            onChange={(e) => patch({ needed: e.target.checked })}
            className="accent-accent"
          />
          Necesita tablero
        </label>
      </div>

      {needed && (
        <>
          <FieldShell label="Profundidad" hint="Referencia para la skill guionizador, no una regla estricta">
            <Select
              value={board?.depth ?? "standard"}
              onChange={(e) => patch({ depth: e.target.value as BoardDepth })}
              className="text-xs py-1.5"
            >
              {Object.entries(BOARD_DEPTH_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </FieldShell>
          <FieldShell
            label="Guion de tablero (board-script.md)"
            hint="Pégalo aquí tras pedírselo a Claude Code con la skill guionizador, o escríbelo a mano"
          >
            <Textarea
              value={board?.script ?? ""}
              onChange={(e) => patch({ script: e.target.value })}
              rows={10}
              placeholder="# BOARD SCRIPT&#10;&#10;## 0. Metadata&#10;..."
              className="font-label text-[12px] leading-relaxed"
            />
          </FieldShell>
        </>
      )}
    </div>
  );
}

/** Las marcas de edición no se pronuncian, así que no cuentan para el tiempo. */
function speakingSeconds(text: string): number {
  return estimateSpeakingSeconds(stripScriptMarks(text));
}

function ModeButtons({
  onSetViewMode,
  showTableros,
}: {
  onSetViewMode: (mode: ViewMode) => void;
  showTableros?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <button
        onClick={() => onSetViewMode("lectura")}
        className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-faint hover:text-accent"
      >
        <Maximize2 className="h-3 w-3" />
        Lectura
      </button>
      <button
        onClick={() => onSetViewMode("guion")}
        title="Pantalla completa con las marcas de edición reveladas"
        className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-faint hover:text-accent"
      >
        <SquarePen className="h-3 w-3" />
        Guion
      </button>
      {showTableros && (
        <button
          onClick={() => onSetViewMode("tableros")}
          title="Guiones de tablero (formato canvas-guionizador) de los capítulos"
          className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-faint hover:text-accent"
        >
          <LayoutGrid className="h-3 w-3" />
          Tableros
        </button>
      )}
    </div>
  );
}

function MarkLegendToggle() {
  return (
    <span className="hidden xl:block mr-2 pr-2 border-r border-rule">
      <MarkLegend />
    </span>
  );
}

function CueRail({ cues, className }: { cues: Cue[]; className?: string }) {
  return (
    <ul className={className}>
      {cues.map((cue) => (
        <li key={cue.label} className="flex gap-3 border-l-2 border-blueprint/40 pl-3 py-1">
          <span className="label-caps w-24 shrink-0 text-[9.5px] text-blueprint">{cue.label}</span>
          <span className="text-[13px] leading-snug text-ink-soft">{cue.value}</span>
        </li>
      ))}
    </ul>
  );
}

function SlideForm({ slide, onUpdate }: { slide: CarouselSlide; onUpdate: (patch: Partial<CarouselSlide>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FieldShell label="Tipo de slide">
          <Select
            value={slide.kind}
            onChange={(e) => onUpdate({ kind: e.target.value as CarouselSlideKind })}
            className="text-xs py-1.5"
          >
            {Object.entries(CAROUSEL_SLIDE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FieldShell>
        <FieldShell label="Fondo">
          <Select
            value={slide.fondo}
            onChange={(e) => onUpdate({ fondo: e.target.value as CarouselBackground })}
            className="text-xs py-1.5"
          >
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
            <option value="degradado">Degradado</option>
          </Select>
        </FieldShell>
      </div>

      <FieldShell label="Etiqueta" hint="El rótulo pequeño de arriba">
        <Input
          value={slide.etiqueta}
          onChange={(e) => onUpdate({ etiqueta: e.target.value })}
          className="text-xs py-1.5"
        />
      </FieldShell>

      <FieldShell label="Titular">
        <Textarea
          value={slide.titular}
          onChange={(e) => onUpdate({ titular: e.target.value })}
          rows={2}
          className="font-display text-[15px]"
        />
      </FieldShell>

      <FieldShell label="Cuerpo">
        <Textarea value={slide.cuerpo} onChange={(e) => onUpdate({ cuerpo: e.target.value })} rows={3} className="text-xs" />
      </FieldShell>

      <FieldShell label="Puntos" hint="Uno por línea">
        <Textarea
          value={slide.puntos.join("\n")}
          onChange={(e) => onUpdate({ puntos: e.target.value.split("\n").filter((p) => p.trim()) })}
          rows={4}
          className="text-xs"
        />
      </FieldShell>

      <FieldShell label="Nota visual" hint="Qué imagen o captura acompaña al slide">
        <Textarea
          value={slide.notaVisual}
          onChange={(e) => onUpdate({ notaVisual: e.target.value })}
          rows={2}
          className="text-xs"
        />
      </FieldShell>
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
  const ref = useRef<HTMLTextAreaElement>(null);
  const seconds = speakingSeconds(value);

  function insert(snippet: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const out = selected ? snippet.replace("texto", selected) : snippet;
    onChange(value.slice(0, start) + out + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + out.length, start + out.length);
    });
  }

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
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Escribe aquí el texto que se dice a cámara…"
        className="font-display leading-[1.75] text-[15px]"
      />
      <MarkToolbar onInsert={insert} className="mt-2" />
    </div>
  );
}

function EmptyState() {
  return <div className="p-6 text-sm text-ink-faint">Selecciona un bloque de la estructura.</div>;
}
