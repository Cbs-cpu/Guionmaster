"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategorySection } from "./CategorySection";
import { ReadFlow, type ReadFlowSection } from "@/components/ui/ReadFlow";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useStudioStore } from "@/lib/store";
import { useUiStore } from "@/lib/uiStore";
import { useKnowledgeLibrary } from "@/lib/useKnowledgeLibrary";
import { useScriptsFromKnowledge } from "@/lib/relations";
import { SCRIPT_TYPE_LABELS, type KnowledgeCategory } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SCRIPT_TYPE_ICONS } from "@/components/ui/ContentIcons";
import { Maximize2, Trash2 } from "lucide-react";

export function KnowledgeDocView({ categoryId }: { categoryId: string }) {
  const { categories, hydrated } = useKnowledgeLibrary();
  const index = categories.findIndex((c) => c.id === categoryId);
  const category = index >= 0 ? categories[index] : undefined;

  // Hasta que no se lee localStorage no se sabe si un id importado existe.
  if (!hydrated) return null;

  if (!category) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-2xl mb-2">Documento no encontrado</p>
        <p className="text-sm text-ink-soft mb-5">
          Puede que se haya eliminado, o que lo importaras en otro navegador.
        </p>
        <Link href="/conocimiento" className="text-accent text-sm hover:underline">
          ← Volver a la biblioteca
        </Link>
      </div>
    );
  }

  return (
    <DocView
      category={category}
      index={index}
      prev={categories[index - 1]}
      next={categories[index + 1]}
    />
  );
}

