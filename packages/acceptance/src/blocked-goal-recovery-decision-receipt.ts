import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import {
  type BlockedGoalRecoveryActionType,
  type BlockedGoalRecoveryConsumptionAction,
  type BlockedGoalRecoveryConsumptionReport
} from './blocked-goal-recovery-consumption-report.js';
import {
  BLOCKED_GOAL_RECOVERY_MAINTAINER_REVIEW_BOUNDARY,
  BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS,
  BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BOUNDARY
} from './blocked-goal-recovery-package.js';
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
  | 'blocked_by_missing_resume_command'
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
  prerequisiteStatus?: 'completed' | 'unmet';
}

export interface BlockedGoalRecoveryResumeCommandDecisionInputItem {
  commandId: string;
  decision: BlockedGoalRecoveryDecision;
  evidence: string;
  reviewerRole: string;
  rationale?: string;
}

export interface BuildBlockedGoalRecoveryDecisionReceiptInput {
  generatedAt?: string;
  consumptionReportPath: string;
  sourceConsumptionReportText: string;
  reviewedSourceSha256: string;
  consumptionReport: BlockedGoalRecoveryConsumptionReport;
  decisions: BlockedGoalRecoveryDecisionInputItem[];
  resumeCommandDecisions: BlockedGoalRecoveryResumeCommandDecisionInputItem[];
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
  prerequisiteStatus: 'completed' | 'unmet' | 'not_applicable';
}

export interface BlockedGoalRecoveryResumeCommandDecisionItem {
  commandId: string;
  command: string;
  purpose: string;
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
  resumeCommandDecisionItems: BlockedGoalRecoveryResumeCommandDecisionItem[];
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
  let parsedSource: unknown;
  try {
    parsedSource = JSON.parse(input.sourceConsumptionReportText);
  } catch {
    throw new Error('Invalid blocked goal recovery consumption report');
  }
  assertConsumptionReport(parsedSource);
  assertConsumptionReport(input.consumptionReport);
  if (!isDeepStrictEqual(parsedSource, input.consumptionReport)) {
    throw new Error('Invalid blocked goal recovery consumption report');
  }
  const sourceSha256 = createHash('sha256').update(input.sourceConsumptionReportText).digest('hex');
  if (input.reviewedSourceSha256 !== sourceSha256) {
    throw new Error('Invalid blocked goal recovery decisions');
  }
  assertDecisions(input.decisions, input.consumptionReport.actionQueue);
  assertResumeCommandDecisions(input.resumeCommandDecisions, input.consumptionReport.resumeCommands);

