"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { useStudioStore } from "@/lib/store";
import {
  KnowledgeImportError,
  buildResearchPrompt,
  buildSchemaExample,
  downloadKnowledgeExport,
  parseImportedKnowledgeDetailed,
} from "@/lib/knowledge-io";
import { cn } from "@/lib/utils";
import { Check, Copy, Download, Upload, X } from "lucide-react";

type Feedback = { kind: "ok" | "error"; message: string } | null;

export function KnowledgeIO() {
  const customKnowledge = useStudioStore((s) => s.customKnowledge);
  const importKnowledgeCategories = useStudioStore((s) => s.importKnowledgeCategories);

  const [open, setOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [copied, setCopied] = useState<"prompt" | "formato" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function runImport(raw: string, sourceLabel: string) {
    try {
      const { categories, omitidosDeSerie } = parseImportedKnowledgeDetailed(raw);
      importKnowledgeCategories(categories);
      const plural = categories.length === 1 ? "" : "s";
      setFeedback({
        kind: "ok",
        message:
          `${categories.length} documento${plural} importado${plural} desde ${sourceLabel}: ` +
          categories.map((c) => c.nombre).join(", ") +
          "." +
          (omitidosDeSerie.length
            ? ` (Se han omitido ${omitidosDeSerie.length} que ya vienen de serie en la app.)`
            : ""),
      });
      setPasted("");
    } catch (err) {
      setFeedback({
        kind: "error",
        message: err instanceof KnowledgeImportError ? err.message : "No se ha podido importar el archivo.",
      });
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    runImport(text, file.name);
    e.target.value = "";
  }

  async function copy(text: string, which: "prompt" | "formato") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setFeedback({ kind: "error", message: "El navegador ha bloqueado el portapapeles. Copia el texto a mano." });
    }
  }

  return (
    <section className="paper-panel rounded-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4">
        <div>
          <p className="label-caps text-[10px] text-ink-faint mb-1">Importar / exportar</p>
          <p className="text-[13px] text-ink-soft leading-relaxed max-w-lg">
            Saca el formato de los documentos para pedirle investigación a ChatGPT, y vuelve a meter aquí lo que te
            devuelva.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => downloadKnowledgeExport(customKnowledge)}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setOpen((v) => !v)}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Importar
          </Button>
        </div>
      </header>

      {open && (
        <div className="border-t border-rule px-5 sm:px-6 py-5 space-y-5 animate-fade-up">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="label-caps text-[10px] text-ink-faint">1 · Pídeselo a ChatGPT</p>
              <button
                onClick={() => copy(buildResearchPrompt(), "prompt")}
                className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-soft hover:text-accent"
              >
                {copied === "prompt" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied === "prompt" ? "Copiado" : "Copiar prompt"}
              </button>
            </div>
            <p className="text-[13px] text-ink-soft leading-relaxed">
              Copia el prompt, cambia el tema por el que quieras investigar y pégalo en ChatGPT. Ya incluye el formato
              exacto y las reglas (citar fuentes reales, no inventar datos, español directo).
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="label-caps text-[10px] text-ink-faint">2 · Pega aquí su respuesta</p>
              <button
                onClick={() => copy(buildSchemaExample(), "formato")}
                className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-soft hover:text-accent"
              >
                {copied === "formato" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied === "formato" ? "Copiado" : "Ver formato"}
              </button>
            </div>
            <Textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={6}
              placeholder='Pega aquí el JSON, por ejemplo: {"categorias": [{"nombre": "...", "ideaFundamental": "...", "fuente": {...}, "conceptos": [...]}]}'
              className="font-label text-[12px] leading-relaxed"
            />
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <Button size="sm" onClick={() => runImport(pasted, "el texto pegado")} disabled={!pasted.trim()}>
                Importar pegado
              </Button>
              <span className="text-[11px] text-ink-faint">o</span>
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                Subir archivo .json
              </Button>
              <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
            </div>
          </div>

          {feedback && (
            <div
              className={cn(
                "rounded-sm border px-4 py-3 text-[13px] leading-relaxed flex items-start gap-2.5",
                feedback.kind === "ok"
                  ? "border-state-publicado/40 bg-state-publicado/10 text-ink"
                  : "border-accent/40 bg-accent-soft text-ink"
              )}
            >
              {feedback.kind === "ok" ? (
                <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-state-publicado" />
              ) : (
                <X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
