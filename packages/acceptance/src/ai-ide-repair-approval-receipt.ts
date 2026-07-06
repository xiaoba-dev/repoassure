import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  type AiIdeRepairDecisionItem,
  type AiIdeRepairDecisionPackage,
  type AiIdeRepairDecisionType
} from './ai-ide-repair-decision-package.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type AiIdeRepairApprovalDecision =
  | 'approve'
  | 'reject'
  | 'defer'
  | 'accept_risk'
  | 'pending';

export interface AiIdeRepairApprovalDecisionInput {
  sourceActionId: string;
  decision: Exclude<AiIdeRepairApprovalDecision, 'pending'>;
  evidence: string;
  approverRole: string;
}

export interface AiIdeRepairApprovalReceiptInput {
  generatedAt?: string;
  decisionPackagePath: string;
  decisionPackage: AiIdeRepairDecisionPackage;
  approvalDecisions: AiIdeRepairApprovalDecisionInput[];
}

export interface WriteAiIdeRepairApprovalReceiptInput {
  generatedAt?: string;
  decisionPackagePath: string;
  approvalsPath: string;
  outputDir: string;
}

export interface AiIdeRepairApprovalReceiptSummary {
  totalApprovalItems: number;
  approved: number;
  rejected: number;
  deferred: number;
  acceptedRisk: number;
  pending: number;
  approvedManualRepairCandidates: number;
}

export interface AiIdeRepairApprovalReceiptItem {
  sourceActionId: string;
  decisionType: AiIdeRepairDecisionType;
  requiredApproval: string;
  approverRole: string;
  approvalDecision: AiIdeRepairApprovalDecision;
  approvalEvidence: string;
  targetIds: string[];
  approvedForManualRepairExecution: boolean;
  nextAction: string;
  readOrderPaths: string[];
  verificationChecklist: string[];
}

