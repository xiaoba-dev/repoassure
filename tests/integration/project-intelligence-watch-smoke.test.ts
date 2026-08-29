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

        return {
          commands: ['pnpm project:intelligence'],
          snapshotPath
        };
      }
    });

    await ready;

    await Promise.all([
      writeFile(join(repoRoot, '.autopilot', 'progress', 'snapshot.json'), '{"status":"ignored"}\n'),
      writeFile(join(repoRoot, 'artifacts', 'project-graph', 'ignored.json'), '{}'),
      writeFile(join(repoRoot, 'node_modules', 'pkg', 'index.js'), 'export default true;')
    ]);
    await delay(100);
    expect(calls).toHaveLength(0);

    await Promise.all([
      writeFile(join(repoRoot, 'docs', 'PRD.md'), '# PRD\n'),
      writeFile(join(repoRoot, 'packages', 'acceptance', 'src', 'smoke.ts'), 'export const smoke = true;\n')
    ]);

    await eventually(() => {
      expect(calls).toHaveLength(1);
    });

    abortController.abort();
    const result = await watchRun;
    const status = JSON.parse(await readFile(statusPath, 'utf8'));

    expect(calls[0]).toEqual([
      'docs/PRD.md',
      'packages/acceptance/src/smoke.ts'
    ]);
    expect(refreshOrder).toEqual(['snapshot']);
    expect(result.status).toBe('stopped');
    expect(result.refreshCount).toBe(1);
    expect(status).toEqual(expect.objectContaining({
      schema: 'repoassure.project-intelligence-watch-status@1',
      generatedAt,
      status: 'stopped',
      refreshCount: 1,
      debounceMs: 25,
      lastSuccessfulCommands: ['pnpm project:intelligence']
    }));
    expect(status.lastOutputs).toEqual({
      snapshotPath: 'artifacts/project-graph/project-intelligence-snapshot.json'
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
    /* The goal workspace is git-ignored and is no longer a watched root, so writing
       there must neither trigger a refresh nor appear in the status. */
    expect(status.watchedScope.join(' ')).not.toContain('.autopilot');
    expect(status.lastChangedPaths).not.toContain('.autopilot/progress/snapshot.json');
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
