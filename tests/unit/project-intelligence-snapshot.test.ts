import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import {
  formatProjectIntelligenceSnapshotMarkdown,
  parseProjectIntelligenceSnapshotArgs,
  runProjectIntelligenceSnapshot
} from '../../packages/acceptance/src/run-project-intelligence-snapshot.js';
import type { buildProjectIntelligenceSnapshot } from '../../packages/acceptance/src/run-project-intelligence-snapshot.js';

describe('project intelligence snapshot', () => {
  it('generates bounded local-only docs, code, and progress graph artifacts', async () => {
    const root = await mkFixtureRepo();
    const outputDir = join(root, 'artifacts', 'project-graph');

    const result = await runProjectIntelligenceSnapshot({
      root,
      outputDir,
      generatedAt: '2026-07-16T17:00:00.000Z'
    });

    const json = JSON.parse(await readFile(result.snapshotPath, 'utf8')) as ReturnType<typeof buildProjectIntelligenceSnapshot>;
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.nodeCount).toBeGreaterThanOrEqual(8);
    expect(result.edgeCount).toBeGreaterThanOrEqual(6);
    expect(result.snapshotPath).toBe(join(outputDir, 'project-intelligence-snapshot.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'project-intelligence-snapshot.md'));

    expect(json.schemaVersion).toBe(1);
    expect(json.generatedAt).toBe('2026-07-16T17:00:00.000Z');
    expect(json.boundary.localOnly).toBe(true);
    expect(json.boundary.hostedDashboardImplemented).toBe(false);
    expect(json.boundary.telemetryEnabled).toBe(false);
    expect(json.boundary.outputDir).toBe(outputDir);
    expect(json.summary.graphs).toEqual(['docsGraph', 'codeGraph', 'progressGraph']);
    expect(json.summary.outputBytes).toBeLessThan(250_000);
    expect(json.summary.findings).toEqual({
      total: 5,
      high: 1,
      medium: 4,
      low: 0
    });

    expect(json.docsGraph.nodes.some((node) => node.id === 'docs/adr/0017-public-website-and-project-intelligence-console.md')).toBe(true);
    expect(json.docsGraph.edges).toContainEqual({
      from: 'docs/adr/0017-public-website-and-project-intelligence-console.md',
      to: 'docs/product/specs/project-intelligence-console-spec-v0.1.md',
      type: 'mentions'
    });
    expect(json.docsGraph.edges).toContainEqual({
      from: 'docs/product/specs/project-intelligence-console-spec-v0.1.md',
      to: 'docs/architecture/specs/project-intelligence-console-architecture-v0.1.md',
      type: 'mentions'
    });

    expect(json.codeGraph.nodes).toContainEqual({
      id: 'packages/acceptance',
      label: 'acceptance',
      type: 'package',
      path: 'packages/acceptance',
      owner: 'package'
    });
    expect(json.codeGraph.edges).toContainEqual({
      from: 'tests/unit/project-intelligence-snapshot.test.ts',
      to: 'packages/acceptance',
      type: 'tests'
    });
    expect(json.codeGraph.nodes.some((node) => node.path?.startsWith('artifacts/') === true)).toBe(false);

    expect(json.progressGraph.nodes).toContainEqual({
      id: 'goal:project-intelligence-console-graph-snapshot-generator-v0.1',
      label: 'Project Intelligence Console Graph Snapshot Generator v0.1',
      type: 'goal',
      status: 'active'
    });
    expect(json.progressGraph.edges).not.toContainEqual({
      from: 'progress:current-stage',
      to: 'goal:project-intelligence-console-missing-active-goal-v0.1',
      type: 'active_goal'
    });
    expect(json.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'missing-cascade:docs/adr/0022-unlinked-decision.md',
        category: 'missing_cascade',
        severity: 'medium',
        path: 'docs/adr/0022-unlinked-decision.md'
      }),
      expect.objectContaining({
        id: 'orphan-code:apps/orphan',
        category: 'orphan_code',
        severity: 'medium',
        path: 'apps/orphan'
      }),
      expect.objectContaining({
        id: 'orphan-code:apps/nested-readme',
        category: 'orphan_code',
        severity: 'medium',
        path: 'apps/nested-readme',
        evidence: expect.arrayContaining(['apps/nested-readme/docs/README.md'])
      }),
      expect.objectContaining({
        id: 'missing-test-link:packages/untested',
        category: 'missing_test_link',
        severity: 'medium',
        path: 'packages/untested'
      }),
      expect.objectContaining({
        id: 'progress-state-mismatch:missing-active-goal',
        category: 'progress_state_mismatch',
        severity: 'high',
        path: '.autopilot/progress/snapshot.json'
      })
    ]));
    expect(json.findings.map((finding) => finding.category).sort()).toEqual([
      'missing_cascade',
      'missing_test_link',
      'orphan_code',
      'orphan_code',
      'progress_state_mismatch'
    ]);

    expect(JSON.stringify(json)).not.toContain('sk-local-secret');
    expect(JSON.stringify(json)).not.toContain('Authorization: Bearer');
    expect(markdown).toContain('# Project Intelligence Snapshot');
    expect(markdown).toContain('## Docs Graph');
    expect(markdown).toContain('## Code Graph');
    expect(markdown).toContain('## Progress Graph');
    expect(markdown).toContain('## Freshness and Staleness Findings');
    expect(markdown).toContain('missing_cascade');
    expect(markdown).toContain('progress_state_mismatch');
    expect(formatProjectIntelligenceSnapshotMarkdown(json)).toContain('local-only');
  });

  it('parses CLI arguments without enabling hosted or telemetry behavior', () => {
    expect(parseProjectIntelligenceSnapshotArgs([
      '--root',
      '/repo',
      '--output',
      '/repo/artifacts/project-graph'
    ])).toEqual({
      root: '/repo',
      outputDir: '/repo/artifacts/project-graph'
    });

    expect(() => parseProjectIntelligenceSnapshotArgs(['--hosted-dashboard'])).toThrow(
      'Unknown project intelligence snapshot option'
    );
  });
});

