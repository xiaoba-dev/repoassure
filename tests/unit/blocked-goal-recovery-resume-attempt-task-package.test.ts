import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildBlockedGoalRecoveryResumeAttemptTaskPackage,
  buildBlockedGoalRecoveryResumeAttemptTaskPackageMarkdown,
  writeBlockedGoalRecoveryResumeAttemptTaskPackage
} from '../../packages/acceptance/src/blocked-goal-recovery-resume-attempt-task-package.js';
import {
  BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS
} from '../../packages/acceptance/src/blocked-goal-recovery-package.js';
import {
  BLOCKED_GOAL_RECOVERY_DECISION_RECEIPT_MAINTAINER_REVIEW_BOUNDARY,
  BLOCKED_GOAL_RECOVERY_DECISION_RECEIPT_NON_AUTHORIZATION_BOUNDARY,
  type BlockedGoalRecoveryDecisionReceipt
} from '../../packages/acceptance/src/blocked-goal-recovery-decision-receipt.js';

describe('blocked goal recovery resume attempt task package', () => {
  it('converts approved evidence into a bounded non-executing task package', () => {
    const receipt = buildReceipt();
    const text = JSON.stringify(receipt);
    const taskPackage = buildBlockedGoalRecoveryResumeAttemptTaskPackage({
      generatedAt: '2026-07-13T05:00:00.000Z',
      receiptPath: '/private/tmp/TOKEN=secret-value/blocked-goal-recovery-decision-receipt.json',
      sourceReceiptText: text,
      reviewedSourceSha256: sha256(text),
      receipt
    });
    const markdown = buildBlockedGoalRecoveryResumeAttemptTaskPackageMarkdown(taskPackage);

    expect(taskPackage.schemaVersion).toBe('repoassure.blocked-goal-recovery-resume-attempt-task-package.v1');
    expect(taskPackage.taskPackageStatus).toBe('ready_for_separate_resume_attempt');
    expect(taskPackage.actionTasks).toEqual([
      expect.objectContaining({ actionKey: 'automatic:B1:A1', executionMode: 'separate_reviewed_attempt' })
    ]);
    expect(taskPackage.resumeCommandTasks).toEqual([
      expect.objectContaining({ commandId: 'resume-1', command: 'codex resume goal', executed: false })
    ]);
    expect(taskPackage.boundaryCompliance).toEqual({ commandsExecuted: false, sourceBoundaryPreserved: true });
    expect(taskPackage.blockedActions).toEqual(expect.arrayContaining(['pricing_change', 'spend_authorization']));
    expect(markdown).toContain('## Resume Command Tasks');
    expect(JSON.stringify(taskPackage)).not.toContain('secret-value');
  });

  it('keeps rejected, deferred, incomplete, and boundary-invalid receipts blocked', () => {
    const cases: Array<{
      receipt: BlockedGoalRecoveryDecisionReceipt;
      reason: string;
    }> = [
      { receipt: buildReceipt({ decisionStatus: 'rejected', resumeAttemptReadiness: 'blocked_by_rejection' }), reason: 'source_rejected' },
      { receipt: buildReceipt({ decisionStatus: 'deferred', resumeAttemptReadiness: 'blocked_by_deferral' }), reason: 'source_deferred' },
      { receipt: buildReceipt({ decisionStatus: 'blocked_or_incomplete', resumeAttemptReadiness: 'blocked_by_missing_decision' }), reason: 'source_incomplete' },
      {
        receipt: buildReceipt({ boundaryCompliance: { resumeCommandsExecuted: false, sourceBoundaryPreserved: false } }),
        reason: 'source_boundary_violation'
      }
    ];

    for (const item of cases) {
      const taskPackage = buildBlockedGoalRecoveryResumeAttemptTaskPackage({
        receiptPath: 'blocked-goal-recovery-decision-receipt.json',
        sourceReceiptText: JSON.stringify(item.receipt),
        reviewedSourceSha256: sha256(JSON.stringify(item.receipt)),
        receipt: item.receipt
      });
      expect(taskPackage.taskPackageStatus).toBe('blocked_by_decision_receipt');
      expect(taskPackage.blockedReasons).toContain(item.reason);
      expect(taskPackage.actionTasks).toEqual([]);
      expect(taskPackage.resumeCommandTasks).toEqual([]);
    }
  });

  it('rejects raw receipt/object mismatches and hashes exact writer bytes', async () => {
    const receipt = buildReceipt();
    expect(() => buildBlockedGoalRecoveryResumeAttemptTaskPackage({
      receiptPath: 'blocked-goal-recovery-decision-receipt.json',
      sourceReceiptText: JSON.stringify(receipt),
      reviewedSourceSha256: sha256(JSON.stringify(receipt)),
      receipt: { ...receipt, generatedAt: 'different' }
    })).toThrow('Invalid blocked goal recovery decision receipt');

    const root = await mkdtemp(join(tmpdir(), 'repoassure-resume-task-'));
    const receiptPath = join(root, 'blocked-goal-recovery-decision-receipt.json');
    const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
    await writeFile(receiptPath, receiptText);
    const result = await writeBlockedGoalRecoveryResumeAttemptTaskPackage({
      receiptPath,
      reviewedSourceSha256: sha256(receiptText),
      outputDir: root
    });
    const json = await readFile(result.jsonPath, 'utf8');

    expect(result.taskPackage.sourceDecisionReceipt.sha256).toBe(createHash('sha256').update(receiptText).digest('hex'));
    expect(json).toContain('repoassure.blocked-goal-recovery-resume-attempt-task-package.v1');
  });

  it('rejects stale review hashes, non-canonical actions, unsafe executable text, and empty commands', () => {
    const receipt = buildReceipt();
    const text = JSON.stringify(receipt);
    expect(() => buildBlockedGoalRecoveryResumeAttemptTaskPackage({
      receiptPath: 'receipt.json', sourceReceiptText: text,
      reviewedSourceSha256: 'b'.repeat(64), receipt
    })).toThrow('Invalid blocked goal recovery resume attempt task input');

    const invalidReceipts: BlockedGoalRecoveryDecisionReceipt[] = [
      mutateReceipt(receipt, (copy) => {
        copy.decisionItems[0]!.allowedDecisions = ['reject'];
      }),
      mutateReceipt(receipt, (copy) => {
        copy.decisionItems[0]!.actionKey = 'unbound-action';
        copy.approvedActions[0]!.actionKey = 'unbound-action';
      }),
      mutateReceipt(receipt, (copy) => {
        copy.decisionItems[0]!.instruction = "printf 'a  b'";
        copy.approvedActions[0]!.instruction = "printf 'a  b'";
      }),
      mutateReceipt(receipt, (copy) => {
        copy.resumeCommandDecisionItems[0]!.command = 'TOKEN=secret-value';
      }),
      mutateReceipt(receipt, (copy) => {
        copy.resumeCommandDecisionItems[0]!.command = '   ';
      }),
      mutateReceipt(receipt, (copy) => {
        copy.resumeCommandDecisionItems[0]!.commandId = 'resume-TOKEN=secret-value';
      }),
      mutateReceipt(receipt, (copy) => {
        copy.resumeCommandDecisionItems[0]!.command = 'TOKEN=[REDACTED]';
      }),
      mutateReceipt(receipt, (copy) => {
        const item = copy.decisionItems[0]!;
        item.actionKey = 'external:B1:A1';
        item.actionType = 'external_prerequisite_required';
        item.allowedDecisions = ['approve', 'defer'];
        item.prerequisiteCompletionRequired = true;
        item.prerequisiteStatus = 'not_applicable';
        item.decision = 'defer';
        item.rationale = 'Wait.';
        copy.approvedActions = [];
        copy.deferredActions = [item];
        copy.decisionSummary = { totalActions: 1, reviewed: 1, approved: 0, rejected: 0, deferred: 1, acceptedRisk: 0, unreviewed: 0 };
        copy.decisionStatus = 'deferred';
        copy.resumeAttemptReadiness = 'blocked_by_deferral';
      }),
      mutateReceipt(receipt, (copy) => {
        const item = copy.decisionItems[0]!;
        item.actionKey = 'external:B1:A1';
        item.actionType = 'external_prerequisite_required';
        item.allowedDecisions = ['approve', 'defer'];
        item.prerequisiteCompletionRequired = true;
        item.prerequisiteStatus = 'unmet';
        item.decision = 'accept_risk';
        item.rationale = 'Waive it.';
        copy.approvedActions = [];
        copy.riskAcceptedActions = [item];
        copy.decisionSummary = { totalActions: 1, reviewed: 1, approved: 0, rejected: 0, deferred: 0, acceptedRisk: 1, unreviewed: 0 };
        copy.decisionStatus = 'accepted_with_risk';
      })
    ];

    for (const invalid of invalidReceipts) {
      const invalidText = JSON.stringify(invalid);
      expect(() => buildBlockedGoalRecoveryResumeAttemptTaskPackage({
        receiptPath: 'receipt.json', sourceReceiptText: invalidText,
        reviewedSourceSha256: sha256(invalidText), receipt: invalid
      })).toThrow('Invalid blocked goal recovery decision receipt');
    }
  });
});

