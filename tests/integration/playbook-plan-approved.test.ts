import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import type { AiIdeRepairApprovalReceipt } from '../../packages/acceptance/src/ai-ide-repair-approval-receipt.js';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('approved repair execution plan script', () => {
  it('generates approved repair execution plan artifacts from a local approval receipt', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-plan-approved-'));
    const outputDir = join(root, 'campaign-output');
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const approvalReceiptPath = join(root, 'ai-ide-repair-approval-receipt.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(approvalReceiptPath, `${JSON.stringify(buildApprovalReceipt(secretRoot), null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['playbook:plan-approved', '--', '--approval-receipt', approvalReceiptPath, '--output', outputDir],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(outputDir, 'ai-ide-approved-repair-execution-plan.json');
    const markdownPath = join(outputDir, 'ai-ide-approved-repair-execution-plan.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const plan = JSON.parse(json) as {
      schemaVersion: string;
      executionSummary: { approvedExecutionItems: number; excludedApprovalItems: number; blockedActions: number };
      approvedExecutionItems: Array<{ sourceActionId: string; executionMode: string }>;
      excludedApprovalItems: Array<{ sourceActionId: string; exclusionReason: string }>;
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(plan.schemaVersion).toBe('repoassure.ai-ide-approved-repair-execution-plan.v1');
    expect(plan.executionSummary).toMatchObject({
      approvedExecutionItems: 1,
      excludedApprovalItems: 2,
      blockedActions: 5
    });
    expect(plan.approvedExecutionItems).toEqual([
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        executionMode: 'plan_only'
      })
    ]);
    expect(plan.excludedApprovalItems).toEqual([
      expect.objectContaining({
        sourceActionId: 'P1-document-target-stack',
        exclusionReason: 'not_approved_manual_repair_candidate'
      }),
      expect.objectContaining({
        sourceActionId: 'P2-pending-evidence',
        exclusionReason: 'not_approved_manual_repair_candidate'
      })
    ]);
    expect(markdown).toContain('## Approved Execution Items');
    expect(markdown).toContain('## Rollback And Review Checklist');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this plan.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildApprovalReceipt(root: string): AiIdeRepairApprovalReceipt {
  return {
    schemaVersion: 'repoassure.ai-ide-repair-approval-receipt.v1',
    generatedAt: '2026-07-06T10:00:00.000Z',
    sourceDecisionPackage: `${root}/ai-ide-repair-decision-package.json`,
    receiptSummary: {
      totalApprovalItems: 3,
      approved: 1,
      rejected: 0,
      deferred: 1,
      acceptedRisk: 0,
      pending: 1,
      approvedManualRepairCandidates: 1
    },
    approvalItems: [
      buildApprovalItem(root, 'P1-fix-target-regression', 'manual_repair_candidate', 'approve', true, 'agent-reach'),
      buildApprovalItem(root, 'P1-document-target-stack', 'environment_prerequisite', 'defer', false, 'openclaw-ui'),
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