async function mkFixtureRepo(): Promise<string> {
  const root = join(tmpdir(), `repoassure-project-graph-${randomUUID()}`);

  await mkdir(root, { recursive: true });

  await mkdir(join(root, 'docs', 'adr'), { recursive: true });
  await mkdir(join(root, 'docs', 'product', 'specs'), { recursive: true });
  await mkdir(join(root, 'docs', 'architecture', 'specs'), { recursive: true });
  await mkdir(join(root, 'docs', 'acceptance'), { recursive: true });
  await mkdir(join(root, 'docs', 'logs'), { recursive: true });
  await mkdir(join(root, 'packages', 'acceptance', 'src'), { recursive: true });
  await mkdir(join(root, 'apps', 'website', 'src'), { recursive: true });
  await mkdir(join(root, 'src', 'adapters', 'cli'), { recursive: true });
  await mkdir(join(root, 'tests', 'unit'), { recursive: true });
  await mkdir(join(root, 'scripts'), { recursive: true });
  await mkdir(join(root, 'artifacts', 'project-graph'), { recursive: true });
  await mkdir(join(root, '.autopilot', 'goals'), { recursive: true });
  await mkdir(join(root, '.autopilot', 'progress'), { recursive: true });

  await writeFile(
    join(root, '.gitignore'),
    [
      'artifacts/project-graph/',
      '.env',
      ''
    ].join('\n')
  );
  await writeFile(
    join(root, 'docs', 'adr', '0017-public-website-and-project-intelligence-console.md'),
    [
      '# ADR-0017: Public Website and Internal Project Intelligence Console',
      'Mentions docs/product/specs/project-intelligence-console-spec-v0.1.md',
      'Contains secret-like text sk-local-secret that must be redacted.'
    ].join('\n')
  );
  await writeFile(
    join(root, 'docs', 'adr', '0022-unlinked-decision.md'),
    [
      '# ADR-0022: Unlinked Decision',
      'Accepted but not cascaded into product specs, architecture specs, acceptance, tests, or logs.'
    ].join('\n')
  );
  await writeFile(
    join(root, 'docs', 'product', 'specs', 'project-intelligence-console-spec-v0.1.md'),
    [
      '# Project Intelligence Console Spec v0.1',
      'Related architecture: docs/architecture/specs/project-intelligence-console-architecture-v0.1.md',
      'Output: artifacts/project-graph/'
    ].join('\n')
  );
  await writeFile(
    join(root, 'docs', 'architecture', 'specs', 'project-intelligence-console-architecture-v0.1.md'),
    '# Project Intelligence Console Architecture v0.1'
  );
  await writeFile(join(root, 'docs', 'acceptance', 'acceptance-run.md'), '# Acceptance\npassed');
  await writeFile(join(root, 'docs', 'logs', 'decision-log.md'), '# Decision Log\nProject Intelligence Console');
  await writeFile(join(root, 'packages', 'acceptance', 'README.md'), '# Acceptance package');
  await mkdir(join(root, 'packages', 'untested', 'src'), { recursive: true });
  await writeFile(join(root, 'packages', 'untested', 'src', 'index.ts'), 'export const untested = true;');
  await writeFile(join(root, 'apps', 'website', 'README.md'), '# Website');
  await mkdir(join(root, 'apps', 'nested-readme', 'docs'), { recursive: true });
  await mkdir(join(root, 'apps', 'nested-readme', 'src'), { recursive: true });
  await writeFile(join(root, 'apps', 'nested-readme', 'docs', 'README.md'), '# Nested docs only');
  await writeFile(join(root, 'apps', 'nested-readme', 'src', 'index.ts'), 'export const nestedReadme = true;');
  await mkdir(join(root, 'apps', 'orphan', 'src'), { recursive: true });
  await writeFile(join(root, 'apps', 'orphan', 'src', 'index.ts'), 'export const orphan = true;');
  await writeFile(join(root, 'src', 'adapters', 'cli', 'run.ts'), 'export const cli = true;');
  await writeFile(join(root, 'scripts', 'check.mjs'), 'console.log("ok");');
  await writeFile(
    join(root, 'tests', 'unit', 'project-intelligence-snapshot.test.ts'),
    "import '../../packages/acceptance/src/run-project-intelligence-snapshot.js';"
  );
  await writeFile(join(root, 'artifacts', 'project-graph', 'old.json'), '{"ignored":true}');
  await writeFile(
    join(root, '.autopilot', 'goals', 'project-intelligence-console-graph-snapshot-generator-v0.1.json'),
    JSON.stringify({
      id: 'project-intelligence-console-graph-snapshot-generator-v0.1',
      title: 'Project Intelligence Console Graph Snapshot Generator v0.1',
      status: 'active'
    })
  );
  await writeFile(
    join(root, '.autopilot', 'progress', 'snapshot.json'),
    JSON.stringify({
      current_stage: 'Project Intelligence Console graph snapshot generator in progress',
      active_goal: {
        id: 'project-intelligence-console-missing-active-goal-v0.1',
        title: 'Project Intelligence Console Graph Snapshot Generator v0.1'
      }
    })
  );

  return root;
}
