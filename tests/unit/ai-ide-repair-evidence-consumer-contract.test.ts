import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildAiIdeRepairEvidenceConsumerContract,
  buildAiIdeRepairEvidenceConsumerContractMarkdown,
  writeAiIdeRepairEvidenceConsumerContract,
  writeAiIdeRepairEvidenceConsumerContractFromDirectory
} from '../../packages/acceptance/src/ai-ide-repair-evidence-consumer-contract.js';
import type { AiIdeRepairEvidenceBundleManifest } from '../../packages/acceptance/src/ai-ide-repair-evidence-bundle-manifest.js';

describe('AI IDE repair evidence consumer contract', () => {
  it('turns a bundle manifest into an explicit AI IDE consumption contract', () => {
    const contract = buildAiIdeRepairEvidenceConsumerContract({
      generatedAt: '2026-07-08T11:00:00.000Z',
      manifestPath: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-repair-evidence-bundle-manifest.json',
      manifest: buildBundleManifest()
    });
    const markdown = buildAiIdeRepairEvidenceConsumerContractMarkdown(contract);
    const serialized = JSON.stringify(contract);

    expect(contract.schemaVersion).toBe('repoassure.ai-ide-repair-evidence-consumer-contract.v1');
    expect(contract.consumerReadiness).toBe('ready_for_ai_ide_consumption');
    expect(contract.sourceManifest).toMatchObject({
      schemaVersion: 'repoassure.ai-ide-repair-evidence-bundle-manifest.v1',
      currentStatus: 'verified_pending_maintainer_review',
      presentArtifacts: 6,
      missingArtifacts: 0
    });
    expect(contract.artifactReadSequence.map((item) => item.artifactKind)).toEqual([
      'ai_ide_repair_playbook',
      'ai_ide_playbook_consumption_report',
      'ai_ide_repair_decision_package',
      'ai_ide_repair_approval_receipt',
      'ai_ide_approved_repair_execution_plan',
      'ai_ide_repair_execution_evidence_report'
    ]);
    expect(contract.artifactReadSequence[0]).toMatchObject({
      required: true,
      role: 'campaign_context_and_action_queue',
      consumeBefore: ['ai_ide_playbook_consumption_report']
    });
    expect(contract.artifactReadSequence[5]).toMatchObject({
      required: true,
      role: 'execution_evidence_and_boundary_report',
      consumeAfter: ['ai_ide_approved_repair_execution_plan']
    });
    expect(contract.verificationChecklist).toContain('Read artifacts in artifactReadSequence order before proposing any target repo repair action.');
    expect(contract.verificationChecklist).toContain('Confirm maintainer review remains pending before treating the evidence bundle as accepted.');
    expect(contract.maintainerReviewBoundary).toContain('maintainer review');
    expect(contract.redactionBoundary).toContain('Local-only artifact paths');
    expect(contract.nonAuthorizationBoundary).toContain('does not authorize target repo mutation');
    expect(contract.blockedActions).toContain('target_repo_file_mutation');
    expect(markdown).toContain('# RepoAssure AI IDE Repair Evidence Consumer Contract');
    expect(markdown).toContain('## Artifact Read Sequence');
    expect(markdown).toContain('campaign_context_and_action_queue');
    expect(markdown).toContain('execution_evidence_and_boundary_report');
    expect(markdown).toContain('## Maintainer Review Boundary');
    expect(serialized).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('writes json and markdown consumer contract artifacts from a bundle manifest file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-consumer-contract-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');
    const manifestPath = join(secretRoot, 'ai-ide-repair-evidence-bundle-manifest.json');
    const outputDir = join(root, 'contract-output');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify(buildBundleManifest(), null, 2)}\n`);

    const result = await writeAiIdeRepairEvidenceConsumerContract({
      generatedAt: '2026-07-08T11:00:00.000Z',
      manifestPath,
      outputDir
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(outputDir, 'ai-ide-repair-evidence-consumer-contract.json'));
    expect(result.markdownPath).toBe(join(outputDir, 'ai-ide-repair-evidence-consumer-contract.md'));
    expect(result.contract.consumerReadiness).toBe('ready_for_ai_ide_consumption');
    expect(json).toContain('repoassure.ai-ide-repair-evidence-consumer-contract.v1');
    expect(markdown).toContain('ai-ide-repair-playbook.json');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });

  it('discovers the bundle manifest from one local campaign directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-consumer-contract-dir-'));
    const secretRoot = join(root, 'campaign-TOKEN=secret-value');

    await mkdir(secretRoot, { recursive: true });
    await writeFile(
      join(secretRoot, 'ai-ide-repair-evidence-bundle-manifest.json'),
      `${JSON.stringify(buildBundleManifest(), null, 2)}\n`
    );

    const result = await writeAiIdeRepairEvidenceConsumerContractFromDirectory({
      generatedAt: '2026-07-08T11:00:00.000Z',
      inputDir: secretRoot
    });
    const json = await readFile(result.jsonPath, 'utf8');
    const markdown = await readFile(result.markdownPath, 'utf8');

    expect(result.jsonPath).toBe(join(secretRoot, 'ai-ide-repair-evidence-consumer-contract.json'));
    expect(result.markdownPath).toBe(join(secretRoot, 'ai-ide-repair-evidence-consumer-contract.md'));
    expect(result.contract.sourceManifest.fileName).toBe('ai-ide-repair-evidence-bundle-manifest.json');
    expect(result.contract.artifactReadSequence).toHaveLength(6);
    expect(markdown).toContain('## Verification Checklist');
    expect(json).not.toContain('secret-value');
    expect(markdown).not.toContain('secret-value');
  });
});

function buildBundleManifest(): AiIdeRepairEvidenceBundleManifest {
  return {
    schemaVersion: 'repoassure.ai-ide-repair-evidence-bundle-manifest.v1',
    generatedAt: '2026-07-08T10:00:00.000Z',
    bundleSummary: {
      totalArtifacts: 6,
      presentArtifacts: 6,
      missingArtifacts: 0,
      manualRepairCandidates: 1,
      approvedManualRepairCandidates: 1,
      approvedExecutionItems: 1,
      verifiedItems: 1,
      boundaryViolations: 0,
      currentStatus: 'verified_pending_maintainer_review'
    },
    readingOrder: [
      {
        artifactKind: 'ai_ide_repair_playbook',
        fileName: 'ai-ide-repair-playbook.json',
        reason: 'Understand campaign context.'
      },
      {
        artifactKind: 'ai_ide_playbook_consumption_report',
        fileName: 'ai-ide-playbook-consumption-report.json',
        reason: 'Confirm dry-run understanding.'
      },
      {
        artifactKind: 'ai_ide_repair_decision_package',
        fileName: 'ai-ide-repair-decision-package.json',
        reason: 'Review decision type.'
      },
      {
        artifactKind: 'ai_ide_repair_approval_receipt',
        fileName: 'ai-ide-repair-approval-receipt.json',
        reason: 'Confirm maintainer decision.'
      },
      {
        artifactKind: 'ai_ide_approved_repair_execution_plan',
        fileName: 'ai-ide-approved-repair-execution-plan.json',
        reason: 'Read approved execution plan.'
      },
      {
        artifactKind: 'ai_ide_repair_execution_evidence_report',
        fileName: 'ai-ide-repair-execution-evidence-report.json',
        reason: 'Confirm local execution evidence.'
      }
    ],
    artifacts: [
      {
        artifactKind: 'ai_ide_repair_playbook',
        fileName: 'ai-ide-repair-playbook.json',
        path: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-repair-playbook.json',
        schemaVersion: 'repoassure.ai-ide-repair-execution-playbook.v1',
        sha256: '0'.repeat(64),
        generatedAt: '2026-07-08T09:00:00.000Z'
      },
      {
        artifactKind: 'ai_ide_playbook_consumption_report',
        fileName: 'ai-ide-playbook-consumption-report.json',
        path: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-playbook-consumption-report.json',
        schemaVersion: 'repoassure.ai-ide-playbook-consumption-report.v1',
        sha256: '1'.repeat(64),
        generatedAt: '2026-07-08T09:05:00.000Z'
      },
      {
        artifactKind: 'ai_ide_repair_decision_package',
        fileName: 'ai-ide-repair-decision-package.json',
        path: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-repair-decision-package.json',
        schemaVersion: 'repoassure.ai-ide-repair-decision-package.v1',
        sha256: '2'.repeat(64),
        generatedAt: '2026-07-08T09:10:00.000Z'
      },
      {
        artifactKind: 'ai_ide_repair_approval_receipt',
        fileName: 'ai-ide-repair-approval-receipt.json',
        path: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-repair-approval-receipt.json',
        schemaVersion: 'repoassure.ai-ide-repair-approval-receipt.v1',
        sha256: '3'.repeat(64),
        generatedAt: '2026-07-08T09:15:00.000Z'
      },
      {
        artifactKind: 'ai_ide_approved_repair_execution_plan',
        fileName: 'ai-ide-approved-repair-execution-plan.json',
        path: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-approved-repair-execution-plan.json',
        schemaVersion: 'repoassure.ai-ide-approved-repair-execution-plan.v1',
        sha256: '4'.repeat(64),
        generatedAt: '2026-07-08T09:20:00.000Z'
      },
      {
        artifactKind: 'ai_ide_repair_execution_evidence_report',
        fileName: 'ai-ide-repair-execution-evidence-report.json',
        path: '/private/tmp/repoassure-campaign-TOKEN=secret-value/ai-ide-repair-execution-evidence-report.json',
        schemaVersion: 'repoassure.ai-ide-repair-execution-evidence-report.v1',
        sha256: '5'.repeat(64),
        generatedAt: '2026-07-08T09:25:00.000Z'
      }
    ],
    nextActions: [
      'Maintainer review may inspect the execution evidence report before any separate target repo merge or release action.'
    ],
    boundaries: {
      approvalBoundary: 'Approval receipt records maintainer decisions only.',
      executionEvidenceBoundary: 'Execution evidence report records local evidence only.',
      redactionBoundary: 'Local-only artifact paths and evidence must be redacted.',
      nonAuthorizationBoundary: 'This repair evidence bundle manifest is an index and review entry point only; it does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, npm publication, GitHub release, public launch, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.',
      blockedActions: [
        'target_repo_file_mutation',
        'target_repo_branch_creation',
        'target_repo_commit_creation'
      ]
    }
  };
}
