"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScriptCard } from "@/components/library/ScriptCard";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useStudioStore } from "@/lib/store";
import { SCRIPT_STATUSES, SERVICIO_LABELS, STATUS_LABELS, type ScriptStatus, type ScriptType, type Servicio } from "@/lib/types";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BibliotecaPage() {
  const hydrated = useStudioStore((s) => s.hydrated);
  const scripts = useStudioStore((s) => s.scripts);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ScriptType | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<ScriptStatus | "todos">("todos");
  const [serviceFilter, setServiceFilter] = useState<Servicio | "todos">("todos");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filtered = useMemo(() => {
    return scripts.filter((s) => {
      if (typeFilter !== "todos" && s.type !== typeFilter) return false;
      if (statusFilter !== "todos" && s.status !== statusFilter) return false;
      if (serviceFilter !== "todos" && s.service !== serviceFilter) return false;
      if (onlyFavorites && !s.favorite) return false;
      if (query && !s.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [scripts, typeFilter, statusFilter, serviceFilter, onlyFavorites, query]);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Biblioteca"
        title="Tus guiones"
        description="Reels y vídeos de YouTube, con su estado de producción."
        action={
          <div className="flex gap-2">
            <Link href="/reels/nuevo">
              <Button variant="secondary" size="sm">
                + Reel
              </Button>
            </Link>
            <Link href="/youtube/nuevo">
              <Button size="sm">+ YouTube</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-8 paper-panel rounded-sm p-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título…"
          className="sm:w-56"
        />
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ScriptType | "todos")} className="sm:w-36">
          <option value="todos">Todos los tipos</option>
          <option value="reel">Reel</option>
          <option value="youtube">YouTube</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ScriptStatus | "todos")}
          className="sm:w-40"
        >
          <option value="todos">Todos los estados</option>
          {SCRIPT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value as Servicio | "todos")}
          className="sm:w-48"
        >
          <option value="todos">Todos los servicios</option>
          {Object.entries(SERVICIO_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <button
          onClick={() => setOnlyFavorites((v) => !v)}
          className={cn(
            "press flex items-center gap-1.5 text-xs px-3 py-2 rounded-sm border transition-colors",
            onlyFavorites ? "border-accent text-accent bg-accent-soft" : "border-rule-strong text-ink-soft hover:border-ink"
          )}
        >
          <Star className={cn("h-3.5 w-3.5", onlyFavorites && "fill-accent")} />
          Favoritos
        </button>
      </div>

      {!hydrated ? null : filtered.length === 0 ? (
        <div className="mt-10 paper-panel rounded-sm px-6 py-10 text-center">
          <p className="font-display text-lg mb-1">Sin resultados</p>
          <p className="text-sm text-ink-soft">Ajusta los filtros o crea un nuevo guion.</p>
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <ScriptCard key={s.id} script={s} />
          ))}
        </div>
      )}
    </div>
  );
}
