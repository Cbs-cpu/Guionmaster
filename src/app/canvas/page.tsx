"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { useStudioStore } from "@/lib/store";
import { makeId, formatDate } from "@/lib/utils";
import type { CanvasBoard } from "@/lib/types";
import { Trash2 } from "lucide-react";

export default function CanvasListPage() {
  const router = useRouter();
  const hydrated = useStudioStore((s) => s.hydrated);
  const canvases = useStudioStore((s) => s.canvases);
  const addCanvas = useStudioStore((s) => s.addCanvas);
  const deleteCanvas = useStudioStore((s) => s.deleteCanvas);

  function handleCreate() {
    const now = new Date().toISOString();
    const board: CanvasBoard = {
      id: makeId("canvas"),
      title: "Nuevo canvas",
      nodes: [],
      edges: [],
      createdAt: now,
      updatedAt: now,
    };
    addCanvas(board);
    router.push(`/canvas/${board.id}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Canvas"
        title="Explica el sistema"
        description="Un whiteboard sencillo para dibujar cajas, personas, sistemas, procesos, bases de datos, herramientas, inputs, outputs y cuellos de botella."
        action={<Button onClick={handleCreate}>Nuevo canvas</Button>}
      />

      {!hydrated ? null : canvases.length === 0 ? (
        <div className="mt-10 paper-panel rounded-sm px-6 py-10 text-center">
          <p className="font-display text-lg mb-1">Todavía no hay canvas</p>
          <p className="text-sm text-ink-soft">Crea el primero para mapear un sistema, por ejemplo LEAD → CRM → VENTA → ODOO → FACTURACIÓN → CLIENTE.</p>
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {canvases.map((c) => (
            <div key={c.id} className="hover-lift paper-panel rounded-sm px-5 py-4 flex flex-col gap-2 group">
              <Link href={`/canvas/${c.id}`}>
                <p className="font-display text-lg group-hover:text-accent transition-colors truncate">{c.title}</p>
                <p className="text-[12px] text-ink-faint mt-1">
                  {c.nodes.length} nodos · {c.edges.length} flechas
                </p>
              </Link>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-rule">
                <span className="text-[11px] text-ink-faint">{formatDate(c.updatedAt)}</span>
                <button
                  onClick={() => deleteCanvas(c.id)}
                  className="press text-ink-faint hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Eliminar canvas"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
