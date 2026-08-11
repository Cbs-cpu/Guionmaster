"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_SCRIPTS } from "./seed-scripts";
import type { ScriptRecord, ScriptStatus } from "./types";
import { makeId } from "./utils";

interface StudioState {
  scripts: ScriptRecord[];
  knowledgeNotes: Record<string, string>;
  hydrated: boolean;

  addScript: (script: ScriptRecord) => void;
  updateScript: (id: string, patch: Partial<ScriptRecord>) => void;
  deleteScript: (id: string) => void;
  duplicateScript: (id: string) => string | undefined;
  toggleFavorite: (id: string) => void;
  setStatus: (id: string, status: ScriptStatus) => void;
  getScript: (id: string) => ScriptRecord | undefined;

  setKnowledgeNote: (categoryId: string, text: string) => void;

  setHydrated: () => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      scripts: [],
      knowledgeNotes: {},
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

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "system-content-studio",
      onRehydrateStorage: () => (state) => {
        // Primera vez que se abre la app en este navegador (sin datos guardados
        // todavía): precargamos la biblioteca con los guiones de ejemplo.
        if (state && state.scripts.length === 0) {
          state.scripts = SEED_SCRIPTS;
        }
        state?.setHydrated();
      },
    }
  )
);
