import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  AiIdePlaybookBlockedAction,
  AiIdePlaybookConsumptionReport,
  AiIdePlaybookRepairTaskUnderstanding,
  AiIdePlaybookTargetDisposition
} from './ai-ide-playbook-consumption-report.js';

export type AiIdeRepairDecisionType =
  | 'manual_repair_candidate'
  | 'environment_prerequisite'
  | 'repoassure_product_improvement'
  | 'deferred_or_blocked';

export type AiIdeRepairDecisionApproval =
  | 'target_repo_maintainer'
  | 'repoassure_maintainer'
  | 'manual_triage_required';

export type AiIdeTargetReviewDecision =
  | 'no_action'
  | 'manual_repair_candidate'
  | 'environment_prerequisite'
  | 'repoassure_product_improvement'
  | 'deferred_or_blocked';

export interface AiIdeRepairDecisionPackageInput {
  generatedAt?: string;
  consumptionReportPath: string;
  consumptionReport: AiIdePlaybookConsumptionReport;
}

export interface WriteAiIdeRepairDecisionPackageInput {
  generatedAt?: string;
  consumptionReportPath: string;
  outputDir: string;
}

export interface AiIdeRepairDecisionSummary {
  totalDecisionItems: number;
  manualRepairCandidates: number;
  environmentPrerequisites: number;
  repoassureProductImprovements: number;
  deferredOrBlocked: number;
  noActionTargets: number;
}

export interface AiIdeRepairDecisionItem {
  sourceActionId: string;
  priority: string;
  ownerSurface: string;
  action: string;
  targetIds: string[];
  decisionType: AiIdeRepairDecisionType;
  requiredApproval: AiIdeRepairDecisionApproval;
  rationale: string;
  recommendedNextAction: string;
  readOrderPaths: string[];
  verificationChecklist: string[];
  inheritedBlockedActions: AiIdePlaybookBlockedAction[];
}

export interface AiIdeRepairDecisionTargetReview {
  targetId: string;
  runStatus: string;
  blockerCategory: string;
  nextRecommendedProductAction: string;
  recommendedHandling: string;
  reviewDecision: AiIdeTargetReviewDecision;
}

