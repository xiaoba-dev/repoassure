import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  runProjectIntelligenceWatchHandoff
} from '../../packages/acceptance/src/run-project-intelligence-watch-handoff.js';

const generatedAt = '2026-07-21T00:00:00.000Z';
const playbookPath = 'docs/operations/project-intelligence-watch-mode-operator-playbook-v0.1.md';

describe('Project Intelligence watch operator playbook consumption', () => {
  it('lets an AI IDE follow the documented artifact read order from the generated handoff', async () => {
    const playbook = await readFile(playbookPath, 'utf8');
    const { handoffPath } = await generateHandoffFixture({ refreshCount: 2, status: 'stopped' });
    const handoff = JSON.parse(await readFile(handoffPath, 'utf8')) as {
      readOrder: string[];
      commands: Record<string, string>;
      freshnessChecklist: Array<{ status: string }>;
      boundary: {
        localOnly: boolean;
        telemetryEnabled: boolean;
        cloudSyncEnabled: boolean;
        targetRepoWriteAuthorized: boolean;
      };
    };

    const playbookReadOrder = extractPlaybookReadOrder(playbook);

    expect(playbook).toContain('## AI IDE Read Order');
    expect(playbook).toContain('## Freshness Diagnosis');
    expect(playbook).toContain('## Failure Recovery');
    expect(playbook).toContain('## Stop Boundary');
    expect(handoff.commands).toEqual({
      start: 'pnpm project:intelligence:watch',
      smoke: 'pnpm project:intelligence:watch -- --once',
      agentContext: 'pnpm project:intelligence:agent-context',
      stop: 'Ctrl+C'
    });
    expect(normalizeReadOrder(playbookReadOrder)).toEqual(handoff.readOrder);
    expect(handoff.freshnessChecklist.every((item) => item.status === 'passed')).toBe(true);
    expect(handoff.boundary.localOnly).toBe(true);
    expect(handoff.boundary.telemetryEnabled).toBe(false);
    expect(handoff.boundary.cloudSyncEnabled).toBe(false);
    expect(handoff.boundary.targetRepoWriteAuthorized).toBe(false);
  });

  it('blocks goal selection when freshness checks fail and points to recovery without manual artifact edits', async () => {
    const playbook = await readFile(playbookPath, 'utf8');
    const { handoffPath } = await generateHandoffFixture({
      refreshCount: 0,
      status: 'failed',
      lastSuccessfulCommands: ['pnpm project:intelligence:agent-context']
    });
    const handoff = JSON.parse(await readFile(handoffPath, 'utf8')) as {
      freshnessChecklist: Array<{ id: string; status: 'passed' | 'failed' }>;
      maintainerReviewBoundary: { prohibitedActions: string[] };
    };
    const failedChecks = handoff.freshnessChecklist
      .filter((item) => item.status === 'failed')
      .map((item) => item.id);

    expect(failedChecks).toContain('watch_refresh_count');
    expect(failedChecks).toContain('watch_commands');
    expect(canUseHandoffForGoalSelection(handoff.freshnessChecklist)).toBe(false);
    expect(playbook).toContain('do not use the handoff to choose a new execution goal');
    expect(playbook).toContain('Do not repair these failures by editing generated artifacts by hand');
    expect(playbook).toContain('pnpm project:intelligence:watch -- --once');
    expect(playbook).toContain('pnpm project:intelligence:watch-handoff');
    expect(handoff.maintainerReviewBoundary.prohibitedActions).toContain('target_repo_write');
    expect(handoff.maintainerReviewBoundary.prohibitedActions).toContain('hosted_dashboard');
  });

  it('keeps maintainer review boundaries explicit for target repo writes and hosted behavior', async () => {
    const playbook = await readFile(playbookPath, 'utf8');
    const { handoffPath } = await generateHandoffFixture({ refreshCount: 1, status: 'stopped' });
    const handoff = JSON.parse(await readFile(handoffPath, 'utf8')) as {
      stopInstructions: { foregroundOnly: boolean; manualStop: string; noDaemon: boolean };
      maintainerReviewBoundary: { prohibitedActions: string[] };
      boundary: { daemonized: boolean; hostedDashboardImplemented: boolean };
    };

    expect(handoff.stopInstructions).toEqual({
      foregroundOnly: true,
      manualStop: 'Ctrl+C',
      noDaemon: true
    });
    expect(handoff.boundary.daemonized).toBe(false);
    expect(handoff.boundary.hostedDashboardImplemented).toBe(false);
    expect(handoff.maintainerReviewBoundary.prohibitedActions).toEqual(expect.arrayContaining([
      'hosted_dashboard',
      'cloud_sync',
      'telemetry',
      'deployment',
      'public_release',
      'target_repo_write'
    ]));
    expect(playbook).toContain('Any target repo writes require a separate owner-authorized repair execution goal');
    expect(playbook).toContain('Do not add a daemon, cron, launch agent, service manager, telemetry loop, cloud sync, or hosted dashboard');
  });
});

