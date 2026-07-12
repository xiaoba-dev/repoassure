import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import type {
  BlockedGoalRecoveryDecisionItem,
  BlockedGoalRecoveryDecisionReceipt,
  BlockedGoalRecoveryRecordedDecision,
  BlockedGoalRecoveryResumeCommandDecisionItem
} from './blocked-goal-recovery-decision-receipt.js';
import {
  BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS
} from './blocked-goal-recovery-package.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type BlockedGoalRecoveryResumeAttemptTaskPackageStatus =
  | 'ready_for_separate_resume_attempt'
  | 'ready_with_accepted_risk'
  | 'blocked_by_decision_receipt';

export interface BuildBlockedGoalRecoveryResumeAttemptTaskPackageInput {
  generatedAt?: string;
  receiptPath: string;
  sourceReceiptText: string;
  receipt: BlockedGoalRecoveryDecisionReceipt;
}

export interface WriteBlockedGoalRecoveryResumeAttemptTaskPackageInput {
  generatedAt?: string;
  receiptPath: string;
  outputDir: string;
}

export interface WriteBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface BlockedGoalRecoveryResumeAttemptActionTask {
  order: number;
  actionKey: string;
  blockerId: string;
  actionType: string;
  instruction: string;
  context: string;
  sourceDecision: 'approve' | 'accept_risk';
  sourceEvidence: string;
  executionMode: 'separate_reviewed_attempt';
}

export interface BlockedGoalRecoveryResumeAttemptCommandTask {
  order: number;
  commandId: string;
  command: string;
  purpose: string;
  sourceDecision: 'approve' | 'accept_risk';
  sourceEvidence: string;
  executionMode: 'separate_reviewed_attempt';
  executed: false;
}

export interface BlockedGoalRecoveryResumeAttemptTaskPackage {
  schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1';
  generatedAt: string;
  taskPackageStatus: BlockedGoalRecoveryResumeAttemptTaskPackageStatus;
  sourceDecisionReceipt: {
    schemaVersion: string;
    fileName: string;
    path: string;
    sha256: string;
    decisionStatus: string;
    resumeAttemptReadiness: string;
  };
  blockedReasons: string[];
  actionTasks: BlockedGoalRecoveryResumeAttemptActionTask[];
  resumeCommandTasks: BlockedGoalRecoveryResumeAttemptCommandTask[];
  prerequisites: string[];
  verificationChecklist: string[];
  excludedItems: string[];
  boundaryCompliance: {
    commandsExecuted: false;
    sourceBoundaryPreserved: boolean;
  };
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteBlockedGoalRecoveryResumeAttemptTaskPackageResult {
  jsonPath: string;
  markdownPath: string;
  taskPackage: BlockedGoalRecoveryResumeAttemptTaskPackage;
}

const RECEIPT_JSON_NAME = 'blocked-goal-recovery-decision-receipt.json';
const TASK_PACKAGE_JSON_NAME = 'blocked-goal-recovery-resume-attempt-task-package.json';
const TASK_PACKAGE_MARKDOWN_NAME = 'blocked-goal-recovery-resume-attempt-task-package.md';

const MAINTAINER_REVIEW_BOUNDARY =
  'This task package translates reviewed recovery decisions into a bounded queue for a separate resume attempt; it does not execute commands or expand the source authorization.';
const NON_AUTHORIZATION_BOUNDARY =
  'This task package does not execute recovery commands, modify target repo files, create target repo branch, commit, pull request, issue, or advisory, publish npm, create GitHub release, run public launch, contact customers, change pricing/spend, change repository visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.';

export function buildBlockedGoalRecoveryResumeAttemptTaskPackage(
  input: BuildBlockedGoalRecoveryResumeAttemptTaskPackageInput
): BlockedGoalRecoveryResumeAttemptTaskPackage {
  let parsedSource: unknown;
  try {
    parsedSource = JSON.parse(input.sourceReceiptText);
  } catch {
    throw invalidReceipt();
  }
  assertDecisionReceipt(parsedSource);
  assertDecisionReceipt(input.receipt);
  if (!isDeepStrictEqual(parsedSource, input.receipt)) {
    throw invalidReceipt();
  }

  const blockedReasons = resolveBlockedReasons(input.receipt);
  const isReady = blockedReasons.length === 0;
  const status: BlockedGoalRecoveryResumeAttemptTaskPackageStatus = !isReady
    ? 'blocked_by_decision_receipt'
    : input.receipt.decisionStatus === 'accepted_with_risk'
      ? 'ready_with_accepted_risk'
      : 'ready_for_separate_resume_attempt';
  const allowedDecisions = new Set<BlockedGoalRecoveryRecordedDecision>(['approve', 'accept_risk']);

  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    taskPackageStatus: status,
    sourceDecisionReceipt: {
      schemaVersion: input.receipt.schemaVersion,
      fileName: sanitize(basename(input.receiptPath)),
      path: sanitizePath(input.receiptPath),
      sha256: createHash('sha256').update(input.sourceReceiptText).digest('hex'),
      decisionStatus: input.receipt.decisionStatus,
      resumeAttemptReadiness: input.receipt.resumeAttemptReadiness
    },
    blockedReasons,
    actionTasks: isReady
      ? input.receipt.decisionItems
        .filter((item) => allowedDecisions.has(item.decision))
        .map((item, index) => buildActionTask(item, index))
      : [],
    resumeCommandTasks: isReady
      ? input.receipt.resumeCommandDecisionItems
        .filter((item) => allowedDecisions.has(item.decision))
        .map((item, index) => buildCommandTask(item, index))
      : [],
    prerequisites: [
      'Use an isolated worktree created from the reviewed source revision.',
      'Reconfirm the source receipt SHA-256 before starting the separate attempt.',
      'Keep every blocked action and non-authorization boundary unchanged.',
      'Stop and record a new blocker when observed evidence differs from this package.'
    ],
    verificationChecklist: [
      'Verify each approved action task in listed order.',
      'Run only the listed reviewed resume command in the separate attempt.',
      'Capture command exit status and sanitized evidence without secrets or private target source.',
      'Run the applicable typecheck, lint, unit, integration, end-to-end, hygiene, and release checks.',
      'Require maintainer review before treating the resume attempt as complete.'
    ],
    excludedItems: input.receipt.decisionItems
      .filter((item) => !allowedDecisions.has(item.decision))
      .map((item) => sanitize(item.actionKey)),
    boundaryCompliance: {
      commandsExecuted: false,
      sourceBoundaryPreserved: input.receipt.boundaryCompliance.sourceBoundaryPreserved
    },
    maintainerReviewBoundary: MAINTAINER_REVIEW_BOUNDARY,
    redactionBoundary: sanitize(input.receipt.redactionBoundary),
    nonAuthorizationBoundary: NON_AUTHORIZATION_BOUNDARY,
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize)
  };
}

