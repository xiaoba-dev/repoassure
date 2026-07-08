import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  AiIdeRepairEvidenceConsumerArtifactReadItem,
  AiIdeRepairEvidenceConsumerArtifactRole,
  AiIdeRepairEvidenceConsumerContract,
  AiIdeRepairEvidenceConsumerReadiness
} from './ai-ide-repair-evidence-consumer-contract.js';
import type { AiIdeRepairEvidenceBundleArtifactKind } from './ai-ide-repair-evidence-bundle-manifest.js';

export type AiIdeRepairExecutionReplayReadinessStatus =
  | 'ready_for_maintainer_replay_review'
  | 'blocked_or_incomplete'
  | 'review_required';

export type AiIdeRepairExecutionReplayStatus = 'replayed' | 'blocked';

export type AiIdeRepairExecutionReplayNextDecision =
  | 'maintainer_review_ready'
  | 'replay_blocked'
  | 'manual_review_required';

export interface AiIdeRepairExecutionReplayReadinessInput {
  generatedAt?: string;
  contractPath: string;
  contract: AiIdeRepairEvidenceConsumerContract;
}

export interface WriteAiIdeRepairExecutionReplayReadinessInput {
  generatedAt?: string;
  contractPath: string;
  outputDir: string;
}

export interface WriteAiIdeRepairExecutionReplayReadinessFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface AiIdeRepairExecutionReplaySourceConsumerContract {
  schemaVersion: string;
  fileName: string;
  path: string;
  sha256: string;
  consumerReadiness: AiIdeRepairEvidenceConsumerReadiness;
  artifactCount: number;
}

export interface AiIdeRepairExecutionReplayArtifact {
  step: number;
  artifactKind: AiIdeRepairEvidenceBundleArtifactKind;
  role: AiIdeRepairEvidenceConsumerArtifactRole;
  replayStatus: AiIdeRepairExecutionReplayStatus;
  required: boolean;
  fileName: string;
  verificationFocus: string[];
}

export interface AiIdeRepairExecutionVerificationReplay {
  checklistTotal: number;
  replayedChecklist: string[];
  blockedActionChecks: string[];
}

export interface AiIdeRepairExecutionBoundaryReplay {
  maintainerReviewBoundaryMaintained: boolean;
  redactionBoundaryMaintained: boolean;
  nonAuthorizationBoundaryMaintained: boolean;
  blockedActionsEnforced: boolean;
  unauthorizedActions: string[];
}

export interface AiIdeRepairExecutionReplayNextReviewDecision {
  decision: AiIdeRepairExecutionReplayNextDecision;
  reason: string;
  requiredHumanAction: 'review_replay_report_before_target_repo_repair_goal';
}