  const decisionsByActionKey = new Map(input.decisions.map((item) => [item.actionKey, item]));
  const decisionItems = input.consumptionReport.actionQueue.map((action) => {
    const decision = decisionsByActionKey.get(action.actionKey);
    return {
      ...sanitizeAction(action),
      decision: decision?.decision ?? 'unreviewed',
      evidence: sanitize(decision?.evidence ?? ''),
      reviewerRole: sanitize(decision?.reviewerRole ?? ''),
      rationale: sanitize(decision?.rationale ?? '')
      ,prerequisiteStatus: decision?.prerequisiteStatus
        ?? (action.prerequisiteCompletionRequired ? 'unmet' : 'not_applicable')
    } satisfies BlockedGoalRecoveryDecisionItem;
  });
  const commandDecisionsById = new Map(input.resumeCommandDecisions.map((item) => [item.commandId, item]));
  const resumeCommandDecisionItems = input.consumptionReport.resumeCommands.map((command) => {
    const decision = commandDecisionsById.get(command.commandId);
    return {
      commandId: sanitize(command.commandId),
      command: sanitize(command.command),
      purpose: sanitize(command.purpose),
      decision: decision?.decision ?? 'unreviewed',
      evidence: sanitize(decision?.evidence ?? ''),
      reviewerRole: sanitize(decision?.reviewerRole ?? ''),
      rationale: sanitize(decision?.rationale ?? '')
    } satisfies BlockedGoalRecoveryResumeCommandDecisionItem;
  });
  const sourceBoundaryPreserved = hasPreservedBoundary(input.consumptionReport);
  const hasResumeCommand = resumeCommandDecisionItems.length > 0;
  const decisionStatus = resolveDecisionStatus(
    [...decisionItems, ...resumeCommandDecisionItems],
    sourceBoundaryPreserved,
    hasResumeCommand
  );
  const blockedActions = [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize);

  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-decision-receipt.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    decisionStatus,
    resumeAttemptReadiness: resolveResumeAttemptReadiness(
      decisionStatus,
      sourceBoundaryPreserved,
      hasResumeCommand
    ),
    sourceConsumptionReport: {
      schemaVersion: input.consumptionReport.schemaVersion,
      fileName: sanitize(basename(input.consumptionReportPath)),
      path: sanitizePath(input.consumptionReportPath),
      sha256: sourceSha256,
      resumeReadiness: input.consumptionReport.resumeReadiness
    },
    decisionSummary: summarizeDecisions(decisionItems),
    decisionItems,
    approvedActions: decisionItems.filter((item) => item.decision === 'approve'),
    rejectedActions: decisionItems.filter((item) => item.decision === 'reject'),
    deferredActions: decisionItems.filter((item) => item.decision === 'defer'),
    riskAcceptedActions: decisionItems.filter((item) => item.decision === 'accept_risk'),
    resumeCommandDecisionItems,
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
  if (!isRecord(decisionInput)
    || !Array.isArray(decisionInput.decisions)
    || !Array.isArray(decisionInput.resumeCommandDecisions)
    || typeof decisionInput.sourceConsumptionReportSha256 !== 'string') {
    throw new Error('Invalid blocked goal recovery decisions');
  }
  const receipt = buildBlockedGoalRecoveryDecisionReceipt({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    consumptionReportPath: input.consumptionReportPath,
    sourceConsumptionReportText,
    reviewedSourceSha256: decisionInput.sourceConsumptionReportSha256,
    consumptionReport: consumptionReport as BlockedGoalRecoveryConsumptionReport,
    decisions: decisionInput.decisions as BlockedGoalRecoveryDecisionInputItem[],
    resumeCommandDecisions: decisionInput.resumeCommandDecisions as BlockedGoalRecoveryResumeCommandDecisionInputItem[]
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
    '## Resume Command Decisions',
    '',
    '| Command ID | Command | Purpose | Decision | Evidence | Reviewer role | Executed |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...receipt.resumeCommandDecisionItems.map((item) => `| ${[
      item.commandId,
      item.command,
      item.purpose,
      item.decision,
      item.evidence || 'n/a',
      item.reviewerRole || 'n/a',
      'false'
    ].map(escapeMarkdownTableCell).join(' | ')} |`),
    ...(receipt.resumeCommandDecisionItems.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a | false |'] : []),
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
    || typeof value.generatedAt !== 'string'
    || !isRecord(value.sourceRecoveryPackage)
    || typeof value.sourceRecoveryPackage.path !== 'string'
    || typeof value.sourceRecoveryPackage.sha256 !== 'string'
    || !/^[a-f0-9]{64}$/u.test(value.sourceRecoveryPackage.sha256)
    || !isResumeReadiness(value.resumeReadiness)
    || !Array.isArray(value.evidenceReadOrder)
    || !value.evidenceReadOrder.every(isEvidenceReadOrderItem)
    || !Array.isArray(value.actionQueue)
    || !value.actionQueue.every(isConsumptionAction)
    || new Set(value.actionQueue.map((item) => (item as BlockedGoalRecoveryConsumptionAction).actionKey)).size !== value.actionQueue.length
    || !Array.isArray(value.resumeCommands)
    || !value.resumeCommands.every(isResumeCommand)
    || new Set(value.resumeCommands.map((item) => (item as { commandId: string }).commandId)).size !== value.resumeCommands.length
    || !Array.isArray(value.resumeChecklist)
    || !value.resumeChecklist.every((item) => typeof item === 'string')
    || !isRecord(value.boundaryCompliance)
    || value.boundaryCompliance.recoveryCommandsExecuted !== false
    || typeof value.boundaryCompliance.blockedActionsPreserved !== 'boolean'
    || !Array.isArray(value.blockedActions)
    || !value.blockedActions.every((item) => typeof item === 'string')
    || typeof value.redactionBoundary !== 'string'
    || value.maintainerReviewBoundary !== BLOCKED_GOAL_RECOVERY_MAINTAINER_REVIEW_BOUNDARY
    || value.nonAuthorizationBoundary !== BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BOUNDARY) {
    throw new Error('Invalid blocked goal recovery consumption report');
  }
}

function assertDecisions(decisions: unknown, actions: BlockedGoalRecoveryConsumptionAction[]): asserts decisions is BlockedGoalRecoveryDecisionInputItem[] {
  if (!Array.isArray(decisions) || !decisions.every(isDecision)) {
    throw new Error('Invalid blocked goal recovery decisions');
  }
  const actionsByKey = new Map(actions.map((item) => [item.actionKey, item]));
  const decisionKeys = decisions.map((item) => item.actionKey);
  if (new Set(decisionKeys).size !== decisionKeys.length
    || decisionKeys.some((key) => !actionsByKey.has(key))
    || decisions.some((decision) => {
      const action = actionsByKey.get(decision.actionKey);
      return !action
        || !action.allowedDecisions.includes(decision.decision)
        || (action.prerequisiteCompletionRequired
          && decision.decision === 'approve'
          && decision.prerequisiteStatus !== 'completed');
    })) {
    throw new Error('Invalid blocked goal recovery decisions');
  }
}

function assertResumeCommandDecisions(
  decisions: unknown,
  commands: Array<{ commandId: string; command: string; purpose: string }>
): asserts decisions is BlockedGoalRecoveryResumeCommandDecisionInputItem[] {
  if (!Array.isArray(decisions) || !decisions.every(isResumeCommandDecision)) {
    throw new Error('Invalid blocked goal recovery resume command decisions');
  }
  const commandIds = new Set(commands.map((item) => item.commandId));
  const decisionIds = decisions.map((item) => item.commandId);
  if (new Set(decisionIds).size !== decisionIds.length || decisionIds.some((id) => !commandIds.has(id))) {
    throw new Error('Invalid blocked goal recovery resume command decisions');
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
    || (value.rationale !== undefined && typeof value.rationale !== 'string')
    || (value.prerequisiteStatus !== undefined
      && value.prerequisiteStatus !== 'completed'
      && value.prerequisiteStatus !== 'unmet')) {
    return false;
  }
  return value.decision === 'approve'
    || (typeof value.rationale === 'string' && value.rationale.trim().length > 0);
}

function isResumeCommandDecision(value: unknown): value is BlockedGoalRecoveryResumeCommandDecisionInputItem {
  if (!isRecord(value)
    || typeof value.commandId !== 'string'
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
  if (!isRecord(value)
    || typeof value.actionKey !== 'string'
    || typeof value.blockerId !== 'string'
    || !isActionType(value.actionType)
    || !isBoundActionKey(value.actionKey, value.blockerId, value.actionType)
    || typeof value.instruction !== 'string'
    || typeof value.context !== 'string'
    || !Array.isArray(value.allowedDecisions)
    || value.allowedDecisions.length === 0
    || !value.allowedDecisions.every(isDecisionValue)
    || new Set(value.allowedDecisions).size !== value.allowedDecisions.length
    || typeof value.prerequisiteCompletionRequired !== 'boolean'
    || !(value.actionType === 'external_prerequisite_required'
      ? value.prerequisiteCompletionRequired
      : !value.prerequisiteCompletionRequired)) {
    return false;
  }
  if (value.actionType === 'automatic_retry_candidate') {
    return sameDecisionSet(value.allowedDecisions, ['approve', 'reject', 'defer', 'accept_risk']);
  }
  if (value.actionType === 'external_prerequisite_required') {
    return sameDecisionSet(value.allowedDecisions, ['approve', 'defer']);
  }
  return true;
}

function sameDecisionSet(left: unknown[], right: BlockedGoalRecoveryDecision[]): boolean {
  return left.length === right.length && right.every((item) => left.includes(item));
}

function isBoundActionKey(
  actionKey: string,
  blockerId: string,
  actionType: BlockedGoalRecoveryActionType
): boolean {
  const encodedBlockerId = encodeURIComponent(blockerId);
  if (actionType === 'automatic_retry_candidate') {
    return actionKey.startsWith(`automatic:${encodedBlockerId}:`)
      && actionKey.length > `automatic:${encodedBlockerId}:`.length;
  }
  const prefix = actionType === 'maintainer_decision_required' ? 'maintainer' : 'external';
  const [actualPrefix, actualBlockerId, opaqueId, ...extra] = actionKey.split(':');
  return actualPrefix === prefix
    && actualBlockerId === encodedBlockerId
    && typeof opaqueId === 'string'
    && opaqueId.length > 0
    && extra.length === 0;
}

function isActionType(value: unknown): value is BlockedGoalRecoveryActionType {
  return value === 'automatic_retry_candidate'
    || value === 'maintainer_decision_required'
    || value === 'external_prerequisite_required';
}

function isResumeCommand(value: unknown): value is { commandId: string; command: string; purpose: string } {
  return isRecord(value)
    && typeof value.commandId === 'string'
    && value.commandId.length > 0
    && typeof value.command === 'string'
    && typeof value.purpose === 'string';
}

function isEvidenceReadOrderItem(value: unknown): boolean {
  return isRecord(value)
    && (value.label === 'recovery_package'
      || value.label === 'goal_evidence'
      || value.label === 'goal_audit'
      || value.label === 'blocker_log')
    && typeof value.path === 'string';
}

function isResumeReadiness(value: unknown): boolean {
  return value === 'ready_to_resume_after_review'
    || value === 'automatic_retry_candidates_available'
    || value === 'waiting_for_maintainer_or_external_action';
}

function hasPreservedBoundary(report: BlockedGoalRecoveryConsumptionReport): boolean {
  return report.boundaryCompliance.recoveryCommandsExecuted === false
    && report.boundaryCompliance.blockedActionsPreserved
    && BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.every((item) => report.blockedActions.includes(item));
}

function resolveDecisionStatus(
  items: Array<{ decision: BlockedGoalRecoveryRecordedDecision }>,
  boundaryPreserved: boolean,
  hasResumeCommand: boolean
): BlockedGoalRecoveryDecisionStatus {
  if (!boundaryPreserved || items.length === 0) {
    return 'blocked_or_incomplete';
  }
  if (items.some((item) => item.decision === 'reject')) return 'rejected';
  if (items.some((item) => item.decision === 'defer')) return 'deferred';
  if (!hasResumeCommand) return 'blocked_or_incomplete';
  if (items.some((item) => item.decision === 'unreviewed')) return 'blocked_or_incomplete';
  const decisions = new Set(items.map((item) => item.decision));
  if (decisions.size === 1 && decisions.has('approve')) return 'approved_for_separate_resume_attempt';
  if ([...decisions].every((item) => item === 'approve' || item === 'accept_risk')) return 'accepted_with_risk';
  return 'mixed_decisions';
}

function resolveResumeAttemptReadiness(
  status: BlockedGoalRecoveryDecisionStatus,
  boundaryPreserved: boolean,
  hasReviewedResumeCommand: boolean
): BlockedGoalRecoveryResumeAttemptReadiness {
  if (!boundaryPreserved) return 'blocked_by_boundary_violation';
  if (status === 'rejected') return 'blocked_by_rejection';
  if (status === 'deferred') return 'blocked_by_deferral';
  if (!hasReviewedResumeCommand) return 'blocked_by_missing_resume_command';
  if (status === 'approved_for_separate_resume_attempt' || status === 'accepted_with_risk') return 'ready_for_separate_resume_attempt';
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
    context: sanitize(action.context),
    allowedDecisions: [...action.allowedDecisions],
    prerequisiteCompletionRequired: action.prerequisiteCompletionRequired
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
