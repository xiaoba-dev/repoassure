import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  AiIdeTargetRepoRepairGoalProposalPackage,
  AiIdeTargetRepoRepairGoalProposalReadiness
} from './ai-ide-target-repo-repair-goal-proposal-package.js';

export type AiIdeTargetRepoRepairGoalAuthorizationDecision =
  | 'approve'
  | 'reject'
  | 'defer'
  | 'accept_risk';

export type AiIdeTargetRepoRepairGoalAuthorizationStatus =
  | 'approved_for_separate_target_repo_repair_goal'
  | 'rejected'
  | 'deferred'
  | 'risk_accepted_no_repair'
  | 'mixed_decisions'
  | 'blocked_or_incomplete';

export interface AiIdeTargetRepoRepairGoalAuthorizationDecisionInput {
  scopeId: string;
  decision: AiIdeTargetRepoRepairGoalAuthorizationDecision;
  evidence: string;
  approverRole: string;
  verificationRequirements?: string[];
}

export interface AiIdeTargetRepoRepairGoalAuthorizationReceiptInput {
  generatedAt?: string;
  proposalPackagePath: string;
  proposalPackage: AiIdeTargetRepoRepairGoalProposalPackage;
  authorizationDecisions: AiIdeTargetRepoRepairGoalAuthorizationDecisionInput[];
}

export interface WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptInput {
  generatedAt?: string;
  proposalPackagePath: string;
  decisionsPath: string;
  outputDir: string;
}

export interface WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  decisionsPath: string;
  outputDir?: string;
}

export interface AiIdeTargetRepoRepairGoalAuthorizationSourceProposalPackage {
  schemaVersion: string;
  fileName: string;
  path: string;
  sha256: string;
  proposalReadiness: AiIdeTargetRepoRepairGoalProposalReadiness;
}

export interface AiIdeTargetRepoRepairGoalAuthorizationDecisionSummary {
  totalDecisionItems: number;
  approved: number;
  rejected: number;
  deferred: number;
  acceptedRisk: number;
  approvedTargetRepairGoalScopes: number;
}

export interface AiIdeTargetRepoRepairGoalAuthorizationItem {
  scopeId: string;
  decision: AiIdeTargetRepoRepairGoalAuthorizationDecision;
  evidence: string;
  approverRole: string;
  authorizedForSeparateTargetRepoRepairGoal: boolean;
  nextAction: string;
  verificationRequirements: string[];
}

export interface AiIdeTargetRepoRepairGoalAuthorizationReceipt {
  schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1';
  generatedAt: string;
  authorizationStatus: AiIdeTargetRepoRepairGoalAuthorizationStatus;
  sourceProposalPackage: AiIdeTargetRepoRepairGoalAuthorizationSourceProposalPackage;
  decisionSummary: AiIdeTargetRepoRepairGoalAuthorizationDecisionSummary;
  authorizationItems: AiIdeTargetRepoRepairGoalAuthorizationItem[];
  approvedScope: AiIdeTargetRepoRepairGoalAuthorizationItem[];
  rejectedItems: AiIdeTargetRepoRepairGoalAuthorizationItem[];
  deferredItems: AiIdeTargetRepoRepairGoalAuthorizationItem[];
  riskAcceptedItems: AiIdeTargetRepoRepairGoalAuthorizationItem[];
  verificationRequirements: string[];
  maintainerApprovalBoundary: string;
  nonAuthorizationBoundary: string;
  redactionBoundary: string;
  blockedActions: string[];
}

export interface WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptResult {
  jsonPath: string;
  markdownPath: string;
  authorizationReceipt: AiIdeTargetRepoRepairGoalAuthorizationReceipt;
}

const PROPOSAL_PACKAGE_JSON_NAME = 'ai-ide-target-repo-repair-goal-proposal-package.json';
const AUTHORIZATION_RECEIPT_JSON_NAME = 'ai-ide-target-repo-repair-goal-authorization-receipt.json';
const AUTHORIZATION_RECEIPT_MARKDOWN_NAME = 'ai-ide-target-repo-repair-goal-authorization-receipt.md';

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

