import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import {
  type BlockedGoalRecoveryActionType,
  type BlockedGoalRecoveryConsumptionAction,
  type BlockedGoalRecoveryConsumptionReport
} from './blocked-goal-recovery-consumption-report.js';
import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from './blocked-goal-recovery-package.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type BlockedGoalRecoveryDecision = 'approve' | 'reject' | 'defer' | 'accept_risk';
export type BlockedGoalRecoveryRecordedDecision = BlockedGoalRecoveryDecision | 'unreviewed';
export type BlockedGoalRecoveryDecisionStatus =
  | 'approved_for_separate_resume_attempt'
  | 'rejected'
  | 'deferred'
  | 'accepted_with_risk'
  | 'mixed_decisions'
  | 'blocked_or_incomplete';
export type BlockedGoalRecoveryResumeAttemptReadiness =
  | 'ready_for_separate_resume_attempt'
  | 'blocked_by_missing_decision'
  | 'blocked_by_rejection'
  | 'blocked_by_deferral'
  | 'blocked_by_mixed_decisions'
  | 'blocked_by_boundary_violation';

export interface BlockedGoalRecoveryDecisionInputItem {
  actionKey: string;
  decision: BlockedGoalRecoveryDecision;
  evidence: string;
  reviewerRole: string;
  rationale?: string;
}

export interface BuildBlockedGoalRecoveryDecisionReceiptInput {
  generatedAt?: string;
  consumptionReportPath: string;
  sourceConsumptionReportText: string;
  consumptionReport: BlockedGoalRecoveryConsumptionReport;
  decisions: BlockedGoalRecoveryDecisionInputItem[];
}

export interface WriteBlockedGoalRecoveryDecisionReceiptInput {
  generatedAt?: string;
  consumptionReportPath: string;
  decisionsPath: string;
  outputDir: string;
}

export interface WriteBlockedGoalRecoveryDecisionReceiptFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface BlockedGoalRecoveryDecisionItem extends BlockedGoalRecoveryConsumptionAction {
  decision: BlockedGoalRecoveryRecordedDecision;
  evidence: string;
  reviewerRole: string;
  rationale: string;
}

