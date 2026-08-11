import { notFound } from "next/navigation";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";
import { KnowledgeDocView } from "@/components/knowledge/KnowledgeDocView";

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

  // key={category.id}: al navegar a otro documento con los enlaces
  // Anterior/Siguiente, remonta el componente para que el modo lectura
  // arranque limpio en vez de arrastrar el estado del documento anterior.
  return <KnowledgeDocView key={category.id} category={category} index={index} prev={prev} next={next} />;
}
