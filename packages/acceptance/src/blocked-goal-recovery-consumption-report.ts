import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type { BlockedGoalRecoveryPackage } from './blocked-goal-recovery-package.js';

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
  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-consumption-report.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    sourceRecoveryPackage: {
      path: sanitizePath(input.packagePath),
      sha256: createHash('sha256').update(JSON.stringify(input.recoveryPackage)).digest('hex')
    },
    resumeReadiness: mapResumeReadiness(input.recoveryPackage),
    evidenceReadOrder: buildEvidenceReadOrder(input.packagePath, input.recoveryPackage),
    actionQueue: buildActionQueue(input.recoveryPackage),
    resumeChecklist: [
      'Read the recovery package and its source evidence in order.',
      'Review every automatic retry candidate before running it.',
      'Complete every maintainer decision and external prerequisite before resuming.',
      'Confirm blocked actions and the non-authorization boundary remain unchanged.',
      'Run only the reviewed resume command after all recovery gates are satisfied.'
    ],
    boundaryCompliance: {
      recoveryCommandsExecuted: false,
      blockedActionsPreserved: input.recoveryPackage.blockedActions.length > 0
    },
    maintainerReviewBoundary: sanitize(input.recoveryPackage.maintainerReviewBoundary),
    redactionBoundary: sanitize(input.recoveryPackage.redactionBoundary),
    nonAuthorizationBoundary: sanitize(input.recoveryPackage.nonAuthorizationBoundary),
    blockedActions: input.recoveryPackage.blockedActions.map(sanitize)
  };
}

export async function writeBlockedGoalRecoveryConsumptionReport(
  input: WriteBlockedGoalRecoveryConsumptionReportInput
): Promise<WriteBlockedGoalRecoveryConsumptionReportResult> {
  const recoveryPackage = JSON.parse(
    await readFile(input.packagePath, 'utf8')
  ) as BlockedGoalRecoveryPackage;
  const report = buildBlockedGoalRecoveryConsumptionReport({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    packagePath: input.packagePath,
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
    '| Blocker | Action type | Instruction | Context |',
    '| --- | --- | --- | --- |',
    ...report.actionQueue.map((item) => `| ${[
      item.blockerId,
      item.actionType,
      item.instruction,
      item.context
    ].map(escapeMarkdownTableCell).join(' | ')} |`),
    ...(report.actionQueue.length === 0 ? ['| n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Resume Checklist',
    '',
    ...report.resumeChecklist.map((item) => `- [ ] ${item}`),
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

function mapResumeReadiness(
  recoveryPackage: BlockedGoalRecoveryPackage
): BlockedGoalResumeReadiness {
  if (recoveryPackage.recoveryStatus === 'ready_to_resume') {
    return 'ready_to_resume_after_review';
  }

  if (recoveryPackage.recoveryStatus === 'retryable_with_automatic_actions') {
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
    ...recoveryPackage.automaticRecoveryActions.map((action) => ({
      blockerId: sanitize(action.blockerId),
      actionType: 'automatic_retry_candidate' as const,
      instruction: sanitize(action.command),
      context: sanitize(action.rationale)
    })),
    ...recoveryPackage.maintainerDecisionRequests.map((request) => ({
      blockerId: sanitize(request.blockerId),
      actionType: 'maintainer_decision_required' as const,
      instruction: sanitize(request.requestedDecision),
      context: sanitize(`Options: ${request.options.join(', ')}`)
    })),
    ...recoveryPackage.externalPrerequisites.map((prerequisite) => ({
      blockerId: sanitize(prerequisite.blockerId),
      actionType: 'external_prerequisite_required' as const,
      instruction: sanitize(prerequisite.prerequisite),
      context: sanitize(`Owner: ${prerequisite.owner}`)
    }))
  ];
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
