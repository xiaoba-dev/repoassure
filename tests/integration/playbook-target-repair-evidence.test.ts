import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('target repo repair goal execution evidence intake script', () => {
  it('generates an intake report from one local task package directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-target-repair-evidence-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-authorized-target-repo-repair-goal-task-package.json'),
      `${JSON.stringify(buildTaskPackage(secretRoot), null, 2)}\n`
    );
    await writeFile(
      join(secretRoot, 'target-repo-repair-goal-execution-evidence-input.json'),
      `${JSON.stringify(buildExecutionEvidenceInput(), null, 2)}\n`
    );

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      [
        'playbook:target-repair-evidence',
        '--',
        '--from-dir',
        secretRoot
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(secretRoot, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json');
    const markdownPath = join(secretRoot, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const report = JSON.parse(json) as {
      schemaVersion: string;
      intakeStatus: string;
      executionSummary: { verifiedGoals: number; boundaryViolations: number };
      goalReports: Array<{ goalId: string; verificationStatus: string }>;
      blockedActions: string[];
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(report.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1');
    expect(report.intakeStatus).toBe('ready_for_maintainer_review');
    expect(report.executionSummary).toMatchObject({
      verifiedGoals: 1,
      boundaryViolations: 0
    });
    expect(report.goalReports).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        verificationStatus: 'passed'
      })
    ]);
    expect(report.blockedActions).toContain('target_repo_commit_creation');
    expect(report.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Execution Evidence Intake Report');
    expect(markdown).toContain('## Boundary Report');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);

  it('reports documented CLI flags when required input is missing', async () => {
    await expect(execFileAsync(
      'node',
      [
        'scripts/generate-ai-ide-target-repo-repair-goal-execution-evidence-intake-report.mjs',
        '--output',
        'artifacts/campaign'
      ],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    )).rejects.toMatchObject({
      stderr: expect.stringContaining('--task-package or --from-dir is required')
    });
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildExecutionEvidenceInput() {
  return {
    executionResults: [
      {
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        executionStatus: 'verified',
        actualMutationSummary: {
          filesChanged: 2,
          linesAdded: 14,
          linesRemoved: 3,
          summary: 'Patched target login validation without exposing TOKEN=secret-value.',
          evidenceRefs: ['target diff summary', '/private/tmp/target-repo-TOKEN=secret-value/patch.diff']
        },
        verificationResults: [
          {
            command: 'pnpm test',
            status: 'passed',
            evidence: 'Target repo tests passed.'
          }
        ],
        maintainerReviewStatus: 'pending_review',
        notes: 'No target repo branch, commit, pull request, issue, advisory, or release was created.'
      }
    ],
    boundaryEvidence: {
      unauthorizedActions: [],
      notes: 'Execution happened in a separate target repo worktree and only evidence was imported.'
    }
  };
}

function buildTaskPackage(root: string) {
  return {
    schemaVersion: 'repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1',
    generatedAt: '2026-07-09T00:30:00.000Z',
    taskPackageStatus: 'ready_for_separate_target_repo_repair_goal',
    sourceAuthorizationReceipt: {
      schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1',
      fileName: 'ai-ide-target-repo-repair-goal-authorization-receipt.json',
      path: `${root}/ai-ide-target-repo-repair-goal-authorization-receipt.json`,
      sha256: 'a'.repeat(64),
      authorizationStatus: 'approved_for_separate_target_repo_repair_goal',
      approvedTargetRepairGoalScopes: 1
    },
    approvedRepairGoals: [
      {
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        scopeId: 'target_repo_manual_repair_goal',
        executionMode: 'separate_authorized_target_repo_repair_goal',
        targetRepoMutationPermission: 'requires_separate_goal_runtime_confirmation',
        approverRole: 'target_repo_maintainer',
        approvalEvidence: 'Maintainer approved a separate target repo repair goal.',
        repairGoalInstructions: ['Apply only maintainer-approved changes for this scope.'],
        verificationRequirements: ['pnpm test', 'pnpm lint'],
        completionEvidence: ['Target repo diff summary', 'Verification command results']
      }
    ],
    excludedAuthorizationItems: [],
    verificationChecklist: ['pnpm test', 'pnpm lint'],
    maintainerReviewBoundary: 'The separate target repo repair goal must return repair evidence for maintainer review before acceptance.',
    nonAuthorizationBoundary: 'This task package does not execute target repo file mutation, branch creation, commits, pull requests, issues, advisories, releases, publication, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.',
    redactionBoundary: 'Use sanitized local summaries only.',
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'public_launch',
      'customer_contact',
      'commercial_availability_claim'
    ]
  };
}