export interface AiIdeRepairDecisionPackage {
  schemaVersion: 'repoassure.ai-ide-repair-decision-package.v1';
  generatedAt: string;
  sourceConsumptionReport: string;
  decisionSummary: AiIdeRepairDecisionSummary;
  decisionItems: AiIdeRepairDecisionItem[];
  targetReviewSummary: AiIdeRepairDecisionTargetReview[];
  maintainerDecisionChecklist: string[];
  inheritedDryRunBlockedActions: AiIdePlaybookBlockedAction[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface WriteAiIdeRepairDecisionPackageResult {
  jsonPath: string;
  markdownPath: string;
  decisionPackage: AiIdeRepairDecisionPackage;
}

export function buildAiIdeRepairDecisionPackage(
  input: AiIdeRepairDecisionPackageInput
): AiIdeRepairDecisionPackage {
  const decisionItems = input.consumptionReport.repairTaskUnderstanding.map((task) => buildDecisionItem(
    task,
    input.consumptionReport.dryRunDecision.blockedActions
  ));
  const targetReviewSummary = input.consumptionReport.campaignUnderstanding.targetDispositions.map(
    (target) => buildTargetReview(target, decisionItems)
  );

  return {
    schemaVersion: 'repoassure.ai-ide-repair-decision-package.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    sourceConsumptionReport: sanitizePath(input.consumptionReportPath),
    decisionSummary: {
      totalDecisionItems: decisionItems.length,
      manualRepairCandidates: countDecisionType(decisionItems, 'manual_repair_candidate'),
      environmentPrerequisites: countDecisionType(decisionItems, 'environment_prerequisite'),
      repoassureProductImprovements: countDecisionType(decisionItems, 'repoassure_product_improvement'),
      deferredOrBlocked: countDecisionType(decisionItems, 'deferred_or_blocked'),
      noActionTargets: targetReviewSummary.filter((target) => target.reviewDecision === 'no_action').length
    },
    decisionItems,
    targetReviewSummary,
    maintainerDecisionChecklist: [
      'Approve or reject each manual_repair_candidate before any target repo edit.',
      'Resolve each environment_prerequisite before treating the target repo as repair-ready.',
      'Route each repoassure_product_improvement to the RepoAssure backlog before asking the target repo maintainer to patch.',
      'Rerun verification after maintainer-approved changes, then regenerate campaign summary, playbook, consumption report, and decision package.'
    ],
    inheritedDryRunBlockedActions: input.consumptionReport.dryRunDecision.blockedActions,
    maintainerReviewBoundary: sanitize(input.consumptionReport.maintainerReviewBoundary),
    redactionBoundary: sanitize(input.consumptionReport.redactionBoundary),
    nonAuthorizationBoundary: 'This decision package is maintainer review guidance only; it does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, npm publication, GitHub release, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.'
  };
}

export async function writeAiIdeRepairDecisionPackage(
  input: WriteAiIdeRepairDecisionPackageInput
): Promise<WriteAiIdeRepairDecisionPackageResult> {
  const parsed = JSON.parse(await readFile(input.consumptionReportPath, 'utf8')) as AiIdePlaybookConsumptionReport;
  const decisionPackage = buildAiIdeRepairDecisionPackage({
    consumptionReportPath: input.consumptionReportPath,
    consumptionReport: parsed,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {})
  });
  const jsonPath = join(input.outputDir, 'ai-ide-repair-decision-package.json');
  const markdownPath = join(input.outputDir, 'ai-ide-repair-decision-package.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(decisionPackage, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeRepairDecisionPackageMarkdown(decisionPackage));

  return { jsonPath, markdownPath, decisionPackage };
}

export function buildAiIdeRepairDecisionPackageMarkdown(
  decisionPackage: AiIdeRepairDecisionPackage
): string {
  return [
    '# RepoAssure AI IDE Repair Decision Package',
    '',
    `Generated at: ${decisionPackage.generatedAt}`,
    `Source consumption report: ${decisionPackage.sourceConsumptionReport}`,
    '',
    '## Decision Summary',
    '',
    `- totalDecisionItems: ${decisionPackage.decisionSummary.totalDecisionItems}`,
    `- manualRepairCandidates: ${decisionPackage.decisionSummary.manualRepairCandidates}`,
    `- environmentPrerequisites: ${decisionPackage.decisionSummary.environmentPrerequisites}`,
    `- repoassureProductImprovements: ${decisionPackage.decisionSummary.repoassureProductImprovements}`,
    `- deferredOrBlocked: ${decisionPackage.decisionSummary.deferredOrBlocked}`,
    `- noActionTargets: ${decisionPackage.decisionSummary.noActionTargets}`,
    '',
    '## Decision Items',
    '',
    '| Action | Type | Approval | Targets | Next action |',
    '| --- | --- | --- | --- | --- |',
    ...decisionPackage.decisionItems.map((item) => `| ${[
      item.sourceActionId,
      item.decisionType,
      item.requiredApproval,
      item.targetIds.join(', '),
      item.recommendedNextAction
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(decisionPackage.decisionItems.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Target Review Summary',
    '',
    '| Target | Status | Blocker | Handling | Review decision |',
    '| --- | --- | --- | --- | --- |',
    ...decisionPackage.targetReviewSummary.map((target) => `| ${[
      target.targetId,
      target.runStatus,
      target.blockerCategory,
      target.recommendedHandling,
      target.reviewDecision
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(decisionPackage.targetReviewSummary.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Maintainer Decision Checklist',
    '',
    ...decisionPackage.maintainerDecisionChecklist.map((item) => `- ${item}`),
    '',
    '## Non-Authorization Boundary',
    '',
    `- ${decisionPackage.maintainerReviewBoundary}`,
    '- No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized.',
    `- ${decisionPackage.nonAuthorizationBoundary}`,
    '',
    '## Inherited Blocked Actions',
    '',
    ...decisionPackage.inheritedDryRunBlockedActions.map((action) => `- ${action}`),
    '',
    '## Boundaries',
    '',
    `- ${decisionPackage.redactionBoundary}`,
    `- ${decisionPackage.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function buildDecisionItem(
  task: AiIdePlaybookRepairTaskUnderstanding,
  blockedActions: AiIdePlaybookBlockedAction[]
): AiIdeRepairDecisionItem {
  const decisionType = classifyDecisionType(task);

  return {
    sourceActionId: sanitize(task.sourceActionId),
    priority: sanitize(task.priority),
    ownerSurface: sanitize(task.ownerSurface),
    action: sanitize(task.action),
    targetIds: task.targetIds.map(sanitize),
    decisionType,
    requiredApproval: classifyRequiredApproval(decisionType),
    rationale: buildRationale(task, decisionType),
    recommendedNextAction: recommendedNextAction(decisionType),
    readOrderPaths: task.readOrderPaths.map(sanitizePath),
    verificationChecklist: task.verificationChecklist.map(sanitize),
    inheritedBlockedActions: blockedActions
  };
}

function classifyDecisionType(task: AiIdePlaybookRepairTaskUnderstanding): AiIdeRepairDecisionType {
  if (task.ownerSurface === 'repoassure_product') {
    return 'repoassure_product_improvement';
  }

  if (task.targetStatuses.some((target) => target.recommendedHandling === 'environment_prerequisite_before_repair')) {
    return 'environment_prerequisite';
  }

  if (
    task.maintainerReviewRequired
    && task.targetStatuses.some((target) => target.recommendedHandling === 'repair_candidate_after_maintainer_review')
  ) {
    return 'manual_repair_candidate';
  }

  return 'deferred_or_blocked';
}

function classifyRequiredApproval(decisionType: AiIdeRepairDecisionType): AiIdeRepairDecisionApproval {
  if (decisionType === 'repoassure_product_improvement') {
    return 'repoassure_maintainer';
  }

  if (decisionType === 'manual_repair_candidate' || decisionType === 'environment_prerequisite') {
    return 'target_repo_maintainer';
  }

  return 'manual_triage_required';
}

function recommendedNextAction(decisionType: AiIdeRepairDecisionType): string {
  if (decisionType === 'repoassure_product_improvement') {
    return 'Route to RepoAssure product backlog before target repo repair.';
  }

  if (decisionType === 'environment_prerequisite') {
    return 'Document or satisfy target runtime prerequisites before repair.';
  }

  if (decisionType === 'manual_repair_candidate') {
    return 'Maintainer may approve manual target repo repair using the listed read order and verification checklist.';
  }

  return 'Defer repair until missing read order, verification, or maintainer boundary evidence is resolved.';
}

function buildRationale(
  task: AiIdePlaybookRepairTaskUnderstanding,
  decisionType: AiIdeRepairDecisionType
): string {
  if (decisionType === 'repoassure_product_improvement') {
    return `Action ${sanitize(task.sourceActionId)} is owned by RepoAssure product surface.`;
  }

  if (decisionType === 'environment_prerequisite') {
    return `Action ${sanitize(task.sourceActionId)} includes an environment prerequisite target.`;
  }

  if (decisionType === 'manual_repair_candidate') {
    return `Action ${sanitize(task.sourceActionId)} has maintainer review boundary, read order, and verification checklist.`;
  }

  return `Action ${sanitize(task.sourceActionId)} lacks enough evidence for repair approval.`;
}

function buildTargetReview(
  target: AiIdePlaybookTargetDisposition,
  decisionItems: AiIdeRepairDecisionItem[]
): AiIdeRepairDecisionTargetReview {
  return {
    targetId: sanitize(target.targetId),
    runStatus: sanitize(target.runStatus),
    blockerCategory: sanitize(target.blockerCategory),
    nextRecommendedProductAction: sanitize(target.nextRecommendedProductAction),
    recommendedHandling: sanitize(target.recommendedHandling),
    reviewDecision: classifyTargetReviewDecision(target, decisionItems)
  };
}

function classifyTargetReviewDecision(
  target: AiIdePlaybookTargetDisposition,
  decisionItems: AiIdeRepairDecisionItem[]
): AiIdeTargetReviewDecision {
  if (target.recommendedHandling === 'no_repair_action_required') {
    return 'no_action';
  }

  const matchingItems = decisionItems.filter((item) => item.targetIds.includes(target.targetId));

  if (matchingItems.some((item) => item.decisionType === 'environment_prerequisite')) {
    return 'environment_prerequisite';
  }

  if (matchingItems.some((item) => item.decisionType === 'manual_repair_candidate')) {
    return 'manual_repair_candidate';
  }

  if (matchingItems.some((item) => item.decisionType === 'repoassure_product_improvement')) {
    return 'repoassure_product_improvement';
  }

  return 'deferred_or_blocked';
}

function countDecisionType(items: AiIdeRepairDecisionItem[], decisionType: AiIdeRepairDecisionType): number {
  return items.filter((item) => item.decisionType === decisionType).length;
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
