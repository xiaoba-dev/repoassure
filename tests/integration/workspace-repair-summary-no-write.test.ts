import { mkdir, mkdtemp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

import { expect, it } from 'vitest';

import {
  runWorkspaceRepairSummary
} from '../../packages/acceptance/src/workspace-repair-summary.js';

it('generates a deterministic multi-repo summary without changing either target repository', async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-summary-integration-'));
  const workspaceDir = join(fixtureRoot, 'workspace');
  const outputDir = join(fixtureRoot, 'summary');
  const alphaRepo = join(fixtureRoot, 'targets', 'alpha-app');
  const betaRepo = join(fixtureRoot, 'targets', 'beta-service');
  const alphaRun = join(workspaceDir, 'repos', 'alpha-app-a1', 'runs', 'run-alpha');
  const betaRun = join(workspaceDir, 'repos', 'beta-service-b2', 'runs', 'run-beta');
  const workspaceManifestPath = join(workspaceDir, 'manifest.json');

  await writeTargetSource(alphaRepo, 'src/auth/password.js', 'export const algorithm = "sha1";\n');
  await writeTargetSource(betaRepo, 'src/forms/submit.ts', 'export const submit = () => false;\n');
  await writeRunArtifacts({
    repoRoot: alphaRepo,
    runDir: alphaRun,
    runId: 'run-alpha',
    taskId: 'replace-sha1',
    severity: 'P0',
    title: 'Replace weak hash',
    objective: 'Replace SHA-1 without exposing API_KEY=integration-secret'
  });
  await writeRunArtifacts({
    repoRoot: betaRepo,
    runDir: betaRun,
    runId: 'run-beta',
    taskId: 'restore-submit',
    severity: 'P1',
    title: 'Restore form submission',
    objective: 'Make the submit control observable'
  });
  await mkdir(workspaceDir, { recursive: true });
  await writeFile(workspaceManifestPath, JSON.stringify({
    schemaVersion: 1,
    generatedAt: '2026-07-25T00:00:00.000Z',
    workspaceOutputDir: workspaceDir,
    repos: [
      workspaceRepo('beta-service-b2', betaRepo, betaRun, 'run-beta'),
      workspaceRepo('alpha-app-a1', alphaRepo, alphaRun, 'run-alpha')
    ]
  }, null, 2));

  const beforeAlpha = await snapshotTree(alphaRepo);
  const beforeBeta = await snapshotTree(betaRepo);
  const input = {
    workspaceManifestPath,
    outputDir,
    generatedAt: '2026-07-25T08:00:00.000Z'
  };

  const first = await runWorkspaceRepairSummary(input);
  const firstJson = await readFile(first.jsonPath, 'utf8');
  const firstMarkdown = await readFile(first.markdownPath, 'utf8');
  const second = await runWorkspaceRepairSummary(input);

  expect(await readFile(second.jsonPath, 'utf8')).toBe(firstJson);
  expect(await readFile(second.markdownPath, 'utf8')).toBe(firstMarkdown);
  expect(await snapshotTree(alphaRepo)).toEqual(beforeAlpha);
  expect(await snapshotTree(betaRepo)).toEqual(beforeBeta);
  expect(firstJson).not.toContain('integration-secret');
  expect(firstJson).toContain('[REDACTED]');
  expect(firstMarkdown).not.toContain(alphaRepo);
  expect(firstMarkdown).not.toContain(betaRepo);
  expect(JSON.parse(firstJson)).toMatchObject({
    status: 'ready',
    noWriteProof: {
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      commandsExecuted: false,
      patchesApplied: false,
      outputPaths: [
        join(outputDir, 'workspace-repair-summary.json'),
        join(outputDir, 'workspace-repair-summary.md')
      ]
    }
  });
  await expect(readdir(outputDir)).resolves.toEqual([
    'workspace-repair-summary.json',
    'workspace-repair-summary.md'
  ]);
});

function workspaceRepo(repoSlug: string, repoRoot: string, runDir: string, runId: string) {
  return {
    repoSlug,
    repoRoot,
    latestRunId: runId,
    latestRunDir: runDir,
    latestManifest: join(runDir, 'manifest.json')
  };
}

async function writeTargetSource(repoRoot: string, path: string, content: string): Promise<void> {
  const target = join(repoRoot, path);
  await mkdir(join(target, '..'), { recursive: true });
  await writeFile(target, content);
}

async function writeRunArtifacts(input: {
  repoRoot: string;
  runDir: string;
  runId: string;
  taskId: string;
  severity: 'P0' | 'P1' | 'P2';
  title: string;
  objective: string;
}): Promise<void> {
  const taskPackagePath = join(input.runDir, 'repair-task-package.json');
  const repairPlanPath = join(input.runDir, 'repair-plan.json');
  const manifestPath = join(input.runDir, 'manifest.json');
  const summary = {
    totalTasks: 1,
    p0: input.severity === 'P0' ? 1 : 0,
    p1: input.severity === 'P1' ? 1 : 0,
    p2: input.severity === 'P2' ? 1 : 0
  };
  const task = {
    taskId: input.taskId,
    severity: input.severity,
    status: 'todo',
    title: input.title,
    objective: input.objective,
    context: {
      findingIds: [`finding-${input.taskId}`],
      evidence: [],
      targetAreas: [],
      rootCauseHypothesis: 'Integration fixture'
    },
    recommendedFix: {
      repairIntent: input.objective,
      expectedOutcome: input.title,
      changeScope: { include: ['src'], exclude: ['deployment'] },
      implementationSteps: ['Review evidence', 'Prepare a bounded change']
    },
    verification: {
      commands: [`pnpm test --filter ${input.taskId}`],
      generatedTests: [],
      acceptanceCriteria: [`${input.title} is verified`]
    },
    handoffPrompt: input.objective
  };

  await mkdir(input.runDir, { recursive: true });
  await writeFile(taskPackagePath, JSON.stringify({
    schemaVersion: 1,
    generatedAt: '2026-07-25T00:00:00.000Z',
    runId: input.runId,
    repoRoot: input.repoRoot,
    sourceManifest: manifestPath,
    summary,
    tasks: [task]
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
