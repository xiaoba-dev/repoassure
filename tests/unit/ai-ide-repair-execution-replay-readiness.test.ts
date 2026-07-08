import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeRepairExecutionReplayReadiness,
  buildAiIdeRepairExecutionReplayReadinessMarkdown,
  writeAiIdeRepairExecutionReplayReadiness,
  writeAiIdeRepairExecutionReplayReadinessFromDirectory
} from '../../packages/acceptance/src/ai-ide-repair-execution-replay-readiness.js';
import type {
  AiIdeRepairEvidenceConsumerContract
} from '../../packages/acceptance/src/ai-ide-repair-evidence-consumer-contract.js';

describe('AI IDE repair execution replay readiness', () => {
  it('turns a consumer contract into a replayable maintainer review readiness report', () => {
    const report = buildAiIdeRepairExecutionReplayReadiness({
      generatedAt: '2026-07-08T12:00:00.000Z',
      contractPath: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-repair-evidence-consumer-contract.json',
      contract: buildConsumerContract()
    });
    const markdown = buildAiIdeRepairExecutionReplayReadinessMarkdown(report);
    const serialized = JSON.stringify(report);

    expect(report.schemaVersion).toBe('repoassure.ai-ide-repair-execution-replay-readiness.v1');
    expect(report.replayReadiness).toBe('ready_for_maintainer_replay_review');
    expect(report.sourceConsumerContract).toMatchObject({
      schemaVersion: 'repoassure.ai-ide-repair-evidence-consumer-contract.v1',
      fileName: 'ai-ide-repair-evidence-consumer-contract.json',
      consumerReadiness: 'ready_for_ai_ide_consumption',
      artifactCount: 6
    });
    expect(report.artifactReplay).toHaveLength(6);
    expect(report.artifactReplay[0]).toMatchObject({
      step: 1,
      replayStatus: 'replayed',
      role: 'campaign_context_and_action_queue'
    });
    expect(report.verificationReplay).toMatchObject({
      checklistTotal: 3,
      blockedActionChecks: [
        'target_repo_file_mutation',
        'target_repo_branch_creation',
        'target_repo_commit_creation'
      ]
    });
    expect(report.boundaryReplay).toMatchObject({
      maintainerReviewBoundaryMaintained: true,
      redactionBoundaryMaintained: true,
      nonAuthorizationBoundaryMaintained: true,
      blockedActionsEnforced: true,
      unauthorizedActions: []
    });
    expect(report.nextReviewDecision).toMatchObject({
      decision: 'maintainer_review_ready',
      requiredHumanAction: 'review_replay_report_before_target_repo_repair_goal'
    });
    expect(report.blockedActions).toContain('target_repo_file_mutation');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Execution Replay Readiness');
    expect(markdown).toContain('## Artifact Replay');
    expect(markdown).toContain('## Verification Replay');
    expect(markdown).toContain('## Boundary Replay');
    expect(markdown).toContain('## Next Review Decision');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('writes json and markdown replay readiness artifacts from a consumer contract file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-replay-readiness-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const contractPath = join(secretRoot, 'ai-ide-repair-evidence-consumer-contract.json');
    const outputDir = join(root, 'replay-output');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(contractPath, `${JSON.stringify(buildConsumerContract(), null, 2)}\n`);

    const result = await writeAiIdeRepairExecutionReplayReadiness({
      generatedAt: '2026-07-08T12:00:00.000Z',
      contractPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-repair-execution-replay-readiness.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-repair-execution-replay-readiness.md'));
    expect(result.report.replayReadiness).toBe('ready_for_maintainer_replay_review');
    expect(json).toContain('repoassure.ai-ide-repair-execution-replay-readiness.v1');
    expect(markdown).toContain('maintainer_review_ready');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('discovers the consumer contract from one local campaign directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-replay-readiness-dir-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-repair-evidence-consumer-contract.json'),
      `${JSON.stringify(buildConsumerContract(), null, 2)}\n`
    );

    const result = await writeAiIdeRepairExecutionReplayReadinessFromDirectory({
      generatedAt: '2026-07-08T12:00:00.000Z',
      inputDir: secretRoot
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(secretRoot, 'ai-ide-repair-execution-replay-readiness.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'ai-ide-repair-execution-replay-readiness.md'));
    expect(result.report.sourceConsumerContract.fileName).toBe('ai-ide-repair-evidence-consumer-contract.json');
    expect(result.report.artifactReplay).toHaveLength(6);
    expect(markdown).toContain('## Boundary Replay');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildConsumerContract(): AiIdeRepairEvidenceConsumerContract {
  const artifacts = [
    ['ai_ide_repair_playbook', 'ai-ide-repair-playbook.json', 'campaign_context_and_action_queue'],
    ['ai_ide_playbook_consumption_report', 'ai-ide-playbook-consumption-report.json', 'dry_run_understanding_and_blocked_actions'],
    ['ai_ide_repair_decision_package', 'ai-ide-repair-decision-package.json', 'repair_decision_classification'],
    ['ai_ide_repair_approval_receipt', 'ai-ide-repair-approval-receipt.json', 'maintainer_approval_receipt'],
    ['ai_ide_approved_repair_execution_plan', 'ai-ide-approved-repair-execution-plan.json', 'approved_execution_plan'],
    ['ai_ide_repair_execution_evidence_report', 'ai-ide-repair-execution-evidence-report.json', 'execution_evidence_and_boundary_report']
  ] as const;

  return {
    schemaVersion: 'repoassure.ai-ide-repair-evidence-consumer-contract.v1',
    generatedAt: '2026-07-08T11:00:00.000Z',
    consumerReadiness: 'ready_for_ai_ide_consumption',
    sourceManifest: {
      schemaVersion: 'repoassure.ai-ide-repair-evidence-bundle-manifest.v1',
      fileName: 'ai-ide-repair-evidence-bundle-manifest.json',
      path: '/private/tmp/repoassure-campaign-[REDACTED]/ai-ide-repair-evidence-bundle-manifest.json',
      sha256: 'a'.repeat(64),
      currentStatus: 'verified_pending_maintainer_review',
      totalArtifacts: 6,
      presentArtifacts: 6,
      missingArtifacts: 0
    },
    artifactReadSequence: artifacts.map(([artifactKind, fileName, role], index) => ({
      step: index + 1,
      artifactKind,
      fileName,
      schemaVersion: `repoassure.${artifactKind}.v1`,
      required: true,
      role,
      consumeBefore: index < artifacts.length - 1 ? [artifacts[index + 1]![0]] : [],
      consumeAfter: index > 0 ? [artifacts[index - 1]![0]] : [],
      instruction: `Read ${fileName} in order.`,
      verificationFocus: [`Verify ${fileName} replay boundary.`]
    })),
    verificationChecklist: [
      'Read artifacts in artifactReadSequence order before proposing any target repo repair action.',
      'Confirm maintainer review remains pending before treating the evidence bundle as accepted.',
      'Confirm blocked actions remain blocked during replay.'
    ],
    maintainerReviewBoundary: 'Maintainer review is still required before any target repo repair action.',
    redactionBoundary: 'Local-only artifact paths and evidence must be redacted.',
    nonAuthorizationBoundary: 'This contract does not authorize target repo mutation, branch creation, commits, releases, publication, customer contact, or commercial availability claims.',
    blockedActions: [
      'target_repo_file_mutation',
      'target_repo_branch_creation',
      'target_repo_commit_creation'
    ]
  };
}
