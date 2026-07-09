import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type {
  AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport,
  AiIdeTargetRepoRepairGoalExecutionIntakeStatus,
  AiIdeTargetRepoRepairGoalReport
} from './ai-ide-target-repo-repair-goal-execution-evidence-intake-report.js';

export type AiIdeTargetRepairEvidenceReviewDecision =
  | 'accept'
  | 'changes_requested'
  | 'defer'
  | 'accept_risk';

export type AiIdeTargetRepairEvidenceReviewStatus =
  | 'accepted_for_target_repo_acceptance'
  | 'changes_requested'
  | 'deferred'
  | 'accepted_with_risk'
  | 'mixed_review_decisions'
  | 'blocked_or_incomplete';

export type AiIdeTargetRepairEvidenceReviewDecisionReadiness =
  | 'reviewed'
  | 'blocked_by_missing_review_decision'
  | 'blocked_by_source_intake_status'
  | 'blocked_by_boundary_violation';

export interface AiIdeTargetRepairEvidenceReviewDecisionInputItem {
  goalId: string;
  decision: AiIdeTargetRepairEvidenceReviewDecision;
  evidence: string;
  reviewerRole: string;
  acceptedEvidenceScope?: string[];
  requestedChanges?: string[];
  deferReason?: string;
  riskAcceptance?: string;
  nextRepairGoalRecommendation?: string;
}

export interface AiIdeTargetRepairEvidenceReviewDecisionInput {
  decisions?: AiIdeTargetRepairEvidenceReviewDecisionInputItem[];
}

export interface AiIdeTargetRepairEvidenceReviewDecisionPackageInput {
  generatedAt?: string;
  intakeReportPath: string;
  intakeReport: AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport;
  reviewDecisionInput: AiIdeTargetRepairEvidenceReviewDecisionInput;
}

export interface WriteAiIdeTargetRepairEvidenceReviewDecisionPackageInput {
  generatedAt?: string;
  intakeReportPath: string;
  decisionsPath: string;
  outputDir: string;
}

export interface WriteAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface AiIdeTargetRepairEvidenceSourceIntakeReport {
  schemaVersion: string;
  fileName: string;
  path: string;
  sha256: string;
  intakeStatus: AiIdeTargetRepoRepairGoalExecutionIntakeStatus;
  verifiedGoals: number;
  boundaryViolations: number;
}

export interface AiIdeTargetRepairEvidenceReviewDecisionSummary {
  totalSourceGoals: number;
  totalReviewedGoals: number;
  acceptedGoals: number;
  changesRequestedGoals: number;
  deferredGoals: number;
  riskAcceptedGoals: number;
  unreviewedGoals: number;
}

export interface AiIdeTargetRepairEvidenceReviewItem {
  goalId: string;
  scopeId: string;
  sourceExecutionStatus: string;
  sourceVerificationStatus: string;
  sourceMaintainerReviewStatus: string;
  decision: AiIdeTargetRepairEvidenceReviewDecision;
  decisionReadiness: AiIdeTargetRepairEvidenceReviewDecisionReadiness;
  evidence: string;
  reviewerRole: string;
  acceptedEvidenceScope: string[];
  requestedChanges: string[];
  deferReason: string;
  riskAcceptance: string;
  nextRepairGoalRecommendation: string;
}

export interface AiIdeTargetRepairEvidenceAcceptedScope {
  goalId: string;
  scopeId: string;
  acceptedEvidenceScope: string[];
}

export interface AiIdeTargetRepairEvidenceChangeRequest {
  goalId: string;
  scopeId: string;
  requestedChanges: string[];
  evidence: string;
  nextRepairGoalRecommendation: string;
}

export interface AiIdeTargetRepairEvidenceDeferredItem {
  goalId: string;
  scopeId: string;
  deferReason: string;
  evidence: string;
}

export interface AiIdeTargetRepairEvidenceRiskAcceptedItem {
  goalId: string;
  scopeId: string;
  riskAcceptance: string;
  evidence: string;
}

export interface AiIdeTargetRepairEvidenceNextRepairGoalRecommendation {
  goalId: string;
  scopeId: string;
  recommendation: string;
}

