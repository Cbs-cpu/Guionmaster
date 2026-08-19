"use client";

import { useEffect } from "react";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visor a pantalla completa para un recurso: imagen, vídeo o cualquier otro
 * contenido a medida (el estilo de subtítulos pasa su propia previsualización
 * como children en vez de una imagen).
 *
 * `position: fixed` + z alto en vez de un <dialog> nativo: el resto de la app
 * no usa ningún modal todavía, así que esto fija el patrón — overlay oscuro,
 * clic fuera o Escape para cerrar, scroll del body bloqueado mientras está
 * abierto para que no se pueda desplazar el fondo por debajo.
 */
export function Lightbox({
  onClose,
  title,
  subtitle,
  children,
}: {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 sm:p-8 animate-fade-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-sm bg-paper shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-3.5">
            <div className="min-w-0">
              {title && <p className="truncate font-display text-[1rem] leading-snug">{title}</p>}
              {subtitle && <p className="truncate text-[12px] text-ink-faint">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="press shrink-0 rounded-sm p-1.5 text-ink-faint transition-colors hover:bg-paper-sunken hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
        )}
        <div className={cn("min-h-0 flex-1 overflow-auto bg-paper-sunken/40", !title && !subtitle && "relative")}>
          {!title && !subtitle && (
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="press absolute right-3 top-3 z-10 rounded-full bg-ink/70 p-1.5 text-paper transition-colors hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

/** Overlay con lupa que aparece al pasar el ratón, para indicar "clic para ampliar". */
export function ExpandOverlay() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-150 group-hover/expand:bg-ink/35 group-hover/expand:opacity-100">
      <span className="rounded-full bg-paper/95 p-2 shadow-sm">
        <Maximize2 className="h-3.5 w-3.5 text-ink" />
      </span>
    </span>
  );
}
