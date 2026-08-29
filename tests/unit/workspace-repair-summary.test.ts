import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  runWorkspaceRepairSummary
} from '../../packages/acceptance/src/workspace-repair-summary.js';

describe('workspace repair summary', () => {
  it('generates a deterministic cross-repository repair queue and human review artifact', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-summary-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const alphaRepo = join(fixtureRoot, 'repos', 'alpha');
    const betaRepo = join(fixtureRoot, 'repos', 'beta');
    const alphaRun = join(workspaceDir, 'repos', 'alpha-11111111', 'runs', 'run-alpha');
    const betaRun = join(workspaceDir, 'repos', 'beta-22222222', 'runs', 'run-beta');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot: alphaRepo,
      runDir: alphaRun,
      runId: 'run-alpha',
      tasks: [
        repairTask('alpha-p2', 'P2', 'Update docs', 'Document token=alpha-secret'),
        repairTask('alpha-p0', 'P0', 'Fix authentication', 'Replace API_KEY=alpha-secret')
      ]
    });
    await writeRepositoryArtifacts({
      repoRoot: betaRepo,
      runDir: betaRun,
      runId: 'run-beta',
      tasks: [
        repairTask('beta-p1', 'P1', 'Repair form', 'Restore form submission')
      ]
    });
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('beta-22222222', betaRepo, betaRun, 'run-beta'),
        workspaceRepo('alpha-11111111', alphaRepo, alphaRun, 'run-alpha')
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T01:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      schema: string;
      status: string;
      summary: Record<string, number | boolean>;
      agentContract: { readOrder: string[] };
      repositories: Array<Record<string, unknown>>;
      crossRepoActionQueue: Array<Record<string, unknown>>;
      noWriteProof: Record<string, unknown>;
    };
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result).toMatchObject({
      jsonPath: join(outputDir, 'workspace-repair-summary.json'),
      markdownPath: join(outputDir, 'workspace-repair-summary.md'),
      status: 'ready',
      repositoryCount: 2,
      taskCount: 3
    });
    expect(summary.schema).toBe('repoassure.workspace-repair-summary.v1');
    expect(summary.summary).toMatchObject({
      totalRepositories: 2,
      readyRepositories: 2,
      blockedRepositories: 0,
      noTaskRepositories: 0,
      totalTasks: 3,
      p0: 1,
      p1: 1,
      p2: 1,
      requiresMaintainerReview: true
    });
    expect(summary.agentContract.readOrder).toEqual([
      'workspace-repair-summary.json',
      'maintainerReview',
      'diagnostics',
      'repositories',
      'crossRepoActionQueue',
      'selectedRepository.latestManifest',
      'selectedRepository.repair-task-package.json',
      'selectedRepository.repair-plan.json',
      'workspace-repair-summary.md'
    ]);
    expect(summary.crossRepoActionQueue.map((task) => task.workspaceTaskId)).toEqual([
      'alpha-11111111:alpha-p0',
      'beta-22222222:beta-p1',
      'alpha-11111111:alpha-p2'
    ]);
    expect(summary.repositories.map((repo) => [repo.repoSlug, repo.state, repo.rank])).toEqual([
      ['alpha-11111111', 'ready', 1],
      ['beta-22222222', 'ready', 2]
    ]);
    expect(JSON.stringify(summary)).not.toContain('alpha-secret');
    expect(JSON.stringify(summary)).toContain('[REDACTED]');
    expect(summary.noWriteProof).toMatchObject({
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      commandsExecuted: false,
      patchesApplied: false
    });
    expect(markdown).toContain('# Workspace Repair Summary');
    expect(markdown).toContain('alpha-11111111:alpha-p0');
    expect(markdown).toContain('Maintainer Review Required');
    expect(markdown).not.toContain(alphaRepo);
    expect(markdown).not.toContain(betaRepo);
  });

  it('keeps stale, missing, and invalid repositories visible in a partial summary', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-partial-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const readyRepo = join(fixtureRoot, 'repos', 'ready');
    const staleRepo = join(fixtureRoot, 'repos', 'stale');
    const missingRepo = join(fixtureRoot, 'repos', 'missing');
    const invalidRepo = join(fixtureRoot, 'repos', 'invalid');
    const readyRun = join(workspaceDir, 'repos', 'ready-11111111', 'runs', 'run-ready');
    const staleRun = join(workspaceDir, 'repos', 'stale-22222222', 'runs', 'run-stale');
    const missingRun = join(workspaceDir, 'repos', 'missing-33333333', 'runs', 'run-missing');
    const invalidRun = join(workspaceDir, 'repos', 'invalid-44444444', 'runs', 'run-invalid');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot: readyRepo,
      runDir: readyRun,
      runId: 'run-ready',
      tasks: [repairTask('ready-p1', 'P1', 'Repair ready repo', 'Repair ready repo')]
    });
    await writeRepositoryArtifacts({
      repoRoot: staleRepo,
      runDir: staleRun,
      runId: 'run-other',
      tasks: [repairTask('stale-p0', 'P0', 'Do not queue stale', 'Do not queue stale')]
    });
    await mkdir(invalidRun, { recursive: true });
    await writeFile(join(invalidRun, 'manifest.json'), '{not-json');
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('stale-22222222', staleRepo, staleRun, 'run-stale'),
        workspaceRepo('missing-33333333', missingRepo, missingRun, 'run-missing'),
        workspaceRepo('ready-11111111', readyRepo, readyRun, 'run-ready'),
        workspaceRepo('invalid-44444444', invalidRepo, invalidRun, 'run-invalid')
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T02:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      status: string;
      summary: { requiresMaintainerReview: boolean };
      repositories: Array<{ repoSlug: string; state: string; rank: number | null }>;
      crossRepoActionQueue: Array<{ workspaceTaskId: string }>;
      diagnostics: Array<{ repoSlug: string; code: string }>;
      maintainerReview: { required: boolean };
    };
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.status).toBe('partial');
    expect(summary.repositories.map((repo) => [repo.repoSlug, repo.state, repo.rank])).toEqual([
      ['ready-11111111', 'ready', 1],
      ['invalid-44444444', 'invalid_artifacts', null],
      ['missing-33333333', 'missing_artifacts', null],
      ['stale-22222222', 'stale', null]
    ]);
    expect(summary.crossRepoActionQueue).toEqual([
      expect.objectContaining({ workspaceTaskId: 'ready-11111111:ready-p1' })
    ]);
    expect(summary.diagnostics.map((diagnostic) => [diagnostic.repoSlug, diagnostic.code])).toEqual([
      ['invalid-44444444', 'invalid_latest_manifest'],
      ['missing-33333333', 'missing_latest_manifest'],
      ['stale-22222222', 'stale_run_id']
    ]);
    expect(summary.summary.requiresMaintainerReview).toBe(true);
    expect(summary.maintainerReview.required).toBe(true);
    expect(markdown).toContain('## Diagnostics');
    expect(markdown).toContain('invalid-44444444');
    expect(markdown).toContain('invalid_latest_manifest');
    expect(markdown).not.toContain(readyRepo);
    expect(markdown).not.toContain(staleRepo);
  });

  it('blocks every repository affected by a workspace identity collision', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-collision-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const alphaRepo = join(fixtureRoot, 'repos', 'alpha');
    const betaRepo = join(fixtureRoot, 'repos', 'beta');
    const alphaRun = join(workspaceDir, 'runs', 'alpha');
    const betaRun = join(workspaceDir, 'runs', 'beta');
    const aliasRun = join(workspaceDir, 'runs', 'alias');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot: alphaRepo,
      runDir: alphaRun,
      runId: 'run-alpha',
      tasks: [repairTask('alpha-p0', 'P0', 'Alpha task', 'Alpha task')]
    });
    await writeRepositoryArtifacts({
      repoRoot: betaRepo,
      runDir: betaRun,
      runId: 'run-beta',
      tasks: [repairTask('beta-p1', 'P1', 'Beta task', 'Beta task')]
    });
    await writeRepositoryArtifacts({
      repoRoot: alphaRepo,
      runDir: aliasRun,
      runId: 'run-alias',
      tasks: [repairTask('alias-p2', 'P2', 'Alias task', 'Alias task')]
    });
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('shared-slug', alphaRepo, alphaRun, 'run-alpha'),
        workspaceRepo('shared-slug', betaRepo, betaRun, 'run-beta'),
        workspaceRepo('alpha-alias', alphaRepo, aliasRun, 'run-alias')
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T03:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      status: string;
      summary: { requiresMaintainerReview: boolean };
      repositories: Array<{ repoSlug: string; state: string }>;
      crossRepoActionQueue: unknown[];
      diagnostics: Array<{ repoSlug: string; code: string }>;
      maintainerReview: { required: boolean };
    };

    expect(result.status).toBe('blocked');
    expect(summary.repositories).toHaveLength(3);
    expect(summary.repositories.every((repo) => repo.state === 'identity_collision')).toBe(true);
    expect(summary.crossRepoActionQueue).toEqual([]);
    expect(summary.diagnostics).toEqual([
      expect.objectContaining({ repoSlug: 'alpha-alias', code: 'identity_collision' }),
      expect.objectContaining({ repoSlug: 'shared-slug', code: 'identity_collision' }),
      expect.objectContaining({ repoSlug: 'shared-slug', code: 'identity_collision' })
    ]);
    expect(summary.summary.requiresMaintainerReview).toBe(true);
    expect(summary.maintainerReview.required).toBe(true);
  });

  it('preserves an invalid repository entry while continuing valid repository work', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-invalid-entry-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const validRepo = join(fixtureRoot, 'repos', 'valid');
    const validRun = join(workspaceDir, 'runs', 'valid');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot: validRepo,
      runDir: validRun,
      runId: 'run-valid',
      tasks: [repairTask('valid-p1', 'P1', 'Valid task', 'Valid task')]
    });
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('valid-11111111', validRepo, validRun, 'run-valid'),
        {
          repoSlug: 'invalid-entry',
          repoRoot: join(fixtureRoot, 'repos', 'invalid')
        }
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T04:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      repositories: Array<{ repoSlug: string; state: string }>;
      diagnostics: Array<{ repoSlug: string; code: string }>;
    };

    expect(result.status).toBe('partial');
    expect(summary.repositories).toEqual([
      expect.objectContaining({ repoSlug: 'valid-11111111', state: 'ready' }),
      expect.objectContaining({ repoSlug: 'invalid-entry', state: 'invalid_artifacts' })
    ]);
    expect(summary.diagnostics).toContainEqual(
      expect.objectContaining({
        repoSlug: 'invalid-entry',
        code: 'invalid_workspace_repository'
      })
    );
  });

  it('blocks a repository whose task package would create duplicate workspace task ids', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-duplicate-task-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const repoRoot = join(fixtureRoot, 'repos', 'duplicate');
    const runDir = join(workspaceDir, 'runs', 'duplicate');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot,
      runDir,
      runId: 'run-duplicate',
      tasks: [
        repairTask('same-task', 'P0', 'First duplicate', 'First duplicate'),
        repairTask('same-task', 'P1', 'Second duplicate', 'Second duplicate')
      ]
    });
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('duplicate-11111111', repoRoot, runDir, 'run-duplicate')
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T05:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      repositories: Array<{ state: string }>;
      crossRepoActionQueue: unknown[];
      diagnostics: Array<{ code: string }>;
    };

    expect(result.status).toBe('blocked');
    expect(summary.repositories[0]?.state).toBe('invalid_artifacts');
    expect(summary.crossRepoActionQueue).toEqual([]);
    expect(summary.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'duplicate_workspace_task_id' })
    );
  });

  it('marks a valid no-task workspace as empty', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-empty-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const repoRoot = join(fixtureRoot, 'repos', 'empty');
    const runDir = join(workspaceDir, 'runs', 'empty');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot,
      runDir,
      runId: 'run-empty',
      tasks: []
    });
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('empty-11111111', repoRoot, runDir, 'run-empty')
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T06:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      summary: { noTaskRepositories: number; requiresMaintainerReview: boolean };
      repositories: Array<{ state: string }>;
      crossRepoActionQueue: unknown[];
    };

    expect(result.status).toBe('empty');
    expect(result.taskCount).toBe(0);
    expect(summary.repositories[0]?.state).toBe('no_tasks');
    expect(summary.summary).toMatchObject({
      noTaskRepositories: 1,
      requiresMaintainerReview: false
    });
    expect(summary.crossRepoActionQueue).toEqual([]);
  });

  it('rejects an output directory inside a target repository before writing artifacts', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-output-boundary-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const repoRoot = join(fixtureRoot, 'repos', 'target');
    const runDir = join(workspaceDir, 'runs', 'target');
    const outputDir = join(repoRoot, '.repoassure-summary');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot,
      runDir,
      runId: 'run-target',
      tasks: [repairTask('target-p1', 'P1', 'Target task', 'Target task')]
    });
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('target-11111111', repoRoot, runDir, 'run-target')
      ]
    }, null, 2));

    await expect(runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T07:00:00.000Z'
    })).rejects.toThrow('Workspace summary output must be outside target repository');
    await expect(stat(outputDir)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('blocks repair artifact entrypoints that escape the latest run directory', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-artifact-boundary-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const repoRoot = join(fixtureRoot, 'repos', 'target');
    const runDir = join(workspaceDir, 'runs', 'target');
    const externalDir = join(workspaceDir, 'external');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot,
      runDir,
      runId: 'run-target',
      tasks: [repairTask('target-p0', 'P0', 'Escaped task', 'Escaped task')]
    });
    await mkdir(externalDir, { recursive: true });
    const externalTaskPackage = join(externalDir, 'repair-task-package.json');
    const externalRepairPlan = join(externalDir, 'repair-plan.json');
    await writeFile(externalTaskPackage, await readFile(join(runDir, 'repair-task-package.json')));
    await writeFile(externalRepairPlan, await readFile(join(runDir, 'repair-plan.json')));
    await writeFile(join(runDir, 'manifest.json'), JSON.stringify({
      schemaVersion: 1,
      runId: 'run-target',
      generatedAt: '2026-07-25T00:00:00.000Z',
      repoRoot,
      entrypoints: {
        manifest: join(runDir, 'manifest.json'),
        repairTaskPackage: externalTaskPackage,
        repairPlan: externalRepairPlan
      }
    }, null, 2));
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('target-11111111', repoRoot, runDir, 'run-target')
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T09:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      repositories: Array<{ state: string }>;
      crossRepoActionQueue: unknown[];
      diagnostics: Array<{ code: string }>;
    };

    expect(result.status).toBe('blocked');
    expect(summary.repositories[0]?.state).toBe('invalid_artifacts');
    expect(summary.crossRepoActionQueue).toEqual([]);
    expect(summary.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'artifact_outside_latest_run' })
    );
  });

  it('rejects an invalid workspace manifest before writing artifacts', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-invalid-manifest-'));
    const workspaceManifestPath = join(fixtureRoot, 'manifest.json');
    const outputDir = join(fixtureRoot, 'summary');

    await writeFile(workspaceManifestPath, '{not-json');

    await expect(runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T10:00:00.000Z'
    })).rejects.toThrow('Invalid workspace manifest');
    await expect(stat(outputDir)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('blocks a structurally invalid repair plan', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-invalid-plan-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const repoRoot = join(fixtureRoot, 'repos', 'invalid-plan');
    const runDir = join(workspaceDir, 'runs', 'invalid-plan');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot,
      runDir,
      runId: 'run-invalid-plan',
      tasks: [repairTask('invalid-plan-p1', 'P1', 'Invalid plan task', 'Invalid plan task')]
    });
    await writeFile(join(runDir, 'repair-plan.json'), JSON.stringify({ schemaVersion: 1 }, null, 2));
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('invalid-plan-11111111', repoRoot, runDir, 'run-invalid-plan')
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T11:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      repositories: Array<{ state: string }>;
      diagnostics: Array<{ code: string }>;
    };

    expect(result.status).toBe('blocked');
    expect(summary.repositories[0]?.state).toBe('invalid_artifacts');
    expect(summary.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'invalid_repair_artifacts' })
    );
  });

  it('marks a repair plan with mismatched identity as stale', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'repoassure-workspace-stale-plan-'));
    const workspaceDir = join(fixtureRoot, 'workspace');
    const outputDir = join(fixtureRoot, 'summary');
    const repoRoot = join(fixtureRoot, 'repos', 'stale-plan');
    const runDir = join(workspaceDir, 'runs', 'stale-plan');
    const workspaceManifestPath = join(workspaceDir, 'manifest.json');

    await writeRepositoryArtifacts({
      repoRoot,
      runDir,
      runId: 'run-stale-plan',
      tasks: [repairTask('stale-plan-p0', 'P0', 'Stale plan task', 'Stale plan task')]
    });
    const repairPlan = JSON.parse(await readFile(join(runDir, 'repair-plan.json'), 'utf8')) as {
      runId: string;
    };
    repairPlan.runId = 'run-other';
    await writeFile(join(runDir, 'repair-plan.json'), JSON.stringify(repairPlan, null, 2));
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(workspaceManifestPath, JSON.stringify({
      schemaVersion: 1,
      generatedAt: '2026-07-25T00:00:00.000Z',
      workspaceOutputDir: workspaceDir,
      repos: [
        workspaceRepo('stale-plan-11111111', repoRoot, runDir, 'run-stale-plan')
      ]
    }, null, 2));

    const result = await runWorkspaceRepairSummary({
      workspaceManifestPath,
      outputDir,
      generatedAt: '2026-07-25T12:00:00.000Z'
    });
    const summary = JSON.parse(await readFile(result.jsonPath, 'utf8')) as {
      repositories: Array<{ state: string }>;
      diagnostics: Array<{ code: string }>;
    };

    expect(result.status).toBe('blocked');
    expect(summary.repositories[0]?.state).toBe('stale');
    expect(summary.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'stale_repair_plan' })
    );
  });
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

