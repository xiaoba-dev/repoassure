import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { redactSensitiveText } from './redaction.js';

export interface ValidationCampaignTargetInput {
  targetId: string;
  repoRoot: string;
  acceptanceRecordPath?: string;
}

export interface ValidationCampaignSummaryInput {
  generatedAt?: string;
  targets: ValidationCampaignTargetInput[];
}

export interface ValidationCampaignSummaryTarget {
  targetId: string;
  repoRootName: string;
  latestRunId: string | null;
  mode: string;
  runStatus: string;
  blockerCategory: string;
  nextRecommendedProductAction: string;
  requiredChecksFailed: number | null;
  evidence: {
    acceptanceRecord: string | null;
    runDir: string | null;
    targetRepoFeedbackSummary: string | null;
    aiIdeHandoffPackage: string | null;
    userValidationEvidenceLoop: string | null;
    report: string | null;
    repairTaskPackage: string | null;
    screenshots: string[];
  };
}

export type ValidationCampaignActionPriority = 'P0' | 'P1' | 'P2';
export type ValidationCampaignActionOwnerSurface =
  | 'repoassure_product'
  | 'maintainer_or_target_repo'
  | 'ai_ide_or_agent'
  | 'maintainer';

export interface ValidationCampaignActionItem {
  id: string;
  priority: ValidationCampaignActionPriority;
  action: string;
  ownerSurface: ValidationCampaignActionOwnerSurface;
  targetIds: string[];
  affectedModes: string[];
  blockerCategories: string[];
  recommendedVerification: string[];
  evidenceRefs: string[];
  nonAuthorizationBoundary: string;
}

