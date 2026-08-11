"use client";

import { FieldShell, Input, Textarea } from "@/components/ui/Field";
import { REEL_BEAT_LABELS, type ReelBeat, type ScriptRecord, type YoutubeChapter } from "@/lib/types";
import { estimateSpeakingSeconds, formatSeconds } from "@/lib/utils";
import type { ActiveBlock } from "./types";

export function GuionPane({
  script,
  active,
  onUpdateBeat,
  onUpdateChapter,
  onUpdateMeta,
}: {
  script: ScriptRecord;
  active: ActiveBlock;
  onUpdateBeat: (key: ReelBeat["key"], patch: Partial<ReelBeat>) => void;
  onUpdateChapter: (id: string, patch: Partial<YoutubeChapter>) => void;
  onUpdateMeta: (patch: { youtubeHook?: string; promesa?: string }) => void;
}) {
  if (active.kind === "beat") {
    const beat = script.beats?.find((b) => b.key === active.key);
    if (!beat) return <EmptyState />;
    const seconds = estimateSpeakingSeconds(beat.textoHablado);
    return (
      <div className="p-5 sm:p-6 space-y-5 max-w-2xl">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="label-caps text-[10px] text-ink-faint">{REEL_BEAT_LABELS[active.key]} · texto hablado</span>
            <span className="text-[11px] text-ink-faint">~{formatSeconds(seconds)} al leerlo</span>
          </div>
          <Textarea
            value={beat.textoHablado}
            onChange={(e) => onUpdateBeat(active.key, { textoHablado: e.target.value })}
            rows={5}
            className="text-[15px] leading-relaxed font-display"
          />
        </div>

        <FieldShell label="Tiempo aproximado">
          <Input value={beat.tiempoAprox} onChange={(e) => onUpdateBeat(active.key, { tiempoAprox: e.target.value })} />
        </FieldShell>

        <FieldShell label="Visual sugerido">
          <Textarea
            value={beat.visualSugerido}
            onChange={(e) => onUpdateBeat(active.key, { visualSugerido: e.target.value })}
            rows={2}
          />
        </FieldShell>

        <FieldShell label="Texto en pantalla">
          <Input
            value={beat.textoPantalla}
            onChange={(e) => onUpdateBeat(active.key, { textoPantalla: e.target.value })}
          />
        </FieldShell>
      </div>
    );
  }

  if (active.kind === "meta") {
    return (
      <div className="p-5 sm:p-6 space-y-5 max-w-2xl">
        <FieldShell label="Hook (apertura)">
          <Textarea
            value={script.youtubeHook ?? ""}
            onChange={(e) => onUpdateMeta({ youtubeHook: e.target.value })}
            rows={4}
            className="text-[15px] leading-relaxed font-display"
          />
        </FieldShell>
        <FieldShell label="Promesa" hint="Qué aprenderá el espectador si se queda">
          <Textarea value={script.promesa ?? ""} onChange={(e) => onUpdateMeta({ promesa: e.target.value })} rows={2} />
        </FieldShell>
      </div>
    );
  }

  const chapter = script.chapters?.find((c) => c.id === active.id);
  if (!chapter) return <EmptyState />;
  const seconds = estimateSpeakingSeconds(chapter.guion);

  return (
    <div className="p-5 sm:p-6 space-y-5 max-w-2xl">
      <FieldShell label="Título del capítulo">
        <Input value={chapter.titulo} onChange={(e) => onUpdateChapter(chapter.id, { titulo: e.target.value })} />
      </FieldShell>

      <FieldShell label="Resumen">
        <Textarea value={chapter.resumen} onChange={(e) => onUpdateChapter(chapter.id, { resumen: e.target.value })} rows={2} />
      </FieldShell>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="label-caps text-[10px] text-ink-faint">Guion</span>
          <span className="text-[11px] text-ink-faint">~{formatSeconds(seconds)} al leerlo</span>
        </div>
        <Textarea
          value={chapter.guion}
          onChange={(e) => onUpdateChapter(chapter.id, { guion: e.target.value })}
          rows={14}
          className="text-[15px] leading-relaxed font-display"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldShell label="Qué mostrar">
          <Textarea
            value={chapter.visual.queMostrar}
            onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, queMostrar: e.target.value } })}
            rows={2}
          />
        </FieldShell>
        <FieldShell label="Qué explicar">
          <Textarea
            value={chapter.visual.queExplicar}
            onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, queExplicar: e.target.value } })}
            rows={2}
          />
        </FieldShell>
        <FieldShell label="B-roll">
          <Textarea
            value={chapter.visual.bRoll}
            onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, bRoll: e.target.value } })}
            rows={2}
          />
        </FieldShell>
        <FieldShell label="Capturas">
          <Textarea
            value={chapter.visual.capturas}
            onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, capturas: e.target.value } })}
            rows={2}
          />
        </FieldShell>
        <div className="sm:col-span-2">
          <FieldShell label="Diagramas">
            <Textarea
              value={chapter.visual.diagramas}
              onChange={(e) => onUpdateChapter(chapter.id, { visual: { ...chapter.visual, diagramas: e.target.value } })}
              rows={2}
            />
          </FieldShell>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return <div className="p-6 text-sm text-ink-faint">Selecciona un bloque de la estructura.</div>;
}
