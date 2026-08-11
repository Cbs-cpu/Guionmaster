"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AiErrorNote } from "@/components/ui/AiErrorNote";
import { postJson } from "@/lib/apiClient";
import { useStudioStore } from "@/lib/store";
import { makeId } from "@/lib/utils";
import {
  EDITOR_COMMAND_LABELS,
  EDITOR_COMMAND_ORDER,
  REEL_BEAT_ORDER,
  REEL_BEAT_LABELS,
  type EditorCommand,
  type ReelBeat,
  type ScriptRecord,
  type YoutubeChapter,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function AiPane({
  script,
  activeText,
  activeLabel,
  onApply,
}: {
  script: ScriptRecord;
  activeText: string;
  activeLabel: string;
  onApply: (text: string) => void;
}) {
  const router = useRouter();
  const addScript = useStudioStore((s) => s.addScript);

  const [runningCommand, setRunningCommand] = useState<EditorCommand | null>(null);
  const [commandError, setCommandError] = useState<unknown>(null);
  const [lastValue, setLastValue] = useState<string | null>(null);

  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<unknown>(null);

  async function runCommand(command: EditorCommand) {
    if (!activeText.trim()) return;
    setRunningCommand(command);
    setCommandError(null);
    try {
      const data = await postJson<{ text: string }>("/api/ai/editor-command", {
        command,
        text: activeText,
        context: `Servicio: ${script.service}. Título del guion: ${script.title}.`,
      });
      setLastValue(activeText);
      onApply(data.text);
    } catch (err) {
      setCommandError(err);
    } finally {
      setRunningCommand(null);
    }
  }

  function undo() {
    if (lastValue !== null) {
      onApply(lastValue);
      setLastValue(null);
    }
  }

  async function handleConvert() {
    setConverting(true);
    setConvertError(null);
    try {
      const direction = script.type === "reel" ? "reel_to_youtube" : "youtube_to_reel";
      const sourceText =
        script.type === "reel"
          ? REEL_BEAT_ORDER.map((k) => {
              const b = script.beats?.find((x) => x.key === k);
              return b ? `${REEL_BEAT_LABELS[k]}: ${b.textoHablado}` : "";
            })
              .filter(Boolean)
              .join("\n\n")
          : `Hook: ${script.youtubeHook ?? ""}\nPromesa: ${script.promesa ?? ""}\n\n${(script.chapters ?? [])
              .map((c) => `${c.titulo}: ${c.guion}`)
              .join("\n\n")}`;

      if (script.type === "reel") {
        const data = await postJson<{
          titulo: string;
          hook: string;
          promesa: string;
          chapters: Omit<YoutubeChapter, "id">[];
        }>("/api/ai/convert", { direction, servicio: script.service, sourceTitle: script.title, sourceText });

        const now = new Date().toISOString();
        const id = makeId("script");
        addScript({
          id,
          type: "youtube",
          title: data.titulo,
          service: script.service,
          concepts: script.concepts,
          status: "idea",
          favorite: false,
          createdAt: now,
          updatedAt: now,
          youtubeHook: data.hook,
          promesa: data.promesa,
          chapters: data.chapters.map((c) => ({ ...c, id: makeId("chapter") })),
          notes: `Convertido desde el reel "${script.title}".`,
        });
        router.push(`/editor/${id}`);
      } else {
        const data = await postJson<{ hookTipo: string; beats: Omit<ReelBeat, "id">[] }>("/api/ai/convert", {
          direction,
          servicio: script.service,
          sourceTitle: script.title,
          sourceText,
        });

        const now = new Date().toISOString();
        const id = makeId("script");
        addScript({
          id,
          type: "reel",
          title: script.title,
          service: script.service,
          concepts: script.concepts,
          status: "idea",
          favorite: false,
          createdAt: now,
          updatedAt: now,
          beats: data.beats.map((b) => ({ ...b, id: makeId("beat") })),
          notes: `Convertido desde el vídeo "${script.title}".`,
        });
        router.push(`/editor/${id}`);
      }
    } catch (err) {
      setConvertError(err);
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <p className="label-caps text-[10px] text-ink-faint px-1 mb-1">Editando</p>
      <p className="px-1 mb-4 text-sm font-medium truncate">{activeLabel}</p>

      <div className="grid grid-cols-2 gap-1.5">
        {EDITOR_COMMAND_ORDER.map((command) => (
          <button
            key={command}
            onClick={() => runCommand(command)}
            disabled={runningCommand !== null || !activeText.trim()}
            className={cn(
              "press text-left text-[12.5px] rounded-sm border border-rule-strong px-2.5 py-2 text-ink-soft transition-colors duration-150",
              "hover:border-accent hover:text-ink disabled:opacity-40 disabled:pointer-events-none",
              runningCommand === command && "border-accent text-accent"
            )}
          >
            {runningCommand === command ? "Generando…" : EDITOR_COMMAND_LABELS[command]}
          </button>
        ))}
      </div>

      {lastValue !== null && (
        <button onClick={undo} className="mt-2.5 text-xs text-ink-faint hover:text-accent self-start">
          ← Deshacer último cambio de IA
        </button>
      )}

      {commandError ? (
        <div className="mt-3">
          <AiErrorNote error={commandError} />
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <div className="border-t border-rule pt-4">
          <p className="label-caps text-[10px] text-ink-faint mb-2">Convertir formato</p>
          <Button variant="outline-blueprint" size="sm" onClick={handleConvert} loading={converting} className="w-full">
            {script.type === "reel" ? "Convertir Reel → YouTube" : "Convertir YouTube → Reel"}
          </Button>
          {convertError ? (
            <div className="mt-3">
              <AiErrorNote error={convertError} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
