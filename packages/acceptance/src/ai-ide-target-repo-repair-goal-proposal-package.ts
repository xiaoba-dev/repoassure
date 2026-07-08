import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  AiIdeRepairExecutionReplayReadinessReport,
  AiIdeRepairExecutionReplayReadinessStatus
} from './ai-ide-repair-execution-replay-readiness.js';

export type AiIdeTargetRepoRepairGoalProposalReadiness =
  | 'ready_for_maintainer_goal_authorization'
  | 'blocked_or_incomplete'
  | 'manual_review_required';

export type AiIdeTargetRepoRepairGoalProposalAuthorizationStatus =
  | 'requires_maintainer_authorization'
  | 'blocked_until_maintainer_authorization';

export interface AiIdeTargetRepoRepairGoalProposalPackageInput {
  generatedAt?: string;
  replayReadinessPath: string;
  replayReadiness: AiIdeRepairExecutionReplayReadinessReport;
}

export interface WriteAiIdeTargetRepoRepairGoalProposalPackageInput {
  generatedAt?: string;
  replayReadinessPath: string;
  outputDir: string;
}

export interface WriteAiIdeTargetRepoRepairGoalProposalPackageFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface AiIdeTargetRepoRepairGoalProposalSourceReplayReadiness {
  schemaVersion: string;
  fileName: string;
  path: string;
  sha256: string;
  replayReadiness: AiIdeRepairExecutionReplayReadinessStatus;
  nextReviewDecision: string;
}

export interface AiIdeTargetRepoRepairGoalProposalReadOrderItem {
  step: number;
  fileName: string;
  artifactKind: string;
  requiredBeforeTargetRepairGoal: boolean;
  instruction: string;
}

export interface AiIdeTargetRepoRepairAllowedScope {
  scopeId: 'target_repo_manual_repair_goal';
  authorizationStatus: AiIdeTargetRepoRepairGoalProposalAuthorizationStatus;
  allowedActions: string[];
  prohibitedActions: string[];
}

export interface AiIdeTargetRepoRepairGoalProposalTask {
  taskId: string;
  title: string;
  authorizationStatus: AiIdeTargetRepoRepairGoalProposalAuthorizationStatus;
  requiredInputs: string[];
  completionEvidence: string[];
}

export interface AiIdeTargetRepoRepairGoalProposalVerificationCommand {
  command: string;
  executionMode: 'proposed_not_executed';
  requiredBeforeMaintainerAcceptance: boolean;
  source: 'maintainer_provided';
}

export interface AiIdeTargetRepoRepairGoalProposalPackage {
  schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1';
  generatedAt: string;
  proposalReadiness: AiIdeTargetRepoRepairGoalProposalReadiness;
  sourceReplayReadiness: AiIdeTargetRepoRepairGoalProposalSourceReplayReadiness;
  prerequisites: string[];
  artifactReadOrder: AiIdeTargetRepoRepairGoalProposalReadOrderItem[];
  allowedRepairScope: AiIdeTargetRepoRepairAllowedScope[];
  repairTaskBreakdown: AiIdeTargetRepoRepairGoalProposalTask[];
  verificationCommands: AiIdeTargetRepoRepairGoalProposalVerificationCommand[];
  maintainerApprovalBoundary: string;
  nonAuthorizationBoundary: string;
  redactionBoundary: string;
  blockedActions: string[];
}

export interface WriteAiIdeTargetRepoRepairGoalProposalPackageResult {
  jsonPath: string;
  markdownPath: string;
  package: AiIdeTargetRepoRepairGoalProposalPackage;
}

const PACKAGE_JSON_NAME = 'ai-ide-target-repo-repair-goal-proposal-package.json';
const PACKAGE_MARKDOWN_NAME = 'ai-ide-target-repo-repair-goal-proposal-package.md';
const REPLAY_READINESS_NAME = 'ai-ide-repair-execution-replay-readiness.json';

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

