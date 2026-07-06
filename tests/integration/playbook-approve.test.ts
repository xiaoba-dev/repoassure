import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import type { AiIdeRepairDecisionPackage } from '../../packages/acceptance/src/ai-ide-repair-decision-package.js';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('repair approval receipt script', () => {
  it('generates approval receipt artifacts from local maintainer decisions', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-approve-'));
    const outputDir = join(root, 'campaign-output');
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const decisionPackagePath = join(root, 'ai-ide-repair-decision-package.json');
    const approvalsPath = join(root, 'approval-decisions.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(decisionPackagePath, `${JSON.stringify(buildDecisionPackage(secretRoot), null, 2)}\n`);
    await writeFile(approvalsPath, `${JSON.stringify({
      decisions: [
        buildApproval('P1-fix-target-regression', 'approve', 'Maintainer approves manual repair planning after reviewing evidence.'),
        buildApproval('P1-document-target-stack', 'defer', 'Target runtime prerequisite is not documented yet.')
      ]
    }, null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['playbook:approve', '--', '--decision-package', decisionPackagePath, '--approvals', approvalsPath, '--output', outputDir],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(outputDir, 'ai-ide-repair-approval-receipt.json');
    const markdownPath = join(outputDir, 'ai-ide-repair-approval-receipt.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const receipt = JSON.parse(json) as {
      schemaVersion: string;
      receiptSummary: { approved: number; deferred: number; pending: number; approvedManualRepairCandidates: number };
      approvalItems: Array<{ sourceActionId: string; approvalDecision: string; approvedForManualRepairExecution: boolean }>;
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(receipt.schemaVersion).toBe('repoassure.ai-ide-repair-approval-receipt.v1');
    expect(receipt.receiptSummary).toMatchObject({
      approved: 1,
      deferred: 1,
      pending: 1,
      approvedManualRepairCandidates: 1
    });
    expect(receipt.approvalItems).toEqual([
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        approvalDecision: 'approve',
        approvedForManualRepairExecution: true
      }),
      expect.objectContaining({
        sourceActionId: 'P1-document-target-stack',
        approvalDecision: 'defer',
        approvedForManualRepairExecution: false
      }),
      expect.objectContaining({
        sourceActionId: 'P0-improve-repair-plan',
        approvalDecision: 'pending',
        approvedForManualRepairExecution: false
      })
    ]);
    expect(markdown).toContain('## Approval Items');
    expect(markdown).toContain('Manual repair execution may proceed only in a separate authorized repair goal or workflow.');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this receipt.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildApproval(
  sourceActionId: string,
  decision: 'approve' | 'defer',
  evidence: string
): { sourceActionId: string; decision: 'approve' | 'defer'; evidence: string; approverRole: string } {
  return {
    sourceActionId,
    decision,
    evidence,
    approverRole: 'target_repo_maintainer'
  };
}

function buildDecisionPackage(root: string): AiIdeRepairDecisionPackage {
  return {
    schemaVersion: 'repoassure.ai-ide-repair-decision-package.v1',
    generatedAt: '2026-07-06T09:05:00.000Z',
    sourceConsumptionReport: `${root}/ai-ide-playbook-consumption-report.json`,
    decisionSummary: {
      totalDecisionItems: 3,
      manualRepairCandidates: 1,
      environmentPrerequisites: 1,
      repoassureProductImprovements: 1,
      deferredOrBlocked: 0,
      noActionTargets: 1
    },
    decisionItems: [
      buildDecisionItem(root, 'P1-fix-target-regression', 'manual_repair_candidate', 'target_repo_maintainer', 'agent-reach'),
      buildDecisionItem(root, 'P1-document-target-stack', 'environment_prerequisite', 'target_repo_maintainer', 'openclaw-ui'),
      buildDecisionItem(root, 'P0-improve-repair-plan', 'repoassure_product_improvement', 'repoassure_maintainer', 'agent-reach')
    ],
    targetReviewSummary: [],
    maintainerDecisionChecklist: ['Approve or reject each manual_repair_candidate before any target repo edit.'],
    inheritedDryRunBlockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'target_repo_pull_request_creation',
      'target_repo_issue_or_advisory_creation'
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
    priority: sourceActionId.startsWith('P0') ? 'P0' : 'P1',
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
