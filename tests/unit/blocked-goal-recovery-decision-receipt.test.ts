import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildBlockedGoalRecoveryConsumptionReport
} from '../../packages/acceptance/src/blocked-goal-recovery-consumption-report.js';
import {
  buildBlockedGoalRecoveryDecisionReceipt,
  buildBlockedGoalRecoveryDecisionReceiptMarkdown,
  writeBlockedGoalRecoveryDecisionReceipt
} from '../../packages/acceptance/src/blocked-goal-recovery-decision-receipt.js';
import { buildBlockedGoalRecoveryPackage } from '../../packages/acceptance/src/blocked-goal-recovery-package.js';

describe('blocked goal recovery decision receipt', () => {
  it('records reviewed decisions without executing a resume command', () => {
    const report = buildConsumptionReport();
    const receipt = buildBlockedGoalRecoveryDecisionReceipt({
      generatedAt: '2026-07-13T04:00:00.000Z',
      consumptionReportPath: '/private/tmp/TOKEN=secret-value/blocked-goal-recovery-consumption-report.json',
      sourceConsumptionReportText: JSON.stringify(report),
      consumptionReport: report,
      decisions: report.actionQueue.map((action) => ({
        actionKey: action.actionKey,
        decision: 'approve' as const,
        evidence: `Reviewed ${action.actionKey}`,
        reviewerRole: 'maintainer'
      }))
    });
    const markdown = buildBlockedGoalRecoveryDecisionReceiptMarkdown(receipt);

    expect(receipt.schemaVersion).toBe('repoassure.blocked-goal-recovery-decision-receipt.v1');
    expect(receipt.decisionStatus).toBe('approved_for_separate_resume_attempt');
    expect(receipt.resumeAttemptReadiness).toBe('ready_for_separate_resume_attempt');
    expect(receipt.decisionSummary).toMatchObject({ totalActions: 3, approved: 3, unreviewed: 0 });
    expect(receipt.approvedActions).toHaveLength(3);
    expect(receipt.reviewedResumeCommands).toEqual(report.resumeCommands);
    expect(receipt.boundaryCompliance).toEqual({
      resumeCommandsExecuted: false,
      sourceBoundaryPreserved: true
    });
    expect(receipt.blockedActions).toEqual(expect.arrayContaining([
      'target_repo_file_mutation_by_repoassure',
      'pricing_change',
      'spend_authorization'
    ]));
    expect(markdown).toContain('## Recovery Decisions');
    expect(markdown).toContain('## Reviewed Resume Commands');
    expect(JSON.stringify(receipt)).not.toContain('secret-value');
  });

  it('derives reject, defer, accept-risk, and missing-decision outcomes', () => {
    const report = buildConsumptionReport();
    const [first, second, third] = report.actionQueue;
    const base = {
      consumptionReportPath: 'blocked-goal-recovery-consumption-report.json',
      sourceConsumptionReportText: JSON.stringify(report),
      consumptionReport: report
    };
    const decide = (decisions: Array<{
      actionKey: string;
      decision: 'approve' | 'reject' | 'defer' | 'accept_risk';
      evidence: string;
      reviewerRole: string;
      rationale?: string;
    }>) => buildBlockedGoalRecoveryDecisionReceipt({ ...base, decisions });

    expect(decide(report.actionQueue.map((action) => ({
      actionKey: action.actionKey,
      decision: 'reject',
      evidence: 'Rejected after review.',
      reviewerRole: 'maintainer',
      rationale: 'Recovery is unsafe.'
    }))).decisionStatus).toBe('rejected');

    expect(decide(report.actionQueue.map((action) => ({
      actionKey: action.actionKey,
      decision: 'defer',
      evidence: 'Deferred after review.',
      reviewerRole: 'maintainer',
      rationale: 'Wait for a maintenance window.'
    }))).decisionStatus).toBe('deferred');

    const risk = decide(report.actionQueue.map((action) => ({
      actionKey: action.actionKey,
      decision: 'accept_risk',
      evidence: 'Risk reviewed.',
      reviewerRole: 'maintainer',
      rationale: 'Residual risk is accepted for this separate attempt.'
    })));
    expect(risk.decisionStatus).toBe('accepted_with_risk');
    expect(risk.riskAcceptedActions).toHaveLength(3);

    const incomplete = decide([{ actionKey: first!.actionKey, decision: 'approve', evidence: 'Reviewed.', reviewerRole: 'maintainer' }]);
    expect(incomplete.decisionStatus).toBe('blocked_or_incomplete');
    expect(incomplete.resumeAttemptReadiness).toBe('blocked_by_missing_decision');
    expect(incomplete.decisionItems.map((item) => item.decision)).toEqual(['approve', 'unreviewed', 'unreviewed']);

    expect(() => decide([
      { actionKey: second!.actionKey, decision: 'approve', evidence: 'Reviewed.', reviewerRole: 'maintainer' },
      { actionKey: second!.actionKey, decision: 'approve', evidence: 'Reviewed twice.', reviewerRole: 'maintainer' }
    ])).toThrow('Invalid blocked goal recovery decisions');
    expect(() => decide([
      { actionKey: 'unknown:action', decision: 'approve', evidence: 'Reviewed.', reviewerRole: 'maintainer' }
    ])).toThrow('Invalid blocked goal recovery decisions');
    expect(() => decide([
      { actionKey: third!.actionKey, decision: 'accept_risk', evidence: 'Reviewed.', reviewerRole: 'maintainer' }
    ])).toThrow('Invalid blocked goal recovery decisions');
  });

  it('hashes raw source bytes and writes local JSON and Markdown', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-recovery-decision-'));
    const reportPath = join(root, 'blocked-goal-recovery-consumption-report.json');
    const decisionsPath = join(root, 'blocked-goal-recovery-decisions.json');
    const report = buildConsumptionReport();
    const reportText = `${JSON.stringify(report, null, 2)}\n`;
    await writeFile(reportPath, reportText);
    await writeFile(decisionsPath, `${JSON.stringify({ decisions: report.actionQueue.map((action) => ({
      actionKey: action.actionKey,
      decision: 'approve',
      evidence: 'Reviewed locally.',
      reviewerRole: 'maintainer'
    })) }, null, 2)}\n`);

    const result = await writeBlockedGoalRecoveryDecisionReceipt({
      consumptionReportPath: reportPath,
      decisionsPath,
      outputDir: root
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.receipt.sourceConsumptionReport.sha256).toBe(createHash('sha256').update(reportText).digest('hex'));
    expect(json).toContain('repoassure.blocked-goal-recovery-decision-receipt.v1');
    expect(markdown).toContain('# RepoAssure Blocked Goal Recovery Decision Receipt');
  });
});

