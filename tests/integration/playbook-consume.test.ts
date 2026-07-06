import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import { buildAiIdeRepairExecutionPlaybook } from '../../packages/acceptance/src/ai-ide-repair-playbook.js';
import type { ValidationCampaignSummary } from '../../packages/acceptance/src/campaign-summary.js';

const execFileAsync = promisify(execFile);

describe('playbook consumption script', () => {
  it('generates dry-run consumption report artifacts from a local repair playbook', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-playbook-consume-'));
    const outputDir = join(root, 'campaign-output');
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const failedRunDir = join(secretRoot, 'agent-reach', '.hardening', 'runs', 'run-2026-07-04T10-00-00-000Z');
    const blockedRunDir = join(secretRoot, 'openclaw-ui', '.hardening', 'runs', 'run-2026-07-04T10-30-00-000Z');
    const playbookPath = join(root, 'ai-ide-repair-playbook.json');
    const playbook = buildAiIdeRepairExecutionPlaybook({
      generatedAt: '2026-07-04T11:05:00.000Z',
      campaignSummaryPath: join(secretRoot, 'campaign-summary.json'),
      campaignSummary: buildCampaignSummary(failedRunDir, blockedRunDir)
    });

    await mkdir(outputDir, { recursive: true });
    await writeFile(playbookPath, `${JSON.stringify(playbook, null, 2)}\n`);

    const { stdout, stderr } = await execFileAsync(
      'pnpm',
      ['playbook:consume', '--', '--playbook', playbookPath, '--output', outputDir],
      { cwd: process.cwd(), timeout: 30_000 }
    );
    const jsonPath = join(outputDir, 'ai-ide-playbook-consumption-report.json');
    const markdownPath = join(outputDir, 'ai-ide-playbook-consumption-report.md');
    const json = await readFile(jsonPath, 'utf8');
    const markdown = await readFile(markdownPath, 'utf8');
    const report = JSON.parse(json) as {
      schemaVersion: string;
      repairTaskUnderstanding: Array<{ sourceActionId: string; readOrderArtifactKinds: string[] }>;
      dryRunDecision: { blockedActions: string[] };
    };

    expect(stderr).toBe('');
    expect(stdout).toContain(`Wrote ${jsonPath}`);
    expect(stdout).toContain(`Wrote ${markdownPath}`);
    expect(report.schemaVersion).toBe('repoassure.ai-ide-playbook-consumption-report.v1');
    expect(report.repairTaskUnderstanding).toEqual([
      expect.objectContaining({
        sourceActionId: 'P0-improve-repair-plan',
        readOrderArtifactKinds: [
          'target_repo_feedback_summary',
          'ai_ide_handoff_package',
          'repair_task_package',
          'user_validation_evidence_loop'
        ]
      }),
      expect.objectContaining({ sourceActionId: 'P1-document-target-stack' })
    ]);
    expect(report.dryRunDecision.blockedActions).toContain('target_repo_file_mutation');
    expect(report.dryRunDecision.blockedActions).toContain('target_repo_pull_request_creation');
    expect(markdown).toContain('## Campaign Understanding');
    expect(markdown).toContain('## Repair Task Understanding');
    expect(markdown).toContain('No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized.');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildCampaignSummary(
  failedRunDir: string,
  blockedRunDir: string
): ValidationCampaignSummary {
  return {
    schemaVersion: 'repoassure.validation-campaign-summary.v1',
    generatedAt: '2026-07-04T11:00:00.000Z',
    campaignStatus: {
      totalTargets: 2,
      passedTargets: 0,
      blockedTargets: 1,
      failedTargets: 1,
      missingEvidenceTargets: 0,
      productFollowUpActions: ['improve_repair_plan', 'document_target_stack']
    },
    prioritizedActionQueue: [
      buildAction('P0-improve-repair-plan', 'P0', 'improve_repair_plan', 'repoassure_product', 'agent-reach', 'cli', 'unknown', failedRunDir),
      buildAction('P1-document-target-stack', 'P1', 'document_target_stack', 'maintainer_or_target_repo', 'openclaw-ui', 'browser', 'environment', blockedRunDir)
    ],
    targets: [
      buildTarget('agent-reach', failedRunDir, 'cli', 'failed', 'unknown', 'improve_repair_plan'),
      buildTarget('openclaw-ui', blockedRunDir, 'browser', 'blocked', 'environment', 'document_target_stack')
    ],
    redactionBoundary: 'Local-only campaign index.',
    nonAuthorizationBoundary: 'This readiness evidence does not authorize public launch.'
  };
}

function buildAction(
  id: 'P0-improve-repair-plan' | 'P1-document-target-stack',
  priority: 'P0' | 'P1',
  action: 'improve_repair_plan' | 'document_target_stack',
  ownerSurface: 'repoassure_product' | 'maintainer_or_target_repo',
  targetId: string,
  mode: string,
  blockerCategory: string,
  runDir: string
): ValidationCampaignSummary['prioritizedActionQueue'][number] {
  return {
    id,
    priority,
    action,
    ownerSurface,
    targetIds: [targetId],
    affectedModes: [mode],
    blockerCategories: [blockerCategory],
    recommendedVerification: [
      `Inspect repair task package evidence for ${targetId}.`,
      'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
    ],
    evidenceRefs: [join(runDir, 'target-repo-feedback-summary.json')],
    nonAuthorizationBoundary: 'This action item is product validation work only; it does not authorize public launch, npm publish, GitHub release, customer contact, pricing/spend, or commercial availability claims.'
  };
}

function buildTarget(
  targetId: string,
  runDir: string,
  mode: string,
  runStatus: string,
  blockerCategory: string,
  nextRecommendedProductAction: string
): ValidationCampaignSummary['targets'][number] {
  return {
    targetId,
    repoRootName: targetId,
    latestRunId: runDir.split('/').at(-1) ?? null,
    mode,
    runStatus,
    blockerCategory,
    nextRecommendedProductAction,
    requiredChecksFailed: runStatus === 'passed' ? 0 : 1,
    evidence: {
      acceptanceRecord: join(runDir, 'acceptance-record.md'),
      runDir,
      targetRepoFeedbackSummary: join(runDir, 'target-repo-feedback-summary.json'),
      aiIdeHandoffPackage: join(runDir, 'ai-ide-handoff-package.json'),
      userValidationEvidenceLoop: join(runDir, 'user-validation-evidence-loop.json'),
      report: join(runDir, 'hardening-report.md'),
      repairTaskPackage: join(runDir, 'repair-task-package.json'),
      screenshots: []
    }
  };
}
