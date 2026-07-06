import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  type AiIdeRepairApprovalDecision,
  type AiIdeRepairApprovalReceipt,
  type AiIdeRepairApprovalReceiptItem
} from './ai-ide-repair-approval-receipt.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export interface AiIdeApprovedRepairExecutionPlanInput {
  generatedAt?: string;
  approvalReceiptPath: string;
  approvalReceipt: AiIdeRepairApprovalReceipt;
}

export interface WriteAiIdeApprovedRepairExecutionPlanInput {
  generatedAt?: string;
  approvalReceiptPath: string;
  outputDir: string;
}

export interface AiIdeApprovedRepairExecutionSummary {
  totalApprovalItems: number;
  approvedExecutionItems: number;
  excludedApprovalItems: number;
  blockedActions: number;
}

export interface AiIdeApprovedRepairExecutionItem {
  sourceActionId: string;
  decisionType: 'manual_repair_candidate';
  approvalDecision: 'approve';
  approvalEvidence: string;
  approverRole: string;
  targetIds: string[];
  executionMode: 'plan_only';
  requiresSeparateRepairAuthorization: true;
  nextAction: string;
  readOrderPaths: string[];
  verificationChecklist: string[];
}

export interface AiIdeApprovedRepairExecutionExcludedItem {
  sourceActionId: string;
  decisionType: AiIdeRepairApprovalReceiptItem['decisionType'];
  approvalDecision: AiIdeRepairApprovalDecision;
  targetIds: string[];
  exclusionReason: 'not_approved_manual_repair_candidate';
}

