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

describe('recovery resume evidence review CLI', () => {
  it('writes a local review package without executing commands', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-resume-review-cli-'));
    const dir = join(root, 'TOKEN=secret-value'); await mkdir(dir, { recursive: true });
    const intake = buildIntake(); const text = `${JSON.stringify(intake, null, 2)}\n`;
    await writeFile(join(dir, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json'), text);
    await writeFile(join(dir, 'blocked-goal-recovery-resume-attempt-task-package.json'), sourceTaskPackageText());
    await writeFile(join(dir, 'blocked-goal-recovery-resume-attempt-evidence-review-decisions.json'), `${JSON.stringify({
      sourceEvidenceIntakeSha256: createHash('sha256').update(text).digest('hex'),
      decisions: ['action:automatic:B1:A1', 'command:resume-1', `verification:${CHECK_ID}`].map((evidenceKey) => ({
        evidenceKey, decision: 'accept', evidence: 'Reviewed.', reviewerRole: 'maintainer'
      }))
    }, null, 2)}\n`);
    const { stdout, stderr } = await execFileAsync('pnpm', [
      '--silent', 'goal:recover:review-resume-evidence', '--', '--from-dir', dir
    ], { cwd: process.cwd(), timeout: TIMEOUT });
    const json = await readFile(join(dir, 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json'), 'utf8');
    const result = JSON.parse(json) as { reviewStatus: string; boundaryCompliance: { commandsExecutedByReview: boolean } };
    expect(stderr).toBe(''); expect(stdout).not.toContain('secret-value');
    expect(result.reviewStatus).toBe('accepted'); expect(result.boundaryCompliance.commandsExecutedByReview).toBe(false);
    expect(json).not.toContain('secret-value');
  }, TIMEOUT);
});

function buildIntake() {
  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1', generatedAt: '2026-07-13T06:10:00.000Z', intakeStatus: 'complete_for_maintainer_review',
    sourceTaskPackage: { schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1', fileName: 'task.json', path: 'task.json', sha256: createHash('sha256').update(sourceTaskPackageText()).digest('hex'), taskPackageStatus: 'ready_for_separate_resume_attempt' },
    attempt: { attemptId: 'attempt-1', startedAt: '2026-07-13T06:00:00.000Z', completedAt: '2026-07-13T06:05:00.000Z' },
    actionResults: [{ actionKey: 'automatic:B1:A1', status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/action.log'] }],
    resumeCommandResults: [{ commandId: 'resume-1', status: 'passed', exitCode: 0, summary: 'Passed.', evidenceRefs: ['evidence/resume.log'] }],
    verificationResults: [{ checkId: CHECK_ID, status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/tests.log'] }],
    unresolvedTaskIds: [], boundaryCompliance: { commandsExecutedByIntake: false, unlistedCommandsExecuted: false, blockedActionsPreserved: true, targetRepoMutationByRepoAssure: false, sourceBoundaryPreserved: true },
    reviewChecklist: ['Review evidence.'], maintainerReviewBoundary: 'Review required.', redactionBoundary: 'Sanitized evidence only.', nonAuthorizationBoundary: 'No external authorization.',
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
  };
}

const VERIFICATION_CHECK = 'Run the recovery verification suite.';
const CHECK_ID = buildBlockedGoalRecoveryResumeAttemptVerificationCheckId(VERIFICATION_CHECK);

function sourceTaskPackageText(): string { return JSON.stringify({
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