function DocView({
  category,
  index,
  prev,
  next,
}: {
  category: KnowledgeCategory;
  index: number;
  prev?: KnowledgeCategory;
  next?: KnowledgeCategory;
}) {
  const router = useRouter();
  const [readMode, setReadMode] = useState(false);
  const setChromeHidden = useUiStore((s) => s.setChromeHidden);
  const notes = useStudioStore((s) => s.knowledgeNotes[category.id] ?? "");
  const setKnowledgeNote = useStudioStore((s) => s.setKnowledgeNote);
  const removeCustomCategory = useStudioStore((s) => s.removeCustomCategory);

  useEffect(() => {
    setChromeHidden(readMode);
    return () => setChromeHidden(false);
  }, [readMode, setChromeHidden]);

  if (readMode) {
    const sections: ReadFlowSection[] = [
      {
        id: "idea",
        label: "Idea fundamental",
        content: (
          <>
            <blockquote className="font-display italic text-2xl sm:text-[1.75rem] leading-[1.5] text-ink/90">
              “{category.ideaFundamental}”
            </blockquote>
            <p className="text-[13px] text-ink-faint mt-4">
              Fuente: {category.fuente.autor ? `${category.fuente.autor} — ` : ""}
              {category.fuente.obraOMarco}
            </p>
          </>
        ),
      },
      // La clase larga se lee de un tirón, como un artículo: una sola
      // sección continua, no trinchada concepto a concepto. El desglose por
      // concepto queda como índice de apoyo aparte (ver más abajo), no como
      // una sección de lectura por cada término.
      ...(category.clase
        ? [
            {
              id: "clase",
              label: "Clase",
              content: (
                <p className="font-display text-xl sm:text-2xl leading-[1.85] whitespace-pre-line">
                  {category.clase}
                </p>
              ),
            },
          ]
        : []),
      ...(category.resumen
        ? [
            {
              id: "resumen",
              label: category.clase ? "Resumen rápido" : "Resumen",
              content: (
                <p className="font-display text-2xl sm:text-[1.75rem] leading-[1.6] whitespace-pre-line">
                  {category.resumen}
                </p>
              ),
            },
          ]
        : []),
      {
        id: "conceptos",
        label: "Conceptos (índice)",
        content: (
          <dl className="space-y-5">
            {category.conceptos.map((c) => (
              <div key={c.id}>
                <dt className="font-display text-xl sm:text-2xl leading-snug">{c.termino}</dt>
                <dd className="text-base text-ink-soft leading-relaxed mt-1">{c.definicion}</dd>
              </div>
            ))}
          </dl>
        ),
      },
      ...listSection("aplicacion", "Cómo aplica", category.aplicacion ? [category.aplicacion] : undefined),
      ...listSection("ejemplos", "Ejemplos", category.ejemplos),
      ...listSection("errores", "Errores comunes", category.erroresComunes),
      ...listSection("preguntas", "Preguntas de diagnóstico", category.preguntasDiagnostico),
      ...listSection("ideas", "Ideas de contenido", category.ideasContenido),
      {
        id: "notes",
        label: "Mis apuntes",
        content: (
          <Textarea
            value={notes}
            onChange={(e) => setKnowledgeNote(category.id, e.target.value)}
            rows={10}
            placeholder="Escribe aquí tus apuntes sobre este marco…"
            className="font-display text-xl leading-[1.75] border-none bg-transparent shadow-none px-0 py-1 focus:ring-0 resize-none"
          />
        ),
      },
    ];
    return <ReadFlow sections={sections} initialId="idea" onExit={() => setReadMode(false)} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/conocimiento" className="text-sm text-ink-soft hover:text-accent inline-flex items-center gap-1.5">
          ← Biblioteca de conocimiento
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setReadMode(true)}>
          <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
          Modo lectura
        </Button>
      </div>

      <div className="mt-6">
        <CategorySection category={category} index={index} />
      </div>

      <RelatedContent categoryId={category.id} />

      <div className="mt-4 paper-panel rounded-sm px-6 sm:px-8 py-6">
        <p className="label-caps text-[10px] text-ink-faint mb-3">Mis apuntes</p>
        <Textarea
          value={notes}
          onChange={(e) => setKnowledgeNote(category.id, e.target.value)}
          rows={5}
          placeholder="Tus propias notas sobre este marco: ideas para vídeos, matices, ejemplos que se te ocurran…"
        />
      </div>

      {category.importado && (
        <div className="mt-4 flex items-center justify-between gap-3 paper-panel rounded-sm px-6 py-4">
          <p className="text-[12.5px] text-ink-faint">
            Documento importado{category.importadoEn ? ` el ${new Date(category.importadoEn).toLocaleDateString("es-ES")}` : ""}.
          </p>
          <button
            onClick={() => {
              if (confirm(`¿Eliminar "${category.nombre}" de la biblioteca?`)) {
                removeCustomCategory(category.id);
                router.push("/conocimiento");
              }
            }}
            className="press flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {prev ? (
          <Link href={`/conocimiento/${prev.id}`} className="hover-lift paper-panel rounded-sm px-4 py-3 text-left">
            <p className="label-caps text-[10px] text-ink-faint mb-1">← Anterior</p>
            <p className="text-sm font-medium truncate">{prev.nombre}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/conocimiento/${next.id}`} className="hover-lift paper-panel rounded-sm px-4 py-3 text-right ml-auto">
            <p className="label-caps text-[10px] text-ink-faint mb-1">Siguiente →</p>
            <p className="text-sm font-medium truncate">{next.nombre}</p>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function RelatedContent({ categoryId }: { categoryId: string }) {
  const scripts = useScriptsFromKnowledge(categoryId);

  return (
    <div className="mt-4 paper-panel rounded-sm px-6 sm:px-8 py-6">
      <p className="label-caps text-[10px] text-ink-faint mb-1">Contenido que sale de aquí</p>
      {scripts.length === 0 ? (
        <p className="text-[13px] text-ink-faint leading-relaxed">
          Ningún guion cita todavía este marco. En el editor de un guion, panel{" "}
          <span className="text-ink-soft">Recursos → Entrelazado → Viene de</span>, puedes marcarlo como origen.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-rule">
          {scripts.map((s) => {
            const Icon = SCRIPT_TYPE_ICONS[s.type];
            return (
              <li key={s.id}>
                <Link
                  href={`/editor/${s.id}`}
                  className="group flex items-center gap-3 py-2.5 transition-colors hover:text-accent"
                >
                  <Icon className="h-4 w-4 shrink-0 text-blueprint" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{s.title}</span>
                    <span className="label-caps block text-[9.5px] text-ink-faint">{SCRIPT_TYPE_LABELS[s.type]}</span>
                  </span>
                  <StatusBadge status={s.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function listSection(id: string, label: string, items?: string[]): ReadFlowSection[] {
  if (!items?.length) return [];
  return [
    {
      id,
      label,
      content: (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="font-display text-xl sm:text-2xl leading-[1.6] flex gap-3">
              <span className="label-caps text-[11px] text-accent mt-2 shrink-0">{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];
}