export interface BlockedGoalRecoveryDecisionReceipt {
  schemaVersion: 'repoassure.blocked-goal-recovery-decision-receipt.v1';
  generatedAt: string;
  decisionStatus: BlockedGoalRecoveryDecisionStatus;
  resumeAttemptReadiness: BlockedGoalRecoveryResumeAttemptReadiness;
  sourceConsumptionReport: {
    schemaVersion: string;
    fileName: string;
    path: string;
    sha256: string;
    resumeReadiness: string;
  };
  decisionSummary: {
    totalActions: number;
    reviewed: number;
    approved: number;
    rejected: number;
    deferred: number;
    acceptedRisk: number;
    unreviewed: number;
  };
  decisionItems: BlockedGoalRecoveryDecisionItem[];
  approvedActions: BlockedGoalRecoveryDecisionItem[];
  rejectedActions: BlockedGoalRecoveryDecisionItem[];
  deferredActions: BlockedGoalRecoveryDecisionItem[];
  riskAcceptedActions: BlockedGoalRecoveryDecisionItem[];
  reviewedResumeCommands: Array<{ command: string; purpose: string }>;
  boundaryCompliance: {
    resumeCommandsExecuted: false;
    sourceBoundaryPreserved: boolean;
  };
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteBlockedGoalRecoveryDecisionReceiptResult {
  jsonPath: string;
  markdownPath: string;
  receipt: BlockedGoalRecoveryDecisionReceipt;
}

const CONSUMPTION_REPORT_JSON_NAME = 'blocked-goal-recovery-consumption-report.json';
const DECISIONS_JSON_NAME = 'blocked-goal-recovery-decisions.json';
const RECEIPT_JSON_NAME = 'blocked-goal-recovery-decision-receipt.json';
const RECEIPT_MARKDOWN_NAME = 'blocked-goal-recovery-decision-receipt.md';

const MAINTAINER_REVIEW_BOUNDARY =
  'This receipt records maintainer decisions over recovery actions; it does not execute a resume command or authorize any action outside a separate reviewed resume attempt.';
const NON_AUTHORIZATION_BOUNDARY =
  'This receipt does not execute recovery commands, modify target repo files, create target repo branch, commit, pull request, issue, or advisory, publish npm, create GitHub release, run public launch, contact customers, change pricing/spend, change repository visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.';

export function buildBlockedGoalRecoveryDecisionReceipt(
  input: BuildBlockedGoalRecoveryDecisionReceiptInput
): BlockedGoalRecoveryDecisionReceipt {
  assertConsumptionReport(input.consumptionReport);
  assertDecisions(input.decisions, input.consumptionReport.actionQueue);

  const decisionsByActionKey = new Map(input.decisions.map((item) => [item.actionKey, item]));
  const decisionItems = input.consumptionReport.actionQueue.map((action) => {
    const decision = decisionsByActionKey.get(action.actionKey);
    return {
      ...sanitizeAction(action),
      decision: decision?.decision ?? 'unreviewed',
      evidence: sanitize(decision?.evidence ?? ''),
      reviewerRole: sanitize(decision?.reviewerRole ?? ''),
      rationale: sanitize(decision?.rationale ?? '')
    } satisfies BlockedGoalRecoveryDecisionItem;
  });
  const sourceBoundaryPreserved = hasPreservedBoundary(input.consumptionReport);
  const decisionStatus = resolveDecisionStatus(decisionItems, sourceBoundaryPreserved);
  const blockedActions = [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize);

  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-decision-receipt.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    decisionStatus,
    resumeAttemptReadiness: resolveResumeAttemptReadiness(decisionStatus, sourceBoundaryPreserved),
    sourceConsumptionReport: {
      schemaVersion: input.consumptionReport.schemaVersion,
      fileName: sanitize(basename(input.consumptionReportPath)),
      path: sanitizePath(input.consumptionReportPath),
      sha256: createHash('sha256').update(input.sourceConsumptionReportText).digest('hex'),
      resumeReadiness: input.consumptionReport.resumeReadiness
    },
    decisionSummary: summarizeDecisions(decisionItems),
    decisionItems,
    approvedActions: decisionItems.filter((item) => item.decision === 'approve'),
    rejectedActions: decisionItems.filter((item) => item.decision === 'reject'),
    deferredActions: decisionItems.filter((item) => item.decision === 'defer'),
    riskAcceptedActions: decisionItems.filter((item) => item.decision === 'accept_risk'),
    reviewedResumeCommands: input.consumptionReport.resumeCommands.map((item) => ({
      command: sanitize(item.command),
      purpose: sanitize(item.purpose)
    })),
    boundaryCompliance: { resumeCommandsExecuted: false, sourceBoundaryPreserved },
    maintainerReviewBoundary: MAINTAINER_REVIEW_BOUNDARY,
    redactionBoundary: sanitize(input.consumptionReport.redactionBoundary),
    nonAuthorizationBoundary: NON_AUTHORIZATION_BOUNDARY,
    blockedActions
  };
}

