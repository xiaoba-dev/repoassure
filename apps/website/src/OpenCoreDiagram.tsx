export type OpenCoreDiagramCopy = {
  label: string;
  nodes: Array<{
    id: string;
    title: string;
    caption: string;
  }>;
};

type OpenCoreDiagramProps = {
  copy: OpenCoreDiagramCopy;
};

const nodeLayout = [
  { x: 36, y: 58 },
  { x: 164, y: 58 },
  { x: 292, y: 58 },
  { x: 420, y: 58 }
] as const;

export function OpenCoreDiagram({ copy }: OpenCoreDiagramProps) {
  return (
    <figure className="open-core-diagram" data-testid="open-core-diagram" aria-label={copy.label}>
      <svg className="open-core-diagram-svg" viewBox="0 0 520 148" role="img" aria-hidden="true">
        <defs>
          <marker id="open-core-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="6" refY="4">
            <path d="M0,0 L8,4 L0,8 Z" fill="#526071" />
          </marker>
        </defs>
        {copy.nodes.slice(0, -1).map((node, index) => {
          const start = nodeLayout[index]!;
          const end = nodeLayout[index + 1]!;
          return (
            <line
              key={`${node.id}-edge`}
              x1={start.x + 72}
              x2={end.x - 8}
              y1={start.y + 24}
              y2={end.y + 24}
              stroke="#94a3b8"
              strokeWidth="1.5"
              markerEnd="url(#open-core-arrow)"
            />
          );
        })}
        {copy.nodes.map((node, index) => {
          const position = nodeLayout[index]!;
          return (
            <g key={node.id} transform={`translate(${position.x} ${position.y})`}>
              <rect fill="#f8fafc" height="48" rx="10" stroke="#cbd5e1" strokeWidth="1.5" width="112" />
              <text fill="#111827" fontSize="12" fontWeight="700" x="56" y="22" textAnchor="middle">
                {node.title}
              </text>
              <text fill="#526071" fontSize="10" x="56" y="38" textAnchor="middle">
                {node.caption}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="open-core-diagram-caption">{copy.label}</figcaption>
      <ol className="open-core-diagram-list">
        {copy.nodes.map((node) => (
          <li key={node.id}>
            <strong>{node.title}</strong>
            <span>{node.caption}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
