"use client";

import { create } from "zustand";

// Estado de interfaz efímero (no persistido) compartido entre el layout
// global (Sidebar / MobileTopBar) y páginas que necesitan pedir pantalla
// completa, como el modo lectura del editor.
interface UiState {
  chromeHidden: boolean;
  setChromeHidden: (hidden: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  chromeHidden: false,
  setChromeHidden: (hidden) => set({ chromeHidden: hidden }),
}));
