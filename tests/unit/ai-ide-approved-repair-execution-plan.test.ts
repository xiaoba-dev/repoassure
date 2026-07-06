import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeApprovedRepairExecutionPlan,
  buildAiIdeApprovedRepairExecutionPlanMarkdown,
  writeAiIdeApprovedRepairExecutionPlan
} from '../../packages/acceptance/src/ai-ide-approved-repair-execution-plan.js';
import type { AiIdeRepairApprovalReceipt } from '../../packages/acceptance/src/ai-ide-repair-approval-receipt.js';

describe('AI IDE approved repair execution plan', () => {
  it('includes only approved manual repair candidates and preserves execution boundaries', () => {
    const approvalReceipt = buildApprovalReceipt('/private/tmp/repoassure-approved-TOKEN=secret-value');

    const plan = buildAiIdeApprovedRepairExecutionPlan({
      generatedAt: '2026-07-06T15:00:00.000Z',
      approvalReceiptPath: '/private/tmp/repoassure-approved-TOKEN=secret-value/ai-ide-repair-approval-receipt.json',
      approvalReceipt
    });
    const markdown = buildAiIdeApprovedRepairExecutionPlanMarkdown(plan);
    const serialized = JSON.stringify(plan);

    expect(plan.schemaVersion).toBe('repoassure.ai-ide-approved-repair-execution-plan.v1');
    expect(plan.sourceApprovalReceipt).toContain('ai-ide-repair-approval-receipt.json');
    expect(plan.executionSummary).toMatchObject({
      totalApprovalItems: 5,
      approvedExecutionItems: 1,
      excludedApprovalItems: 4,
      blockedActions: 5
    });
    expect(plan.approvedExecutionItems).toEqual([
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        approvalDecision: 'approve',
        decisionType: 'manual_repair_candidate',
        targetIds: ['agent-reach'],
        executionMode: 'plan_only',
        requiresSeparateRepairAuthorization: true
      })
    ]);
    expect(plan.excludedApprovalItems).toEqual([
      expect.objectContaining({
        sourceActionId: 'P0-improve-repair-plan',
        exclusionReason: 'not_approved_manual_repair_candidate'
      }),
      expect.objectContaining({
        sourceActionId: 'P1-document-target-stack',
        exclusionReason: 'not_approved_manual_repair_candidate'
      }),
      expect.objectContaining({
        sourceActionId: 'P2-rejected-investigation',
        exclusionReason: 'not_approved_manual_repair_candidate'
      }),
      expect.objectContaining({
        sourceActionId: 'P2-pending-evidence',
        exclusionReason: 'not_approved_manual_repair_candidate'
      })
    ]);
    expect(plan.executionChecklist).toContain('Read every approvedExecutionItems[].readOrderPaths entry before proposing a target repo patch.');
    expect(plan.rollbackAndReviewChecklist).toContain('Do not apply patches without a separate repair execution goal and maintainer review.');
    expect(plan.nonAuthorizationBoundary).toContain('does not modify target repos');
    expect(plan.blockedActions).toContain('target_repo_file_mutation');
    expect(markdown).toContain('# RepoAssure AI IDE Approved Repair Execution Plan');
    expect(markdown).toContain('## Approved Execution Items');
    expect(markdown).toContain('P1-fix-target-regression');
    expect(markdown).not.toContain('P0-improve-repair-plan | agent-reach |');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this plan.');
    expect(serialized).not.toContain('secret-value');
  });

  it('writes json and markdown execution plan artifacts from a local approval receipt', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-approved-repair-execution-plan-'));
    const outputDir = join(root, 'campaign-output');
    const approvalReceiptPath = join(root, 'ai-ide-repair-approval-receipt.json');

    await mkdir(root, { recursive: true });
    await writeFile(approvalReceiptPath, `${JSON.stringify(buildApprovalReceipt(join(root, 'campaign-TOKEN=secret-value')), null, 2)}\n`);

    const result = await writeAiIdeApprovedRepairExecutionPlan({
      generatedAt: '2026-07-06T15:00:00.000Z',
      approvalReceiptPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-approved-repair-execution-plan.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-approved-repair-execution-plan.md'));
    expect(json).toContain('repoassure.ai-ide-approved-repair-execution-plan.v1');
    expect(markdown).toContain('Manual repair planning may proceed only for approved manual repair candidates.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildApprovalReceipt(root: string): AiIdeRepairApprovalReceipt {
  return {
    schemaVersion: 'repoassure.ai-ide-repair-approval-receipt.v1',
    generatedAt: '2026-07-06T10:00:00.000Z',
    sourceDecisionPackage: `${root}/ai-ide-repair-decision-package.json`,
    receiptSummary: {
      totalApprovalItems: 5,
      approved: 2,
      rejected: 1,
      deferred: 1,
      acceptedRisk: 1,
      pending: 1,
      approvedManualRepairCandidates: 1
    },
    approvalItems: [
      buildApprovalItem(root, 'P1-fix-target-regression', 'manual_repair_candidate', 'approve', true, 'agent-reach'),
      buildApprovalItem(root, 'P0-improve-repair-plan', 'repoassure_product_improvement', 'accept_risk', false, 'agent-reach'),
      buildApprovalItem(root, 'P1-document-target-stack', 'environment_prerequisite', 'defer', false, 'openclaw-ui'),
      buildApprovalItem(root, 'P2-rejected-investigation', 'deferred_or_blocked', 'reject', false, 'legacy-ui'),
      buildApprovalItem(root, 'P2-pending-evidence', 'manual_repair_candidate', 'pending', false, 'legacy-ui')
    ],
    maintainerApprovalChecklist: ['Confirm every approval item has decision evidence before repair execution starts.'],
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'target_repo_pull_request_creation',
      'target_repo_issue_or_advisory_creation'
    ],
    maintainerReviewBoundary: 'Stop for maintainer review before modifying target repo files, applying patches, creating branches, commits, pull requests, issues, or advisories.',
    redactionBoundary: 'Local-only approval receipt.',
    nonAuthorizationBoundary: 'This approval receipt records maintainer decisions only.'
  };
}

function buildApprovalItem(
  root: string,
  sourceActionId: string,
  decisionType: AiIdeRepairApprovalReceipt['approvalItems'][number]['decisionType'],
  approvalDecision: AiIdeRepairApprovalReceipt['approvalItems'][number]['approvalDecision'],
  approvedForManualRepairExecution: boolean,
  targetId: string
): AiIdeRepairApprovalReceipt['approvalItems'][number] {
  return {
    sourceActionId,
    decisionType,
    requiredApproval: decisionType === 'repoassure_product_improvement' ? 'repoassure_maintainer' : 'target_repo_maintainer',
    approverRole: decisionType === 'repoassure_product_improvement' ? 'repoassure_maintainer' : 'target_repo_maintainer',
    approvalDecision,
    approvalEvidence: `Maintainer reviewed ${sourceActionId}.`,
    targetIds: [targetId],
    approvedForManualRepairExecution,
    nextAction: approvedForManualRepairExecution
      ? 'Manual repair execution may proceed only in a separate authorized repair goal or workflow.'
      : 'Do not execute this item as target repo repair.',
    readOrderPaths: [
      `${root}/${targetId}/target-repo-feedback-summary.json`,
      `${root}/${targetId}/repair-task-package.json`
    ],
    verificationChecklist: [`Rerun acceptance for ${targetId}.`]
  };
}
