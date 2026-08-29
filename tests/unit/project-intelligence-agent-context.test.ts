import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  formatProjectIntelligenceAgentContextMarkdown,
  parseProjectIntelligenceAgentContextArgs,
  runProjectIntelligenceAgentContext
} from '../../packages/acceptance/src/run-project-intelligence-agent-context.js';
import type { ProjectIntelligenceAgentContext } from '../../packages/acceptance/src/run-project-intelligence-agent-context.js';
import type { ProjectIntelligenceSnapshot } from '../../packages/acceptance/src/run-project-intelligence-snapshot.js';

describe('project intelligence agent context export', () => {
  it('generates a bounded local-only agent context JSON and Markdown package', async () => {
    const root = join(tmpdir(), `repoassure-agent-context-${randomUUID()}`);
    const outputDir = join(root, 'artifacts', 'project-graph');
    const snapshotPath = join(outputDir, 'project-intelligence-snapshot.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(snapshotPath, `${JSON.stringify(buildSnapshotFixture(), null, 2)}\n`);
    await mkdir(join(root, '.autopilot', 'progress'), { recursive: true });
    await mkdir(join(root, '.autopilot', 'goals'), { recursive: true });
    await writeFile(
      join(root, '.autopilot', 'progress', 'snapshot.json'),
      `${JSON.stringify({
        current_stage: 'Product completion gap audit completed; Project Intelligence agent context export ready',
        active_goal: {
          id: 'project-intelligence-agent-context-export-v0.1',
          status: 'ready_to_execute'
        },
        next_goal: {
          id: 'project-intelligence-agent-context-export-v0.1',
          status: 'ready_to_execute'
        },
        blocked_actions: ['hosted_dashboard', 'target_repo_write', 'public_release']
      }, null, 2)}\n`
    );
    await writeFile(
      join(root, '.autopilot', 'goals', 'project-intelligence-agent-context-export-v0.1.json'),
      `${JSON.stringify({
        schema: 'project-autopilot/goal@1',
        id: 'project-intelligence-agent-context-export-v0.1',
        status: 'ready_to_execute',
        objective: 'Generate local-only Project Intelligence agent context export',
        blocked_actions: ['hosted_dashboard', 'target_repo_write', 'website_design_system_rewrite'],
        acceptance: ['pnpm project:intelligence:agent-context writes artifacts/project-graph/project-intelligence-agent-context.json']
      }, null, 2)}\n`
    );

    const result = await runProjectIntelligenceAgentContext({
      root,
      snapshotPath,
      outputDir,
      generatedAt: '2026-07-19T09:10:00.000+08:00'
    });
    const json = JSON.parse(await readFile(result.contextPath, 'utf8')) as ProjectIntelligenceAgentContext;
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.contextPath).toBe(join(outputDir, 'project-intelligence-agent-context.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'project-intelligence-agent-context.md'));
    expect(result.recommendedGoalCount).toBeGreaterThanOrEqual(1);
    expect(json.schema).toBe('repoassure.project-intelligence-agent-context@1');
    expect(json.generatedAt).toBe('2026-07-19T09:10:00.000+08:00');
    expect(json.boundary.localOnly).toBe(true);
    expect(json.boundary.hostedDashboardImplemented).toBe(false);
    expect(json.boundary.telemetryEnabled).toBe(false);
    expect(json.boundary.targetRepoWriteAuthorized).toBe(false);
    expect(json.boundary.prohibitedActions).toEqual(expect.arrayContaining([
      'hosted_dashboard',
      'cloud_sync',
      'telemetry',
      'deployment',
      'public_release',
      'target_repo_write',
      'website_design_system_rewrite'
    ]));
    expect(json.readOrder.slice(0, 4)).toEqual([
      'project-intelligence-agent-context.json',
      'project-intelligence-snapshot.json',
      '.autopilot/progress/snapshot.json',
      '.autopilot/goals/index.json'
    ]);
    expect(json.currentGoal).toEqual({
      id: 'project-intelligence-agent-context-export-v0.1',
      status: 'ready_to_execute'
    });
    expect(json.recommendedNextGoals[0]).toEqual(expect.objectContaining({
      id: 'project-intelligence-agent-context-export-v0.1',
      priority: 'P1'
    }));
    expect(json.productSurfaces).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'project_intelligence_snapshot',
        status: 'implemented'
      }),
      expect.objectContaining({
        id: 'project_intelligence_viewer',
        status: 'implemented'
      })
    ]));
    expect(json.blockers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'hosted_dashboard',
        status: 'not_authorized'
      }),
      expect.objectContaining({
        id: 'public_release',
        status: 'manual_gate'
      })
    ]));
    expect(json.evidencePaths).toEqual(expect.arrayContaining([
      'artifacts/project-graph/project-intelligence-snapshot.json',
      '.autopilot/progress/snapshot.json'
    ]));
    expect(JSON.stringify(json)).not.toContain('sk-local-secret');
    expect(JSON.stringify(json)).not.toContain('Authorization: Bearer');
    expect(markdown).toContain('# Project Intelligence Agent Context');
    expect(markdown).toContain('## Read Order');
    expect(markdown).toContain('## Recommended Next Goals');
    expect(markdown).toContain('Project Intelligence Agent Context Export v0.1');
    expect(markdown).toContain('No hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo write is authorized.');
    expect(formatProjectIntelligenceAgentContextMarkdown(json)).toContain('local-only');
  });

  it('parses CLI arguments without hosted, telemetry, or target repo write options', () => {
    expect(parseProjectIntelligenceAgentContextArgs([
      '--root',
      '/repo',
      '--snapshot',
      '/repo/artifacts/project-graph/project-intelligence-snapshot.json',
      '--output',
      '/repo/artifacts/project-graph'
    ])).toEqual({
      root: '/repo',
      snapshotPath: '/repo/artifacts/project-graph/project-intelligence-snapshot.json',
      outputDir: '/repo/artifacts/project-graph'
    });

    expect(() => parseProjectIntelligenceAgentContextArgs(['--hosted-dashboard'])).toThrow(
      'Unknown project intelligence agent context option'
    );
    expect(() => parseProjectIntelligenceAgentContextArgs(['--target-repo-write'])).toThrow(
      'Unknown project intelligence agent context option'
    );
  });
});

