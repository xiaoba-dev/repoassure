import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeMarkdown,
  buildBlockedGoalRecoveryResumeAttemptVerificationCheckId,
  writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  type BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput
} from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';
import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';
import type { BlockedGoalRecoveryResumeAttemptTaskPackage } from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-task-package.js';

describe('blocked goal recovery resume attempt execution evidence intake', () => {
  it('records complete evidence for maintainer review without executing commands', () => {
    const taskPackage = buildTaskPackage();
    const text = JSON.stringify(taskPackage);
    const intake = buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'blocked-goal-recovery-resume-attempt-task-package.json',
      sourceTaskPackageText: text,
      taskPackage,
      evidenceInput: buildEvidenceInput(text)
    });
    const markdown = buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeMarkdown(intake);

    expect(intake.schemaVersion).toBe('repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1');
    expect(intake.intakeStatus).toBe('complete_for_maintainer_review');
    expect(intake.actionResults).toEqual([expect.objectContaining({ actionKey: 'automatic:B1:A1', status: 'passed' })]);
    expect(intake.resumeCommandResults).toEqual([expect.objectContaining({ commandId: 'resume-1', status: 'passed' })]);
    expect(intake.boundaryCompliance.commandsExecutedByIntake).toBe(false);
    expect(intake.maintainerReviewBoundary).toContain('does not accept');
    expect(markdown).toContain('## Resume Command Results');
  });

  it('derives failed, incomplete, source-not-ready, and boundary-violation outcomes', () => {
    const taskPackage = buildTaskPackage();
    const text = JSON.stringify(taskPackage);
    const failed = buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: text, taskPackage,
      evidenceInput: buildEvidenceInput(text, { actionStatus: 'failed' })
    });
    const incomplete = buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: text, taskPackage,
      evidenceInput: buildEvidenceInput(text, { omitCommand: true })
    });
    const boundary = buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: text, taskPackage,
      evidenceInput: buildEvidenceInput(text, { unlistedCommandsExecuted: true })
    });
    const blockedPackage = buildTaskPackage({
      taskPackageStatus: 'blocked_by_decision_receipt', actionTasks: [], resumeCommandTasks: [],
      blockedReasons: ['source_rejected'],
      sourceDecisionReceipt: {
        ...taskPackage.sourceDecisionReceipt,
        decisionStatus: 'rejected', resumeAttemptReadiness: 'blocked_by_rejection'
      }
    });
    const blockedText = JSON.stringify(blockedPackage);
    const sourceNotReady = buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: blockedText, taskPackage: blockedPackage,
      evidenceInput: buildEvidenceInput(blockedText, { omitAction: true, omitCommand: true })
    });

    expect(failed.intakeStatus).toBe('failed_or_blocked');
    expect(incomplete.intakeStatus).toBe('incomplete');
    expect(boundary.intakeStatus).toBe('boundary_violation');
    expect(sourceNotReady.intakeStatus).toBe('source_not_ready');
  });

  it('rejects stale SHA, unknown or duplicate task IDs, and unsafe evidence', () => {
    const taskPackage = buildTaskPackage();
    const text = JSON.stringify(taskPackage);
    const cases = [
      buildEvidenceInput(text, { sourceSha256: 'b'.repeat(64) }),
      buildEvidenceInput(text, { actionKey: 'automatic:B1:unknown' }),
      buildEvidenceInput(text, { duplicateAction: true }),
      buildEvidenceInput(text, { summary: 'TOKEN=secret-value' }),
      buildEvidenceInput(text, { verificationCheckId: 'unknown-check' }),
      buildEvidenceInput(text, { emptyEvidenceRefs: true }),
      buildEvidenceInput(text, { commandExitCode: 1 }),
      buildEvidenceInput(text, { extraResultField: true })
    ];
    for (const evidenceInput of cases) {
      expect(() => buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
        taskPackagePath: 'task.json', sourceTaskPackageText: text, taskPackage, evidenceInput
      })).toThrow('Invalid blocked goal recovery resume attempt execution evidence');
    }
  });

  it('rejects contradictory source state and gives boundary violations highest priority', () => {
    const contradictory = buildTaskPackage();
    contradictory.sourceDecisionReceipt.decisionStatus = 'rejected';
    const contradictoryText = JSON.stringify(contradictory);
    expect(() => buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: contradictoryText, taskPackage: contradictory,
      evidenceInput: buildEvidenceInput(contradictoryText)
    })).toThrow('Invalid blocked goal recovery resume attempt task package');

    const contradictoryBoundary = buildTaskPackage({
      taskPackageStatus: 'blocked_by_decision_receipt', actionTasks: [], resumeCommandTasks: [],
      blockedReasons: ['source_boundary_violation'],
      sourceDecisionReceipt: {
        ...buildTaskPackage().sourceDecisionReceipt,
        decisionStatus: 'blocked_or_incomplete', resumeAttemptReadiness: 'blocked_by_boundary_violation'
      },
      boundaryCompliance: { commandsExecuted: false, sourceBoundaryPreserved: true }
    });
    const contradictoryBoundaryText = JSON.stringify(contradictoryBoundary);
    expect(() => buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: contradictoryBoundaryText,
      taskPackage: contradictoryBoundary,
      evidenceInput: buildEvidenceInput(contradictoryBoundaryText, { omitAction: true, omitCommand: true })
    })).toThrow('Invalid blocked goal recovery resume attempt task package');

    const mismatchedBlocked = buildTaskPackage({
      taskPackageStatus: 'blocked_by_decision_receipt', actionTasks: [], resumeCommandTasks: [],
      blockedReasons: ['source_rejected'],
      sourceDecisionReceipt: {
        ...buildTaskPackage().sourceDecisionReceipt,
        decisionStatus: 'rejected', resumeAttemptReadiness: 'blocked_by_deferral'
      }
    });
    const mismatchedText = JSON.stringify(mismatchedBlocked);
    expect(() => buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: mismatchedText, taskPackage: mismatchedBlocked,
      evidenceInput: buildEvidenceInput(mismatchedText, { omitAction: true, omitCommand: true })
    })).toThrow('Invalid blocked goal recovery resume attempt task package');

    const blockedPackage = buildTaskPackage({
      taskPackageStatus: 'blocked_by_decision_receipt', actionTasks: [], resumeCommandTasks: [],
      blockedReasons: ['source_rejected'],
      sourceDecisionReceipt: {
        ...buildTaskPackage().sourceDecisionReceipt,
        decisionStatus: 'rejected', resumeAttemptReadiness: 'blocked_by_rejection'
      }
    });
    const wrongReason = structuredClone(blockedPackage);
    wrongReason.blockedReasons = ['source_deferred'];
    const wrongReasonText = JSON.stringify(wrongReason);
    expect(() => buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: wrongReasonText, taskPackage: wrongReason,
      evidenceInput: buildEvidenceInput(wrongReasonText, { omitAction: true, omitCommand: true })
    })).toThrow('Invalid blocked goal recovery resume attempt task package');

    const blockedText = JSON.stringify(blockedPackage);
    const intake = buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: 'task.json', sourceTaskPackageText: blockedText, taskPackage: blockedPackage,
      evidenceInput: buildEvidenceInput(blockedText, { omitAction: true, omitCommand: true, unlistedCommandsExecuted: true })
    });
    expect(intake.intakeStatus).toBe('boundary_violation');
  });

  it('writes exact source provenance and redacted local artifacts', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-resume-evidence-'));
    const taskPackage = buildTaskPackage();
    const taskText = `${JSON.stringify(taskPackage, null, 2)}\n`;
    const taskPath = join(root, 'blocked-goal-recovery-resume-attempt-task-package.json');
    const evidencePath = join(root, 'blocked-goal-recovery-resume-attempt-execution-evidence-input.json');
    await writeFile(taskPath, taskText);
    await writeFile(evidencePath, `${JSON.stringify(buildEvidenceInput(taskText), null, 2)}\n`);

    const result = await writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
      taskPackagePath: taskPath, evidenceInputPath: evidencePath, outputDir: root
    });
    const json = await readFile(result.jsonPath, 'utf8');
    expect(result.intake.sourceTaskPackage.sha256).toBe(sha256(taskText));
    expect(json).not.toContain('secret-value');
  });
});

