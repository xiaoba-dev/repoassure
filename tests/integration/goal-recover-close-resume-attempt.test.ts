import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';
import { buildBlockedGoalRecoveryResumeAttemptVerificationCheckId } from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';

const execFileAsync = promisify(execFile);
const TIMEOUT = 30_000;

describe('recovery resume attempt closure CLI', () => {
  it('writes a local closure receipt without executing commands or exposing secret paths', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-resume-closure-cli-'));
    const dir = join(root, 'TOKEN=secret-value'); await mkdir(dir, { recursive: true });
    const reviewText = `${JSON.stringify(reviewPackage(), null, 2)}\n`;
    await writeFile(
      join(dir, 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json'), reviewText
    );
    await writeFile(join(dir, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json'), intakeText());
    await writeFile(join(dir, 'blocked-goal-recovery-resume-attempt-task-package.json'), taskPackageText());
    await writeFile(join(dir, 'blocked-goal-recovery-resume-attempt-closure-input.json'), `${JSON.stringify({
      sourceEvidenceReviewPackageSha256: sha256(reviewText),
      closureEvidence: 'Closure reviewed.', reviewerRole: 'maintainer', acknowledgedRiskEvidenceKeys: []
    }, null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync('pnpm', [
      '--silent', 'goal:recover:close-resume-attempt', '--', '--from-dir', dir
    ], { cwd: process.cwd(), timeout: TIMEOUT });
    const json = await readFile(join(dir, 'blocked-goal-recovery-resume-attempt-closure-receipt.json'), 'utf8');
    const receipt = JSON.parse(json) as {
      closureStatus: string;
      boundaryCompliance: { commandsExecutedByClosure: boolean; externalGoalClosedByReceipt: boolean };
    };
    expect(stderr).toBe(''); expect(stdout).not.toContain('secret-value'); expect(json).not.toContain('secret-value');
    expect(receipt.closureStatus).toBe('closed');
    expect(receipt.boundaryCompliance).toMatchObject({
      commandsExecutedByClosure: false, externalGoalClosedByReceipt: false
    });
  }, TIMEOUT);
});

function reviewPackage() {
  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1',
    generatedAt: '2026-07-13T07:00:00.000Z', reviewStatus: 'accepted',
    sourceEvidenceIntake: {
      schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1',
      fileName: 'intake.json', path: 'intake.json', sha256: sha256(intakeText()), intakeStatus: 'complete_for_maintainer_review'
    },
    decisionSummary: {
      total: 3, reviewed: 3, accepted: 3, changesRequested: 0, deferred: 0, acceptedRisk: 0, unreviewed: 0
    },
    reviewItems: [
      reviewItem('action:automatic:B1:A1', 'action', 'automatic:B1:A1'),
      reviewItem('command:resume-1', 'command', 'resume-1'),
      reviewItem(`verification:${CHECK_ID}`, 'verification', CHECK_ID)
    ],
    acceptedEvidenceScope: ['action:automatic:B1:A1', 'command:resume-1', `verification:${CHECK_ID}`], unresolvedEvidenceKeys: [],
    boundaryCompliance: { commandsExecutedByReview: false, sourceBoundaryPreserved: true },
    maintainerReviewBoundary: 'This package records maintainer review decisions over resume-attempt evidence; it does not execute commands, close the source goal, or authorize follow-on work.',
    redactionBoundary: 'Sanitized evidence only.',
    nonAuthorizationBoundary: 'This review package does not execute recovery commands, modify target repo files, create target repo branch, commit, pull request, issue, or advisory, publish npm, create GitHub release, run public launch, contact customers, change pricing/spend, change repository visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.',
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
  };
}

function sha256(value: string): string { return createHash('sha256').update(value).digest('hex'); }

const VERIFICATION_CHECK = 'Run the recovery verification suite.';
const CHECK_ID = buildBlockedGoalRecoveryResumeAttemptVerificationCheckId(VERIFICATION_CHECK);

function reviewItem(evidenceKey: string, evidenceType: string, sourceId: string) {
  return {
    evidenceKey, evidenceType, sourceId, sourceStatus: 'passed', sourceSummary: 'Passed.',
    sourceEvidenceRefs: ['evidence/result.log'], decision: 'accept', decisionEvidence: 'Reviewed.',
    reviewerRole: 'maintainer', rationale: ''
  };
}

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
