import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type {
  AiIdeApprovedRepairExecutionItem,
  AiIdeApprovedRepairExecutionPlan
} from './ai-ide-approved-repair-execution-plan.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type AiIdeRepairExecutionEvidenceStatus =
  | 'verified'
  | 'blocked'
  | 'failed'
  | 'not_started';

export type AiIdeRepairExecutionVerificationStatus =
  | 'passed'
  | 'failed'
  | 'blocked'
  | 'not_run';

export type AiIdeRepairExecutionReadOrderCompliance =
  | 'complete'
  | 'incomplete';

export type AiIdeRepairExecutionMaintainerReviewStatus =
  | 'pending_review'
  | 'accepted'
  | 'changes_requested'
  | 'not_ready';

export interface AiIdeRepairExecutionVerificationResult {
  label: string;
  status: AiIdeRepairExecutionVerificationStatus;
  evidence: string;
}

export interface AiIdeRepairExecutionEvidenceItemInput {
  sourceActionId: string;
  executionStatus: AiIdeRepairExecutionEvidenceStatus;
  readOrderPathsRead: string[];
  verificationResults: AiIdeRepairExecutionVerificationResult[];
  maintainerReviewStatus: AiIdeRepairExecutionMaintainerReviewStatus;
  notes: string;
}

export interface AiIdeRepairExecutionBoundaryEvidenceInput {
  unauthorizedActions?: string[];
  notes: string;
}

export interface AiIdeRepairExecutionEvidenceInput {
  executionItems?: AiIdeRepairExecutionEvidenceItemInput[];
  boundaryEvidence?: AiIdeRepairExecutionBoundaryEvidenceInput;
}

export interface AiIdeRepairExecutionEvidenceReportInput {
  generatedAt?: string;
  executionPlanPath: string;
  executionPlan: AiIdeApprovedRepairExecutionPlan;
  executionEvidence: AiIdeRepairExecutionEvidenceInput;
}

export interface WriteAiIdeRepairExecutionEvidenceReportInput {
  generatedAt?: string;
  executionPlanPath: string;
  evidencePath: string;
  outputDir: string;
}

export interface AiIdeRepairExecutionEvidenceSummary {
  totalApprovedExecutionItems: number;
  verifiedItems: number;
  blockedItems: number;
  failedItems: number;
  notStartedItems: number;
  boundaryViolations: number;
  blockedActions: number;
}

export interface AiIdeRepairExecutionEvidenceItemReport {
  sourceActionId: string;
  targetIds: string[];
  executionStatus: AiIdeRepairExecutionEvidenceStatus;
  readOrderCompliance: AiIdeRepairExecutionReadOrderCompliance;
  readOrderPaths: string[];
  readOrderPathsRead: string[];
  missingReadOrderPaths: string[];
  verificationChecklist: string[];
  verificationResults: AiIdeRepairExecutionVerificationResult[];
  maintainerReviewStatus: AiIdeRepairExecutionMaintainerReviewStatus;
  nonAuthorizationBoundaryMaintained: boolean;
  notes: string;
}

export interface AiIdeRepairExecutionBoundaryReport {
  boundaryViolations: number;
  unauthorizedActions: string[];
  targetRepoMutationProhibited: true;
  notes: string;
}

