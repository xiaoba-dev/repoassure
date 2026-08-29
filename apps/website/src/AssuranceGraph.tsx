import { Check, Code2, FileDiff, FileText, FlaskConical, GitBranch, ShieldCheck, Wrench } from 'lucide-react';

import {
  GRAPH_CENTER,
  GRAPH_EDGES,
  GRAPH_NODE_COORDS,
  GRAPH_VIEWBOX,
  buildGraphEdgePath,
  graphPointToPercent
} from './assurance-graph-layout.ts';
import type { AssuranceGraphCopy } from './i18n.ts';

const graphIcons = {
  adrs: GitBranch,
  acceptance: ShieldCheck,
  code: Code2,
  docs: FileText,
  patch: FileDiff,
  repair: Wrench,
  tests: FlaskConical
} as const;

type AssuranceGraphProps = {
  copy: AssuranceGraphCopy;
  /* The graph carries its own heading when it stands alone. Inside a Panel, the panel
     supplies eyebrow and title, so repeating them here would print the label twice. */
  showHeading?: boolean;
};

export function AssuranceGraph({ copy, showHeading = true }: AssuranceGraphProps) {
  const centerPosition = graphPointToPercent(GRAPH_CENTER);

  return (
    <div className="assurance-graph" data-testid="assurance-graph" aria-label={copy.label}>
      {showHeading ? (
        <header className="graph-panel-heading">
          <GitBranch size={18} />
          <span>{copy.label}</span>
        </header>
      ) : null}

      <ol className="graph-chain-fallback" data-testid="assurance-graph-fallback" aria-label={copy.label}>
        <li className="graph-chain-fallback-center">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>{copy.centerLabel}</span>
        </li>
        {copy.nodes.map((node) => {
          const NodeIcon = graphIcons[node.id];
          return (
            <li
              className="graph-chain-fallback-item"
              data-variant={node.variant}
              data-reachability={node.reachability}
              key={node.id}
            >
              <div>
                <NodeIcon size={16} aria-hidden="true" />
                <strong>{node.label}</strong>
              </div>
              <span>
                <Check size={14} aria-hidden="true" />
                {node.status}
                {/* Patch plan and acceptance are pnpm scripts inside this repository, not
                    commands the distributed CLI exposes. Saying so keeps the graph from
                    implying a chain the product does not ship. */}
                <em className="graph-node-reachability">
                  {node.reachability === 'cli'
                    ? copy.reachabilityLabels.cli
                    : copy.reachabilityLabels.internal}
                </em>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="graph-canvas">
        <svg
          className="graph-svg"
          viewBox={`0 0 ${GRAPH_VIEWBOX.width} ${GRAPH_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="graph-edge-verified" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(34, 216, 118, 0.2)" />
              <stop offset="100%" stopColor="rgba(34, 216, 118, 0.95)" />
            </linearGradient>
            <filter id="graph-edge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur result="blur" stdDeviation="1.4" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {GRAPH_EDGES.map((edge) => {
            const target = GRAPH_NODE_COORDS[edge.to];
            const path = buildGraphEdgePath(GRAPH_CENTER, target);

            return (
              <path
                key={edge.to}
                className={`graph-edge graph-edge-${edge.kind}`}
                d={path}
                fill="none"
                stroke={edge.kind === 'verified' ? 'url(#graph-edge-verified)' : 'rgba(159, 176, 197, 0.72)'}
                strokeDasharray={edge.kind === 'produces' ? '7 6' : undefined}
                strokeLinecap="round"
                strokeWidth={edge.kind === 'verified' ? 2.2 : 2}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          <circle
            className="graph-center-glow"
            cx={GRAPH_CENTER.x}
            cy={GRAPH_CENTER.y}
            fill="rgba(0, 157, 92, 0.12)"
            r="58"
          />
        </svg>

        <div
          className="graph-center"
          style={{
            left: centerPosition.left,
            top: centerPosition.top
          }}
        >
          <ShieldCheck size={34} />
          <span>{copy.centerLabel}</span>
        </div>

        {copy.nodes.map((node) => {
          const NodeIcon = graphIcons[node.id];
          const position = graphPointToPercent(GRAPH_NODE_COORDS[node.id]);

          return (
            <article
              className="graph-node"
              key={node.id}
              style={{
                left: position.left,
                top: position.top
              }}
            >
              <div>
                <NodeIcon size={18} />
                <strong>{node.label}</strong>
              </div>
              {/* Reachability rides on the desktop node too, not only the mobile
                  fallback: without it the graph implies patch plan and acceptance ship
                  in the CLI, which is the exact claim ADR-0021 removed. */}
              <span data-variant={node.variant}>
                <Check size={14} />
                {node.status}
              </span>
              <em className="graph-node-reachability">
                {node.reachability === 'cli'
                  ? copy.reachabilityLabels.cli
                  : copy.reachabilityLabels.internal}
              </em>
            </article>
          );
        })}
      </div>

      <footer className="graph-legend">
        <span>
          <i aria-hidden="true" />
          {copy.verifiedLabel}
        </span>
        <span>
          <i aria-hidden="true" className="dashed" />
          {copy.producesLabel}
        </span>
      </footer>
    </div>
  );
}
