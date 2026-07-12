import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type BlockedGoalBlockerCategory =
  | 'environment'
  | 'external_service'
  | 'authorization_required'
  | 'maintainer_decision_required'
  | 'technical_unknown'
  | 'test_instability'
  | 'security_or_compliance'
  | 'product_scope';

export type BlockedGoalBlockerStatus =
  | 'blocked'
  | 'incomplete'
  | 'deferred'
  | 'retryable';

export type BlockedGoalRecoveryStatus =
  | 'ready_to_resume'
  | 'retryable_with_automatic_actions'
  | 'requires_maintainer_or_external_action';

export interface BlockedGoalSourceGoalInput {
  title: string;
  status: string;
  objective: string;
  evidenceRefs?: string[];
}

export interface BlockedGoalSourceAuditInput {
  path: string;
  status: string;
  summary: string;
}

export interface BlockedGoalSourceLogInput {
  path: string;
  summary: string;
}

export interface BlockedGoalAutomaticRecoveryActionInput {
  actionId: string;
  command: string;
  rationale: string;
}

export interface BlockedGoalMaintainerDecisionRequestInput {
  requestedDecision: string;
  options: string[];
}

export interface BlockedGoalExternalPrerequisiteInput {
  prerequisite: string;
  owner: string;
}

export interface BlockedGoalResumeCommandInput {
  command: string;
  purpose: string;
}

export interface BlockedGoalBlockerInput {
  blockerId: string;
  category: BlockedGoalBlockerCategory;
  status: BlockedGoalBlockerStatus;
  summary: string;
  attemptedActions?: string[];
  evidenceRefs?: string[];
  automaticRecoveryActions?: BlockedGoalAutomaticRecoveryActionInput[];
  maintainerDecisionRequests?: BlockedGoalMaintainerDecisionRequestInput[];
  externalPrerequisites?: BlockedGoalExternalPrerequisiteInput[];
}

export interface BlockedGoalRecoveryInput {
  sourceGoal: BlockedGoalSourceGoalInput;
  sourceAudit?: BlockedGoalSourceAuditInput;
  sourceLogs?: BlockedGoalSourceLogInput[];
  blockers?: BlockedGoalBlockerInput[];
  resumeCommands?: BlockedGoalResumeCommandInput[];
  redactionBoundary: string;
}

export interface BuildBlockedGoalRecoveryPackageInput {
  generatedAt?: string;
  inputPath: string;
  input: BlockedGoalRecoveryInput;
}

export interface WriteBlockedGoalRecoveryPackageInput {
  generatedAt?: string;
  inputPath: string;
  outputDir: string;
}

export interface WriteBlockedGoalRecoveryPackageFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface BlockedGoalInputProvenance {
  fileName: string;
  path: string;
  sha256: string;
}

export interface BlockedGoalSourceProvenance {
  input: BlockedGoalInputProvenance;
  sourceGoal: BlockedGoalSourceGoalInput;
  sourceAudit?: BlockedGoalSourceAuditInput;
  sourceLogs: BlockedGoalSourceLogInput[];
}

export interface BlockedGoalBlockerSummary {
  totalBlockers: number;
  blocked: number;
  incomplete: number;
  deferred: number;
  retryable: number;
  automaticRecoveryActions: number;
  maintainerDecisionRequests: number;
  externalPrerequisites: number;
}

export interface BlockedGoalAutomaticRecoveryAction {
  blockerId: string;
  actionId: string;
  command: string;
  rationale: string;
}

export interface BlockedGoalMaintainerDecisionRequest {
  blockerId: string;
  requestedDecision: string;
  options: string[];
}

export interface BlockedGoalExternalPrerequisite {
  blockerId: string;
  prerequisite: string;
  owner: string;
}

export interface BlockedGoalResumeCommand {
  command: string;
  purpose: string;
}

export interface BlockedGoalBlocker {
  blockerId: string;
  category: BlockedGoalBlockerCategory;
  status: BlockedGoalBlockerStatus;
  summary: string;
  attemptedActions: string[];
  evidenceRefs: string[];
  automaticRecoveryActions: BlockedGoalAutomaticRecoveryAction[];
  maintainerDecisionRequests: BlockedGoalMaintainerDecisionRequest[];
  externalPrerequisites: BlockedGoalExternalPrerequisite[];
}

