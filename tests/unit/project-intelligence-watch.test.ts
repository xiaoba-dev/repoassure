import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it } from 'vitest';

import {
  createProjectIntelligenceWatchController,
  parseProjectIntelligenceWatchArgs,
  runProjectIntelligenceWatch,
  shouldRefreshProjectIntelligencePath,
  type ProjectIntelligenceWatchRefreshResult
} from '../../packages/acceptance/src/run-project-intelligence-watch.js';

const generatedAt = '2026-07-19T00:00:00.000Z';

describe('project intelligence watch mode', () => {
  it('watches bounded source and governance files while ignoring generated, dependency, cache, and secret paths', () => {
    expect(shouldRefreshProjectIntelligencePath('docs/PRD.md')).toBe(true);
    expect(shouldRefreshProjectIntelligencePath('docs/product/specs/project-intelligence-console-spec-v0.1.md')).toBe(true);
    expect(shouldRefreshProjectIntelligencePath('src/adapters/cli/index.ts')).toBe(true);
    expect(shouldRefreshProjectIntelligencePath('packages/acceptance/src/run-project-intelligence-watch.ts')).toBe(true);
    expect(shouldRefreshProjectIntelligencePath('apps/website/src/App.tsx')).toBe(true);
    expect(shouldRefreshProjectIntelligencePath('tests/unit/project-intelligence-watch.test.ts')).toBe(true);
    expect(shouldRefreshProjectIntelligencePath('.autopilot/progress/snapshot.json')).toBe(true);
    expect(shouldRefreshProjectIntelligencePath('.autopilot/goals/example.md')).toBe(true);

    expect(shouldRefreshProjectIntelligencePath('artifacts/project-graph/project-intelligence-snapshot.json')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('.hardening/latest/manifest.json')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('dist/index.js')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('packages/acceptance/dist/index.js')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('apps/website/dist/index.html')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('node_modules/vitest/index.js')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('.git/config')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('.autopilot/runs/last.json')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('.autopilot/cache/project.json')).toBe(false);
    expect(shouldRefreshProjectIntelligencePath('.autopilot/secrets/local.json')).toBe(false);
  });

  it('parses safe local CLI options and rejects hosted or target-repo write switches', () => {
    expect(parseProjectIntelligenceWatchArgs([
      '--root',
      '.',
      '--output',
      'artifacts/project-graph',
      '--status',
      'artifacts/project-graph/project-intelligence-watch-status.json',
      '--debounce-ms',
      '25',
      '--once'
    ])).toEqual(expect.objectContaining({
      debounceMs: 25,
      once: true
    }));

    expect(() => parseProjectIntelligenceWatchArgs(['--hosted-dashboard'])).toThrow(/Unknown project intelligence watch option/u);
    expect(() => parseProjectIntelligenceWatchArgs(['--target-repo-write'])).toThrow(/Unknown project intelligence watch option/u);
    expect(() => parseProjectIntelligenceWatchArgs(['--debounce-ms', '0'])).toThrow(/positive integer/u);
  });

  it('runs one local refresh and writes a sanitized status artifact', async () => {
    const root = await mkdtemp(join(tmpdir(), 'project-intelligence-watch-once-'));
    const outputDir = join(root, 'artifacts', 'project-graph');
    const statusPath = join(outputDir, 'project-intelligence-watch-status.json');
    await mkdir(outputDir, { recursive: true });

    const result = await runProjectIntelligenceWatch({
      root,
      outputDir,
      statusPath,
      once: true,
      generatedAt,
      refresh: async (): Promise<ProjectIntelligenceWatchRefreshResult> => ({
        commands: ['pnpm project:intelligence', 'pnpm project:intelligence:agent-context'],
        snapshotPath: join(outputDir, 'project-intelligence-snapshot.json'),
        agentContextPath: join(outputDir, 'project-intelligence-agent-context.json')
      })
    });

    const rawStatus = await readFile(statusPath, 'utf8');
    const status = JSON.parse(rawStatus);

    expect(result.statusPath).toBe(statusPath);
    expect(status).toEqual(expect.objectContaining({
      schema: 'repoassure.project-intelligence-watch-status@1',
      generatedAt,
      status: 'stopped',
      refreshCount: 1,
      debounceMs: 1500,
      lastSuccessfulCommands: ['pnpm project:intelligence', 'pnpm project:intelligence:agent-context']
    }));
    expect(status.boundary).toEqual(expect.objectContaining({
      localOnly: true,
      daemonized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      targetRepoWriteAuthorized: false,
      manualStop: 'Ctrl+C'
    }));
    expect(rawStatus).not.toContain('secret-token');
  });

  it('records sanitized failures without deleting the last good artifact contract', async () => {
    const root = await mkdtemp(join(tmpdir(), 'project-intelligence-watch-failed-'));
    const outputDir = join(root, 'artifacts', 'project-graph');
    const statusPath = join(outputDir, 'project-intelligence-watch-status.json');
    await mkdir(outputDir, { recursive: true });

    await expect(runProjectIntelligenceWatch({
      root,
      outputDir,
      statusPath,
      once: true,
      generatedAt,
      refresh: async () => {
        throw new Error('failed with ghp_SECRET_TOKEN_1234567890ABCDEF1234567890abcdef');
      }
    })).rejects.toThrow(/failed with/u);

    const rawStatus = await readFile(statusPath, 'utf8');
    const status = JSON.parse(rawStatus);

    expect(status.status).toBe('failed');
    expect(status.refreshCount).toBe(0);
    expect(status.lastFailure.summary).toContain('[REDACTED]');
    expect(rawStatus).not.toContain('ghp_SECRET_TOKEN');
    expect(status.boundary.localOnly).toBe(true);
  });

  it('coalesces burst changes through debounce and ignores out-of-scope files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'project-intelligence-watch-debounce-'));
    const outputDir = join(root, 'artifacts', 'project-graph');
    const calls: string[][] = [];
    const controller = createProjectIntelligenceWatchController({
      root,
      outputDir,
      debounceMs: 5,
      generatedAt,
      refresh: async (changedPaths): Promise<ProjectIntelligenceWatchRefreshResult> => {
        calls.push(changedPaths);
        return {
          commands: ['pnpm project:intelligence', 'pnpm project:intelligence:agent-context'],
          snapshotPath: join(outputDir, 'project-intelligence-snapshot.json'),
          agentContextPath: join(outputDir, 'project-intelligence-agent-context.json')
        };
      }
    });

    controller.notifyChange('node_modules/pkg/index.js');
    controller.notifyChange('docs/PRD.md');
    controller.notifyChange('packages/acceptance/src/run-project-intelligence-watch.ts');
    await controller.waitForIdle();

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([
      'docs/PRD.md',
      'packages/acceptance/src/run-project-intelligence-watch.ts'
    ]);
    expect(controller.getStatus().refreshCount).toBe(1);
  });
});
