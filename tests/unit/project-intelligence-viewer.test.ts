import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  formatProjectIntelligenceViewerHtml,
  parseProjectIntelligenceViewerArgs,
  runProjectIntelligenceViewer
} from '../../packages/acceptance/src/run-project-intelligence-viewer.js';
import type { ProjectIntelligenceSnapshot } from '../../packages/acceptance/src/run-project-intelligence-snapshot.js';

describe('project intelligence local static viewer', () => {
  it('renders a local-only static HTML viewer from a graph snapshot', async () => {
    const root = join(tmpdir(), `repoassure-project-viewer-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const snapshotPath = join(outputDir, 'project-intelligence-snapshot.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(snapshotPath, `${JSON.stringify(buildSnapshotFixture(), null, 2)}\n`);

    const result = await runProjectIntelligenceViewer({
      snapshotPath,
      outputDir
    });
    const html = await readFile(result.viewerPath, 'utf8');

    expect(result.viewerPath).toBe(join(outputDir, 'project-intelligence-viewer.html'));
    expect(result.nodeCount).toBe(6);
    expect(result.edgeCount).toBe(3);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Project Intelligence Console');
    expect(html).toContain('data-local-only="true"');
    expect(html).toContain('Docs Graph');
    expect(html).toContain('Code Graph');
    expect(html).toContain('Progress Graph');
    expect(html).toContain('Freshness and Staleness Findings');
    expect(html).toContain('missing_cascade');
    expect(html).toContain('progress_state_mismatch');
    expect(html).toContain('ADR-0017');
    expect(html).toContain('packages/acceptance');
    expect(html).toContain('Project Intelligence Console Local Static Viewer v0.1');
    expect(html).toContain('No hosted dashboard');
    expect(html).not.toContain('http://');
    expect(html).not.toContain('https://');
    expect(html).not.toContain('sk-local-secret');
    expect(html).not.toContain('Authorization: Bearer');
    expect(formatProjectIntelligenceViewerHtml(buildSnapshotFixture())).toContain('local-only');
  });

  it('rejects missing or malformed snapshots before writing a viewer', async () => {
    const root = join(tmpdir(), `repoassure-project-viewer-invalid-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const malformedSnapshotPath = join(outputDir, 'project-intelligence-snapshot.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(malformedSnapshotPath, '{"schemaVersion":1,"boundary":{"localOnly":false}}');

    await expect(runProjectIntelligenceViewer({
      snapshotPath: join(outputDir, 'missing.json'),
      outputDir
    })).rejects.toThrow('missing project intelligence snapshot');

    await expect(runProjectIntelligenceViewer({
      snapshotPath: malformedSnapshotPath,
      outputDir
    })).rejects.toThrow('invalid project intelligence snapshot');
  });

  it('parses CLI arguments without hosted or telemetry options', () => {
    expect(parseProjectIntelligenceViewerArgs([
      '--snapshot',
      '/repo/artifacts/project-graph/project-intelligence-snapshot.json',
      '--output',
      '/repo/artifacts/project-graph'
    ])).toEqual({
      snapshotPath: '/repo/artifacts/project-graph/project-intelligence-snapshot.json',
      outputDir: '/repo/artifacts/project-graph'
    });

    expect(() => parseProjectIntelligenceViewerArgs(['--telemetry'])).toThrow(
      'Unknown project intelligence viewer option'
    );
  });
});

describe('console reports state, not only exceptions', () => {
  it('renders a verdict and a next action even when there are no findings', () => {
    // The console's only actionable section used to be the findings list, so it was
    // least informative exactly when the project was healthiest — its normal state.
    const html = formatProjectIntelligenceViewerHtml({
      ...buildSnapshotFixture(),
      findings: [],
      summary: { ...buildSnapshotFixture().summary, findings: { total: 0, high: 0, medium: 0, low: 0 } }
    });

    expect(html).toContain('class="verdict"');
    expect(html).toContain('data-state="clear"');
    expect(html).toContain('No freshness or staleness findings');
    expect(html).toContain('verdict-next');
  });

  it('breaks findings down by severity instead of showing only a total', () => {
    const html = formatProjectIntelligenceViewerHtml({
      ...buildSnapshotFixture(),
      summary: { ...buildSnapshotFixture().summary, findings: { total: 6, high: 1, medium: 2, low: 3 } }
    });

    expect(html).toContain('1 high');
    expect(html).toContain('2 medium');
    expect(html).toContain('3 low');
    expect(html).toContain('data-state="attention"');
  });

  it('states how much of a capped list is actually shown', () => {
    const nodes = Array.from({ length: 120 }, (_, index) => ({
      id: `node-${index}`,
      label: `Node ${index}`,
      type: 'source' as const
    }));
    const html = formatProjectIntelligenceViewerHtml({
      ...buildSnapshotFixture(),
      codeGraph: { nodes, edges: [] }
    });

    // A heading reading "2502 nodes" above eighty rows reads as full coverage.
    expect(html).toContain('showing 80 of 120');
  });

  it('emits no external reference and stays a local-only artifact', () => {
    const html = formatProjectIntelligenceViewerHtml(buildSnapshotFixture());

    expect(html).not.toMatch(/https?:\/\//);
    expect(html).toContain('data-local-only="true"');
    expect(html).toContain('No hosted dashboard');
  });
});


function buildSnapshotFixture(): ProjectIntelligenceSnapshot {
  return {
    schemaVersion: 1,
    generatedAt: '2026-07-17T01:30:00.000+08:00',
    boundary: {
      localOnly: true,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      outputDir: '/repo/artifacts/project-graph',
      ignoredPrefixes: ['artifacts/']
    },
    summary: {
      graphs: ['docsGraph', 'codeGraph', 'progressGraph'],
      docsNodes: 2,
      codeNodes: 2,
      progressNodes: 2,
      totalEdges: 3,
      outputBytes: 1000
      ,
      findings: {
        total: 2,
        high: 1,
        medium: 1,
        low: 0
      }
    },
    findings: [
      {
        id: 'missing-cascade:docs/adr/0022-unlinked-decision.md',
        category: 'missing_cascade',
        severity: 'medium',
        title: 'ADR lacks cascade evidence',
        detail: 'ADR is not linked from expected downstream docs.',
        path: 'docs/adr/0022-unlinked-decision.md'
      },
      {
        id: 'progress-state-mismatch:missing-active-goal',
        category: 'progress_state_mismatch',
        severity: 'high',
        title: 'Active goal is missing from goal records',
        detail: 'The progress snapshot active_goal id does not exist in .autopilot/goals.',
        path: '.autopilot/progress/snapshot.json'
      }
    ],
    docsGraph: {
      nodes: [
        {
          id: 'docs/adr/0017-public-website-and-project-intelligence-console.md',
          label: 'ADR-0017',
          type: 'adr',
          path: 'docs/adr/0017-public-website-and-project-intelligence-console.md',
          owner: 'docs'
        },
        {
          id: 'docs/product/specs/project-intelligence-console-spec-v0.1.md',
          label: 'Project Intelligence Console Spec v0.1',
          type: 'doc',
          path: 'docs/product/specs/project-intelligence-console-spec-v0.1.md',
          owner: 'docs'
        }
      ],
      edges: [
        {
          from: 'docs/adr/0017-public-website-and-project-intelligence-console.md',
          to: 'docs/product/specs/project-intelligence-console-spec-v0.1.md',
          type: 'mentions'
        }
      ]
    },
    codeGraph: {
      nodes: [
        { id: 'packages/acceptance', label: 'acceptance', type: 'package', path: 'packages/acceptance', owner: 'package' },
        { id: 'tests/unit/project-intelligence-viewer.test.ts', label: 'project-intelligence-viewer.test.ts', type: 'test', path: 'tests/unit/project-intelligence-viewer.test.ts', owner: 'tests' }
      ],
      edges: [
        {
          from: 'tests/unit/project-intelligence-viewer.test.ts',
          to: 'packages/acceptance',
          type: 'tests'
        }
      ]
    },
    progressGraph: {
      nodes: [
        { id: 'progress:current-stage', label: 'Project Intelligence Console static viewer selected', type: 'progress', status: 'current' },
        { id: 'goal:project-intelligence-console-local-static-viewer-v0.1', label: 'Project Intelligence Console Local Static Viewer v0.1', type: 'goal', status: 'active' }
      ],
      edges: [
        {
          from: 'progress:current-stage',
          to: 'goal:project-intelligence-console-local-static-viewer-v0.1',
          type: 'active_goal'
        }
      ]
    },
    sourceCoverage: {
      rootsScanned: ['docs', 'packages', 'tests', '.autopilot'],
      filesScanned: 8,
      generatedArtifactsIgnored: true
    },
    redaction: {
      applied: true,
      prohibitedContent: ['secret values', 'authorization tokens']
    }
  };
}
