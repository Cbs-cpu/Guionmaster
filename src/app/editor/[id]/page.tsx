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
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";

const MOBILE_TABS: { key: "estructura" | "guion" | "recursos"; label: string }[] = [
  { key: "estructura", label: "Estructura" },
  { key: "guion", label: "Guion" },
  { key: "recursos", label: "Recursos" },
];

// Las cuatro combinaciones posibles como clases literales, para que Tailwind
// las detecte en build (no se pueden interpolar valores arbitrarios sueltos).
const GRID_COLS: Record<string, string> = {
  "0-0": "lg:grid-cols-[16rem_1fr_18rem]",
  "1-0": "lg:grid-cols-[2.75rem_1fr_18rem]",
  "0-1": "lg:grid-cols-[16rem_1fr_2.75rem]",
  "1-1": "lg:grid-cols-[2.75rem_1fr_2.75rem]",
};

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
  const [estructuraCollapsed, setEstructuraCollapsed] = useState(false);
  const [recursosCollapsed, setRecursosCollapsed] = useState(false);

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

  const gridColsKey = `${estructuraCollapsed ? 1 : 0}-${recursosCollapsed ? 1 : 0}`;

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

      <div className={cn("flex-1 min-h-0 grid", readMode ? "grid-cols-1" : GRID_COLS[gridColsKey])}>
        {!readMode && (
          <div className={cn("min-h-0 overflow-y-auto border-r border-rule bg-paper-raised", mobileTab !== "estructura" && "hidden lg:block")}>
            {estructuraCollapsed ? (
              <CollapsedRail label="Estructura" icon={<PanelLeftOpen className="h-4 w-4" />} onClick={() => setEstructuraCollapsed(false)} />
            ) : (
              <>
                <PanelCollapseButton icon={<PanelLeftClose className="h-3.5 w-3.5" />} onClick={() => setEstructuraCollapsed(true)} align="right" />
                <StructurePane
                  script={script}
                  active={active}
                  onSelectActive={setActive}
                  onPatch={(patch) => updateScript(script.id, patch)}
                />
              </>
            )}
          </div>
        )}

        <div className={cn("min-h-0 overflow-y-auto", !readMode && mobileTab !== "guion" && "hidden lg:block")}>
          <GuionPane
            script={script}
            active={active}
            readMode={readMode}
            onToggleReadMode={() => setReadMode((v) => !v)}
            onNavigateActive={setActive}
            onUpdateBeat={updateBeat}
            onUpdateChapter={updateChapter}
            onUpdateMeta={updateMeta}
          />
        </div>

        {!readMode && (
          <div className={cn("min-h-0 overflow-y-auto border-l border-rule bg-paper-raised", mobileTab !== "recursos" && "hidden lg:block")}>
            {recursosCollapsed ? (
              <CollapsedRail label="Recursos" icon={<PanelRightOpen className="h-4 w-4" />} onClick={() => setRecursosCollapsed(false)} />
            ) : (
              <>
                <PanelCollapseButton icon={<PanelRightClose className="h-3.5 w-3.5" />} onClick={() => setRecursosCollapsed(true)} align="left" />
                <ResourcesPanel script={script} onPatch={(patch) => updateScript(script.id, patch)} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PanelCollapseButton({
  icon,
  onClick,
  align,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  align: "left" | "right";
}) {
  return (
    <div className={cn("hidden lg:flex px-2 pt-2", align === "right" ? "justify-end" : "justify-start")}>
      <button
        onClick={onClick}
        aria-label="Ocultar panel"
        className="press p-1.5 rounded-sm text-ink-faint hover:text-accent hover:bg-paper-sunken transition-colors"
      >
        {icon}
      </button>
    </div>
  );
}

function CollapsedRail({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Mostrar panel de ${label}`}
      title={label}
      className="press hidden lg:flex flex-col items-center gap-3 w-full h-full pt-3 text-ink-faint hover:text-accent transition-colors"
    >
      {icon}
      <span className="label-caps text-[9px] [writing-mode:vertical-rl]">{label}</span>
    </button>
  );
}
