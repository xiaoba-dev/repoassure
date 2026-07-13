import { createHash, randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import { constants } from 'node:fs';
import { lstat, mkdir, open, realpath, rename, unlink } from 'node:fs/promises';
import { basename, dirname, join, sep } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

const MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES = 8 * 1024 * 1024;

interface RecoveryDirectoryIdentity {
  readonly path: string;
  readonly device: number;
  readonly inode: number;
}

const recoveryDirectoryGuards = new AsyncLocalStorage<readonly RecoveryDirectoryIdentity[]>();

export async function withBlockedGoalRecoveryDirectoryGuards<T>(
  paths: readonly string[],
  operation: () => Promise<T>
): Promise<T> {
  const identities = await Promise.all([...new Set(paths)].map(async (path): Promise<RecoveryDirectoryIdentity> => {
    const metadata = await lstat(path);
    if (!metadata.isDirectory()) throw new Error(`Blocked goal recovery path must be a directory: ${path}`);
    return { path, device: metadata.dev, inode: metadata.ino };
  }));
  return recoveryDirectoryGuards.run(identities, operation);
}

export async function readBlockedGoalRecoveryLocalArtifact(
  path: string,
  encoding: BufferEncoding = 'utf8'
): Promise<string> {
  const pathMetadata = await lstat(path);
  if (!pathMetadata.isFile()) throw new Error(`Blocked goal recovery input must be a regular file: ${basename(path)}`);
  if (pathMetadata.size > MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES) {
    throw new Error(`Blocked goal recovery input exceeds ${MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES} bytes`);
  }
  await assertRecoveryDirectoryIdentity(path);
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const metadata = await handle.stat();
    if (!metadata.isFile()) throw new Error(`Blocked goal recovery input must be a regular file: ${basename(path)}`);
    if (metadata.dev !== pathMetadata.dev || metadata.ino !== pathMetadata.ino) {
      throw new Error(`Blocked goal recovery input identity changed: ${basename(path)}`);
    }
    if (metadata.size > MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES) {
      throw new Error(`Blocked goal recovery input exceeds ${MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES} bytes`);
    }
    await assertRecoveryDirectoryIdentity(path);
    return await readBoundedRecoveryInput(handle, encoding);
  } finally {
    await handle.close();
  }
}

export async function writeBlockedGoalRecoveryLocalArtifact(path: string, content: string): Promise<void> {
  const temporaryPath = `${path}.tmp-${process.pid}-${randomUUID()}`;
  let handle;
  try {
    await assertRecoveryDirectoryIdentity(path);
    handle = await open(
      temporaryPath,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
      0o600
    );
    const temporaryMetadata = await handle.stat();
    const temporaryPathMetadata = await lstat(temporaryPath);
    if (
      temporaryMetadata.dev !== temporaryPathMetadata.dev
      || temporaryMetadata.ino !== temporaryPathMetadata.ino
    ) {
      throw new Error(`Blocked goal recovery output identity changed: ${basename(path)}`);
    }
    await assertRecoveryDirectoryIdentity(path);
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close();
    handle = undefined;
    await assertRecoveryDirectoryIdentity(path);
    await rename(temporaryPath, path);
    await assertRecoveryDirectoryIdentity(path);
  } catch (error) {
    await handle?.close().catch(() => undefined);
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function readBoundedRecoveryInput(
  handle: Awaited<ReturnType<typeof open>>,
  encoding: BufferEncoding
): Promise<string> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  while (totalBytes <= MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES) {
    const remaining = (MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES + 1) - totalBytes;
    const buffer = Buffer.allocUnsafe(Math.min(64 * 1024, remaining));
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
    if (bytesRead === 0) break;
    chunks.push(buffer.subarray(0, bytesRead));
    totalBytes += bytesRead;
  }
  if (totalBytes > MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES) {
    throw new Error(`Blocked goal recovery input exceeds ${MAX_BLOCKED_GOAL_RECOVERY_INPUT_BYTES} bytes`);
  }
  return Buffer.concat(chunks, totalBytes).toString(encoding);
}

async function assertRecoveryDirectoryIdentity(artifactPath: string): Promise<void> {
  const guards = recoveryDirectoryGuards.getStore();
  if (!guards?.length) return;
  const guard = [...guards]
    .sort((left, right) => right.path.length - left.path.length)
    .find(({ path }) => artifactPath === path || artifactPath.startsWith(`${path}${sep}`));
  if (!guard) throw new Error(`Blocked goal recovery artifact is outside guarded directories: ${artifactPath}`);

  const metadata = await lstat(guard.path);
  const artifactParent = await realpath(dirname(artifactPath));
  if (
    !metadata.isDirectory()
    || metadata.dev !== guard.device
    || metadata.ino !== guard.inode
    || (artifactParent !== guard.path && !artifactParent.startsWith(`${guard.path}${sep}`))
  ) {
    throw new Error(`Blocked goal recovery directory identity changed: ${guard.path}`);
  }
}

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
  actionId?: string;
  requestedDecision: string;
  options: string[];
}

export interface BlockedGoalExternalPrerequisiteInput {
  actionId?: string;
  prerequisite: string;
  owner: string;
}

export interface BlockedGoalResumeCommandInput {
  commandId?: string;
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
  includeDefaultResumeCommand?: boolean;
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
  actionId: string;
  requestedDecision: string;
  options: string[];
}

export interface BlockedGoalExternalPrerequisite {
  blockerId: string;
  actionId: string;
  prerequisite: string;
  owner: string;
}