export interface AiIdeApprovedRepairExecutionPlan {
  schemaVersion: 'repoassure.ai-ide-approved-repair-execution-plan.v1';
  generatedAt: string;
  sourceApprovalReceipt: string;
  executionSummary: AiIdeApprovedRepairExecutionSummary;
  approvedExecutionItems: AiIdeApprovedRepairExecutionItem[];
  excludedApprovalItems: AiIdeApprovedRepairExecutionExcludedItem[];
  executionChecklist: string[];
  rollbackAndReviewChecklist: string[];
  blockedActions: string[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface WriteAiIdeApprovedRepairExecutionPlanResult {
  jsonPath: string;
  markdownPath: string;
  executionPlan: AiIdeApprovedRepairExecutionPlan;
}

const nonAuthorizationBoundary =
  'This approved repair execution plan is planning evidence only; it does not modify target repos, create target repo branches, commits, pull requests, issues, advisories, npm publications, GitHub releases, public launches, customer contacts, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.';

export function buildAiIdeApprovedRepairExecutionPlan(
  input: AiIdeApprovedRepairExecutionPlanInput
): AiIdeApprovedRepairExecutionPlan {
  const approvedExecutionItems = input.approvalReceipt.approvalItems
    .filter(isApprovedManualRepairCandidate)
    .map(buildApprovedExecutionItem);
  const excludedApprovalItems = input.approvalReceipt.approvalItems
    .filter((item) => !isApprovedManualRepairCandidate(item))
    .map(buildExcludedApprovalItem);
  const blockedActions = input.approvalReceipt.blockedActions.map(sanitize);

  return {
    schemaVersion: 'repoassure.ai-ide-approved-repair-execution-plan.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    sourceApprovalReceipt: sanitizePath(input.approvalReceiptPath),
    executionSummary: {
      totalApprovalItems: input.approvalReceipt.approvalItems.length,
      approvedExecutionItems: approvedExecutionItems.length,
      excludedApprovalItems: excludedApprovalItems.length,
      blockedActions: blockedActions.length
    },
    approvedExecutionItems,
    excludedApprovalItems,
    executionChecklist: [
      'Read every approvedExecutionItems[].readOrderPaths entry before proposing a target repo patch.',
      'Use every approvedExecutionItems[].verificationChecklist entry as the minimum post-repair verification list.',
      'Stop for maintainer review before applying patches or writing target repo files.',
      'Regenerate approval receipt and execution plan if receipt input changes.'
    ],
    rollbackAndReviewChecklist: [
      'Do not apply patches without a separate repair execution goal and maintainer review.',
      'Keep target repo changes in an isolated worktree when a later repair execution is authorized.',
      'Record verification evidence before asking maintainer to merge any target repo change.'
    ],
    blockedActions,
    maintainerReviewBoundary: sanitize(input.approvalReceipt.maintainerReviewBoundary),
    redactionBoundary: sanitize(input.approvalReceipt.redactionBoundary),
    nonAuthorizationBoundary
  };
}

export async function writeAiIdeApprovedRepairExecutionPlan(
  input: WriteAiIdeApprovedRepairExecutionPlanInput
): Promise<WriteAiIdeApprovedRepairExecutionPlanResult> {
  const approvalReceipt = JSON.parse(await readFile(input.approvalReceiptPath, 'utf8')) as AiIdeRepairApprovalReceipt;
  const executionPlan = buildAiIdeApprovedRepairExecutionPlan({
    approvalReceiptPath: input.approvalReceiptPath,
    approvalReceipt,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {})
  });
  const jsonPath = join(input.outputDir, 'ai-ide-approved-repair-execution-plan.json');
  const markdownPath = join(input.outputDir, 'ai-ide-approved-repair-execution-plan.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(executionPlan, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeApprovedRepairExecutionPlanMarkdown(executionPlan));

  return { jsonPath, markdownPath, executionPlan };
}

export function buildAiIdeApprovedRepairExecutionPlanMarkdown(
  executionPlan: AiIdeApprovedRepairExecutionPlan
): string {
  return [
    '# RepoAssure AI IDE Approved Repair Execution Plan',
    '',
    `Generated at: ${executionPlan.generatedAt}`,
    `Source approval receipt: ${executionPlan.sourceApprovalReceipt}`,
    '',
    '## Execution Summary',
    '',
    `- totalApprovalItems: ${executionPlan.executionSummary.totalApprovalItems}`,
    `- approvedExecutionItems: ${executionPlan.executionSummary.approvedExecutionItems}`,
    `- excludedApprovalItems: ${executionPlan.executionSummary.excludedApprovalItems}`,
    `- blockedActions: ${executionPlan.executionSummary.blockedActions}`,
    '',
    '## Approved Execution Items',
    '',
    '| Action | Targets | Mode | Next action |',
    '| --- | --- | --- | --- |',
    ...executionPlan.approvedExecutionItems.map((item) => `| ${[
      item.sourceActionId,
      item.targetIds.join(', '),
      item.executionMode,
      item.nextAction
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(executionPlan.approvedExecutionItems.length === 0 ? ['| n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Excluded Approval Items',
    '',
    '| Action | Decision type | Approval decision | Targets | Exclusion reason |',
    '| --- | --- | --- | --- | --- |',
    ...executionPlan.excludedApprovalItems.map((item) => `| ${[
      item.sourceActionId,
      item.decisionType,
      item.approvalDecision,
      item.targetIds.join(', '),
      item.exclusionReason
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(executionPlan.excludedApprovalItems.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Execution Checklist',
    '',
    ...executionPlan.executionChecklist.map((item) => `- ${item}`),
    '',
    '## Rollback And Review Checklist',
    '',
    ...executionPlan.rollbackAndReviewChecklist.map((item) => `- ${item}`),
    '',
    '## Non-Authorization Boundary',
    '',
    '- Manual repair planning may proceed only for approved manual repair candidates.',
    '- No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this plan.',
    `- ${executionPlan.nonAuthorizationBoundary}`,
    `- ${executionPlan.maintainerReviewBoundary}`,
    '',
    '## Blocked Actions',
    '',
    ...executionPlan.blockedActions.map((action) => `- ${action}`),
    '',
    '## Boundaries',
    '',
    `- ${executionPlan.redactionBoundary}`,
    `- ${executionPlan.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function isApprovedManualRepairCandidate(item: AiIdeRepairApprovalReceiptItem): boolean {
  return (
    item.approvedForManualRepairExecution
    && item.approvalDecision === 'approve'
    && item.decisionType === 'manual_repair_candidate'
  );
}

function buildApprovedExecutionItem(
  item: AiIdeRepairApprovalReceiptItem
): AiIdeApprovedRepairExecutionItem {
  return {
    sourceActionId: sanitize(item.sourceActionId),
    decisionType: 'manual_repair_candidate',
    approvalDecision: 'approve',
    approvalEvidence: sanitize(item.approvalEvidence),
    approverRole: sanitize(item.approverRole),
    targetIds: item.targetIds.map(sanitize),
    executionMode: 'plan_only',
    requiresSeparateRepairAuthorization: true,
    nextAction: 'Manual repair planning may proceed only for approved manual repair candidates.',
    readOrderPaths: item.readOrderPaths.map(sanitizePath),
    verificationChecklist: item.verificationChecklist.map(sanitize)
  };
}

function buildExcludedApprovalItem(
  item: AiIdeRepairApprovalReceiptItem
): AiIdeApprovedRepairExecutionExcludedItem {
  return {
    sourceActionId: sanitize(item.sourceActionId),
    decisionType: item.decisionType,
    approvalDecision: item.approvalDecision,
    targetIds: item.targetIds.map(sanitize),
    exclusionReason: 'not_approved_manual_repair_candidate'
  };
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
