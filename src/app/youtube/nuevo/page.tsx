"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { FieldShell, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { VocabPicker } from "@/components/generator/VocabPicker";
import { Stepper } from "@/components/generator/Stepper";
import { AiErrorNote } from "@/components/ui/AiErrorNote";
import { StaticTag } from "@/components/ui/Chip";
import { postJson } from "@/lib/apiClient";
import { useStudioStore } from "@/lib/store";
import { makeId } from "@/lib/utils";
import {
  SERVICIO_LABELS,
  YOUTUBE_TYPE_LABELS,
  type Servicio,
  type YoutubeChapter,
  type YoutubeInputs,
  type YoutubeVideoType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["Inputs", "Títulos", "Guion"];

const DEFAULT_INPUTS: YoutubeInputs = {
  tema: "",
  publico: "",
  objetivo: "",
  conceptos: "",
  duracion: "12 minutos",
  tipo: "educativo",
};

const DEFAULT_SERVICIO: Servicio = "odoo";

export default function NuevoYoutubePage() {
  const router = useRouter();
  const addScript = useStudioStore((s) => s.addScript);

  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<YoutubeInputs>(DEFAULT_INPUTS);
  const [servicio, setServicio] = useState<Servicio>(DEFAULT_SERVICIO);
  const [conceptTags, setConceptTags] = useState<string[]>([]);

  const [loadingTitles, setLoadingTitles] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [titlesError, setTitlesError] = useState<unknown>(null);

  const [loadingScript, setLoadingScript] = useState(false);
  const [hook, setHook] = useState("");
  const [promesa, setPromesa] = useState("");
  const [chapters, setChapters] = useState<YoutubeChapter[]>([]);
  const [scriptError, setScriptError] = useState<unknown>(null);

  function toggleConceptTag(word: string) {
    setConceptTags((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]));
  }

  function effectiveConceptos() {
    return [inputs.conceptos, ...conceptTags].filter(Boolean).join(", ");
  }

  async function handleGenerateTitles() {
    setLoadingTitles(true);
    setTitlesError(null);
    try {
      const data = await postJson<{ titulos: string[] }>("/api/ai/youtube-titles", {
        ...inputs,
        conceptos: effectiveConceptos(),
      });
      setTitles(data.titulos);
      setSelectedTitle(null);
      setStep(1);
    } catch (err) {
      setTitlesError(err);
    } finally {
      setLoadingTitles(false);
    }
  }

  async function handleGenerateScript() {
    if (!selectedTitle) return;
    setLoadingScript(true);
    setScriptError(null);
    try {
      const data = await postJson<{ hook: string; promesa: string; chapters: Omit<YoutubeChapter, "id">[] }>(
        "/api/ai/youtube-script",
        { ...inputs, conceptos: effectiveConceptos(), tituloElegido: selectedTitle }
      );
      setHook(data.hook);
      setPromesa(data.promesa);
      setChapters(data.chapters.map((c) => ({ ...c, id: makeId("chapter") })));
      setStep(2);
    } catch (err) {
      setScriptError(err);
    } finally {
      setLoadingScript(false);
    }
  }

  function handleSave() {
    const now = new Date().toISOString();
    const id = makeId("script");
    addScript({
      id,
      type: "youtube",
      title: selectedTitle || inputs.tema,
      service: servicio,
      concepts: conceptTags,
      status: "borrador",
      favorite: false,
      createdAt: now,
      updatedAt: now,
      youtubeInputs: inputs,
      titleOptions: titles,
      selectedTitle: selectedTitle ?? undefined,
      youtubeHook: hook,
      promesa,
      chapters,
    });
    router.push(`/editor/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Generador · YouTube"
        title="Nuevo vídeo"
        description="5-30 minutos. Título → Hook → Promesa → Capítulos → Guion → Visuales."
      />

      <div className="mt-8 mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      {step === 0 && (
        <Panel className="animate-fade-up">
          <div className="grid sm:grid-cols-2 gap-5">
            <FieldShell label="Servicio">
              <Select value={servicio} onChange={(e) => setServicio(e.target.value as Servicio)}>
                {Object.entries(SERVICIO_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <FieldShell label="Tipo de vídeo">
              <Select
                value={inputs.tipo}
                onChange={(e) => setInputs({ ...inputs, tipo: e.target.value as YoutubeVideoType })}
              >
                {Object.entries(YOUTUBE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <FieldShell label="Duración">
              <Select value={inputs.duracion} onChange={(e) => setInputs({ ...inputs, duracion: e.target.value })}>
                {["5 minutos", "8 minutos", "12 minutos", "18 minutos", "25 minutos", "30 minutos"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <div className="sm:col-span-2">
              <FieldShell label="Tema" hint="De qué trata el vídeo">
                <Input
                  value={inputs.tema}
                  onChange={(e) => setInputs({ ...inputs, tema: e.target.value })}
                  placeholder="Ej: por qué automatizar un proceso roto solo hace el caos más rápido"
                />
              </FieldShell>
            </div>

            <FieldShell label="Público">
              <Input
                value={inputs.publico}
                onChange={(e) => setInputs({ ...inputs, publico: e.target.value })}
                placeholder="Ej: gerentes de pymes de 10-50 empleados"
              />
            </FieldShell>

            <FieldShell label="Objetivo">
              <Input
                value={inputs.objetivo}
                onChange={(e) => setInputs({ ...inputs, objetivo: e.target.value })}
                placeholder="Ej: que entiendan el proceso antes de pensar en herramientas"
              />
            </FieldShell>

            <div className="sm:col-span-2">
              <FieldShell label="Conceptos a tratar" hint="Separados por comas">
                <Textarea
                  value={inputs.conceptos}
                  onChange={(e) => setInputs({ ...inputs, conceptos: e.target.value })}
                  placeholder="Ej: cuellos de botella, value stream mapping, silos de información"
                  rows={2}
                />
              </FieldShell>
            </div>
          </div>

          <div className="mt-5">
            <VocabPicker onPick={toggleConceptTag} />
            {conceptTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {conceptTags.map((t) => (
                  <StaticTag key={t} tone="accent">
                    {t}
                  </StaticTag>
                ))}
              </div>
            )}
          </div>

          {titlesError ? <div className="mt-5"><AiErrorNote error={titlesError} /></div> : null}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleGenerateTitles}
              loading={loadingTitles}
              disabled={!inputs.tema || !inputs.publico || !inputs.objetivo}
            >
              Generar 5 títulos
            </Button>
          </div>
        </Panel>
      )}

      {step === 1 && (
        <div className="animate-fade-up space-y-4">
          <div className="space-y-2.5">
            {titles.map((title) => (
              <button
                key={title}
                onClick={() => setSelectedTitle(title)}
                className={cn(
                  "hover-lift w-full text-left paper-panel rounded-sm px-5 py-4 transition-colors",
                  selectedTitle === title && "border-accent bg-accent-soft"
                )}
              >
                <p className="font-display text-[1.1rem] leading-snug">{title}</p>
              </button>
            ))}
          </div>

          {scriptError ? <AiErrorNote error={scriptError} /> : null}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              ← Volver
            </Button>
            <Button onClick={handleGenerateScript} loading={loadingScript} disabled={!selectedTitle}>
              Generar guion completo
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up space-y-4">
          <Panel eyebrow="Apertura" title="Hook y promesa">
            <p className="text-sm leading-relaxed mb-3">{hook}</p>
            <p className="text-sm text-ink-soft leading-relaxed italic">“{promesa}”</p>
          </Panel>

          <Panel eyebrow="Estructura" title={`${chapters.length} capítulos`}>
            <ol className="space-y-5">
              {chapters.map((ch, i) => (
                <li key={ch.id} className="pb-5 border-b border-rule last:border-0 last:pb-0">
                  <p className="label-caps text-[10px] text-accent mb-1">
                    {String(i + 1).padStart(2, "0")} · {ch.titulo}
                  </p>
                  <p className="text-[13px] text-ink-soft mb-2">{ch.resumen}</p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{ch.guion}</p>
                  <p className="text-[12px] text-ink-faint mt-2">Visual: {ch.visual.queMostrar}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              ← Volver
            </Button>
            <Button onClick={handleSave}>Guardar y abrir en el editor</Button>
          </div>
        </div>
      )}
    </div>
  );
}
