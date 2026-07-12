import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageMarkdown,
  writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  type BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInput
} from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-evidence-review-decision-package.js';
import {
  buildBlockedGoalRecoveryResumeAttemptVerificationCheckId,
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeSourceBinding,
  type BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake
} from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';
import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

describe('blocked goal recovery resume attempt evidence review decision package', () => {
  it('records complete maintainer acceptance without executing commands', () => {
    const intake = buildIntake();
    const text = JSON.stringify(intake);
    const result = buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage({
      intakePath: 'intake.json', sourceIntakeText: text, sourceTaskPackageText: sourceTaskPackageText(), intake,
      decisionInput: buildDecisions(text)
    });
    const markdown = buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageMarkdown(result);
    expect(result.schemaVersion).toBe('repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1');
    expect(result.reviewStatus).toBe('accepted');
    expect(result.decisionSummary).toMatchObject({ total: 3, accepted: 3, unreviewed: 0 });
    expect(result.boundaryCompliance.commandsExecutedByReview).toBe(false);
    expect(markdown).toContain('## Evidence Review Decisions');
  });

  it('derives risk, changes-requested, deferred, missing, and boundary-blocked outcomes', () => {
    const intake = buildIntake();
    const text = JSON.stringify(intake);
    expect(build(text, intake, buildDecisions(text, { decision: 'accept_risk' })).reviewStatus).toBe('accepted_with_risk');
    expect(build(text, intake, buildDecisions(text, { decision: 'changes_requested' })).reviewStatus).toBe('changes_requested');
    expect(build(text, intake, buildDecisions(text, { decision: 'defer' })).reviewStatus).toBe('deferred');
    expect(build(text, intake, buildDecisions(text, { omitLast: true })).reviewStatus).toBe('blocked_or_incomplete');

    const boundary = buildIntake({
      intakeStatus: 'boundary_violation',
      boundaryCompliance: {
        ...buildIntake().boundaryCompliance,
        unlistedCommandsExecuted: true
      }
    });
    const boundaryText = JSON.stringify(boundary);
    expect(build(boundaryText, boundary, buildDecisions(boundaryText, { decision: 'changes_requested' })).reviewStatus).toBe('blocked_by_boundary_violation');
  });

  it('rejects stale SHA, unknown or duplicate keys, unsafe evidence, and acceptance of failed evidence', () => {
    const intake = buildIntake();
    const text = JSON.stringify(intake);
    const cases = [
      buildDecisions(text, { sha: 'b'.repeat(64) }),
      buildDecisions(text, { key: 'action:unknown' }),
      buildDecisions(text, { duplicate: true }),
      buildDecisions(text, { evidence: 'TOKEN=secret-value' }),
      buildDecisions(text, { rationale: 'TOKEN=decision-secret' })
    ];
    for (const decisionInput of cases) {
      expect(() => build(text, intake, decisionInput)).toThrow('Invalid blocked goal recovery resume attempt evidence review decisions');
    }
    const failed = buildIntake();
    failed.actionResults[0]!.status = 'failed';
    failed.intakeStatus = 'failed_or_blocked';
    const failedText = JSON.stringify(failed);
    expect(() => build(failedText, failed, buildDecisions(failedText))).toThrow(
      'Invalid blocked goal recovery resume attempt evidence review decisions'
    );

    const contradictory = buildIntake();
    contradictory.boundaryCompliance.unlistedCommandsExecuted = true;
    contradictory.unresolvedTaskIds = ['command:missing'];
    contradictory.sourceTaskPackage.taskPackageStatus = 'blocked_by_decision_receipt';
    const contradictoryText = JSON.stringify(contradictory);
    expect(() => build(contradictoryText, contradictory, buildDecisions(contradictoryText))).toThrow(
      'Invalid blocked goal recovery resume attempt execution evidence intake'
    );

    const fabricatedComplete = buildIntake({
      actionResults: [],
      resumeCommandResults: [],
      verificationResults: [{
        checkId: 'invented-verification', status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/invented.log']
      }],
      unresolvedTaskIds: []
    });
    const fabricatedText = JSON.stringify(fabricatedComplete);
    expect(() => build(fabricatedText, fabricatedComplete, {
      sourceEvidenceIntakeSha256: sha256(fabricatedText),
      decisions: [{
        evidenceKey: 'verification:invented-verification', decision: 'accept', evidence: 'Reviewed.', reviewerRole: 'maintainer'
      }]
    })).toThrow('Invalid blocked goal recovery resume attempt execution evidence intake');
  });

  it('writes exact source provenance and local JSON/Markdown artifacts', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-resume-review-'));
    const intake = buildIntake();
    const intakeText = `${JSON.stringify(intake, null, 2)}\n`;
    const intakePath = join(root, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json');
    const decisionsPath = join(root, 'blocked-goal-recovery-resume-attempt-evidence-review-decisions.json');
    const taskPackagePath = join(root, 'blocked-goal-recovery-resume-attempt-task-package.json');
    await writeFile(intakePath, intakeText);
    await writeFile(taskPackagePath, sourceTaskPackageText());
    await writeFile(decisionsPath, `${JSON.stringify(buildDecisions(intakeText), null, 2)}\n`);
    const result = await writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage({
      intakePath, taskPackagePath, decisionsPath, outputDir: root
    });
    expect(result.reviewPackage.sourceEvidenceIntake.sha256).toBe(sha256(intakeText));
    expect(await readFile(result.jsonPath, 'utf8')).toContain('"reviewStatus": "accepted"');
  });

  it('keeps task inventory categories distinct when source IDs collide', () => {
    const sourceText = sourceTaskPackageText('automatic:B1:A1');
    const intake = buildIntake({
      sourceTaskPackage: {
        ...buildIntake().sourceTaskPackage,
        sha256: sha256(sourceText)
      },
      resumeCommandResults: [{
        commandId: 'automatic:B1:A1', status: 'passed', exitCode: 0,
        summary: 'Passed.', evidenceRefs: ['evidence/resume.log']
      }]
    });
    expect(() => assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeSourceBinding(
      intake, sourceText
    )).not.toThrow();
  });
});

