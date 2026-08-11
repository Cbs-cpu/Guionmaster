"use client";

import { useRef, useState } from "react";
import { CANVAS_NODE_LABELS, type CanvasBoard, type CanvasEdge, type CanvasNode, type CanvasNodeType } from "@/lib/types";
import { defaultNode } from "@/lib/canvas-layout";
import { makeId, cn } from "@/lib/utils";
import { Input, Select } from "@/components/ui/Field";
import { Trash2, Link2 } from "lucide-react";

type Selection = { kind: "node" | "edge"; id: string } | null;

const NODE_TONE: Record<CanvasNodeType, string> = {
  caja: "border-ink-faint",
  persona: "border-blueprint",
  sistema: "border-blueprint",
  proceso: "border-ink-faint",
  base_datos: "border-blueprint",
  herramienta: "border-ink-faint",
  input: "border-state-listo",
  output: "border-state-publicado",
  cuello_botella: "border-accent",
};

export function CanvasBoardView({
  board,
  onChange,
}: {
  board: CanvasBoard;
  onChange: (patch: Partial<CanvasBoard>) => void;
}) {
  const [nodes, setNodes] = useState<CanvasNode[]>(board.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(board.edges);
  const [selection, setSelection] = useState<Selection>(null);
  const [linking, setLinking] = useState(false);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const nodesRef = useRef<CanvasNode[]>(nodes);

  function commit(nextNodes: CanvasNode[], nextEdges: CanvasEdge[]) {
    onChange({ nodes: nextNodes, edges: nextEdges });
  }

  function applyNodes(next: CanvasNode[]) {
    nodesRef.current = next;
    setNodes(next);
  }

  function addNode(type: CanvasNodeType) {
    const node = defaultNode(type, CANVAS_NODE_LABELS[type], nodes.length);
    const next = [...nodes, node];
    applyNodes(next);
    setSelection({ kind: "node", id: node.id });
    commit(next, edges);
  }

  function updateNode(id: string, patch: Partial<CanvasNode>) {
    const next = nodes.map((n) => (n.id === id ? { ...n, ...patch } : n));
    applyNodes(next);
    commit(next, edges);
  }

  function deleteSelected() {
    if (!selection) return;
    if (selection.kind === "node") {
      const next = nodes.filter((n) => n.id !== selection.id);
      const nextEdges = edges.filter((e) => e.from !== selection.id && e.to !== selection.id);
      applyNodes(next);
      setEdges(nextEdges);
      commit(next, nextEdges);
    } else {
      const nextEdges = edges.filter((e) => e.id !== selection.id);
      setEdges(nextEdges);
      commit(nodes, nextEdges);
    }
    setSelection(null);
  }

  function handleNodePointerDown(e: React.PointerEvent, node: CanvasNode) {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      id: node.id,
      dx: e.clientX - rect.left - node.x,
      dy: e.clientY - rect.top - node.y,
      moved: false,
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function handlePointerMove(e: PointerEvent) {
    const drag = dragRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    drag.moved = true;
    const x = Math.max(0, e.clientX - rect.left - drag.dx);
    const y = Math.max(0, e.clientY - rect.top - drag.dy);
    const next = nodesRef.current.map((n) => (n.id === drag.id ? { ...n, x, y } : n));
    nodesRef.current = next;
    setNodes(next);
  }

  function handlePointerUp() {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (!drag.moved) {
      handleNodeClick(drag.id);
    } else {
      commit(nodesRef.current, edges);
    }
  }

  function handleNodeClick(id: string) {
    if (linking) {
      if (!linkFrom) {
        setLinkFrom(id);
      } else if (linkFrom !== id) {
        const edge: CanvasEdge = { id: makeId("edge"), from: linkFrom, to: id };
        const next = [...edges, edge];
        setEdges(next);
        commit(nodes, next);
        setLinkFrom(null);
      }
      return;
    }
    setSelection({ kind: "node", id });
  }

  const selectedNode = selection?.kind === "node" ? nodes.find((n) => n.id === selection.id) : undefined;
  const selectedEdge = selection?.kind === "edge" ? edges.find((e) => e.id === selection.id) : undefined;

  return (
    <div className="grid lg:grid-cols-[1fr_16rem] gap-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.entries(CANVAS_NODE_LABELS) as [CanvasNodeType, string][]).map(([type, label]) => (
            <button
              key={type}
              onClick={() => addNode(type)}
              className="press label-caps text-[10px] px-2.5 py-1.5 rounded-full border border-rule-strong text-ink-soft hover:border-ink hover:text-ink transition-colors"
            >
              + {label}
            </button>
          ))}
          <button
            onClick={() => {
              setLinking((v) => !v);
              setLinkFrom(null);
              setSelection(null);
            }}
            className={cn(
              "press label-caps text-[10px] px-2.5 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ml-auto",
              linking ? "bg-blueprint text-blueprint-ink border-blueprint" : "border-rule-strong text-ink-soft hover:border-ink hover:text-ink"
            )}
          >
            <Link2 className="h-3 w-3" />
            {linking ? (linkFrom ? "Elige destino…" : "Elige origen…") : "Conectar"}
          </button>
        </div>

        <div
          ref={containerRef}
          onClick={() => setSelection(null)}
          className="relative border border-rule bg-paper-raised rounded-sm overflow-auto"
          style={{
            height: "min(70vh, 640px)",
            backgroundImage:
              "linear-gradient(var(--color-rule) 1px, transparent 1px), linear-gradient(90deg, var(--color-rule) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{ minWidth: 1200, minHeight: 700 }}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-ink-soft)" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = nodes.find((n) => n.id === edge.from);
              const to = nodes.find((n) => n.id === edge.to);
              if (!from || !to) return null;
              const x1 = from.x + from.w / 2;
              const y1 = from.y + from.h / 2;
              const x2 = to.x + to.w / 2;
              const y2 = to.y + to.h / 2;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              const selected = selection?.kind === "edge" && selection.id === edge.id;
              return (
                <g key={edge.id}>
                  <path
                    d={`M${x1},${y1} L${x2},${y2}`}
                    stroke="transparent"
                    strokeWidth={14}
                    fill="none"
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelection({ kind: "edge", id: edge.id });
                    }}
                  />
                  <path
                    d={`M${x1},${y1} L${x2},${y2}`}
                    stroke={selected ? "var(--color-accent)" : "var(--color-ink-soft)"}
                    strokeWidth={selected ? 2 : 1.4}
                    markerEnd="url(#arrow)"
                    fill="none"
                  />
                  {edge.label && (
                    <text x={midX} y={midY - 6} textAnchor="middle" fontSize="10" fill="var(--color-ink-soft)" className="label-caps">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {nodes.map((node) => {
            const selected = selection?.kind === "node" && selection.id === node.id;
            const isLinkFrom = linkFrom === node.id;
            return (
              <div
                key={node.id}
                onPointerDown={(e) => handleNodePointerDown(e, node)}
                className={cn(
                  "absolute select-none rounded-sm border-2 bg-paper px-3 py-2 flex flex-col justify-center shadow-sm cursor-grab active:cursor-grabbing transition-shadow",
                  NODE_TONE[node.type],
                  selected && "ring-2 ring-accent ring-offset-1 ring-offset-paper-raised",
                  isLinkFrom && "ring-2 ring-blueprint ring-offset-1 ring-offset-paper-raised"
                )}
                style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
              >
                <span className="label-caps text-[9px] text-ink-faint truncate">{CANVAS_NODE_LABELS[node.type]}</span>
                <span className="text-[12.5px] font-medium leading-tight truncate">{node.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="paper-panel rounded-sm p-4 h-fit">
        <p className="label-caps text-[10px] text-ink-faint mb-3">Inspector</p>
        {selectedNode && (
          <div className="space-y-3">
            <div>
              <span className="label-caps block text-[10px] text-ink-faint mb-1">Etiqueta</span>
              <Input value={selectedNode.label} onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })} />
            </div>
            <div>
              <span className="label-caps block text-[10px] text-ink-faint mb-1">Tipo</span>
              <Select
                value={selectedNode.type}
                onChange={(e) => updateNode(selectedNode.id, { type: e.target.value as CanvasNodeType })}
              >
                {(Object.entries(CANVAS_NODE_LABELS) as [CanvasNodeType, string][]).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <button onClick={deleteSelected} className="press flex items-center gap-1.5 text-xs text-accent hover:underline">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar nodo
            </button>
          </div>
        )}
        {selectedEdge && (
          <div className="space-y-3">
            <div>
              <span className="label-caps block text-[10px] text-ink-faint mb-1">Etiqueta de la flecha</span>
              <Input
                value={selectedEdge.label ?? ""}
                onChange={(e) => {
                  const next = edges.map((ed) => (ed.id === selectedEdge.id ? { ...ed, label: e.target.value } : ed));
                  setEdges(next);
                  commit(nodes, next);
                }}
                placeholder="Ej: 2 días de espera"
              />
            </div>
            <button onClick={deleteSelected} className="press flex items-center gap-1.5 text-xs text-accent hover:underline">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar flecha
            </button>
          </div>
        )}
        {!selectedNode && !selectedEdge && (
          <p className="text-[13px] text-ink-faint leading-relaxed">
            Añade una caja desde la paleta, arrástrala para colocarla y usa “Conectar” para dibujar flechas entre dos nodos.
          </p>
        )}
      </div>
    </div>
  );
}
