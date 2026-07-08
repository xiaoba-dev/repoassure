import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import type {
  AiIdeAuthorizedTargetRepoRepairGoalTask,
  AiIdeAuthorizedTargetRepoRepairGoalTaskPackage,
  AiIdeAuthorizedTargetRepoRepairGoalTaskPackageStatus
} from './ai-ide-authorized-target-repo-repair-goal-task-package.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type AiIdeTargetRepoRepairGoalExecutionIntakeStatus =
  | 'ready_for_maintainer_review'
  | 'blocked_or_incomplete'
  | 'boundary_violation_detected';

export type AiIdeTargetRepoRepairGoalExecutionStatus =
  | 'verified'
  | 'blocked'
  | 'failed'
  | 'not_started';

export type AiIdeTargetRepoRepairGoalVerificationStatus =
  | 'passed'
  | 'failed'
  | 'blocked'
  | 'not_run';

export type AiIdeTargetRepoRepairGoalMaintainerReviewStatus =
  | 'pending_review'
  | 'accepted'
  | 'changes_requested'
  | 'not_ready';

export interface AiIdeTargetRepoRepairGoalActualMutationSummary {
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  summary: string;
  evidenceRefs: string[];
}

export interface AiIdeTargetRepoRepairGoalVerificationResult {
  command: string;
  status: AiIdeTargetRepoRepairGoalVerificationStatus;
  evidence: string;
}

export interface AiIdeTargetRepoRepairGoalExecutionResultInput {
  goalId: string;
  executionStatus: AiIdeTargetRepoRepairGoalExecutionStatus;
  actualMutationSummary: AiIdeTargetRepoRepairGoalActualMutationSummary;
  verificationResults: AiIdeTargetRepoRepairGoalVerificationResult[];
  maintainerReviewStatus: AiIdeTargetRepoRepairGoalMaintainerReviewStatus;
  notes: string;
}

export interface AiIdeTargetRepoRepairGoalBoundaryEvidenceInput {
  unauthorizedActions?: string[];
  notes: string;
}

export interface AiIdeTargetRepoRepairGoalExecutionEvidenceInput {
  executionResults?: AiIdeTargetRepoRepairGoalExecutionResultInput[];
  boundaryEvidence?: AiIdeTargetRepoRepairGoalBoundaryEvidenceInput;
}

export interface AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportInput {
  generatedAt?: string;
  taskPackagePath: string;
  taskPackage: AiIdeAuthorizedTargetRepoRepairGoalTaskPackage;
  executionEvidence: AiIdeTargetRepoRepairGoalExecutionEvidenceInput;
}

export interface WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportInput {
  generatedAt?: string;
  taskPackagePath: string;
  evidencePath: string;
  outputDir: string;
}

export interface WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface AiIdeTargetRepoRepairGoalSourceTaskPackage {
  schemaVersion: string;
  fileName: string;
  path: string;
  sha256: string;
  taskPackageStatus: AiIdeAuthorizedTargetRepoRepairGoalTaskPackageStatus;
  approvedRepairGoals: number;
}

export interface AiIdeTargetRepoRepairGoalExecutionSummary {
  totalApprovedRepairGoals: number;
  verifiedGoals: number;
  blockedGoals: number;
  failedGoals: number;
  notStartedGoals: number;
  boundaryViolations: number;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
}

export interface AiIdeTargetRepoRepairGoalReport {
  goalId: string;
  scopeId: string;
  executionStatus: AiIdeTargetRepoRepairGoalExecutionStatus;
  verificationStatus: AiIdeTargetRepoRepairGoalVerificationStatus;
  verificationRequirements: string[];
  verificationResults: AiIdeTargetRepoRepairGoalVerificationResult[];
  actualMutationSummary: AiIdeTargetRepoRepairGoalActualMutationSummary;
  maintainerReviewStatus: AiIdeTargetRepoRepairGoalMaintainerReviewStatus;
  nonAuthorizationBoundaryMaintained: boolean;
  notes: string;
}

export interface AiIdeTargetRepoRepairGoalBoundaryReport {
  boundaryViolations: number;
  unauthorizedActions: string[];
  targetRepoMutationNotPerformedByRepoAssure: true;
  notes: string;
}

