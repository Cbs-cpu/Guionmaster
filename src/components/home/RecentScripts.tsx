"use client";

import Link from "next/link";
import { useStudioStore } from "@/lib/store";
import { ScriptCard } from "@/components/library/ScriptCard";

export function RecentScripts() {
  const scripts = useStudioStore((s) => s.scripts);
  const hydrated = useStudioStore((s) => s.hydrated);

  if (!hydrated) return null;

  if (scripts.length === 0) {
    return (
      <div className="paper-panel rounded-sm px-6 py-10 text-center">
        <p className="font-display text-lg mb-1">Todavía no hay guiones</p>
        <p className="text-sm text-ink-soft">Crea tu primer Reel o vídeo de YouTube para verlo aquí.</p>
      </div>
    );
  }

  const recent = scripts.slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="label-caps text-[10px] text-ink-faint">Recientes</p>
        <Link href="/biblioteca" className="text-xs text-accent hover:underline">
          Ver biblioteca completa →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recent.map((s) => (
          <ScriptCard key={s.id} script={s} compact />
        ))}
      </div>
    </div>
  );
}