function build(
  text: string,
  intake: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  decisionInput: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInput
) {
  return buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage({
    intakePath: 'intake.json', sourceIntakeText: text, sourceTaskPackageText: sourceTaskPackageText(), intake, decisionInput
  });
}

function buildDecisions(text: string, options: {
  decision?: 'accept' | 'changes_requested' | 'defer' | 'accept_risk'; sha?: string;
  key?: string; duplicate?: boolean; omitLast?: boolean; evidence?: string; rationale?: string;
} = {}): BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInput {
  const keys = ['action:automatic:B1:A1', 'command:resume-1', `verification:${CHECK_ID}`];
  const decisions = keys.map((evidenceKey, index) => ({
    evidenceKey: index === 0 && options.key ? options.key : evidenceKey,
    decision: options.decision ?? 'accept', evidence: options.evidence ?? 'Reviewed.', reviewerRole: 'maintainer',
    rationale: options.rationale ?? (options.decision && options.decision !== 'accept' ? 'Maintainer rationale.' : '')
  }));
  if (options.omitLast) decisions.pop();
  if (options.duplicate) decisions.push({ ...decisions[0]! });
  return { sourceEvidenceIntakeSha256: options.sha ?? sha256(text), decisions };
}

function buildIntake(
  overrides: Partial<BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake> = {}
): BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake {
  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1',
    generatedAt: '2026-07-13T06:10:00.000Z', intakeStatus: 'complete_for_maintainer_review',
    sourceTaskPackage: { schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1', fileName: 'task.json', path: 'task.json', sha256: sha256(sourceTaskPackageText()), taskPackageStatus: 'ready_for_separate_resume_attempt' },
    attempt: { attemptId: 'attempt-1', startedAt: '2026-07-13T06:00:00.000Z', completedAt: '2026-07-13T06:05:00.000Z' },
    actionResults: [{ actionKey: 'automatic:B1:A1', status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/action.log'] }],
    resumeCommandResults: [{ commandId: 'resume-1', status: 'passed', exitCode: 0, summary: 'Passed.', evidenceRefs: ['evidence/resume.log'] }],
    verificationResults: [{ checkId: CHECK_ID, status: 'passed', summary: 'Passed.', evidenceRefs: ['evidence/tests.log'] }],
    unresolvedTaskIds: [],
    boundaryCompliance: { commandsExecutedByIntake: false, unlistedCommandsExecuted: false, blockedActionsPreserved: true, targetRepoMutationByRepoAssure: false, sourceBoundaryPreserved: true },
    reviewChecklist: ['Review all evidence.'], maintainerReviewBoundary: 'Maintainer review required.', redactionBoundary: 'Sanitized evidence only.',
    nonAuthorizationBoundary: 'No external authorization.', blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS],
    ...overrides
  };
}

function sha256(value: string): string { return createHash('sha256').update(value).digest('hex'); }

const VERIFICATION_CHECK = 'Run the recovery verification suite.';
const CHECK_ID = buildBlockedGoalRecoveryResumeAttemptVerificationCheckId(VERIFICATION_CHECK);

function sourceTaskPackageText(commandId = 'resume-1'): string { return JSON.stringify({
  schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1',
  generatedAt: '2026-07-13T05:55:00.000Z', taskPackageStatus: 'ready_for_separate_resume_attempt',
  sourceDecisionReceipt: {
    schemaVersion: 'repoassure.blocked-goal-recovery-decision-receipt.v1', fileName: 'receipt.json',
    path: 'receipt.json', sha256: 'b'.repeat(64), decisionStatus: 'approved_for_separate_resume_attempt',
    resumeAttemptReadiness: 'ready_for_separate_resume_attempt'
  },
  blockedReasons: [],
  actionTasks: [{
    order: 1, actionKey: 'automatic:B1:A1', blockerId: 'B1', actionType: 'automatic',
    instruction: 'Run action.', context: 'Recovery context.', sourceDecision: 'approve',
    sourceEvidence: 'Reviewed.', executionMode: 'separate_reviewed_attempt'
  }],
  resumeCommandTasks: [{
    order: 1, commandId, command: 'pnpm test', purpose: 'Verify recovery.',
    sourceDecision: 'approve', sourceEvidence: 'Reviewed.', executionMode: 'separate_reviewed_attempt', executed: false
  }],
  prerequisites: ['Use an isolated worktree.'], verificationChecklist: [VERIFICATION_CHECK], excludedItems: [],
  boundaryCompliance: { commandsExecuted: false, sourceBoundaryPreserved: true },
  maintainerReviewBoundary: 'Maintainer review required.', redactionBoundary: 'Sanitized evidence only.',
  nonAuthorizationBoundary: 'No external authorization.',
  blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
}); }