export async function writeBlockedGoalRecoveryDecisionReceipt(
  input: WriteBlockedGoalRecoveryDecisionReceiptInput
): Promise<WriteBlockedGoalRecoveryDecisionReceiptResult> {
  const sourceConsumptionReportText = await readFile(input.consumptionReportPath, 'utf8');
  const decisionsText = await readFile(input.decisionsPath, 'utf8');
  let consumptionReport: unknown;
  let decisionInput: unknown;
  try {
    consumptionReport = JSON.parse(sourceConsumptionReportText);
    decisionInput = JSON.parse(decisionsText);
  } catch {
    throw new Error('Invalid blocked goal recovery decision input');
  }
  if (!isRecord(decisionInput) || !Array.isArray(decisionInput.decisions)) {
    throw new Error('Invalid blocked goal recovery decisions');
  }
  const receipt = buildBlockedGoalRecoveryDecisionReceipt({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    consumptionReportPath: input.consumptionReportPath,
    sourceConsumptionReportText,
    consumptionReport: consumptionReport as BlockedGoalRecoveryConsumptionReport,
    decisions: decisionInput.decisions as BlockedGoalRecoveryDecisionInputItem[]
  });
  const jsonPath = join(input.outputDir, RECEIPT_JSON_NAME);
  const markdownPath = join(input.outputDir, RECEIPT_MARKDOWN_NAME);
  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(receipt, null, 2)}\n`);
  await writeFile(markdownPath, buildBlockedGoalRecoveryDecisionReceiptMarkdown(receipt));
  return { jsonPath, markdownPath, receipt };
}

export async function writeBlockedGoalRecoveryDecisionReceiptFromDirectory(
  input: WriteBlockedGoalRecoveryDecisionReceiptFromDirectoryInput
): Promise<WriteBlockedGoalRecoveryDecisionReceiptResult> {
  return writeBlockedGoalRecoveryDecisionReceipt({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    consumptionReportPath: join(input.inputDir, CONSUMPTION_REPORT_JSON_NAME),
    decisionsPath: join(input.inputDir, DECISIONS_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildBlockedGoalRecoveryDecisionReceiptMarkdown(
  receipt: BlockedGoalRecoveryDecisionReceipt
): string {
  return [
    '# RepoAssure Blocked Goal Recovery Decision Receipt',
    '',
    `Generated at: ${receipt.generatedAt}`,
    `Decision status: ${receipt.decisionStatus}`,
    `Resume attempt readiness: ${receipt.resumeAttemptReadiness}`,
    '',
    '## Source Consumption Report',
    '',
    `- fileName: ${receipt.sourceConsumptionReport.fileName}`,
    `- schemaVersion: ${receipt.sourceConsumptionReport.schemaVersion}`,
    `- sha256: ${receipt.sourceConsumptionReport.sha256}`,
    '',
    '## Decision Summary',
    '',
    ...Object.entries(receipt.decisionSummary).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Recovery Decisions',
    '',
    '| Action key | Blocker | Action type | Decision | Evidence | Reviewer role | Rationale |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...receipt.decisionItems.map((item) => `| ${[
      item.actionKey, item.blockerId, item.actionType, item.decision,
      item.evidence || 'n/a', item.reviewerRole || 'n/a', item.rationale || 'n/a'
    ].map(escapeMarkdownTableCell).join(' | ')} |`),
    ...(receipt.decisionItems.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Reviewed Resume Commands',
    '',
    '| Command | Purpose | Executed |',
    '| --- | --- | --- |',
    ...receipt.reviewedResumeCommands.map((item) => `| ${escapeMarkdownTableCell(item.command)} | ${escapeMarkdownTableCell(item.purpose)} | false |`),
    ...(receipt.reviewedResumeCommands.length === 0 ? ['| n/a | n/a | false |'] : []),
    '',
    '## Maintainer Review Boundary',
    '',
    `- ${receipt.maintainerReviewBoundary}`,
    '',
    '## Non-Authorization Boundary',
    '',
    `- ${receipt.nonAuthorizationBoundary}`,
    '',
    '## Blocked Actions',
    '',
    ...receipt.blockedActions.map((item) => `- ${item}`),
    '',
    '## Redaction Boundary',
    '',
    `- ${receipt.redactionBoundary}`,
    ''
  ].join('\n');
}

function assertConsumptionReport(value: unknown): asserts value is BlockedGoalRecoveryConsumptionReport {
  if (!isRecord(value)
    || value.schemaVersion !== 'repoassure.blocked-goal-recovery-consumption-report.v1'
    || !Array.isArray(value.actionQueue)
    || !value.actionQueue.every(isConsumptionAction)
    || !Array.isArray(value.resumeCommands)
    || !value.resumeCommands.every(isResumeCommand)
    || !isRecord(value.boundaryCompliance)
    || value.boundaryCompliance.recoveryCommandsExecuted !== false
    || typeof value.boundaryCompliance.blockedActionsPreserved !== 'boolean'
    || !Array.isArray(value.blockedActions)
    || !value.blockedActions.every((item) => typeof item === 'string')
    || typeof value.resumeReadiness !== 'string'
    || typeof value.redactionBoundary !== 'string') {
    throw new Error('Invalid blocked goal recovery consumption report');
  }
}

function assertDecisions(decisions: unknown, actions: BlockedGoalRecoveryConsumptionAction[]): asserts decisions is BlockedGoalRecoveryDecisionInputItem[] {
  if (!Array.isArray(decisions) || !decisions.every(isDecision)) {
    throw new Error('Invalid blocked goal recovery decisions');
  }
  const actionKeys = new Set(actions.map((item) => item.actionKey));
  const decisionKeys = decisions.map((item) => item.actionKey);
  if (new Set(decisionKeys).size !== decisionKeys.length
    || decisionKeys.some((key) => !actionKeys.has(key))) {
    throw new Error('Invalid blocked goal recovery decisions');
  }
}

function isDecision(value: unknown): value is BlockedGoalRecoveryDecisionInputItem {
  if (!isRecord(value)
    || typeof value.actionKey !== 'string'
    || !isDecisionValue(value.decision)
    || typeof value.evidence !== 'string'
    || value.evidence.trim().length === 0
    || typeof value.reviewerRole !== 'string'
    || value.reviewerRole.trim().length === 0
    || (value.rationale !== undefined && typeof value.rationale !== 'string')) {
    return false;
  }
  return value.decision === 'approve'
    || (typeof value.rationale === 'string' && value.rationale.trim().length > 0);
}

function isDecisionValue(value: unknown): value is BlockedGoalRecoveryDecision {
  return value === 'approve' || value === 'reject' || value === 'defer' || value === 'accept_risk';
}

function isConsumptionAction(value: unknown): value is BlockedGoalRecoveryConsumptionAction {
  return isRecord(value)
    && typeof value.actionKey === 'string'
    && typeof value.blockerId === 'string'
    && isActionType(value.actionType)
    && typeof value.instruction === 'string'
    && typeof value.context === 'string';
}

function isActionType(value: unknown): value is BlockedGoalRecoveryActionType {
  return value === 'automatic_retry_candidate'
    || value === 'maintainer_decision_required'
    || value === 'external_prerequisite_required';
}

function isResumeCommand(value: unknown): value is { command: string; purpose: string } {
  return isRecord(value) && typeof value.command === 'string' && typeof value.purpose === 'string';
}

function hasPreservedBoundary(report: BlockedGoalRecoveryConsumptionReport): boolean {
  return report.boundaryCompliance.recoveryCommandsExecuted === false
    && report.boundaryCompliance.blockedActionsPreserved
    && BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.every((item) => report.blockedActions.includes(item));
}

function resolveDecisionStatus(
  items: BlockedGoalRecoveryDecisionItem[],
  boundaryPreserved: boolean
): BlockedGoalRecoveryDecisionStatus {
  if (!boundaryPreserved || items.length === 0 || items.some((item) => item.decision === 'unreviewed')) {
    return 'blocked_or_incomplete';
  }
  const decisions = new Set(items.map((item) => item.decision));
  if (decisions.size === 1 && decisions.has('approve')) return 'approved_for_separate_resume_attempt';
  if (decisions.size === 1 && decisions.has('reject')) return 'rejected';
  if (decisions.size === 1 && decisions.has('defer')) return 'deferred';
  if ([...decisions].every((item) => item === 'approve' || item === 'accept_risk')) return 'accepted_with_risk';
  return 'mixed_decisions';
}

function resolveResumeAttemptReadiness(
  status: BlockedGoalRecoveryDecisionStatus,
  boundaryPreserved: boolean
): BlockedGoalRecoveryResumeAttemptReadiness {
  if (!boundaryPreserved) return 'blocked_by_boundary_violation';
  if (status === 'approved_for_separate_resume_attempt' || status === 'accepted_with_risk') return 'ready_for_separate_resume_attempt';
  if (status === 'rejected') return 'blocked_by_rejection';
  if (status === 'deferred') return 'blocked_by_deferral';
  if (status === 'mixed_decisions') return 'blocked_by_mixed_decisions';
  return 'blocked_by_missing_decision';
}

function summarizeDecisions(items: BlockedGoalRecoveryDecisionItem[]) {
  const count = (decision: BlockedGoalRecoveryRecordedDecision) => items.filter((item) => item.decision === decision).length;
  const unreviewed = count('unreviewed');
  return {
    totalActions: items.length,
    reviewed: items.length - unreviewed,
    approved: count('approve'),
    rejected: count('reject'),
    deferred: count('defer'),
    acceptedRisk: count('accept_risk'),
    unreviewed
  };
}

function sanitizeAction(action: BlockedGoalRecoveryConsumptionAction): BlockedGoalRecoveryConsumptionAction {
  return {
    actionKey: sanitize(action.actionKey),
    blockerId: sanitize(action.blockerId),
    actionType: action.actionType,
    instruction: sanitize(action.instruction),
    context: sanitize(action.context)
  };
}

function sanitize(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

function sanitizePath(value: string): string {
  return value.replaceAll('\\', '/').split('/').map(sanitize).join('/');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