export function buildAiIdeTargetRepoRepairGoalProposalPackage(
  input: AiIdeTargetRepoRepairGoalProposalPackageInput
): AiIdeTargetRepoRepairGoalProposalPackage {
  const replayJson = JSON.stringify(input.replayReadiness);
  const proposalReadiness = classifyProposalReadiness(input.replayReadiness);
  const authorizationStatus = buildAuthorizationStatus(proposalReadiness);
  const blockedActions = [
    ...new Set([...input.replayReadiness.blockedActions, ...NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize))
  ];

  return {
    schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    proposalReadiness,
    sourceReplayReadiness: {
      schemaVersion: sanitize(input.replayReadiness.schemaVersion),
      fileName: sanitize(basename(input.replayReadinessPath)),
      path: sanitize(input.replayReadinessPath),
      sha256: createHash('sha256').update(replayJson).digest('hex'),
      replayReadiness: input.replayReadiness.replayReadiness,
      nextReviewDecision: sanitize(input.replayReadiness.nextReviewDecision.decision)
    },
    prerequisites: buildPrerequisites(),
    artifactReadOrder: buildArtifactReadOrder(input.replayReadiness),
    allowedRepairScope: [
      {
        scopeId: 'target_repo_manual_repair_goal',
        authorizationStatus,
        allowedActions: [
          'Read local RepoAssure evidence artifacts in order.',
          'Draft a separate target repo repair goal for maintainer approval.',
          'Use an isolated target repo worktree only after maintainer authorization.',
          'Run maintainer-provided verification commands after authorized repair work.'
        ].map(sanitize),
        prohibitedActions: blockedActions
      }
    ],
    repairTaskBreakdown: buildRepairTaskBreakdown(authorizationStatus),
    verificationCommands: [
      {
        command: '<maintainer-provided target repo verification command>',
        executionMode: 'proposed_not_executed',
        requiredBeforeMaintainerAcceptance: true,
        source: 'maintainer_provided'
      }
    ],
    maintainerApprovalBoundary: sanitize(
      'This package requires separate maintainer approval before any target repo repair goal execution.'
    ),
    nonAuthorizationBoundary: sanitize(
      'This package does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, releases, publication, public launch, customer contact, pricing/spend, commercial availability claims, or hosted dashboard availability claims.'
    ),
    redactionBoundary: sanitize(
      'Use sanitized summaries only; never store secrets, raw private source, reviewer PII, credentials, cookies, tokens, customer data, or unredacted local artifact paths.'
    ),
    blockedActions
  };
}

export async function writeAiIdeTargetRepoRepairGoalProposalPackage(
  input: WriteAiIdeTargetRepoRepairGoalProposalPackageInput
): Promise<WriteAiIdeTargetRepoRepairGoalProposalPackageResult> {
  const replayReadiness = JSON.parse(
    await readFile(input.replayReadinessPath, 'utf8')
  ) as AiIdeRepairExecutionReplayReadinessReport;
  const proposalPackage = buildAiIdeTargetRepoRepairGoalProposalPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    replayReadinessPath: input.replayReadinessPath,
    replayReadiness
  });
  const jsonPath = join(input.outputDir, PACKAGE_JSON_NAME);
  const markdownPath = join(input.outputDir, PACKAGE_MARKDOWN_NAME);

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(proposalPackage, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeTargetRepoRepairGoalProposalPackageMarkdown(proposalPackage));

  return { jsonPath, markdownPath, package: proposalPackage };
}

