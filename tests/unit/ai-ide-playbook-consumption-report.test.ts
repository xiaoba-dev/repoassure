import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdePlaybookConsumptionReport,
  buildAiIdePlaybookConsumptionReportMarkdown,
  writeAiIdePlaybookConsumptionReport
} from '../../packages/acceptance/src/ai-ide-playbook-consumption-report.js';
import { buildAiIdeRepairExecutionPlaybook } from '../../packages/acceptance/src/ai-ide-repair-playbook.js';
import type { ValidationCampaignSummary } from '../../packages/acceptance/src/campaign-summary.js';

describe('AI IDE playbook consumption dry-run report', () => {
  it('turns a repair playbook into a bounded AI IDE understanding report', () => {
    const root = '/private/tmp/repoassure-playbook-consumer-TOKEN=secret-value';
    const failedRunDir = `${root}/agent-reach/.hardening/runs/run-2026-07-04T10-00-00-000Z`;
    const blockedRunDir = `${root}/openclaw-ui/.hardening/runs/run-2026-07-04T10-30-00-000Z`;
    const playbook = buildAiIdeRepairExecutionPlaybook({
      generatedAt: '2026-07-04T11:05:00.000Z',
      campaignSummaryPath: `${root}/campaign-summary.json`,
      campaignSummary: buildCampaignSummary(failedRunDir, blockedRunDir)
    });

    const report = buildAiIdePlaybookConsumptionReport({
      generatedAt: '2026-07-04T11:10:00.000Z',
      playbookPath: `${root}/ai-ide-repair-playbook.json`,
      playbook
    });
    const markdown = buildAiIdePlaybookConsumptionReportMarkdown(report);
    const serialized = JSON.stringify(report);

    expect(report.schemaVersion).toBe('repoassure.ai-ide-playbook-consumption-report.v1');
    expect(report.sourcePlaybook).toContain('ai-ide-repair-playbook.json');
    expect(report.campaignUnderstanding).toMatchObject({
      totalTargets: 3,
      passedTargets: 1,
      blockedTargets: 1,
      failedTargets: 1
    });
    expect(report.campaignUnderstanding.targetDispositions).toEqual([
      expect.objectContaining({
        targetId: 'odinsight',
        runStatus: 'passed',
        recommendedHandling: 'no_repair_action_required'
      }),
      expect.objectContaining({
        targetId: 'agent-reach',
        runStatus: 'failed',
        recommendedHandling: 'repair_candidate_after_maintainer_review'
      }),
      expect.objectContaining({
        targetId: 'openclaw-ui',
        blockerCategory: 'environment',
        recommendedHandling: 'environment_prerequisite_before_repair'
      })
    ]);
    expect(report.repairTaskUnderstanding).toEqual([
      expect.objectContaining({
        sourceActionId: 'P0-improve-repair-plan',
        targetIds: ['agent-reach'],
        readOrderArtifactKinds: [
          'target_repo_feedback_summary',
          'ai_ide_handoff_package',
          'repair_task_package',
          'user_validation_evidence_loop'
        ],
        verificationChecklist: [
          'Inspect repair task package evidence for agent-reach.',
          'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
        ],
        maintainerReviewRequired: true
      }),
      expect.objectContaining({
        sourceActionId: 'P1-document-target-stack',
        targetStatuses: [expect.objectContaining({ targetId: 'openclaw-ui', blockerCategory: 'environment' })]
      })
    ]);
    expect(report.readOrderCompliance).toMatchObject({
      allExecutionStepsHaveReadOrder: true,
      allExecutionStepsHaveVerificationChecklist: true,
      allExecutionStepsPreserveMaintainerBoundary: true
    });
    expect(report.dryRunDecision.blockedActions).toContain('target_repo_file_mutation');
    expect(report.dryRunDecision.blockedActions).toContain('target_repo_pull_request_creation');
    expect(report.dryRunDecision.blockedActions).toContain('public_launch');
    expect(report.maintainerReviewBoundary).toContain('Stop for maintainer review');
    expect(markdown).toContain('# RepoAssure AI IDE Playbook Consumption Report');
    expect(markdown).toContain('## Campaign Understanding');
    expect(markdown).toContain('## Repair Task Understanding');
    expect(markdown).toContain('## Read Order Compliance');
    expect(markdown).toContain('## Blocked Actions');
    expect(markdown).toContain('target_repo_file_mutation');
    expect(serialized).not.toContain('secret-value');
  });

  it('writes json and markdown dry-run report artifacts without mutating target repos', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-consumption-report-'));
    const outputDir = join(root, 'campaign-output');
    const playbookPath = join(root, 'ai-ide-repair-playbook.json');
    const failedRunDir = join(root, 'target-TOKEN=secret-value', '.hardening', 'runs', 'run-2026-07-04T10-00-00-000Z');
    const blockedRunDir = join(root, 'blocked-target', '.hardening', 'runs', 'run-2026-07-04T10-30-00-000Z');
    const playbook = buildAiIdeRepairExecutionPlaybook({
      generatedAt: '2026-07-04T11:05:00.000Z',
      campaignSummaryPath: join(root, 'campaign-summary.json'),
      campaignSummary: buildCampaignSummary(failedRunDir, blockedRunDir)
    });

    await mkdir(root, { recursive: true });
    await writeFile(playbookPath, `${JSON.stringify(playbook, null, 2)}\n`);

    const result = await writeAiIdePlaybookConsumptionReport({
      generatedAt: '2026-07-04T11:10:00.000Z',
      playbookPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-playbook-consumption-report.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-playbook-consumption-report.md'));
    expect(json).toContain('repoassure.ai-ide-playbook-consumption-report.v1');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildCampaignSummary(
  failedRunDir: string,
  blockedRunDir: string
): ValidationCampaignSummary {
  const passedRunDir = failedRunDir.replace('agent-reach', 'odinsight').replace('10-00-00', '09-00-00');

  return {
    schemaVersion: 'repoassure.validation-campaign-summary.v1',
    generatedAt: '2026-07-04T11:00:00.000Z',
    campaignStatus: {
      totalTargets: 3,
      passedTargets: 1,
      blockedTargets: 1,
      failedTargets: 1,
      missingEvidenceTargets: 0,
      productFollowUpActions: ['improve_repair_plan', 'document_target_stack']
    },
    prioritizedActionQueue: [
      {
        id: 'P0-improve-repair-plan',
        priority: 'P0',
        action: 'improve_repair_plan',
        ownerSurface: 'repoassure_product',
        targetIds: ['agent-reach'],
        affectedModes: ['cli'],
        blockerCategories: ['unknown'],
        recommendedVerification: [
          'Inspect repair task package evidence for agent-reach.',
          'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
        ],
        evidenceRefs: [`${failedRunDir}/target-repo-feedback-summary.json`],
        nonAuthorizationBoundary: 'This action item is product validation work only; it does not authorize public launch, npm publish, GitHub release, customer contact, pricing/spend, or commercial availability claims.'
      },
      {
        id: 'P1-document-target-stack',
        priority: 'P1',
        action: 'document_target_stack',
        ownerSurface: 'maintainer_or_target_repo',
        targetIds: ['openclaw-ui'],
        affectedModes: ['browser'],
        blockerCategories: ['environment'],
        recommendedVerification: [
          'Document target runtime prerequisites for openclaw-ui.',
          'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
        ],
        evidenceRefs: [`${blockedRunDir}/target-repo-feedback-summary.json`],
        nonAuthorizationBoundary: 'This action item is product validation work only; it does not authorize public launch, npm publish, GitHub release, customer contact, pricing/spend, or commercial availability claims.'
      }
    ],
    targets: [
      buildTarget('odinsight', passedRunDir, 'browser', 'passed', 'none', 'no_action', 0),
      buildTarget('agent-reach', failedRunDir, 'cli', 'failed', 'unknown', 'improve_repair_plan', 1),
      buildTarget('openclaw-ui', blockedRunDir, 'browser', 'blocked', 'environment', 'document_target_stack', 1)
    ],
    redactionBoundary: 'Local-only campaign index.',
    nonAuthorizationBoundary: 'This readiness evidence does not authorize public launch.'
  };
}

function buildTarget(
  targetId: string,
  runDir: string,
  mode: string,
  runStatus: string,
  blockerCategory: string,
  nextRecommendedProductAction: string,
  requiredChecksFailed: number
): ValidationCampaignSummary['targets'][number] {
  return {
    targetId,
    repoRootName: targetId,
    latestRunId: runDir.split('/').at(-1) ?? null,
    mode,
    runStatus,
    blockerCategory,
    nextRecommendedProductAction,
    requiredChecksFailed,
    evidence: {
      acceptanceRecord: `${runDir}/acceptance-record.md`,
      runDir,
      targetRepoFeedbackSummary: `${runDir}/target-repo-feedback-summary.json`,
      aiIdeHandoffPackage: `${runDir}/ai-ide-handoff-package.json`,
      userValidationEvidenceLoop: `${runDir}/user-validation-evidence-loop.json`,
      report: `${runDir}/hardening-report.md`,
      repairTaskPackage: `${runDir}/repair-task-package.json`,
      screenshots: []
    }
  };
}
