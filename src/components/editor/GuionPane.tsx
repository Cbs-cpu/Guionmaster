"use client";

import { FieldShell, Input, Textarea } from "@/components/ui/Field";
import { REEL_BEAT_LABELS, type ReelBeat, type ScriptRecord, type YoutubeChapter } from "@/lib/types";
import { estimateSpeakingSeconds, formatSeconds, cn } from "@/lib/utils";
import { Maximize2, Minimize2 } from "lucide-react";
import type { ActiveBlock } from "./types";

export function GuionPane({
  script,
  active,
  readMode,
  onToggleReadMode,
  onUpdateBeat,
  onUpdateChapter,
  onUpdateMeta,
}: {
  script: ScriptRecord;
  active: ActiveBlock;
  readMode: boolean;
  onToggleReadMode: () => void;
  onUpdateBeat: (key: ReelBeat["key"], patch: Partial<ReelBeat>) => void;
  onUpdateChapter: (id: string, patch: Partial<YoutubeChapter>) => void;
  onUpdateMeta: (patch: { youtubeHook?: string; promesa?: string }) => void;
}) {
  const header = (
    <button
      onClick={onToggleReadMode}
      className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-faint hover:text-accent shrink-0"
    >
      {readMode ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
      {readMode ? "Salir de modo lectura" : "Modo lectura"}
    </button>
  );

  if (active.kind === "beat") {
    const beat = script.beats?.find((b) => b.key === active.key);
    if (!beat) return <EmptyState />;
    return (
      <div className={cn("mx-auto", readMode ? "max-w-3xl px-5 sm:px-8 py-8" : "max-w-2xl p-5 sm:p-6")}>
        <SpokenText
          label={`${REEL_BEAT_LABELS[active.key]} · texto hablado`}
          value={beat.textoHablado}
          onChange={(v) => onUpdateBeat(active.key, { textoHablado: v })}
          readMode={readMode}
          headerRight={header}
        />

        {!readMode && (
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
        )}
      </div>
    );
  }

  if (active.kind === "meta") {
    return (
      <div className={cn("mx-auto", readMode ? "max-w-3xl px-5 sm:px-8 py-8" : "max-w-2xl p-5 sm:p-6")}>
        <SpokenText
          label="Hook (apertura)"
          value={script.youtubeHook ?? ""}
          onChange={(v) => onUpdateMeta({ youtubeHook: v })}
          readMode={readMode}
          headerRight={header}
        />
        {!readMode && (
          <div className="mt-6 pt-6 border-t border-rule">
            <FieldShell label="Promesa" hint="Qué aprenderá el espectador si se queda">
              <Textarea value={script.promesa ?? ""} onChange={(e) => onUpdateMeta({ promesa: e.target.value })} rows={2} />
            </FieldShell>
          </div>
        )}
      </div>
    );
  }

  const chapter = script.chapters?.find((c) => c.id === active.id);
  if (!chapter) return <EmptyState />;

  return (
    <div className={cn("mx-auto", readMode ? "max-w-3xl px-5 sm:px-8 py-8" : "max-w-2xl p-5 sm:p-6")}>
      {!readMode && (
        <div className="space-y-4 mb-6 pb-6 border-b border-rule">
          <FieldShell label="Título del capítulo">
            <Input value={chapter.titulo} onChange={(e) => onUpdateChapter(chapter.id, { titulo: e.target.value })} />
          </FieldShell>
          <FieldShell label="Resumen">
            <Textarea value={chapter.resumen} onChange={(e) => onUpdateChapter(chapter.id, { resumen: e.target.value })} rows={2} />
          </FieldShell>
        </div>
      )}

      {readMode && <p className="font-display text-sm text-ink-faint mb-2">{chapter.titulo}</p>}

      <SpokenText
        label="Guion"
        value={chapter.guion}
        onChange={(v) => onUpdateChapter(chapter.id, { guion: v })}
        readMode={readMode}
        headerRight={header}
      />

      {!readMode && (
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
      )}
    </div>
  );
}

function SpokenText({
  label,
  value,
  onChange,
  readMode,
  headerRight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readMode: boolean;
  headerRight: React.ReactNode;
}) {
  const seconds = estimateSpeakingSeconds(value);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        {!readMode ? <span className="label-caps text-[10px] text-ink-faint">{label}</span> : <span />}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-ink-faint whitespace-nowrap">~{formatSeconds(seconds)} al leerlo</span>
          {headerRight}
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={readMode ? 16 : 6}
        placeholder="Escribe aquí el texto que se dice a cámara…"
        className={cn(
          "font-display leading-[1.75] transition-[font-size,padding] duration-150",
          readMode
            ? "text-2xl sm:text-[1.75rem] border-none bg-transparent shadow-none px-0 py-2 focus:ring-0 resize-none"
            : "text-[15px]"
        )}
      />
    </div>
  );
}

function EmptyState() {
  return <div className="p-6 text-sm text-ink-faint">Selecciona un bloque de la estructura.</div>;
}
