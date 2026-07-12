import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import {
  BLOCKED_GOAL_RECOVERY_MAINTAINER_REVIEW_BOUNDARY,
  BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS,
  BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BOUNDARY,
  type BlockedGoalRecoveryPackage
} from './blocked-goal-recovery-package.js';

export type BlockedGoalResumeReadiness =
  | 'ready_to_resume_after_review'
  | 'automatic_retry_candidates_available'
  | 'waiting_for_maintainer_or_external_action';

export type BlockedGoalRecoveryActionType =
  | 'automatic_retry_candidate'
  | 'maintainer_decision_required'
  | 'external_prerequisite_required';

export interface BuildBlockedGoalRecoveryConsumptionReportInput {
  generatedAt?: string;
  packagePath: string;
  sourcePackageText: string;
  recoveryPackage: BlockedGoalRecoveryPackage;
}

export interface WriteBlockedGoalRecoveryConsumptionReportInput {
  generatedAt?: string;
  packagePath: string;
  outputDir: string;
}

export interface BlockedGoalRecoveryEvidenceReadOrderItem {
  label: 'recovery_package' | 'goal_evidence' | 'goal_audit' | 'blocker_log';
  path: string;
}

export interface BlockedGoalRecoveryConsumptionAction {
  actionKey: string;
  blockerId: string;
  actionType: BlockedGoalRecoveryActionType;
  instruction: string;
  context: string;
}

export interface BlockedGoalRecoveryConsumptionReport {
  schemaVersion: 'repoassure.blocked-goal-recovery-consumption-report.v1';
  generatedAt: string;
  sourceRecoveryPackage: {
    path: string;
    sha256: string;
  };
  resumeReadiness: BlockedGoalResumeReadiness;
  evidenceReadOrder: BlockedGoalRecoveryEvidenceReadOrderItem[];
  actionQueue: BlockedGoalRecoveryConsumptionAction[];
  resumeChecklist: string[];
  resumeCommands: Array<{ command: string; purpose: string }>;
  boundaryCompliance: {
    recoveryCommandsExecuted: false;
    blockedActionsPreserved: boolean;
  };
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteBlockedGoalRecoveryConsumptionReportResult {
  jsonPath: string;
  markdownPath: string;
  report: BlockedGoalRecoveryConsumptionReport;
}

export function buildBlockedGoalRecoveryConsumptionReport(
  input: BuildBlockedGoalRecoveryConsumptionReportInput
): BlockedGoalRecoveryConsumptionReport {
  assertBlockedGoalRecoveryPackage(input.recoveryPackage);
  const actionQueue = buildActionQueue(input.recoveryPackage);
  const blockedActionsPreserved = BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.every(
    (action) => input.recoveryPackage.blockedActions.includes(action)
  );

  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-consumption-report.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    sourceRecoveryPackage: {
      path: sanitizePath(input.packagePath),
      sha256: createHash('sha256').update(input.sourcePackageText).digest('hex')
    },
    resumeReadiness: deriveResumeReadiness(input.recoveryPackage, actionQueue, blockedActionsPreserved),
    evidenceReadOrder: buildEvidenceReadOrder(input.packagePath, input.recoveryPackage),
    actionQueue,
    resumeChecklist: [
      'Read the recovery package and its source evidence in order.',
      'Review every automatic retry candidate before running it.',
      'Complete every maintainer decision and external prerequisite before resuming.',
      'Confirm blocked actions and the non-authorization boundary remain unchanged.',
      'Run only the reviewed resume command after all recovery gates are satisfied.'
    ],
    resumeCommands: input.recoveryPackage.resumeCommands.map((item) => ({
      command: sanitize(item.command),
      purpose: sanitize(item.purpose)
    })),
    boundaryCompliance: {
      recoveryCommandsExecuted: false,
      blockedActionsPreserved
    },
    maintainerReviewBoundary: sanitize(BLOCKED_GOAL_RECOVERY_MAINTAINER_REVIEW_BOUNDARY),
    redactionBoundary: sanitize(input.recoveryPackage.redactionBoundary),
    nonAuthorizationBoundary: sanitize(BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BOUNDARY),
    blockedActions: input.recoveryPackage.blockedActions.map(sanitize)
  };
}

