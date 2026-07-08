import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  AiIdeTargetRepoRepairGoalAuthorizationItem,
  AiIdeTargetRepoRepairGoalAuthorizationReceipt,
  AiIdeTargetRepoRepairGoalAuthorizationStatus
} from './ai-ide-target-repo-repair-goal-authorization-receipt.js';

export type AiIdeAuthorizedTargetRepoRepairGoalTaskPackageStatus =
  | 'ready_for_separate_target_repo_repair_goal'
  | 'blocked_or_incomplete';

export type AiIdeAuthorizedTargetRepoRepairGoalExecutionMode =
  'separate_authorized_target_repo_repair_goal';

export type AiIdeAuthorizedTargetRepoRepairGoalMutationPermission =
  'requires_separate_goal_runtime_confirmation';

export interface AiIdeAuthorizedTargetRepoRepairGoalTaskPackageInput {
  generatedAt?: string;
  authorizationReceiptPath: string;
  authorizationReceipt: AiIdeTargetRepoRepairGoalAuthorizationReceipt;
}

export interface WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageInput {
  generatedAt?: string;
  authorizationReceiptPath: string;
  outputDir: string;
}

export interface WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface AiIdeAuthorizedTargetRepoRepairGoalSourceAuthorizationReceipt {
  schemaVersion: string;
  fileName: string;
  path: string;
  sha256: string;
  authorizationStatus: AiIdeTargetRepoRepairGoalAuthorizationStatus;
  approvedTargetRepairGoalScopes: number;
}

export interface AiIdeAuthorizedTargetRepoRepairGoalTask {
  goalId: string;
  scopeId: string;
  executionMode: AiIdeAuthorizedTargetRepoRepairGoalExecutionMode;
  targetRepoMutationPermission: AiIdeAuthorizedTargetRepoRepairGoalMutationPermission;
  approverRole: string;
  approvalEvidence: string;
  repairGoalInstructions: string[];
  verificationRequirements: string[];
  completionEvidence: string[];
}

export interface AiIdeAuthorizedTargetRepoRepairGoalExcludedItem {
  scopeId: string;
  decision: AiIdeTargetRepoRepairGoalAuthorizationItem['decision'];
  reason: string;
  nextAction: string;
}

export interface AiIdeAuthorizedTargetRepoRepairGoalTaskPackage {
  schemaVersion: 'repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1';
  generatedAt: string;
  taskPackageStatus: AiIdeAuthorizedTargetRepoRepairGoalTaskPackageStatus;
  sourceAuthorizationReceipt: AiIdeAuthorizedTargetRepoRepairGoalSourceAuthorizationReceipt;
  approvedRepairGoals: AiIdeAuthorizedTargetRepoRepairGoalTask[];
  excludedAuthorizationItems: AiIdeAuthorizedTargetRepoRepairGoalExcludedItem[];
  verificationChecklist: string[];
  maintainerReviewBoundary: string;
  nonAuthorizationBoundary: string;
  redactionBoundary: string;
  blockedActions: string[];
}

export interface WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageResult {
  jsonPath: string;
  markdownPath: string;
  taskPackage: AiIdeAuthorizedTargetRepoRepairGoalTaskPackage;
}

const AUTHORIZATION_RECEIPT_JSON_NAME = 'ai-ide-target-repo-repair-goal-authorization-receipt.json';
const TASK_PACKAGE_JSON_NAME = 'ai-ide-authorized-target-repo-repair-goal-task-package.json';
const TASK_PACKAGE_MARKDOWN_NAME = 'ai-ide-authorized-target-repo-repair-goal-task-package.md';

const NON_AUTHORIZATION_BLOCKED_ACTIONS = [
  'target_repo_file_mutation',
  'target_repo_branch_creation',
  'target_repo_commit_creation',
  'target_repo_pull_request_creation',
  'target_repo_issue_creation',
  'target_repo_advisory_creation',
  'npm_publish',
  'github_release',
  'public_launch',
  'customer_contact',
  'commercial_availability_claim',
  'hosted_dashboard_availability_claim'
] as const;

