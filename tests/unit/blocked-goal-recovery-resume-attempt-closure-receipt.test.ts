import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildBlockedGoalRecoveryResumeAttemptClosureReceipt,
  buildBlockedGoalRecoveryResumeAttemptClosureReceiptMarkdown,
  writeBlockedGoalRecoveryResumeAttemptClosureReceipt,
  type BlockedGoalRecoveryResumeAttemptClosureInput
} from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-closure-receipt.js';
import type { BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage } from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-evidence-review-decision-package.js';
import { buildBlockedGoalRecoveryResumeAttemptVerificationCheckId } from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';
import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

describe('blocked goal recovery resume attempt closure receipt', () => {
  it('closes exact-byte-bound accepted evidence without executing commands', () => {
    const source = reviewPackage();
    const text = JSON.stringify(source);
    const receipt = buildBlockedGoalRecoveryResumeAttemptClosureReceipt({
      reviewPackagePath: 'review.json', sourceReviewPackageText: text, reviewPackage: source,
      sourceIntakeText: intakeText(), sourceTaskPackageText: taskPackageText(),
      closureInput: closureInput(text)
    });
    const markdown = buildBlockedGoalRecoveryResumeAttemptClosureReceiptMarkdown(receipt);
    expect(receipt.schemaVersion).toBe('repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1');
    expect(receipt.closureStatus).toBe('closed');
    expect(receipt.closedEvidenceScope).toEqual(source.acceptedEvidenceScope);
    expect(receipt.boundaryCompliance).toEqual({
      commandsExecutedByClosure: false, externalGoalClosedByReceipt: false, sourceBoundaryPreserved: true
    });
    expect(markdown).toContain('## Closed Evidence Scope');
  });

  it('closes accepted-risk evidence only with exact risk acknowledgement', () => {
    const source = reviewPackage({ risk: true });
    const text = JSON.stringify(source);
    const receipt = build(text, source, closureInput(text, ['command:resume-1']));
    expect(receipt.closureStatus).toBe('closed_with_accepted_risk');
    expect(receipt.acceptedRiskEvidenceKeys).toEqual(['command:resume-1']);
    expect(receipt.residualRisks).toEqual([{
      evidenceKey: 'command:resume-1', rationale: 'Risk reviewed.', decisionEvidence: 'Reviewed.'
    }]);
  });

  it('rejects stale SHA, non-accepted state, tampering, unsafe input, and incomplete risk acknowledgement', () => {
    const source = reviewPackage();
    const text = JSON.stringify(source);
    const stale = closureInput(text); stale.sourceEvidenceReviewPackageSha256 = 'b'.repeat(64);
    expect(() => build(text, source, stale)).toThrow('Invalid blocked goal recovery resume attempt closure input');

    const changed = reviewPackage({ reviewStatus: 'changes_requested' });
    expect(() => build(JSON.stringify(changed), changed, closureInput(JSON.stringify(changed)))).toThrow();

    const tampered = reviewPackage(); tampered.decisionSummary.accepted = 2;
    expect(() => build(JSON.stringify(tampered), tampered, closureInput(JSON.stringify(tampered)))).toThrow(
      'Invalid blocked goal recovery resume attempt evidence review decision package'
    );

    const unsafe = closureInput(text); unsafe.closureEvidence = 'TOKEN=secret-value';
    expect(() => build(text, source, unsafe)).toThrow('Invalid blocked goal recovery resume attempt closure input');

    const risk = reviewPackage({ risk: true }); const riskText = JSON.stringify(risk);
    expect(() => build(riskText, risk, closureInput(riskText))).toThrow(
      'Invalid blocked goal recovery resume attempt closure input'
    );

    const failedRisk = reviewPackage({ risk: true });
    failedRisk.reviewItems[1]!.sourceStatus = 'failed';
    const failedRiskText = JSON.stringify(failedRisk);
    expect(() => build(failedRiskText, failedRisk, closureInput(failedRiskText, ['command:resume-1']))).toThrow(
      'Invalid blocked goal recovery resume attempt evidence review decision package'
    );

    const fabricated = reviewPackage();
    fabricated.reviewItems = fabricated.reviewItems.slice(0, 1);
    fabricated.acceptedEvidenceScope = fabricated.reviewItems.map((item) => item.evidenceKey);
    fabricated.decisionSummary = {
      total: 1, reviewed: 1, accepted: 1, changesRequested: 0, deferred: 0, acceptedRisk: 0, unreviewed: 0
    };
    const fabricatedText = JSON.stringify(fabricated);
    expect(() => build(fabricatedText, fabricated, closureInput(fabricatedText))).toThrow(
      'Invalid blocked goal recovery resume attempt evidence review decision package'
    );
  });

  it('writes local JSON and Markdown with exact provenance', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-resume-closure-'));
    const source = reviewPackage(); const text = `${JSON.stringify(source, null, 2)}\n`;
    const reviewPackagePath = join(root, 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json');
    const closureInputPath = join(root, 'blocked-goal-recovery-resume-attempt-closure-input.json');
    const intakePath = join(root, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json');
    const taskPackagePath = join(root, 'blocked-goal-recovery-resume-attempt-task-package.json');
    await writeFile(reviewPackagePath, text);
    await writeFile(intakePath, intakeText());
    await writeFile(taskPackagePath, taskPackageText());
    await writeFile(closureInputPath, `${JSON.stringify(closureInput(text), null, 2)}\n`);
    const result = await writeBlockedGoalRecoveryResumeAttemptClosureReceipt({
      reviewPackagePath, intakePath, taskPackagePath, closureInputPath, outputDir: root
    });
    expect(result.receipt.sourceEvidenceReviewPackage.sha256).toBe(sha256(text));
    expect(await readFile(result.jsonPath, 'utf8')).toContain('"closureStatus": "closed"');
    expect(await readFile(result.markdownPath, 'utf8')).toContain('Commands executed by closure: false');
  });
});

function build(
  text: string,
  source: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  input: BlockedGoalRecoveryResumeAttemptClosureInput
) {
  return buildBlockedGoalRecoveryResumeAttemptClosureReceipt({
    reviewPackagePath: 'review.json', sourceReviewPackageText: text, reviewPackage: source,
    sourceIntakeText: intakeText(), sourceTaskPackageText: taskPackageText(), closureInput: input
  });
}

function closureInput(text: string, acknowledgedRiskEvidenceKeys: string[] = []): BlockedGoalRecoveryResumeAttemptClosureInput {
  return {
    sourceEvidenceReviewPackageSha256: sha256(text), closureEvidence: 'Closure reviewed.',
    reviewerRole: 'maintainer', acknowledgedRiskEvidenceKeys
  };
}

function reviewPackage(options: {
  risk?: boolean;
  reviewStatus?: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage['reviewStatus'];
} = {}): BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage {
  const riskDecision = options.risk ? 'accept_risk' : 'accept';
  const items: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage['reviewItems'] = [
    reviewItem('action:automatic:B1:A1', 'action', 'automatic:B1:A1', 'accept'),
    reviewItem('command:resume-1', 'command', 'resume-1', riskDecision),
    reviewItem(`verification:${CHECK_ID}`, 'verification', CHECK_ID, 'accept')
  ];
  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1',
    generatedAt: '2026-07-13T07:00:00.000Z',
    reviewStatus: options.reviewStatus ?? (options.risk ? 'accepted_with_risk' : 'accepted'),
    sourceEvidenceIntake: {
      schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1',
      fileName: 'intake.json', path: 'intake.json', sha256: sha256(intakeText()), intakeStatus: 'complete_for_maintainer_review'
    },
    decisionSummary: {
      total: 3, reviewed: 3, accepted: options.risk ? 2 : 3,
      changesRequested: 0, deferred: 0, acceptedRisk: options.risk ? 1 : 0, unreviewed: 0
    },
    reviewItems: items,
    acceptedEvidenceScope: items.map((item) => item.evidenceKey), unresolvedEvidenceKeys: [],
    boundaryCompliance: { commandsExecutedByReview: false, sourceBoundaryPreserved: true },
    maintainerReviewBoundary: 'This package records maintainer review decisions over resume-attempt evidence; it does not execute commands, close the source goal, or authorize follow-on work.',
    redactionBoundary: 'Sanitized evidence only.',
    nonAuthorizationBoundary: 'This review package does not execute recovery commands, modify target repo files, create target repo branch, commit, pull request, issue, or advisory, publish npm, create GitHub release, run public launch, contact customers, change pricing/spend, change repository visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.',
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
  };
}

