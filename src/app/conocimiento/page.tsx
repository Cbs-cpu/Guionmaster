import Link from "next/link";
import { KNOWLEDGE_BASE, CONTENT_PRINCIPLES, METHODOLOGY_PIPELINE } from "@/lib/knowledge-base";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ConocimientoPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Biblioteca de conocimiento"
        title="Sistemas, procesos y arquitectura"
        description="Un archivo por marco de referencia. Cada documento dice de dónde viene la idea (fuente), qué significa (concepto) y cómo se interpreta para guionizar — nada se inventa."
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_16rem] gap-8">
        <div>
          <p className="label-caps text-[10px] text-ink-faint mb-3">
            {KNOWLEDGE_BASE.length} documentos
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {KNOWLEDGE_BASE.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/conocimiento/${cat.id}`}
                className="hover-lift animate-fade-up paper-panel rounded-sm px-5 py-4 flex flex-col gap-3 group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <FileIcon />
                  <span className="label-caps text-[10px] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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

        <aside>
          <div className="sticky top-8 space-y-8">
            <div>
              <p className="label-caps text-[10px] text-ink-faint mb-2">Principios del contenido</p>
              <ul className="space-y-2.5">
                {CONTENT_PRINCIPLES.slice(0, 4).map((p) => (
                  <li key={p} className="text-[12.5px] text-ink-soft italic leading-snug">
                    “{p}”
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label-caps text-[10px] text-ink-faint mb-2">Método</p>
              <ol className="space-y-1 text-sm text-ink-soft">
                {METHODOLOGY_PIPELINE.map((step, i) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="label-caps text-[10px] text-blueprint">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blueprint" fill="none">
      <path
        d="M6 2.5H14L18.5 7V21.5H6V2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M14 2.5V7H18.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8.5 12H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.5 15.5H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