export async function writeBlockedGoalRecoveryResumeAttemptTaskPackage(
  input: WriteBlockedGoalRecoveryResumeAttemptTaskPackageInput
): Promise<WriteBlockedGoalRecoveryResumeAttemptTaskPackageResult> {
  const sourceReceiptText = await readFile(input.receiptPath, 'utf8');
  let receipt: unknown;
  try {
    receipt = JSON.parse(sourceReceiptText);
  } catch {
    throw invalidReceipt();
  }
  assertDecisionReceipt(receipt);
  const taskPackage = buildBlockedGoalRecoveryResumeAttemptTaskPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    receiptPath: input.receiptPath,
    sourceReceiptText,
    receipt
  });
  const jsonPath = join(input.outputDir, TASK_PACKAGE_JSON_NAME);
  const markdownPath = join(input.outputDir, TASK_PACKAGE_MARKDOWN_NAME);
  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(taskPackage, null, 2)}\n`);
  await writeFile(markdownPath, buildBlockedGoalRecoveryResumeAttemptTaskPackageMarkdown(taskPackage));
  return { jsonPath, markdownPath, taskPackage };
}

export async function writeBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectory(
  input: WriteBlockedGoalRecoveryResumeAttemptTaskPackageFromDirectoryInput
): Promise<WriteBlockedGoalRecoveryResumeAttemptTaskPackageResult> {
  return writeBlockedGoalRecoveryResumeAttemptTaskPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    receiptPath: join(input.inputDir, RECEIPT_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildBlockedGoalRecoveryResumeAttemptTaskPackageMarkdown(
  taskPackage: BlockedGoalRecoveryResumeAttemptTaskPackage
): string {
  return [
    '# RepoAssure Blocked Goal Recovery Resume Attempt Task Package',
    '',
    `Generated at: ${taskPackage.generatedAt}`,
    `Task package status: ${taskPackage.taskPackageStatus}`,
    `Source receipt SHA-256: ${taskPackage.sourceDecisionReceipt.sha256}`,
    '',
    '## Blocked Reasons',
    '',
    ...(taskPackage.blockedReasons.length > 0 ? taskPackage.blockedReasons.map((item) => `- ${item}`) : ['- none']),
    '',
    '## Action Tasks',
    '',
    '| Order | Action key | Blocker | Type | Instruction | Decision | Evidence |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...taskPackage.actionTasks.map((item) => `| ${[
      item.order, item.actionKey, item.blockerId, item.actionType, item.instruction,
      item.sourceDecision, item.sourceEvidence
    ].map((value) => escapeMarkdownTableCell(String(value))).join(' | ')} |`),
    ...(taskPackage.actionTasks.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Resume Command Tasks',
    '',
    '| Order | Command ID | Command | Purpose | Decision | Executed |',
    '| --- | --- | --- | --- | --- | --- |',
    ...taskPackage.resumeCommandTasks.map((item) => `| ${[
      item.order, item.commandId, item.command, item.purpose, item.sourceDecision, item.executed
    ].map((value) => escapeMarkdownTableCell(String(value))).join(' | ')} |`),
    ...(taskPackage.resumeCommandTasks.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | false |'] : []),
    '',
    '## Prerequisites',
    '',
    ...taskPackage.prerequisites.map((item) => `- [ ] ${item}`),
    '',
    '## Verification Checklist',
    '',
    ...taskPackage.verificationChecklist.map((item) => `- [ ] ${item}`),
    '',
    '## Maintainer Review Boundary',
    '',
    `- ${taskPackage.maintainerReviewBoundary}`,
    `- Commands executed by this package: ${String(taskPackage.boundaryCompliance.commandsExecuted)}`,
    '',
    '## Blocked Actions',
    '',
    ...taskPackage.blockedActions.map((item) => `- ${item}`),
    '',
    '## Redaction Boundary',
    '',
    `- ${taskPackage.redactionBoundary}`,
    '',
    '## Non-Authorization Boundary',
    '',
    `- ${taskPackage.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function resolveBlockedReasons(receipt: BlockedGoalRecoveryDecisionReceipt): string[] {
  const reasons: string[] = [];
  if (!receipt.boundaryCompliance.sourceBoundaryPreserved) reasons.push('source_boundary_violation');
  if (receipt.decisionStatus === 'rejected') reasons.push('source_rejected');
  if (receipt.decisionStatus === 'deferred') reasons.push('source_deferred');
  if (receipt.decisionStatus === 'mixed_decisions') reasons.push('source_mixed_decisions');
  if (receipt.decisionStatus === 'blocked_or_incomplete') reasons.push('source_incomplete');
  if (receipt.resumeAttemptReadiness === 'blocked_by_missing_resume_command') reasons.push('missing_reviewed_resume_command');
  if (receipt.resumeCommandDecisionItems.length === 0) reasons.push('missing_reviewed_resume_command');
  if ([...receipt.decisionItems, ...receipt.resumeCommandDecisionItems]
    .some((item) => item.decision !== 'approve' && item.decision !== 'accept_risk')) {
    reasons.push('non_executable_decision_present');
  }
  if (receipt.resumeAttemptReadiness !== 'ready_for_separate_resume_attempt') reasons.push('source_not_ready');
  return [...new Set(reasons)];
}

function buildActionTask(
  item: BlockedGoalRecoveryDecisionItem,
  index: number
): BlockedGoalRecoveryResumeAttemptActionTask {
  return {
    order: index + 1,
    actionKey: sanitize(item.actionKey),
    blockerId: sanitize(item.blockerId),
    actionType: item.actionType,
    instruction: sanitize(item.instruction),
    context: sanitize(item.context),
    sourceDecision: item.decision as 'approve' | 'accept_risk',
    sourceEvidence: sanitize(item.evidence),
    executionMode: 'separate_reviewed_attempt'
  };
}

function buildCommandTask(
  item: BlockedGoalRecoveryResumeCommandDecisionItem,
  index: number
): BlockedGoalRecoveryResumeAttemptCommandTask {
  return {
    order: index + 1,
    commandId: sanitize(item.commandId),
    command: sanitize(item.command),
    purpose: sanitize(item.purpose),
    sourceDecision: item.decision as 'approve' | 'accept_risk',
    sourceEvidence: sanitize(item.evidence),
    executionMode: 'separate_reviewed_attempt',
    executed: false
  };
}

function assertDecisionReceipt(value: unknown): asserts value is BlockedGoalRecoveryDecisionReceipt {
  if (!isRecord(value)
    || value.schemaVersion !== 'repoassure.blocked-goal-recovery-decision-receipt.v1'
    || typeof value.generatedAt !== 'string'
    || !isDecisionStatus(value.decisionStatus)
    || !isResumeReadiness(value.resumeAttemptReadiness)
    || !isSourceReceipt(value.sourceConsumptionReport)
    || !isDecisionSummary(value.decisionSummary)
    || !Array.isArray(value.decisionItems)
    || !value.decisionItems.every(isDecisionItem)
    || !hasUniqueStrings(value.decisionItems.map((item) => (item as BlockedGoalRecoveryDecisionItem).actionKey))
    || !Array.isArray(value.resumeCommandDecisionItems)
    || !value.resumeCommandDecisionItems.every(isCommandDecisionItem)
    || !hasUniqueStrings(value.resumeCommandDecisionItems.map((item) => (item as BlockedGoalRecoveryResumeCommandDecisionItem).commandId))
    || !Array.isArray(value.approvedActions)
    || !Array.isArray(value.rejectedActions)
    || !Array.isArray(value.deferredActions)
    || !Array.isArray(value.riskAcceptedActions)
    || !isRecord(value.boundaryCompliance)
    || value.boundaryCompliance.resumeCommandsExecuted !== false
    || typeof value.boundaryCompliance.sourceBoundaryPreserved !== 'boolean'
    || typeof value.maintainerReviewBoundary !== 'string'
    || typeof value.redactionBoundary !== 'string'
    || typeof value.nonAuthorizationBoundary !== 'string'
    || !Array.isArray(value.blockedActions)
    || !value.blockedActions.every((item) => typeof item === 'string')) {
    throw invalidReceipt();
  }

  const receipt = value as unknown as BlockedGoalRecoveryDecisionReceipt;
  const count = (decision: BlockedGoalRecoveryRecordedDecision) => receipt.decisionItems.filter((item) => item.decision === decision).length;
  const expectedSummary = {
    totalActions: receipt.decisionItems.length,
    reviewed: receipt.decisionItems.length - count('unreviewed'),
    approved: count('approve'),
    rejected: count('reject'),
    deferred: count('defer'),
    acceptedRisk: count('accept_risk'),
    unreviewed: count('unreviewed')
  };
  const expectedStatus = deriveDecisionStatus(receipt);
  const expectedReadiness = deriveReadiness(expectedStatus, receipt);
  if (!isDeepStrictEqual(receipt.decisionSummary, expectedSummary)
    || !sameActions(receipt.approvedActions, receipt.decisionItems.filter((item) => item.decision === 'approve'))
    || !sameActions(receipt.rejectedActions, receipt.decisionItems.filter((item) => item.decision === 'reject'))
    || !sameActions(receipt.deferredActions, receipt.decisionItems.filter((item) => item.decision === 'defer'))
    || !sameActions(receipt.riskAcceptedActions, receipt.decisionItems.filter((item) => item.decision === 'accept_risk'))
    || receipt.decisionStatus !== expectedStatus
    || receipt.resumeAttemptReadiness !== expectedReadiness
    || !BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.every((item) => receipt.blockedActions.includes(item))) {
    throw invalidReceipt();
  }
}

function deriveDecisionStatus(receipt: BlockedGoalRecoveryDecisionReceipt) {
  const items = [...receipt.decisionItems, ...receipt.resumeCommandDecisionItems];
  if (!receipt.boundaryCompliance.sourceBoundaryPreserved || items.length === 0) return 'blocked_or_incomplete';
  if (items.some((item) => item.decision === 'reject')) return 'rejected';
  if (items.some((item) => item.decision === 'defer')) return 'deferred';
  if (receipt.resumeCommandDecisionItems.length === 0 || items.some((item) => item.decision === 'unreviewed')) return 'blocked_or_incomplete';
  const decisions = new Set(items.map((item) => item.decision));
  if (decisions.size === 1 && decisions.has('approve')) return 'approved_for_separate_resume_attempt';
  if ([...decisions].every((item) => item === 'approve' || item === 'accept_risk')) return 'accepted_with_risk';
  return 'mixed_decisions';
}

function deriveReadiness(status: string, receipt: BlockedGoalRecoveryDecisionReceipt) {
  if (!receipt.boundaryCompliance.sourceBoundaryPreserved) return 'blocked_by_boundary_violation';
  if (status === 'rejected') return 'blocked_by_rejection';
  if (status === 'deferred') return 'blocked_by_deferral';
  if (receipt.resumeCommandDecisionItems.length === 0) return 'blocked_by_missing_resume_command';
  if (status === 'approved_for_separate_resume_attempt' || status === 'accepted_with_risk') return 'ready_for_separate_resume_attempt';
  if (status === 'mixed_decisions') return 'blocked_by_mixed_decisions';
  return 'blocked_by_missing_decision';
}

function isDecisionItem(value: unknown): value is BlockedGoalRecoveryDecisionItem {
  return isRecord(value)
    && typeof value.actionKey === 'string' && value.actionKey.length > 0
    && typeof value.blockerId === 'string'
    && (value.actionType === 'automatic_retry_candidate' || value.actionType === 'maintainer_decision_required' || value.actionType === 'external_prerequisite_required')
    && typeof value.instruction === 'string'
    && typeof value.context === 'string'
    && Array.isArray(value.allowedDecisions) && value.allowedDecisions.every(isDecision)
    && typeof value.prerequisiteCompletionRequired === 'boolean'
    && isRecordedDecision(value.decision)
    && typeof value.evidence === 'string'
    && typeof value.reviewerRole === 'string'
    && typeof value.rationale === 'string'
    && (value.prerequisiteStatus === 'completed' || value.prerequisiteStatus === 'unmet' || value.prerequisiteStatus === 'not_applicable')
    && (value.decision === 'unreviewed' || (value.evidence.trim().length > 0 && value.reviewerRole.trim().length > 0))
    && (value.decision === 'approve' || value.decision === 'unreviewed' || value.rationale.trim().length > 0)
    && !(value.prerequisiteCompletionRequired && value.decision === 'approve' && value.prerequisiteStatus !== 'completed');
}

function isCommandDecisionItem(value: unknown): value is BlockedGoalRecoveryResumeCommandDecisionItem {
  return isRecord(value)
    && typeof value.commandId === 'string' && value.commandId.length > 0
    && typeof value.command === 'string'
    && typeof value.purpose === 'string'
    && isRecordedDecision(value.decision)
    && typeof value.evidence === 'string'
    && typeof value.reviewerRole === 'string'
    && typeof value.rationale === 'string'
    && (value.decision === 'unreviewed' || (value.evidence.trim().length > 0 && value.reviewerRole.trim().length > 0))
    && (value.decision === 'approve' || value.decision === 'unreviewed' || value.rationale.trim().length > 0);
}

function isSourceReceipt(value: unknown): boolean {
  return isRecord(value)
    && typeof value.schemaVersion === 'string'
    && typeof value.fileName === 'string'
    && typeof value.path === 'string'
    && typeof value.sha256 === 'string' && /^[a-f0-9]{64}$/u.test(value.sha256)
    && typeof value.resumeReadiness === 'string';
}

function isDecisionSummary(value: unknown): boolean {
  return isRecord(value) && ['totalActions', 'reviewed', 'approved', 'rejected', 'deferred', 'acceptedRisk', 'unreviewed']
    .every((key) => Number.isInteger(value[key]) && (value[key] as number) >= 0);
}

function isDecisionStatus(value: unknown): boolean {
  return value === 'approved_for_separate_resume_attempt' || value === 'rejected' || value === 'deferred'
    || value === 'accepted_with_risk' || value === 'mixed_decisions' || value === 'blocked_or_incomplete';
}

function isResumeReadiness(value: unknown): boolean {
  return value === 'ready_for_separate_resume_attempt' || value === 'blocked_by_missing_decision'
    || value === 'blocked_by_missing_resume_command' || value === 'blocked_by_rejection'
    || value === 'blocked_by_deferral' || value === 'blocked_by_mixed_decisions'
    || value === 'blocked_by_boundary_violation';
}

function isDecision(value: unknown): boolean {
  return value === 'approve' || value === 'reject' || value === 'defer' || value === 'accept_risk';
}

function isRecordedDecision(value: unknown): value is BlockedGoalRecoveryRecordedDecision {
  return isDecision(value) || value === 'unreviewed';
}

function sameActions(left: BlockedGoalRecoveryDecisionItem[], right: BlockedGoalRecoveryDecisionItem[]): boolean {
  return isDeepStrictEqual(left, right);
}

function hasUniqueStrings(values: string[]): boolean {
  return new Set(values).size === values.length;
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

function invalidReceipt(): Error {
  return new Error('Invalid blocked goal recovery decision receipt');
}
