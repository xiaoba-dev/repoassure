import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from './blocked-goal-recovery-package.js';
import type { BlockedGoalRecoveryResumeAttemptTaskPackage } from './blocked-goal-recovery-resume-attempt-task-package.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type BlockedGoalRecoveryResumeAttemptEvidenceResultStatus = 'passed' | 'failed' | 'blocked' | 'not_run';
export type BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeStatus =
  | 'complete_for_maintainer_review'
  | 'failed_or_blocked'
  | 'incomplete'
  | 'boundary_violation'
  | 'source_not_ready';

export interface BlockedGoalRecoveryResumeAttemptExecutionResultInput {
  status: BlockedGoalRecoveryResumeAttemptEvidenceResultStatus;
  summary: string;
  evidenceRefs: string[];
}

export interface BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput {
  sourceTaskPackageSha256: string;
  attemptId: string;
  startedAt: string;
  completedAt: string;
  actionResults: Array<BlockedGoalRecoveryResumeAttemptExecutionResultInput & { actionKey: string }>;
  resumeCommandResults: Array<BlockedGoalRecoveryResumeAttemptExecutionResultInput & {
    commandId: string;
    exitCode: number | null;
  }>;
  verificationResults: Array<BlockedGoalRecoveryResumeAttemptExecutionResultInput & { checkId: string }>;
  boundaryEvidence: {
    unlistedCommandsExecuted: boolean;
    blockedActionsPreserved: boolean;
    targetRepoMutationByRepoAssure: boolean;
  };
  redactionBoundary: string;
}

export interface BuildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeInput {
  generatedAt?: string;
  taskPackagePath: string;
  sourceTaskPackageText: string;
  taskPackage: BlockedGoalRecoveryResumeAttemptTaskPackage;
  evidenceInput: BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput;
}

export interface WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeInput {
  generatedAt?: string;
  taskPackagePath: string;
  evidenceInputPath: string;
  outputDir: string;
}

