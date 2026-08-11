"use client";

import { cn } from "@/lib/utils";

export function Chip({
  active,
  onClick,
  children,
  tone = "ink",
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  tone?: "ink" | "accent" | "blueprint";
}) {
  const toneActive =
    tone === "accent"
      ? "bg-accent text-accent-ink border-accent"
      : tone === "blueprint"
      ? "bg-blueprint text-blueprint-ink border-blueprint"
      : "bg-ink text-paper border-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors duration-150",
        active ? toneActive : "border-rule-strong text-ink-soft hover:border-ink hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

export function StaticTag({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "accent" | "blueprint" }) {
  const toneClasses =
    tone === "accent"
      ? "bg-accent-soft text-accent border-accent/30"
      : tone === "blueprint"
      ? "bg-blueprint-soft text-blueprint border-blueprint/30"
      : "bg-paper-sunken text-ink-soft border-rule-strong";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px]", toneClasses)}>
      {children}
    </span>
  );
}