async function generateHandoffFixture(input: {
  refreshCount: number;
  status: 'stopped' | 'failed';
  lastSuccessfulCommands?: string[];
}): Promise<{ handoffPath: string }> {
  const root = await mkdtemp(join(tmpdir(), 'project-intelligence-watch-playbook-consumption-'));
  const outputDir = join(root, 'artifacts', 'project-graph');
  await mkdir(outputDir, { recursive: true });
  await writeFixtureWatchStatus(outputDir, input);
  await writeFixtureAgentContext(outputDir);
  await writeFile(join(outputDir, 'project-intelligence-agent-context.md'), '# Agent Context\n');
  await writeFile(join(outputDir, 'project-intelligence-snapshot.json'), '{}\n');

  return runProjectIntelligenceWatchHandoff({
    root,
    outputDir,
    generatedAt
  });
}

async function writeFixtureWatchStatus(
  outputDir: string,
  input: {
    refreshCount: number;
    status: 'stopped' | 'failed';
    lastSuccessfulCommands?: string[];
  }
): Promise<void> {
  await writeFile(join(outputDir, 'project-intelligence-watch-status.json'), `${JSON.stringify({
    schema: 'repoassure.project-intelligence-watch-status@1',
    generatedAt,
    status: input.status,
    refreshCount: input.refreshCount,
    debounceMs: 25,
    watchedScope: ['docs/', 'packages/'],
    ignoredScope: ['artifacts/', 'node_modules/'],
    lastChangedPaths: ['docs/PLAN.md'],
    lastSuccessfulCommands: input.lastSuccessfulCommands ?? [
      'pnpm project:intelligence',
      'pnpm project:intelligence:agent-context'
    ],
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
    }
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
      prohibitedActions: ['target_repo_write', 'hosted_dashboard']
    },
    readOrder: [
      'project-intelligence-agent-context.json',
      'project-intelligence-snapshot.json',
      '.autopilot/progress/snapshot.json'
    ],
    currentGoal: {
      id: 'project-intelligence-watch-mode-operator-playbook-consumption-validation-v0.1',
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
}

function extractPlaybookReadOrder(playbook: string): string[] {
  const section = playbook.match(/## AI IDE Read Order\n\n(?<body>[\s\S]*?)\n\nThe JSON handoff/u)?.groups?.body;
  if (!section) {
    throw new Error('missing AI IDE Read Order section');
  }

  return section
    .split('\n')
    .map((line) => line.match(/^\d+\. `(?<path>[^`]+)`$/u)?.groups?.path)
    .filter((path): path is string => Boolean(path));
}

function normalizeReadOrder(paths: string[]): string[] {
  return paths.map((path) => path.startsWith('artifacts/project-graph/') ? basename(path) : path);
}

function canUseHandoffForGoalSelection(checklist: Array<{ status: 'passed' | 'failed' }>): boolean {
  return checklist.every((item) => item.status === 'passed');
}
