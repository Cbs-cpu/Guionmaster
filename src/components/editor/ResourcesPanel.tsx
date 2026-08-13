"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LinksSection } from "./LinksSection";
import { makeId } from "@/lib/utils";
import type { ResourceLink, ScriptRecord } from "@/lib/types";
import { ExternalLink, FileText, Trash2 } from "lucide-react";

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
