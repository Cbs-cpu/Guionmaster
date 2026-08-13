"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { StaticTag } from "@/components/ui/Chip";
import { SOURCE_PLATFORM_ICONS } from "@/components/ui/ContentIcons";
import { useStudioStore } from "@/lib/store";
import { SourceImportError, parseImportedSources } from "@/lib/sources-io";
import { SOURCE_PLATFORM_LABELS, type ContentSource, type SourcePlatform } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Trash2, Upload, X } from "lucide-react";

const FORMAT_EXAMPLE = `{
  "fuentes": [
    {
      "plataforma": "youtube",
      "titulo": "Por qué automatizar un proceso roto no arregla nada",
      "autor": "Canal de referencia",
      "url": "https://…",
      "publicadoEn": "2026-02-14",
      "duracion": "14:20",
      "temas": ["automatización", "procesos", "cuellos de botella"],
      "resumen": "Dos frases con la idea principal.",
      "transcripcion": "Texto completo de lo que se dice…"
    }
  ]
}`;

export default function FuentesPage() {
  const hydrated = useStudioStore((s) => s.hydrated);
  const sources = useStudioStore((s) => s.sources);

  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<SourcePlatform | "todas">("todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sources.filter((s) => {
      if (platform !== "todas" && s.plataforma !== platform) return false;
      if (!q) return true;
      return (
        s.titulo.toLowerCase().includes(q) ||
        s.transcripcion.toLowerCase().includes(q) ||
        s.temas.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [sources, platform, query]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Fuentes de contenido"
        title="El archivo de lo que ya se ha dicho"
        description="Una micro base de datos de reels, vídeos de YouTube y carruseles de Instagram guardados con su transcripción, para poder buscar por lo que se dice y no solo por el título."
      />

      <div className="mt-8">
        <ImportPanel />
      </div>

      {!hydrated ? null : sources.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mt-8 paper-panel rounded-sm p-4 flex flex-col sm:flex-row flex-wrap gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en títulos, temas y transcripciones…"
              className="sm:flex-1"
            />
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SourcePlatform | "todas")}
              className="sm:w-44"
            >
              <option value="todas">Todas las plataformas</option>
              {Object.entries(SOURCE_PLATFORM_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 paper-panel rounded-sm px-6 py-10 text-center">
              <p className="font-display text-lg mb-1">Sin resultados</p>
              <p className="text-sm text-ink-soft">Ninguna fuente menciona eso.</p>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {filtered.map((source) => (
                <SourceCard key={source.id} source={source} query={query} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 paper-panel rounded-sm px-6 sm:px-10 py-12">
      <p className="label-caps text-[10px] text-ink-faint mb-3">Archivo vacío</p>
      <p className="font-display text-2xl leading-snug max-w-xl">
        Todavía no hay ninguna fuente guardada.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft leading-relaxed">
        Esta sección es el archivo del contenido que ya existe: tus propios reels y vídeos, y los de referencia que
        quieras estudiar. Cada entrada guarda su transcripción completa, así que se puede buscar por una frase suelta y
        recuperar de qué vídeo salió.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft leading-relaxed">
        A diferencia de <span className="text-ink">Conocimiento</span>, que guarda marcos de referencia con su fuente
        citada, aquí se guarda contenido tal cual se publicó.
      </p>
    </div>
  );
}

type Feedback = { kind: "ok" | "error"; message: string } | null;

function ImportPanel() {
  const addSources = useStudioStore((s) => s.addSources);
  const [open, setOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  function runImport() {
    try {
      const parsed = parseImportedSources(pasted);
      addSources(parsed);
      const plural = parsed.length === 1 ? "" : "s";
      setFeedback({ kind: "ok", message: `${parsed.length} fuente${plural} añadida${plural} al archivo.` });
      setPasted("");
    } catch (err) {
      setFeedback({
        kind: "error",
        message: err instanceof SourceImportError ? err.message : "No se ha podido importar el archivo.",
      });
    }
  }

  return (
    <section className="paper-panel rounded-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4">
        <div>
          <p className="label-caps text-[10px] text-ink-faint mb-1">Importar archivo</p>
          <p className="max-w-lg text-[13px] leading-relaxed text-ink-soft">
            Pega aquí un JSON con transcripciones y se vuelca al archivo.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          {open ? "Cerrar" : "Importar"}
        </Button>
      </header>

      {open && (
        <div className="animate-fade-up space-y-5 border-t border-rule px-5 sm:px-6 py-5">
          <div>
            <p className="label-caps text-[10px] text-ink-faint mb-2">Formato esperado</p>
            <pre className="overflow-x-auto rounded-sm border border-rule bg-paper-sunken/50 p-4 font-label text-[11.5px] leading-relaxed">
              {FORMAT_EXAMPLE}
            </pre>
            <p className="mt-1.5 text-[11px] text-ink-faint">
              Solo <span className="code-inline">titulo</span> y <span className="code-inline">transcripcion</span> son
              obligatorios. Lo demás se rellena si viene.
            </p>
          </div>

          <div>
            <p className="label-caps text-[10px] text-ink-faint mb-2">Pega el JSON</p>
            <Textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={10}
              placeholder="Pega aquí la base de datos…"
              className="font-label text-[11.5px] leading-relaxed"
            />
            <Button size="sm" className="mt-2.5" onClick={runImport} disabled={!pasted.trim()}>
              Importar
            </Button>
          </div>

          {feedback && (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-sm border px-4 py-3 text-[13px] leading-relaxed",
                feedback.kind === "ok"
                  ? "border-state-publicado/40 bg-state-publicado/10 text-ink"
                  : "border-accent/40 bg-accent-soft text-ink"
              )}
            >
              {feedback.kind === "ok" ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-state-publicado" />
              ) : (
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SourceCard({ source, query }: { source: ContentSource; query: string }) {
  const removeSource = useStudioStore((s) => s.removeSource);
  const [expanded, setExpanded] = useState(false);
  const Icon = SOURCE_PLATFORM_ICONS[source.plataforma];

  return (
    <li className="paper-panel group rounded-sm px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blueprint" />
          <div className="min-w-0">
            <p className="label-caps text-[9.5px] text-ink-faint">
              {SOURCE_PLATFORM_LABELS[source.plataforma]}
              {source.autor ? ` · ${source.autor}` : ""}
              {source.duracion ? ` · ${source.duracion}` : ""}
            </p>
            <h3 className="font-display text-[1.05rem] leading-snug">
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  {source.titulo}
                </a>
              ) : (
                source.titulo
              )}
            </h3>
          </div>
        </div>
        <button
          onClick={() => removeSource(source.id)}
          aria-label="Eliminar fuente"
          className="press shrink-0 p-1 text-ink-faint opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {source.resumen && <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{source.resumen}</p>}

      {source.temas.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {source.temas.map((t) => (
            <StaticTag key={t} tone="blueprint">
              {t}
            </StaticTag>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="press label-caps mt-3 flex items-center gap-1.5 text-[10px] text-ink-faint hover:text-accent"
      >
        <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
        Transcripción
      </button>

      {expanded && (
        <p className="mt-2 max-h-80 overflow-y-auto whitespace-pre-line border-t border-rule pt-3 text-[13px] leading-relaxed text-ink-soft">
          {source.transcripcion}
        </p>
      )}

      {!expanded && query.trim() && <Excerpt text={source.transcripcion} query={query.trim()} />}
    </li>
  );
}

/** Cuando se busca, se enseña el trocito de transcripción donde aparece la frase. */
function Excerpt({ text, query }: { text: string; query: string }) {
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at < 0) return null;
  const start = Math.max(0, at - 90);
  const end = Math.min(text.length, at + query.length + 90);
  return (
    <p className="mt-2 border-l-2 border-accent/40 pl-3 text-[12.5px] leading-relaxed text-ink-soft">
      {start > 0 && "…"}
      {text.slice(start, at)}
      <mark className="rounded-[2px] bg-accent-soft px-0.5 text-ink">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length, end)}
      {end < text.length && "…"}
    </p>
  );
}
