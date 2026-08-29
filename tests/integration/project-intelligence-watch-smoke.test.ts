import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it } from 'vitest';

import {
  runProjectIntelligenceWatch,
  type ProjectIntelligenceWatchRefreshResult
} from '../../packages/acceptance/src/run-project-intelligence-watch.js';

const generatedAt = '2026-07-19T08:00:00.000Z';

describe('project intelligence watch local smoke', () => {
  it('refreshes project intelligence artifacts for real accepted file changes and stops cleanly on abort', async () => {
    const repoRoot = await mkdtemp(join(tmpdir(), 'repoassure-watch-smoke-'));
    const outputDir = join(repoRoot, 'artifacts', 'project-graph');
    const statusPath = join(outputDir, 'project-intelligence-watch-status.json');
    const snapshotPath = join(outputDir, 'project-intelligence-snapshot.json');
    const agentContextPath = join(outputDir, 'project-intelligence-agent-context.json');
    const abortController = new AbortController();
    const calls: string[][] = [];
    const refreshOrder: string[] = [];
    let readyResolve: (() => void) | undefined;
    const ready = new Promise<void>((resolve) => {
      readyResolve = resolve;
    });

    await Promise.all([
      mkdir(join(repoRoot, 'docs'), { recursive: true }),
      mkdir(join(repoRoot, 'packages', 'acceptance', 'src'), { recursive: true }),
      mkdir(join(repoRoot, '.autopilot', 'progress'), { recursive: true }),
      mkdir(join(repoRoot, '.autopilot', 'cache'), { recursive: true }),
      mkdir(join(repoRoot, '.autopilot', 'secrets'), { recursive: true }),
      mkdir(join(repoRoot, 'artifacts', 'project-graph'), { recursive: true }),
      mkdir(join(repoRoot, 'node_modules', 'pkg'), { recursive: true })
    ]);

    const watchRun = runProjectIntelligenceWatch({
      root: repoRoot,
      outputDir,
      statusPath,
      debounceMs: 25,
      pollIntervalMs: 10,
      generatedAt,
      signal: abortController.signal,
      onReady: () => readyResolve?.(),
      refresh: async (changedPaths): Promise<ProjectIntelligenceWatchRefreshResult> => {
        calls.push(changedPaths);
        refreshOrder.push('snapshot');
        await writeFile(snapshotPath, JSON.stringify({ schema: 'smoke.snapshot', changedPaths }, null, 2));
        refreshOrder.push('agent-context');
        await writeFile(agentContextPath, JSON.stringify({ schema: 'smoke.agent-context', changedPaths }, null, 2));

        return {
          commands: ['pnpm project:intelligence', 'pnpm project:intelligence:agent-context'],
          snapshotPath,
          agentContextPath
        };
      }
    });

    await ready;

    await Promise.all([
      writeFile(join(repoRoot, '.autopilot', 'cache', 'ignored.json'), '{}'),
      writeFile(join(repoRoot, '.autopilot', 'secrets', 'ignored.json'), '{}'),
      writeFile(join(repoRoot, 'artifacts', 'project-graph', 'ignored.json'), '{}'),
      writeFile(join(repoRoot, 'node_modules', 'pkg', 'index.js'), 'export default true;')
    ]);
    await delay(100);
    expect(calls).toHaveLength(0);

    await Promise.all([
      writeFile(join(repoRoot, 'docs', 'PRD.md'), '# PRD\n'),
      writeFile(join(repoRoot, 'packages', 'acceptance', 'src', 'smoke.ts'), 'export const smoke = true;\n'),
      writeFile(join(repoRoot, '.autopilot', 'progress', 'snapshot.json'), '{"status":"changed"}\n')
    ]);

    await eventually(() => {
      expect(calls).toHaveLength(1);
    });

    abortController.abort();
    const result = await watchRun;
    const status = JSON.parse(await readFile(statusPath, 'utf8'));

    expect(calls[0]).toEqual([
      '.autopilot/progress/snapshot.json',
      'docs/PRD.md',
      'packages/acceptance/src/smoke.ts'
    ]);
    expect(refreshOrder).toEqual(['snapshot', 'agent-context']);
    expect(result.status).toBe('stopped');
    expect(result.refreshCount).toBe(1);
    expect(status).toEqual(expect.objectContaining({
      schema: 'repoassure.project-intelligence-watch-status@1',
      generatedAt,
      status: 'stopped',
      refreshCount: 1,
      debounceMs: 25,
      lastSuccessfulCommands: ['pnpm project:intelligence', 'pnpm project:intelligence:agent-context']
    }));
    expect(status.lastOutputs).toEqual({
      snapshotPath: 'artifacts/project-graph/project-intelligence-snapshot.json',
      agentContextPath: 'artifacts/project-graph/project-intelligence-agent-context.json'
    });
    expect(status.boundary).toEqual(expect.objectContaining({
      localOnly: true,
      daemonized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      targetRepoWriteAuthorized: false,
      manualStop: 'Ctrl+C'
    }));
    expect(status.ignoredScope).toContain('.autopilot/secrets/');
    expect(status.lastChangedPaths).not.toContain('.autopilot/secrets/ignored.json');
  });
});

async function delay(milliseconds: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function eventually(assertion: () => void, timeoutMs = 2000): Promise<void> {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      assertion();
      return;
    } catch (error: unknown) {
      lastError = error;
      await delay(20);
    }
  }

  if (lastError) {
    throw lastError;
  }

  assertion();
}
