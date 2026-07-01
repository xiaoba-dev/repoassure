import { Check, Code2, FileDiff, FileText, FlaskConical, GitBranch, ShieldCheck, Wrench } from 'lucide-react';

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
};

export function AssuranceGraph({ copy }: AssuranceGraphProps) {
  return (
    <section className="assurance-graph" data-testid="assurance-graph" aria-label={copy.label}>
      <header className="graph-panel-heading">
        <GitBranch size={18} />
        <span>{copy.label}</span>
      </header>

      <div className="graph-canvas">
        <div className="graph-rail graph-rail-code" aria-hidden="true" />
        <div className="graph-rail graph-rail-docs" aria-hidden="true" />
        <div className="graph-rail graph-rail-tests" aria-hidden="true" />
        <div className="graph-rail graph-rail-adrs" aria-hidden="true" />
        <div className="graph-rail graph-rail-repair" aria-hidden="true" />
        <div className="graph-rail graph-rail-patch" aria-hidden="true" />
        <div className="graph-rail graph-rail-acceptance" aria-hidden="true" />

        <div className="graph-center">
          <ShieldCheck size={34} />
          <span>{copy.centerLabel}</span>
        </div>

        {copy.nodes.map((node) => {
          const NodeIcon = graphIcons[node.id];
          return (
            <article className={`graph-node graph-node-${node.id}`} key={node.id}>
              <div>
                <NodeIcon size={18} />
                <strong>{node.label}</strong>
              </div>
              <span data-variant={node.variant}>
                <Check size={14} />
                {node.status}
              </span>
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
    </section>
  );
}
