import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  stat,
  writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  validateWorkspaceRepairSummaryConsumption
} from '../../packages/acceptance/src/workspace-repair-summary-consumption.js';
import {
  runWorkspaceRepairSummary,
  type WorkspaceRepairSummaryStatus
} from '../../packages/acceptance/src/workspace-repair-summary.js';

interface Scenario {
  name: string;
  expectedStatus: WorkspaceRepairSummaryStatus;
  repositories: RepositoryScenario[];
}

interface RepositoryScenario {
  repoSlug: string;
  workspaceRunId: string;
  artifactRunId?: string;
  tasks?: RepairTaskFixture[];
}

interface RepairTaskFixture {
  taskId: string;
  severity: 'P0' | 'P1' | 'P2';
}

const scenarios: Scenario[] = [
  {
    name: 'ready',
    expectedStatus: 'ready',
    repositories: [{
      repoSlug: 'ready-app',
      workspaceRunId: 'run-ready',
      tasks: [{ taskId: 'ready-p1', severity: 'P1' }]
    }]
  },
  {
    name: 'partial',
    expectedStatus: 'partial',
    repositories: [
      {
        repoSlug: 'ready-app',
        workspaceRunId: 'run-ready',
        tasks: [{ taskId: 'ready-p0', severity: 'P0' }]
      },
      {
        repoSlug: 'stale-app',
        workspaceRunId: 'run-stale',
        artifactRunId: 'run-other',
        tasks: [{ taskId: 'stale-p0', severity: 'P0' }]
      }
    ]
  },
  {
    name: 'blocked',
    expectedStatus: 'blocked',
    repositories: [{
      repoSlug: 'missing-app',
      workspaceRunId: 'run-missing'
    }]
  },
  {
    name: 'empty',
    expectedStatus: 'empty',
    repositories: [{
      repoSlug: 'empty-app',
      workspaceRunId: 'run-empty',
      tasks: []
    }]
  }
];

describe('workspace repair summary AI IDE consumption no-write integration', () => {
  it.each(scenarios)(
    'consumes a $name workspace without changing targets or adding outputs',
    async (scenario) => {
      const fixtureRoot = await mkdtemp(
        join(tmpdir(), `repoassure-workspace-consumption-${scenario.name}-`)
      );
      const workspaceDir = join(fixtureRoot, 'workspace');
      const outputDir = join(fixtureRoot, 'summary');
      const workspaceManifestPath = join(workspaceDir, 'manifest.json');
      const manifestRepositories = [];
      const targetRoots: string[] = [];

      for (const repository of scenario.repositories) {
        const repoRoot = join(fixtureRoot, 'targets', repository.repoSlug);
        const runDir = join(
          workspaceDir,
          'repos',
          repository.repoSlug,
          'runs',
          repository.workspaceRunId
        );
        targetRoots.push(repoRoot);
        await writeTargetSource(
          repoRoot,
          'src/index.ts',
          `export const fixture = '${repository.repoSlug}';\n`
        );

        if (repository.tasks !== undefined) {
          await writeRunArtifacts({
            repoRoot,
            runDir,
            runId: repository.artifactRunId ?? repository.workspaceRunId,
            tasks: repository.tasks
          });
        }

        manifestRepositories.push(workspaceRepo(
          repository.repoSlug,
          repoRoot,
          runDir,
          repository.workspaceRunId
        ));
      }

      await mkdir(workspaceDir, { recursive: true });
      await writeFile(workspaceManifestPath, JSON.stringify({
        schemaVersion: 1,
        generatedAt: '2026-07-25T00:00:00.000Z',
        workspaceOutputDir: workspaceDir,
        repos: manifestRepositories
      }, null, 2));
      const targetSnapshots = await Promise.all(targetRoots.map(snapshotTree));

      const summary = await runWorkspaceRepairSummary({
        workspaceManifestPath,
        outputDir,
        generatedAt: '2026-07-25T14:00:00.000Z'
      });
      const outputsBeforeConsumption = await snapshotTree(outputDir);
      const report = await validateWorkspaceRepairSummaryConsumption({
        summaryJsonPath: summary.jsonPath,
        summaryMarkdownPath: summary.markdownPath,
        generatedAt: '2026-07-25T14:01:00.000Z'
      });

      expect(summary.status).toBe(scenario.expectedStatus);
      expect(report.status).toBe('passed');
      expect(report.workspaceStatus).toBe(scenario.expectedStatus);
      expect(await snapshotTree(outputDir)).toEqual(outputsBeforeConsumption);
      expect(await readdir(outputDir)).toEqual([
        'workspace-repair-summary.json',
        'workspace-repair-summary.md'
      ]);
      await Promise.all(targetRoots.map(async (root, index) => {
        expect(await snapshotTree(root)).toEqual(targetSnapshots[index]);
      }));
    }
  );
});

