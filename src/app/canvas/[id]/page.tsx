"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { AiErrorNote } from "@/components/ui/AiErrorNote";
import { CanvasBoardView } from "@/components/canvas/CanvasBoard";
import { useStudioStore } from "@/lib/store";
import { postJson } from "@/lib/apiClient";
import { layoutSuggestedNodes } from "@/lib/canvas-layout";
import type { CanvasNodeType } from "@/lib/types";

export default function CanvasDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const hydrated = useStudioStore((s) => s.hydrated);
  const board = useStudioStore((s) => s.canvases.find((c) => c.id === id));
  const updateCanvas = useStudioStore((s) => s.updateCanvas);

  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSuggest() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await postJson<{
        nodes: { ref: string; type: CanvasNodeType; label: string }[];
        edges: { from: string; to: string; label?: string }[];
      }>("/api/ai/canvas-suggest", { topic });
      const { nodes, edges } = layoutSuggestedNodes(data.nodes, data.edges);
      if (!board) return;
      updateCanvas(board.id, { nodes: [...board.nodes, ...nodes], edges: [...board.edges, ...edges] });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) return null;

  if (!board) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="font-display text-2xl mb-2">Canvas no encontrado</p>
        <Link href="/canvas" className="text-accent text-sm hover:underline">
          ← Volver a canvas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Canvas"
        title={board.title}
        action={
          <Link href="/canvas" className="text-sm text-ink-soft hover:text-accent">
            ← Todos los canvas
          </Link>
        }
      />

      <div className="mt-6 max-w-sm">
        <Input
          value={board.title}
          onChange={(e) => updateCanvas(board.id, { title: e.target.value })}
          className="font-display text-lg py-2"
        />
      </div>

      <div className="mt-5 paper-panel rounded-sm p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <span className="label-caps block text-[10px] text-ink-faint mb-1.5">La IA sugiere el diagrama</span>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: cómo se pierde información entre el lead y la factura en un gimnasio con 3 sedes"
          />
        </div>
        <Button onClick={handleSuggest} loading={loading} disabled={!topic.trim()}>
          Sugerir diagrama
        </Button>
      </div>
      {error ? <div className="mt-3"><AiErrorNote error={error} /></div> : null}

      <div className="mt-6">
        <CanvasBoardView key={board.id} board={board} onChange={(patch) => updateCanvas(board.id, patch)} />
      </div>
    </div>
  );
}