export interface ValidationCampaignSummary {
  schemaVersion: 'repoassure.validation-campaign-summary.v1';
  generatedAt: string;
  campaignStatus: {
    totalTargets: number;
    passedTargets: number;
    blockedTargets: number;
    failedTargets: number;
    missingEvidenceTargets: number;
    productFollowUpActions: string[];
  };
  prioritizedActionQueue: ValidationCampaignActionItem[];
  targets: ValidationCampaignSummaryTarget[];
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export async function buildValidationCampaignSummary(input: ValidationCampaignSummaryInput): Promise<ValidationCampaignSummary> {
  const targets = await Promise.all(input.targets.map(buildTargetSummary));
  const productFollowUpActions = [...new Set(targets
    .map((target) => target.nextRecommendedProductAction)
    .filter((action) => action !== 'no_action' && action !== 'missing_evidence'))];

  return {
    schemaVersion: 'repoassure.validation-campaign-summary.v1',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    campaignStatus: {
      totalTargets: targets.length,
      passedTargets: targets.filter((target) => target.runStatus === 'passed').length,
      blockedTargets: targets.filter((target) => target.runStatus === 'blocked').length,
      failedTargets: targets.filter((target) => target.runStatus === 'failed').length,
      missingEvidenceTargets: targets.filter((target) => target.runStatus === 'missing_evidence').length,
      productFollowUpActions
    },
    prioritizedActionQueue: buildPrioritizedActionQueue(targets),
    targets,
    redactionBoundary: 'Local-only campaign index. Do not copy target repo source, secrets, reviewer credentials, customer data, OTP, cookies, access tokens, or raw private artifacts into this summary.',
    nonAuthorizationBoundary: 'This readiness evidence does not authorize public launch, npm publish, GitHub release, repository visibility changes, hosted dashboard claims, SaaS availability claims, pricing changes, spend, or customer contact.'
  };
}

export async function writeValidationCampaignSummary(input: ValidationCampaignSummaryInput & {
  outputDir: string;
}): Promise<{
  jsonPath: string;
  markdownPath: string;
  summary: ValidationCampaignSummary;
}> {
  const summary = await buildValidationCampaignSummary(input);
  const jsonPath = join(input.outputDir, 'campaign-summary.json');
  const markdownPath = join(input.outputDir, 'campaign-summary.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(markdownPath, buildValidationCampaignSummaryMarkdown(summary));

  return { jsonPath, markdownPath, summary };
}

export function buildValidationCampaignSummaryMarkdown(summary: ValidationCampaignSummary): string {
  const rows = summary.targets.map((target) => [
    target.targetId,
    target.mode,
    target.runStatus,
    target.blockerCategory,
    target.nextRecommendedProductAction,
    target.latestRunId ?? 'n/a'
  ].map(markdownCell).join(' | '));

  return [
    '# RepoAssure Real Target Validation Campaign Summary',
    '',
    `Generated at: ${summary.generatedAt}`,
    '',
    '## Status',
    '',
    `- Total targets: ${summary.campaignStatus.totalTargets}`,
    `- Passed targets: ${summary.campaignStatus.passedTargets}`,
    `- Blocked targets: ${summary.campaignStatus.blockedTargets}`,
    `- Failed targets: ${summary.campaignStatus.failedTargets}`,
    `- Missing evidence targets: ${summary.campaignStatus.missingEvidenceTargets}`,
    `- Product follow-up actions: ${summary.campaignStatus.productFollowUpActions.length > 0 ? summary.campaignStatus.productFollowUpActions.join(', ') : 'none'}`,
    '',
    '## Prioritized Action Queue',
    '',
    '| Priority | Action | Owner | Targets | Verification |',
    '| --- | --- | --- | --- | --- |',
    ...summary.prioritizedActionQueue.map((item) => `| ${[
      item.priority,
      item.action,
      item.ownerSurface,
      item.targetIds.join(', '),
      item.recommendedVerification.join(' / ')
    ].map(markdownCell).join(' | ')} |`),
    ...(summary.prioritizedActionQueue.length === 0 ? ['| n/a | none | n/a | n/a | n/a |'] : []),
    '',
    '## Targets',
    '',
    '| Target | Mode | Run status | Blocker | Product action | Latest run |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row} |`),
    '',
    '## Boundaries',
    '',
    `- ${summary.redactionBoundary}`,
    `- ${summary.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function buildPrioritizedActionQueue(targets: ValidationCampaignSummaryTarget[]): ValidationCampaignActionItem[] {
  const actionableTargets = targets.filter((target) => (
    target.nextRecommendedProductAction !== 'no_action'
    && target.nextRecommendedProductAction !== 'missing_evidence'
  ));
  const grouped = new Map<string, ValidationCampaignSummaryTarget[]>();

  for (const target of actionableTargets) {
    const group = grouped.get(target.nextRecommendedProductAction) ?? [];
    group.push(target);
    grouped.set(target.nextRecommendedProductAction, group);
  }

  return [...grouped.entries()]
    .map(([action, group]) => buildActionItem(action, group))
    .sort(compareActionItems);
}

function buildActionItem(action: string, targets: ValidationCampaignSummaryTarget[]): ValidationCampaignActionItem {
  const priority = classifyActionPriority(action, targets);

  return {
    id: `${priority}-${slugifyAction(action)}`,
    priority,
    action,
    ownerSurface: classifyOwnerSurface(action),
    targetIds: uniqueSorted(targets.map((target) => target.targetId)),
    affectedModes: uniqueSorted(targets.map((target) => target.mode)),
    blockerCategories: uniqueSorted(targets.map((target) => target.blockerCategory)),
    recommendedVerification: buildRecommendedVerification(action, targets),
    evidenceRefs: targets
      .map((target) => target.evidence.targetRepoFeedbackSummary)
      .filter((path): path is string => Boolean(path)),
    nonAuthorizationBoundary: 'This action item is product validation work only; it does not authorize public launch, npm publish, GitHub release, customer contact, pricing/spend, or commercial availability claims.'
  };
}

function classifyActionPriority(
  action: string,
  targets: ValidationCampaignSummaryTarget[]
): ValidationCampaignActionPriority {
  if (
    action === 'improve_repair_plan'
    || action === 'improve_generated_tests'
    || action === 'improve_detector'
    || targets.some((target) => target.runStatus === 'failed')
  ) {
    return 'P0';
  }

  if (
    action === 'document_target_stack'
    || action === 'request_user_input'
    || targets.some((target) => target.runStatus === 'blocked')
  ) {
    return 'P1';
  }

  return 'P2';
}

function classifyOwnerSurface(action: string): ValidationCampaignActionOwnerSurface {
  switch (action) {
    case 'improve_repair_plan':
    case 'improve_generated_tests':
    case 'improve_detector':
      return 'repoassure_product';
    case 'document_target_stack':
    case 'request_user_input':
      return 'maintainer_or_target_repo';
    case 'inspect_artifacts':
      return 'ai_ide_or_agent';
    default:
      return 'maintainer';
  }
}

function buildRecommendedVerification(
  action: string,
  targets: ValidationCampaignSummaryTarget[]
): string[] {
  const targetList = uniqueSorted(targets.map((target) => target.targetId)).join(', ');

  if (action === 'document_target_stack') {
    return [
      `Document target runtime prerequisites for ${targetList}.`,
      'Install or confirm target dependencies and local tooling.',
      'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
    ];
  }

  if (action === 'request_user_input') {
    return [
      `Ask maintainer for missing target repo input for ${targetList}.`,
      'Rerun the affected target repo acceptance command after input is corrected.',
      'Regenerate the campaign summary and confirm the action leaves the queue.'
    ];
  }

  return [
    `Inspect repair task package evidence for ${targetList}.`,
    'Add or update focused unit coverage before changing runtime behavior.',
    'Rerun the affected target repo acceptance command, then regenerate the campaign summary.'
  ];
}

function compareActionItems(a: ValidationCampaignActionItem, b: ValidationCampaignActionItem): number {
  const priorityRank: Record<ValidationCampaignActionPriority, number> = { P0: 0, P1: 1, P2: 2 };
  const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  return a.action.localeCompare(b.action);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

function slugifyAction(action: string): string {
  return action.replaceAll('_', '-');
}

async function buildTargetSummary(input: ValidationCampaignTargetInput): Promise<ValidationCampaignSummaryTarget> {
  const latestRunId = await findLatestRunId(input.repoRoot);
  const runDir = latestRunId ? join(input.repoRoot, '.hardening', 'runs', latestRunId) : null;
  const summaryPath = runDir ? join(runDir, 'target-repo-feedback-summary.json') : null;
  const feedbackSummary = summaryPath ? await readJsonIfExists(summaryPath) : null;
  const artifactLinks = isRecord(feedbackSummary?.artifactLinks) ? feedbackSummary.artifactLinks : {};
  const acceptanceResult = isRecord(feedbackSummary?.acceptanceResult) ? feedbackSummary.acceptanceResult : {};

  return {
    targetId: redactSensitiveText(input.targetId),
    repoRootName: redactSensitiveText(basename(input.repoRoot)),
    latestRunId,
    mode: readString(feedbackSummary?.mode, 'unknown'),
    runStatus: feedbackSummary ? readString(feedbackSummary.runStatus, 'unknown') : 'missing_evidence',
    blockerCategory: readString(feedbackSummary?.blockerCategory, feedbackSummary ? 'unknown' : 'missing_evidence'),
    nextRecommendedProductAction: readString(
      feedbackSummary?.nextRecommendedProductAction,
      feedbackSummary ? 'triage_required' : 'missing_evidence'
    ),
    requiredChecksFailed: readNumber(acceptanceResult.requiredChecksFailed),
    evidence: {
      acceptanceRecord: input.acceptanceRecordPath ? redactSensitiveText(input.acceptanceRecordPath) : null,
      runDir: runDir ? redactSensitiveText(runDir) : null,
      targetRepoFeedbackSummary: summaryPath ? redactSensitiveText(summaryPath) : null,
      aiIdeHandoffPackage: runDir ? join(runDir, 'ai-ide-handoff-package.json') : null,
      userValidationEvidenceLoop: runDir ? join(runDir, 'user-validation-evidence-loop.json') : null,
      report: readArtifactPath(runDir, artifactLinks.report),
      repairTaskPackage: readArtifactPath(runDir, artifactLinks.repairTaskPackage),
      screenshots: readStringArray(artifactLinks.screenshots).map((path) => readArtifactPath(runDir, path)).filter((path): path is string => Boolean(path))
    }
  };
}

async function findLatestRunId(repoRoot: string): Promise<string | null> {
  try {
    const runs = await readdir(join(repoRoot, '.hardening', 'runs'));
    return runs.filter((run) => run.startsWith('run-')).sort().at(-1) ?? null;
  } catch {
    return null;
  }
}

async function readJsonIfExists(path: string): Promise<Record<string, unknown> | null> {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readArtifactPath(runDir: string | null, value: unknown): string | null {
  if (!runDir || typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return redactSensitiveText(join(runDir, value));
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? redactSensitiveText(value) : fallback;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function markdownCell(value: string): string {
  return redactSensitiveText(value).replaceAll('|', '\\|');
}