export interface AiIdeRepairApprovalReceipt {
  schemaVersion: 'repoassure.ai-ide-repair-approval-receipt.v1';
  generatedAt: string;
  sourceDecisionPackage: string;
  receiptSummary: AiIdeRepairApprovalReceiptSummary;
  approvalItems: AiIdeRepairApprovalReceiptItem[];
  maintainerApprovalChecklist: string[];
  blockedActions: string[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface WriteAiIdeRepairApprovalReceiptResult {
  jsonPath: string;
  markdownPath: string;
  approvalReceipt: AiIdeRepairApprovalReceipt;
}

export function buildAiIdeRepairApprovalReceipt(
  input: AiIdeRepairApprovalReceiptInput
): AiIdeRepairApprovalReceipt {
  const approvalByActionId = new Map(
    input.approvalDecisions.map((approval) => [approval.sourceActionId, approval])
  );
  const approvalItems = input.decisionPackage.decisionItems.map((item) => buildApprovalItem(
    item,
    approvalByActionId.get(item.sourceActionId)
  ));

  return {
    schemaVersion: 'repoassure.ai-ide-repair-approval-receipt.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    sourceDecisionPackage: sanitizePath(input.decisionPackagePath),
    receiptSummary: {
      totalApprovalItems: approvalItems.length,
      approved: countApprovalDecision(approvalItems, 'approve'),
      rejected: countApprovalDecision(approvalItems, 'reject'),
      deferred: countApprovalDecision(approvalItems, 'defer'),
      acceptedRisk: countApprovalDecision(approvalItems, 'accept_risk'),
      pending: countApprovalDecision(approvalItems, 'pending'),
      approvedManualRepairCandidates: approvalItems.filter((item) => item.approvedForManualRepairExecution).length
    },
    approvalItems,
    maintainerApprovalChecklist: [
      'Confirm every approval item has decision evidence before repair execution starts.',
      'Execute only approved manual_repair_candidate items in a separate authorized repair goal or workflow.',
      'Do not execute deferred, rejected, accepted-risk, environment prerequisite, product backlog, or pending items as target repo repairs.',
      'After any separately authorized repair execution, rerun verification and regenerate the campaign artifacts.'
    ],
    blockedActions: input.decisionPackage.inheritedDryRunBlockedActions,
    maintainerReviewBoundary: sanitize(input.decisionPackage.maintainerReviewBoundary),
    redactionBoundary: sanitize(input.decisionPackage.redactionBoundary),
    nonAuthorizationBoundary: 'This approval receipt records maintainer decisions only; it does not create target repo branches, commits, pull requests, issues, advisories, or file mutations, and it does not execute npm publication, GitHub release, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.'
  };
}

export async function writeAiIdeRepairApprovalReceipt(
  input: WriteAiIdeRepairApprovalReceiptInput
): Promise<WriteAiIdeRepairApprovalReceiptResult> {
  const decisionPackage = JSON.parse(await readFile(input.decisionPackagePath, 'utf8')) as AiIdeRepairDecisionPackage;
  const approvalInput = JSON.parse(await readFile(input.approvalsPath, 'utf8')) as { decisions?: AiIdeRepairApprovalDecisionInput[] };
  const approvalReceipt = buildAiIdeRepairApprovalReceipt({
    decisionPackagePath: input.decisionPackagePath,
    decisionPackage,
    approvalDecisions: approvalInput.decisions ?? [],
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {})
  });
  const jsonPath = join(input.outputDir, 'ai-ide-repair-approval-receipt.json');
  const markdownPath = join(input.outputDir, 'ai-ide-repair-approval-receipt.md');

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(approvalReceipt, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeRepairApprovalReceiptMarkdown(approvalReceipt));

  return { jsonPath, markdownPath, approvalReceipt };
}

export function buildAiIdeRepairApprovalReceiptMarkdown(
  approvalReceipt: AiIdeRepairApprovalReceipt
): string {
  return [
    '# RepoAssure AI IDE Repair Approval Receipt',
    '',
    `Generated at: ${approvalReceipt.generatedAt}`,
    `Source decision package: ${approvalReceipt.sourceDecisionPackage}`,
    '',
    '## Receipt Summary',
    '',
    `- totalApprovalItems: ${approvalReceipt.receiptSummary.totalApprovalItems}`,
    `- approved: ${approvalReceipt.receiptSummary.approved}`,
    `- rejected: ${approvalReceipt.receiptSummary.rejected}`,
    `- deferred: ${approvalReceipt.receiptSummary.deferred}`,
    `- acceptedRisk: ${approvalReceipt.receiptSummary.acceptedRisk}`,
    `- pending: ${approvalReceipt.receiptSummary.pending}`,
    `- approvedManualRepairCandidates: ${approvalReceipt.receiptSummary.approvedManualRepairCandidates}`,
    '',
    '## Approval Items',
    '',
    '| Action | Decision type | Approval decision | Approver | Approved for repair execution | Next action |',
    '| --- | --- | --- | --- | --- | --- |',
    ...approvalReceipt.approvalItems.map((item) => `| ${[
      item.sourceActionId,
      item.decisionType,
      item.approvalDecision,
      item.approverRole,
      item.approvedForManualRepairExecution ? 'yes' : 'no',
      item.nextAction
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(approvalReceipt.approvalItems.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Maintainer Approval Checklist',
    '',
    ...approvalReceipt.maintainerApprovalChecklist.map((item) => `- ${item}`),
    '',
    '## Non-Authorization Boundary',
    '',
    '- No target repo branch, commit, pull request, issue, advisory, or file mutation is executed by this receipt.',
    `- ${approvalReceipt.nonAuthorizationBoundary}`,
    `- ${approvalReceipt.maintainerReviewBoundary}`,
    '',
    '## Blocked Actions',
    '',
    ...approvalReceipt.blockedActions.map((action) => `- ${action}`),
    '',
    '## Boundaries',
    '',
    `- ${approvalReceipt.redactionBoundary}`,
    `- ${approvalReceipt.nonAuthorizationBoundary}`,
    ''
  ].join('\n');
}

function buildApprovalItem(
  decisionItem: AiIdeRepairDecisionItem,
  approval: AiIdeRepairApprovalDecisionInput | undefined
): AiIdeRepairApprovalReceiptItem {
  const approvalDecision = sanitizeApprovalDecision(approval?.decision);

  return {
    sourceActionId: sanitize(decisionItem.sourceActionId),
    decisionType: decisionItem.decisionType,
    requiredApproval: sanitize(decisionItem.requiredApproval),
    approverRole: sanitize(approval?.approverRole ?? 'manual_triage_required'),
    approvalDecision,
    approvalEvidence: sanitize(approval?.evidence ?? 'No maintainer decision evidence provided.'),
    targetIds: decisionItem.targetIds.map(sanitize),
    approvedForManualRepairExecution: isApprovedForManualRepairExecution(decisionItem, approvalDecision),
    nextAction: buildNextAction(decisionItem, approvalDecision),
    readOrderPaths: decisionItem.readOrderPaths.map(sanitizePath),
    verificationChecklist: decisionItem.verificationChecklist.map(sanitize)
  };
}

function sanitizeApprovalDecision(value: string | undefined): AiIdeRepairApprovalDecision {
  if (value === 'approve' || value === 'reject' || value === 'defer' || value === 'accept_risk') {
    return value;
  }

  return 'pending';
}

function isApprovedForManualRepairExecution(
  decisionItem: AiIdeRepairDecisionItem,
  approvalDecision: AiIdeRepairApprovalDecision
): boolean {
  return decisionItem.decisionType === 'manual_repair_candidate' && approvalDecision === 'approve';
}

function buildNextAction(
  decisionItem: AiIdeRepairDecisionItem,
  approvalDecision: AiIdeRepairApprovalDecision
): string {
  if (isApprovedForManualRepairExecution(decisionItem, approvalDecision)) {
    return 'Manual repair execution may proceed only in a separate authorized repair goal or workflow.';
  }

  if (approvalDecision === 'reject') {
    return 'Do not execute this repair item; record the rejection rationale and regenerate evidence if needed.';
  }

  if (approvalDecision === 'defer') {
    return 'Defer execution until the prerequisite, missing evidence, or maintainer review condition is resolved.';
  }

  if (approvalDecision === 'accept_risk') {
    return 'Record the accepted risk scope; do not treat this item as target repo repair authorization.';
  }

  return 'Collect maintainer decision evidence before repair execution starts.';
}

function countApprovalDecision(
  items: AiIdeRepairApprovalReceiptItem[],
  decision: AiIdeRepairApprovalDecision
): number {
  return items.filter((item) => item.approvalDecision === decision).length;
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
