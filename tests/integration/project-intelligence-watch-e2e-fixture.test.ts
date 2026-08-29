import { access, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  runProjectIntelligenceAgentContext,
  type ProjectIntelligenceAgentContext
} from '../../packages/acceptance/src/run-project-intelligence-agent-context.js';
import {
  runProjectIntelligenceSnapshot,
  type ProjectIntelligenceSnapshot
} from '../../packages/acceptance/src/run-project-intelligence-snapshot.js';
import {
  runProjectIntelligenceWatch,
  type ProjectIntelligenceWatchStatus
} from '../../packages/acceptance/src/run-project-intelligence-watch.js';
import {
  runProjectIntelligenceWatchHandoff,
  type ProjectIntelligenceWatchHandoff
} from '../../packages/acceptance/src/run-project-intelligence-watch-handoff.js';

const generatedAt = {
  snapshot: '2026-07-20T09:00:00.000Z',
  agentContext: '2026-07-20T09:01:00.000Z',
  watch: '2026-07-20T09:02:00.000Z',
  handoff: '2026-07-20T09:03:00.000Z'
};

describe('project intelligence watch end-to-end local fixture', () => {
  it('generates mutually consistent local-only snapshot, agent context, watch status, and AI IDE handoff artifacts', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-watch-e2e-'));
    const outputDir = join(repoRoot, 'artifacts', 'project-graph');
    const statusPath = join(outputDir, 'project-intelligence-watch-status.json');

    await writeFixtureRepo(repoRoot);

    const snapshotResult = await runProjectIntelligenceSnapshot({
      root: repoRoot,
      outputDir,
      generatedAt: generatedAt.snapshot
    });
    const agentContextResult = await runProjectIntelligenceAgentContext({
      root: repoRoot,
      snapshotPath: snapshotResult.snapshotPath,
      outputDir,
      generatedAt: generatedAt.agentContext
    });
    const watchResult = await runProjectIntelligenceWatch({
      root: repoRoot,
      outputDir,
      statusPath,
      once: true,
      generatedAt: generatedAt.watch
    });
    const handoffResult = await runProjectIntelligenceWatchHandoff({
      root: repoRoot,
      outputDir,
      statusPath,
      agentContextPath: agentContextResult.contextPath,
      generatedAt: generatedAt.handoff
    });

    const snapshot = JSON.parse(await readFile(snapshotResult.snapshotPath, 'utf8')) as ProjectIntelligenceSnapshot;
    const agentContext = JSON.parse(await readFile(agentContextResult.contextPath, 'utf8')) as ProjectIntelligenceAgentContext;
    const watchStatus = JSON.parse(await readFile(statusPath, 'utf8')) as ProjectIntelligenceWatchStatus;
    const handoff = JSON.parse(await readFile(handoffResult.handoffPath, 'utf8')) as ProjectIntelligenceWatchHandoff;
    const handoffMarkdown = await readFile(handoffResult.markdownPath, 'utf8');

    await expect(access(snapshotResult.markdownPath)).resolves.toBeUndefined();
    await expect(access(agentContextResult.markdownPath)).resolves.toBeUndefined();
    await expect(access(handoffResult.markdownPath)).resolves.toBeUndefined();

    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.boundary.localOnly).toBe(true);
    expect(snapshot.sourceCoverage.generatedArtifactsIgnored).toBe(true);
    expect(snapshot.sourceCoverage.rootsScanned).toEqual(expect.arrayContaining(['docs', 'packages', 'tests', '.autopilot']));
    expect(JSON.stringify(snapshot)).not.toContain('sk-local-fixture-secret');

    expect(agentContext.schema).toBe('repoassure.project-intelligence-agent-context@1');
    expect(agentContext.currentGoal).toEqual({
      id: 'project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1',
      status: 'ready_to_execute'
    });
    expect(agentContext.evidencePaths).toContain('artifacts/project-graph/project-intelligence-snapshot.json');
    expect(agentContext.boundary.targetRepoWriteAuthorized).toBe(false);

    expect(watchResult.status).toBe('stopped');
    expect(watchStatus.refreshCount).toBe(1);
    expect(watchStatus.lastOutputs).toEqual({
      snapshotPath: 'artifacts/project-graph/project-intelligence-snapshot.json',
      agentContextPath: 'artifacts/project-graph/project-intelligence-agent-context.json'
    });
    expect(watchStatus.lastSuccessfulCommands).toEqual([
      'pnpm project:intelligence',
      'pnpm project:intelligence:agent-context'
    ]);
    expect(watchStatus.boundary.cloudSyncEnabled).toBe(false);
    expect(watchStatus.boundary.targetRepoWriteAuthorized).toBe(false);

    expect(handoff.schema).toBe('repoassure.project-intelligence-watch-handoff@1');
    expect(handoff.readOrder.slice(0, 5)).toEqual([
      'project-intelligence-watch-handoff.json',
      'project-intelligence-watch-status.json',
      'project-intelligence-agent-context.json',
      'project-intelligence-agent-context.md',
      'project-intelligence-snapshot.json'
    ]);
    expect(Object.values(handoff.artifacts).map((artifact) => artifact.status)).toEqual([
      'available',
      'available',
      'available',
      'available',
      'available',
      'available'
    ]);
    expect(handoff.artifacts.snapshot.path).toBe('artifacts/project-graph/project-intelligence-snapshot.json');
    expect(handoff.freshnessChecklist.every((item) => item.status === 'passed')).toBe(true);
    expect(handoff.maintainerReviewBoundary.prohibitedActions).toEqual(expect.arrayContaining([
      'target_repo_write',
      'hosted_dashboard',
      'cloud_sync',
      'telemetry'
    ]));
    expect(handoff.boundary.localOnly).toBe(true);
    expect(handoff.boundary.telemetryEnabled).toBe(false);
    expect(handoff.boundary.cloudSyncEnabled).toBe(false);
    expect(handoffMarkdown).toContain('## AI IDE Read Order');
    expect(handoffMarkdown).toContain('1. `project-intelligence-watch-handoff.json`');
    expect(handoffMarkdown).toContain('Boundary: local-only AI IDE handoff.');
  });
});

