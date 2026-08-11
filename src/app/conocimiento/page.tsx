import { CONTENT_PRINCIPLES, METHODOLOGY_PIPELINE } from "@/lib/knowledge-base";
import { PageHeader } from "@/components/layout/PageHeader";
import { KnowledgeIndex } from "@/components/knowledge/KnowledgeIndex";
import { KnowledgeIO } from "@/components/knowledge/KnowledgeIO";

export default function ConocimientoPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Biblioteca de conocimiento"
        title="Sistemas, procesos y arquitectura"
        description="Un archivo por marco de referencia. Cada documento dice de dónde viene la idea (fuente), qué significa (concepto) y cómo se interpreta para guionizar — nada se inventa."
      />

      <div className="mt-8">
        <KnowledgeIO />
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_16rem] gap-8">
        <KnowledgeIndex />

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
