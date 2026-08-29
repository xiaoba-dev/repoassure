import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  parseProjectIntelligenceWatchHandoffArgs,
  runProjectIntelligenceWatchHandoff
} from '../../packages/acceptance/src/run-project-intelligence-watch-handoff.js';

const generatedAt = '2026-07-20T00:00:00.000Z';

describe('project intelligence watch AI IDE handoff', () => {
  it('writes a local-only handoff package that tells AI IDEs how to consume watch artifacts', async () => {
    const root = await mkdtemp(join(tmpdir(), 'project-intelligence-watch-handoff-'));
    const outputDir = join(root, 'artifacts', 'project-graph');
    await mkdir(outputDir, { recursive: true });
    await writeFixtureWatchStatus(outputDir);
    await writeFixtureAgentContext(outputDir);

    const result = await runProjectIntelligenceWatchHandoff({
      root,
      outputDir,
      generatedAt
    });

    const rawHandoff = await readFile(result.handoffPath, 'utf8');
    const handoff = JSON.parse(rawHandoff);
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.handoffPath).toBe(join(outputDir, 'project-intelligence-watch-handoff.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'project-intelligence-watch-handoff.md'));
    expect(handoff.schema).toBe('repoassure.project-intelligence-watch-handoff@1');
    expect(handoff.generatedAt).toBe(generatedAt);
    expect(handoff.boundary).toEqual(expect.objectContaining({
      localOnly: true,
      daemonized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      targetRepoWriteAuthorized: false
    }));
    expect(handoff.commands).toEqual({
      start: 'pnpm project:intelligence:watch',
      smoke: 'pnpm project:intelligence:watch -- --once',
      agentContext: 'pnpm project:intelligence:agent-context',
      stop: 'Ctrl+C'
    });
    expect(handoff.readOrder.slice(0, 4)).toEqual([
      'project-intelligence-watch-handoff.json',
      'project-intelligence-watch-status.json',
      'project-intelligence-agent-context.json',
      'project-intelligence-agent-context.md'
    ]);
    expect(handoff.freshnessChecklist).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'watch_status_schema',
        status: 'passed',
        evidence: ['project-intelligence-watch-status.json']
      }),
      expect.objectContaining({
        id: 'watch_refresh_count',
        status: 'passed'
      }),
      expect.objectContaining({
        id: 'watch_boundary',
        status: 'passed'
      })
    ]));
    expect(handoff.recoveryPlan.status).toBe('not_needed');
    expect(handoff.recoveryPlan.commands).toEqual([]);
    expect(handoff.recoveryPlan.boundary).toEqual(expect.objectContaining({
      localOnly: true,
      manualArtifactEditsAllowed: false,
      targetRepoWritesAllowed: false
    }));
    expect(handoff.maintainerReviewBoundary.allowedActions).toContain('read local Project Intelligence artifacts');
    expect(handoff.maintainerReviewBoundary.prohibitedActions).toContain('target_repo_write');
    expect(handoff.stopInstructions).toEqual({
      foregroundOnly: true,
      manualStop: 'Ctrl+C',
      noDaemon: true
    });
    expect(handoff.redaction.applied).toBe(true);
    expect(rawHandoff).not.toContain('ghp_SECRET');
    expect(markdown).toContain('# Project Intelligence Watch Handoff');
    expect(markdown).toContain('## AI IDE Read Order');
    expect(markdown).toContain('## Freshness Checklist');
    expect(markdown).toContain('## Recovery Plan');
    expect(markdown).toContain('Recovery status: not_needed');
    expect(markdown).toContain('## Stop Boundary');
    expect(markdown).toContain('No hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo write is authorized.');
  });

  it('adds machine-readable recovery commands when freshness checks fail', async () => {
    const root = await mkdtemp(join(tmpdir(), 'project-intelligence-watch-handoff-recovery-'));
    const outputDir = join(root, 'artifacts', 'project-graph');
    await mkdir(outputDir, { recursive: true });
    await writeFixtureWatchStatus(outputDir, {
      status: 'failed',
      refreshCount: 0,
      lastSuccessfulCommands: ['pnpm project:intelligence'],
      lastFailure: {
        generatedAt,
        summary: 'ghp_SECRET malformed agent context'
      }
    });
    await writeFixtureAgentContext(outputDir);

    const result = await runProjectIntelligenceWatchHandoff({
      root,
      outputDir,
      generatedAt
    });

    const rawHandoff = await readFile(result.handoffPath, 'utf8');
    const handoff = JSON.parse(rawHandoff);
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(handoff.freshnessChecklist.some((item: { status: string }) => item.status === 'failed')).toBe(true);
    expect(handoff.recoveryPlan.status).toBe('required');
    expect(handoff.recoveryPlan.failedChecks).toEqual(expect.arrayContaining([
      'watch_refresh_count',
      'watch_commands'
    ]));
    expect(handoff.recoveryPlan.commands).toEqual([
      expect.objectContaining({
        id: 'regenerate_snapshot_and_context',
        command: 'pnpm project:intelligence:watch -- --once'
      }),
      expect.objectContaining({
        id: 'regenerate_handoff',
        command: 'pnpm project:intelligence:watch-handoff'
      }),
      expect.objectContaining({
        id: 'inspect_handoff',
        command: 'cat artifacts/project-graph/project-intelligence-watch-handoff.md'
      })
    ]);
    expect(handoff.recoveryPlan.boundary.localOnly).toBe(true);
    expect(handoff.recoveryPlan.boundary.manualArtifactEditsAllowed).toBe(false);
    expect(handoff.recoveryPlan.boundary.targetRepoWritesAllowed).toBe(false);
    expect(rawHandoff).not.toContain('ghp_SECRET');
    expect(markdown).toContain('Recovery status: required');
    expect(markdown).toContain('Do not repair freshness failures by editing generated artifacts by hand.');
    expect(markdown).toContain('pnpm project:intelligence:watch -- --once');
    expect(markdown).toContain('pnpm project:intelligence:watch-handoff');
  });

  it('parses safe local CLI options and rejects hosted or target repo write switches', () => {
    expect(parseProjectIntelligenceWatchHandoffArgs([
      '--root',
      '.',
      '--output',
      'artifacts/project-graph',
      '--status',
      'artifacts/project-graph/project-intelligence-watch-status.json',
      '--agent-context',
      'artifacts/project-graph/project-intelligence-agent-context.json'
    ])).toEqual(expect.objectContaining({}));

    expect(() => parseProjectIntelligenceWatchHandoffArgs(['--hosted-dashboard'])).toThrow(/Unknown project intelligence watch handoff option/u);
    expect(() => parseProjectIntelligenceWatchHandoffArgs(['--target-repo-write'])).toThrow(/Unknown project intelligence watch handoff option/u);
    expect(() => parseProjectIntelligenceWatchHandoffArgs(['--cloud-sync'])).toThrow(/Unknown project intelligence watch handoff option/u);
  });
});

