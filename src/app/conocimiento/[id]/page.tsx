import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";
import { KnowledgeDocView } from "@/components/knowledge/KnowledgeDocView";

// Prerrenderiza los 7 marcos de serie. Los documentos importados viven en
// localStorage, así que su id no existe en build: Next los sirve bajo demanda
// (dynamicParams por defecto) y el componente cliente los resuelve al hidratar.
export function generateStaticParams() {
  return KNOWLEDGE_BASE.map((cat) => ({ id: cat.id }));
}

export default async function ConocimientoDocPage({ params }: PageProps<"/conocimiento/[id]">) {
  const { id } = await params;
  return <KnowledgeDocView key={id} categoryId={id} />;
}
