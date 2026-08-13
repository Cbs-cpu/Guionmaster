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
import { CarouselDeck } from "@/components/carousel/CarouselDeck";
import { postJson } from "@/lib/apiClient";
import { useStudioStore } from "@/lib/store";
import { makeId } from "@/lib/utils";
import {
  CAROUSEL_SEQUENCE_LABELS,
  SERVICIO_LABELS,
  type CarouselSequence,
  type CarouselSlide,
  type CarruselInputs,
  type Servicio,
} from "@/lib/types";

const STEPS = ["Inputs", "Carrusel"];

const DEFAULT_INPUTS: CarruselInputs = {
  servicio: "odoo",
  publico: "",
  problema: "",
  concepto: "",
  objetivo: "",
  secuencia: "estandar",
  numSlides: 7,
  tono: "Directo, con autoridad, sin vender",
};

export default function NuevoCarruselPage() {
  const router = useRouter();
  const addScript = useStudioStore((s) => s.addScript);

  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<CarruselInputs>(DEFAULT_INPUTS);
  const [conceptTags, setConceptTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [titulo, setTitulo] = useState("");
  const [caption, setCaption] = useState("");
  const [slides, setSlides] = useState<CarouselSlide[]>([]);

  function toggleConceptTag(word: string) {
    setConceptTags((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]));
  }

  function effectiveConcepto() {
    return [inputs.concepto, ...conceptTags].filter(Boolean).join(", ");
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await postJson<{ titulo: string; caption: string; slides: Omit<CarouselSlide, "id">[] }>(
        "/api/ai/carousel",
        { ...inputs, concepto: effectiveConcepto() }
      );
      setTitulo(data.titulo);
      setCaption(data.caption);
      setSlides(data.slides.map((s) => ({ ...s, id: makeId("slide") })));
      setStep(1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    const now = new Date().toISOString();
    const id = makeId("script");
    addScript({
      id,
      type: "carrusel",
      title: titulo || inputs.concepto || "Nuevo carrusel",
      service: inputs.servicio,
      concepts: conceptTags,
      status: "borrador",
      favorite: false,
      createdAt: now,
      updatedAt: now,
      carruselInputs: inputs,
      slides,
      caption,
    });
    router.push(`/editor/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Generador · Carrusel de Instagram"
        title="Nuevo carrusel"
        description="4-10 slides en 4:5. Portada que frena el scroll → desarrollo con ritmo claro/oscuro → cierre con una sola llamada a la acción."
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

            <FieldShell label="Número de slides">
              <Select
                value={String(inputs.numSlides)}
                onChange={(e) => setInputs({ ...inputs, numSlides: Number(e.target.value) })}
              >
                {[5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} slides
                  </option>
                ))}
              </Select>
            </FieldShell>

            <div className="sm:col-span-2">
              <FieldShell label="Formato">
                <Select
                  value={inputs.secuencia}
                  onChange={(e) => setInputs({ ...inputs, secuencia: e.target.value as CarouselSequence })}
                >
                  {Object.entries(CAROUSEL_SEQUENCE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </FieldShell>
            </div>

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
                placeholder="Ej: que guarden el carrusel para auditar su propio proceso"
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
              <FieldShell label="Concepto principal" hint="La idea central del carrusel">
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

          {error ? (
            <div className="mt-5">
              <AiErrorNote error={error} />
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleGenerate}
              loading={loading}
              disabled={!inputs.publico || !inputs.problema || !inputs.concepto || !inputs.objetivo}
            >
              Generar carrusel
            </Button>
          </div>
        </Panel>
      )}

      {step === 1 && (
        <div className="animate-fade-up space-y-4">
          <div className="grid lg:grid-cols-[26rem_1fr] gap-6">
            <CarouselDeck slides={slides} caption={caption} />

            <div className="space-y-4">
              <FieldShell label="Título en la biblioteca">
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </FieldShell>
              <FieldShell label="Pie de publicación" hint="Amplía el carrusel, no lo repite">
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} className="text-[13px]" />
              </FieldShell>
              <p className="text-[12.5px] text-ink-faint leading-relaxed">
                Los textos, el fondo de cada slide y las notas visuales se afinan después en el editor, con la vista
                previa al lado.
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              ← Volver
            </Button>
            <Button onClick={handleSave}>Guardar y abrir en el editor</Button>
          </div>
        </div>
      )}
    </div>
  );
}