export function buildAiIdeTargetRepoRepairGoalAuthorizationReceipt(
  input: AiIdeTargetRepoRepairGoalAuthorizationReceiptInput
): AiIdeTargetRepoRepairGoalAuthorizationReceipt {
  const proposalJson = JSON.stringify(input.proposalPackage);
  const blockedActions = [
    ...new Set([...input.proposalPackage.blockedActions, ...NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize))
  ];
  const allowedScopeIds = new Set(input.proposalPackage.allowedRepairScope.map((scope) => scope.scopeId));
  const proposalReady = input.proposalPackage.proposalReadiness === 'ready_for_maintainer_goal_authorization';
  const authorizationItems = input.authorizationDecisions.map((decision) => buildAuthorizationItem(
    decision,
    allowedScopeIds,
    proposalReady
  ));
  const approvedScope = authorizationItems.filter((item) => item.decision === 'approve');
  const rejectedItems = authorizationItems.filter((item) => item.decision === 'reject');
  const deferredItems = authorizationItems.filter((item) => item.decision === 'defer');
  const riskAcceptedItems = authorizationItems.filter((item) => item.decision === 'accept_risk');

  return {
    schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    authorizationStatus: classifyAuthorizationStatus(input.proposalPackage, authorizationItems),
    sourceProposalPackage: {
      schemaVersion: sanitize(input.proposalPackage.schemaVersion),
      fileName: sanitize(basename(input.proposalPackagePath)),
      path: sanitizePath(input.proposalPackagePath),
      sha256: createHash('sha256').update(proposalJson).digest('hex'),
      proposalReadiness: input.proposalPackage.proposalReadiness
    },
    decisionSummary: {
      totalDecisionItems: authorizationItems.length,
      approved: approvedScope.length,
      rejected: rejectedItems.length,
      deferred: deferredItems.length,
      acceptedRisk: riskAcceptedItems.length,
      approvedTargetRepairGoalScopes: approvedScope.filter((item) => item.authorizedForSeparateTargetRepoRepairGoal).length
    },
    authorizationItems,
    approvedScope,
    rejectedItems,
    deferredItems,
    riskAcceptedItems,
    verificationRequirements: buildVerificationRequirements(input.proposalPackage, authorizationItems),
    maintainerApprovalBoundary: sanitize(
      'This receipt authorizes only the maintainer-approved scope to be drafted or executed in a separate target repo repair goal.'
    ),
    nonAuthorizationBoundary: sanitize(
      'This receipt does not execute target repo file mutation, branch creation, commits, pull requests, issues, advisories, releases, publication, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.'
    ),
    redactionBoundary: sanitize(
      'Use sanitized local summaries only; never store secrets, raw private source, reviewer PII, credentials, cookies, tokens, customer data, or unredacted local artifact paths.'
    ),
    blockedActions
  };
}

export async function writeAiIdeTargetRepoRepairGoalAuthorizationReceipt(
  input: WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptInput
): Promise<WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptResult> {
  const proposalPackage = JSON.parse(
    await readFile(input.proposalPackagePath, 'utf8')
  ) as AiIdeTargetRepoRepairGoalProposalPackage;
  const decisionInput = JSON.parse(
    await readFile(input.decisionsPath, 'utf8')
  ) as { decisions?: AiIdeTargetRepoRepairGoalAuthorizationDecisionInput[] };
  const authorizationReceipt = buildAiIdeTargetRepoRepairGoalAuthorizationReceipt({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    proposalPackagePath: input.proposalPackagePath,
    proposalPackage,
    authorizationDecisions: decisionInput.decisions ?? []
  });
  const jsonPath = join(input.outputDir, AUTHORIZATION_RECEIPT_JSON_NAME);
  const markdownPath = join(input.outputDir, AUTHORIZATION_RECEIPT_MARKDOWN_NAME);

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(authorizationReceipt, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeTargetRepoRepairGoalAuthorizationReceiptMarkdown(authorizationReceipt));

  return { jsonPath, markdownPath, authorizationReceipt };
}

