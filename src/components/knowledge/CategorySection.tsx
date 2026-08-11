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

      {category.resumen && (
        <div className="px-6 sm:px-8 py-6 border-b border-rule">
          <p className="label-caps text-[10px] text-ink-faint mb-3">Resumen</p>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{category.resumen}</p>
        </div>
      )}

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

      {category.aplicacion && (
        <div className="px-6 sm:px-8 py-6 border-t border-rule">
          <p className="label-caps text-[10px] text-ink-faint mb-3">Cómo aplica</p>
          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{category.aplicacion}</p>
        </div>
      )}

      <ListBlock label="Ejemplos" items={category.ejemplos} />
      <ListBlock label="Errores comunes" items={category.erroresComunes} />
      <ListBlock label="Preguntas de diagnóstico" items={category.preguntasDiagnostico} />
      <ListBlock label="Ideas de contenido" items={category.ideasContenido} />

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

function ListBlock({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="px-6 sm:px-8 py-6 border-t border-rule">
      <p className="label-caps text-[10px] text-ink-faint mb-3">{label}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-ink-soft leading-relaxed flex gap-2.5">
            <span className="label-caps text-[10px] text-accent mt-1 shrink-0">{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
