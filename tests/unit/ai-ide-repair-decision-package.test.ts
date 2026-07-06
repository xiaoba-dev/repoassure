import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeRepairDecisionPackage,
  buildAiIdeRepairDecisionPackageMarkdown,
  writeAiIdeRepairDecisionPackage
} from '../../packages/acceptance/src/ai-ide-repair-decision-package.js';
import type { AiIdePlaybookConsumptionReport } from '../../packages/acceptance/src/ai-ide-playbook-consumption-report.js';

describe('AI IDE repair decision package', () => {
  it('classifies dry-run understanding into maintainer repair decisions', () => {
    const report = buildConsumptionReport('/private/tmp/repoassure-decision-TOKEN=secret-value');

    const decisionPackage = buildAiIdeRepairDecisionPackage({
      generatedAt: '2026-07-06T09:05:00.000Z',
      consumptionReportPath: '/private/tmp/repoassure-decision-TOKEN=secret-value/ai-ide-playbook-consumption-report.json',
      consumptionReport: report
    });
    const markdown = buildAiIdeRepairDecisionPackageMarkdown(decisionPackage);
    const serialized = JSON.stringify(decisionPackage);

    expect(decisionPackage.schemaVersion).toBe('repoassure.ai-ide-repair-decision-package.v1');
    expect(decisionPackage.sourceConsumptionReport).toContain('ai-ide-playbook-consumption-report.json');
    expect(decisionPackage.decisionSummary).toMatchObject({
      totalDecisionItems: 3,
      manualRepairCandidates: 1,
      environmentPrerequisites: 1,
      repoassureProductImprovements: 1,
      noActionTargets: 1
    });
    expect(decisionPackage.decisionItems).toEqual([
      expect.objectContaining({
        sourceActionId: 'P0-improve-repair-plan',
        decisionType: 'repoassure_product_improvement',
        recommendedNextAction: 'Route to RepoAssure product backlog before target repo repair.',
        requiredApproval: 'repoassure_maintainer'
      }),
      expect.objectContaining({
        sourceActionId: 'P1-document-target-stack',
        decisionType: 'environment_prerequisite',
        recommendedNextAction: 'Document or satisfy target runtime prerequisites before repair.',
        requiredApproval: 'target_repo_maintainer'
      }),
      expect.objectContaining({
        sourceActionId: 'P1-fix-target-regression',
        decisionType: 'manual_repair_candidate',
        recommendedNextAction: 'Maintainer may approve manual target repo repair using the listed read order and verification checklist.',
        requiredApproval: 'target_repo_maintainer'
      })
    ]);
    expect(decisionPackage.targetReviewSummary).toEqual([
      expect.objectContaining({
        targetId: 'odinsight',
        recommendedHandling: 'no_repair_action_required',
        reviewDecision: 'no_action'
      }),
      expect.objectContaining({
        targetId: 'agent-reach',
        reviewDecision: 'manual_repair_candidate'
      }),
      expect.objectContaining({
        targetId: 'openclaw-ui',
        reviewDecision: 'environment_prerequisite'
      })
    ]);
    expect(decisionPackage.maintainerDecisionChecklist).toContain('Approve or reject each manual_repair_candidate before any target repo edit.');
    expect(decisionPackage.nonAuthorizationBoundary).toContain('does not authorize target repo mutation');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Decision Package');
    expect(markdown).toContain('## Decision Items');
    expect(markdown).toContain('repoassure_product_improvement');
    expect(markdown).toContain('environment_prerequisite');
    expect(markdown).toContain('manual_repair_candidate');
    expect(markdown).toContain('## Non-Authorization Boundary');
    expect(serialized).not.toContain('secret-value');
  });

  it('writes json and markdown decision package artifacts without applying repairs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-repair-decision-package-'));
    const outputDir = join(root, 'campaign-output');
    const consumptionReportPath = join(root, 'ai-ide-playbook-consumption-report.json');
    const report = buildConsumptionReport(join(root, 'campaign-TOKEN=secret-value'));

    await mkdir(root, { recursive: true });
    await writeFile(consumptionReportPath, `${JSON.stringify(report, null, 2)}\n`);

    const result = await writeAiIdeRepairDecisionPackage({
      generatedAt: '2026-07-06T09:05:00.000Z',
      consumptionReportPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-repair-decision-package.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-repair-decision-package.md'));
    expect(json).toContain('repoassure.ai-ide-repair-decision-package.v1');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildConsumptionReport(root: string): AiIdePlaybookConsumptionReport {
  return {
    schemaVersion: 'repoassure.ai-ide-playbook-consumption-report.v1',
    generatedAt: '2026-07-06T09:00:00.000Z',
    sourcePlaybook: `${root}/ai-ide-repair-playbook.json`,
    campaignUnderstanding: {
      totalTargets: 3,
      passedTargets: 1,
      blockedTargets: 1,
      failedTargets: 1,
      missingEvidenceTargets: 0,
      targetDispositions: [
        {
          targetId: 'odinsight',
          runStatus: 'passed',
          blockerCategory: 'none',
          nextRecommendedProductAction: 'no_action',
          recommendedHandling: 'no_repair_action_required'
        },
        {
          targetId: 'agent-reach',
          runStatus: 'failed',
          blockerCategory: 'unknown',
          nextRecommendedProductAction: 'improve_repair_plan',
          recommendedHandling: 'repair_candidate_after_maintainer_review'
        },
        {
          targetId: 'openclaw-ui',
          runStatus: 'blocked',
          blockerCategory: 'environment',
          nextRecommendedProductAction: 'document_target_stack',
          recommendedHandling: 'environment_prerequisite_before_repair'
        }
      ]
    },
    repairTaskUnderstanding: [
      buildTask(root, 'P0-improve-repair-plan', 'repoassure_product', 'improve_repair_plan', 'agent-reach'),
      buildTask(root, 'P1-document-target-stack', 'maintainer_or_target_repo', 'document_target_stack', 'openclaw-ui'),
      buildTask(root, 'P1-fix-target-regression', 'maintainer_or_target_repo', 'fix_target_regression', 'agent-reach')
    ],
    readOrderCompliance: {
      allExecutionStepsHaveReadOrder: true,
      allExecutionStepsHaveVerificationChecklist: true,
      allExecutionStepsPreserveMaintainerBoundary: true,
      missingReadOrderActionIds: [],
      missingVerificationActionIds: [],
      missingMaintainerBoundaryActionIds: []
    },
    dryRunDecision: {
      automationMode: 'dry_run_report_only',
      allowedNextActions: [
        'maintainer_review',
        'maintainer_approved_manual_target_repo_repair',
        'rerun_verification_after_approved_changes',
        'regenerate_campaign_summary_and_playbook'
      ],
      blockedActions: [
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
      boundaryStatement: 'This report is a dry-run understanding artifact only. No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized.'
    },
    aiIdeConsumptionChecklist: [
      'Review campaignContext.targetStatusMatrix before editing target repos.',
      'Read each executionPlan item in readOrder before opening repair-task-package.json.'
    ],
    maintainerReviewBoundary: 'Stop for maintainer review before modifying target repo files, applying patches, creating branches, commits, pull requests, issues, or advisories.',
    redactionBoundary: 'Local-only execution guidance.',
    nonAuthorizationBoundary: 'This playbook is repair execution guidance only; it does not authorize public launch.'
  };
}

function buildTask(
  root: string,
  sourceActionId: string,
  ownerSurface: string,
  action: string,
  targetId: 'agent-reach' | 'openclaw-ui'
): AiIdePlaybookConsumptionReport['repairTaskUnderstanding'][number] {
  const targetStatus = targetId === 'openclaw-ui'
    ? {
        targetId,
        runStatus: 'blocked',
        blockerCategory: 'environment',
        nextRecommendedProductAction: 'document_target_stack',
        recommendedHandling: 'environment_prerequisite_before_repair' as const
      }
    : {
        targetId,
        runStatus: 'failed',
        blockerCategory: 'unknown',
        nextRecommendedProductAction: 'improve_repair_plan',
        recommendedHandling: 'repair_candidate_after_maintainer_review' as const
      };

  return {
    sourceActionId,
    priority: sourceActionId.startsWith('P0') ? 'P0' : 'P1',
    ownerSurface,
    action,
    targetIds: [targetId],
    targetStatuses: [targetStatus],
    readOrderArtifactKinds: [
      'target_repo_feedback_summary',
      'ai_ide_handoff_package',
      'repair_task_package',
      'user_validation_evidence_loop'
    ],
    readOrderPaths: [
      `${root}/${targetId}/target-repo-feedback-summary.json`,
      `${root}/${targetId}/ai-ide-handoff-package.json`,
      `${root}/${targetId}/repair-task-package.json`,
      `${root}/${targetId}/user-validation-evidence-loop.json`
    ],
    verificationChecklist: [
      `Inspect repair task package evidence for ${targetId}.`,
      'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
    ],
    maintainerReviewRequired: true,
    maintainerReviewBoundary: 'Stop for maintainer review before modifying target repo files, applying patches, creating branches, commits, pull requests, issues, or advisories.'
  };
}