function buildConsumptionReport() {
  const recoveryPackage = buildBlockedGoalRecoveryPackage({
    generatedAt: '2026-07-13T03:40:00.000Z',
    inputPath: '/private/tmp/blocked-goal-recovery-input.json',
    input: {
      sourceGoal: { title: 'Fixture goal', status: 'blocked', objective: 'Resume safely.' },
      blockers: [
        {
          blockerId: 'B1-test', category: 'test_instability', status: 'retryable', summary: 'Retry test.',
          automaticRecoveryActions: [{ actionId: 'A1', command: 'pnpm test', rationale: 'Retry reviewed test.' }]
        },
        {
          blockerId: 'B2-review', category: 'maintainer_decision_required', status: 'blocked', summary: 'Review required.',
          maintainerDecisionRequests: [{ requestedDecision: 'Approve recovery.', options: ['approve', 'defer'] }]
        },
        {
          blockerId: 'B3-env', category: 'environment', status: 'blocked', summary: 'Environment required.',
          externalPrerequisites: [{ prerequisite: 'Network is restored.', owner: 'environment' }]
        }
      ],
      resumeCommands: [{ command: 'codex resume goal', purpose: 'Resume after review.' }],
      redactionBoundary: 'Use sanitized local evidence only.'
    }
  });
  return buildBlockedGoalRecoveryConsumptionReport({
    generatedAt: '2026-07-13T03:50:00.000Z',
    packagePath: 'blocked-goal-recovery-package.json',
    sourcePackageText: JSON.stringify(recoveryPackage),
    recoveryPackage
  });
}
