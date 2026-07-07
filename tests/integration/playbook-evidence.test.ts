import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import type { AiIdeApprovedRepairExecutionPlan } from '../../packages/acceptance/src/ai-ide-approved-repair-execution-plan.js';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('repair execution evidence report script', () => {
  it('generates repair execution evidence report artifacts from local plan and evidence input', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-evidence-'));
    const outputDir = join(root, 'campaign-output');
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const executionPlanPath = join(root, 'ai-ide-approved-repair-execution-plan.json');
    const evidencePath = join(root, 'repair-execution-evidence-input.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(executionPlanPath, `${JSON.stringify(buildExecutionPlan(secretRoot), null, 2)}\n`);
    await writeFile(evidencePath, `${JSON.stringify({
      executionItems: [
        {
          sourceActionId: 'P1-fix-target-regression',
          executionStatus: 'verified',
          readOrderPathsRead: [
            `${secretRoot}/agent-reach/target-repo-feedback-summary.json`,
            `${secretRoot}/agent-reach/repair-task-package.json`
          ],
          verificationResults: [
            {
              label: 'Rerun acceptance for agent-reach.',
              status: 'passed',
              evidence: 'Acceptance passed after maintainer-reviewed repair.'
            }
          ],
          maintainerReviewStatus: 'pending_review',
          notes: 'No target repo mutation was executed by RepoAssure.'
        }
      ],
      boundaryEvidence: {
        unauthorizedActions: [],
        notes: 'Report generated locally.'
      }
    }, null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['playbook:evidence', '--', '--execution-plan', executionPlanPath, '--evidence', evidencePath, '--output', outputDir],
      { cwd: process.cwd(), timeout: SCRIPT_TEST_TIMEOUT_MS }
    );
    const jsonPath = join(outputDir, 'ai-ide-repair-execution-evidence-report.json');
    const markdownPath = join(outputDir, 'ai-ide-repair-execution-evidence-report.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const report = JSON.parse(json) as {
      schemaVersion: string;
      evidenceSummary: { verifiedItems: number; boundaryViolations: number };
      itemReports: Array<{ sourceActionId: string; readOrderCompliance: string }>;
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(report.schemaVersion).toBe('repoassure.ai-ide-repair-execution-evidence-report.v1');
    expect(report.evidenceSummary).toMatchObject({
      verifiedItems: 1,
      boundaryViolations: 0
    });
    expect(report.itemReports).toEqual([
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        readOrderCompliance: 'complete'
      })
    ]);
    expect(markdown).toContain('## Boundary Report');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this report.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);
});

function buildExecutionPlan(root: string): AiIdeApprovedRepairExecutionPlan {
  return {
    schemaVersion: 'repoassure.ai-ide-approved-repair-execution-plan.v1',
    generatedAt: '2026-07-06T15:00:00.000Z',
    sourceApprovalReceipt: `${root}/ai-ide-repair-approval-receipt.json`,
    executionSummary: {
      totalApprovalItems: 1,
      approvedExecutionItems: 1,
      excludedApprovalItems: 0,
      blockedActions: 5
    },
    approvedExecutionItems: [
      {
        sourceActionId: 'P1-fix-target-regression',
        decisionType: 'manual_repair_candidate',
        approvalDecision: 'approve',
        approvalEvidence: 'Maintainer approved manual repair planning.',
        approverRole: 'target_repo_maintainer',
        targetIds: ['agent-reach'],
        executionMode: 'plan_only',
        requiresSeparateRepairAuthorization: true,
        nextAction: 'Manual repair planning may proceed only for approved manual repair candidates.',
        readOrderPaths: [
          `${root}/agent-reach/target-repo-feedback-summary.json`,
          `${root}/agent-reach/repair-task-package.json`
        ],
        verificationChecklist: ['Rerun acceptance for agent-reach.']
      }
    ],
    excludedApprovalItems: [],
    executionChecklist: ['Read every approvedExecutionItems[].readOrderPaths entry before proposing a target repo patch.'],
    rollbackAndReviewChecklist: ['Do not apply patches without a separate repair execution goal and maintainer review.'],
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation',
      'target_repo_pull_request_creation',
      'target_repo_issue_or_advisory_creation'
    ],
    maintainerReviewBoundary: 'Stop for maintainer review before modifying target repo files, applying patches, creating branches, commits, pull requests, issues, or advisories.',
    redactionBoundary: 'Local-only approved repair execution plan.',
    nonAuthorizationBoundary: 'This approved repair execution plan is planning evidence only.'
  };
}