export interface AiIdeRepairExecutionReplayReadinessReport {
  schemaVersion: 'repoassure.ai-ide-repair-execution-replay-readiness.v1';
  generatedAt: string;
  replayReadiness: AiIdeRepairExecutionReplayReadinessStatus;
  sourceConsumerContract: AiIdeRepairExecutionReplaySourceConsumerContract;
  artifactReplay: AiIdeRepairExecutionReplayArtifact[];
  verificationReplay: AiIdeRepairExecutionVerificationReplay;
  boundaryReplay: AiIdeRepairExecutionBoundaryReplay;
  nextReviewDecision: AiIdeRepairExecutionReplayNextReviewDecision;
  blockedActions: string[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface WriteAiIdeRepairExecutionReplayReadinessResult {
  jsonPath: string;
  markdownPath: string;
  report: AiIdeRepairExecutionReplayReadinessReport;
}

const REQUIRED_BLOCKED_ACTIONS = [
  'target_repo_file_mutation',
  'target_repo_branch_creation',
  'target_repo_commit_creation'
] as const;

export function buildAiIdeRepairExecutionReplayReadiness(
  input: AiIdeRepairExecutionReplayReadinessInput
): AiIdeRepairExecutionReplayReadinessReport {
  const contractJson = JSON.stringify(input.contract);
  const blockedActions = [...new Set(input.contract.blockedActions.map(sanitize))];
  const boundaryReplay = buildBoundaryReplay(input.contract, blockedActions);
  const replayReadiness = classifyReplayReadiness(input.contract, boundaryReplay);
  const artifactReplay = input.contract.artifactReadSequence.map(buildArtifactReplay);

  return {
    schemaVersion: 'repoassure.ai-ide-repair-execution-replay-readiness.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    replayReadiness,
    sourceConsumerContract: {
      schemaVersion: sanitize(input.contract.schemaVersion),
      fileName: sanitize(basename(input.contractPath)),
      path: sanitizePath(input.contractPath),
      sha256: createHash('sha256').update(contractJson).digest('hex'),
      consumerReadiness: input.contract.consumerReadiness,
      artifactCount: input.contract.artifactReadSequence.length
    },
    artifactReplay,
    verificationReplay: {
      checklistTotal: input.contract.verificationChecklist.length,
      replayedChecklist: input.contract.verificationChecklist.map(sanitize),
      blockedActionChecks: blockedActions
    },
    boundaryReplay,
    nextReviewDecision: buildNextReviewDecision(replayReadiness),
    blockedActions,
    maintainerReviewBoundary: sanitize(input.contract.maintainerReviewBoundary),
    redactionBoundary: sanitize(input.contract.redactionBoundary),
    nonAuthorizationBoundary: sanitize(input.contract.nonAuthorizationBoundary)
  };
}

export async function writeAiIdeRepairExecutionReplayReadiness(
  input: WriteAiIdeRepairExecutionReplayReadinessInput
): Promise<WriteAiIdeRepairExecutionReplayReadinessResult> {
  const contract = JSON.parse(await readFile(input.contractPath, 'utf8')) as AiIdeRepairEvidenceConsumerContract;
  const report = buildAiIdeRepairExecutionReplayReadiness({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    contractPath: input.contractPath,
    contract
  });
  const jsonPath = join(input.outputDir, 'ai-ide-repair-execution-replay-readiness.json');
  const markdownPath = join(input.outputDir, 'ai-ide-repair-execution-replay-readiness.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeRepairExecutionReplayReadinessMarkdown(report));

  return { jsonPath, markdownPath, report };
}

export async function writeAiIdeRepairExecutionReplayReadinessFromDirectory(
  input: WriteAiIdeRepairExecutionReplayReadinessFromDirectoryInput
): Promise<WriteAiIdeRepairExecutionReplayReadinessResult> {
  return writeAiIdeRepairExecutionReplayReadiness({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    contractPath: join(input.inputDir, 'ai-ide-repair-evidence-consumer-contract.json'),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildAiIdeRepairExecutionReplayReadinessMarkdown(
  report: AiIdeRepairExecutionReplayReadinessReport
): string {
  return [
    '# RepoAssure AI IDE Repair Execution Replay Readiness',
    '',
    `Generated at: ${report.generatedAt}`,
    `Replay readiness: ${report.replayReadiness}`,
    '',
    '## Source Consumer Contract',
    '',
    `- fileName: ${report.sourceConsumerContract.fileName}`,
    `- schemaVersion: ${report.sourceConsumerContract.schemaVersion}`,
    `- consumerReadiness: ${report.sourceConsumerContract.consumerReadiness}`,
    `- artifactCount: ${report.sourceConsumerContract.artifactCount}`,
    '',
    '## Artifact Replay',
    '',
    '| Step | Artifact | Role | Status | Required |',
    '| --- | --- | --- | --- | --- |',
    ...report.artifactReplay.map((item) => `| ${[
      String(item.step),
      item.fileName,
      item.role,
      item.replayStatus,
      String(item.required)
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    '',
    '## Verification Replay',
    '',
    `Checklist total: ${report.verificationReplay.checklistTotal}`,
    '',
    ...report.verificationReplay.replayedChecklist.map((item) => `- ${item}`),
    '',
    '## Boundary Replay',
    '',
    `- maintainerReviewBoundaryMaintained: ${report.boundaryReplay.maintainerReviewBoundaryMaintained}`,
    `- redactionBoundaryMaintained: ${report.boundaryReplay.redactionBoundaryMaintained}`,
    `- nonAuthorizationBoundaryMaintained: ${report.boundaryReplay.nonAuthorizationBoundaryMaintained}`,
    `- blockedActionsEnforced: ${report.boundaryReplay.blockedActionsEnforced}`,
    `- unauthorizedActions: ${report.boundaryReplay.unauthorizedActions.length === 0 ? 'none' : report.boundaryReplay.unauthorizedActions.join(', ')}`,
    '',
    '## Blocked Actions',
    '',
    ...report.blockedActions.map((item) => `- ${item}`),
    '',
    '## Next Review Decision',
    '',
    `- decision: ${report.nextReviewDecision.decision}`,
    `- reason: ${report.nextReviewDecision.reason}`,
    `- requiredHumanAction: ${report.nextReviewDecision.requiredHumanAction}`,
    '',
    '## Maintainer Review Boundary',
    '',
    report.maintainerReviewBoundary,
    '',
    '## Boundaries',
    '',
    `- redactionBoundary: ${report.redactionBoundary}`,
    `- nonAuthorizationBoundary: ${report.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function buildArtifactReplay(
  item: AiIdeRepairEvidenceConsumerArtifactReadItem
): AiIdeRepairExecutionReplayArtifact {
  return {
    step: item.step,
    artifactKind: item.artifactKind,
    role: item.role,
    replayStatus: item.required ? 'replayed' : 'blocked',
    required: item.required,
    fileName: sanitize(item.fileName),
    verificationFocus: item.verificationFocus.map(sanitize)
  };
}

function buildBoundaryReplay(
  contract: AiIdeRepairEvidenceConsumerContract,
  blockedActions: string[]
): AiIdeRepairExecutionBoundaryReplay {
  const nonAuthorizationBoundary = contract.nonAuthorizationBoundary.toLowerCase();
  const maintainerReviewBoundary = contract.maintainerReviewBoundary.toLowerCase();
  const redactionBoundary = contract.redactionBoundary.toLowerCase();

  return {
    maintainerReviewBoundaryMaintained: maintainerReviewBoundary.includes('maintainer review'),
    redactionBoundaryMaintained: redactionBoundary.includes('redact'),
    nonAuthorizationBoundaryMaintained: nonAuthorizationBoundary.includes('does not authorize'),
    blockedActionsEnforced: REQUIRED_BLOCKED_ACTIONS.every((action) => blockedActions.includes(action)),
    unauthorizedActions: []
  };
}

function classifyReplayReadiness(
  contract: AiIdeRepairEvidenceConsumerContract,
  boundaryReplay: AiIdeRepairExecutionBoundaryReplay
): AiIdeRepairExecutionReplayReadinessStatus {
  if (
    contract.consumerReadiness === 'blocked_or_incomplete' ||
    !boundaryReplay.blockedActionsEnforced ||
    boundaryReplay.unauthorizedActions.length > 0
  ) {
    return 'blocked_or_incomplete';
  }

  if (
    contract.consumerReadiness === 'ready_for_ai_ide_consumption' &&
    boundaryReplay.maintainerReviewBoundaryMaintained &&
    boundaryReplay.redactionBoundaryMaintained &&
    boundaryReplay.nonAuthorizationBoundaryMaintained
  ) {
    return 'ready_for_maintainer_replay_review';
  }

  return 'review_required';
}

function buildNextReviewDecision(
  replayReadiness: AiIdeRepairExecutionReplayReadinessStatus
): AiIdeRepairExecutionReplayNextReviewDecision {
  if (replayReadiness === 'ready_for_maintainer_replay_review') {
    return {
      decision: 'maintainer_review_ready',
      reason: 'Consumer contract replay is complete and boundaries remain enforced.',
      requiredHumanAction: 'review_replay_report_before_target_repo_repair_goal'
    };
  }

  if (replayReadiness === 'blocked_or_incomplete') {
    return {
      decision: 'replay_blocked',
      reason: 'Consumer contract replay is blocked or required boundary checks are incomplete.',
      requiredHumanAction: 'review_replay_report_before_target_repo_repair_goal'
    };
  }

  return {
    decision: 'manual_review_required',
    reason: 'Consumer contract replay requires maintainer interpretation before any target repo repair goal.',
    requiredHumanAction: 'review_replay_report_before_target_repo_repair_goal'
  };
}

function sanitize(value: string): string {
  return redactSensitiveText(value);
}

function sanitizePath(value: string): string {
  return redactSensitiveText(value);
}