function buildReceipt(
  overrides: Partial<BlockedGoalRecoveryDecisionReceipt> = {}
): BlockedGoalRecoveryDecisionReceipt {
  const approvedItem: BlockedGoalRecoveryDecisionReceipt['decisionItems'][number] = {
    actionKey: 'automatic:B1:A1', blockerId: 'B1', actionType: 'automatic_retry_candidate',
    instruction: 'pnpm test', context: 'Retry verified tests.',
    allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk'], prerequisiteCompletionRequired: false,
    decision: 'approve', evidence: 'Reviewed.', reviewerRole: 'maintainer', rationale: '', prerequisiteStatus: 'not_applicable'
  };
  const receipt: BlockedGoalRecoveryDecisionReceipt = {
    schemaVersion: 'repoassure.blocked-goal-recovery-decision-receipt.v1',
    generatedAt: '2026-07-13T04:50:00.000Z',
    decisionStatus: 'approved_for_separate_resume_attempt',
    resumeAttemptReadiness: 'ready_for_separate_resume_attempt',
    sourceConsumptionReport: {
      schemaVersion: 'repoassure.blocked-goal-recovery-consumption-report.v1',
      fileName: 'blocked-goal-recovery-consumption-report.json',
      path: 'blocked-goal-recovery-consumption-report.json',
      sha256: 'a'.repeat(64),
      resumeReadiness: 'waiting_for_maintainer_or_external_action'
    },
    decisionSummary: { totalActions: 1, reviewed: 1, approved: 1, rejected: 0, deferred: 0, acceptedRisk: 0, unreviewed: 0 },
    decisionItems: [approvedItem],
    approvedActions: [approvedItem], rejectedActions: [], deferredActions: [], riskAcceptedActions: [],
    resumeCommandDecisionItems: [{
      commandId: 'resume-1', command: 'codex resume goal', purpose: 'Resume reviewed goal.',
      decision: 'approve', evidence: 'Command reviewed.', reviewerRole: 'maintainer', rationale: ''
    }],
    boundaryCompliance: { resumeCommandsExecuted: false, sourceBoundaryPreserved: true },
    maintainerReviewBoundary: BLOCKED_GOAL_RECOVERY_DECISION_RECEIPT_MAINTAINER_REVIEW_BOUNDARY,
    redactionBoundary: 'Use sanitized local evidence.',
    nonAuthorizationBoundary: BLOCKED_GOAL_RECOVERY_DECISION_RECEIPT_NON_AUTHORIZATION_BOUNDARY,
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS],
    ...overrides
  };

  if (!receipt.boundaryCompliance.sourceBoundaryPreserved) {
    receipt.decisionStatus = 'blocked_or_incomplete';
    receipt.resumeAttemptReadiness = 'blocked_by_boundary_violation';
  } else if (receipt.decisionStatus === 'rejected' || receipt.decisionStatus === 'deferred') {
    const decision: 'reject' | 'defer' = receipt.decisionStatus === 'rejected' ? 'reject' : 'defer';
    const item = { ...approvedItem, decision, rationale: `${decision} rationale` };
    receipt.decisionItems = [item];
    receipt.approvedActions = [];
    receipt.rejectedActions = decision === 'reject' ? [item] : [];
    receipt.deferredActions = decision === 'defer' ? [item] : [];
    receipt.decisionSummary = {
      totalActions: 1, reviewed: 1, approved: 0,
      rejected: decision === 'reject' ? 1 : 0,
      deferred: decision === 'defer' ? 1 : 0,
      acceptedRisk: 0, unreviewed: 0
    };
  } else if (receipt.decisionStatus === 'blocked_or_incomplete') {
    const item = {
      ...approvedItem, decision: 'unreviewed' as const,
      evidence: '', reviewerRole: '', rationale: ''
    };
    receipt.decisionItems = [item];
    receipt.approvedActions = [];
    receipt.decisionSummary = {
      totalActions: 1, reviewed: 0, approved: 0, rejected: 0,
      deferred: 0, acceptedRisk: 0, unreviewed: 1
    };
  }
  return receipt;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function mutateReceipt(
  receipt: BlockedGoalRecoveryDecisionReceipt,
  mutate: (copy: BlockedGoalRecoveryDecisionReceipt) => void
): BlockedGoalRecoveryDecisionReceipt {
  const copy = structuredClone(receipt);
  mutate(copy);
  return copy;
}