export async function writeAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectory(
  input: WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptFromDirectoryInput
): Promise<WriteAiIdeTargetRepoRepairGoalAuthorizationReceiptResult> {
  return writeAiIdeTargetRepoRepairGoalAuthorizationReceipt({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    proposalPackagePath: join(input.inputDir, PROPOSAL_PACKAGE_JSON_NAME),
    decisionsPath: input.decisionsPath,
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildAiIdeTargetRepoRepairGoalAuthorizationReceiptMarkdown(
  authorizationReceipt: AiIdeTargetRepoRepairGoalAuthorizationReceipt
): string {
  return [
    '# RepoAssure AI IDE Target Repo Repair Goal Authorization Receipt',
    '',
    `Generated at: ${authorizationReceipt.generatedAt}`,
    `Authorization status: ${authorizationReceipt.authorizationStatus}`,
    '',
    '## Source Proposal Package',
    '',
    `- fileName: ${authorizationReceipt.sourceProposalPackage.fileName}`,
    `- schemaVersion: ${authorizationReceipt.sourceProposalPackage.schemaVersion}`,
    `- proposalReadiness: ${authorizationReceipt.sourceProposalPackage.proposalReadiness}`,
    `- sha256: ${authorizationReceipt.sourceProposalPackage.sha256}`,
    '',
    '## Decision Summary',
    '',
    `- totalDecisionItems: ${authorizationReceipt.decisionSummary.totalDecisionItems}`,
    `- approved: ${authorizationReceipt.decisionSummary.approved}`,
    `- rejected: ${authorizationReceipt.decisionSummary.rejected}`,
    `- deferred: ${authorizationReceipt.decisionSummary.deferred}`,
    `- acceptedRisk: ${authorizationReceipt.decisionSummary.acceptedRisk}`,
    `- approvedTargetRepairGoalScopes: ${authorizationReceipt.decisionSummary.approvedTargetRepairGoalScopes}`,
    '',
    '## Authorization Items',
    '',
    '| Scope | Decision | Approver | Separate target repair goal | Next action |',
    '| --- | --- | --- | --- | --- |',
    ...authorizationReceipt.authorizationItems.map((item) => `| ${[
      item.scopeId,
      item.decision,
      item.approverRole,
      item.authorizedForSeparateTargetRepoRepairGoal ? 'yes' : 'no',
      item.nextAction
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(authorizationReceipt.authorizationItems.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Approved Scope',
    '',
    ...formatItemList(authorizationReceipt.approvedScope),
    '',
    '## Rejected Items',
    '',
    ...formatItemList(authorizationReceipt.rejectedItems),
    '',
    '## Deferred Items',
    '',
    ...formatItemList(authorizationReceipt.deferredItems),
    '',
    '## Risk Accepted Items',
    '',
    ...formatItemList(authorizationReceipt.riskAcceptedItems),
    '',
    '## Verification Requirements',
    '',
    ...authorizationReceipt.verificationRequirements.map((requirement) => `- ${requirement}`),
    '',
    '## Maintainer Approval Boundary',
    '',
    authorizationReceipt.maintainerApprovalBoundary,
    '',
    '## Non-Authorization Boundary',
    '',
    authorizationReceipt.nonAuthorizationBoundary,
    '',
    '## Blocked Actions',
    '',
    ...authorizationReceipt.blockedActions.map((action) => `- ${action}`),
    '',
    '## Redaction Boundary',
    '',
    authorizationReceipt.redactionBoundary,
    ''
  ].join('\n');
}

function buildAuthorizationItem(
  decision: AiIdeTargetRepoRepairGoalAuthorizationDecisionInput,
  allowedScopeIds: Set<string>,
  proposalReady: boolean
): AiIdeTargetRepoRepairGoalAuthorizationItem {
  const sanitizedDecision = sanitizeAuthorizationDecision(decision.decision);
  const authorizedForSeparateTargetRepoRepairGoal =
    sanitizedDecision === 'approve' && proposalReady && allowedScopeIds.has(decision.scopeId);

  return {
    scopeId: sanitize(decision.scopeId),
    decision: sanitizedDecision,
    evidence: sanitize(decision.evidence),
    approverRole: sanitize(decision.approverRole),
    authorizedForSeparateTargetRepoRepairGoal,
    nextAction: buildNextAction(sanitizedDecision, authorizedForSeparateTargetRepoRepairGoal),
    verificationRequirements: (decision.verificationRequirements ?? []).map(sanitize)
  };
}

function classifyAuthorizationStatus(
  proposalPackage: AiIdeTargetRepoRepairGoalProposalPackage,
  authorizationItems: AiIdeTargetRepoRepairGoalAuthorizationItem[]
): AiIdeTargetRepoRepairGoalAuthorizationStatus {
  if (proposalPackage.proposalReadiness !== 'ready_for_maintainer_goal_authorization' || authorizationItems.length === 0) {
    return 'blocked_or_incomplete';
  }

  const decisions = new Set(authorizationItems.map((item) => item.decision));

  if (decisions.size > 1) {
    return 'mixed_decisions';
  }

  if (decisions.has('approve')) {
    return authorizationItems.some((item) => item.authorizedForSeparateTargetRepoRepairGoal)
      ? 'approved_for_separate_target_repo_repair_goal'
      : 'blocked_or_incomplete';
  }

  if (decisions.has('reject')) {
    return 'rejected';
  }

  if (decisions.has('defer')) {
    return 'deferred';
  }

  return 'risk_accepted_no_repair';
}

function buildVerificationRequirements(
  proposalPackage: AiIdeTargetRepoRepairGoalProposalPackage,
  authorizationItems: AiIdeTargetRepoRepairGoalAuthorizationItem[]
): string[] {
  return [
    ...new Set([
      ...proposalPackage.verificationCommands.map((command) => command.command),
      ...authorizationItems.flatMap((item) => item.verificationRequirements),
      'Regenerate RepoAssure evidence artifacts after any separately authorized target repo repair goal.'
    ].map(sanitize))
  ];
}

function buildNextAction(
  decision: AiIdeTargetRepoRepairGoalAuthorizationDecision,
  authorizedForSeparateTargetRepoRepairGoal: boolean
): string {
  if (authorizedForSeparateTargetRepoRepairGoal) {
    return 'Separate target repo repair goal may be drafted only for this approved scope.';
  }

  if (decision === 'approve') {
    return 'Approval is recorded but blocked until the proposal readiness and scope match the allowed repair scope.';
  }

  if (decision === 'reject') {
    return 'Do not open or execute a target repo repair goal for this scope.';
  }

  if (decision === 'defer') {
    return 'Defer target repo repair goal execution until the missing prerequisite or maintainer condition is resolved.';
  }

  return 'Record accepted risk for this scope; do not treat risk acceptance as target repo repair authorization.';
}

function sanitizeAuthorizationDecision(
  value: string
): AiIdeTargetRepoRepairGoalAuthorizationDecision {
  if (value === 'approve' || value === 'reject' || value === 'defer' || value === 'accept_risk') {
    return value;
  }

  return 'defer';
}

function formatItemList(items: AiIdeTargetRepoRepairGoalAuthorizationItem[]): string[] {
  if (items.length === 0) {
    return ['- n/a'];
  }

  return items.map((item) => `- ${item.scopeId}: ${item.decision} - ${item.nextAction}`);
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