export interface BlockedGoalResumeCommand {
  commandId: string;
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

export const BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS = [
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
  'pricing_change',
  'spend_authorization',
  'commercial_availability_claim',
  'hosted_dashboard_availability_claim'
] as const;

export const BLOCKED_GOAL_RECOVERY_MAINTAINER_REVIEW_BOUNDARY =
  'This package records blocker recovery evidence and resume guidance for maintainer review; it does not decide or execute blocked goal recovery by itself.';

export const BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BOUNDARY =
  'This blocked goal recovery package does not modify target repo files, create target repo branch, commit, pull request, issue, advisory, publish npm, create GitHub release, run public launch, contact customers, authorize pricing/spend, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.';

export function buildBlockedGoalRecoveryPackage(
  input: BuildBlockedGoalRecoveryPackageInput
): BlockedGoalRecoveryPackage {
  const inputJson = JSON.stringify(input.input);
  const blockers = (input.input.blockers ?? []).map(normalizeBlocker);
  const automaticRecoveryActions = blockers.flatMap((blocker) => blocker.automaticRecoveryActions);
  const maintainerDecisionRequests = blockers.flatMap((blocker) => blocker.maintainerDecisionRequests);
  const externalPrerequisites = blockers.flatMap((blocker) => blocker.externalPrerequisites);
  const resumeCommands = normalizeResumeCommands(
    input.input.resumeCommands ?? [],
    input.input.includeDefaultResumeCommand !== false
  );
  assertUniqueRecoveryIds(blockers, resumeCommands);
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
    resumeCommands,
    maintainerReviewBoundary: sanitize(BLOCKED_GOAL_RECOVERY_MAINTAINER_REVIEW_BOUNDARY),
    redactionBoundary: sanitize(input.input.redactionBoundary),
    nonAuthorizationBoundary: sanitize(BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BOUNDARY),
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize)
  };
}

export async function writeBlockedGoalRecoveryPackage(
  input: WriteBlockedGoalRecoveryPackageInput
): Promise<WriteBlockedGoalRecoveryPackageResult> {
  const recoveryInput = JSON.parse(
    await readBlockedGoalRecoveryLocalArtifact(input.inputPath, 'utf8')
  ) as BlockedGoalRecoveryInput;
  const recoveryPackage = buildBlockedGoalRecoveryPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    inputPath: input.inputPath,
    input: recoveryInput
  });
  const jsonPath = join(input.outputDir, RECOVERY_PACKAGE_JSON_NAME);
  const markdownPath = join(input.outputDir, RECOVERY_PACKAGE_MARKDOWN_NAME);

  await mkdir(input.outputDir, { recursive: true });
  await writeBlockedGoalRecoveryLocalArtifact(jsonPath, `${JSON.stringify(recoveryPackage, null, 2)}\n`);
  await writeBlockedGoalRecoveryLocalArtifact(markdownPath, buildBlockedGoalRecoveryPackageMarkdown(recoveryPackage));

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
      actionId: normalizeOpaqueId('automatic', action.actionId, [input.blockerId, action.command, action.rationale]),
      command: sanitize(action.command),
      rationale: sanitize(action.rationale)
    })),
    maintainerDecisionRequests: (input.maintainerDecisionRequests ?? []).map((request) => ({
      blockerId,
      actionId: normalizeOpaqueId('maintainer', request.actionId, [
        input.blockerId,
        request.requestedDecision,
        ...request.options
      ]),
      requestedDecision: sanitize(request.requestedDecision),
      options: request.options.map(sanitize)
    })),
    externalPrerequisites: (input.externalPrerequisites ?? []).map((item) => ({
      blockerId,
      actionId: normalizeOpaqueId('external', item.actionId, [input.blockerId, item.prerequisite, item.owner]),
      prerequisite: sanitize(item.prerequisite),
      owner: sanitize(item.owner)
    }))
  };
}

function normalizeResumeCommands(
  commands: BlockedGoalResumeCommandInput[],
  includeDefaultResumeCommand: boolean
): BlockedGoalResumeCommand[] {
  const normalized = commands.map((command) => ({
    commandId: normalizeOpaqueId('resume', command.commandId, [command.command, command.purpose]),
    command: sanitize(command.command),
    purpose: sanitize(command.purpose)
  }));

  if (normalized.length > 0 || !includeDefaultResumeCommand) return normalized;

  return [{
    commandId: normalizeOpaqueId('resume', undefined, [
      'codex resume goal',
      'Resume the blocked Codex goal after blockers are resolved.'
    ]),
    command: 'codex resume goal',
    purpose: 'Resume the blocked Codex goal after blockers are resolved.'
  }];
}

function assertUniqueRecoveryIds(
  blockers: BlockedGoalBlocker[],
  resumeCommands: BlockedGoalResumeCommand[]
): void {
  const actionKeys = blockers.flatMap((blocker) => [
    ...blocker.automaticRecoveryActions.map((item) => `automatic:${blocker.blockerId}:${item.actionId}`),
    ...blocker.maintainerDecisionRequests.map((item) => `maintainer:${blocker.blockerId}:${item.actionId}`),
    ...blocker.externalPrerequisites.map((item) => `external:${blocker.blockerId}:${item.actionId}`)
  ]);
  const commandIds = resumeCommands.map((item) => item.commandId);
  if (new Set(actionKeys).size !== actionKeys.length || new Set(commandIds).size !== commandIds.length) {
    throw new Error('Invalid blocked goal recovery input: duplicate action or command IDs');
  }
}

function normalizeOpaqueId(kind: string, explicitId: string | undefined, stableParts: string[]): string {
  if (explicitId && /^[A-Za-z0-9._-]+$/u.test(explicitId) && sanitize(explicitId) === explicitId) {
    return explicitId;
  }
  return `${kind}-${createHash('sha256').update(JSON.stringify([explicitId ?? '', ...stableParts])).digest('hex').slice(0, 16)}`;
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
