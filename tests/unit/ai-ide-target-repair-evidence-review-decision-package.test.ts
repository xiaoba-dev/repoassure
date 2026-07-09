import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeTargetRepairEvidenceReviewDecisionPackage,
  buildAiIdeTargetRepairEvidenceReviewDecisionPackageMarkdown,
  writeAiIdeTargetRepairEvidenceReviewDecisionPackage,
  writeAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectory
} from '../../packages/acceptance/src/ai-ide-target-repair-evidence-review-decision-package.js';
import type { AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport } from '../../packages/acceptance/src/ai-ide-target-repo-repair-goal-execution-evidence-intake-report.js';

describe('AI IDE target repair evidence review decision package', () => {
  it('records maintainer accept / changes_requested / defer / accept_risk decisions without target repo authorization', () => {
    const intakeReport = buildIntakeReport();
    const decisionPackage = buildAiIdeTargetRepairEvidenceReviewDecisionPackage({
      generatedAt: '2026-07-09T02:30:00.000Z',
      intakeReportPath: '/private/tmp/repoassure-target-review-TOKEN=secret-value/ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json',
      intakeReport,
      reviewDecisionInput: {
        decisions: [
          {
            goalId: 'target-repo-repair-goal-login-validation',
            decision: 'accept',
            evidence: 'Maintainer accepted verified evidence after reading TOKEN=secret-value locally.',
            reviewerRole: 'target_repo_maintainer',
            acceptedEvidenceScope: ['mutation summary', '/private/tmp/repo-TOKEN=secret-value/verification.log'],
            nextRepairGoalRecommendation: 'No additional repair goal is needed for this scope.'
          },
          {
            goalId: 'target-repo-repair-goal-api-contract',
            decision: 'changes_requested',
            evidence: 'Maintainer needs stronger contract verification before accepting this scope.',
            reviewerRole: 'target_repo_maintainer',
            requestedChanges: ['Add API regression test evidence.', 'Rerun pnpm test.'],
            nextRepairGoalRecommendation: 'Open a follow-up repair goal only after explicit maintainer authorization.'
          },
          {
            goalId: 'target-repo-repair-goal-docs',
            decision: 'defer',
            evidence: 'Maintainer deferred low-risk docs cleanup.',
            reviewerRole: 'target_repo_maintainer',
            deferReason: 'Not required for current release gate.'
          },
          {
            goalId: 'target-repo-repair-goal-known-risk',
            decision: 'accept_risk',
            evidence: 'Maintainer accepts residual risk for a documented non-blocking edge case.',
            reviewerRole: 'target_repo_maintainer',
            riskAcceptance: 'Residual risk is accepted for this readiness cycle only.'
          }
        ]
      }
    });
    const markdown = buildAiIdeTargetRepairEvidenceReviewDecisionPackageMarkdown(decisionPackage);
    const serialized = JSON.stringify(decisionPackage);

    expect(decisionPackage.schemaVersion).toBe('repoassure.ai-ide-target-repair-evidence-review-decision-package.v1');
    expect(decisionPackage.reviewStatus).toBe('mixed_review_decisions');
    expect(decisionPackage.sourceIntakeReport).toMatchObject({
      fileName: 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json',
      intakeStatus: 'ready_for_maintainer_review',
      verifiedGoals: 4,
      boundaryViolations: 0
    });
    expect(decisionPackage.decisionSummary).toMatchObject({
      totalReviewedGoals: 4,
      acceptedGoals: 1,
      changesRequestedGoals: 1,
      deferredGoals: 1,
      riskAcceptedGoals: 1
    });
    expect(decisionPackage.acceptedEvidenceScope).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-login-validation',
        acceptedEvidenceScope: ['mutation summary', '/private/tmp/repo-TOKEN=[REDACTED]/verification.log']
      })
    ]);
    expect(decisionPackage.changeRequestedItems).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-api-contract',
        requestedChanges: ['Add API regression test evidence.', 'Rerun pnpm test.']
      })
    ]);
    expect(decisionPackage.deferredItems).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-docs',
        deferReason: 'Not required for current release gate.'
      })
    ]);
    expect(decisionPackage.riskAcceptedItems).toEqual([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-known-risk',
        riskAcceptance: 'Residual risk is accepted for this readiness cycle only.'
      })
    ]);
    expect(decisionPackage.nextRepairGoalRecommendations).toEqual(expect.arrayContaining([
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-login-validation',
        recommendation: 'No additional repair goal is needed for this scope.'
      }),
      expect.objectContaining({
        goalId: 'target-repo-repair-goal-api-contract',
        recommendation: 'Open a follow-up repair goal only after explicit maintainer authorization.'
      })
    ]));
    expect(decisionPackage.maintainerReviewBoundary).toContain('records maintainer review decisions only');
    expect(decisionPackage.nonAuthorizationBoundary).toContain('does not modify target repo files');
    expect(decisionPackage.blockedActions).toContain('target_repo_pull_request_creation');
    expect(decisionPackage.blockedActions).toContain('hosted_dashboard_availability_claim');
    expect(markdown).toContain('# RepoAssure AI IDE Target Repair Evidence Review Decision Package');
    expect(markdown).toContain('## Review Decisions');
    expect(markdown).toContain('## Non-Authorization Boundary');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('marks accepted status only when every reviewed verified goal is accepted', () => {
    const decisionPackage = buildAiIdeTargetRepairEvidenceReviewDecisionPackage({
      generatedAt: '2026-07-09T02:30:00.000Z',
      intakeReportPath: 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json',
      intakeReport: buildIntakeReport(['target-repo-repair-goal-login-validation']),
      reviewDecisionInput: {
        decisions: [
          {
            goalId: 'target-repo-repair-goal-login-validation',
            decision: 'accept',
            evidence: 'Maintainer accepted verified evidence.',
            reviewerRole: 'target_repo_maintainer',
            acceptedEvidenceScope: ['verification passed']
          }
        ]
      }
    });

    expect(decisionPackage.reviewStatus).toBe('accepted_for_target_repo_acceptance');
    expect(decisionPackage.decisionSummary.acceptedGoals).toBe(1);
    expect(decisionPackage.changeRequestedItems).toEqual([]);
    expect(decisionPackage.nonAuthorizationBoundary).toContain('not final merge, release, launch, or customer authorization');
  });

  it('marks blocked when the source intake report is not ready or review decisions are missing', () => {
    const intakeReport = buildIntakeReport(['target-repo-repair-goal-login-validation']);
    const decisionPackage = buildAiIdeTargetRepairEvidenceReviewDecisionPackage({
      generatedAt: '2026-07-09T02:30:00.000Z',
      intakeReportPath: 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json',
      intakeReport: {
        ...intakeReport,
        intakeStatus: 'blocked_or_incomplete',
        executionSummary: {
          ...intakeReport.executionSummary,
          verifiedGoals: 0,
          failedGoals: 1
        }
      },
      reviewDecisionInput: { decisions: [] }
    });

    expect(decisionPackage.reviewStatus).toBe('blocked_or_incomplete');
    expect(decisionPackage.decisionSummary.unreviewedGoals).toBe(1);
    expect(decisionPackage.reviewItems[0]).toMatchObject({
      decision: 'defer',
      decisionReadiness: 'blocked_by_source_intake_status'
    });
  });

  it('writes json and markdown review decision package artifacts from local files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-target-repair-review-'));
    const intakeReportPath = join(root, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json');
    const decisionsPath = join(root, 'target-repair-evidence-review-decisions.json');
    const outputDir = join(root, 'review-output');

    await mkdir(root, { recursive: true });
    await writeFile(intakeReportPath, `${JSON.stringify(buildIntakeReport(['target-repo-repair-goal-login-validation']), null, 2)}\n`);
    await writeFile(decisionsPath, `${JSON.stringify(buildReviewDecisionInput(), null, 2)}\n`);

    const result = await writeAiIdeTargetRepairEvidenceReviewDecisionPackage({
      generatedAt: '2026-07-09T02:30:00.000Z',
      intakeReportPath,
      decisionsPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-target-repair-evidence-review-decision-package.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-target-repair-evidence-review-decision-package.md'));
    expect(result.decisionPackage.reviewStatus).toBe('accepted_for_target_repo_acceptance');
    expect(json).toContain('repoassure.ai-ide-target-repair-evidence-review-decision-package.v1');
    expect(markdown).toContain('## Source Intake Report');
  });

  it('writes review decision package artifacts from a report directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-target-repair-review-dir-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json'),
      `${JSON.stringify(buildIntakeReport(), null, 2)}\n`
    );
    await writeFile(
      join(secretRoot, 'target-repair-evidence-review-decisions.json'),
      `${JSON.stringify(buildReviewDecisionInput(), null, 2)}\n`
    );

    const result = await writeAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectory({
      generatedAt: '2026-07-09T02:30:00.000Z',
      inputDir: secretRoot
    });

    expect(result.jsonPath).toBe(join(secretRoot, 'ai-ide-target-repair-evidence-review-decision-package.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'ai-ide-target-repair-evidence-review-decision-package.md'));
    expect(result.decisionPackage.sourceIntakeReport.path).not.toContain('secret-value');
  });
});