function buildTaskPackage(
  overrides: Partial<BlockedGoalRecoveryResumeAttemptTaskPackage> = {}
): BlockedGoalRecoveryResumeAttemptTaskPackage {
  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1',
    generatedAt: '2026-07-13T05:40:00.000Z',
    taskPackageStatus: 'ready_for_separate_resume_attempt',
    sourceDecisionReceipt: {
      schemaVersion: 'repoassure.blocked-goal-recovery-decision-receipt.v1', fileName: 'receipt.json',
      path: 'receipt.json', sha256: 'a'.repeat(64), decisionStatus: 'approved_for_separate_resume_attempt',
      resumeAttemptReadiness: 'ready_for_separate_resume_attempt'
    },
    blockedReasons: [],
    actionTasks: [{
      order: 1, actionKey: 'automatic:B1:A1', blockerId: 'B1', actionType: 'automatic_retry_candidate',
      instruction: 'pnpm test', context: 'Retry tests.', sourceDecision: 'approve', sourceEvidence: 'Reviewed.',
      executionMode: 'separate_reviewed_attempt'
    }],
    resumeCommandTasks: [{
      order: 1, commandId: 'resume-1', command: 'codex resume goal', purpose: 'Resume.',
      sourceDecision: 'approve', sourceEvidence: 'Reviewed.', executionMode: 'separate_reviewed_attempt', executed: false
    }],
    prerequisites: ['Use isolated worktree.'], verificationChecklist: ['Run tests.'], excludedItems: [],
    boundaryCompliance: { commandsExecuted: false, sourceBoundaryPreserved: true },
    maintainerReviewBoundary: 'Separate reviewed attempt only.', redactionBoundary: 'Sanitized evidence only.',
    nonAuthorizationBoundary: 'No external authorization.',
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS],
    ...overrides
  };
}

