"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_SCRIPTS } from "./seed-scripts";
import type { KnowledgeCategory, ScriptRecord, ScriptStatus } from "./types";
import { makeId } from "./utils";

interface StudioState {
  scripts: ScriptRecord[];
  knowledgeNotes: Record<string, string>;
  customKnowledge: KnowledgeCategory[];
  seededScriptIds: string[];
  hydrated: boolean;

  addScript: (script: ScriptRecord) => void;
  updateScript: (id: string, patch: Partial<ScriptRecord>) => void;
  deleteScript: (id: string) => void;
  duplicateScript: (id: string) => string | undefined;
  toggleFavorite: (id: string) => void;
  setStatus: (id: string, status: ScriptStatus) => void;
  getScript: (id: string) => ScriptRecord | undefined;

  setKnowledgeNote: (categoryId: string, text: string) => void;

  importKnowledgeCategories: (categories: KnowledgeCategory[]) => void;
  removeCustomCategory: (id: string) => void;

  setHydrated: () => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      scripts: [],
      knowledgeNotes: {},
      customKnowledge: [],
      seededScriptIds: [],
      hydrated: false,

      addScript: (script) => set((s) => ({ scripts: [script, ...s.scripts] })),

      updateScript: (id, patch) =>
        set((s) => ({
          scripts: s.scripts.map((sc) =>
            sc.id === id ? { ...sc, ...patch, updatedAt: new Date().toISOString() } : sc
          ),
        })),

      deleteScript: (id) => set((s) => ({ scripts: s.scripts.filter((sc) => sc.id !== id) })),

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
