import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  formatProjectIntelligenceBacklogMarkdown,
  parseProjectIntelligenceBacklogArgs,
  runProjectIntelligenceBacklog
} from '../../packages/acceptance/src/run-project-intelligence-backlog.js';
import type { ProjectIntelligenceSnapshot } from '../../packages/acceptance/src/run-project-intelligence-snapshot.js';

describe('project intelligence ADR cascade remediation backlog', () => {
  it('generates a maintainer-reviewable backlog from missing cascade findings without editing docs', async () => {
    const root = join(tmpdir(), `repoassure-project-backlog-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const snapshotPath = join(outputDir, 'project-intelligence-snapshot.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(snapshotPath, `${JSON.stringify(buildSnapshotFixture(), null, 2)}\n`);

    const result = await runProjectIntelligenceBacklog({
      snapshotPath,
      outputDir,
      generatedAt: '2026-07-17T08:40:00.000+08:00'
    });
    const markdown = await readFile(result.backlogPath, 'utf8');

    expect(result.backlogPath).toBe(join(outputDir, 'adr-cascade-remediation-backlog.md'));
    expect(result.itemCount).toBe(2);
    expect(result.missingCascadeCount).toBe(2);
    expect(markdown).toContain('# Project Intelligence ADR Cascade Remediation Backlog');
    expect(markdown).toContain('Status: maintainer_review_required');
    expect(markdown).toContain('Generated from: project-intelligence-snapshot.json');
    expect(markdown).toContain('## Decision Boundary');
    expect(markdown).toContain('This backlog does not authorize automatic ADR/spec/docs edits.');
    expect(markdown).toContain('approve / defer / accept-risk / repair');
    expect(markdown).toContain('RA-ADR-CASCADE-001');
    expect(markdown).toContain('docs/adr/0001-local-first-mcp-cli.md');
    expect(markdown).toContain('RA-ADR-CASCADE-002');
    expect(markdown).toContain('docs/adr/0002-shared-cli-mcp-core.md');
    expect(markdown).toContain('- [ ] Decision: approve / defer / accept-risk / repair');
    expect(markdown).toContain('- Suggested action: Add graph-visible downstream cascade evidence or explicitly accept risk.');
    expect(markdown).not.toContain('sk-local-secret');
    expect(markdown).not.toContain('Authorization: Bearer');
    expect(formatProjectIntelligenceBacklogMarkdown(buildSnapshotFixture(), {
      generatedAt: '2026-07-17T08:40:00.000+08:00',
      snapshotPath
    })).toContain('maintainer_review_required');
  });

  it('rejects missing or malformed snapshots and unsupported options', async () => {
    const root = join(tmpdir(), `repoassure-project-backlog-invalid-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const malformedSnapshotPath = join(outputDir, 'project-intelligence-snapshot.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(malformedSnapshotPath, '{"schemaVersion":1,"boundary":{"localOnly":false}}');

    await expect(runProjectIntelligenceBacklog({
      snapshotPath: join(outputDir, 'missing.json'),
      outputDir
    })).rejects.toThrow('missing project intelligence snapshot');

    await expect(runProjectIntelligenceBacklog({
      snapshotPath: malformedSnapshotPath,
      outputDir
    })).rejects.toThrow('invalid project intelligence snapshot');

    expect(parseProjectIntelligenceBacklogArgs([
      '--snapshot',
      '/repo/artifacts/project-graph/project-intelligence-snapshot.json',
      '--output',
      '/repo/artifacts/project-graph'
    ])).toEqual({
      snapshotPath: '/repo/artifacts/project-graph/project-intelligence-snapshot.json',
      outputDir: '/repo/artifacts/project-graph'
    });
    expect(() => parseProjectIntelligenceBacklogArgs(['--apply'])).toThrow(
      'Unknown project intelligence backlog option'
    );
  });
});

function buildSnapshotFixture(): ProjectIntelligenceSnapshot {
  return {
    schemaVersion: 1,
    generatedAt: '2026-07-17T08:30:00.000+08:00',
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
      codeNodes: 1,
      progressNodes: 1,
      totalEdges: 0,
      outputBytes: 1000,
      findings: {
        total: 3,
        high: 0,
        medium: 3,
        low: 0
      }
    },
    docsGraph: {
      nodes: [
        {
          id: 'docs/adr/0001-local-first-mcp-cli.md',
          label: 'ADR-0001',
          type: 'adr',
          path: 'docs/adr/0001-local-first-mcp-cli.md',
          owner: 'docs'
        },
        {
          id: 'docs/adr/0002-shared-cli-mcp-core.md',
          label: 'ADR-0002',
          type: 'adr',
          path: 'docs/adr/0002-shared-cli-mcp-core.md',
          owner: 'docs'
        }
      ],
      edges: []
    },
    codeGraph: {
      nodes: [
        { id: 'packages/acceptance', label: 'acceptance', type: 'package', path: 'packages/acceptance', owner: 'package' }
      ],
      edges: []
    },
    progressGraph: {
      nodes: [
        { id: 'progress:current-stage', label: 'ADR cascade backlog selected', type: 'progress', status: 'current' }
      ],
      edges: []
    },
    findings: [
      {
        id: 'missing-cascade:docs/adr/0001-local-first-mcp-cli.md',
        category: 'missing_cascade',
        severity: 'medium',
        title: 'ADR lacks cascade evidence',
        detail: 'ADR has no outgoing docsGraph edge to a downstream spec, acceptance record, test strategy, or log.',
        path: 'docs/adr/0001-local-first-mcp-cli.md',
        evidence: ['docs/adr/0001-local-first-mcp-cli.md']
      },
      {
        id: 'missing-cascade:docs/adr/0002-shared-cli-mcp-core.md',
        category: 'missing_cascade',
        severity: 'medium',
        title: 'ADR lacks cascade evidence',
        detail: 'ADR has no outgoing docsGraph edge to a downstream spec, acceptance record, test strategy, or log.',
        path: 'docs/adr/0002-shared-cli-mcp-core.md',
        evidence: ['docs/adr/0002-shared-cli-mcp-core.md']
      },
      {
        id: 'missing-test-link:packages/example',
        category: 'missing_test_link',
        severity: 'medium',
        title: 'Package lacks graph-linked test evidence',
        detail: 'Package has source files but no tests edge in the code graph.',
        path: 'packages/example',
        evidence: ['packages/example']
      }
    ],
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