export function buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackage(
  input: AiIdeAuthorizedTargetRepoRepairGoalTaskPackageInput
): AiIdeAuthorizedTargetRepoRepairGoalTaskPackage {
  const authorizationReceiptJson = JSON.stringify(input.authorizationReceipt);
  const approvedRepairGoals = input.authorizationReceipt.approvedScope
    .filter((item) => item.authorizedForSeparateTargetRepoRepairGoal)
    .map(buildApprovedRepairGoal);
  const excludedAuthorizationItems = [
    ...input.authorizationReceipt.rejectedItems,
    ...input.authorizationReceipt.deferredItems,
    ...input.authorizationReceipt.riskAcceptedItems
  ].map(buildExcludedAuthorizationItem);
  const blockedActions = [
    ...new Set([...input.authorizationReceipt.blockedActions, ...NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize))
  ];

  return {
    schemaVersion: 'repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    taskPackageStatus: approvedRepairGoals.length > 0
      ? 'ready_for_separate_target_repo_repair_goal'
      : 'blocked_or_incomplete',
    sourceAuthorizationReceipt: {
      schemaVersion: sanitize(input.authorizationReceipt.schemaVersion),
      fileName: sanitize(basename(input.authorizationReceiptPath)),
      path: sanitizePath(input.authorizationReceiptPath),
      sha256: createHash('sha256').update(authorizationReceiptJson).digest('hex'),
      authorizationStatus: input.authorizationReceipt.authorizationStatus,
      approvedTargetRepairGoalScopes: input.authorizationReceipt.decisionSummary.approvedTargetRepairGoalScopes
    },
    approvedRepairGoals,
    excludedAuthorizationItems,
    verificationChecklist: buildVerificationChecklist(input.authorizationReceipt, approvedRepairGoals),
    maintainerReviewBoundary: sanitize(
      'The separate target repo repair goal must return repair evidence for maintainer review before acceptance.'
    ),
    nonAuthorizationBoundary: sanitize(
      'This task package does not execute target repo file mutation, branch creation, commits, pull requests, issues, advisories, releases, publication, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.'
    ),
    redactionBoundary: sanitize(
      'Use sanitized local summaries only; never store secrets, raw private source, reviewer PII, credentials, cookies, tokens, customer data, or unredacted local artifact paths.'
    ),
    blockedActions
  };
}

export async function writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackage(
  input: WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageInput
): Promise<WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageResult> {
  const authorizationReceipt = JSON.parse(
    await readFile(input.authorizationReceiptPath, 'utf8')
  ) as AiIdeTargetRepoRepairGoalAuthorizationReceipt;
  const taskPackage = buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    authorizationReceiptPath: input.authorizationReceiptPath,
    authorizationReceipt
  });
  const jsonPath = join(input.outputDir, TASK_PACKAGE_JSON_NAME);
  const markdownPath = join(input.outputDir, TASK_PACKAGE_MARKDOWN_NAME);

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(taskPackage, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackageMarkdown(taskPackage));

  return { jsonPath, markdownPath, taskPackage };
}

