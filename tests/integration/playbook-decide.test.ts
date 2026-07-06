import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import type { AiIdePlaybookConsumptionReport } from '../../packages/acceptance/src/ai-ide-playbook-consumption-report.js';

const execFileAsync = promisify(execFile);
const SCRIPT_TEST_TIMEOUT_MS = 30_000;

describe('repair decision package script', () => {
  it('generates maintainer decision package artifacts from a local consumption report', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-decide-'));
    const outputDir = join(root, 'campaign-output');
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const consumptionReportPath = join(root, 'ai-ide-playbook-consumption-report.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(consumptionReportPath, `${JSON.stringify(buildConsumptionReport(secretRoot), null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['playbook:decide', '--', '--consumption-report', consumptionReportPath, '--output', outputDir],
      { cwd: process.cwd(), timeout: 30_000 }
    );
    const jsonPath = join(outputDir, 'ai-ide-repair-decision-package.json');
    const markdownPath = join(outputDir, 'ai-ide-repair-decision-package.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const decisionPackage = JSON.parse(json) as {
      schemaVersion: string;
      decisionSummary: { manualRepairCandidates: number; environmentPrerequisites: number; repoassureProductImprovements: number };
      decisionItems: Array<{ sourceActionId: string; decisionType: string }>;
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(decisionPackage.schemaVersion).toBe('repoassure.ai-ide-repair-decision-package.v1');
    expect(decisionPackage.decisionSummary).toMatchObject({
      manualRepairCandidates: 1,
      environmentPrerequisites: 1,
      repoassureProductImprovements: 1
    });
    expect(decisionPackage.decisionItems).toEqual([
      expect.objectContaining({ sourceActionId: 'P0-improve-repair-plan', decisionType: 'repoassure_product_improvement' }),
      expect.objectContaining({ sourceActionId: 'P1-document-target-stack', decisionType: 'environment_prerequisite' }),
      expect.objectContaining({ sourceActionId: 'P1-fix-target-regression', decisionType: 'manual_repair_candidate' })
    ]);
    expect(markdown).toContain('## Decision Items');
    expect(markdown).toContain('manual_repair_candidate');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  }, SCRIPT_TEST_TIMEOUT_MS);
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
        buildTarget('odinsight', 'passed', 'none', 'no_action', 'no_repair_action_required'),
        buildTarget('agent-reach', 'failed', 'unknown', 'improve_repair_plan', 'repair_candidate_after_maintainer_review'),
        buildTarget('openclaw-ui', 'blocked', 'environment', 'document_target_stack', 'environment_prerequisite_before_repair')
      ]
    },
    repairTaskUnderstanding: [
      buildTask(root, 'P0-improve-repair-plan', 'repoassure_product', 'improve_repair_plan', 'agent-reach', 'repair_candidate_after_maintainer_review'),
      buildTask(root, 'P1-document-target-stack', 'maintainer_or_target_repo', 'document_target_stack', 'openclaw-ui', 'environment_prerequisite_before_repair'),
      buildTask(root, 'P1-fix-target-regression', 'maintainer_or_target_repo', 'fix_target_regression', 'agent-reach', 'repair_candidate_after_maintainer_review')
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
      allowedNextActions: ['maintainer_review'],
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
    aiIdeConsumptionChecklist: ['Review campaignContext.targetStatusMatrix before editing target repos.'],
    maintainerReviewBoundary: 'Stop for maintainer review before modifying target repo files, applying patches, creating branches, commits, pull requests, issues, or advisories.',
    redactionBoundary: 'Local-only execution guidance.',
    nonAuthorizationBoundary: 'This playbook is repair execution guidance only; it does not authorize public launch.'
  };
}

function buildTarget(
  targetId: string,
  runStatus: string,
  blockerCategory: string,
  nextRecommendedProductAction: string,
  recommendedHandling: AiIdePlaybookConsumptionReport['campaignUnderstanding']['targetDispositions'][number]['recommendedHandling']
): AiIdePlaybookConsumptionReport['campaignUnderstanding']['targetDispositions'][number] {
  return {
    targetId,
    runStatus,
    blockerCategory,
    nextRecommendedProductAction,
    recommendedHandling
  };
}

function buildTask(
  root: string,
  sourceActionId: string,
  ownerSurface: string,
  action: string,
  targetId: 'agent-reach' | 'openclaw-ui',
  recommendedHandling: AiIdePlaybookConsumptionReport['campaignUnderstanding']['targetDispositions'][number]['recommendedHandling']
): AiIdePlaybookConsumptionReport['repairTaskUnderstanding'][number] {
  return {
    sourceActionId,
    priority: sourceActionId.startsWith('P0') ? 'P0' : 'P1',
    ownerSurface,
    action,
    targetIds: [targetId],
    targetStatuses: [
      buildTarget(
        targetId,
        targetId === 'openclaw-ui' ? 'blocked' : 'failed',
        targetId === 'openclaw-ui' ? 'environment' : 'unknown',
        targetId === 'openclaw-ui' ? 'document_target_stack' : 'improve_repair_plan',
        recommendedHandling
      )
    ],
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