async function writeRepositoryArtifacts(input: {
  repoRoot: string;
  runDir: string;
  runId: string;
  tasks: ReturnType<typeof repairTask>[];
}): Promise<void> {
  await mkdir(input.runDir, { recursive: true });
  const taskPackagePath = join(input.runDir, 'repair-task-package.json');
  const repairPlanPath = join(input.runDir, 'repair-plan.json');
  const summary = {
    totalTasks: input.tasks.length,
    p0: input.tasks.filter((task) => task.severity === 'P0').length,
    p1: input.tasks.filter((task) => task.severity === 'P1').length,
    p2: input.tasks.filter((task) => task.severity === 'P2').length
  };

  await writeFile(taskPackagePath, JSON.stringify({
    schemaVersion: 1,
    generatedAt: '2026-07-25T00:00:00.000Z',
    runId: input.runId,
    repoRoot: input.repoRoot,
    sourceManifest: join(input.runDir, 'manifest.json'),
    summary,
    tasks: input.tasks
  }, null, 2));
  await writeFile(repairPlanPath, JSON.stringify({
    schemaVersion: 1,
    generatedAt: '2026-07-25T00:00:00.000Z',
    runId: input.runId,
    repoRoot: input.repoRoot,
    sourceManifest: join(input.runDir, 'manifest.json'),
    summary,
    tasks: []
  }, null, 2));
  await writeFile(join(input.runDir, 'manifest.json'), JSON.stringify({
    schemaVersion: 1,
    runId: input.runId,
    generatedAt: '2026-07-25T00:00:00.000Z',
    repoRoot: input.repoRoot,
    entrypoints: {
      manifest: join(input.runDir, 'manifest.json'),
      repairTaskPackage: taskPackagePath,
      repairPlan: repairPlanPath
    }
  }, null, 2));
}

function repairTask(taskId: string, severity: 'P0' | 'P1' | 'P2', title: string, objective: string) {
  return {
    taskId,
    severity,
    status: 'todo',
    title,
    objective,
    context: {
      findingIds: [`finding-${taskId}`],
      evidence: [],
      targetAreas: [],
      rootCauseHypothesis: 'Fixture hypothesis'
    },
    recommendedFix: {
      repairIntent: objective,
      expectedOutcome: title,
      changeScope: {
        include: ['src'],
        exclude: ['deployment']
      },
      implementationSteps: ['Review', 'Repair']
    },
    verification: {
      commands: [`pnpm test --filter ${taskId}`],
      generatedTests: [],
      acceptanceCriteria: [`${title} is verified`]
    },
    handoffPrompt: objective
  };
}
