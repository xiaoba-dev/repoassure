import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  runProjectIntelligenceWatch,
  type ProjectIntelligenceWatchStatus
} from '../../packages/acceptance/src/run-project-intelligence-watch.js';
import {
  runProjectIntelligenceWatchHandoff,
  type ProjectIntelligenceWatchHandoff
} from '../../packages/acceptance/src/run-project-intelligence-watch-handoff.js';
import type { ProjectIntelligenceAgentContext } from '../../packages/acceptance/src/run-project-intelligence-agent-context.js';

const generatedAt = {
  realWatch: '2026-07-21T14:00:00.000Z',
  realHandoff: '2026-07-21T14:01:00.000Z',
  failingHandoff: '2026-07-21T14:02:00.000Z'
};

describe('project intelligence watch recovery UX smoke', () => {
  it('validates the real workspace handoff as actionable when no recovery is needed', async () => {
    const repoRoot = resolve('.');
    const outputDir = join(repoRoot, 'artifacts', 'project-graph');
    const statusPath = join(outputDir, 'project-intelligence-watch-status.json');
    const agentContextPath = join(outputDir, 'project-intelligence-agent-context.json');

    const watchResult = await runProjectIntelligenceWatch({
      root: repoRoot,
      outputDir,
      statusPath,
      once: true,
      generatedAt: generatedAt.realWatch
    });
    const handoffResult = await runProjectIntelligenceWatchHandoff({
      root: repoRoot,
      outputDir,
      statusPath,
      agentContextPath,
      generatedAt: generatedAt.realHandoff
    });

    const handoff = JSON.parse(await readFile(handoffResult.handoffPath, 'utf8')) as ProjectIntelligenceWatchHandoff;
    const handoffMarkdown = await readFile(handoffResult.markdownPath, 'utf8');
    const rawHandoff = JSON.stringify(handoff);

    expect(watchResult.status).toBe('stopped');
    expect(watchResult.refreshCount).toBeGreaterThan(0);
    expect(handoff.freshnessChecklist.every((item) => item.status === 'passed')).toBe(true);
    expect(handoff.recoveryPlan).toMatchObject({
      status: 'not_needed',
      failedChecks: [],
      commands: [],
      boundary: {
        localOnly: true,
        manualArtifactEditsAllowed: false,
        targetRepoWritesAllowed: false,
        hostedDashboardAllowed: false,
        telemetryAllowed: false,
        cloudSyncAllowed: false
      }
    });
    expect(handoff.boundary.targetRepoWriteAuthorized).toBe(false);
    expect(handoff.maintainerReviewBoundary.prohibitedActions).toEqual(expect.arrayContaining([
      'target_repo_write',
      'hosted_dashboard',
      'cloud_sync',
      'telemetry'
    ]));
    expect(handoffMarkdown).toContain('## Recovery Plan');
    expect(handoffMarkdown).toContain('Recovery status: not_needed');
    expect(handoffMarkdown).toContain('No recovery command needed; freshness checks passed.');
    expect(rawHandoff).not.toMatch(/ghp_|sk-[A-Za-z0-9_-]+|Authorization: Bearer/i);
    expect(handoffMarkdown).not.toMatch(/ghp_|sk-[A-Za-z0-9_-]+|Authorization: Bearer/i);
  }, 30_000);

  it('turns a failing watch status into a local-only recovery command handoff', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-watch-recovery-ux-'));
    const outputDir = join(repoRoot, 'artifacts', 'project-graph');
    const statusPath = join(outputDir, 'project-intelligence-watch-status.json');
    const agentContextPath = join(outputDir, 'project-intelligence-agent-context.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(statusPath, `${JSON.stringify(buildFailingWatchStatus(), null, 2)}\n`);
    await writeFile(agentContextPath, `${JSON.stringify(buildAgentContextFixture(), null, 2)}\n`);

    const handoffResult = await runProjectIntelligenceWatchHandoff({
      root: repoRoot,
      outputDir,
      statusPath,
      agentContextPath,
      generatedAt: generatedAt.failingHandoff
    });

    const handoffMarkdown = await readFile(handoffResult.markdownPath, 'utf8');
    const rawHandoff = await readFile(handoffResult.handoffPath, 'utf8');
    const handoff = JSON.parse(rawHandoff) as ProjectIntelligenceWatchHandoff;

    expect(handoff.recoveryPlan.status).toBe('required');
    expect(handoff.recoveryPlan.failedChecks).toEqual(expect.arrayContaining([
      'watch_refresh_count',
      'watch_commands'
    ]));
    expect(handoff.recoveryPlan.commands.map((command) => command.command)).toEqual([
      'pnpm project:intelligence:watch -- --once',
      'pnpm project:intelligence:watch-handoff',
      'cat artifacts/project-graph/project-intelligence-watch-handoff.md'
    ]);
    expect(handoff.recoveryPlan.boundary).toEqual({
      localOnly: true,
      manualArtifactEditsAllowed: false,
      targetRepoWritesAllowed: false,
      hostedDashboardAllowed: false,
      telemetryAllowed: false,
      cloudSyncAllowed: false
    });
    expect(handoffMarkdown).toContain('Recovery status: required');
    expect(handoffMarkdown).toContain('Failed checks: watch_refresh_count, watch_commands');
    expect(handoffMarkdown).toContain('Do not repair freshness failures by editing generated artifacts by hand.');
    expect(handoffMarkdown).toContain('pnpm project:intelligence:watch -- --once');
    expect(rawHandoff).not.toContain('ghp_SECRET');
    expect(rawHandoff).not.toContain('sk-live-token');
    expect(handoffMarkdown).not.toContain('ghp_SECRET');
    expect(handoffMarkdown).not.toContain('sk-live-token');
  });
});