async function writeFixtureWatchStatus(
  outputDir: string,
  overrides: Record<string, unknown> = {}
): Promise<void> {
  await writeFile(join(outputDir, 'project-intelligence-watch-status.json'), `${JSON.stringify({
    schema: 'repoassure.project-intelligence-watch-status@1',
    generatedAt,
    status: 'stopped',
    refreshCount: 2,
    debounceMs: 25,
    watchedScope: ['docs/', 'packages/'],
    ignoredScope: ['artifacts/', 'node_modules/'],
    lastChangedPaths: ['docs/PRD.md'],
    lastSuccessfulCommands: ['pnpm project:intelligence', 'pnpm project:intelligence:agent-context'],
    lastOutputs: {
      snapshotPath: 'artifacts/project-graph/project-intelligence-snapshot.json',
      agentContextPath: 'artifacts/project-graph/project-intelligence-agent-context.json'
    },
    boundary: {
      localOnly: true,
      daemonized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      targetRepoWriteAuthorized: false,
      manualStop: 'Ctrl+C'
    },
    ...overrides
  }, null, 2)}\n`);
}

async function writeFixtureAgentContext(outputDir: string): Promise<void> {
  await writeFile(join(outputDir, 'project-intelligence-agent-context.json'), `${JSON.stringify({
    schema: 'repoassure.project-intelligence-agent-context@1',
    generatedAt,
    boundary: {
      localOnly: true,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      targetRepoWriteAuthorized: false,
      prohibitedActions: ['target_repo_write', 'hosted_dashboard', 'ghp_SECRET_TOKEN']
    },
    readOrder: [
      'project-intelligence-agent-context.json',
      'project-intelligence-snapshot.json',
      '.autopilot/progress/snapshot.json'
    ],
    currentGoal: {
      id: 'project-intelligence-watch-mode-ai-ide-consumption-handoff-v0.1',
      status: 'active'
    },
    recommendedNextGoals: [],
    productSurfaces: [],
    blockers: [],
    evidencePaths: ['artifacts/project-graph/project-intelligence-snapshot.json'],
    redaction: {
      applied: true,
      prohibitedContent: ['secret values', 'authorization tokens', 'private generated artifacts']
    }
  }, null, 2)}\n`);
  await writeFile(join(outputDir, 'project-intelligence-agent-context.md'), '# Project Intelligence Agent Context\n');
}
