import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeRepairExecutionPlaybook,
  buildAiIdeRepairExecutionPlaybookMarkdown,
  writeAiIdeRepairExecutionPlaybook
} from '../../packages/acceptance/src/ai-ide-repair-playbook.js';
import type { ValidationCampaignSummary } from '../../packages/acceptance/src/campaign-summary.js';

describe('AI IDE repair execution playbook', () => {
  it('turns campaign action queue evidence into a local-first AI IDE execution plan', () => {
    const runDir = '/private/tmp/customer-app-API_KEY=sk-private/.hardening/runs/run-2026-07-04T10-00-00-000Z';
    const campaignSummary = buildCampaignSummary(runDir);

    const playbook = buildAiIdeRepairExecutionPlaybook({
      generatedAt: '2026-07-04T11:00:00.000Z',
      campaignSummaryPath: '/private/tmp/campaign/campaign-summary.json',
      campaignSummary
    });
    const serialized = JSON.stringify(playbook);

    expect(playbook.schemaVersion).toBe('repoassure.ai-ide-repair-execution-playbook.v1');
    expect(playbook.sourceCampaignSummary).toBe('/private/tmp/campaign/campaign-summary.json');
    expect(playbook.executionPlan).toEqual([
      expect.objectContaining({
        sourceActionId: 'P0-improve-repair-plan',
        priority: 'P0',
        ownerSurface: 'repoassure_product',
        targetIds: ['python-cli'],
        readOrder: [
          expect.objectContaining({ artifactKind: 'target_repo_feedback_summary', path: expect.stringContaining('target-repo-feedback-summary.json') }),
          expect.objectContaining({ artifactKind: 'ai_ide_handoff_package', path: expect.stringContaining('ai-ide-handoff-package.json') }),
          expect.objectContaining({ artifactKind: 'repair_task_package', path: expect.stringContaining('repair-task-package.json') }),
          expect.objectContaining({ artifactKind: 'user_validation_evidence_loop', path: expect.stringContaining('user-validation-evidence-loop.json') })
        ],
        verificationChecklist: [
          'Inspect repair task package evidence for python-cli.',
          'Add or update focused unit coverage before changing runtime behavior.',
          'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
        ],
        maintainerReviewBoundary: expect.stringContaining('Stop for maintainer review')
      })
    ]);
    expect(playbook.executionGuardrails).toContain('Do not upload target repo source, secrets, reviewer credentials, customer data, or raw private artifacts.');
    expect(playbook.executionGuardrails).toContain('Do not automatically modify target repos, apply patches, create branches, commits, pull requests, issues, or advisories from this playbook.');
    expect(playbook.nonAuthorizationBoundary).toContain('does not authorize public launch');
    expect(serialized).toContain('customer-app-API_KEY=[REDACTED]');
    expect(serialized).not.toContain('sk-private');
  });

  it('writes json and markdown artifacts that an AI IDE can follow without publication authority', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-ai-ide-repair-playbook-'));
    const outputDir = join(root, 'campaign-output');
    const campaignSummaryPath = join(root, 'campaign-summary.json');
    const runDir = join(root, 'target-repo', '.hardening', 'runs', 'run-2026-07-04T10-00-00-000Z');
    const campaignSummary = buildCampaignSummary(runDir);

    await mkdir(runDir, { recursive: true });
    await writeFile(campaignSummaryPath, `${JSON.stringify(campaignSummary, null, 2)}\n`);

    const result = await writeAiIdeRepairExecutionPlaybook({
      generatedAt: '2026-07-04T11:00:00.000Z',
      campaignSummaryPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');
    const directMarkdown = buildAiIdeRepairExecutionPlaybookMarkdown(result.playbook);

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-repair-playbook.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-repair-playbook.md'));
    expect(json).toContain('repoassure.ai-ide-repair-execution-playbook.v1');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Execution Playbook');
    expect(markdown).toContain('## Execution Plan');
    expect(markdown).toContain('P0-improve-repair-plan');
    expect(markdown).toContain('ai-ide-handoff-package.json');
    expect(markdown).toContain('repair-task-package.json');
    expect(markdown).toContain('Maintainer review boundary');
    expect(markdown).toContain('Do not automatically modify target repos');
    expect(markdown).toContain('does not authorize public launch');
    expect(directMarkdown).toBe(markdown);
  });

  it('preserves real campaign target status context for AI IDE consumption', () => {
    const root = '/private/tmp/repoassure-real-campaign-TOKEN=secret-value';
    const passedRunDir = `${root}/odinsight/.hardening/runs/run-2026-07-04T09-00-00-000Z`;
    const failedRunDir = `${root}/agent-reach/.hardening/runs/run-2026-07-04T10-00-00-000Z`;
    const blockedRunDir = `${root}/openclaw-ui/.hardening/runs/run-2026-07-04T10-30-00-000Z`;
    const campaignSummary: ValidationCampaignSummary = {
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

    const playbook = buildAiIdeRepairExecutionPlaybook({
      generatedAt: '2026-07-04T11:05:00.000Z',
      campaignSummaryPath: `${root}/campaign-summary.json`,
      campaignSummary
    });
    const markdown = buildAiIdeRepairExecutionPlaybookMarkdown(playbook);
    const serialized = JSON.stringify(playbook);

    expect(playbook.campaignContext).toMatchObject({
      totalTargets: 3,
      passedTargets: 1,
      blockedTargets: 1,
      failedTargets: 1,
      missingEvidenceTargets: 0
    });
    expect(playbook.campaignContext.targetStatusMatrix).toEqual([
      expect.objectContaining({
        targetId: 'odinsight',
        runStatus: 'passed',
        blockerCategory: 'none',
        nextRecommendedProductAction: 'no_action'
      }),
      expect.objectContaining({
        targetId: 'agent-reach',
        runStatus: 'failed',
        blockerCategory: 'unknown',
        nextRecommendedProductAction: 'improve_repair_plan'
      }),
      expect.objectContaining({
        targetId: 'openclaw-ui',
        runStatus: 'blocked',
        blockerCategory: 'environment',
        nextRecommendedProductAction: 'document_target_stack'
      })
    ]);
    expect(playbook.executionPlan).toEqual([
      expect.objectContaining({
        sourceActionId: 'P0-improve-repair-plan',
        targetContexts: [expect.objectContaining({ targetId: 'agent-reach', runStatus: 'failed' })]
      }),
      expect.objectContaining({
        sourceActionId: 'P1-document-target-stack',
        targetContexts: [expect.objectContaining({ targetId: 'openclaw-ui', blockerCategory: 'environment' })]
      })
    ]);
    expect(playbook.aiIdeConsumptionChecklist).toContain('Review campaignContext.targetStatusMatrix before editing target repos.');
    expect(playbook.aiIdeConsumptionChecklist).toContain('Read each executionPlan item in readOrder before opening repair-task-package.json.');
    expect(markdown).toContain('## Campaign Target Matrix');
    expect(markdown).toContain('| odinsight | browser | passed | none | no_action |');
    expect(markdown).toContain('| openclaw-ui | browser | blocked | environment | document_target_stack |');
    expect(markdown).toContain('## AI IDE consumption checklist');
    expect(serialized).not.toContain('secret-value');
  });
});

function buildCampaignSummary(runDir: string): ValidationCampaignSummary {
  return {
    schemaVersion: 'repoassure.validation-campaign-summary.v1',
    generatedAt: '2026-07-04T10:10:00.000Z',
    campaignStatus: {
      totalTargets: 1,
      passedTargets: 0,
      blockedTargets: 0,
      failedTargets: 1,
      missingEvidenceTargets: 0,
      productFollowUpActions: ['improve_repair_plan']
    },
    prioritizedActionQueue: [{
      id: 'P0-improve-repair-plan',
      priority: 'P0',
      action: 'improve_repair_plan',
      ownerSurface: 'repoassure_product',
      targetIds: ['python-cli'],
      affectedModes: ['cli'],
      blockerCategories: ['unknown'],
      recommendedVerification: [
        'Inspect repair task package evidence for python-cli.',
        'Add or update focused unit coverage before changing runtime behavior.',
        'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
      ],
      evidenceRefs: [`${runDir}/target-repo-feedback-summary.json`],
      nonAuthorizationBoundary: 'This action item is product validation work only; it does not authorize public launch, npm publish, GitHub release, customer contact, pricing/spend, or commercial availability claims.'
    }],
    targets: [{
      targetId: 'python-cli',
      repoRootName: 'target-repo',
      latestRunId: 'run-2026-07-04T10-00-00-000Z',
      mode: 'cli',
      runStatus: 'failed',
      blockerCategory: 'unknown',
      nextRecommendedProductAction: 'improve_repair_plan',
      requiredChecksFailed: 1,
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
    }],
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
