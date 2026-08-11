import Link from "next/link";
import { notFound } from "next/navigation";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";
import { CategorySection } from "@/components/knowledge/CategorySection";

export function generateStaticParams() {
  return KNOWLEDGE_BASE.map((cat) => ({ id: cat.id }));
}

export default async function ConocimientoDocPage({ params }: PageProps<"/conocimiento/[id]">) {
  const { id } = await params;
  const index = KNOWLEDGE_BASE.findIndex((c) => c.id === id);
  if (index === -1) notFound();

  const category = KNOWLEDGE_BASE[index];
  const prev = KNOWLEDGE_BASE[index - 1];
  const next = KNOWLEDGE_BASE[index + 1];

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <Link href="/conocimiento" className="text-sm text-ink-soft hover:text-accent inline-flex items-center gap-1.5">
        ← Biblioteca de conocimiento
      </Link>

      <div className="mt-6">
        <CategorySection category={category} index={index} />
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
