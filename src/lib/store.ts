"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeId } from "./utils";
import type { CanvasBoard, ScriptRecord, ScriptStatus } from "./types";

interface StudioState {
  scripts: ScriptRecord[];
  canvases: CanvasBoard[];
  hydrated: boolean;

  addScript: (script: ScriptRecord) => void;
  updateScript: (id: string, patch: Partial<ScriptRecord>) => void;
  deleteScript: (id: string) => void;
  duplicateScript: (id: string) => string | undefined;
  toggleFavorite: (id: string) => void;
  setStatus: (id: string, status: ScriptStatus) => void;
  getScript: (id: string) => ScriptRecord | undefined;

  addCanvas: (canvas: CanvasBoard) => void;
  updateCanvas: (id: string, patch: Partial<CanvasBoard>) => void;
  deleteCanvas: (id: string) => void;
  getCanvas: (id: string) => CanvasBoard | undefined;

  setHydrated: () => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      scripts: [],
      canvases: [],
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

      addCanvas: (canvas) => set((s) => ({ canvases: [canvas, ...s.canvases] })),

      updateCanvas: (id, patch) =>
        set((s) => ({
          canvases: s.canvases.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCanvas: (id) => set((s) => ({ canvases: s.canvases.filter((c) => c.id !== id) })),

      getCanvas: (id) => get().canvases.find((c) => c.id === id),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "system-content-studio",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
