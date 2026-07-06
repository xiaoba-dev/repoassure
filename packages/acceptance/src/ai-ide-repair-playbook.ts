import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  ValidationCampaignActionItem,
  ValidationCampaignActionOwnerSurface,
  ValidationCampaignActionPriority,
  ValidationCampaignSummary,
  ValidationCampaignSummaryTarget
} from './campaign-summary.js';

export type AiIdeRepairPlaybookArtifactKind =
  | 'target_repo_feedback_summary'
  | 'ai_ide_handoff_package'
  | 'repair_task_package'
  | 'user_validation_evidence_loop';

export interface AiIdeRepairPlaybookInput {
  generatedAt?: string;
  campaignSummaryPath: string;
  campaignSummary: ValidationCampaignSummary;
}

export interface WriteAiIdeRepairPlaybookInput {
  generatedAt?: string;
  campaignSummaryPath: string;
  outputDir: string;
}

export interface AiIdeRepairPlaybookReadEntry {
  artifactKind: AiIdeRepairPlaybookArtifactKind;
  targetId: string;
  path: string;
  reason: string;
}

export interface AiIdeRepairPlaybookTargetContext {
  targetId: string;
  repoRootName: string;
  latestRunId: string | null;
  mode: string;
  runStatus: string;
  blockerCategory: string;
  nextRecommendedProductAction: string;
  requiredChecksFailed: number | null;
}

export interface AiIdeRepairPlaybookCampaignContext {
  totalTargets: number;
  passedTargets: number;
  blockedTargets: number;
  failedTargets: number;
  missingEvidenceTargets: number;
  productFollowUpActions: string[];
  targetStatusMatrix: AiIdeRepairPlaybookTargetContext[];
}