function reviewItem(
  evidenceKey: string,
  evidenceType: 'action' | 'command' | 'verification',
  sourceId: string,
  decision: 'accept' | 'accept_risk'
): BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage['reviewItems'][number] {
  return {
    evidenceKey, evidenceType, sourceId, sourceStatus: 'passed', sourceSummary: 'Passed.',
    sourceEvidenceRefs: ['evidence/result.log'], decision, decisionEvidence: 'Reviewed.', reviewerRole: 'maintainer',
    rationale: decision === 'accept_risk' ? 'Risk reviewed.' : ''
  };
}

function sha256(value: string): string { return createHash('sha256').update(value).digest('hex'); }

const VERIFICATION_CHECK = 'Run the recovery verification suite.';
const CHECK_ID = buildBlockedGoalRecoveryResumeAttemptVerificationCheckId(VERIFICATION_CHECK);

function intakeText(): string { return JSON.stringify({
  schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1',
  generatedAt: '2026-07-13T06:10:00.000Z', intakeStatus: 'complete_for_maintainer_review',
  sourceTaskPackage: {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1', fileName: 'task.json',
    path: 'task.json', sha256: sha256(taskPackageText()), taskPackageStatus: 'ready_for_separate_resume_attempt'
  },
  attempt: { attemptId: 'attempt-1', startedAt: '2026-07-13T06:00:00.000Z', completedAt: '2026-07-13T06:05:00.000Z' },
  actionResults: [{ actionKey: 'automatic:B1:A1', status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/result.log'] }],
  resumeCommandResults: [{ commandId: 'resume-1', status: 'passed', exitCode: 0, summary: 'Passed.', evidenceRefs: ['evidence/result.log'] }],
  verificationResults: [{ checkId: CHECK_ID, status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/result.log'] }],
  unresolvedTaskIds: [],
  boundaryCompliance: { commandsExecutedByIntake: false, unlistedCommandsExecuted: false, blockedActionsPreserved: true, targetRepoMutationByRepoAssure: false, sourceBoundaryPreserved: true },
  reviewChecklist: ['Review evidence.'], maintainerReviewBoundary: 'Review required.', redactionBoundary: 'Sanitized evidence only.',
  nonAuthorizationBoundary: 'No external authorization.', blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
}); }

function taskPackageText(): string { return JSON.stringify({
  schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1',
  generatedAt: '2026-07-13T05:55:00.000Z', taskPackageStatus: 'ready_for_separate_resume_attempt',
  sourceDecisionReceipt: {
    schemaVersion: 'repoassure.blocked-goal-recovery-decision-receipt.v1', fileName: 'receipt.json', path: 'receipt.json',
    sha256: 'b'.repeat(64), decisionStatus: 'approved_for_separate_resume_attempt',
    resumeAttemptReadiness: 'ready_for_separate_resume_attempt'
  },
  blockedReasons: [], actionTasks: [{
    order: 1, actionKey: 'automatic:B1:A1', blockerId: 'B1', actionType: 'automatic', instruction: 'Run action.',
    context: 'Recovery context.', sourceDecision: 'approve', sourceEvidence: 'Reviewed.', executionMode: 'separate_reviewed_attempt'
  }],
  resumeCommandTasks: [{
    order: 1, commandId: 'resume-1', command: 'pnpm test', purpose: 'Verify recovery.', sourceDecision: 'approve',
    sourceEvidence: 'Reviewed.', executionMode: 'separate_reviewed_attempt', executed: false
  }],
  prerequisites: ['Use an isolated worktree.'], verificationChecklist: [VERIFICATION_CHECK], excludedItems: [],
  boundaryCompliance: { commandsExecuted: false, sourceBoundaryPreserved: true },
  maintainerReviewBoundary: 'Maintainer review required.', redactionBoundary: 'Sanitized evidence only.',
  nonAuthorizationBoundary: 'No external authorization.', blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
}); }
