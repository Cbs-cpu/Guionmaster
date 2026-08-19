"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LinksSection } from "./LinksSection";
import { VisualThumb } from "@/components/ui/VisualThumb";
import { makeId } from "@/lib/utils";
import { VISUAL_RESOURCE_LABELS, type ResourceLink, type ScriptRecord } from "@/lib/types";
import { ExternalLink, FileText, ImageOff, Trash2 } from "lucide-react";

export function ResourcesPanel({
  script,
  onPatch,
}: {
  script: ScriptRecord;
  onPatch: (patch: Partial<ScriptRecord>) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const resources = script.resources ?? [];

  function addResource() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    const withProtocol = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
    const resource: ResourceLink = {
      id: makeId("resource"),
      titulo: titulo.trim() || withProtocol,
      url: withProtocol,
    };
    onPatch({ resources: [...resources, resource] });
    setTitulo("");
    setUrl("");
  }

  function removeResource(id: string) {
    onPatch({ resources: resources.filter((r) => r.id !== id) });
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <VisualsSection script={script} onPatch={onPatch} />

      <LinksSection script={script} />

      <p className="label-caps text-[10px] text-ink-faint px-1 mb-1">Recursos</p>
      <p className="px-1 mb-4 text-[12.5px] text-ink-faint leading-relaxed">
        Enlaces de apoyo para este guion: un PDF, una carpeta de Drive, un artículo de referencia.
      </p>

      {resources.length === 0 ? (
        <p className="px-1 text-[13px] text-ink-faint italic mb-4">Todavía no has añadido ningún recurso.</p>
      ) : (
        <ul className="space-y-1.5 mb-4">
          {resources.map((r) => (
            <li key={r.id} className="group flex items-start gap-2 rounded-sm border border-rule bg-paper-sunken/40 px-3 py-2.5">
              <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blueprint" />
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 text-[12.5px] text-ink hover:text-accent leading-snug"
              >
                <span className="block truncate font-medium">{r.titulo}</span>
                <span className="flex items-center gap-1 text-[11px] text-ink-faint truncate">
                  {r.url} <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </span>
              </a>
              <button
                onClick={() => removeResource(r.id)}
                aria-label="Eliminar recurso"
                className="press shrink-0 text-ink-faint hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-4 border-t border-rule space-y-2">
        <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título (opcional)" className="text-xs py-1.5" />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addResource())}
          placeholder="https://…"
          className="text-xs py-1.5"
        />
        <Button size="sm" variant="secondary" onClick={addResource} disabled={!url.trim()} className="w-full">
          Añadir recurso
        </Button>
      </div>
    </div>
  );
}

// Galería de infografías / imágenes de contexto / imágenes con foto propia
// generadas con Kie.ai (skill `recursos-visuales`). Solo lectura + borrado
// aquí: la generación en sí se hace en conversación con Claude Code, que
// escribe el resultado en `script.visuals` a través de /api/db/state.
function VisualsSection({
  script,
  onPatch,
}: {
  script: ScriptRecord;
  onPatch: (patch: Partial<ScriptRecord>) => void;
}) {
  const visuals = script.visuals ?? [];

  function remove(id: string) {
    onPatch({ visuals: visuals.filter((v) => v.id !== id) });
  }

  return (
    <div className="mb-5">
      <p className="label-caps text-[10px] text-ink-faint px-1 mb-1">Recursos visuales</p>
      <p className="px-1 mb-3 text-[12.5px] text-ink-faint leading-relaxed">
        Infografías e imágenes generadas con IA. Pídeselas a Claude Code (skill{" "}
        <code className="text-ink-soft">recursos-visuales</code>).
      </p>

      {visuals.length === 0 ? (
        <p className="px-1 flex items-center gap-2 text-[13px] text-ink-faint italic mb-1">
          <ImageOff className="h-3.5 w-3.5 shrink-0" />
          Todavía no hay ninguna.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {visuals.map((v) => (
            <li key={v.id} className="group relative overflow-hidden rounded-sm border border-rule">
              <VisualThumb visual={v} />
              <span className="label-caps absolute left-1 top-1 rounded-sm bg-ink/80 px-1.5 py-0.5 text-[8.5px] text-paper">
                {VISUAL_RESOURCE_LABELS[v.kind]}
              </span>
              <button
                onClick={() => remove(v.id)}
                aria-label="Eliminar recurso visual"
                className="press absolute right-1 top-1 rounded-sm bg-ink/80 p-1 text-paper opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
