"use client";

import { useMemo } from "react";
import { KNOWLEDGE_BASE } from "./knowledge-base";
import { useStudioStore } from "./store";
import type { KnowledgeCategory } from "./types";

/**
 * La biblioteca completa: los 7 marcos que vienen de serie más los documentos
 * importados por el usuario, que viven en localStorage. Devuelve `hydrated`
 * para poder distinguir "todavía no sé qué hay guardado" de "no hay nada".
 */
export function useKnowledgeLibrary(): { categories: KnowledgeCategory[]; hydrated: boolean } {
  const hydrated = useStudioStore((s) => s.hydrated);
  const customKnowledge = useStudioStore((s) => s.customKnowledge);

  const categories = useMemo(
    () => [...KNOWLEDGE_BASE, ...customKnowledge],
    [customKnowledge]
  );

  return { categories, hydrated };
}