export interface WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake {
  schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1';
  generatedAt: string;
  intakeStatus: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeStatus;
  sourceTaskPackage: {
    schemaVersion: string;
    fileName: string;
    path: string;
    sha256: string;
    taskPackageStatus: string;
  };
  attempt: { attemptId: string; startedAt: string; completedAt: string };
  actionResults: BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput['actionResults'];
  resumeCommandResults: BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput['resumeCommandResults'];
  verificationResults: BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput['verificationResults'];
  unresolvedTaskIds: string[];
  boundaryCompliance: {
    commandsExecutedByIntake: false;
    unlistedCommandsExecuted: boolean;
    blockedActionsPreserved: boolean;
    targetRepoMutationByRepoAssure: boolean;
    sourceBoundaryPreserved: boolean;
  };
  reviewChecklist: string[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeResult {
  jsonPath: string;
  markdownPath: string;
  intake: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake;
}

const TASK_PACKAGE_JSON_NAME = 'blocked-goal-recovery-resume-attempt-task-package.json';
const EVIDENCE_INPUT_JSON_NAME = 'blocked-goal-recovery-resume-attempt-execution-evidence-input.json';
const INTAKE_JSON_NAME = 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json';
const INTAKE_MARKDOWN_NAME = 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.md';
const MAINTAINER_REVIEW_BOUNDARY =
  'This intake records evidence from a separate resume attempt for maintainer review; it does not accept the evidence, execute commands, or authorize follow-on work.';
const NON_AUTHORIZATION_BOUNDARY =
  'This intake does not execute recovery commands, modify target repo files, create target repo branch, commit, pull request, issue, or advisory, publish npm, create GitHub release, run public launch, contact customers, change pricing/spend, change repository visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.';

export function buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(
  input: BuildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeInput
): BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake {
  let parsedTaskPackage: unknown;
  try {
    parsedTaskPackage = JSON.parse(input.sourceTaskPackageText);
  } catch {
    throw invalidTaskPackage();
  }
  assertTaskPackage(parsedTaskPackage);
  assertTaskPackage(input.taskPackage);
  if (!isDeepStrictEqual(parsedTaskPackage, input.taskPackage)) throw invalidTaskPackage();
  assertEvidenceInput(input.evidenceInput, input.taskPackage);

  const sourceSha256 = createHash('sha256').update(input.sourceTaskPackageText).digest('hex');
  if (input.evidenceInput.sourceTaskPackageSha256 !== sourceSha256) throw invalidEvidence();

  const actionIds = new Set(input.evidenceInput.actionResults.map((item) => item.actionKey));
  const commandIds = new Set(input.evidenceInput.resumeCommandResults.map((item) => item.commandId));
  const unresolvedTaskIds = [
    ...input.taskPackage.actionTasks.filter((item) => !actionIds.has(item.actionKey)).map((item) => item.actionKey),
    ...input.taskPackage.resumeCommandTasks.filter((item) => !commandIds.has(item.commandId)).map((item) => item.commandId)
  ];
  const sourceBoundaryPreserved = input.taskPackage.boundaryCompliance.commandsExecuted === false
    && input.taskPackage.boundaryCompliance.sourceBoundaryPreserved
    && hasCanonicalBlockedActions(input.taskPackage.blockedActions);
  const boundaryCompliance = {
    commandsExecutedByIntake: false as const,
    ...input.evidenceInput.boundaryEvidence,
    sourceBoundaryPreserved
  };

  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1',
    generatedAt: canonicalText(input.generatedAt ?? new Date().toISOString()),
    intakeStatus: deriveIntakeStatus(input.taskPackage, input.evidenceInput, unresolvedTaskIds, boundaryCompliance),
    sourceTaskPackage: {
      schemaVersion: input.taskPackage.schemaVersion,
      fileName: canonicalText(basename(input.taskPackagePath)),
      path: canonicalPath(input.taskPackagePath),
      sha256: sourceSha256,
      taskPackageStatus: input.taskPackage.taskPackageStatus
    },
    attempt: {
      attemptId: input.evidenceInput.attemptId,
      startedAt: input.evidenceInput.startedAt,
      completedAt: input.evidenceInput.completedAt
    },
    actionResults: input.evidenceInput.actionResults.map(copyActionResult),
    resumeCommandResults: input.evidenceInput.resumeCommandResults.map(copyCommandResult),
    verificationResults: input.evidenceInput.verificationResults.map(copyVerificationResult),
    unresolvedTaskIds,
    boundaryCompliance,
    reviewChecklist: [
      'Confirm the source task package SHA-256 matches the package reviewed for the separate attempt.',
      'Review every action, resume command, verification result, and referenced evidence file.',
      'Confirm no unlisted command ran and every blocked action remained preserved.',
      'Treat failed, blocked, not-run, missing, or boundary-violating evidence as unresolved.',
      'Record acceptance only in a separate maintainer evidence review decision package.'
    ],
    maintainerReviewBoundary: MAINTAINER_REVIEW_BOUNDARY,
    redactionBoundary: input.evidenceInput.redactionBoundary,
    nonAuthorizationBoundary: NON_AUTHORIZATION_BOUNDARY,
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
  };
}

export async function writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(
  input: WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeInput
): Promise<WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeResult> {
  const [sourceTaskPackageText, evidenceInputText] = await Promise.all([
    readFile(input.taskPackagePath, 'utf8'),
    readFile(input.evidenceInputPath, 'utf8')
  ]);
  let taskPackage: unknown;
  let evidenceInput: unknown;
  try {
    taskPackage = JSON.parse(sourceTaskPackageText);
    evidenceInput = JSON.parse(evidenceInputText);
  } catch {
    throw invalidEvidence();
  }
  assertTaskPackage(taskPackage);
  const intake = buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    taskPackagePath: input.taskPackagePath,
    sourceTaskPackageText,
    taskPackage,
    evidenceInput: evidenceInput as BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput
  });
  const jsonPath = join(input.outputDir, INTAKE_JSON_NAME);
  const markdownPath = join(input.outputDir, INTAKE_MARKDOWN_NAME);
  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(intake, null, 2)}\n`);
  await writeFile(markdownPath, buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeMarkdown(intake));
  return { jsonPath, markdownPath, intake };
}

export async function writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectory(
  input: WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeFromDirectoryInput
): Promise<WriteBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeResult> {
  return writeBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    taskPackagePath: join(input.inputDir, TASK_PACKAGE_JSON_NAME),
    evidenceInputPath: join(input.inputDir, EVIDENCE_INPUT_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeMarkdown(
  intake: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake
): string {
  const resultRows = <T extends { status: string; summary: string; evidenceRefs: string[] }>(items: T[], getId: (item: T) => string) =>
    items.map((item) => `| ${[getId(item), item.status, item.summary, item.evidenceRefs.join(', ')]
      .map((value) => escapeMarkdownTableCell(String(value))).join(' | ')} |`);
  return [
    '# RepoAssure Blocked Goal Recovery Resume Attempt Execution Evidence Intake',
    '',
    `Generated at: ${intake.generatedAt}`,
    `Intake status: ${intake.intakeStatus}`,
    `Source task package SHA-256: ${intake.sourceTaskPackage.sha256}`,
    '',
    '## Action Results', '',
    '| Action key | Status | Summary | Evidence |', '| --- | --- | --- | --- |',
    ...resultRows(intake.actionResults, (item) => item.actionKey),
    ...(intake.actionResults.length === 0 ? ['| n/a | n/a | n/a | n/a |'] : []),
    '', '## Resume Command Results', '',
    '| Command ID | Status | Summary | Evidence |', '| --- | --- | --- | --- |',
    ...resultRows(intake.resumeCommandResults, (item) => item.commandId),
    ...(intake.resumeCommandResults.length === 0 ? ['| n/a | n/a | n/a | n/a |'] : []),
    '', '## Verification Results', '',
    '| Check ID | Status | Summary | Evidence |', '| --- | --- | --- | --- |',
    ...resultRows(intake.verificationResults, (item) => item.checkId),
    ...(intake.verificationResults.length === 0 ? ['| n/a | n/a | n/a | n/a |'] : []),
    '', '## Unresolved Tasks', '',
    ...(intake.unresolvedTaskIds.length > 0 ? intake.unresolvedTaskIds.map((item) => `- ${item}`) : ['- none']),
    '', '## Review Checklist', '', ...intake.reviewChecklist.map((item) => `- [ ] ${item}`),
    '', '## Maintainer Review Boundary', '', `- ${intake.maintainerReviewBoundary}`,
    `- Commands executed by this intake: ${String(intake.boundaryCompliance.commandsExecutedByIntake)}`,
    '', '## Blocked Actions', '', ...intake.blockedActions.map((item) => `- ${item}`),
    '', '## Redaction Boundary', '', `- ${intake.redactionBoundary}`,
    '', '## Non-Authorization Boundary', '', `- ${intake.nonAuthorizationBoundary}`, ''
  ].join('\n');
}

function deriveIntakeStatus(
  taskPackage: BlockedGoalRecoveryResumeAttemptTaskPackage,
  evidence: BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput,
  unresolvedTaskIds: string[],
  boundary: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake['boundaryCompliance']
): BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeStatus {
  if (taskPackage.taskPackageStatus === 'blocked_by_decision_receipt') return 'source_not_ready';
  if (!boundary.sourceBoundaryPreserved || boundary.unlistedCommandsExecuted
    || !boundary.blockedActionsPreserved || boundary.targetRepoMutationByRepoAssure) return 'boundary_violation';
  const results = [...evidence.actionResults, ...evidence.resumeCommandResults, ...evidence.verificationResults];
  if (results.some((item) => item.status === 'failed' || item.status === 'blocked')) return 'failed_or_blocked';
  if (unresolvedTaskIds.length > 0 || evidence.verificationResults.length === 0
    || results.some((item) => item.status === 'not_run')) return 'incomplete';
  return 'complete_for_maintainer_review';
}

function assertEvidenceInput(
  value: unknown,
  taskPackage: BlockedGoalRecoveryResumeAttemptTaskPackage
): asserts value is BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput {
  if (!isRecord(value) || typeof value.sourceTaskPackageSha256 !== 'string'
    || !/^[a-f0-9]{64}$/u.test(value.sourceTaskPackageSha256)
    || !canonicalIdentifier(value.attemptId) || !canonicalTextValue(value.startedAt) || !canonicalTextValue(value.completedAt)
    || !Array.isArray(value.actionResults) || !value.actionResults.every(isActionResult)
    || !Array.isArray(value.resumeCommandResults) || !value.resumeCommandResults.every(isCommandResult)
    || !Array.isArray(value.verificationResults) || !value.verificationResults.every(isVerificationResult)
    || !isRecord(value.boundaryEvidence)
    || typeof value.boundaryEvidence.unlistedCommandsExecuted !== 'boolean'
    || typeof value.boundaryEvidence.blockedActionsPreserved !== 'boolean'
    || typeof value.boundaryEvidence.targetRepoMutationByRepoAssure !== 'boolean'
    || !canonicalTextValue(value.redactionBoundary)) throw invalidEvidence();

  const actionKeys = value.actionResults.map((item) => (item as { actionKey: string }).actionKey);
  const commandIds = value.resumeCommandResults.map((item) => (item as { commandId: string }).commandId);
  const checkIds = value.verificationResults.map((item) => (item as { checkId: string }).checkId);
  const allowedActionKeys = new Set(taskPackage.actionTasks.map((item) => item.actionKey));
  const allowedCommandIds = new Set(taskPackage.resumeCommandTasks.map((item) => item.commandId));
  if (!unique(actionKeys) || !unique(commandIds) || !unique(checkIds)
    || actionKeys.some((item) => !allowedActionKeys.has(item))
    || commandIds.some((item) => !allowedCommandIds.has(item))) throw invalidEvidence();
}

function assertTaskPackage(value: unknown): asserts value is BlockedGoalRecoveryResumeAttemptTaskPackage {
  if (!isRecord(value)
    || value.schemaVersion !== 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1'
    || !canonicalTextValue(value.generatedAt)
    || (value.taskPackageStatus !== 'ready_for_separate_resume_attempt'
      && value.taskPackageStatus !== 'ready_with_accepted_risk'
      && value.taskPackageStatus !== 'blocked_by_decision_receipt')
    || !isRecord(value.sourceDecisionReceipt) || !/^[a-f0-9]{64}$/u.test(String(value.sourceDecisionReceipt.sha256))
    || !Array.isArray(value.blockedReasons) || !value.blockedReasons.every(canonicalTextValue)
    || !Array.isArray(value.actionTasks) || !value.actionTasks.every(isActionTask)
    || !Array.isArray(value.resumeCommandTasks) || !value.resumeCommandTasks.every(isCommandTask)
    || !Array.isArray(value.prerequisites) || !value.prerequisites.every(canonicalTextValue)
    || !Array.isArray(value.verificationChecklist) || !value.verificationChecklist.every(canonicalTextValue)
    || !Array.isArray(value.excludedItems) || !value.excludedItems.every(canonicalTextValue)
    || !isRecord(value.boundaryCompliance) || value.boundaryCompliance.commandsExecuted !== false
    || typeof value.boundaryCompliance.sourceBoundaryPreserved !== 'boolean'
    || !canonicalTextValue(value.maintainerReviewBoundary) || !canonicalTextValue(value.redactionBoundary)
    || !canonicalTextValue(value.nonAuthorizationBoundary)
    || !Array.isArray(value.blockedActions) || !hasCanonicalBlockedActions(value.blockedActions)) throw invalidTaskPackage();

  const taskPackage = value as unknown as BlockedGoalRecoveryResumeAttemptTaskPackage;
  if (!unique(taskPackage.actionTasks.map((item) => item.actionKey))
    || !unique(taskPackage.resumeCommandTasks.map((item) => item.commandId))
    || taskPackage.actionTasks.some((item, index) => item.order !== index + 1)
    || taskPackage.resumeCommandTasks.some((item, index) => item.order !== index + 1)
    || (taskPackage.taskPackageStatus === 'blocked_by_decision_receipt'
      ? taskPackage.actionTasks.length !== 0 || taskPackage.resumeCommandTasks.length !== 0 || taskPackage.blockedReasons.length === 0
      : taskPackage.blockedReasons.length !== 0 || taskPackage.resumeCommandTasks.length === 0)) throw invalidTaskPackage();
}

function isActionTask(value: unknown): boolean {
  return isRecord(value) && Number.isInteger(value.order) && canonicalIdentifier(value.actionKey)
    && canonicalIdentifier(value.blockerId) && canonicalTextValue(value.actionType)
    && canonicalTextValue(value.instruction) && canonicalTextValue(value.context)
    && (value.sourceDecision === 'approve' || value.sourceDecision === 'accept_risk')
    && canonicalTextValue(value.sourceEvidence) && value.executionMode === 'separate_reviewed_attempt';
}

function isCommandTask(value: unknown): boolean {
  return isRecord(value) && Number.isInteger(value.order) && canonicalIdentifier(value.commandId)
    && canonicalTextValue(value.command) && canonicalTextValue(value.purpose)
    && (value.sourceDecision === 'approve' || value.sourceDecision === 'accept_risk')
    && canonicalTextValue(value.sourceEvidence) && value.executionMode === 'separate_reviewed_attempt'
    && value.executed === false;
}

function isActionResult(value: unknown): boolean {
  return isResult(value) && canonicalIdentifier(value.actionKey);
}

function isCommandResult(value: unknown): boolean {
  return isResult(value) && canonicalIdentifier(value.commandId)
    && (value.exitCode === null || Number.isInteger(value.exitCode));
}

function isVerificationResult(value: unknown): boolean {
  return isResult(value) && canonicalIdentifier(value.checkId);
}

function isResult(value: unknown): value is Record<string, unknown> & BlockedGoalRecoveryResumeAttemptExecutionResultInput {
  return isRecord(value) && isResultStatus(value.status) && canonicalTextValue(value.summary)
    && Array.isArray(value.evidenceRefs) && value.evidenceRefs.every(canonicalPathValue);
}

function copyActionResult(item: BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput['actionResults'][number]) {
  return { ...item, evidenceRefs: [...item.evidenceRefs] };
}
function copyCommandResult(item: BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput['resumeCommandResults'][number]) {
  return { ...item, evidenceRefs: [...item.evidenceRefs] };
}
function copyVerificationResult(item: BlockedGoalRecoveryResumeAttemptExecutionEvidenceInput['verificationResults'][number]) {
  return { ...item, evidenceRefs: [...item.evidenceRefs] };
}

function isResultStatus(value: unknown): value is BlockedGoalRecoveryResumeAttemptEvidenceResultStatus {
  return value === 'passed' || value === 'failed' || value === 'blocked' || value === 'not_run';
}
function hasCanonicalBlockedActions(value: unknown[]): boolean {
  return value.length === BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.length
    && value.every((item) => typeof item === 'string')
    && BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.every((item) => value.includes(item));
}
function unique(values: string[]): boolean { return new Set(values).size === values.length; }
function canonicalIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && canonicalText(value) === value;
}
function canonicalTextValue(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && canonicalText(value) === value;
}
function canonicalPathValue(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && canonicalPath(value) === value;
}
function canonicalText(value: string): string { return redactSensitiveText(value).replace(/\s+/gu, ' ').trim(); }
function canonicalPath(value: string): string { return value.replaceAll('\\', '/').split('/').map(canonicalText).join('/'); }
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function invalidTaskPackage(): Error { return new Error('Invalid blocked goal recovery resume attempt task package'); }
function invalidEvidence(): Error { return new Error('Invalid blocked goal recovery resume attempt execution evidence'); }