export async function writeBlockedGoalRecoveryConsumptionReport(
  input: WriteBlockedGoalRecoveryConsumptionReportInput
): Promise<WriteBlockedGoalRecoveryConsumptionReportResult> {
  const sourcePackageText = await readFile(input.packagePath, 'utf8');
  let parsed: unknown;

  try {
    parsed = JSON.parse(sourcePackageText);
  } catch {
    throw new Error('Invalid blocked goal recovery package');
  }

  assertBlockedGoalRecoveryPackage(parsed);

  const recoveryPackage = parsed;
  const report = buildBlockedGoalRecoveryConsumptionReport({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    packagePath: input.packagePath,
    sourcePackageText,
    recoveryPackage
  });
  const jsonPath = join(input.outputDir, 'blocked-goal-recovery-consumption-report.json');
  const markdownPath = join(input.outputDir, 'blocked-goal-recovery-consumption-report.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, buildBlockedGoalRecoveryConsumptionReportMarkdown(report));

  return { jsonPath, markdownPath, report };
}

export function buildBlockedGoalRecoveryConsumptionReportMarkdown(
  report: BlockedGoalRecoveryConsumptionReport
): string {
  return [
    '# RepoAssure Blocked Goal Recovery Consumption Report',
    '',
    `Generated at: ${report.generatedAt}`,
    `Source recovery package: ${report.sourceRecoveryPackage.path}`,
    `Resume readiness: ${report.resumeReadiness}`,
    '',
    '## Evidence Read Order',
    '',
    '| Order | Evidence | Path |',
    '| --- | --- | --- |',
    ...report.evidenceReadOrder.map((item, index) => `| ${index + 1} | ${escapeMarkdownTableCell(item.label)} | ${escapeMarkdownTableCell(item.path)} |`),
    '',
    '## Recovery Action Queue',
    '',
    '| Action key | Blocker | Action type | Instruction | Context |',
    '| --- | --- | --- | --- | --- |',
    ...report.actionQueue.map((item) => `| ${[
      item.actionKey,
      item.blockerId,
      item.actionType,
      item.instruction,
      item.context
    ].map(escapeMarkdownTableCell).join(' | ')} |`),
    ...(report.actionQueue.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Resume Checklist',
    '',
    ...report.resumeChecklist.map((item) => `- [ ] ${item}`),
    '',
    '## Reviewed Resume Commands',
    '',
    '| Command | Purpose |',
    '| --- | --- |',
    ...report.resumeCommands.map((item) => `| ${escapeMarkdownTableCell(item.command)} | ${escapeMarkdownTableCell(item.purpose)} |`),
    ...(report.resumeCommands.length === 0 ? ['| n/a | n/a |'] : []),
    '',
    '## Maintainer Review Boundary',
    '',
    `- ${report.maintainerReviewBoundary}`,
    `- Recovery commands executed by this report: ${String(report.boundaryCompliance.recoveryCommandsExecuted)}`,
    '',
    '## Blocked Actions',
    '',
    ...report.blockedActions.map((action) => `- ${action}`),
    '',
    '## Redaction Boundary',
    '',
    `- ${report.redactionBoundary}`,
    '',
    '## Non-Authorization Boundary',
    '',
    `- ${report.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function deriveResumeReadiness(
  recoveryPackage: BlockedGoalRecoveryPackage,
  actionQueue: BlockedGoalRecoveryConsumptionAction[],
  blockedActionsPreserved: boolean
): BlockedGoalResumeReadiness {
  if (!blockedActionsPreserved) {
    return 'waiting_for_maintainer_or_external_action';
  }

  if (recoveryPackage.blockers.length === 0) {
    return recoveryPackage.resumeCommands.length > 0
      ? 'ready_to_resume_after_review'
      : 'waiting_for_maintainer_or_external_action';
  }

  const hasReviewGate = actionQueue.some((item) => (
    item.actionType === 'maintainer_decision_required'
    || item.actionType === 'external_prerequisite_required'
  ));
  const allBlockersRetryable = recoveryPackage.blockers.every((blocker) => (
    blocker.status === 'retryable'
    && blocker.automaticRecoveryActions.length > 0
  ));

  if (!hasReviewGate && allBlockersRetryable) {
    return 'automatic_retry_candidates_available';
  }

  return 'waiting_for_maintainer_or_external_action';
}

function buildEvidenceReadOrder(
  packagePath: string,
  recoveryPackage: BlockedGoalRecoveryPackage
): BlockedGoalRecoveryEvidenceReadOrderItem[] {
  return [
    { label: 'recovery_package', path: sanitizePath(packagePath) },
    ...(recoveryPackage.sourceProvenance.sourceGoal.evidenceRefs ?? []).map((path) => ({
      label: 'goal_evidence' as const,
      path: sanitizePath(path)
    })),
    ...(recoveryPackage.sourceProvenance.sourceAudit
      ? [{
        label: 'goal_audit' as const,
        path: sanitizePath(recoveryPackage.sourceProvenance.sourceAudit.path)
      }]
      : []),
    ...recoveryPackage.sourceProvenance.sourceLogs.map((log) => ({
      label: 'blocker_log' as const,
      path: sanitizePath(log.path)
    }))
  ];
}

function buildActionQueue(
  recoveryPackage: BlockedGoalRecoveryPackage
): BlockedGoalRecoveryConsumptionAction[] {
  return [
    ...recoveryPackage.blockers.flatMap((blocker) => blocker.automaticRecoveryActions.map((action) => ({
      actionKey: sanitize(`automatic:${action.blockerId}:${action.actionId}`),
      blockerId: sanitize(action.blockerId),
      actionType: 'automatic_retry_candidate' as const,
      instruction: sanitize(action.command),
      context: sanitize(action.rationale)
    }))),
    ...recoveryPackage.blockers.flatMap((blocker) => blocker.maintainerDecisionRequests.map((request, index) => ({
      actionKey: sanitize(`maintainer:${request.blockerId}:${index + 1}`),
      blockerId: sanitize(request.blockerId),
      actionType: 'maintainer_decision_required' as const,
      instruction: sanitize(request.requestedDecision),
      context: sanitize(`Options: ${request.options.join(', ')}`)
    }))),
    ...recoveryPackage.blockers.flatMap((blocker) => blocker.externalPrerequisites.map((prerequisite, index) => ({
      actionKey: sanitize(`external:${prerequisite.blockerId}:${index + 1}`),
      blockerId: sanitize(prerequisite.blockerId),
      actionType: 'external_prerequisite_required' as const,
      instruction: sanitize(prerequisite.prerequisite),
      context: sanitize(`Owner: ${prerequisite.owner}`)
    })))
  ];
}

function assertBlockedGoalRecoveryPackage(value: unknown): asserts value is BlockedGoalRecoveryPackage {
  if (!isRecord(value)
    || value.schemaVersion !== 'repoassure.blocked-goal-recovery-package.v1'
    || typeof value.generatedAt !== 'string'
    || !isRecoveryStatus(value.recoveryStatus)
    || !isSourceProvenance(value.sourceProvenance)
    || !isRecord(value.blockerSummary)
    || !Array.isArray(value.blockers)
    || !value.blockers.every(isNormalizedBlocker)
    || !Array.isArray(value.automaticRecoveryActions)
    || !value.automaticRecoveryActions.every(isAutomaticRecoveryAction)
    || !Array.isArray(value.maintainerDecisionRequests)
    || !value.maintainerDecisionRequests.every(isMaintainerDecisionRequest)
    || !Array.isArray(value.externalPrerequisites)
    || !value.externalPrerequisites.every(isExternalPrerequisite)
    || !Array.isArray(value.resumeCommands)
    || !value.resumeCommands.every(isResumeCommand)
    || !Array.isArray(value.blockedActions)
    || !value.blockedActions.every((action) => typeof action === 'string')
    || typeof value.maintainerReviewBoundary !== 'string'
    || typeof value.redactionBoundary !== 'string'
    || typeof value.nonAuthorizationBoundary !== 'string') {
    throw new Error('Invalid blocked goal recovery package');
  }

  const recoveryPackage = value as unknown as BlockedGoalRecoveryPackage;
  const nestedAutomaticActions = recoveryPackage.blockers.flatMap((blocker) => blocker.automaticRecoveryActions);
  const nestedDecisionRequests = recoveryPackage.blockers.flatMap((blocker) => blocker.maintainerDecisionRequests);
  const nestedExternalPrerequisites = recoveryPackage.blockers.flatMap((blocker) => blocker.externalPrerequisites);

  if (!sameJson(recoveryPackage.automaticRecoveryActions, nestedAutomaticActions)
    || !sameJson(recoveryPackage.maintainerDecisionRequests, nestedDecisionRequests)
    || !sameJson(recoveryPackage.externalPrerequisites, nestedExternalPrerequisites)
    || recoveryPackage.maintainerReviewBoundary !== BLOCKED_GOAL_RECOVERY_MAINTAINER_REVIEW_BOUNDARY
    || recoveryPackage.nonAuthorizationBoundary !== BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BOUNDARY) {
    throw new Error('Invalid blocked goal recovery package');
  }
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isNormalizedBlocker(value: unknown): boolean {
  return isRecord(value)
    && typeof value.blockerId === 'string'
    && typeof value.category === 'string'
    && typeof value.status === 'string'
    && typeof value.summary === 'string'
    && isStringArray(value.attemptedActions)
    && isStringArray(value.evidenceRefs)
    && Array.isArray(value.automaticRecoveryActions)
    && value.automaticRecoveryActions.every(isAutomaticRecoveryAction)
    && Array.isArray(value.maintainerDecisionRequests)
    && value.maintainerDecisionRequests.every(isMaintainerDecisionRequest)
    && Array.isArray(value.externalPrerequisites)
    && value.externalPrerequisites.every(isExternalPrerequisite);
}

function isSourceProvenance(value: unknown): boolean {
  if (!isRecord(value)
    || !isRecord(value.input)
    || typeof value.input.fileName !== 'string'
    || typeof value.input.path !== 'string'
    || typeof value.input.sha256 !== 'string'
    || !isRecord(value.sourceGoal)
    || typeof value.sourceGoal.title !== 'string'
    || typeof value.sourceGoal.status !== 'string'
    || typeof value.sourceGoal.objective !== 'string'
    || (value.sourceGoal.evidenceRefs !== undefined && !isStringArray(value.sourceGoal.evidenceRefs))
    || !Array.isArray(value.sourceLogs)
    || !value.sourceLogs.every(isSourceLog)) {
    return false;
  }

  return value.sourceAudit === undefined || isSourceAudit(value.sourceAudit);
}

function isSourceAudit(value: unknown): boolean {
  return isRecord(value)
    && typeof value.path === 'string'
    && typeof value.status === 'string'
    && typeof value.summary === 'string';
}

function isSourceLog(value: unknown): boolean {
  return isRecord(value)
    && typeof value.path === 'string'
    && typeof value.summary === 'string';
}

function isAutomaticRecoveryAction(value: unknown): boolean {
  return isRecord(value)
    && typeof value.blockerId === 'string'
    && typeof value.actionId === 'string'
    && typeof value.command === 'string'
    && typeof value.rationale === 'string';
}

function isMaintainerDecisionRequest(value: unknown): boolean {
  return isRecord(value)
    && typeof value.blockerId === 'string'
    && typeof value.requestedDecision === 'string'
    && isStringArray(value.options);
}

function isExternalPrerequisite(value: unknown): boolean {
  return isRecord(value)
    && typeof value.blockerId === 'string'
    && typeof value.prerequisite === 'string'
    && typeof value.owner === 'string';
}

function isResumeCommand(value: unknown): boolean {
  return isRecord(value)
    && typeof value.command === 'string'
    && typeof value.purpose === 'string';
}

function isRecoveryStatus(value: unknown): boolean {
  return value === 'ready_to_resume'
    || value === 'retryable_with_automatic_actions'
    || value === 'requires_maintainer_or_external_action';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitize(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

function sanitizePath(value: string): string {
  return value
    .replaceAll('\\', '/')
    .split('/')
    .map(sanitize)
    .join('/');
}
