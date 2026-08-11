import { STATUS_LABELS, type ScriptStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const DOT_CLASS: Record<ScriptStatus, string> = {
  idea: "bg-state-idea",
  borrador: "bg-state-borrador",
  listo: "bg-state-listo",
  grabado: "bg-state-grabado",
  publicado: "bg-state-publicado",
};

export function StatusBadge({ status, className }: { status: ScriptStatus; className?: string }) {
  return (
    <span className={cn("label-caps inline-flex items-center gap-1.5 text-[10px] text-ink-soft", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
