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
  HOOK_TYPE_LABELS,
  REEL_BEAT_LABELS,
  REEL_BEAT_ORDER,
  SERVICIO_LABELS,
  type HookOption,
  type ReelBeat,
  type ReelInputs,
  type Servicio,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["Inputs", "Hooks", "Guion"];

const DEFAULT_INPUTS: ReelInputs = {
  servicio: "odoo",
  publico: "",
  problema: "",
  concepto: "",
  objetivo: "",
  duracion: "45 segundos",
  tono: "Directo, con autoridad, sin vender",
};

export default function NuevoReelPage() {
  const router = useRouter();
  const addScript = useStudioStore((s) => s.addScript);

  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<ReelInputs>(DEFAULT_INPUTS);
  const [conceptTags, setConceptTags] = useState<string[]>([]);

  const [loadingHooks, setLoadingHooks] = useState(false);
  const [hooks, setHooks] = useState<HookOption[]>([]);
  const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
  const [hooksError, setHooksError] = useState<unknown>(null);

  const [loadingBeats, setLoadingBeats] = useState(false);
  const [beats, setBeats] = useState<ReelBeat[]>([]);
  const [beatsError, setBeatsError] = useState<unknown>(null);

  function toggleConceptTag(word: string) {
    setConceptTags((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]));
  }

  function effectiveConcepto() {
    return [inputs.concepto, ...conceptTags].filter(Boolean).join(", ");
  }

  async function handleGenerateHooks() {
    setLoadingHooks(true);
    setHooksError(null);
    try {
      const data = await postJson<{ hooks: { tipo: HookOption["tipo"]; texto: string }[] }>("/api/ai/hooks", {
        ...inputs,
        concepto: effectiveConcepto(),
      });
      setHooks(data.hooks.map((h) => ({ ...h, id: makeId("hook") })));
      setSelectedHookId(null);
      setStep(1);
    } catch (err) {
      setHooksError(err);
    } finally {
      setLoadingHooks(false);
    }
  }

  async function handleGenerateStructure() {
    const hook = hooks.find((h) => h.id === selectedHookId);
    if (!hook) return;
    setLoadingBeats(true);
    setBeatsError(null);
    try {
      const data = await postJson<{ beats: Omit<ReelBeat, "id">[] }>("/api/ai/reel-structure", {
        ...inputs,
        concepto: effectiveConcepto(),
        hookTexto: hook.texto,
        hookTipo: hook.tipo,
      });
      setBeats(data.beats.map((b) => ({ ...b, id: makeId("beat") })));
      setStep(2);
    } catch (err) {
      setBeatsError(err);
    } finally {
      setLoadingBeats(false);
    }
  }

  function handleSave() {
    const hook = hooks.find((h) => h.id === selectedHookId);
    const now = new Date().toISOString();
    const id = makeId("script");
    addScript({
      id,
      type: "reel",
      title: inputs.concepto || hook?.texto.slice(0, 60) || "Nuevo reel",
      service: inputs.servicio,
      concepts: conceptTags,
      status: "borrador",
      favorite: false,
      createdAt: now,
      updatedAt: now,
      reelInputs: inputs,
      hooks,
      selectedHookId: selectedHookId ?? undefined,
      beats,
    });
    router.push(`/editor/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Generador · Reel / Short"
        title="Nuevo Reel"
        description="30-90 segundos. Hook → Problema → Consecuencia → Insight → Sistema → Beneficio → CTA."
      />

      <div className="mt-8 mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      {step === 0 && (
        <Panel className="animate-fade-up">
          <div className="grid sm:grid-cols-2 gap-5">
            <FieldShell label="Servicio">
              <Select
                value={inputs.servicio}
                onChange={(e) => setInputs({ ...inputs, servicio: e.target.value as Servicio })}
              >
                {Object.entries(SERVICIO_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <FieldShell label="Duración">
              <Select value={inputs.duracion} onChange={(e) => setInputs({ ...inputs, duracion: e.target.value })}>
                {["30 segundos", "45 segundos", "60 segundos", "75 segundos", "90 segundos"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <FieldShell label="Público" hint="¿A quién le hablas?">
              <Input
                value={inputs.publico}
                onChange={(e) => setInputs({ ...inputs, publico: e.target.value })}
                placeholder="Ej: dueños de gimnasios con 2-3 sedes"
              />
            </FieldShell>

            <FieldShell label="Objetivo" hint="¿Qué debe pasar tras verlo?">
              <Input
                value={inputs.objetivo}
                onChange={(e) => setInputs({ ...inputs, objetivo: e.target.value })}
                placeholder="Ej: que entiendan que el problema es de flujo, no de personas"
              />
            </FieldShell>

            <div className="sm:col-span-2">
              <FieldShell label="Problema" hint="El dolor concreto que sufre ese público">
                <Textarea
                  value={inputs.problema}
                  onChange={(e) => setInputs({ ...inputs, problema: e.target.value })}
                  placeholder="Ej: cada sede lleva sus reservas en un Excel distinto y nadie sabe la ocupación real"
                  rows={2}
                />
              </FieldShell>
            </div>

            <div className="sm:col-span-2">
              <FieldShell label="Concepto principal" hint="La idea central del reel">
                <Textarea
                  value={inputs.concepto}
                  onChange={(e) => setInputs({ ...inputs, concepto: e.target.value })}
                  placeholder="Ej: la información fragmentada entre sedes es un problema de sistema, no de esfuerzo"
                  rows={2}
                />
              </FieldShell>
            </div>

            <div className="sm:col-span-2">
              <FieldShell label="Tono">
                <Input value={inputs.tono} onChange={(e) => setInputs({ ...inputs, tono: e.target.value })} />
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

          {hooksError ? <div className="mt-5"><AiErrorNote error={hooksError} /></div> : null}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleGenerateHooks}
              loading={loadingHooks}
              disabled={!inputs.publico || !inputs.problema || !inputs.concepto || !inputs.objetivo}
            >
              Generar 5 hooks
            </Button>
          </div>
        </Panel>
      )}

      {step === 1 && (
        <div className="animate-fade-up space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {hooks.map((hook) => (
              <button
                key={hook.id}
                onClick={() => setSelectedHookId(hook.id)}
                className={cn(
                  "hover-lift text-left paper-panel rounded-sm px-5 py-4 transition-colors",
                  selectedHookId === hook.id && "border-accent bg-accent-soft"
                )}
              >
                <p className="label-caps text-[10px] text-blueprint mb-2">{HOOK_TYPE_LABELS[hook.tipo]}</p>
                <p className="font-display text-[1.05rem] leading-snug">{hook.texto}</p>
              </button>
            ))}
          </div>

          {beatsError ? <AiErrorNote error={beatsError} /> : null}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              ← Volver
            </Button>
            <Button onClick={handleGenerateStructure} loading={loadingBeats} disabled={!selectedHookId}>
              Generar guion completo
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up space-y-4">
          <Panel eyebrow="Estructura" title="Vista previa del guion">
            <ol className="space-y-4">
              {REEL_BEAT_ORDER.map((key) => {
                const beat = beats.find((b) => b.key === key);
                if (!beat) return null;
                return (
                  <li key={key} className="grid sm:grid-cols-[8rem_1fr] gap-1.5 sm:gap-4">
                    <div>
                      <p className="label-caps text-[10px] text-accent">{REEL_BEAT_LABELS[key]}</p>
                      <p className="text-[11px] text-ink-faint mt-0.5">{beat.tiempoAprox}</p>
                    </div>
                    <div className="text-sm text-ink leading-relaxed pb-3 border-b border-rule last:border-0">
                      <p>{beat.textoHablado}</p>
                      <p className="text-[12px] text-ink-faint mt-1">
                        Visual: {beat.visualSugerido}
                        {beat.textoPantalla ? ` · En pantalla: “${beat.textoPantalla}”` : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
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
