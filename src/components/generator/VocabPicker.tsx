"use client";

import { useState } from "react";
import { VOCAB_BANK } from "@/lib/vocab-bank";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

const TABS: { key: keyof typeof VOCAB_BANK; label: string; tone: "accent" | "blueprint" | "ink" }[] = [
  { key: "dolor", label: "Dolor", tone: "accent" },
  { key: "solucion", label: "Solución", tone: "blueprint" },
  { key: "resultados", label: "Resultados", tone: "ink" },
];

export function VocabPicker({ onPick }: { onPick: (word: string) => void }) {
  const [tab, setTab] = useState<keyof typeof VOCAB_BANK>("dolor");

  return (
    <div className="rounded-sm border border-rule bg-paper-sunken/50 p-3.5">
      <div className="flex items-center gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "label-caps text-[10px] px-2.5 py-1 rounded-full transition-colors",
              tab === t.key ? "bg-ink text-paper" : "text-ink-faint hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-ink-faint hidden sm:inline">banco de conceptos</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {VOCAB_BANK[tab].map((word) => (
          <Chip key={word} tone={TABS.find((t) => t.key === tab)!.tone} onClick={() => onPick(word)}>
            {word}
          </Chip>
        ))}
      </div>
    </div>
  );
}
