import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  AiIdeRepairEvidenceBundleArtifactKind,
  AiIdeRepairEvidenceBundleManifest,
  AiIdeRepairEvidenceBundleStatus
} from './ai-ide-repair-evidence-bundle-manifest.js';

export type AiIdeRepairEvidenceConsumerReadiness =
  | 'ready_for_ai_ide_consumption'
  | 'blocked_or_incomplete'
  | 'review_required';

export type AiIdeRepairEvidenceConsumerArtifactRole =
  | 'campaign_context_and_action_queue'
  | 'dry_run_understanding_and_blocked_actions'
  | 'repair_decision_classification'
  | 'maintainer_approval_receipt'
  | 'approved_execution_plan'
  | 'execution_evidence_and_boundary_report';

export interface AiIdeRepairEvidenceConsumerContractInput {
  generatedAt?: string;
  manifestPath: string;
  manifest: AiIdeRepairEvidenceBundleManifest;
}

export interface WriteAiIdeRepairEvidenceConsumerContractInput {
  generatedAt?: string;
  manifestPath: string;
  outputDir: string;
}

export interface WriteAiIdeRepairEvidenceConsumerContractFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface AiIdeRepairEvidenceConsumerSourceManifest {
  schemaVersion: string;
  fileName: string;
  path: string;
  sha256: string;
  currentStatus: AiIdeRepairEvidenceBundleStatus;
  totalArtifacts: number;
  presentArtifacts: number;
  missingArtifacts: number;
}

export interface AiIdeRepairEvidenceConsumerArtifactReadItem {
  step: number;
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind;
  fileName: string;
  schemaVersion: string;
  required: boolean;
  role: AiIdeRepairEvidenceConsumerArtifactRole;
  consumeBefore: AiIdeRepairEvidenceBundleArtifactKind[];
  consumeAfter: AiIdeRepairEvidenceBundleArtifactKind[];
  instruction: string;
  verificationFocus: string[];
}

