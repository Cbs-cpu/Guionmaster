"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Field";
import { StaticTag } from "@/components/ui/Chip";
import { useStudioStore } from "@/lib/store";
import { useKnowledgeLibrary } from "@/lib/useKnowledgeLibrary";
import { useScriptRelations } from "@/lib/relations";
import { SCRIPT_TYPE_ICONS } from "@/components/ui/ContentIcons";
import { SCRIPT_TYPE_LABELS, type ScriptRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BookOpen, Check, Plus, X } from "lucide-react";

export function LinksSection({ script }: { script: ScriptRecord }) {
  const { knowledge, related } = useScriptRelations(script);
  const [picker, setPicker] = useState<"conocimiento" | "contenido" | null>(null);

  return (
    <div className="pb-4 mb-4 border-b border-rule">
      <p className="label-caps text-[10px] text-ink-faint px-1 mb-1">Entrelazado</p>
      <p className="px-1 mb-3 text-[12.5px] text-ink-faint leading-relaxed">
        De dónde nace este contenido y con qué otros documentos forma familia.
      </p>

      <Block
        label="Viene de"
        empty="Sin marco de conocimiento asignado."
        onAdd={() => setPicker(picker === "conocimiento" ? null : "conocimiento")}
        adding={picker === "conocimiento"}
      >
        {knowledge.map((c) => (
          <RowLink key={c.id} href={`/conocimiento/${c.id}`} icon={<BookOpen className="h-3.5 w-3.5 text-blueprint" />}>
            <span className="block truncate font-medium">{c.nombre}</span>
            <span className="block truncate text-[11px] text-ink-faint">{c.fuente.obraOMarco}</span>
          </RowLink>
        ))}
      </Block>

      {picker === "conocimiento" && <KnowledgePicker script={script} onClose={() => setPicker(null)} />}

      {script.concepts.length > 0 && (
        <div className="mt-3">
          <p className="label-caps text-[9.5px] text-ink-faint px-1 mb-1.5">Temas</p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {script.concepts.map((c) => (
              <StaticTag key={c} tone="blueprint">
                {c}
              </StaticTag>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        <Block
          label="Contenido correlacionado"
          empty="Sin contenidos vinculados."
          onAdd={() => setPicker(picker === "contenido" ? null : "contenido")}
          adding={picker === "contenido"}
        >
          {related.map((r) => {
            const Icon = SCRIPT_TYPE_ICONS[r.type];
            return (
              <RowLink key={r.id} href={`/editor/${r.id}`} icon={<Icon className="h-3.5 w-3.5 text-accent" />}>
                <span className="block truncate font-medium">{r.title}</span>
                <span className="block truncate text-[11px] text-ink-faint">{SCRIPT_TYPE_LABELS[r.type]}</span>
              </RowLink>
            );
          })}
        </Block>
      </div>

      {picker === "contenido" && <ScriptPicker script={script} onClose={() => setPicker(null)} />}
    </div>
  );
}

function Block({
  label,
  empty,
  onAdd,
  adding,
  children,
}: {
  label: string;
  empty: string;
  onAdd: () => void;
  adding: boolean;
  children: React.ReactNode[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 px-1 mb-1.5">
        <span className="label-caps text-[9.5px] text-ink-faint">{label}</span>
        <button
          onClick={onAdd}
          className={cn(
            "press flex items-center gap-1 text-[11px] transition-colors",
            adding ? "text-accent" : "text-ink-faint hover:text-accent"
          )}
        >
          {adding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {adding ? "Cerrar" : "Añadir"}
        </button>
      </div>
      {children.length === 0 ? (
        <p className="px-1 text-[12px] text-ink-faint italic">{empty}</p>
      ) : (
        <ul className="space-y-1">{children}</ul>
      )}
    </div>
  );
}

function RowLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-2 rounded-sm border border-rule bg-paper-sunken/40 px-3 py-2 text-[12.5px] text-ink hover:border-accent hover:text-accent transition-colors"
      >
        <span className="mt-0.5 shrink-0">{icon}</span>
        <span className="min-w-0 flex-1 leading-snug">{children}</span>
      </Link>
    </li>
  );
}

function KnowledgePicker({ script, onClose }: { script: ScriptRecord; onClose: () => void }) {
  const { categories } = useKnowledgeLibrary();
  const toggle = useStudioStore((s) => s.toggleScriptKnowledge);
  const [query, setQuery] = useState("");
  const selected = script.knowledgeIds ?? [];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.ideaFundamental.toLowerCase().includes(q)
    );
  }, [categories, query]);

  return (
    <PickerShell placeholder="Buscar marco…" query={query} onQuery={setQuery} onClose={onClose} empty={results.length === 0}>
      {results.map((c) => (
        <PickerRow
          key={c.id}
          selected={selected.includes(c.id)}
          onClick={() => toggle(script.id, c.id)}
          title={c.nombre}
          subtitle={c.fuente.obraOMarco}
        />
      ))}
    </PickerShell>
  );
}

function ScriptPicker({ script, onClose }: { script: ScriptRecord; onClose: () => void }) {
  const scripts = useStudioStore((s) => s.scripts);
  const toggle = useStudioStore((s) => s.toggleScriptLink);
  const [query, setQuery] = useState("");
  const selected = script.relatedScriptIds ?? [];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scripts
      .filter((s) => s.id !== script.id)
      .filter((s) => (q ? s.title.toLowerCase().includes(q) : true));
  }, [scripts, script.id, query]);

  return (
    <PickerShell
      placeholder="Buscar guion…"
      query={query}
      onQuery={setQuery}
      onClose={onClose}
      empty={results.length === 0}
    >
      {results.map((s) => (
        <PickerRow
          key={s.id}
          selected={selected.includes(s.id)}
          onClick={() => toggle(script.id, s.id)}
          title={s.title}
          subtitle={SCRIPT_TYPE_LABELS[s.type]}
        />
      ))}
    </PickerShell>
  );
}

function PickerShell({
  placeholder,
  query,
  onQuery,
  onClose,
  empty,
  children,
}: {
  placeholder: string;
  query: string;
  onQuery: (v: string) => void;
  onClose: () => void;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 rounded-sm border border-rule-strong bg-paper-raised p-2">
      <Input
        autoFocus
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        placeholder={placeholder}
        className="text-xs py-1.5 mb-1.5"
      />
      {empty ? (
        <p className="px-1 py-2 text-[12px] text-ink-faint italic">Nada que enlazar todavía.</p>
      ) : (
        <ul className="max-h-56 overflow-y-auto space-y-0.5">{children}</ul>
      )}
    </div>
  );
}

function PickerRow({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "press w-full text-left flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors",
          selected ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-paper-sunken"
        )}
      >
        <span
          className={cn(
            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
            selected ? "border-accent bg-accent text-accent-ink" : "border-rule-strong"
          )}
        >
          {selected && <Check className="h-2.5 w-2.5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] leading-snug">{title}</span>
          <span className="block truncate text-[10.5px] text-ink-faint">{subtitle}</span>
        </span>
      </button>
    </li>
  );
}