function buildSnapshotFixture(): ProjectIntelligenceSnapshot {
  return {
    schemaVersion: 1,
    generatedAt: '2026-07-19T09:00:00.000+08:00',
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
      codeNodes: 4,
      progressNodes: 2,
      totalEdges: 3,
      outputBytes: 1000,
      findings: {
        total: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    },
    findings: [],
    docsGraph: {
      nodes: [
        {
          id: 'docs/product/specs/project-intelligence-console-spec-v0.1.md',
          label: 'Project Intelligence Console Spec v0.1',
          type: 'doc',
          path: 'docs/product/specs/project-intelligence-console-spec-v0.1.md',
          owner: 'docs'
        },
        {
          id: 'docs/SPEC.md',
          label: 'SPEC',
          type: 'doc',
          path: 'docs/SPEC.md',
          owner: 'docs'
        }
      ],
      edges: []
    },
    codeGraph: {
      nodes: [
        { id: 'packages/acceptance', label: 'acceptance', type: 'package', path: 'packages/acceptance', owner: 'package' },
        { id: 'apps/website', label: 'website', type: 'app', path: 'apps/website', owner: 'app' },
        { id: 'src', label: 'src', type: 'source', path: 'src', owner: 'runtime' },
        { id: 'tests/unit/project-intelligence-agent-context.test.ts', label: 'project-intelligence-agent-context.test.ts', type: 'test', path: 'tests/unit/project-intelligence-agent-context.test.ts', owner: 'tests' }
      ],
      edges: [
        {
          from: 'tests/unit/project-intelligence-agent-context.test.ts',
          to: 'packages/acceptance',
          type: 'tests'
        }
      ]
    },
    progressGraph: {
      nodes: [
        { id: 'progress:current-stage', label: 'Project Intelligence agent context export ready', type: 'progress', status: 'current' },
        { id: 'goal:project-intelligence-agent-context-export-v0.1', label: 'Project Intelligence Agent Context Export v0.1', type: 'goal', status: 'ready_to_execute' }
      ],
      edges: [
        {
          from: 'progress:current-stage',
          to: 'goal:project-intelligence-agent-context-export-v0.1',
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
      prohibitedContent: ['secret values', 'authorization tokens', 'private generated artifacts']
    }
  };
}