export interface AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport {
  schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1';
  generatedAt: string;
  intakeStatus: AiIdeTargetRepoRepairGoalExecutionIntakeStatus;
  sourceTaskPackage: AiIdeTargetRepoRepairGoalSourceTaskPackage;
  executionSummary: AiIdeTargetRepoRepairGoalExecutionSummary;
  goalReports: AiIdeTargetRepoRepairGoalReport[];
  boundaryReport: AiIdeTargetRepoRepairGoalBoundaryReport;
  reviewChecklist: string[];
  maintainerReviewBoundary: string;
  nonAuthorizationBoundary: string;
  redactionBoundary: string;
  blockedActions: string[];
}

export interface WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportResult {
  jsonPath: string;
  markdownPath: string;
  intakeReport: AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport;
}

const TASK_PACKAGE_JSON_NAME = 'ai-ide-authorized-target-repo-repair-goal-task-package.json';
const EVIDENCE_INPUT_JSON_NAME = 'target-repo-repair-goal-execution-evidence-input.json';
const INTAKE_REPORT_JSON_NAME = 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json';
const INTAKE_REPORT_MARKDOWN_NAME = 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md';

const DEFAULT_MUTATION_SUMMARY: AiIdeTargetRepoRepairGoalActualMutationSummary = {
  filesChanged: 0,
  linesAdded: 0,
  linesRemoved: 0,
  summary: 'No execution evidence was supplied for this approved repair goal.',
  evidenceRefs: []
};

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

export function buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport(
  input: AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportInput
): AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport {
  const taskPackageJson = JSON.stringify(input.taskPackage);
  const evidenceByGoalId = new Map(
    (input.executionEvidence.executionResults ?? []).map((result) => [result.goalId, result])
  );
  const boundaryEvidence = input.executionEvidence.boundaryEvidence ?? {
    unauthorizedActions: [],
    notes: 'No boundary evidence was provided.'
  };
  const unauthorizedActions = (boundaryEvidence.unauthorizedActions ?? []).map(sanitize);
  const blockedActions = [
    ...new Set([...input.taskPackage.blockedActions, ...NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize))
  ];
  const goalReports = input.taskPackage.approvedRepairGoals.map((goal) => buildGoalReport(
    goal,
    evidenceByGoalId.get(goal.goalId),
    unauthorizedActions.length
  ));
  const executionSummary = buildExecutionSummary(goalReports, unauthorizedActions.length);

  return {
    schemaVersion: 'repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    intakeStatus: resolveIntakeStatus(goalReports, unauthorizedActions.length),
    sourceTaskPackage: {
      schemaVersion: sanitize(input.taskPackage.schemaVersion),
      fileName: sanitize(basename(input.taskPackagePath)),
      path: sanitizePath(input.taskPackagePath),
      sha256: createHash('sha256').update(taskPackageJson).digest('hex'),
      taskPackageStatus: input.taskPackage.taskPackageStatus,
      approvedRepairGoals: input.taskPackage.approvedRepairGoals.length
    },
    executionSummary,
    goalReports,
    boundaryReport: {
      boundaryViolations: unauthorizedActions.length,
      unauthorizedActions,
      targetRepoMutationNotPerformedByRepoAssure: true,
      notes: sanitize(boundaryEvidence.notes)
    },
    reviewChecklist: [
      'Confirm every approved repair goal has execution evidence before maintainer acceptance.',
      'Confirm verificationResults are passed before accepting a verified goal report.',
      'Treat blocked, failed, or not_started goal reports as unresolved until new execution evidence is provided.',
      'Confirm unauthorizedActions is empty before maintainer acceptance.',
      'Regenerate RepoAssure evidence after any separate target repo repair goal changes.'
    ].map(sanitize),
    maintainerReviewBoundary: sanitize(
      'Imported target repo repair goal execution evidence must be reviewed by the maintainer before acceptance or merge.'
    ),
    nonAuthorizationBoundary: sanitize(
      'This intake report records evidence only; it does not create target repo branch, commit, pull request, issue, advisory, file mutation, npm publication, GitHub release, public launch, customer contact, pricing/spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.'
    ),
    redactionBoundary: sanitize(input.taskPackage.redactionBoundary),
    blockedActions
  };
}

