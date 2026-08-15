import type { AssuranceGraphCopy } from './i18n.ts';

export const GRAPH_VIEWBOX = {
  width: 640,
  height: 480
} as const;

export const GRAPH_CENTER = {
  x: 320,
  y: 228
} as const;

type GraphNodeId = AssuranceGraphCopy['nodes'][number]['id'];

export const GRAPH_NODE_COORDS: Record<GraphNodeId, { x: number; y: number }> = {
  docs: { x: 320, y: 54 },
  code: { x: 78, y: 168 },
  tests: { x: 562, y: 168 },
  adrs: { x: 78, y: 312 },
  patch: { x: 562, y: 312 },
  /* These two sit on the same vertical, so they are the pair that collides first. Each
     node carries three lines since reachability moved onto the desktop card, which needs
     ~90px of height; 100px apart clears it. */
  repair: { x: 320, y: 334 },
  acceptance: { x: 320, y: 434 }
};

export type GraphEdgeKind = 'verified' | 'produces';

export const GRAPH_EDGES: Array<{ to: GraphNodeId; kind: GraphEdgeKind }> = [
  { to: 'docs', kind: 'verified' },
  { to: 'code', kind: 'verified' },
  { to: 'tests', kind: 'verified' },
  { to: 'adrs', kind: 'verified' },
  { to: 'repair', kind: 'verified' },
  { to: 'patch', kind: 'produces' },
  { to: 'acceptance', kind: 'produces' }
];

export function graphPointToPercent(point: { x: number; y: number }) {
  return {
    left: `${(point.x / GRAPH_VIEWBOX.width) * 100}%`,
    top: `${(point.y / GRAPH_VIEWBOX.height) * 100}%`
  };
}

export function buildGraphEdgePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const controlX = midX - deltaY * 0.14;
  const controlY = midY + deltaX * 0.14;

  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}