export interface AiIdeRepairEvidenceConsumerContract {
  schemaVersion: 'repoassure.ai-ide-repair-evidence-consumer-contract.v1';
  generatedAt: string;
  consumerReadiness: AiIdeRepairEvidenceConsumerReadiness;
  sourceManifest: AiIdeRepairEvidenceConsumerSourceManifest;
  artifactReadSequence: AiIdeRepairEvidenceConsumerArtifactReadItem[];
  verificationChecklist: string[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteAiIdeRepairEvidenceConsumerContractResult {
  jsonPath: string;
  markdownPath: string;
  contract: AiIdeRepairEvidenceConsumerContract;
}

export function buildAiIdeRepairEvidenceConsumerContract(
  input: AiIdeRepairEvidenceConsumerContractInput
): AiIdeRepairEvidenceConsumerContract {
  const manifestJson = JSON.stringify(input.manifest);
  const sourceManifest = {
    schemaVersion: sanitize(input.manifest.schemaVersion),
    fileName: sanitize(basename(input.manifestPath)),
    path: sanitizePath(input.manifestPath),
    sha256: createHash('sha256').update(manifestJson).digest('hex'),
    currentStatus: input.manifest.bundleSummary.currentStatus,
    totalArtifacts: input.manifest.bundleSummary.totalArtifacts,
    presentArtifacts: input.manifest.bundleSummary.presentArtifacts,
    missingArtifacts: input.manifest.bundleSummary.missingArtifacts
  };

  return {
    schemaVersion: 'repoassure.ai-ide-repair-evidence-consumer-contract.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    consumerReadiness: classifyConsumerReadiness(input.manifest),
    sourceManifest,
    artifactReadSequence: input.manifest.artifacts.map((artifact, index, artifacts) => {
      const nextArtifact = artifacts[index + 1];
      const previousArtifact = artifacts[index - 1];

      return {
        step: index + 1,
        artifactKind: artifact.artifactKind,
        fileName: sanitize(artifact.fileName),
        schemaVersion: sanitize(artifact.schemaVersion),
        required: true,
        role: roleForArtifact(artifact.artifactKind),
        consumeBefore: nextArtifact ? [nextArtifact.artifactKind] : [],
        consumeAfter: previousArtifact ? [previousArtifact.artifactKind] : [],
        instruction: instructionForArtifact(artifact.artifactKind),
        verificationFocus: verificationFocusForArtifact(artifact.artifactKind)
      };
    }),
    verificationChecklist: buildVerificationChecklist(input.manifest),
    maintainerReviewBoundary: 'AI IDEs may prepare local analysis from this contract, but maintainer review is still required before any target repo repair action, merge, release, publication, customer contact, or commercial availability claim.',
    redactionBoundary: sanitize(input.manifest.boundaries.redactionBoundary),
    nonAuthorizationBoundary: sanitize(input.manifest.boundaries.nonAuthorizationBoundary),
    blockedActions: [...new Set(input.manifest.boundaries.blockedActions.map(sanitize))]
  };
}

export async function writeAiIdeRepairEvidenceConsumerContract(
  input: WriteAiIdeRepairEvidenceConsumerContractInput
): Promise<WriteAiIdeRepairEvidenceConsumerContractResult> {
  const manifest = JSON.parse(await readFile(input.manifestPath, 'utf8')) as AiIdeRepairEvidenceBundleManifest;
  const contract = buildAiIdeRepairEvidenceConsumerContract({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    manifestPath: input.manifestPath,
    manifest
  });
  const jsonPath = join(input.outputDir, 'ai-ide-repair-evidence-consumer-contract.json');
  const markdownPath = join(input.outputDir, 'ai-ide-repair-evidence-consumer-contract.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(contract, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeRepairEvidenceConsumerContractMarkdown(contract));

  return { jsonPath, markdownPath, contract };
}

export async function writeAiIdeRepairEvidenceConsumerContractFromDirectory(
  input: WriteAiIdeRepairEvidenceConsumerContractFromDirectoryInput
): Promise<WriteAiIdeRepairEvidenceConsumerContractResult> {
  return writeAiIdeRepairEvidenceConsumerContract({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    manifestPath: join(input.inputDir, 'ai-ide-repair-evidence-bundle-manifest.json'),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildAiIdeRepairEvidenceConsumerContractMarkdown(
  contract: AiIdeRepairEvidenceConsumerContract
): string {
  return [
    '# RepoAssure AI IDE Repair Evidence Consumer Contract',
    '',
    `Generated at: ${contract.generatedAt}`,
    `Consumer readiness: ${contract.consumerReadiness}`,
    '',
    '## Source Manifest',
    '',
    `- fileName: ${contract.sourceManifest.fileName}`,
    `- schemaVersion: ${contract.sourceManifest.schemaVersion}`,
    `- currentStatus: ${contract.sourceManifest.currentStatus}`,
    `- presentArtifacts: ${contract.sourceManifest.presentArtifacts}`,
    `- missingArtifacts: ${contract.sourceManifest.missingArtifacts}`,
    '',
    '## Artifact Read Sequence',
    '',
    '| Step | Artifact | Role | Required | Instruction |',
    '| --- | --- | --- | --- | --- |',
    ...contract.artifactReadSequence.map((item) => `| ${[
      String(item.step),
      item.fileName,
      item.role,
      String(item.required),
      item.instruction
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    '',
    '## Verification Checklist',
    '',
    ...contract.verificationChecklist.map((item) => `- ${item}`),
    '',
    '## Maintainer Review Boundary',
    '',
    contract.maintainerReviewBoundary,
    '',
    '## Boundaries',
    '',
    `- redactionBoundary: ${contract.redactionBoundary}`,
    `- nonAuthorizationBoundary: ${contract.nonAuthorizationBoundary}`,
    '',
    '## Blocked Actions',
    '',
    ...contract.blockedActions.map((item) => `- ${item}`),
    ''
  ].join('\n');
}

function classifyConsumerReadiness(
  manifest: AiIdeRepairEvidenceBundleManifest
): AiIdeRepairEvidenceConsumerReadiness {
  if (
    manifest.bundleSummary.missingArtifacts > 0 ||
    manifest.bundleSummary.boundaryViolations > 0 ||
    manifest.bundleSummary.currentStatus === 'blocked_or_failed'
  ) {
    return 'blocked_or_incomplete';
  }

  if (manifest.bundleSummary.currentStatus === 'verified_pending_maintainer_review') {
    return 'ready_for_ai_ide_consumption';
  }

  return 'review_required';
}

function roleForArtifact(
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind
): AiIdeRepairEvidenceConsumerArtifactRole {
  switch (artifactKind) {
    case 'ai_ide_repair_playbook':
      return 'campaign_context_and_action_queue';
    case 'ai_ide_playbook_consumption_report':
      return 'dry_run_understanding_and_blocked_actions';
    case 'ai_ide_repair_decision_package':
      return 'repair_decision_classification';
    case 'ai_ide_repair_approval_receipt':
      return 'maintainer_approval_receipt';
    case 'ai_ide_approved_repair_execution_plan':
      return 'approved_execution_plan';
    case 'ai_ide_repair_execution_evidence_report':
      return 'execution_evidence_and_boundary_report';
  }
}

function instructionForArtifact(artifactKind: AiIdeRepairEvidenceBundleArtifactKind): string {
  switch (artifactKind) {
    case 'ai_ide_repair_playbook':
      return 'Read first to understand campaign context, target status matrix, prioritized action queue, and required read order.';
    case 'ai_ide_playbook_consumption_report':
      return 'Read second to confirm AI IDE dry-run understanding, target handling, and blocked action awareness.';
    case 'ai_ide_repair_decision_package':
      return 'Read third to understand which items are manual repair candidates, environment prerequisites, or product improvements.';
    case 'ai_ide_repair_approval_receipt':
      return 'Read fourth to confirm maintainer approval decisions before narrowing execution scope.';
    case 'ai_ide_approved_repair_execution_plan':
      return 'Read fifth to identify approved plan-only repair execution items and their verification expectations.';
    case 'ai_ide_repair_execution_evidence_report':
      return 'Read last to verify local execution evidence, boundary report, and pending maintainer review status.';
  }
}

function verificationFocusForArtifact(artifactKind: AiIdeRepairEvidenceBundleArtifactKind): string[] {
  switch (artifactKind) {
    case 'ai_ide_repair_playbook':
      return ['campaign context', 'target status matrix', 'prioritized action queue'];
    case 'ai_ide_playbook_consumption_report':
      return ['dry-run understanding', 'read-order compliance', 'blocked actions'];
    case 'ai_ide_repair_decision_package':
      return ['decision type', 'manual repair candidate classification', 'maintainer decision need'];
    case 'ai_ide_repair_approval_receipt':
      return ['approval decision', 'approved manual repair scope', 'pending items'];
    case 'ai_ide_approved_repair_execution_plan':
      return ['approved execution items', 'verification checklist', 'rollback and review checklist'];
    case 'ai_ide_repair_execution_evidence_report':
      return ['execution evidence', 'boundary violations', 'maintainer review status'];
  }
}

function buildVerificationChecklist(manifest: AiIdeRepairEvidenceBundleManifest): string[] {
  return [
    'Read artifacts in artifactReadSequence order before proposing any target repo repair action.',
    'Confirm all required artifacts are present and match the source manifest artifact inventory.',
    'Confirm blockedActions still prohibit target repo file mutation, branch creation, commit creation, pull request creation, issues, advisories, publication, launch, customer contact, and commercial availability claims.',
    'Confirm maintainer review remains pending before treating the evidence bundle as accepted.',
    `Confirm bundle currentStatus is ${manifest.bundleSummary.currentStatus}.`,
    'Regenerate the bundle manifest and consumer contract if any source artifact changes.'
  ];
}

function sanitize(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

function sanitizePath(value: string): string {
  return value
    .replaceAll('\\', '/')
    .split('/')
    .map((segment) => sanitize(segment))
    .join('/');
}
