import { KNOWLEDGE_BASE, CONTENT_PRINCIPLES, METHODOLOGY_PIPELINE } from "@/lib/knowledge-base";
import { CategorySection } from "@/components/knowledge/CategorySection";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ConocimientoPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Base de conocimiento"
        title="Sistemas, procesos y arquitectura"
        description="Marcos de referencia que sostienen todo el contenido: de dónde viene cada idea (fuente), qué significa (concepto), y cómo se interpreta para guionizar (interpretación). No se inventa nada — se cita el marco de origen."
      />

      <div className="grid lg:grid-cols-[14rem_1fr] gap-8 mt-10">
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-8">
            <nav className="space-y-1">
              <p className="label-caps text-[10px] text-ink-faint mb-2">Marcos</p>
              {KNOWLEDGE_BASE.map((cat, i) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="block text-sm text-ink-soft hover:text-accent py-1 transition-colors"
                >
                  {String(i + 1).padStart(2, "0")} {cat.nombre}
                </a>
              ))}
            </nav>

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

        <div className="space-y-6 min-w-0">
          <section className="paper-panel rounded-sm px-6 sm:px-8 py-7">
            <p className="label-caps text-[10px] text-ink-faint mb-3">Principios del contenido</p>
            <ul className="space-y-3">
              {CONTENT_PRINCIPLES.map((p) => (
                <li key={p} className="font-display italic text-[1.05rem] leading-snug text-ink/90">
                  “{p}”
                </li>
              ))}
            </ul>
          </section>

          {KNOWLEDGE_BASE.map((cat, i) => (
            <CategorySection key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
