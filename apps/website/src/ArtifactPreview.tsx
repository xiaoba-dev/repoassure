import type { ArtifactId } from './i18n.ts';

type ArtifactPreviewItem = {
  name: string;
  status: string;
  summary: string;
  evidence: string;
  detail: string;
  previewHeading: string;
  previewLines: Array<{
    kind: 'meta' | 'finding' | 'code' | 'json';
    label?: string;
    severity?: 'P0' | 'P1' | 'P2';
    text: string;
  }>;
};

type ArtifactPreviewProps = {
  artifactOrder: ArtifactId[];
  items: Record<ArtifactId, ArtifactPreviewItem>;
  labels: {
    tabLabel: string;
    evidenceLabel: string;
    detailLabel: string;
    previewLabel: string;
  };
  selectedArtifactId: ArtifactId;
  onSelect: (artifactId: ArtifactId) => void;
};

export function ArtifactPreview({
  artifactOrder,
  items,
  labels,
  selectedArtifactId,
  onSelect
}: ArtifactPreviewProps) {
  const activeArtifact = items[selectedArtifactId] ?? items[artifactOrder[0]!]!;

  return (
    <div className="artifact-preview" data-testid="artifact-preview-tabs">
      <div className="tab-list" role="tablist" aria-label={labels.tabLabel}>
        {artifactOrder.map((artifactId) => {
          const artifact = items[artifactId]!;
          return (
            <button
              key={artifactId}
              type="button"
              role="tab"
              aria-selected={artifactId === selectedArtifactId}
              onClick={() => onSelect(artifactId)}
            >
              {artifact.name}
            </button>
          );
        })}
      </div>

      <article className="artifact-detail">
        <header className="artifact-detail-header">
          <div>
            <p className="artifact-status">{activeArtifact.status}</p>
            <h3>{activeArtifact.name}</h3>
            <p>{activeArtifact.summary}</p>
          </div>
          <dl className="artifact-detail-meta">
            <div>
              <dt>{labels.evidenceLabel}</dt>
              <dd>
                <code>{activeArtifact.evidence}</code>
              </dd>
            </div>
            <div>
              <dt>{labels.detailLabel}</dt>
              <dd>{activeArtifact.detail}</dd>
            </div>
          </dl>
        </header>

        <div className="artifact-preview-panel" aria-label={labels.previewLabel}>
          <p className="artifact-preview-panel-label">{labels.previewLabel}</p>
          <h4>{activeArtifact.previewHeading}</h4>
          <div className="artifact-preview-surface">
            {activeArtifact.previewLines.map((line, index) => {
              if (line.kind === 'finding') {
                return (
                  <div className="artifact-finding" key={`${line.text}-${index}`}>
                    <span className={`severity-chip severity-${line.severity?.toLowerCase() ?? 'p2'}`}>
                      {line.severity}
                    </span>
                    <p>{line.text}</p>
                  </div>
                );
              }

              if (line.kind === 'code' || line.kind === 'json') {
                return (
                  <pre className={`artifact-code artifact-code-${line.kind}`} key={`${line.text}-${index}`}>
                    <code>{line.text}</code>
                  </pre>
                );
              }

              return (
                <p className="artifact-meta-line" key={`${line.text}-${index}`}>
                  {line.label ? <strong>{line.label}</strong> : null}
                  {line.text}
                </p>
              );
            })}
          </div>
        </div>
      </article>
    </div>
  );
}
