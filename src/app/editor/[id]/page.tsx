"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStudioStore } from "@/lib/store";
import type { ReelBeat, ScriptRecord, YoutubeChapter } from "@/lib/types";
import { StructurePane } from "@/components/editor/StructurePane";
import { GuionPane } from "@/components/editor/GuionPane";
import { ResourcesPanel } from "@/components/editor/ResourcesPanel";
import type { ActiveBlock } from "@/components/editor/types";
import { cn } from "@/lib/utils";

const MOBILE_TABS: { key: "estructura" | "guion" | "recursos"; label: string }[] = [
  { key: "estructura", label: "Estructura" },
  { key: "guion", label: "Guion" },
  { key: "recursos", label: "Recursos" },
];

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const hydrated = useStudioStore((s) => s.hydrated);
  const script = useStudioStore((s) => s.scripts.find((sc) => sc.id === id));

  if (!hydrated) return null;

  if (!script) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-2xl mb-2">Guion no encontrado</p>
        <p className="text-sm text-ink-soft mb-5">Puede que se haya eliminado o que el enlace sea incorrecto.</p>
        <Link href="/biblioteca" className="text-accent text-sm hover:underline">
          ← Volver a la biblioteca
        </Link>
      </div>
    );
  }

  // Remonta el workspace por cada guion distinto, para que el estado de
  // selección local (active, pestaña móvil) arranque limpio sin efectos.
  return <EditorWorkspace key={script.id} script={script} />;
}

function EditorWorkspace({ script }: { script: ScriptRecord }) {
  const updateScript = useStudioStore((s) => s.updateScript);

  const [active, setActive] = useState<ActiveBlock>(
    script.type === "reel" ? { kind: "beat", key: "hook" } : { kind: "meta" }
  );
  const [mobileTab, setMobileTab] = useState<"estructura" | "guion" | "recursos">("guion");
  const [readMode, setReadMode] = useState(false);

  function updateBeat(key: ReelBeat["key"], patch: Partial<ReelBeat>) {
    if (!script.beats) return;
    updateScript(script.id, {
      beats: script.beats.map((b) => (b.key === key ? { ...b, ...patch } : b)),
    });
  }

  function updateChapter(chapterId: string, patch: Partial<YoutubeChapter>) {
    if (!script.chapters) return;
    updateScript(script.id, {
      chapters: script.chapters.map((c) => (c.id === chapterId ? { ...c, ...patch } : c)),
    });
  }

  function updateMeta(patch: { youtubeHook?: string; promesa?: string }) {
    updateScript(script.id, patch);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
      {!readMode && (
        <div className="lg:hidden flex border-b border-rule bg-paper-raised">
          {MOBILE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setMobileTab(t.key)}
              className={cn(
                "flex-1 label-caps text-[10px] py-3 border-b-2 transition-colors",
                mobileTab === t.key ? "border-accent text-ink" : "border-transparent text-ink-faint"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className={cn("flex-1 min-h-0 grid", readMode ? "grid-cols-1" : "lg:grid-cols-[16rem_1fr_18rem]")}>
        {!readMode && (
          <div className={cn("min-h-0 overflow-y-auto border-r border-rule bg-paper-raised", mobileTab !== "estructura" && "hidden lg:block")}>
            <StructurePane
              script={script}
              active={active}
              onSelectActive={setActive}
              onPatch={(patch) => updateScript(script.id, patch)}
            />
          </div>
        )}

        <div className={cn("min-h-0 overflow-y-auto", !readMode && mobileTab !== "guion" && "hidden lg:block")}>
          <GuionPane
            script={script}
            active={active}
            readMode={readMode}
            onToggleReadMode={() => setReadMode((v) => !v)}
            onUpdateBeat={updateBeat}
            onUpdateChapter={updateChapter}
            onUpdateMeta={updateMeta}
          />
        </div>

        {!readMode && (
          <div className={cn("min-h-0 overflow-y-auto border-l border-rule bg-paper-raised", mobileTab !== "recursos" && "hidden lg:block")}>
            <ResourcesPanel script={script} onPatch={(patch) => updateScript(script.id, patch)} />
          </div>
        )}
      </div>
    </div>
  );
}
