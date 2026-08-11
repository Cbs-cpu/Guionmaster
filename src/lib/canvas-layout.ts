import { makeId } from "./utils";
import type { CanvasEdge, CanvasNode, CanvasNodeType } from "./types";

const NODE_W = 152;
const NODE_H = 60;
const COL_GAP = 88;
const ROW_GAP = 28;
const MARGIN = 32;

export function layoutSuggestedNodes(
  suggested: { ref: string; type: CanvasNodeType; label: string }[],
  edges: { from: string; to: string; label?: string }[]
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const refs = suggested.map((n) => n.ref);
  const incoming = new Map<string, string[]>();
  refs.forEach((r) => incoming.set(r, []));
  edges.forEach((e) => {
    if (incoming.has(e.to) && refs.includes(e.from)) incoming.get(e.to)!.push(e.from);
  });

  const column = new Map<string, number>();
  function resolveColumn(ref: string, visiting = new Set<string>()): number {
    if (column.has(ref)) return column.get(ref)!;
    if (visiting.has(ref)) return 0;
    visiting.add(ref);
    const preds = incoming.get(ref) ?? [];
    const col = preds.length === 0 ? 0 : Math.max(...preds.map((p) => resolveColumn(p, visiting))) + 1;
    column.set(ref, col);
    return col;
  }
  refs.forEach((r) => resolveColumn(r));

  const rowsByColumn = new Map<number, number>();
  const refToId = new Map<string, string>();
  const nodes: CanvasNode[] = suggested.map((n) => {
    const col = column.get(n.ref) ?? 0;
    const row = rowsByColumn.get(col) ?? 0;
    rowsByColumn.set(col, row + 1);
    const id = makeId("node");
    refToId.set(n.ref, id);
    return {
      id,
      type: n.type,
      label: n.label,
      x: MARGIN + col * (NODE_W + COL_GAP),
      y: MARGIN + row * (NODE_H + ROW_GAP),
      w: NODE_W,
      h: NODE_H,
    };
  });

  const canvasEdges: CanvasEdge[] = edges
    .filter((e) => refToId.has(e.from) && refToId.has(e.to))
    .map((e) => ({ id: makeId("edge"), from: refToId.get(e.from)!, to: refToId.get(e.to)!, label: e.label }));

  return { nodes, edges: canvasEdges };
}

export function defaultNode(type: CanvasNodeType, label: string, index: number): CanvasNode {
  return {
    id: makeId("node"),
    type,
    label,
    x: MARGIN + (index % 5) * (NODE_W + COL_GAP),
    y: MARGIN + Math.floor(index / 5) * (NODE_H + ROW_GAP),
    w: NODE_W,
    h: NODE_H,
  };
}
