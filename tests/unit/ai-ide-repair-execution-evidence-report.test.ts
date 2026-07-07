import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeRepairExecutionEvidenceReport,
  buildAiIdeRepairExecutionEvidenceReportMarkdown,
  writeAiIdeRepairExecutionEvidenceReport
} from '../../packages/acceptance/src/ai-ide-repair-execution-evidence-report.js';
import type { AiIdeApprovedRepairExecutionPlan } from '../../packages/acceptance/src/ai-ide-approved-repair-execution-plan.js';

describe('AI IDE repair execution evidence report', () => {
  it('records execution evidence for approved repair items without authorizing target repo mutation', () => {
    const executionPlan = buildExecutionPlan('/private/tmp/repoassure-evidence-TOKEN=secret-value');

    const report = buildAiIdeRepairExecutionEvidenceReport({
      generatedAt: '2026-07-07T10:00:00.000Z',
      executionPlanPath: '/private/tmp/repoassure-evidence-TOKEN=secret-value/ai-ide-approved-repair-execution-plan.json',
      executionPlan,
      executionEvidence: {
        executionItems: [
          {
            sourceActionId: 'P1-fix-target-regression',
            executionStatus: 'verified',
            readOrderPathsRead: [
              '/private/tmp/repoassure-evidence-TOKEN=secret-value/agent-reach/target-repo-feedback-summary.json',
              '/private/tmp/repoassure-evidence-TOKEN=secret-value/agent-reach/repair-task-package.json'
            ],
            verificationResults: [
              {
                label: 'Rerun acceptance for agent-reach.',
                status: 'passed',
                evidence: 'pnpm user:accept -- --repo agent-reach passed after manual repair review.'
              }
            ],
            maintainerReviewStatus: 'pending_review',
            notes: 'No target repo branch, commit, pull request, issue, advisory, or file mutation was created.'
          }
        ],
        boundaryEvidence: {
          unauthorizedActions: [],
          notes: 'Execution evidence was generated locally from maintainer-provided results.'
        }
      }
    });
    const markdown = buildAiIdeRepairExecutionEvidenceReportMarkdown(report);
    const serialized = JSON.stringify(report);

    expect(report.schemaVersion).toBe('repoassure.ai-ide-repair-execution-evidence-report.v1');
    expect(report.sourceExecutionPlan).toContain('ai-ide-approved-repair-execution-plan.json');
    expect(report.evidenceSummary).toMatchObject({
      totalApprovedExecutionItems: 1,
      verifiedItems: 1,
      blockedItems: 0,
      failedItems: 0,
      notStartedItems: 0,
      boundaryViolations: 0,
      blockedActions: 5
    });
    expect(report.itemReports).toEqual([
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        executionStatus: 'verified',
        readOrderCompliance: 'complete',
        maintainerReviewStatus: 'pending_review',
        targetIds: ['agent-reach'],
        nonAuthorizationBoundaryMaintained: true
      })
    ]);
    expect(report.itemReports[0]?.verificationResults).toEqual([
      expect.objectContaining({
        label: 'Rerun acceptance for agent-reach.',
        status: 'passed'
      })
    ]);
    expect(report.executionEvidenceChecklist).toContain('Confirm every itemReports[].readOrderCompliance is complete before maintainer merge review.');
    expect(report.rollbackAndReviewChecklist).toContain('Do not merge target repo changes until maintainer review accepts the verification evidence.');
    expect(report.nonAuthorizationBoundary).toContain('does not create target repo branches');
    expect(report.blockedActions).toContain('target_repo_file_mutation');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Execution Evidence Report');
    expect(markdown).toContain('## Item Reports');
    expect(markdown).toContain('P1-fix-target-regression');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this report.');
    expect(serialized).not.toContain('secret-value');
  });

  it('writes json and markdown evidence report artifacts from local plan and evidence files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-repair-execution-evidence-report-'));
    const outputDir = join(root, 'campaign-output');
    const executionPlanPath = join(root, 'ai-ide-approved-repair-execution-plan.json');
    const evidencePath = join(root, 'repair-execution-evidence-input.json');

    await mkdir(root, { recursive: true });
    await writeFile(executionPlanPath, `${JSON.stringify(buildExecutionPlan(join(root, 'campaign-TOKEN=secret-value')), null, 2)}\n`);
    await writeFile(evidencePath, `${JSON.stringify({
      executionItems: [
        {
          sourceActionId: 'P1-fix-target-regression',
          executionStatus: 'blocked',
          readOrderPathsRead: [],
          verificationResults: [],
          maintainerReviewStatus: 'not_ready',
          notes: 'Target dependency install is still blocked.'
        }
      ],
      boundaryEvidence: {
        unauthorizedActions: [],
        notes: 'No target repo mutation was executed.'
      }
    }, null, 2)}\n`);

    const result = await writeAiIdeRepairExecutionEvidenceReport({
      generatedAt: '2026-07-07T10:00:00.000Z',
      executionPlanPath,
      evidencePath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-repair-execution-evidence-report.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-repair-execution-evidence-report.md'));
    expect(json).toContain('repoassure.ai-ide-repair-execution-evidence-report.v1');
    expect(markdown).toContain('## Boundary Report');
    expect(markdown).toContain('blocked');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildExecutionPlan(root: string): AiIdeApprovedRepairExecutionPlan {
  return {
    schemaVersion: 'repoassure.ai-ide-approved-repair-execution-plan.v1',
    generatedAt: '2026-07-06T15:00:00.000Z',
    sourceApprovalReceipt: `${root}/ai-ide-repair-approval-receipt.json`,
    executionSummary: {
      totalApprovalItems: 3,
      approvedExecutionItems: 1,
      excludedApprovalItems: 2,
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
    excludedApprovalItems: [
      {
        sourceActionId: 'P1-document-target-stack',
        decisionType: 'environment_prerequisite',
        approvalDecision: 'defer',
        targetIds: ['openclaw-ui'],
        exclusionReason: 'not_approved_manual_repair_candidate'
      },
      {
        sourceActionId: 'P2-pending-evidence',
        decisionType: 'manual_repair_candidate',
        approvalDecision: 'pending',
        targetIds: ['legacy-ui'],
        exclusionReason: 'not_approved_manual_repair_candidate'
      }
    ],
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
