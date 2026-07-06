import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  AiIdeRepairExecutionPlaybook,
  AiIdeRepairPlaybookArtifactKind,
  AiIdeRepairPlaybookExecutionStep,
  AiIdeRepairPlaybookTargetContext
} from './ai-ide-repair-playbook.js';

export type AiIdePlaybookTargetHandling =
  | 'no_repair_action_required'
  | 'environment_prerequisite_before_repair'
  | 'repair_candidate_after_maintainer_review';

export type AiIdePlaybookBlockedAction =
  | 'target_repo_file_mutation'
  | 'target_repo_branch_creation'
  | 'target_repo_commit_creation'
  | 'target_repo_pull_request_creation'
  | 'target_repo_issue_or_advisory_creation'
  | 'npm_publish'
  | 'github_release'
  | 'public_launch'
  | 'customer_contact'
  | 'commercial_availability_claim';

export interface AiIdePlaybookConsumptionReportInput {
  generatedAt?: string;
  playbookPath: string;
  playbook: AiIdeRepairExecutionPlaybook;
}

export interface WriteAiIdePlaybookConsumptionReportInput {
  generatedAt?: string;
  playbookPath: string;
  outputDir: string;
}

export interface AiIdePlaybookTargetDisposition {
  targetId: string;
  runStatus: string;
  blockerCategory: string;
  nextRecommendedProductAction: string;
  recommendedHandling: AiIdePlaybookTargetHandling;
}

export interface AiIdePlaybookCampaignUnderstanding {
  totalTargets: number;
  passedTargets: number;
  blockedTargets: number;
  failedTargets: number;
  missingEvidenceTargets: number;
  targetDispositions: AiIdePlaybookTargetDisposition[];
}

export interface AiIdePlaybookRepairTaskUnderstanding {
  sourceActionId: string;
  priority: string;
  ownerSurface: string;
  action: string;
  targetIds: string[];
  targetStatuses: AiIdePlaybookTargetDisposition[];
  readOrderArtifactKinds: AiIdeRepairPlaybookArtifactKind[];
  readOrderPaths: string[];
  verificationChecklist: string[];
  maintainerReviewRequired: boolean;
  maintainerReviewBoundary: string;
}

export interface AiIdePlaybookReadOrderCompliance {
  allExecutionStepsHaveReadOrder: boolean;
  allExecutionStepsHaveVerificationChecklist: boolean;
  allExecutionStepsPreserveMaintainerBoundary: boolean;
  missingReadOrderActionIds: string[];
  missingVerificationActionIds: string[];
  missingMaintainerBoundaryActionIds: string[];
}

export interface AiIdePlaybookDryRunDecision {
  automationMode: 'dry_run_report_only';
  allowedNextActions: string[];
  blockedActions: AiIdePlaybookBlockedAction[];
  boundaryStatement: string;
}