async function writeFixtureRepo(repoRoot: string): Promise<void> {
  await Promise.all([
    mkdir(join(repoRoot, 'docs', 'product', 'specs'), { recursive: true }),
    mkdir(join(repoRoot, 'docs', 'architecture', 'specs'), { recursive: true }),
    mkdir(join(repoRoot, 'docs', 'logs'), { recursive: true }),
    mkdir(join(repoRoot, 'packages', 'acceptance', 'src'), { recursive: true }),
    mkdir(join(repoRoot, 'tests', 'unit'), { recursive: true }),
    mkdir(join(repoRoot, '.autopilot', 'progress'), { recursive: true }),
    mkdir(join(repoRoot, '.autopilot', 'goals'), { recursive: true })
  ]);

  await Promise.all([
    writeFile(join(repoRoot, 'docs', 'PRD.md'), '# PRD\n\nProject Intelligence watch validates local artifacts.\n'),
    writeFile(join(repoRoot, 'docs', 'SPEC.md'), '# SPEC\n\nProject Intelligence Watch Mode End-to-End Local Fixture Validation v0.1.\n'),
    writeFile(join(repoRoot, 'docs', 'PLAN.md'), '# PLAN\n\nNext goal: project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1.\n'),
    writeFile(
      join(repoRoot, 'docs', 'product', 'specs', 'project-intelligence-console-spec-v0.1.md'),
      '# Project Intelligence Console Spec v0.1\n\nLocal-only graph artifacts and AI IDE handoff.\n'
    ),
    writeFile(
      join(repoRoot, 'docs', 'architecture', 'specs', 'project-intelligence-console-architecture-v0.1.md'),
      '# Project Intelligence Architecture v0.1\n\nSnapshot, watch status, agent context, and handoff stay local.\n'
    ),
    writeFile(join(repoRoot, 'docs', 'logs', 'dev-log.md'), '# Dev Log\n\nNo hosted dashboard is authorized.\n'),
    writeFile(
      join(repoRoot, 'packages', 'acceptance', 'src', 'project-intelligence-fixture.ts'),
      "export const projectIntelligenceFixture = 'local-only';\n"
    ),
    writeFile(
      join(repoRoot, 'tests', 'unit', 'project-intelligence-fixture.test.ts'),
      "import { expect, it } from 'vitest';\nit('keeps fixture local', () => expect('local').toBe('local'));\n"
    ),
    writeFile(
      join(repoRoot, '.autopilot', 'progress', 'snapshot.json'),
      `${JSON.stringify({
        current_stage: 'Project Intelligence watch E2E fixture validation ready',
        active_goal: {
          id: 'project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1',
          status: 'ready_to_execute'
        },
        next_goal: {
          id: 'project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1',
          status: 'ready_to_execute'
        },
        blocked_actions: ['hosted_dashboard', 'cloud_sync', 'telemetry', 'target_repo_write']
      }, null, 2)}\n`
    ),
    writeFile(
      join(repoRoot, '.autopilot', 'goals', 'index.json'),
      `${JSON.stringify({
        schema: 'project-autopilot/goals-index@1',
        active_goal_id: 'project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1',
        goals: [
          {
            id: 'project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1',
            status: 'ready_to_execute'
          }
        ]
      }, null, 2)}\n`
    ),
    writeFile(
      join(repoRoot, '.autopilot', 'goals', 'project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1.json'),
      `${JSON.stringify({
        schema: 'project-autopilot/goal@1',
        id: 'project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1',
        status: 'ready_to_execute',
        priority: 'P1',
        objective: 'Validate local-only Project Intelligence watch E2E fixture',
        blocked_actions: ['hosted_dashboard', 'cloud_sync', 'telemetry', 'target_repo_write'],
        acceptance: ['snapshot, agent context, watch status, and handoff artifacts are mutually consistent']
      }, null, 2)}\n`
    ),
    writeFile(join(repoRoot, '.autopilot', 'goals', 'secret-fixture.json'), 'sk-local-fixture-secret\n')
  ]);
}
