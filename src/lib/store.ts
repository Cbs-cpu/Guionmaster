"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_SCRIPTS } from "./seed-scripts";
import type { ContentSource, KnowledgeCategory, ScriptRecord, ScriptStatus } from "./types";
import { makeId } from "./utils";

interface StudioState {
  scripts: ScriptRecord[];
  knowledgeNotes: Record<string, string>;
  customKnowledge: KnowledgeCategory[];
  sources: ContentSource[];
  seededScriptIds: string[];
  hydrated: boolean;

  addScript: (script: ScriptRecord) => void;
  updateScript: (id: string, patch: Partial<ScriptRecord>) => void;
  deleteScript: (id: string) => void;
  duplicateScript: (id: string) => string | undefined;
  toggleFavorite: (id: string) => void;
  setStatus: (id: string, status: ScriptStatus) => void;
  getScript: (id: string) => ScriptRecord | undefined;

  toggleScriptKnowledge: (scriptId: string, categoryId: string) => void;
  toggleScriptLink: (aId: string, bId: string) => void;

  setKnowledgeNote: (categoryId: string, text: string) => void;

  importKnowledgeCategories: (categories: KnowledgeCategory[]) => void;
  removeCustomCategory: (id: string) => void;

  addSources: (sources: ContentSource[]) => void;
  removeSource: (id: string) => void;

  setHydrated: () => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      scripts: [],
      knowledgeNotes: {},
      customKnowledge: [],
      sources: [],
      seededScriptIds: [],
      hydrated: false,

      addScript: (script) => set((s) => ({ scripts: [script, ...s.scripts] })),

      updateScript: (id, patch) =>
        set((s) => ({
          scripts: s.scripts.map((sc) =>
            sc.id === id ? { ...sc, ...patch, updatedAt: new Date().toISOString() } : sc
          ),
        })),

      deleteScript: (id) =>
        set((s) => ({
          scripts: s.scripts
            .filter((sc) => sc.id !== id)
            .map((sc) =>
              sc.relatedScriptIds?.includes(id)
                ? { ...sc, relatedScriptIds: sc.relatedScriptIds.filter((r) => r !== id) }
                : sc
            ),
        })),

      duplicateScript: (id) => {
        const original = get().scripts.find((sc) => sc.id === id);
        if (!original) return undefined;
        const now = new Date().toISOString();
        const copy: ScriptRecord = {
          ...original,
          id: makeId("script"),
          title: `${original.title} (copia)`,
          status: "idea",
          favorite: false,
          createdAt: now,
          updatedAt: now,
          // Los vínculos entre contenidos son simétricos; una copia que
          // apuntase a B sin que B le devolviera el vínculo rompería esa
          // simetría, así que la copia nace sin correlaciones.
          relatedScriptIds: [],
        };
        set((s) => ({ scripts: [copy, ...s.scripts] }));
        return copy.id;
      },

      toggleFavorite: (id) =>
        set((s) => ({
          scripts: s.scripts.map((sc) => (sc.id === id ? { ...sc, favorite: !sc.favorite } : sc)),
        })),

      setStatus: (id, status) =>
        set((s) => ({
          scripts: s.scripts.map((sc) =>
            sc.id === id ? { ...sc, status, updatedAt: new Date().toISOString() } : sc
          ),
        })),

      getScript: (id) => get().scripts.find((sc) => sc.id === id),

      toggleScriptKnowledge: (scriptId, categoryId) =>
        set((s) => ({
          scripts: s.scripts.map((sc) => {
            if (sc.id !== scriptId) return sc;
            const current = sc.knowledgeIds ?? [];
            const next = current.includes(categoryId)
              ? current.filter((k) => k !== categoryId)
              : [...current, categoryId];
            return { ...sc, knowledgeIds: next, updatedAt: new Date().toISOString() };
          }),
        })),

      toggleScriptLink: (aId, bId) =>
        set((s) => {
          if (aId === bId) return s;
          const a = s.scripts.find((sc) => sc.id === aId);
          const linked = a?.relatedScriptIds?.includes(bId) ?? false;
          const now = new Date().toISOString();
          const apply = (sc: ScriptRecord, otherId: string) => {
            const current = sc.relatedScriptIds ?? [];
            const next = linked ? current.filter((r) => r !== otherId) : [...current, otherId];
            return { ...sc, relatedScriptIds: next, updatedAt: now };
          };
          return {
            scripts: s.scripts.map((sc) =>
              sc.id === aId ? apply(sc, bId) : sc.id === bId ? apply(sc, aId) : sc
            ),
          };
        }),

      setKnowledgeNote: (categoryId, text) =>
        set((s) => ({ knowledgeNotes: { ...s.knowledgeNotes, [categoryId]: text } })),

      importKnowledgeCategories: (categories) =>
        set((s) => {
          const next = [...s.customKnowledge];
          for (const cat of categories) {
            const i = next.findIndex((c) => c.id === cat.id);
            if (i >= 0) next[i] = cat;
            else next.push(cat);
          }
          return { customKnowledge: next };
        }),

      removeCustomCategory: (id) =>
        set((s) => ({ customKnowledge: s.customKnowledge.filter((c) => c.id !== id) })),

      addSources: (sources) =>
        set((s) => {
          const next = [...s.sources];
          for (const source of sources) {
            const i = next.findIndex((x) => x.id === source.id);
            if (i >= 0) next[i] = source;
            else next.unshift(source);
          }
          return { sources: next };
        }),

      removeSource: (id) => set((s) => ({ sources: s.sources.filter((x) => x.id !== id) })),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "system-content-studio",
      onRehydrateStorage: () => (state) => {
        // Precarga aditiva: cada guion de ejemplo tiene un id estable. Se
        // añade una sola vez por navegador (se recuerda en seededScriptIds),
        // tanto la primera vez que se abre la app como cuando se añaden
        // guiones de ejemplo nuevos en una actualización — sin duplicar los
        // que ya había ni resucitar los que el usuario haya borrado.
        //
        // Migración: los primeros 11 guiones de ejemplo se lanzaron antes de
        // que tuvieran un id estable, así que quien ya los tenía guardados
        // los tiene con un id aleatorio de entonces. Para no duplicarlos, si
        // el título ya existe en la biblioteca se da por "ya sembrado" ese
        // id nuevo sin volver a insertarlo.
        if (state) {
          const seen = new Set(state.seededScriptIds);
          const existingTitles = new Set(state.scripts.map((s) => s.title));
          const toAdd: ScriptRecord[] = [];
          const newlySeeded: string[] = [];

          for (const seed of SEED_SCRIPTS) {
            if (seen.has(seed.id)) continue;
            newlySeeded.push(seed.id);
            if (existingTitles.has(seed.title)) continue; // ya lo tenía, de antes de que hubiera id estable
            toAdd.push(seed);
          }

          if (newlySeeded.length > 0) {
            state.scripts = [...toAdd, ...state.scripts];
            state.seededScriptIds = [...state.seededScriptIds, ...newlySeeded];
          }
        }
        state?.setHydrated();
      },
    }
  )
);
