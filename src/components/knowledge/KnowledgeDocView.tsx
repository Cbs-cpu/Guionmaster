"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CategorySection } from "./CategorySection";
import { ReadFlow, type ReadFlowSection } from "@/components/ui/ReadFlow";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useStudioStore } from "@/lib/store";
import { useUiStore } from "@/lib/uiStore";
import type { KnowledgeCategory } from "@/lib/types";
import { Maximize2 } from "lucide-react";

export function KnowledgeDocView({
  category,
  index,
  prev,
  next,
}: {
  category: KnowledgeCategory;
  index: number;
  prev?: KnowledgeCategory;
  next?: KnowledgeCategory;
}) {
  const [readMode, setReadMode] = useState(false);
  const setChromeHidden = useUiStore((s) => s.setChromeHidden);
  const notes = useStudioStore((s) => s.knowledgeNotes[category.id] ?? "");
  const setKnowledgeNote = useStudioStore((s) => s.setKnowledgeNote);

  useEffect(() => {
    setChromeHidden(readMode);
    return () => setChromeHidden(false);
  }, [readMode, setChromeHidden]);

  if (readMode) {
    const sections: ReadFlowSection[] = [
      {
        id: "idea",
        label: "Idea fundamental",
        content: (
          <>
            <blockquote className="font-display italic text-2xl sm:text-[1.75rem] leading-[1.5] text-ink/90">
              “{category.ideaFundamental}”
            </blockquote>
            <p className="text-[13px] text-ink-faint mt-4">
              Fuente: {category.fuente.autor ? `${category.fuente.autor} — ` : ""}
              {category.fuente.obraOMarco}
            </p>
          </>
        ),
      },
      ...category.conceptos.map((c) => ({
        id: c.id,
        label: c.termino,
        content: <p className="font-display text-2xl sm:text-[1.75rem] leading-[1.6]">{c.definicion}</p>,
      })),
      {
        id: "notes",
        label: "Mis apuntes",
        content: (
          <Textarea
            value={notes}
            onChange={(e) => setKnowledgeNote(category.id, e.target.value)}
            rows={10}
            placeholder="Escribe aquí tus apuntes sobre este marco…"
            className="font-display text-xl leading-[1.75] border-none bg-transparent shadow-none px-0 py-1 focus:ring-0 resize-none"
          />
        ),
      },
    ];
    return <ReadFlow sections={sections} initialId="idea" onExit={() => setReadMode(false)} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/conocimiento" className="text-sm text-ink-soft hover:text-accent inline-flex items-center gap-1.5">
          ← Biblioteca de conocimiento
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setReadMode(true)}>
          <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
          Modo lectura
        </Button>
      </div>

      <div className="mt-6">
        <CategorySection category={category} index={index} />
      </div>

      <div className="mt-4 paper-panel rounded-sm px-6 sm:px-8 py-6">
        <p className="label-caps text-[10px] text-ink-faint mb-3">Mis apuntes</p>
        <Textarea
          value={notes}
          onChange={(e) => setKnowledgeNote(category.id, e.target.value)}
          rows={5}
          placeholder="Tus propias notas sobre este marco: ideas para vídeos, matices, ejemplos que se te ocurran…"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {prev ? (
          <Link href={`/conocimiento/${prev.id}`} className="hover-lift paper-panel rounded-sm px-4 py-3 text-left">
            <p className="label-caps text-[10px] text-ink-faint mb-1">← Anterior</p>
            <p className="text-sm font-medium truncate">{prev.nombre}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/conocimiento/${next.id}`} className="hover-lift paper-panel rounded-sm px-4 py-3 text-right ml-auto">
            <p className="label-caps text-[10px] text-ink-faint mb-1">Siguiente →</p>
            <p className="text-sm font-medium truncate">{next.nombre}</p>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
