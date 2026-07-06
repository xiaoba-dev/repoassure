import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeRepairApprovalReceipt,
  buildAiIdeRepairApprovalReceiptMarkdown,
  writeAiIdeRepairApprovalReceipt
} from '../../packages/acceptance/src/ai-ide-repair-approval-receipt.js';
import type { AiIdeRepairDecisionPackage } from '../../packages/acceptance/src/ai-ide-repair-decision-package.js';

describe('AI IDE repair approval receipt', () => {
  it('records maintainer approval decisions without mutating target repos', () => {
    const decisionPackage = buildDecisionPackage('/private/tmp/repoassure-approval-TOKEN=secret-value');

    const receipt = buildAiIdeRepairApprovalReceipt({
      generatedAt: '2026-07-06T10:00:00.000Z',
      decisionPackagePath: '/private/tmp/repoassure-approval-TOKEN=secret-value/ai-ide-repair-decision-package.json',
      decisionPackage,
      approvalDecisions: [
        buildApproval('P0-improve-repair-plan', 'accept_risk', 'RepoAssure maintainer accepts backlog risk for one campaign.'),
        buildApproval('P1-document-target-stack', 'defer', 'Target runtime prerequisite is not documented yet.'),
        buildApproval('P1-fix-target-regression', 'approve', 'Maintainer approves manual repair planning after reviewing evidence.'),
        buildApproval('P2-deferred-investigation', 'reject', 'Evidence is incomplete and must not enter repair execution.')
      ]
    });
    const markdown = buildAiIdeRepairApprovalReceiptMarkdown(receipt);
    const serialized = JSON.stringify(receipt);

    expect(receipt.schemaVersion).toBe('repoassure.ai-ide-repair-approval-receipt.v1');
    expect(receipt.sourceDecisionPackage).toContain('ai-ide-repair-decision-package.json');
    expect(receipt.receiptSummary).toMatchObject({
      totalApprovalItems: 4,
      approved: 1,
      rejected: 1,
      deferred: 1,
      acceptedRisk: 1,
      approvedManualRepairCandidates: 1,
      pending: 0
    });
    expect(receipt.approvalItems).toEqual([
      expect.objectContaining({
        sourceActionId: 'P0-improve-repair-plan',
        decisionType: 'repoassure_product_improvement',
        approvalDecision: 'accept_risk',
        approvedForManualRepairExecution: false
      }),
      expect.objectContaining({
        sourceActionId: 'P1-document-target-stack',
        decisionType: 'environment_prerequisite',
        approvalDecision: 'defer',
        approvedForManualRepairExecution: false
      }),
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        decisionType: 'manual_repair_candidate',
        approvalDecision: 'approve',
        approvedForManualRepairExecution: true,
        nextAction: 'Manual repair execution may proceed only in a separate authorized repair goal or workflow.'
      }),
      expect.objectContaining({
        sourceActionId: 'P2-deferred-investigation',
        decisionType: 'deferred_or_blocked',
        approvalDecision: 'reject',
        approvedForManualRepairExecution: false
      })
    ]);
    expect(receipt.maintainerApprovalChecklist).toContain('Confirm every approval item has decision evidence before repair execution starts.');
    expect(receipt.nonAuthorizationBoundary).toContain('does not create target repo branches, commits, pull requests, issues, advisories, or file mutations');
    expect(receipt.blockedActions).toContain('target_repo_file_mutation');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Approval Receipt');
    expect(markdown).toContain('## Approval Items');
    expect(markdown).toContain('accept_risk');
    expect(markdown).toContain('approve');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this receipt.');
    expect(serialized).not.toContain('secret-value');
  });

  it('writes json and markdown approval receipt artifacts from local files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-repair-approval-receipt-'));
    const outputDir = join(root, 'campaign-output');
    const decisionPackagePath = join(root, 'ai-ide-repair-decision-package.json');
    const approvalsPath = join(root, 'approval-decisions.json');

    await mkdir(root, { recursive: true });
    await writeFile(decisionPackagePath, `${JSON.stringify(buildDecisionPackage(join(root, 'campaign-TOKEN=secret-value')), null, 2)}\n`);
    await writeFile(approvalsPath, `${JSON.stringify({
      decisions: [
        buildApproval('P0-improve-repair-plan', 'accept_risk', 'RepoAssure maintainer accepts backlog risk for one campaign.'),
        buildApproval('P1-document-target-stack', 'defer', 'Target runtime prerequisite is not documented yet.'),
        buildApproval('P1-fix-target-regression', 'approve', 'Maintainer approves manual repair planning after reviewing evidence.'),
        buildApproval('P2-deferred-investigation', 'reject', 'Evidence is incomplete and must not enter repair execution.')
      ]
    }, null, 2)}\n`);

    const result = await writeAiIdeRepairApprovalReceipt({
      generatedAt: '2026-07-06T10:00:00.000Z',
      decisionPackagePath,
      approvalsPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-repair-approval-receipt.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-repair-approval-receipt.md'));
    expect(json).toContain('repoassure.ai-ide-repair-approval-receipt.v1');
    expect(markdown).toContain('Manual repair execution may proceed only in a separate authorized repair goal or workflow.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildApproval(
  sourceActionId: string,
  decision: 'approve' | 'reject' | 'defer' | 'accept_risk',
  evidence: string
): { sourceActionId: string; decision: 'approve' | 'reject' | 'defer' | 'accept_risk'; evidence: string; approverRole: string } {
  return {
    sourceActionId,
    decision,
    evidence,
    approverRole: decision === 'accept_risk' ? 'repoassure_maintainer' : 'target_repo_maintainer'
  };
}

function buildDecisionPackage(root: string): AiIdeRepairDecisionPackage {
  return {
    schemaVersion: 'repoassure.ai-ide-repair-decision-package.v1',
    generatedAt: '2026-07-06T09:05:00.000Z',
    sourceConsumptionReport: `${root}/ai-ide-playbook-consumption-report.json`,
    decisionSummary: {
      totalDecisionItems: 4,
      manualRepairCandidates: 1,
      environmentPrerequisites: 1,
      repoassureProductImprovements: 1,
      deferredOrBlocked: 1,
      noActionTargets: 1
    },
    decisionItems: [
      buildDecisionItem(root, 'P0-improve-repair-plan', 'repoassure_product_improvement', 'repoassure_maintainer', 'agent-reach'),
      buildDecisionItem(root, 'P1-document-target-stack', 'environment_prerequisite', 'target_repo_maintainer', 'openclaw-ui'),
      buildDecisionItem(root, 'P1-fix-target-regression', 'manual_repair_candidate', 'target_repo_maintainer', 'agent-reach'),
      buildDecisionItem(root, 'P2-deferred-investigation', 'deferred_or_blocked', 'manual_triage_required', 'legacy-ui')
    ],
    targetReviewSummary: [
      {
        targetId: 'agent-reach',
        runStatus: 'failed',
        blockerCategory: 'unknown',
        nextRecommendedProductAction: 'improve_repair_plan',
        recommendedHandling: 'repair_candidate_after_maintainer_review',
        reviewDecision: 'manual_repair_candidate'
      }
    ],
    maintainerDecisionChecklist: ['Approve or reject each manual_repair_candidate before any target repo edit.'],
    inheritedDryRunBlockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'target_repo_pull_request_creation',
      'target_repo_issue_or_advisory_creation',
      'npm_publish',
      'github_release',
      'public_launch',
      'customer_contact',
      'commercial_availability_claim'
    ],
    maintainerReviewBoundary: 'Stop for maintainer review before modifying target repo files, applying patches, creating branches, commits, pull requests, issues, or advisories.',
    redactionBoundary: 'Local-only decision package.',
    nonAuthorizationBoundary: 'This decision package is maintainer review guidance only.'
  };
}

function buildDecisionItem(
  root: string,
  sourceActionId: string,
  decisionType: AiIdeRepairDecisionPackage['decisionItems'][number]['decisionType'],
  requiredApproval: AiIdeRepairDecisionPackage['decisionItems'][number]['requiredApproval'],
  targetId: string
): AiIdeRepairDecisionPackage['decisionItems'][number] {
  return {
    sourceActionId,
    priority: sourceActionId.startsWith('P0') ? 'P0' : sourceActionId.startsWith('P1') ? 'P1' : 'P2',
    ownerSurface: decisionType === 'repoassure_product_improvement' ? 'repoassure_product' : 'maintainer_or_target_repo',
    action: sourceActionId.replace(/^P\d-/, ''),
    targetIds: [targetId],
    decisionType,
    requiredApproval,
    rationale: `Action ${sourceActionId} requires maintainer approval.`,
    recommendedNextAction: 'Review evidence before repair execution.',
    readOrderPaths: [
      `${root}/${targetId}/target-repo-feedback-summary.json`,
      `${root}/${targetId}/repair-task-package.json`
    ],
    verificationChecklist: [`Rerun acceptance for ${targetId}.`],
    inheritedBlockedActions: ['target_repo_file_mutation']
  };
}