export interface BlockedGoalRecoveryPackage {
  schemaVersion: 'repoassure.blocked-goal-recovery-package.v1';
  generatedAt: string;
  recoveryStatus: BlockedGoalRecoveryStatus;
  sourceProvenance: BlockedGoalSourceProvenance;
  blockerSummary: BlockedGoalBlockerSummary;
  blockers: BlockedGoalBlocker[];
  automaticRecoveryActions: BlockedGoalAutomaticRecoveryAction[];
  maintainerDecisionRequests: BlockedGoalMaintainerDecisionRequest[];
  externalPrerequisites: BlockedGoalExternalPrerequisite[];
  resumeCommands: BlockedGoalResumeCommand[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteBlockedGoalRecoveryPackageResult {
  jsonPath: string;
  markdownPath: string;
  recoveryPackage: BlockedGoalRecoveryPackage;
}

const RECOVERY_INPUT_JSON_NAME = 'blocked-goal-recovery-input.json';
const RECOVERY_PACKAGE_JSON_NAME = 'blocked-goal-recovery-package.json';
const RECOVERY_PACKAGE_MARKDOWN_NAME = 'blocked-goal-recovery-package.md';

const NON_AUTHORIZATION_BLOCKED_ACTIONS = [
  'target_repo_file_mutation_by_repoassure',
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

export function buildBlockedGoalRecoveryPackage(
  input: BuildBlockedGoalRecoveryPackageInput
): BlockedGoalRecoveryPackage {
  const inputJson = JSON.stringify(input.input);
  const blockers = (input.input.blockers ?? []).map(normalizeBlocker);
  const automaticRecoveryActions = blockers.flatMap((blocker) => blocker.automaticRecoveryActions);
  const maintainerDecisionRequests = blockers.flatMap((blocker) => blocker.maintainerDecisionRequests);
  const externalPrerequisites = blockers.flatMap((blocker) => blocker.externalPrerequisites);
  const blockerSummary = buildBlockerSummary(
    blockers,
    automaticRecoveryActions,
    maintainerDecisionRequests,
    externalPrerequisites
  );

  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-package.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    recoveryStatus: resolveRecoveryStatus(blockers, maintainerDecisionRequests, externalPrerequisites),
    sourceProvenance: {
      input: {
        fileName: sanitize(basename(input.inputPath)),
        path: sanitizePath(input.inputPath),
        sha256: createHash('sha256').update(inputJson).digest('hex')
      },
      sourceGoal: {
        title: sanitize(input.input.sourceGoal.title),
        status: sanitize(input.input.sourceGoal.status),
        objective: sanitize(input.input.sourceGoal.objective),
        evidenceRefs: (input.input.sourceGoal.evidenceRefs ?? []).map(sanitizePath)
      },
      ...(input.input.sourceAudit
        ? {
          sourceAudit: {
            path: sanitizePath(input.input.sourceAudit.path),
            status: sanitize(input.input.sourceAudit.status),
            summary: sanitize(input.input.sourceAudit.summary)
          }
        }
        : {}),
      sourceLogs: (input.input.sourceLogs ?? []).map((log) => ({
        path: sanitizePath(log.path),
        summary: sanitize(log.summary)
      }))
    },
    blockerSummary,
    blockers,
    automaticRecoveryActions,
    maintainerDecisionRequests,
    externalPrerequisites,
    resumeCommands: normalizeResumeCommands(input.input.resumeCommands ?? []),
    maintainerReviewBoundary: sanitize(
      'This package records blocker recovery evidence and resume guidance for maintainer review; it does not decide or execute blocked goal recovery by itself.'
    ),
    redactionBoundary: sanitize(input.input.redactionBoundary),
    nonAuthorizationBoundary: sanitize(
      'This blocked goal recovery package does not modify target repo files, create target repo branch, commit, pull request, issue, advisory, publish npm, create GitHub release, run public launch, contact customers, authorize pricing/spend, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.'
    ),
    blockedActions: [...NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize)
  };
}

export async function writeBlockedGoalRecoveryPackage(
  input: WriteBlockedGoalRecoveryPackageInput
): Promise<WriteBlockedGoalRecoveryPackageResult> {
  const recoveryInput = JSON.parse(await readFile(input.inputPath, 'utf8')) as BlockedGoalRecoveryInput;
  const recoveryPackage = buildBlockedGoalRecoveryPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    inputPath: input.inputPath,
    input: recoveryInput
  });
  const jsonPath = join(input.outputDir, RECOVERY_PACKAGE_JSON_NAME);
  const markdownPath = join(input.outputDir, RECOVERY_PACKAGE_MARKDOWN_NAME);

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(recoveryPackage, null, 2)}\n`);
  await writeFile(markdownPath, buildBlockedGoalRecoveryPackageMarkdown(recoveryPackage));

  return { jsonPath, markdownPath, recoveryPackage };
}

export async function writeBlockedGoalRecoveryPackageFromDirectory(
  input: WriteBlockedGoalRecoveryPackageFromDirectoryInput
): Promise<WriteBlockedGoalRecoveryPackageResult> {
  return writeBlockedGoalRecoveryPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    inputPath: join(input.inputDir, RECOVERY_INPUT_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildBlockedGoalRecoveryPackageMarkdown(recoveryPackage: BlockedGoalRecoveryPackage): string {
  return [
    '# RepoAssure Blocked Goal Recovery Package',
    '',
    `Generated at: ${recoveryPackage.generatedAt}`,
    `Recovery status: ${recoveryPackage.recoveryStatus}`,
    '',
    '## Source Goal',
    '',
    `- title: ${recoveryPackage.sourceProvenance.sourceGoal.title}`,
    `- status: ${recoveryPackage.sourceProvenance.sourceGoal.status}`,
    `- objective: ${recoveryPackage.sourceProvenance.sourceGoal.objective}`,
    '',
    '## Blocker Summary',
    '',
    `- totalBlockers: ${recoveryPackage.blockerSummary.totalBlockers}`,
    `- blocked: ${recoveryPackage.blockerSummary.blocked}`,
    `- incomplete: ${recoveryPackage.blockerSummary.incomplete}`,
    `- deferred: ${recoveryPackage.blockerSummary.deferred}`,
    `- retryable: ${recoveryPackage.blockerSummary.retryable}`,
    `- automaticRecoveryActions: ${recoveryPackage.blockerSummary.automaticRecoveryActions}`,
    `- maintainerDecisionRequests: ${recoveryPackage.blockerSummary.maintainerDecisionRequests}`,
    `- externalPrerequisites: ${recoveryPackage.blockerSummary.externalPrerequisites}`,
    '',
    '## Blockers',
    '',
    '| Blocker | Category | Status | Summary | Evidence |',
    '| --- | --- | --- | --- | --- |',
    ...recoveryPackage.blockers.map((blocker) => `| ${[
      blocker.blockerId,
      blocker.category,
      blocker.status,
      blocker.summary,
      blocker.evidenceRefs.join('; ') || 'none'
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(recoveryPackage.blockers.length === 0 ? ['| none | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Automatic Recovery Actions',
    '',
    ...recoveryPackage.automaticRecoveryActions.map((action) => `- ${action.blockerId} / ${action.actionId}: \`${action.command}\` - ${action.rationale}`),
    ...(recoveryPackage.automaticRecoveryActions.length === 0 ? ['- none'] : []),
    '',
    '## Maintainer Decision Requests',
    '',
    ...recoveryPackage.maintainerDecisionRequests.map((request) => `- ${request.blockerId}: ${request.requestedDecision} (${request.options.join(', ')})`),
    ...(recoveryPackage.maintainerDecisionRequests.length === 0 ? ['- none'] : []),
    '',
    '## External Prerequisites',
    '',
    ...recoveryPackage.externalPrerequisites.map((item) => `- ${item.blockerId}: ${item.prerequisite} (owner: ${item.owner})`),
    ...(recoveryPackage.externalPrerequisites.length === 0 ? ['- none'] : []),
    '',
    '## Resume Commands',
    '',
    ...recoveryPackage.resumeCommands.map((command) => `- \`${command.command}\` - ${command.purpose}`),
    '',
    '## Maintainer Review Boundary',
    '',
    recoveryPackage.maintainerReviewBoundary,
    '',
    '## Non-Authorization Boundary',
    '',
    recoveryPackage.nonAuthorizationBoundary,
    '',
    '## Blocked Actions',
    '',
    ...recoveryPackage.blockedActions.map((action) => `- ${action}`),
    '',
    '## Redaction Boundary',
    '',
    recoveryPackage.redactionBoundary,
    ''
  ].join('\n');
}

function normalizeBlocker(input: BlockedGoalBlockerInput): BlockedGoalBlocker {
  const blockerId = sanitize(input.blockerId);

  return {
    blockerId,
    category: input.category,
    status: input.status,
    summary: sanitize(input.summary),
    attemptedActions: (input.attemptedActions ?? []).map(sanitize),
    evidenceRefs: (input.evidenceRefs ?? []).map(sanitizePath),
    automaticRecoveryActions: (input.automaticRecoveryActions ?? []).map((action) => ({
      blockerId,
      actionId: sanitize(action.actionId),
      command: sanitize(action.command),
      rationale: sanitize(action.rationale)
    })),
    maintainerDecisionRequests: (input.maintainerDecisionRequests ?? []).map((request) => ({
      blockerId,
      requestedDecision: sanitize(request.requestedDecision),
      options: request.options.map(sanitize)
    })),
    externalPrerequisites: (input.externalPrerequisites ?? []).map((item) => ({
      blockerId,
      prerequisite: sanitize(item.prerequisite),
      owner: sanitize(item.owner)
    }))
  };
}

function normalizeResumeCommands(commands: BlockedGoalResumeCommandInput[]): BlockedGoalResumeCommand[] {
  const normalized = commands.map((command) => ({
    command: sanitize(command.command),
    purpose: sanitize(command.purpose)
  }));

  return normalized.length > 0
    ? normalized
    : [{ command: 'codex resume goal', purpose: 'Resume the blocked Codex goal after blockers are resolved.' }];
}

function buildBlockerSummary(
  blockers: BlockedGoalBlocker[],
  automaticRecoveryActions: BlockedGoalAutomaticRecoveryAction[],
  maintainerDecisionRequests: BlockedGoalMaintainerDecisionRequest[],
  externalPrerequisites: BlockedGoalExternalPrerequisite[]
): BlockedGoalBlockerSummary {
  return {
    totalBlockers: blockers.length,
    blocked: countStatus(blockers, 'blocked'),
    incomplete: countStatus(blockers, 'incomplete'),
    deferred: countStatus(blockers, 'deferred'),
    retryable: countStatus(blockers, 'retryable'),
    automaticRecoveryActions: automaticRecoveryActions.length,
    maintainerDecisionRequests: maintainerDecisionRequests.length,
    externalPrerequisites: externalPrerequisites.length
  };
}

function resolveRecoveryStatus(
  blockers: BlockedGoalBlocker[],
  maintainerDecisionRequests: BlockedGoalMaintainerDecisionRequest[],
  externalPrerequisites: BlockedGoalExternalPrerequisite[]
): BlockedGoalRecoveryStatus {
  if (blockers.length === 0) {
    return 'ready_to_resume';
  }

  if (
    maintainerDecisionRequests.length === 0
    && externalPrerequisites.length === 0
    && blockers.every((blocker) => blocker.status === 'retryable' && blocker.automaticRecoveryActions.length > 0)
  ) {
    return 'retryable_with_automatic_actions';
  }

  return 'requires_maintainer_or_external_action';
}

function countStatus(blockers: BlockedGoalBlocker[], status: BlockedGoalBlockerStatus): number {
  return blockers.filter((blocker) => blocker.status === status).length;
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
