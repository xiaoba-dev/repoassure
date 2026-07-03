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

export interface ValidationCampaignSummary {
  schemaVersion: 'repoassure.validation-campaign-summary.v1';
  generatedAt: string;
  campaignStatus: {
    totalTargets: number;
    passedTargets: number;
    failedTargets: number;
    missingEvidenceTargets: number;
    productFollowUpActions: string[];
  };
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
      failedTargets: targets.filter((target) => target.runStatus === 'failed').length,
      missingEvidenceTargets: targets.filter((target) => target.runStatus === 'missing_evidence').length,
      productFollowUpActions
    },
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
    `- Failed targets: ${summary.campaignStatus.failedTargets}`,
    `- Missing evidence targets: ${summary.campaignStatus.missingEvidenceTargets}`,
    `- Product follow-up actions: ${summary.campaignStatus.productFollowUpActions.length > 0 ? summary.campaignStatus.productFollowUpActions.join(', ') : 'none'}`,
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