export async function writeAiIdeTargetRepoRepairGoalProposalPackageFromDirectory(
  input: WriteAiIdeTargetRepoRepairGoalProposalPackageFromDirectoryInput
): Promise<WriteAiIdeTargetRepoRepairGoalProposalPackageResult> {
  return writeAiIdeTargetRepoRepairGoalProposalPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    replayReadinessPath: join(input.inputDir, REPLAY_READINESS_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildAiIdeTargetRepoRepairGoalProposalPackageMarkdown(
  proposalPackage: AiIdeTargetRepoRepairGoalProposalPackage
): string {
  return [
    '# RepoAssure AI IDE Target Repo Repair Goal Proposal Package',
    '',
    `Generated at: ${proposalPackage.generatedAt}`,
    `Proposal readiness: ${proposalPackage.proposalReadiness}`,
    '',
    '## Source Replay Readiness',
    '',
    `- fileName: ${proposalPackage.sourceReplayReadiness.fileName}`,
    `- schemaVersion: ${proposalPackage.sourceReplayReadiness.schemaVersion}`,
    `- replayReadiness: ${proposalPackage.sourceReplayReadiness.replayReadiness}`,
    `- nextReviewDecision: ${proposalPackage.sourceReplayReadiness.nextReviewDecision}`,
    '',
    '## Prerequisites',
    '',
    ...proposalPackage.prerequisites.map((item) => `- ${item}`),
    '',
    '## Artifact Read Order',
    '',
    '| Step | Artifact | Required | Instruction |',
    '| --- | --- | --- | --- |',
    ...proposalPackage.artifactReadOrder.map((item) => `| ${[
      String(item.step),
      item.fileName,
      String(item.requiredBeforeTargetRepairGoal),
      item.instruction
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    '',
    '## Allowed Repair Scope',
    '',
    ...proposalPackage.allowedRepairScope.map((scope) => [
      `- scopeId: ${scope.scopeId}`,
      `  authorizationStatus: ${scope.authorizationStatus}`
    ].join('\n')),
    '',
    '## Repair Task Breakdown',
    '',
    '| Task | Title | Authorization |',
    '| --- | --- | --- |',
    ...proposalPackage.repairTaskBreakdown.map((task) => `| ${[
      task.taskId,
      task.title,
      task.authorizationStatus
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    '',
    '## Verification Commands',
    '',
    ...proposalPackage.verificationCommands.map((command) => `- ${command.command} (${command.executionMode})`),
    '',
    '## Maintainer Approval Boundary',
    '',
    proposalPackage.maintainerApprovalBoundary,
    '',
    '## Non-Authorization Boundary',
    '',
    proposalPackage.nonAuthorizationBoundary,
    '',
    '## Blocked Actions',
    '',
    ...proposalPackage.blockedActions.map((item) => `- ${item}`),
    '',
    '## Redaction Boundary',
    '',
    proposalPackage.redactionBoundary,
    ''
  ].join('\n');
}

function classifyProposalReadiness(
  replayReadiness: AiIdeRepairExecutionReplayReadinessReport
): AiIdeTargetRepoRepairGoalProposalReadiness {
  if (replayReadiness.replayReadiness === 'blocked_or_incomplete') {
    return 'blocked_or_incomplete';
  }

  if (
    replayReadiness.replayReadiness === 'ready_for_maintainer_replay_review' &&
    replayReadiness.nextReviewDecision.decision === 'maintainer_review_ready' &&
    replayReadiness.boundaryReplay.blockedActionsEnforced &&
    replayReadiness.boundaryReplay.unauthorizedActions.length === 0
  ) {
    return 'ready_for_maintainer_goal_authorization';
  }

  return 'manual_review_required';
}

function buildAuthorizationStatus(
  proposalReadiness: AiIdeTargetRepoRepairGoalProposalReadiness
): AiIdeTargetRepoRepairGoalProposalAuthorizationStatus {
  return proposalReadiness === 'ready_for_maintainer_goal_authorization'
    ? 'requires_maintainer_authorization'
    : 'blocked_until_maintainer_authorization';
}

function buildPrerequisites(): string[] {
  return [
    'Maintainer reviews the replay readiness report before any target repo repair goal.',
    'Maintainer explicitly authorizes a separate target repo repair goal.',
    'AI IDE opens an isolated target repo worktree only after authorization.',
    'Maintainer provides or confirms target repo verification commands before acceptance.'
  ].map(sanitize);
}

function buildArtifactReadOrder(
  replayReadiness: AiIdeRepairExecutionReplayReadinessReport
): AiIdeTargetRepoRepairGoalProposalReadOrderItem[] {
  const replayArtifacts = replayReadiness.artifactReplay.map((item) => ({
    step: item.step,
    fileName: sanitize(item.fileName),
    artifactKind: sanitize(item.artifactKind),
    requiredBeforeTargetRepairGoal: true,
    instruction: sanitize(`Read ${item.fileName} before authorizing or executing any target repo repair goal.`)
  }));

  return [
    ...replayArtifacts,
    {
      step: replayArtifacts.length + 1,
      fileName: REPLAY_READINESS_NAME,
      artifactKind: 'ai_ide_repair_execution_replay_readiness',
      requiredBeforeTargetRepairGoal: true,
      instruction: 'Read replay readiness and confirm maintainer_review_ready before drafting the target repo repair goal.'
    }
  ];
}

function buildRepairTaskBreakdown(
  authorizationStatus: AiIdeTargetRepoRepairGoalProposalAuthorizationStatus
): AiIdeTargetRepoRepairGoalProposalTask[] {
  const taskSpecs = [
    ['T0-read-evidence-in-order', 'Read RepoAssure evidence artifacts in order.'],
    ['T1-open-isolated-target-worktree', 'Open an isolated target repo worktree after maintainer authorization.'],
    ['T2-apply-maintainer-approved-repair', 'Apply only maintainer-approved repair changes.'],
    ['T3-run-verification-commands', 'Run maintainer-provided verification commands.'],
    ['T4-return-maintainer-review-summary', 'Return repair evidence for maintainer review.']
  ] as const;

  return taskSpecs.map(([taskId, title]) => ({
    taskId,
    title: sanitize(title),
    authorizationStatus,
    requiredInputs: [
      'RepoAssure proposal package',
      'Maintainer target repo repair goal authorization',
      'Maintainer-provided verification commands'
    ].map(sanitize),
    completionEvidence: [
      'Read-order checklist',
      'Verification command results',
      'Maintainer review summary'
    ].map(sanitize)
  }));
}

function sanitize(value: string): string {
  return redactSensitiveText(value);
}
