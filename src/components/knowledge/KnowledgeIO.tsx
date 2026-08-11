"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useStudioStore } from "@/lib/store";
import {
  KnowledgeImportError,
  buildResearchPrompt,
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
  const [tema, setTema] = useState("");
  const [pasted, setPasted] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const prompt = buildResearchPrompt(tema.trim() || undefined);

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

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, al menos dejamos el texto
      // seleccionado para poder copiarlo con Ctrl+C.
      promptRef.current?.select();
      setFeedback({
        kind: "error",
        message: "El navegador ha bloqueado el portapapeles. He seleccionado el texto: cópialo con Ctrl+C.",
      });
    }
  }

  return (
    <section className="paper-panel rounded-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4">
        <div>
          <p className="label-caps text-[10px] text-ink-faint mb-1">Importar / exportar</p>
          <p className="text-[13px] text-ink-soft leading-relaxed max-w-lg">
            Pídele investigación a ChatGPT con el formato de la app, y vuelve a meter aquí lo que te devuelva.
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
        <div className="border-t border-rule px-5 sm:px-6 py-5 space-y-6 animate-fade-up">
          <div>
            <p className="label-caps text-[10px] text-ink-faint mb-2">1 · Escribe el tema</p>
            <Input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ej: teoría de colas aplicada a procesos de negocio"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="label-caps text-[10px] text-ink-faint">2 · Copia este prompt en ChatGPT</p>
              <button
                onClick={copyPrompt}
                className="press label-caps flex items-center gap-1.5 text-[10px] text-ink-soft hover:text-accent"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copiado" : "Copiar prompt"}
              </button>
            </div>
            <Textarea
              ref={promptRef}
              readOnly
              value={prompt}
              onFocus={(e) => e.currentTarget.select()}
              rows={12}
              className="font-label text-[11.5px] leading-relaxed bg-paper-sunken/50"
            />
            <p className="text-[11px] text-ink-faint mt-1.5">
              Incluye el formato completo y las reglas. Puedes desplazarte dentro del cuadro para leerlo entero.
            </p>
          </div>

          <div>
            <p className="label-caps text-[10px] text-ink-faint mb-2">3 · Pega aquí su respuesta</p>
            <Textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={10}
              placeholder="Pega la respuesta de ChatGPT tal cual. Da igual si trae texto alrededor o viene dentro de un bloque de código: se extrae el JSON automáticamente."
              className="font-label text-[11.5px] leading-relaxed"
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
