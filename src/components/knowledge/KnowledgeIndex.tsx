"use client";

import Link from "next/link";
import { useKnowledgeLibrary } from "@/lib/useKnowledgeLibrary";
import { StaticTag } from "@/components/ui/Chip";

export function KnowledgeIndex() {
  const { categories, hydrated } = useKnowledgeLibrary();

  return (
    <div>
      <p className="label-caps text-[10px] text-ink-faint mb-3">
        {hydrated ? `${categories.length} documentos` : " "}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/conocimiento/${cat.id}`}
            className="hover-lift animate-fade-up paper-panel rounded-sm px-5 py-4 flex flex-col gap-3 group"
            style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <FileIcon />
              <div className="flex items-center gap-2">
                {cat.importado && <StaticTag tone="accent">Importado</StaticTag>}
                <span className="label-caps text-[10px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg leading-snug group-hover:text-accent transition-colors">
                {cat.nombre}
              </h2>
              <p className="text-[12.5px] text-ink-faint mt-1">
                {cat.conceptos.length} conceptos · {cat.fuente.autor ?? cat.fuente.obraOMarco}
              </p>
            </div>
            <p className="text-[13px] text-ink-soft leading-relaxed italic border-t border-rule pt-3 mt-auto">
              “{cat.ideaFundamental}”
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blueprint" fill="none">
      <path d="M6 2.5H14L18.5 7V21.5H6V2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M14 2.5V7H18.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8.5 12H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.5 15.5H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