export interface AiIdeTargetRepairEvidenceReviewDecisionPackage {
  schemaVersion: 'repoassure.ai-ide-target-repair-evidence-review-decision-package.v1';
  generatedAt: string;
  reviewStatus: AiIdeTargetRepairEvidenceReviewStatus;
  sourceIntakeReport: AiIdeTargetRepairEvidenceSourceIntakeReport;
  decisionSummary: AiIdeTargetRepairEvidenceReviewDecisionSummary;
  reviewItems: AiIdeTargetRepairEvidenceReviewItem[];
  acceptedEvidenceScope: AiIdeTargetRepairEvidenceAcceptedScope[];
  changeRequestedItems: AiIdeTargetRepairEvidenceChangeRequest[];
  deferredItems: AiIdeTargetRepairEvidenceDeferredItem[];
  riskAcceptedItems: AiIdeTargetRepairEvidenceRiskAcceptedItem[];
  nextRepairGoalRecommendations: AiIdeTargetRepairEvidenceNextRepairGoalRecommendation[];
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteAiIdeTargetRepairEvidenceReviewDecisionPackageResult {
  jsonPath: string;
  markdownPath: string;
  decisionPackage: AiIdeTargetRepairEvidenceReviewDecisionPackage;
}

const INTAKE_REPORT_JSON_NAME = 'ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json';
const REVIEW_DECISIONS_JSON_NAME = 'target-repair-evidence-review-decisions.json';
const REVIEW_DECISION_PACKAGE_JSON_NAME = 'ai-ide-target-repair-evidence-review-decision-package.json';
const REVIEW_DECISION_PACKAGE_MARKDOWN_NAME = 'ai-ide-target-repair-evidence-review-decision-package.md';

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

export function buildAiIdeTargetRepairEvidenceReviewDecisionPackage(
  input: AiIdeTargetRepairEvidenceReviewDecisionPackageInput
): AiIdeTargetRepairEvidenceReviewDecisionPackage {
  const intakeReportJson = JSON.stringify(input.intakeReport);
  const decisionsByGoalId = new Map(
    (input.reviewDecisionInput.decisions ?? []).map((decision) => [decision.goalId, decision])
  );
  const reviewItems = input.intakeReport.goalReports.map((goalReport) => buildReviewItem(
    goalReport,
    decisionsByGoalId.get(goalReport.goalId),
    input.intakeReport
  ));
  const decisionSummary = buildDecisionSummary(reviewItems);
  const blockedActions = [
    ...new Set([...input.intakeReport.blockedActions, ...NON_AUTHORIZATION_BLOCKED_ACTIONS].map(sanitize))
  ];

  return {
    schemaVersion: 'repoassure.ai-ide-target-repair-evidence-review-decision-package.v1',
    generatedAt: sanitize(input.generatedAt ?? new Date().toISOString()),
    reviewStatus: resolveReviewStatus(input.intakeReport, reviewItems),
    sourceIntakeReport: {
      schemaVersion: sanitize(input.intakeReport.schemaVersion),
      fileName: sanitize(basename(input.intakeReportPath)),
      path: sanitizePath(input.intakeReportPath),
      sha256: createHash('sha256').update(intakeReportJson).digest('hex'),
      intakeStatus: input.intakeReport.intakeStatus,
      verifiedGoals: input.intakeReport.executionSummary.verifiedGoals,
      boundaryViolations: input.intakeReport.executionSummary.boundaryViolations
    },
    decisionSummary,
    reviewItems,
    acceptedEvidenceScope: reviewItems
      .filter((item) => item.decision === 'accept' && item.decisionReadiness === 'reviewed')
      .map((item) => ({
        goalId: item.goalId,
        scopeId: item.scopeId,
        acceptedEvidenceScope: item.acceptedEvidenceScope
      })),
    changeRequestedItems: reviewItems
      .filter((item) => item.decision === 'changes_requested' && item.decisionReadiness === 'reviewed')
      .map((item) => ({
        goalId: item.goalId,
        scopeId: item.scopeId,
        requestedChanges: item.requestedChanges,
        evidence: item.evidence,
        nextRepairGoalRecommendation: item.nextRepairGoalRecommendation
      })),
    deferredItems: reviewItems
      .filter((item) => item.decision === 'defer' && item.decisionReadiness === 'reviewed')
      .map((item) => ({
        goalId: item.goalId,
        scopeId: item.scopeId,
        deferReason: item.deferReason,
        evidence: item.evidence
      })),
    riskAcceptedItems: reviewItems
      .filter((item) => item.decision === 'accept_risk' && item.decisionReadiness === 'reviewed')
      .map((item) => ({
        goalId: item.goalId,
        scopeId: item.scopeId,
        riskAcceptance: item.riskAcceptance,
        evidence: item.evidence
      })),
    nextRepairGoalRecommendations: reviewItems
      .filter((item) => item.nextRepairGoalRecommendation.length > 0)
      .map((item) => ({
        goalId: item.goalId,
        scopeId: item.scopeId,
        recommendation: item.nextRepairGoalRecommendation
      })),
    maintainerReviewBoundary: sanitize(
      'This package records maintainer review decisions only; it is evidence for the target repair evidence review gate and requires separate maintainer action for any later target repo change.'
    ),
    redactionBoundary: sanitize(input.intakeReport.redactionBoundary),
    nonAuthorizationBoundary: sanitize(
      'This review decision package does not modify target repo files, create target repo branch, commit, pull request, issue, advisory, publish npm, create GitHub release, run public launch, contact customers, authorize pricing/spend, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability. Accepted evidence is not final merge, release, launch, or customer authorization.'
    ),
    blockedActions
  };
}

export async function writeAiIdeTargetRepairEvidenceReviewDecisionPackage(
  input: WriteAiIdeTargetRepairEvidenceReviewDecisionPackageInput
): Promise<WriteAiIdeTargetRepairEvidenceReviewDecisionPackageResult> {
  const intakeReport = JSON.parse(
    await readFile(input.intakeReportPath, 'utf8')
  ) as AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport;
  const reviewDecisionInput = JSON.parse(
    await readFile(input.decisionsPath, 'utf8')
  ) as AiIdeTargetRepairEvidenceReviewDecisionInput;
  const decisionPackage = buildAiIdeTargetRepairEvidenceReviewDecisionPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    intakeReportPath: input.intakeReportPath,
    intakeReport,
    reviewDecisionInput
  });
  const jsonPath = join(input.outputDir, REVIEW_DECISION_PACKAGE_JSON_NAME);
  const markdownPath = join(input.outputDir, REVIEW_DECISION_PACKAGE_MARKDOWN_NAME);

  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(decisionPackage, null, 2)}\n`);
  await writeFile(markdownPath, buildAiIdeTargetRepairEvidenceReviewDecisionPackageMarkdown(decisionPackage));

  return { jsonPath, markdownPath, decisionPackage };
}

export async function writeAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectory(
  input: WriteAiIdeTargetRepairEvidenceReviewDecisionPackageFromDirectoryInput
): Promise<WriteAiIdeTargetRepairEvidenceReviewDecisionPackageResult> {
  return writeAiIdeTargetRepairEvidenceReviewDecisionPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    intakeReportPath: join(input.inputDir, INTAKE_REPORT_JSON_NAME),
    decisionsPath: join(input.inputDir, REVIEW_DECISIONS_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildAiIdeTargetRepairEvidenceReviewDecisionPackageMarkdown(
  decisionPackage: AiIdeTargetRepairEvidenceReviewDecisionPackage
): string {
  return [
    '# RepoAssure AI IDE Target Repair Evidence Review Decision Package',
    '',
    `Generated at: ${decisionPackage.generatedAt}`,
    `Review status: ${decisionPackage.reviewStatus}`,
    '',
    '## Source Intake Report',
    '',
    `- fileName: ${decisionPackage.sourceIntakeReport.fileName}`,
    `- schemaVersion: ${decisionPackage.sourceIntakeReport.schemaVersion}`,
    `- intakeStatus: ${decisionPackage.sourceIntakeReport.intakeStatus}`,
    `- verifiedGoals: ${decisionPackage.sourceIntakeReport.verifiedGoals}`,
    `- boundaryViolations: ${decisionPackage.sourceIntakeReport.boundaryViolations}`,
    `- sha256: ${decisionPackage.sourceIntakeReport.sha256}`,
    '',
    '## Decision Summary',
    '',
    `- totalSourceGoals: ${decisionPackage.decisionSummary.totalSourceGoals}`,
    `- totalReviewedGoals: ${decisionPackage.decisionSummary.totalReviewedGoals}`,
    `- acceptedGoals: ${decisionPackage.decisionSummary.acceptedGoals}`,
    `- changesRequestedGoals: ${decisionPackage.decisionSummary.changesRequestedGoals}`,
    `- deferredGoals: ${decisionPackage.decisionSummary.deferredGoals}`,
    `- riskAcceptedGoals: ${decisionPackage.decisionSummary.riskAcceptedGoals}`,
    `- unreviewedGoals: ${decisionPackage.decisionSummary.unreviewedGoals}`,
    '',
    '## Review Decisions',
    '',
    '| Goal | Scope | Decision | Readiness | Evidence | Next repair goal recommendation |',
    '| --- | --- | --- | --- | --- | --- |',
    ...decisionPackage.reviewItems.map((item) => `| ${[
      item.goalId,
      item.scopeId,
      item.decision,
      item.decisionReadiness,
      item.evidence,
      item.nextRepairGoalRecommendation || 'n/a'
    ].map((value) => escapeMarkdownTableCell(value)).join(' | ')} |`),
    ...(decisionPackage.reviewItems.length === 0 ? ['| n/a | n/a | n/a | n/a | n/a | n/a |'] : []),
    '',
    '## Accepted Evidence Scope',
    '',
    ...decisionPackage.acceptedEvidenceScope.map((item) => `- ${item.goalId}: ${item.acceptedEvidenceScope.join('; ') || 'accepted verified source evidence'}`),
    ...(decisionPackage.acceptedEvidenceScope.length === 0 ? ['- none'] : []),
    '',
    '## Change Requested Items',
    '',
    ...decisionPackage.changeRequestedItems.map((item) => `- ${item.goalId}: ${item.requestedChanges.join('; ') || 'changes requested'}`),
    ...(decisionPackage.changeRequestedItems.length === 0 ? ['- none'] : []),
    '',
    '## Deferred Items',
    '',
    ...decisionPackage.deferredItems.map((item) => `- ${item.goalId}: ${item.deferReason || 'deferred by maintainer'}`),
    ...(decisionPackage.deferredItems.length === 0 ? ['- none'] : []),
    '',
    '## Risk Accepted Items',
    '',
    ...decisionPackage.riskAcceptedItems.map((item) => `- ${item.goalId}: ${item.riskAcceptance || 'risk accepted by maintainer'}`),
    ...(decisionPackage.riskAcceptedItems.length === 0 ? ['- none'] : []),
    '',
    '## Next Repair Goal Recommendations',
    '',
    ...decisionPackage.nextRepairGoalRecommendations.map((item) => `- ${item.goalId}: ${item.recommendation}`),
    ...(decisionPackage.nextRepairGoalRecommendations.length === 0 ? ['- none'] : []),
    '',
    '## Maintainer Review Boundary',
    '',
    decisionPackage.maintainerReviewBoundary,
    '',
    '## Non-Authorization Boundary',
    '',
    decisionPackage.nonAuthorizationBoundary,
    '',
    '## Blocked Actions',
    '',
    ...decisionPackage.blockedActions.map((action) => `- ${action}`),
    '',
    '## Redaction Boundary',
    '',
    decisionPackage.redactionBoundary,
    ''
  ].join('\n');
}

function buildReviewItem(
  goalReport: AiIdeTargetRepoRepairGoalReport,
  decisionInput: AiIdeTargetRepairEvidenceReviewDecisionInputItem | undefined,
  intakeReport: AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport
): AiIdeTargetRepairEvidenceReviewItem {
  const readiness = resolveDecisionReadiness(goalReport, decisionInput, intakeReport);
  const decision = decisionInput?.decision ?? 'defer';

  return {
    goalId: sanitize(goalReport.goalId),
    scopeId: sanitize(goalReport.scopeId),
    sourceExecutionStatus: sanitize(goalReport.executionStatus),
    sourceVerificationStatus: sanitize(goalReport.verificationStatus),
    sourceMaintainerReviewStatus: sanitize(goalReport.maintainerReviewStatus),
    decision,
    decisionReadiness: readiness,
    evidence: sanitize(decisionInput?.evidence ?? 'No maintainer review decision was supplied for this goal.'),
    reviewerRole: sanitize(decisionInput?.reviewerRole ?? 'maintainer_review_required'),
    acceptedEvidenceScope: (decisionInput?.acceptedEvidenceScope ?? defaultAcceptedEvidenceScope(goalReport, decision)).map(sanitizePath),
    requestedChanges: (decisionInput?.requestedChanges ?? defaultRequestedChanges(goalReport, decision)).map(sanitize),
    deferReason: sanitize(decisionInput?.deferReason ?? defaultDeferReason(readiness)),
    riskAcceptance: sanitize(decisionInput?.riskAcceptance ?? ''),
    nextRepairGoalRecommendation: sanitize(decisionInput?.nextRepairGoalRecommendation ?? defaultNextRepairGoalRecommendation(decision, readiness))
  };
}

function resolveDecisionReadiness(
  goalReport: AiIdeTargetRepoRepairGoalReport,
  decisionInput: AiIdeTargetRepairEvidenceReviewDecisionInputItem | undefined,
  intakeReport: AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport
): AiIdeTargetRepairEvidenceReviewDecisionReadiness {
  if (intakeReport.executionSummary.boundaryViolations > 0) {
    return 'blocked_by_boundary_violation';
  }

  if (intakeReport.intakeStatus !== 'ready_for_maintainer_review') {
    return 'blocked_by_source_intake_status';
  }

  if (!decisionInput || goalReport.verificationStatus !== 'passed' || goalReport.executionStatus !== 'verified') {
    return 'blocked_by_missing_review_decision';
  }

  return 'reviewed';
}

function buildDecisionSummary(
  reviewItems: AiIdeTargetRepairEvidenceReviewItem[]
): AiIdeTargetRepairEvidenceReviewDecisionSummary {
  const reviewedItems = reviewItems.filter((item) => item.decisionReadiness === 'reviewed');

  return {
    totalSourceGoals: reviewItems.length,
    totalReviewedGoals: reviewedItems.length,
    acceptedGoals: countDecision(reviewedItems, 'accept'),
    changesRequestedGoals: countDecision(reviewedItems, 'changes_requested'),
    deferredGoals: countDecision(reviewedItems, 'defer'),
    riskAcceptedGoals: countDecision(reviewedItems, 'accept_risk'),
    unreviewedGoals: reviewItems.length - reviewedItems.length
  };
}

function resolveReviewStatus(
  intakeReport: AiIdeTargetRepoRepairGoalExecutionEvidenceIntakeReport,
  reviewItems: AiIdeTargetRepairEvidenceReviewItem[]
): AiIdeTargetRepairEvidenceReviewStatus {
  const summary = buildDecisionSummary(reviewItems);

  if (
    intakeReport.intakeStatus !== 'ready_for_maintainer_review'
    || intakeReport.executionSummary.boundaryViolations > 0
    || summary.unreviewedGoals > 0
    || reviewItems.length === 0
  ) {
    return 'blocked_or_incomplete';
  }

  const decisions = new Set(reviewItems.map((item) => item.decision));

  if (decisions.size === 1) {
    const [decision] = [...decisions];

    if (decision === 'accept') {
      return 'accepted_for_target_repo_acceptance';
    }

    if (decision === 'changes_requested') {
      return 'changes_requested';
    }

    if (decision === 'defer') {
      return 'deferred';
    }

    return 'accepted_with_risk';
  }

  return 'mixed_review_decisions';
}

function countDecision(
  reviewItems: AiIdeTargetRepairEvidenceReviewItem[],
  decision: AiIdeTargetRepairEvidenceReviewDecision
): number {
  return reviewItems.filter((item) => item.decision === decision).length;
}

function defaultAcceptedEvidenceScope(
  goalReport: AiIdeTargetRepoRepairGoalReport,
  decision: AiIdeTargetRepairEvidenceReviewDecision
): string[] {
  return decision === 'accept'
    ? [
      goalReport.actualMutationSummary.summary,
      ...goalReport.verificationResults.map((result) => result.evidence)
    ]
    : [];
}

function defaultRequestedChanges(
  goalReport: AiIdeTargetRepoRepairGoalReport,
  decision: AiIdeTargetRepairEvidenceReviewDecision
): string[] {
  return decision === 'changes_requested'
    ? [`Provide updated evidence for ${goalReport.goalId} before maintainer acceptance.`]
    : [];
}

function defaultDeferReason(readiness: AiIdeTargetRepairEvidenceReviewDecisionReadiness): string {
  if (readiness === 'blocked_by_missing_review_decision') {
    return 'No maintainer review decision was supplied.';
  }

  if (readiness === 'blocked_by_source_intake_status') {
    return 'Source intake report is not ready for maintainer review.';
  }

  if (readiness === 'blocked_by_boundary_violation') {
    return 'Source intake report contains boundary violations.';
  }

  return '';
}

function defaultNextRepairGoalRecommendation(
  decision: AiIdeTargetRepairEvidenceReviewDecision,
  readiness: AiIdeTargetRepairEvidenceReviewDecisionReadiness
): string {
  if (readiness !== 'reviewed') {
    return 'Resolve blocked intake evidence before opening any new target repo repair goal.';
  }

  if (decision === 'changes_requested') {
    return 'Open a follow-up target repo repair goal only after explicit maintainer authorization.';
  }

  if (decision === 'defer') {
    return 'Do not open a follow-up repair goal until the maintainer removes the deferral.';
  }

  if (decision === 'accept_risk') {
    return 'Record accepted risk; do not treat it as automatic repair authorization.';
  }

  return '';
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