function buildEvidenceInput(text: string, options: {
  sourceSha256?: string; actionStatus?: 'passed' | 'failed' | 'blocked' | 'not_run';
  actionKey?: string; omitAction?: boolean; omitCommand?: boolean; duplicateAction?: boolean;
  unlistedCommandsExecuted?: boolean; summary?: string;
  verificationCheckId?: string; emptyEvidenceRefs?: boolean; commandExitCode?: number | null;
  extraResultField?: boolean;
} = {}): BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput {
  const action = {
    actionKey: options.actionKey ?? 'automatic:B1:A1', status: options.actionStatus ?? 'passed',
    summary: options.summary ?? 'Action verified.', evidenceRefs: options.emptyEvidenceRefs ? [] : ['evidence/action.log'],
    ...(options.extraResultField ? { debug: 'TOKEN=secret-value' } : {})
  };
  return {
    sourceTaskPackageSha256: options.sourceSha256 ?? sha256(text),
    attemptId: 'attempt-1', startedAt: '2026-07-13T05:41:00.000Z', completedAt: '2026-07-13T05:42:00.000Z',
    actionResults: options.omitAction ? [] : options.duplicateAction ? [action, action] : [action],
    resumeCommandResults: options.omitCommand ? [] : [{
      commandId: 'resume-1', status: 'passed', exitCode: options.commandExitCode ?? 0, summary: 'Resume command completed.', evidenceRefs: ['evidence/resume.log']
    }],
    verificationResults: [{
      checkId: options.verificationCheckId ?? buildBlockedGoalRecoveryResumeAttemptVerificationCheckId('Run tests.'),
      status: 'passed', summary: 'Tests passed.', evidenceRefs: ['evidence/tests.log']
    }],
    boundaryEvidence: {
      unlistedCommandsExecuted: options.unlistedCommandsExecuted ?? false,
      blockedActionsPreserved: true,
      targetRepoMutationByRepoAssure: false
    },
    redactionBoundary: 'Sanitized evidence only.'
  };
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