export async function writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectory(
  input: WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageFromDirectoryInput
): Promise<WriteAiIdeAuthorizedTargetRepoRepairGoalTaskPackageResult> {
  return writeAiIdeAuthorizedTargetRepoRepairGoalTaskPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    authorizationReceiptPath: join(input.inputDir, AUTHORIZATION_RECEIPT_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildAiIdeAuthorizedTargetRepoRepairGoalTaskPackageMarkdown(
  taskPackage: AiIdeAuthorizedTargetRepoRepairGoalTaskPackage
): string {
  return [
    '# RepoAssure AI IDE Authorized Target Repo Repair Goal Task Package',
    '',
    `Generated at: ${taskPackage.generatedAt}`,
    `Task package status: ${taskPackage.taskPackageStatus}`,
    '',
    '## Source Authorization Receipt',
    '',
    `- fileName: ${taskPackage.sourceAuthorizationReceipt.fileName}`,
    `- schemaVersion: ${taskPackage.sourceAuthorizationReceipt.schemaVersion}`,
    `- authorizationStatus: ${taskPackage.sourceAuthorizationReceipt.authorizationStatus}`,
    `- approvedTargetRepairGoalScopes: ${taskPackage.sourceAuthorizationReceipt.approvedTargetRepairGoalScopes}`,
    `- sha256: ${taskPackage.sourceAuthorizationReceipt.sha256}`,
    '',
    '## Approved Repair Goals',
    '',
    '| Goal | Scope | Execution mode | Mutation permission |',
    '| --- | --- | --- | --- |',
    ...taskPackage.approvedRepairGoals.map((goal) => `| ${[
      goal.goalId,
      goal.scopeId,
      goal.executionMode,
      goal.targetRepoMutationPermission
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(taskPackage.approvedRepairGoals.length === 0 ? ['| n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Excluded Authorization Items',
    '',
    '| Scope | Decision | Reason | Next action |',
    '| --- | --- | --- | --- |',
    ...taskPackage.excludedAuthorizationItems.map((item) => `| ${[
      item.scopeId,
      item.decision,
      item.reason,
      item.nextAction
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(taskPackage.excludedAuthorizationItems.length === 0 ? ['| n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Verification Checklist',
    '',
    ...taskPackage.verificationChecklist.map((item) => `- ${item}`),
    '',
    '## Maintainer Review Boundary',
    '',
    taskPackage.maintainerReviewBoundary,
    '',
    '## Non-Authorization Boundary',
    '',
    taskPackage.nonAuthorizationBoundary,
    '',
    '## Blocked Actions',
    '',
    ...taskPackage.blockedActions.map((action) => `- ${action}`),
    '',
    '## Redaction Boundary',
    '',
    taskPackage.redactionBoundary,
    ''
  ].join('\n');
}

function buildApprovedRepairGoal(
  item: AiIdeTargetRepoRepairGoalAuthorizationItem
): AiIdeAuthorizedTargetRepoRepairGoalTask {
  return {
    goalId: sanitize(`target-repo-repair-goal-${item.scopeId}`),
    scopeId: sanitize(item.scopeId),
    executionMode: 'separate_authorized_target_repo_repair_goal',
    targetRepoMutationPermission: 'requires_separate_goal_runtime_confirmation',
    approverRole: sanitize(item.approverRole),
    approvalEvidence: sanitize(item.evidence),
    repairGoalInstructions: [
      'Read the source authorization receipt before opening the target repo repair goal.',
      'Open or use an isolated target repo worktree only inside the separate authorized repair goal.',
      'Apply only maintainer-approved changes for this scope.',
      'Do not execute rejected, deferred, or risk-accepted authorization items as repairs.',
      'Return verification results and repair evidence for maintainer review.'
    ].map(sanitize),
    verificationRequirements: item.verificationRequirements.map(sanitize),
    completionEvidence: [
      'Target repo diff summary',
      'Verification command results',
      'Maintainer review summary',
      'Regenerated RepoAssure evidence artifacts when applicable'
    ].map(sanitize)
  };
}

function buildExcludedAuthorizationItem(
  item: AiIdeTargetRepoRepairGoalAuthorizationItem
): AiIdeAuthorizedTargetRepoRepairGoalExcludedItem {
  return {
    scopeId: sanitize(item.scopeId),
    decision: item.decision,
    reason: sanitize(item.evidence),
    nextAction: sanitize(item.nextAction)
  };
}

function buildVerificationChecklist(
  authorizationReceipt: AiIdeTargetRepoRepairGoalAuthorizationReceipt,
  approvedRepairGoals: AiIdeAuthorizedTargetRepoRepairGoalTask[]
): string[] {
  if (approvedRepairGoals.length === 0) {
    return [
      'Collect an approved authorization receipt before opening a target repo repair goal.',
      'Do not mutate target repo files from a blocked or incomplete task package.'
    ].map(sanitize);
  }

  return [
    ...new Set([
      ...approvedRepairGoals.flatMap((goal) => goal.verificationRequirements),
      ...authorizationReceipt.verificationRequirements,
      'Run maintainer-provided target repo verification commands after the separately authorized repair goal changes.',
      'Regenerate RepoAssure evidence artifacts after any separately authorized target repo repair goal.',
      'Return repair evidence for maintainer review before acceptance.'
    ].map(sanitize))
  ];
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