export interface AiIdeRepairExecutionEvidenceReport {
  schemaVersion: 'repoassure.ai-ide-repair-execution-evidence-report.v1';
  generatedAt: string;
  sourceExecutionPlan: string;
  evidenceSummary: AiIdeRepairExecutionEvidenceSummary;
  itemReports: AiIdeRepairExecutionEvidenceItemReport[];
  boundaryReport: AiIdeRepairExecutionBoundaryReport;
  executionEvidenceChecklist: string[];
  rollbackAndReviewChecklist: string[];
  blockedActions: string[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface WriteAiIdeRepairExecutionEvidenceReportResult {
  jsonPath: string;
  markdownPath: string;
  evidenceReport: AiIdeRepairExecutionEvidenceReport;
}

const nonAuthorizationBoundary =
  'This repair execution evidence report records local evidence only; it does not create target repo branches, commits, pull requests, issues, advisories, file mutations, npm publications, GitHub releases, public launches, customer contacts, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.';

export function buildAiIdeRepairExecutionEvidenceReport(
  input: AiIdeRepairExecutionEvidenceReportInput
): AiIdeRepairExecutionEvidenceReport {
  const evidenceByActionId = new Map(
    (input.executionEvidence.executionItems ?? []).map((item) => [item.sourceActionId, item])
  );
  const boundaryEvidence = input.executionEvidence.boundaryEvidence ?? {
    unauthorizedActions: [],
    notes: 'No boundary evidence was provided.'
  };
  const unauthorizedActions = (boundaryEvidence.unauthorizedActions ?? []).map(sanitize);
  const itemReports = input.executionPlan.approvedExecutionItems.map((item) => buildItemReport(
    item,
    evidenceByActionId.get(item.sourceActionId),
    unauthorizedActions
  ));
  const blockedActions = input.executionPlan.blockedActions.map(sanitize);

  return {
    schemaVersion: 'repoassure.ai-ide-repair-execution-evidence-report.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    sourceExecutionPlan: sanitizePath(input.executionPlanPath),
    evidenceSummary: {
      totalApprovedExecutionItems: itemReports.length,
      verifiedItems: countStatus(itemReports, 'verified'),
      blockedItems: countStatus(itemReports, 'blocked'),
      failedItems: countStatus(itemReports, 'failed'),
      notStartedItems: countStatus(itemReports, 'not_started'),
      boundaryViolations: unauthorizedActions.length,
      blockedActions: blockedActions.length
    },
    itemReports,
    boundaryReport: {
      boundaryViolations: unauthorizedActions.length,
      unauthorizedActions,
      targetRepoMutationProhibited: true,
      notes: sanitize(boundaryEvidence.notes)
    },
    executionEvidenceChecklist: [
      'Confirm every itemReports[].readOrderCompliance is complete before maintainer merge review.',
      'Confirm every approved execution item has verificationResults evidence before marking it verified.',
      'Treat blocked, failed, or not_started items as unresolved until a new evidence report is generated.',
      'Regenerate the execution evidence report if the approved repair execution plan changes.'
    ],
    rollbackAndReviewChecklist: [
      'Do not merge target repo changes until maintainer review accepts the verification evidence.',
      'Keep target repo repair changes in a separate target repo worktree and review process.',
      'Record rollback evidence before requesting maintainer acceptance for any target repo patch.'
    ],
    blockedActions,
    maintainerReviewBoundary: sanitize(input.executionPlan.maintainerReviewBoundary),
    redactionBoundary: sanitize(input.executionPlan.redactionBoundary),
    nonAuthorizationBoundary
  };
}

export async function writeAiIdeRepairExecutionEvidenceReport(
  input: WriteAiIdeRepairExecutionEvidenceReportInput
): Promise<WriteAiIdeRepairExecutionEvidenceReportResult> {
  const executionPlan = JSON.parse(await readFile(input.executionPlanPath, 'utf8')) as AiIdeApprovedRepairExecutionPlan;
  const executionEvidence = JSON.parse(await readFile(input.evidencePath, 'utf8')) as AiIdeRepairExecutionEvidenceInput;
  const evidenceReport = buildAiIdeRepairExecutionEvidenceReport({
    executionPlanPath: input.executionPlanPath,
    executionPlan,
    executionEvidence,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {})
  });
  const jsonPath = join(input.outputDir, 'ai-ide-repair-execution-evidence-report.json');
  const markdownPath = join(input.outputDir, 'ai-ide-repair-execution-evidence-report.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(evidenceReport, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeRepairExecutionEvidenceReportMarkdown(evidenceReport));

  return { jsonPath, markdownPath, evidenceReport };
}

export function buildAiIdeRepairExecutionEvidenceReportMarkdown(
  evidenceReport: AiIdeRepairExecutionEvidenceReport
): string {
  return [
    '# RepoAssure AI IDE Repair Execution Evidence Report',
    '',
    `Generated at: ${evidenceReport.generatedAt}`,
    `Source execution plan: ${evidenceReport.sourceExecutionPlan}`,
    '',
    '## Evidence Summary',
    '',
    `- totalApprovedExecutionItems: ${evidenceReport.evidenceSummary.totalApprovedExecutionItems}`,
    `- verifiedItems: ${evidenceReport.evidenceSummary.verifiedItems}`,
    `- blockedItems: ${evidenceReport.evidenceSummary.blockedItems}`,
    `- failedItems: ${evidenceReport.evidenceSummary.failedItems}`,
    `- notStartedItems: ${evidenceReport.evidenceSummary.notStartedItems}`,
    `- boundaryViolations: ${evidenceReport.evidenceSummary.boundaryViolations}`,
    `- blockedActions: ${evidenceReport.evidenceSummary.blockedActions}`,
    '',
    '## Item Reports',
    '',
    '| Action | Targets | Status | Read order | Maintainer review | Boundary maintained | Notes |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...evidenceReport.itemReports.map((item) => `| ${[
      item.sourceActionId,
      item.targetIds.join(', '),
      item.executionStatus,
      item.readOrderCompliance,
      item.maintainerReviewStatus,
      item.nonAuthorizationBoundaryMaintained ? 'yes' : 'no',
      item.notes
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(evidenceReport.itemReports.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Verification Results',
    '',
    ...evidenceReport.itemReports.flatMap((item) => formatVerificationResults(item)),
    '',
    '## Boundary Report',
    '',
    `- boundaryViolations: ${evidenceReport.boundaryReport.boundaryViolations}`,
    `- targetRepoMutationProhibited: ${evidenceReport.boundaryReport.targetRepoMutationProhibited ? 'yes' : 'no'}`,
    `- notes: ${evidenceReport.boundaryReport.notes}`,
    ...evidenceReport.boundaryReport.unauthorizedActions.map((action) => `- unauthorizedAction: ${action}`),
    '- No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this report.',
    `- ${evidenceReport.nonAuthorizationBoundary}`,
    '',
    '## Execution Evidence Checklist',
    '',
    ...evidenceReport.executionEvidenceChecklist.map((item) => `- ${item}`),
    '',
    '## Rollback And Review Checklist',
    '',
    ...evidenceReport.rollbackAndReviewChecklist.map((item) => `- ${item}`),
    '',
    '## Blocked Actions',
    '',
    ...evidenceReport.blockedActions.map((action) => `- ${action}`),
    '',
    '## Boundaries',
    '',
    `- ${evidenceReport.maintainerReviewBoundary}`,
    `- ${evidenceReport.redactionBoundary}`,
    `- ${evidenceReport.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function buildItemReport(
  approvedItem: AiIdeApprovedRepairExecutionItem,
  evidence: AiIdeRepairExecutionEvidenceItemInput | undefined,
  unauthorizedActions: string[]
): AiIdeRepairExecutionEvidenceItemReport {
  const readOrderPaths = approvedItem.readOrderPaths.map(sanitizePath);
  const readOrderPathsRead = (evidence?.readOrderPathsRead ?? []).map(sanitizePath);
  const missingReadOrderPaths = readOrderPaths.filter((path) => !readOrderPathsRead.includes(path));

  return {
    sourceActionId: sanitize(approvedItem.sourceActionId),
    targetIds: approvedItem.targetIds.map(sanitize),
    executionStatus: sanitizeExecutionStatus(evidence?.executionStatus),
    readOrderCompliance: missingReadOrderPaths.length === 0 ? 'complete' : 'incomplete',
    readOrderPaths,
    readOrderPathsRead,
    missingReadOrderPaths,
    verificationChecklist: approvedItem.verificationChecklist.map(sanitize),
    verificationResults: (evidence?.verificationResults ?? []).map((result) => ({
      label: sanitize(result.label),
      status: sanitizeVerificationStatus(result.status),
      evidence: sanitize(result.evidence)
    })),
    maintainerReviewStatus: sanitizeMaintainerReviewStatus(evidence?.maintainerReviewStatus),
    nonAuthorizationBoundaryMaintained: unauthorizedActions.length === 0,
    notes: sanitize(evidence?.notes ?? 'No execution evidence was provided for this approved item.')
  };
}

function formatVerificationResults(item: AiIdeRepairExecutionEvidenceItemReport): string[] {
  if (item.verificationResults.length === 0) {
    return [`- ${item.sourceActionId}: no verification results recorded.`];
  }

  return item.verificationResults.map((result) => {
    return `- ${item.sourceActionId}: ${result.label} (${result.status}) - ${result.evidence}`;
  });
}

function countStatus(
  items: AiIdeRepairExecutionEvidenceItemReport[],
  status: AiIdeRepairExecutionEvidenceStatus
): number {
  return items.filter((item) => item.executionStatus === status).length;
}

function sanitizeExecutionStatus(value: string | undefined): AiIdeRepairExecutionEvidenceStatus {
  if (value === 'verified' || value === 'blocked' || value === 'failed' || value === 'not_started') {
    return value;
  }

  return 'not_started';
}

function sanitizeVerificationStatus(value: string): AiIdeRepairExecutionVerificationStatus {
  if (value === 'passed' || value === 'failed' || value === 'blocked' || value === 'not_run') {
    return value;
  }

  return 'not_run';
}

function sanitizeMaintainerReviewStatus(value: string | undefined): AiIdeRepairExecutionMaintainerReviewStatus {
  if (value === 'pending_review' || value === 'accepted' || value === 'changes_requested' || value === 'not_ready') {
    return value;
  }

  return 'not_ready';
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
