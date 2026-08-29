import { KeyValueList, Panel, SeverityChip, StatusChip, TabList } from '@repoassure/design-system';

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

/* The design system's SeverityChip keys severity lowercase (`p0`); findings carry it
   uppercase because that is how the artifacts on disk record it. Mapping here keeps the
   on-disk spelling authoritative and confines the translation to one line. */
const severityLevel = { P0: 'p0', P1: 'p1', P2: 'p2' } as const;

export function ArtifactPreview({
  artifactOrder,
  items,
  labels,
  selectedArtifactId,
  onSelect
}: ArtifactPreviewProps) {
  const activeArtifact = items[selectedArtifactId] ?? items[artifactOrder[0]!]!;

  return (
    <div className="console-scope" data-testid="artifact-preview-tabs">
      <Panel
        eyebrow={labels.previewLabel}
        title={activeArtifact.previewHeading}
        action={<StatusChip status="hashed">{activeArtifact.status}</StatusChip>}
      >
        <div style={{ marginBottom: 16 }}>
          <TabList
            value={selectedArtifactId}
            onChange={(artifactId: string) => onSelect(artifactId as ArtifactId)}
            tabs={artifactOrder.map((artifactId) => ({
              id: artifactId,
              label: items[artifactId]!.name
            }))}
          />
        </div>

        <div className="console-grid">
          <div className="artifact-surface" aria-label={labels.previewLabel}>
            {activeArtifact.previewLines.map((line, index) => {
              if (line.kind === 'finding') {
                return (
                  <div className="artifact-finding" key={`${line.text}-${index}`}>
                    <SeverityChip level={severityLevel[line.severity ?? 'P2']} />
                    <p>{line.text}</p>
                  </div>
                );
              }

              if (line.kind === 'code' || line.kind === 'json') {
                return (
                  <pre className="artifact-code" key={`${line.text}-${index}`}>
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

          <KeyValueList
            items={[
              { label: labels.evidenceLabel, value: activeArtifact.evidence, mono: true },
              { label: labels.detailLabel, value: activeArtifact.detail },
              { label: activeArtifact.name, value: activeArtifact.summary }
            ]}
          />
        </div>
      </Panel>
    </div>
  );
}