export interface AiIdeRepairPlaybookExecutionStep {
  sourceActionId: string;
  priority: ValidationCampaignActionPriority;
  ownerSurface: ValidationCampaignActionOwnerSurface;
  action: string;
  targetIds: string[];
  targetContexts: AiIdeRepairPlaybookTargetContext[];
  affectedModes: string[];
  blockerCategories: string[];
  readOrder: AiIdeRepairPlaybookReadEntry[];
  verificationChecklist: string[];
  maintainerReviewBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface AiIdeRepairExecutionPlaybook {
  schemaVersion: 'repoassure.ai-ide-repair-execution-playbook.v1';
  generatedAt: string;
  sourceCampaignSummary: string;
  campaignContext: AiIdeRepairPlaybookCampaignContext;
  executionPlan: AiIdeRepairPlaybookExecutionStep[];
  aiIdeConsumptionChecklist: string[];
  executionGuardrails: string[];
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface WriteAiIdeRepairPlaybookResult {
  jsonPath: string;
  markdownPath: string;
  playbook: AiIdeRepairExecutionPlaybook;
}

export function buildAiIdeRepairExecutionPlaybook(
  input: AiIdeRepairPlaybookInput
): AiIdeRepairExecutionPlaybook {
  return {
    schemaVersion: 'repoassure.ai-ide-repair-execution-playbook.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    sourceCampaignSummary: sanitizePath(input.campaignSummaryPath),
    campaignContext: buildCampaignContext(input.campaignSummary),
    executionPlan: input.campaignSummary.prioritizedActionQueue.map((action) => buildExecutionStep(
      action,
      input.campaignSummary.targets
    )),
    aiIdeConsumptionChecklist: [
      'Review campaignContext.targetStatusMatrix before editing target repos.',
      'Read each executionPlan item in readOrder before opening repair-task-package.json.',
      'Treat blocked or environment targets as prerequisite work unless maintainer explicitly asks for product runtime changes.',
      'Run verificationChecklist after maintainer-approved target changes, then regenerate the campaign summary and playbook.'
    ],
    executionGuardrails: [
      'Do not upload target repo source, secrets, reviewer credentials, customer data, or raw private artifacts.',
      'Do not automatically modify target repos, apply patches, create branches, commits, pull requests, issues, or advisories from this playbook.',
      'Do not treat generated tests, patch diffs, or repair packages as already approved changes.',
      'Stop for maintainer review before applying target repo changes or publishing follow-up material.'
    ],
    redactionBoundary: 'Local-only execution guidance. Store artifact references and sanitized summaries only; never store secrets, raw private source, reviewer PII, credentials, cookies, tokens, or customer data.',
    nonAuthorizationBoundary: 'This playbook is repair execution guidance only; it does not authorize public launch, npm publish, GitHub release, repository visibility changes, production marketing announcement, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.'
  };
}

export async function writeAiIdeRepairExecutionPlaybook(
  input: WriteAiIdeRepairPlaybookInput
): Promise<WriteAiIdeRepairPlaybookResult> {
  const parsed = JSON.parse(await readFile(input.campaignSummaryPath, 'utf8')) as ValidationCampaignSummary;
  const playbook = buildAiIdeRepairExecutionPlaybook({
    campaignSummaryPath: input.campaignSummaryPath,
    campaignSummary: parsed,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {})
  });
  const jsonPath = join(input.outputDir, 'ai-ide-repair-playbook.json');
  const markdownPath = join(input.outputDir, 'ai-ide-repair-playbook.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(playbook, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeRepairExecutionPlaybookMarkdown(playbook));

  return { jsonPath, markdownPath, playbook };
}

export function buildAiIdeRepairExecutionPlaybookMarkdown(
  playbook: AiIdeRepairExecutionPlaybook
): string {
  return [
    '# RepoAssure AI IDE Repair Execution Playbook',
    '',
    `Generated at: ${playbook.generatedAt}`,
    `Source campaign summary: ${playbook.sourceCampaignSummary}`,
    '',
    '## Campaign Target Matrix',
    '',
    '| Target | Mode | Run status | Blocker | Product action | Latest run |',
    '| --- | --- | --- | --- | --- | --- |',
    ...playbook.campaignContext.targetStatusMatrix.map((target) => `| ${[
      target.targetId,
      target.mode,
      target.runStatus,
      target.blockerCategory,
      target.nextRecommendedProductAction,
      target.latestRunId ?? 'n/a'
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(playbook.campaignContext.targetStatusMatrix.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Execution Plan',
    '',
    '| Priority | Action item | Owner | Targets | Required reading | Verification |',
    '| --- | --- | --- | --- | --- | --- |',
    ...playbook.executionPlan.map((step) => `| ${[
      step.priority,
      step.sourceActionId,
      step.ownerSurface,
      step.targetIds.join(', '),
      step.readOrder.map((entry) => `${entry.targetId}:${entry.path}`).join(' / '),
      step.verificationChecklist.join(' / ')
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(playbook.executionPlan.length === 0 ? ['| n/a | No prioritized action queue items | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## AI IDE consumption checklist',
    '',
    ...playbook.aiIdeConsumptionChecklist.map((item) => `- ${item}`),
    '',
    '## Maintainer review boundary',
    '',
    ...playbook.executionPlan.map((step) => `- ${step.sourceActionId}: ${step.maintainerReviewBoundary}`),
    ...(playbook.executionPlan.length === 0 ? ['- No action items require repair execution.'] : []),
    '',
    '## Guardrails',
    '',
    ...playbook.executionGuardrails.map((guardrail) => `- ${guardrail}`),
    '',
    '## Boundaries',
    '',
    `- ${playbook.redactionBoundary}`,
    `- ${playbook.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function buildExecutionStep(
  action: ValidationCampaignActionItem,
  targets: ValidationCampaignSummaryTarget[]
): AiIdeRepairPlaybookExecutionStep {
  const actionTargets = targets.filter((target) => action.targetIds.includes(target.targetId));

  return {
    sourceActionId: sanitize(action.id),
    priority: action.priority,
    ownerSurface: action.ownerSurface,
    action: sanitize(action.action),
    targetIds: action.targetIds.map(sanitize),
    targetContexts: actionTargets.map(buildTargetContext),
    affectedModes: action.affectedModes.map(sanitize),
    blockerCategories: action.blockerCategories.map(sanitize),
    readOrder: actionTargets.flatMap(buildReadOrder),
    verificationChecklist: action.recommendedVerification.map(sanitize),
    maintainerReviewBoundary: 'Stop for maintainer review before modifying target repo files, applying patches, creating branches, commits, pull requests, issues, or advisories.',
    nonAuthorizationBoundary: sanitize(action.nonAuthorizationBoundary)
  };
}

function buildCampaignContext(summary: ValidationCampaignSummary): AiIdeRepairPlaybookCampaignContext {
  return {
    totalTargets: summary.campaignStatus.totalTargets,
    passedTargets: summary.campaignStatus.passedTargets,
    blockedTargets: summary.campaignStatus.blockedTargets,
    failedTargets: summary.campaignStatus.failedTargets,
    missingEvidenceTargets: summary.campaignStatus.missingEvidenceTargets,
    productFollowUpActions: summary.campaignStatus.productFollowUpActions.map(sanitize),
    targetStatusMatrix: summary.targets.map(buildTargetContext)
  };
}

function buildTargetContext(target: ValidationCampaignSummaryTarget): AiIdeRepairPlaybookTargetContext {
  return {
    targetId: sanitize(target.targetId),
    repoRootName: sanitize(target.repoRootName),
    latestRunId: target.latestRunId ? sanitize(target.latestRunId) : null,
    mode: sanitize(target.mode),
    runStatus: sanitize(target.runStatus),
    blockerCategory: sanitize(target.blockerCategory),
    nextRecommendedProductAction: sanitize(target.nextRecommendedProductAction),
    requiredChecksFailed: target.requiredChecksFailed
  };
}

function buildReadOrder(target: ValidationCampaignSummaryTarget): AiIdeRepairPlaybookReadEntry[] {
  return [
    buildReadEntry('target_repo_feedback_summary', target, target.evidence.targetRepoFeedbackSummary, 'Start here to confirm run status, blocker category, next recommended action, and required check failures.'),
    buildReadEntry('ai_ide_handoff_package', target, target.evidence.aiIdeHandoffPackage, 'Use second to follow ordered AI IDE material guidance and quality gates.'),
    buildReadEntry('repair_task_package', target, target.evidence.repairTaskPackage, 'Use third to inspect the smallest executable repair tasks before editing code.'),
    buildReadEntry('user_validation_evidence_loop', target, target.evidence.userValidationEvidenceLoop, 'Use fourth to confirm feedback status and maintainer decision boundaries.')
  ].filter((entry): entry is AiIdeRepairPlaybookReadEntry => entry !== undefined);
}

function buildReadEntry(
  artifactKind: AiIdeRepairPlaybookArtifactKind,
  target: ValidationCampaignSummaryTarget,
  path: string | null,
  reason: string
): AiIdeRepairPlaybookReadEntry | undefined {
  if (!path) {
    return undefined;
  }

  return {
    artifactKind,
    targetId: sanitize(target.targetId),
    path: sanitizePath(path),
    reason
  };
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