export async function writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport(
  input: WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportInput
): Promise<WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportResult> {
  const taskPackage = JSON.parse(
    await readFile(input.taskPackagePath, 'utf8')
  ) as AiIdeAuthorizedTargetRepoRepairGoalTaskPackage;
  const executionEvidence = JSON.parse(
    await readFile(input.evidencePath, 'utf8')
  ) as AiIdeTargetRepoRepairGoalExecutionEvidenceInput;
  const intakeReport = buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    taskPackagePath: input.taskPackagePath,
    taskPackage,
    executionEvidence
  });
  const jsonPath = join(input.outputDir, INTAKE_REPORT_JSON_NAME);
  const markdownPath = join(input.outputDir, INTAKE_REPORT_MARKDOWN_NAME);

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(intakeReport, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportMarkdown(intakeReport));

  return { jsonPath, markdownPath, intakeReport };
}

export async function writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectory(
  input: WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportFromDirectoryInput
): Promise<WriteAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportResult> {
  return writeAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    taskPackagePath: join(input.inputDir, TASK_PACKAGE_JSON_NAME),
    evidencePath: join(input.inputDir, EVIDENCE_INPUT_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildAiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReportMarkdown(
  intakeReport: AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport
): string {
  return [
    '# RepoAssure AI IDE Target Repo Repair Goal Execution Evidence Intake Report',
    '',
    `Generated at: ${intakeReport.generatedAt}`,
    `Intake status: ${intakeReport.intakeStatus}`,
    '',
    '## Source Task Package',
    '',
    `- fileName: ${intakeReport.sourceTaskPackage.fileName}`,
    `- schemaVersion: ${intakeReport.sourceTaskPackage.schemaVersion}`,
    `- taskPackageStatus: ${intakeReport.sourceTaskPackage.taskPackageStatus}`,
    `- approvedRepairGoals: ${intakeReport.sourceTaskPackage.approvedRepairGoals}`,
    `- sha256: ${intakeReport.sourceTaskPackage.sha256}`,
    '',
    '## Execution Summary',
    '',
    `- totalApprovedRepairGoals: ${intakeReport.executionSummary.totalApprovedRepairGoals}`,
    `- verifiedGoals: ${intakeReport.executionSummary.verifiedGoals}`,
    `- blockedGoals: ${intakeReport.executionSummary.blockedGoals}`,
    `- failedGoals: ${intakeReport.executionSummary.failedGoals}`,
    `- notStartedGoals: ${intakeReport.executionSummary.notStartedGoals}`,
    `- boundaryViolations: ${intakeReport.executionSummary.boundaryViolations}`,
    `- filesChanged: ${intakeReport.executionSummary.filesChanged}`,
    '',
    '## Goal Reports',
    '',
    '| Goal | Scope | Status | Verification | Maintainer review | Boundary maintained | Files changed | Notes |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...intakeReport.goalReports.map((report) => `| ${[
      report.goalId,
      report.scopeId,
      report.executionStatus,
      report.verificationStatus,
      report.maintainerReviewStatus,
      report.nonAuthorizationBoundaryMaintained ? 'yes' : 'no',
      String(report.actualMutationSummary.filesChanged),
      report.notes
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(intakeReport.goalReports.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Boundary Report',
    '',
    `- boundaryViolations: ${intakeReport.boundaryReport.boundaryViolations}`,
    `- unauthorizedActions: ${intakeReport.boundaryReport.unauthorizedActions.join(', ') || 'none'}`,
    `- targetRepoMutationNotPerformedByRepoAssure: ${intakeReport.boundaryReport.targetRepoMutationNotPerformedByRepoAssure}`,
    `- notes: ${intakeReport.boundaryReport.notes}`,
    '',
    '## Review Checklist',
    '',
    ...intakeReport.reviewChecklist.map((item) => `- ${item}`),
    '',
    '## Maintainer Review Boundary',
    '',
    intakeReport.maintainerReviewBoundary,
    '',
    '## Non-Authorization Boundary',
    '',
    intakeReport.nonAuthorizationBoundary,
    '',
    '## Blocked Actions',
    '',
    ...intakeReport.blockedActions.map((action) => `- ${action}`),
    '',
    '## Redaction Boundary',
    '',
    intakeReport.redactionBoundary,
    ''
  ].join('\n');
}

function buildGoalReport(
  task: AiIdeAuthorizedTargetRepoRepairGoalTask,
  evidence: AiIdeTargetRepoRepairGoalExecutionResultInput | undefined,
  boundaryViolations: number
): AiIdeTargetRepoRepairGoalReport {
  if (!evidence) {
    return {
      goalId: sanitize(task.goalId),
      scopeId: sanitize(task.scopeId),
      executionStatus: 'not_started',
      verificationStatus: 'not_run',
      verificationRequirements: task.verificationRequirements.map(sanitize),
      verificationResults: [],
      actualMutationSummary: sanitizeMutationSummary(DEFAULT_MUTATION_SUMMARY),
      maintainerReviewStatus: 'not_ready',
      nonAuthorizationBoundaryMaintained: boundaryViolations === 0,
      notes: sanitize('No execution evidence was supplied for this approved repair goal.')
    };
  }

  return {
    goalId: sanitize(task.goalId),
    scopeId: sanitize(task.scopeId),
    executionStatus: evidence.executionStatus,
    verificationStatus: summarizeVerificationStatus(evidence.verificationResults),
    verificationRequirements: task.verificationRequirements.map(sanitize),
    verificationResults: evidence.verificationResults.map((result) => ({
      command: sanitize(result.command),
      status: result.status,
      evidence: sanitize(result.evidence)
    })),
    actualMutationSummary: sanitizeMutationSummary(evidence.actualMutationSummary),
    maintainerReviewStatus: evidence.maintainerReviewStatus,
    nonAuthorizationBoundaryMaintained: boundaryViolations === 0,
    notes: sanitize(evidence.notes)
  };
}

function buildExecutionSummary(
  goalReports: AiIdeTargetRepoRepairGoalReport[],
  boundaryViolations: number
): AiIdeTargetRepoRepairGoalExecutionSummary {
  return {
    totalApprovedRepairGoals: goalReports.length,
    verifiedGoals: countExecutionStatus(goalReports, 'verified'),
    blockedGoals: countExecutionStatus(goalReports, 'blocked'),
    failedGoals: countExecutionStatus(goalReports, 'failed'),
    notStartedGoals: countExecutionStatus(goalReports, 'not_started'),
    boundaryViolations,
    filesChanged: sumMutation(goalReports, 'filesChanged'),
    linesAdded: sumMutation(goalReports, 'linesAdded'),
    linesRemoved: sumMutation(goalReports, 'linesRemoved')
  };
}

function resolveIntakeStatus(
  goalReports: AiIdeTargetRepoRepairGoalReport[],
  boundaryViolations: number
): AiIdeTargetRepoRepairGoalExecutionIntakeStatus {
  if (boundaryViolations > 0) {
    return 'boundary_violation_detected';
  }

  return goalReports.length > 0
    && goalReports.every((report) => (
      report.executionStatus === 'verified'
      && report.verificationStatus === 'passed'
    ))
    ? 'ready_for_maintainer_review'
    : 'blocked_or_incomplete';
}

function summarizeVerificationStatus(
  results: AiIdeTargetRepoRepairGoalVerificationResult[]
): AiIdeTargetRepoRepairGoalVerificationStatus {
  if (results.length === 0) {
    return 'not_run';
  }

  if (results.some((result) => result.status === 'failed')) {
    return 'failed';
  }

  if (results.some((result) => result.status === 'blocked')) {
    return 'blocked';
  }

  return results.every((result) => result.status === 'passed') ? 'passed' : 'not_run';
}

function countExecutionStatus(
  reports: AiIdeTargetRepoRepairGoalReport[],
  status: AiIdeTargetRepoRepairGoalExecutionStatus
): number {
  return reports.filter((report) => report.executionStatus === status).length;
}

function sumMutation(
  reports: AiIdeTargetRepoRepairGoalReport[],
  field: 'filesChanged' | 'linesAdded' | 'linesRemoved'
): number {
  return reports.reduce((total, report) => total + report.actualMutationSummary[field], 0);
}

function sanitizeMutationSummary(
  summary: AiIdeTargetRepoRepairGoalActualMutationSummary
): AiIdeTargetRepoRepairGoalActualMutationSummary {
  return {
    filesChanged: summary.filesChanged,
    linesAdded: summary.linesAdded,
    linesRemoved: summary.linesRemoved,
    summary: sanitize(summary.summary),
    evidenceRefs: summary.evidenceRefs.map(sanitizePath)
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
