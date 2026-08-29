import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  formatWorkspaceRepairSummaryMarkdown,
  type WorkspaceRepairSummaryArtifact
} from '../../packages/acceptance/src/workspace-repair-summary.js';
import {
  validateWorkspaceRepairSummaryConsumption
} from '../../packages/acceptance/src/workspace-repair-summary-consumption.js';

describe('workspace repair summary AI IDE consumption', () => {
  it('reads a ready summary JSON-first without treating queue rank as authorization', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-workspace-consumption-ready-'));
    const artifact = workspaceSummaryArtifact();
    const jsonPath = join(root, 'workspace-repair-summary.json');
    const markdownPath = join(root, 'workspace-repair-summary.md');

    await writeFile(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
    await writeFile(markdownPath, formatWorkspaceRepairSummaryMarkdown(artifact));

    const report = await validateWorkspaceRepairSummaryConsumption({
      summaryJsonPath: jsonPath,
      summaryMarkdownPath: markdownPath,
      generatedAt: '2026-07-25T13:00:00.000Z'
    });

    expect(report).toMatchObject({
      schema: 'repoassure.workspace-repair-summary-consumption-validation@1',
      generatedAt: '2026-07-25T13:00:00.000Z',
      status: 'passed',
      workspaceStatus: 'ready',
      selection: {
        recommendedWorkspaceTaskId: 'alpha-11111111:alpha-p0',
        selectableWorkspaceTaskIds: [
          'alpha-11111111:alpha-p0',
          'beta-22222222:beta-p1'
        ],
        blockedRepositorySlugs: [],
        queueRankAuthorizesExecution: false,
        nextAction: 'maintainer_review',
        haltRequired: false
      },
      maintainerReview: {
        required: true,
        allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk']
      },
      diagnostics: {
        total: 0,
        repositorySlugs: [],
        codes: []
      },
      boundary: {
        localOnly: true,
        targetRepoWrites: false,
        commandsExecuted: false,
        patchesApplied: false
      }
    });
    expect(report.readOrder[0]).toBe(jsonPath);
    expect(report.readOrder.at(-1)).toBe(markdownPath);
    expect(report.checks.every((check) => check.status === 'passed')).toBe(true);
    expect(JSON.stringify(report)).not.toContain('/private/fixtures/repos/alpha');
    expect(JSON.stringify(report)).not.toContain('/private/fixtures/repos/beta');
  });

  it('selects only ready-repository tasks from a partial workspace', async () => {
    const artifact = workspaceSummaryArtifact();
    artifact.status = 'partial';
    artifact.summary.readyRepositories = 1;
    artifact.summary.blockedRepositories = 1;
    artifact.summary.totalTasks = 1;
    artifact.summary.p1 = 0;
    artifact.repositories[1] = blockedRepository(
      'beta-22222222',
      '/private/fixtures/repos/beta',
      'stale'
    );
    artifact.crossRepoActionQueue = artifact.crossRepoActionQueue.slice(0, 1);
    artifact.diagnostics = [{
      repoSlug: 'beta-22222222',
      code: 'stale_run_id',
      message: 'Latest run identity is stale.'
    }];

    const report = await writeAndValidate(artifact, 'partial');

    expect(report).toMatchObject({
      status: 'passed',
      workspaceStatus: 'partial',
      selection: {
        recommendedWorkspaceTaskId: 'alpha-11111111:alpha-p0',
        selectableWorkspaceTaskIds: ['alpha-11111111:alpha-p0'],
        blockedRepositorySlugs: ['beta-22222222'],
        nextAction: 'maintainer_review',
        haltRequired: false
      },
      diagnostics: {
        total: 1,
        repositorySlugs: ['beta-22222222'],
        codes: ['stale_run_id']
      }
    });
  });

  it('halts on a fully blocked workspace and exposes its diagnostics', async () => {
    const artifact = workspaceSummaryArtifact();
    artifact.status = 'blocked';
    artifact.summary.readyRepositories = 0;
    artifact.summary.blockedRepositories = 2;
    artifact.summary.totalTasks = 0;
    artifact.summary.p0 = 0;
    artifact.summary.p1 = 0;
    artifact.repositories = [
      blockedRepository('alpha-11111111', '/private/fixtures/repos/alpha', 'missing_artifacts'),
      blockedRepository('beta-22222222', '/private/fixtures/repos/beta', 'stale')
    ];
    artifact.crossRepoActionQueue = [];
    artifact.diagnostics = [
      {
        repoSlug: 'alpha-11111111',
        code: 'missing_latest_manifest',
        message: 'Latest run manifest does not exist.'
      },
      {
        repoSlug: 'beta-22222222',
        code: 'stale_run_id',
        message: 'Latest run identity is stale.'
      }
    ];

    const report = await writeAndValidate(artifact, 'blocked');

    expect(report).toMatchObject({
      status: 'passed',
      workspaceStatus: 'blocked',
      selection: {
        recommendedWorkspaceTaskId: null,
        selectableWorkspaceTaskIds: [],
        blockedRepositorySlugs: ['alpha-11111111', 'beta-22222222'],
        nextAction: 'stop_blocked',
        haltRequired: true
      },
      diagnostics: {
        total: 2,
        repositorySlugs: ['alpha-11111111', 'beta-22222222'],
        codes: ['missing_latest_manifest', 'stale_run_id']
      }
    });
  });

  it('returns no tasks without requiring review for an empty workspace', async () => {
    const artifact = workspaceSummaryArtifact();
    artifact.status = 'empty';
    artifact.summary.readyRepositories = 0;
    artifact.summary.noTaskRepositories = 2;
    artifact.summary.totalTasks = 0;
    artifact.summary.p0 = 0;
    artifact.summary.p1 = 0;
    artifact.summary.requiresMaintainerReview = false;
    artifact.repositories = artifact.repositories.map((item) => ({
      ...item,
      rank: null,
      state: 'no_tasks',
      taskSummary: { totalTasks: 0, p0: 0, p1: 0, p2: 0 },
      highestSeverity: null,
      recommendedTaskId: null,
      requiresMaintainerReview: false
    }));
    artifact.crossRepoActionQueue = [];
    artifact.maintainerReview.required = false;
    artifact.maintainerReview.reasons = [];

    const report = await writeAndValidate(artifact, 'empty');

    expect(report).toMatchObject({
      status: 'passed',
      workspaceStatus: 'empty',
      selection: {
        recommendedWorkspaceTaskId: null,
        selectableWorkspaceTaskIds: [],
        blockedRepositorySlugs: [],
        nextAction: 'no_tasks',
        haltRequired: false
      },
      maintainerReview: {
        required: false
      }
    });
  });

  it('fails closed when a blocked repository is injected into the queue', async () => {
    const artifact = workspaceSummaryArtifact();
    artifact.status = 'partial';
    artifact.repositories[1] = blockedRepository(
      'beta-22222222',
      '/private/fixtures/repos/beta',
      'stale'
    );
    artifact.diagnostics = [{
      repoSlug: 'beta-22222222',
      code: 'stale_run_id',
      message: 'Latest run identity is stale.'
    }];

    const report = await writeAndValidate(artifact, 'tampered-queue');

    expect(report.status).toBe('failed');
    expect(report.checks).toContainEqual(expect.objectContaining({
      id: 'blocked_repositories_excluded',
      status: 'failed'
    }));
    expect(report.selection.selectableWorkspaceTaskIds).toEqual([
      'alpha-11111111:alpha-p0'
    ]);
  });

  it('fails closed when the human-readable summary contains a secret marker', async () => {
    const artifact = workspaceSummaryArtifact();
    const root = await mkdtemp(join(tmpdir(), 'repoassure-workspace-consumption-secret-'));
    const jsonPath = join(root, 'workspace-repair-summary.json');
    const markdownPath = join(root, 'workspace-repair-summary.md');

    await writeFile(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
    await writeFile(
      markdownPath,
      `${formatWorkspaceRepairSummaryMarkdown(artifact)}Authorization: Bearer leaked-value\n`
    );

    const report = await validateWorkspaceRepairSummaryConsumption({
      summaryJsonPath: jsonPath,
      summaryMarkdownPath: markdownPath
    });

    expect(report.status).toBe('failed');
    expect(report.boundary.prohibitedContentPresent).toBe(true);
    expect(report.checks).toContainEqual(expect.objectContaining({
      id: 'redaction_boundary',
      status: 'failed'
    }));
  });
});

async function writeAndValidate(
  artifact: WorkspaceRepairSummaryArtifact,
  scenario: string
) {
  const root = await mkdtemp(join(tmpdir(), `repoassure-workspace-consumption-${scenario}-`));
  const jsonPath = join(root, 'workspace-repair-summary.json');
  const markdownPath = join(root, 'workspace-repair-summary.md');

  await writeFile(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
  await writeFile(markdownPath, formatWorkspaceRepairSummaryMarkdown(artifact));

  return validateWorkspaceRepairSummaryConsumption({
    summaryJsonPath: jsonPath,
    summaryMarkdownPath: markdownPath,
    generatedAt: '2026-07-25T13:00:00.000Z'
  });
}

function workspaceSummaryArtifact(): WorkspaceRepairSummaryArtifact {
  return {
    schema: 'repoassure.workspace-repair-summary.v1',
    schemaVersion: 1,
    generatedAt: '2026-07-25T12:00:00.000Z',
    sourceWorkspaceManifest: '/private/fixtures/workspace/manifest.json',
    workspaceOutputDir: '/private/fixtures/workspace',
    status: 'ready',
    summary: {
      totalRepositories: 2,
      readyRepositories: 2,
      blockedRepositories: 0,
      noTaskRepositories: 0,
      totalTasks: 2,
      p0: 1,
      p1: 1,
      p2: 0,
      requiresMaintainerReview: true
    },
    agentContract: {
      readOrder: [
        'workspace-repair-summary.json',
        'maintainerReview',
        'diagnostics',
        'repositories',
        'crossRepoActionQueue',
        'selectedRepository.latestManifest',
        'selectedRepository.repair-task-package.json',
        'selectedRepository.repair-plan.json',
        'workspace-repair-summary.md'
      ],
      boundaries: [
        'Stop when the selected repository is blocked.',
        'Do not infer approval from queue rank.',
        'Do not execute verification commands from this summary.',
        'Hand the selected task to an existing per-repository review workflow.'
      ]
    },
    repositories: [
      repository('alpha-11111111', '/private/fixtures/repos/alpha', 1, 'alpha-p0', 'P0'),
      repository('beta-22222222', '/private/fixtures/repos/beta', 2, 'beta-p1', 'P1')
    ],
    crossRepoActionQueue: [
      queueTask('alpha-11111111', '/private/fixtures/repos/alpha', 'alpha-p0', 'P0', 1),
      queueTask('beta-22222222', '/private/fixtures/repos/beta', 'beta-p1', 'P1', 2)
    ],
    diagnostics: [],
    maintainerReview: {
      required: true,
      reasons: ['Queued repair tasks require an explicit maintainer decision.'],
      allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk'],
      requiredBefore: [
        'selecting a queued task',
        'running verification commands',
        'applying patches',
        'changing target repository files'
      ]
    },
    redaction: {
      applied: true,
      guarantee: 'All artifact-derived text is redacted before entering the workspace summary.',
      prohibitedContent: ['secrets', 'tokens', 'credentials', 'cookies', 'private keys', 'authorization headers']
    },
    noWriteProof: {
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      commandsExecuted: false,
      patchesApplied: false,
      outputPaths: [
        '/private/fixtures/summary/workspace-repair-summary.json',
        '/private/fixtures/summary/workspace-repair-summary.md'
      ],
      prohibitedActions: [
        'command execution',
        'patch application',
        'target repository writes',
        'branch, commit, issue, pull request, or advisory creation'
      ]
    }
  };
}

function repository(
  repoSlug: string,
  repoRoot: string,
  rank: number,
  taskId: string,
  severity: 'P0' | 'P1' | 'P2'
): WorkspaceRepairSummaryArtifact['repositories'][number] {
  return {
    rank,
    repoSlug,
    repoRoot,
    latestRunId: `run-${repoSlug}`,
    state: 'ready',
    stateReasons: [],
    sourceManifest: `/private/fixtures/workspace/${repoSlug}/manifest.json`,
    repairTaskPackage: `/private/fixtures/workspace/${repoSlug}/repair-task-package.json`,
    repairPlan: `/private/fixtures/workspace/${repoSlug}/repair-plan.json`,
    taskSummary: {
      totalTasks: 1,
      p0: severity === 'P0' ? 1 : 0,
      p1: severity === 'P1' ? 1 : 0,
      p2: severity === 'P2' ? 1 : 0
    },
    highestSeverity: severity,
    recommendedTaskId: taskId,
    requiresMaintainerReview: true
  };
}

function blockedRepository(
  repoSlug: string,
  repoRoot: string,
  state: 'stale' | 'missing_artifacts'
): WorkspaceRepairSummaryArtifact['repositories'][number] {
  return {
    rank: null,
    repoSlug,
    repoRoot,
    latestRunId: `run-${repoSlug}`,
    state,
    stateReasons: [state],
    sourceManifest: `/private/fixtures/workspace/${repoSlug}/manifest.json`,
    repairTaskPackage: null,
    repairPlan: null,
    taskSummary: { totalTasks: 0, p0: 0, p1: 0, p2: 0 },
    highestSeverity: null,
    recommendedTaskId: null,
    requiresMaintainerReview: true
  };
}

function queueTask(
  repoSlug: string,
  repoRoot: string,
  taskId: string,
  severity: 'P0' | 'P1' | 'P2',
  rank: number
): WorkspaceRepairSummaryArtifact['crossRepoActionQueue'][number] {
  return {
    workspaceTaskId: `${repoSlug}:${taskId}`,
    rank,
    repoSlug,
    repoRoot,
    taskId,
    severity,
    title: `Repair ${taskId}`,
    objective: `Complete ${taskId}`,
    sourceTaskPackage: `/private/fixtures/workspace/${repoSlug}/repair-task-package.json`,
    verificationCommands: [`pnpm test --filter ${taskId}`],
    requiresMaintainerReview: true
  };
}