export interface AiIdePlaybookConsumptionReport {
  schemaVersion: 'repoassure.ai-ide-playbook-consumption-report.v1';
  generatedAt: string;
  sourcePlaybook: string;
  campaignUnderstanding: AiIdePlaybookCampaignUnderstanding;
  repairTaskUnderstanding: AiIdePlaybookRepairTaskUnderstanding[];
  readOrderCompliance: AiIdePlaybookReadOrderCompliance;
  dryRunDecision: AiIdePlaybookDryRunDecision;
  aiIdeConsumptionChecklist: string[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface WriteAiIdePlaybookConsumptionReportResult {
  jsonPath: string;
  markdownPath: string;
  report: AiIdePlaybookConsumptionReport;
}

export function buildAiIdePlaybookConsumptionReport(
  input: AiIdePlaybookConsumptionReportInput
): AiIdePlaybookConsumptionReport {
  const targetDispositions = input.playbook.campaignContext.targetStatusMatrix.map(buildTargetDisposition);
  const repairTaskUnderstanding = input.playbook.executionPlan.map((step) => buildRepairTaskUnderstanding(
    step,
    targetDispositions
  ));

  return {
    schemaVersion: 'repoassure.ai-ide-playbook-consumption-report.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    sourcePlaybook: sanitizePath(input.playbookPath),
    campaignUnderstanding: {
      totalTargets: input.playbook.campaignContext.totalTargets,
      passedTargets: input.playbook.campaignContext.passedTargets,
      blockedTargets: input.playbook.campaignContext.blockedTargets,
      failedTargets: input.playbook.campaignContext.failedTargets,
      missingEvidenceTargets: input.playbook.campaignContext.missingEvidenceTargets,
      targetDispositions
    },
    repairTaskUnderstanding,
    readOrderCompliance: buildReadOrderCompliance(input.playbook.executionPlan),
    dryRunDecision: {
      automationMode: 'dry_run_report_only',
      allowedNextActions: [
        'maintainer_review',
        'maintainer_approved_manual_target_repo_repair',
        'rerun_verification_after_approved_changes',
        'regenerate_campaign_summary_and_playbook'
      ],
      blockedActions: [
        'target_repo_file_mutation',
        'target_repo_branch_creation',
        'target_repo_commit_creation',
        'target_repo_pull_request_creation',
        'target_repo_issue_or_advisory_creation',
        'npm_publish',
        'github_release',
        'public_launch',
        'customer_contact',
        'commercial_availability_claim'
      ],
      boundaryStatement: 'This report is a dry-run understanding artifact only. No target repo branch, commit, pull request, issue, advisory, or file mutation is authorized.'
    },
    aiIdeConsumptionChecklist: input.playbook.aiIdeConsumptionChecklist.map(sanitize),
    maintainerReviewBoundary: buildMaintainerReviewBoundary(input.playbook.executionPlan),
    redactionBoundary: sanitize(input.playbook.redactionBoundary),
    nonAuthorizationBoundary: sanitize(input.playbook.nonAuthorizationBoundary)
  };
}

export async function writeAiIdePlaybookConsumptionReport(
  input: WriteAiIdePlaybookConsumptionReportInput
): Promise<WriteAiIdePlaybookConsumptionReportResult> {
  const parsed = JSON.parse(await readFile(input.playbookPath, 'utf8')) as AiIdeRepairExecutionPlaybook;
  const report = buildAiIdePlaybookConsumptionReport({
    playbookPath: input.playbookPath,
    playbook: parsed,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {})
  });
  const jsonPath = join(input.outputDir, 'ai-ide-playbook-consumption-report.json');
  const markdownPath = join(input.outputDir, 'ai-ide-playbook-consumption-report.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdePlaybookConsumptionReportMarkdown(report));

  return { jsonPath, markdownPath, report };
}

export function buildAiIdePlaybookConsumptionReportMarkdown(
  report: AiIdePlaybookConsumptionReport
): string {
  return [
    '# RepoAssure AI IDE Playbook Consumption Report',
    '',
    `Generated at: ${report.generatedAt}`,
    `Source playbook: ${report.sourcePlaybook}`,
    '',
    '## Campaign Understanding',
    '',
    '| Target | Status | Blocker | Product action | Recommended handling |',
    '| --- | --- | --- | --- | --- |',
    ...report.campaignUnderstanding.targetDispositions.map((target) => `| ${[
      target.targetId,
      target.runStatus,
      target.blockerCategory,
      target.nextRecommendedProductAction,
      target.recommendedHandling
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(report.campaignUnderstanding.targetDispositions.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Repair Task Understanding',
    '',
    '| Action | Priority | Owner | Targets | Read order | Verification | Maintainer review |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...report.repairTaskUnderstanding.map((task) => `| ${[
      task.sourceActionId,
      task.priority,
      task.ownerSurface,
      task.targetIds.join(', '),
      task.readOrderArtifactKinds.join(' / '),
      task.verificationChecklist.join(' / '),
      task.maintainerReviewRequired ? 'required' : 'missing'
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(report.repairTaskUnderstanding.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Read Order Compliance',
    '',
    `- allExecutionStepsHaveReadOrder: ${String(report.readOrderCompliance.allExecutionStepsHaveReadOrder)}`,
    `- allExecutionStepsHaveVerificationChecklist: ${String(report.readOrderCompliance.allExecutionStepsHaveVerificationChecklist)}`,
    `- allExecutionStepsPreserveMaintainerBoundary: ${String(report.readOrderCompliance.allExecutionStepsPreserveMaintainerBoundary)}`,
    '',
    '## Maintainer Review Boundary',
    '',
    `- ${report.maintainerReviewBoundary}`,
    `- ${report.dryRunDecision.boundaryStatement}`,
    '',
    '## Blocked Actions',
    '',
    ...report.dryRunDecision.blockedActions.map((action) => `- ${action}`),
    '',
    '## Boundaries',
    '',
    `- ${report.redactionBoundary}`,
    `- ${report.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function buildRepairTaskUnderstanding(
  step: AiIdeRepairPlaybookExecutionStep,
  targetDispositions: AiIdePlaybookTargetDisposition[]
): AiIdePlaybookRepairTaskUnderstanding {
  const targetStatuses = step.targetIds
    .map((targetId) => targetDispositions.find((target) => target.targetId === targetId))
    .filter((target): target is AiIdePlaybookTargetDisposition => target !== undefined);

  return {
    sourceActionId: sanitize(step.sourceActionId),
    priority: sanitize(step.priority),
    ownerSurface: sanitize(step.ownerSurface),
    action: sanitize(step.action),
    targetIds: step.targetIds.map(sanitize),
    targetStatuses,
    readOrderArtifactKinds: step.readOrder.map((entry) => entry.artifactKind),
    readOrderPaths: step.readOrder.map((entry) => sanitizePath(entry.path)),
    verificationChecklist: step.verificationChecklist.map(sanitize),
    maintainerReviewRequired: hasMaintainerReviewBoundary(step),
    maintainerReviewBoundary: sanitize(step.maintainerReviewBoundary)
  };
}

function buildReadOrderCompliance(
  executionPlan: AiIdeRepairPlaybookExecutionStep[]
): AiIdePlaybookReadOrderCompliance {
  const missingReadOrderActionIds = executionPlan
    .filter((step) => step.readOrder.length === 0)
    .map((step) => sanitize(step.sourceActionId));
  const missingVerificationActionIds = executionPlan
    .filter((step) => step.verificationChecklist.length === 0)
    .map((step) => sanitize(step.sourceActionId));
  const missingMaintainerBoundaryActionIds = executionPlan
    .filter((step) => !hasMaintainerReviewBoundary(step))
    .map((step) => sanitize(step.sourceActionId));

  return {
    allExecutionStepsHaveReadOrder: missingReadOrderActionIds.length === 0,
    allExecutionStepsHaveVerificationChecklist: missingVerificationActionIds.length === 0,
    allExecutionStepsPreserveMaintainerBoundary: missingMaintainerBoundaryActionIds.length === 0,
    missingReadOrderActionIds,
    missingVerificationActionIds,
    missingMaintainerBoundaryActionIds
  };
}

function buildTargetDisposition(
  target: AiIdeRepairPlaybookTargetContext
): AiIdePlaybookTargetDisposition {
  return {
    targetId: sanitize(target.targetId),
    runStatus: sanitize(target.runStatus),
    blockerCategory: sanitize(target.blockerCategory),
    nextRecommendedProductAction: sanitize(target.nextRecommendedProductAction),
    recommendedHandling: classifyTargetHandling(target)
  };
}

function classifyTargetHandling(target: AiIdeRepairPlaybookTargetContext): AiIdePlaybookTargetHandling {
  if (target.runStatus === 'passed') {
    return 'no_repair_action_required';
  }

  if (target.blockerCategory === 'environment') {
    return 'environment_prerequisite_before_repair';
  }

  return 'repair_candidate_after_maintainer_review';
}

function buildMaintainerReviewBoundary(executionPlan: AiIdeRepairPlaybookExecutionStep[]): string {
  const boundary = executionPlan.find(hasMaintainerReviewBoundary)?.maintainerReviewBoundary
    ?? 'Stop for maintainer review before modifying target repo files, applying patches, creating branches, commits, pull requests, issues, or advisories.';

  return sanitize(boundary);
}

function hasMaintainerReviewBoundary(step: AiIdeRepairPlaybookExecutionStep): boolean {
  return /maintainer review/iu.test(step.maintainerReviewBoundary)
    && /before modifying target repo files/iu.test(step.maintainerReviewBoundary);
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
