"use client";

import { useMemo } from "react";
import { useStudioStore } from "./store";
import { useKnowledgeLibrary } from "./useKnowledgeLibrary";
import type { KnowledgeCategory, ScriptRecord } from "./types";

/**
 * Los documentos del estudio están entrelazados: un guion nace de uno o varios
 * marcos de conocimiento y forma familia con otros contenidos (el vídeo largo,
 * los reels que salen de él, el carrusel que lo resume). Aquí se resuelven esos
 * ids a los documentos reales, ignorando los que ya no existan.
 */
export function useScriptRelations(script: ScriptRecord): {
  knowledge: KnowledgeCategory[];
  related: ScriptRecord[];
} {
  const { categories } = useKnowledgeLibrary();
  const scripts = useStudioStore((s) => s.scripts);

  return useMemo(() => {
    const knowledgeIds = script.knowledgeIds ?? [];
    const relatedIds = script.relatedScriptIds ?? [];
    return {
      knowledge: knowledgeIds
        .map((id) => categories.find((c) => c.id === id))
        .filter((c): c is KnowledgeCategory => Boolean(c)),
      related: relatedIds
        .map((id) => scripts.find((s) => s.id === id))
        .filter((s): s is ScriptRecord => Boolean(s)),
    };
  }, [script.knowledgeIds, script.relatedScriptIds, categories, scripts]);
}

/** Todos los contenidos que citan un marco de conocimiento como origen. */
export function useScriptsFromKnowledge(categoryId: string): ScriptRecord[] {
  const scripts = useStudioStore((s) => s.scripts);
  return useMemo(
    () => scripts.filter((s) => s.knowledgeIds?.includes(categoryId)),
    [scripts, categoryId]
  );
}

export interface VisualWithSource {
  visual: NonNullable<ScriptRecord["visuals"]>[number];
  scriptId: string;
  scriptTitle: string;
  chapterTitle?: string;
}

/**
 * Todas las imágenes generadas (infografías, imágenes de contexto...) de
 * todos los guiones, en un único listado — para que la biblioteca de
 * Recursos visuales muestre de serie todo lo que se haya generado, sin
 * tener que ir guion por guion a buscarlo ni importarlo a mano.
 */
export function useAllGeneratedVisuals(): VisualWithSource[] {
  const scripts = useStudioStore((s) => s.scripts);
  return useMemo(() => {
    const out: VisualWithSource[] = [];
    for (const script of scripts) {
      for (const visual of script.visuals ?? []) {
        const chapter = visual.chapterId
          ? script.chapters?.find((c) => c.id === visual.chapterId)
          : undefined;
        out.push({
          visual,
          scriptId: script.id,
          scriptTitle: script.title,
          chapterTitle: chapter?.titulo,
        });
      }
    }
    return out.sort((a, b) => (a.visual.createdAt < b.visual.createdAt ? 1 : -1));
  }, [scripts]);
}