function buildFailingWatchStatus(): ProjectIntelligenceWatchStatus {
  return {
    schema: 'repoassure.project-intelligence-watch-status@1',
    generatedAt: '2026-07-21T13:58:00.000Z',
    status: 'failed',
    refreshCount: 0,
    debounceMs: 1500,
    watchedScope: ['docs/', 'src/', 'packages/', 'apps/', 'tests/', '.autopilot/'],
    ignoredScope: ['artifacts/', 'dist/', 'node_modules/'],
    lastChangedPaths: ['docs/PRD.md'],
    lastSuccessfulCommands: ['pnpm project:intelligence'],
    lastFailure: {
      generatedAt: '2026-07-21T13:59:00.000Z',
      summary: 'Synthetic failure contains ghp_SECRET and sk-live-token to verify redaction.'
    },
    boundary: {
      localOnly: true,
      daemonized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      targetRepoWriteAuthorized: false,
      manualStop: 'Ctrl+C'
    }
  };
}

function buildAgentContextFixture(): ProjectIntelligenceAgentContext {
  return {
    schema: 'repoassure.project-intelligence-agent-context@1',
    generatedAt: '2026-07-21T13:57:00.000Z',
    boundary: {
      localOnly: true,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      targetRepoWriteAuthorized: false,
      prohibitedActions: ['target_repo_write', 'hosted_dashboard', 'cloud_sync', 'telemetry']
    },
    readOrder: [
      'project-intelligence-agent-context.json',
      'project-intelligence-snapshot.json',
      '.autopilot/progress/snapshot.json'
    ],
    currentGoal: {
      id: 'project-intelligence-watch-mode-recovery-ux-real-workspace-smoke-v0.1',
      status: 'in_progress'
    },
    recommendedNextGoals: [],
    productSurfaces: [],
    blockers: [],
    evidencePaths: ['artifacts/project-graph/project-intelligence-snapshot.json'],
    redaction: {
      applied: true,
      prohibitedContent: ['ghp_SECRET', 'sk-live-token']
    }
  };
}
