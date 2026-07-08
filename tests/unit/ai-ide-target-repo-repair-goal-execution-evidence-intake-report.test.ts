import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport,
  buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportMarkdown,
  writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport,
  writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectory
} from '../../packages/acceptance/src/ai-ide-target-repo-repair-goal-execution-evidence-intake-report.js';
import type { AiIdeAuthorizedTargetRepoRepairGoalTaskPackage } from '../../packages/acceptance/src/ai-ide-authorized-target-repo-repair-goal-task-package.js';

describe('AI IDE target repo repair goal execution evidence intake report', () => {
  it('normalizes a separate target repo repair goal execution into maintainer-review evidence', () => {
    const taskPackage = buildTaskPackage('/private/tmp/repoassure-target-repair-TOKEN=secret-value');

    const report = buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport({
      generatedAt: '2026-07-09T01:30:00.000Z',
      taskPackagePath: '/private/tmp/repoassure-target-repair-TOKEN=secret-value/ai-ide-authorized-target-repo-repair-goal-task-package.json',
      taskPackage,
      executionEvidence: {
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
                evidence: 'Target repo tests passed after the separately authorized repair goal.'
              },
              {
                command: 'pnpm lint',
                status: 'passed',
                evidence: 'Target repo lint passed.'
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
      }
    });
    const markdown = buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportMarkdown(report);
    const serialized = JSON.stringify(report);

    expect(report.schemaVersion).toBe('repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1');
    expect(report.intakeStatus).toBe('ready_for_maintainer_review');
    expect(report.sourceTaskPackage).toMatchObject({
      fileName: 'ai-ide-authorized-target-repo-repair-goal-task-package.json',
      taskPackageStatus: 'ready_for_separate_target_repo_repair_goal',
      approvedRepairGoals: 1
    });
    expect(report.executionSummary).toMatchObject({
      totalApprovedRepairGoals: 1,
      verifiedGoals: 1,
      boundaryViolations: 0,
      filesChanged: 2
    });
    expect(report.goalReports).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
        executionStatus: 'verified',
        verificationStatus: 'passed',
        maintainerReviewStatus: 'pending_review',
        nonAuthorizationBoundaryMaintained: true
      })
    ]);
    expect(report.goalReports[0]?.actualMutationSummary.summary).not.toContain('secret-value');
    expect(report.goalReports[0]?.actualMutationSummary.evidenceRefs.join(' ')).not.toContain('secret-value');
    expect(report.maintainerReviewBoundary).toContain('must be reviewed by the maintainer');
    expect(report.nonAuthorizationBoundary).toContain('does not create target repo branch');
    expect(report.blockedActions).toContain('target_repo_commit_creation');
    expect(report.blockedActions).toContain('public_launch');
    expect(markdown).toContain('# RepoAssure AI IDE Target Repo Repair Goal Execution Evidence Intake Report');
    expect(markdown).toContain('## Goal Reports');
    expect(markdown).toContain('## Boundary Report');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('marks the intake blocked when an approved repair goal has no execution evidence', () => {
    const report = buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport({
      generatedAt: '2026-07-09T01:30:00.000Z',
      taskPackagePath: '/private/tmp/repoassure-target-repair-TOKEN=secret-value/ai-ide-authorized-target-repo-repair-goal-task-package.json',
      taskPackage: buildTaskPackage('/private/tmp/repoassure-target-repair-TOKEN=secret-value'),
      executionEvidence: {
        executionResults: [],
        boundaryEvidence: {
          unauthorizedActions: [],
          notes: 'No execution evidence was supplied.'
        }
      }
    });

    expect(report.intakeStatus).toBe('blocked_or_incomplete');
    expect(report.executionSummary).toMatchObject({
      verifiedGoals: 0,
      notStartedGoals: 1
    });
    expect(report.goalReports[0]).toMatchObject({
      executionStatus: 'not_started',
      verificationStatus: 'not_run',
      nonAuthorizationBoundaryMaintained: true
    });
    expect(report.reviewChecklist).toContain('Treat blocked, failed, or not_started goal reports as unresolved until new execution evidence is provided.');
  });

  it('flags boundary violations without treating the report as release or mutation authorization', () => {
    const report = buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport({
      generatedAt: '2026-07-09T01:30:00.000Z',
      taskPackagePath: '/private/tmp/repoassure-target-repair-TOKEN=secret-value/ai-ide-authorized-target-repo-repair-goal-task-package.json',
      taskPackage: buildTaskPackage('/private/tmp/repoassure-target-repair-TOKEN=secret-value'),
      executionEvidence: {
        executionResults: [
          {
            goalId: 'target-repo-repair-goal-target_repo_manual_repair_goal',
            executionStatus: 'failed',
            actualMutationSummary: {
              filesChanged: 1,
              linesAdded: 1,
              linesRemoved: 0,
              summary: 'Attempted patch failed verification.',
              evidenceRefs: ['target verification log']
            },
            verificationResults: [
              {
                command: 'pnpm test',
                status: 'failed',
                evidence: 'Regression test failed.'
              }
            ],
            maintainerReviewStatus: 'changes_requested',
            notes: 'Needs another repair pass.'
          }
        ],
        boundaryEvidence: {
          unauthorizedActions: ['target_repo_commit_creation'],
          notes: 'A commit was attempted outside the allowed evidence intake boundary.'
        }
      }
    });

    expect(report.intakeStatus).toBe('boundary_violation_detected');
    expect(report.executionSummary.boundaryViolations).toBe(1);
    expect(report.boundaryReport).toMatchObject({
      boundaryViolations: 1,
      unauthorizedActions: ['target_repo_commit_creation'],
      targetRepoMutationNotPerformedByRepoAssure: true
    });
    expect(report.goalReports[0]?.nonAuthorizationBoundaryMaintained).toBe(false);
  });

  it('writes json and markdown intake report artifacts from local files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-target-repair-evidence-'));
    const taskPackagePath = join(root, 'ai-ide-authorized-target-repo-repair-goal-task-package.json');
    const evidencePath = join(root, 'target-repo-repair-goal-execution-evidence-input.json');
    const outputDir = join(root, 'intake-output');

    await mkdir(root, { recursive: true });
    await writeFile(taskPackagePath, `${JSON.stringify(buildTaskPackage(join(root, 'campaign-TOKEN=secret-value')), null, 2)}\n`);
    await writeFile(evidencePath, `${JSON.stringify(buildExecutionEvidenceInput(), null, 2)}\n`);

    const result = await writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport({
      generatedAt: '2026-07-09T01:30:00.000Z',
      taskPackagePath,
      evidencePath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md'));
    expect(result.intakeReport.intakeStatus).toBe('ready_for_maintainer_review');
    expect(json).toContain('repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1');
    expect(markdown).toContain('## Review Checklist');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('writes intake report artifacts from a task package directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-target-repair-evidence-dir-'));
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

    const result = await writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectory({
      generatedAt: '2026-07-09T01:30:00.000Z',
      inputDir: secretRoot
    });

    expect(result.jsonPath).toBe(join(secretRoot, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md'));
    expect(result.intakeReport.sourceTaskPackage.path).not.toContain('secret-value');
  });
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

function buildTaskPackage(root: string): AiIdeAuthorizedTargetRepoRepairGoalTaskPackage {
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
        repairGoalInstructions: [
          'Read the source authorization receipt before opening the target repo repair goal.',
          'Open or use an isolated target repo worktree only inside the separate authorized repair goal.',
          'Apply only maintainer-approved changes for this scope.'
        ],
        verificationRequirements: ['pnpm test', 'pnpm lint'],
        completionEvidence: [
          'Target repo diff summary',
          'Verification command results',
          'Maintainer review summary'
        ]
      }
    ],
    excludedAuthorizationItems: [
      {
        scopeId: 'unsupported-runtime-repair',
        decision: 'defer',
        reason: 'Runtime prerequisite missing.',
        nextAction: 'Resolve runtime prerequisite before repair.'
      }
    ],
    verificationChecklist: ['pnpm test', 'pnpm lint'],
    maintainerReviewBoundary: 'The separate target repo repair goal must return repair evidence for maintainer review before acceptance.',
    nonAuthorizationBoundary: 'This task package does not execute target repo file mutation, branch creation, commits, pull requests, issues, advisories, releases, publication, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.',
    redactionBoundary: 'Use sanitized local summaries only.',
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'target_repo_pull_request_creation',
      'public_launch',
      'customer_contact',
      'commercial_availability_claim'
    ]
  };
}