function buildReviewDecisionInput() {
  return {
    decisions: [
      {
        goalId: 'target-repo-repair-goal-login-validation',
        decision: 'accept',
        evidence: 'Maintainer accepted verified evidence.',
        reviewerRole: 'target_repo_maintainer',
        acceptedEvidenceScope: ['verified mutation summary', 'passed pnpm test']
      }
    ]
  };
}

function buildIntakeReport(goalIds = [
  'target-repo-repair-goal-login-validation',
  'target-repo-repair-goal-api-contract',
  'target-repo-repair-goal-docs',
  'target-repo-repair-goal-known-risk'
]): AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport {
  return {
    schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1',
    generatedAt: '2026-07-09T02:00:00.000Z',
    intakeStatus: 'ready_for_maintainer_review',
    sourceTaskPackage: {
      schemaVersion: 'repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1',
      fileName: 'ai-ide-authorized-target-repo-repair-goal-task-package.json',
      path: '/private/tmp/repoassure-target-review-TOKEN=secret-value/ai-ide-authorized-target-repo-repair-goal-task-package.json',
      sha256: 'a'.repeat(64),
      taskPackageStatus: 'ready_for_separate_target_repo_repair_goal',
      approvedRepairGoals: goalIds.length
    },
    executionSummary: {
      totalApprovedRepairGoals: goalIds.length,
      verifiedGoals: goalIds.length,
      blockedGoals: 0,
      failedGoals: 0,
      notStartedGoals: 0,
      boundaryViolations: 0,
      filesChanged: goalIds.length,
      linesAdded: goalIds.length * 2,
      linesRemoved: 0
    },
    goalReports: goalIds.map((goalId) => ({
      goalId,
      scopeId: goalId.replace(/^target-repo-repair-goal-/u, ''),
      executionStatus: 'verified',
      verificationStatus: 'passed',
      verificationRequirements: ['pnpm test'],
      verificationResults: [
        {
          command: 'pnpm test',
          status: 'passed',
          evidence: 'Target repo tests passed.'
        }
      ],
      actualMutationSummary: {
        filesChanged: 1,
        linesAdded: 2,
        linesRemoved: 0,
        summary: 'Changed only maintainer-approved files.',
        evidenceRefs: ['target diff summary']
      },
      maintainerReviewStatus: 'pending_review',
      nonAuthorizationBoundaryMaintained: true,
      notes: 'Awaiting maintainer review decision.'
    })),
    boundaryReport: {
      boundaryViolations: 0,
      unauthorizedActions: [],
      targetRepoMutationNotPerformedByRepoAssure: true,
      notes: 'No boundary violation.'
    },
    reviewChecklist: ['Confirm verification results before accepting evidence.'],
    maintainerReviewBoundary: 'Imported evidence must be reviewed by maintainer.',
    nonAuthorizationBoundary: 'This intake report records evidence only.',
    redactionBoundary: 'Use sanitized local summaries only.',
    blockedActions: [
      'target_repo_file_mutation_by_repoassure',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'public_launch'
    ]
  };
}
