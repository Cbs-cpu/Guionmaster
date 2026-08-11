"use client";

import Link from "next/link";
import { useState } from "react";
import { useStudioStore } from "@/lib/store";
import { SERVICIO_LABELS, type ScriptRecord } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StaticTag } from "@/components/ui/Chip";
import { formatDate } from "@/lib/utils";
import { Copy, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScriptCard({ script, compact }: { script: ScriptRecord; compact?: boolean }) {
  const duplicateScript = useStudioStore((s) => s.duplicateScript);
  const deleteScript = useStudioStore((s) => s.deleteScript);
  const toggleFavorite = useStudioStore((s) => s.toggleFavorite);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="hover-lift paper-panel rounded-sm px-5 py-4 flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/editor/${script.id}`} className="min-w-0">
          <p className="label-caps text-[10px] text-blueprint mb-1">
            {script.type === "reel" ? "Reel" : "YouTube"}
          </p>
          <h3 className="font-display text-[1.1rem] leading-snug truncate group-hover:text-accent transition-colors">
            {script.title}
          </h3>
        </Link>
        <button
          onClick={() => toggleFavorite(script.id)}
          aria-pressed={script.favorite}
          aria-label="Favorito"
          className="press shrink-0 text-ink-faint hover:text-accent transition-colors"
        >
          <Star className={cn("h-4 w-4", script.favorite && "fill-accent text-accent")} />
        </button>
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-1.5">
          <StaticTag>{SERVICIO_LABELS[script.service]}</StaticTag>
          {script.concepts.slice(0, 2).map((c) => (
            <StaticTag key={c} tone="blueprint">
              {c}
            </StaticTag>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-rule">
        <div className="flex items-center gap-3">
          <StatusBadge status={script.status} />
          <span className="text-[11px] text-ink-faint">{formatDate(script.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => duplicateScript(script.id)}
            aria-label="Duplicar"
            className="press p-1.5 text-ink-faint hover:text-ink"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirmingDelete) {
                deleteScript(script.id);
              } else {
                setConfirmingDelete(true);
                setTimeout(() => setConfirmingDelete(false), 2500);
              }
            }}
            aria-label="Eliminar"
            className={cn("press p-1.5", confirmingDelete ? "text-accent" : "text-ink-faint hover:text-ink")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
