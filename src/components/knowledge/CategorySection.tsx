import type { KnowledgeCategory } from "@/lib/types";

export function CategorySection({ category, index }: { category: KnowledgeCategory; index: number }) {
  return (
    <section id={category.id} className="scroll-mt-24 paper-panel rounded-sm overflow-hidden">
      <header className="px-6 sm:px-8 pt-7 pb-6 border-b border-rule bg-paper-sunken/40">
        <p className="label-caps text-[10px] text-ink-faint mb-2">
          {String(index + 1).padStart(2, "0")} · Marco
        </p>
        <h2 className="font-display text-2xl sm:text-[1.7rem] mb-3">{category.nombre}</h2>
        <blockquote className="border-l-2 border-accent pl-4 font-display italic text-[1.05rem] leading-snug text-ink/90 max-w-2xl">
          {category.ideaFundamental}
        </blockquote>
      </header>

      <div className="px-6 sm:px-8 py-6">
        <p className="label-caps text-[10px] text-ink-faint mb-3">Conceptos</p>
        <dl className="divide-y divide-rule">
          {category.conceptos.map((c) => (
            <div key={c.id} className="py-3 grid sm:grid-cols-[11rem_1fr] gap-1.5 sm:gap-6">
              <dt className="font-medium text-sm text-ink">{c.termino}</dt>
              <dd className="text-sm text-ink-soft leading-relaxed">{c.definicion}</dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className="px-6 sm:px-8 py-4 border-t border-rule bg-paper-sunken/40 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-faint">
        <span className="label-caps text-[10px] text-blueprint">Fuente</span>
        <span>
          {category.fuente.autor ? `${category.fuente.autor} — ` : ""}
          {category.fuente.obraOMarco}
        </span>
        {category.fuente.nota && <span className="italic">· {category.fuente.nota}</span>}
      </footer>
    </section>
  );
}