function workspaceRepo(
  repoSlug: string,
  repoRoot: string,
  runDir: string,
  runId: string
) {
  return {
    repoSlug,
    repoRoot,
    latestRunId: runId,
    latestRunDir: runDir,
    latestManifest: join(runDir, 'manifest.json')
  };
}

async function writeTargetSource(
  repoRoot: string,
  path: string,
  content: string
): Promise<void> {
  const target = join(repoRoot, path);
  await mkdir(join(target, '..'), { recursive: true });
  await writeFile(target, content);
}

async function writeRunArtifacts(input: {
  repoRoot: string;
  runDir: string;
  runId: string;
  tasks: RepairTaskFixture[];
}): Promise<void> {
  const taskPackagePath = join(input.runDir, 'repair-task-package.json');
  const repairPlanPath = join(input.runDir, 'repair-plan.json');
  const manifestPath = join(input.runDir, 'manifest.json');
  const summary = {
    totalTasks: input.tasks.length,
    p0: input.tasks.filter((task) => task.severity === 'P0').length,
    p1: input.tasks.filter((task) => task.severity === 'P1').length,
    p2: input.tasks.filter((task) => task.severity === 'P2').length
  };
  const tasks = input.tasks.map((task) => ({
    taskId: task.taskId,
    severity: task.severity,
    title: `Repair ${task.taskId}`,
    objective: `Complete ${task.taskId}`,
    verification: {
      commands: [`pnpm test --filter ${task.taskId}`]
    }
  }));

  await mkdir(input.runDir, { recursive: true });
  await writeFile(taskPackagePath, JSON.stringify({
    schemaVersion: 1,
    generatedAt: '2026-07-25T00:00:00.000Z',
    runId: input.runId,
    repoRoot: input.repoRoot,
    sourceManifest: manifestPath,
    summary,
    tasks
  }, null, 2));
  await writeFile(repairPlanPath, JSON.stringify({
    schemaVersion: 1,
    generatedAt: '2026-07-25T00:00:00.000Z',
    runId: input.runId,
    repoRoot: input.repoRoot,
    sourceManifest: manifestPath,
    summary,
    tasks: []
  }, null, 2));
  await writeFile(manifestPath, JSON.stringify({
    schemaVersion: 1,
    runId: input.runId,
    generatedAt: '2026-07-25T00:00:00.000Z',
    repoRoot: input.repoRoot,
    entrypoints: {
      manifest: manifestPath,
      repairTaskPackage: taskPackagePath,
      repairPlan: repairPlanPath
    }
  }, null, 2));
}

interface TreeSnapshotEntry {
  path: string;
  kind: 'directory' | 'file';
  content?: string;
  mtimeMs: number;
}

async function snapshotTree(root: string): Promise<TreeSnapshotEntry[]> {
  const entries: TreeSnapshotEntry[] = [];

  async function visit(directory: string): Promise<void> {
    const children = await readdir(directory, { withFileTypes: true });
    for (const child of children.sort((left, right) => left.name.localeCompare(right.name))) {
      const path = join(directory, child.name);
      const metadata = await stat(path);
      const base = {
        path: relative(root, path),
        mtimeMs: metadata.mtimeMs
      };

      if (child.isDirectory()) {
        entries.push({ ...base, kind: 'directory' });
        await visit(path);
      } else if (child.isFile()) {
        entries.push({
          ...base,
          kind: 'file',
          content: await readFile(path, 'utf8')
        });
      }
    }
  }

  await visit(root);
  return entries;
}
