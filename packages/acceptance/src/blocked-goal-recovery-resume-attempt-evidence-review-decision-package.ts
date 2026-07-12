import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import {
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeSourceBinding,
  type BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  type BlockedGoalRecoveryResumeAttemptEvidenceResultStatus
} from './blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';
import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from './blocked-goal-recovery-package.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type BlockedGoalRecoveryResumeAttemptEvidenceReviewDecision =
  | 'accept' | 'changes_requested' | 'defer' | 'accept_risk';
export type BlockedGoalRecoveryResumeAttemptEvidenceRecordedDecision =
  | BlockedGoalRecoveryResumeAttemptEvidenceReviewDecision | 'unreviewed';
export type BlockedGoalRecoveryResumeAttemptEvidenceReviewStatus =
  | 'accepted' | 'accepted_with_risk' | 'changes_requested' | 'deferred'
  | 'blocked_or_incomplete' | 'blocked_by_boundary_violation';

export interface BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInputItem {
  evidenceKey: string;
  decision: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecision;
  evidence: string;
  reviewerRole: string;
  rationale?: string;
}

export interface BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInput {
  sourceEvidenceIntakeSha256: string;
  decisions: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInputItem[];
}

export interface BuildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageInput {
  generatedAt?: string;
  intakePath: string;
  sourceIntakeText: string;
  sourceTaskPackageText: string;
  intake: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake;
  decisionInput: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInput;
}

export interface WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageInput {
  generatedAt?: string;
  intakePath: string;
  decisionsPath: string;
  taskPackagePath: string;
  outputDir: string;
}

export interface WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface BlockedGoalRecoveryResumeAttemptEvidenceReviewItem {
  evidenceKey: string;
  evidenceType: 'action' | 'command' | 'verification';
  sourceId: string;
  sourceStatus: BlockedGoalRecoveryResumeAttemptEvidenceResultStatus;
  sourceSummary: string;
  sourceEvidenceRefs: string[];
  decision: BlockedGoalRecoveryResumeAttemptEvidenceRecordedDecision;
  decisionEvidence: string;
  reviewerRole: string;
  rationale: string;
}

export interface BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage {
  schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1';
  generatedAt: string;
  reviewStatus: BlockedGoalRecoveryResumeAttemptEvidenceReviewStatus;
  sourceEvidenceIntake: {
    schemaVersion: string; fileName: string; path: string; sha256: string; intakeStatus: string;
  };
  decisionSummary: {
    total: number; reviewed: number; accepted: number; changesRequested: number;
    deferred: number; acceptedRisk: number; unreviewed: number;
  };
  reviewItems: BlockedGoalRecoveryResumeAttemptEvidenceReviewItem[];
  acceptedEvidenceScope: string[];
  unresolvedEvidenceKeys: string[];
  boundaryCompliance: { commandsExecutedByReview: false; sourceBoundaryPreserved: boolean };
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageResult {
  jsonPath: string;
  markdownPath: string;
  reviewPackage: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage;
}

const INTAKE_JSON_NAME = 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json';
const DECISIONS_JSON_NAME = 'blocked-goal-recovery-resume-attempt-evidence-review-decisions.json';
const OUTPUT_JSON_NAME = 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json';
const OUTPUT_MARKDOWN_NAME = 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.md';
const MAINTAINER_REVIEW_BOUNDARY =
  'This package records maintainer review decisions over resume-attempt evidence; it does not execute commands, close the source goal, or authorize follow-on work.';
const NON_AUTHORIZATION_BOUNDARY =
  'This review package does not execute recovery commands, modify target repo files, create target repo branch, commit, pull request, issue, or advisory, publish npm, create GitHub release, run public launch, contact customers, change pricing/spend, change repository visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.';

export function buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(
  input: BuildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageInput
): BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage {
  let parsedIntake: unknown;
  try { parsedIntake = JSON.parse(input.sourceIntakeText); } catch { throw invalidIntake(); }
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(parsedIntake);
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(input.intake);
  if (!isDeepStrictEqual(parsedIntake, input.intake)) throw invalidIntake();
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeSourceBinding(
    input.intake, input.sourceTaskPackageText
  );
  const sourceSha256 = createHash('sha256').update(input.sourceIntakeText).digest('hex');
  assertDecisionInput(input.decisionInput, input.intake, sourceSha256);

  const sources = buildEvidenceSources(input.intake);
  const decisions = new Map(input.decisionInput.decisions.map((item) => [item.evidenceKey, item]));
  const reviewItems = sources.map((source) => {
    const decision = decisions.get(source.evidenceKey);
    return {
      ...source,
      decision: decision?.decision ?? 'unreviewed',
      decisionEvidence: decision?.evidence ?? '',
      reviewerRole: decision?.reviewerRole ?? '',
      rationale: decision?.rationale ?? ''
    } satisfies BlockedGoalRecoveryResumeAttemptEvidenceReviewItem;
  });
  const reviewStatus = deriveReviewStatus(input.intake, reviewItems);

  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1',
    generatedAt: canonical(input.generatedAt ?? new Date().toISOString()),
    reviewStatus,
    sourceEvidenceIntake: {
      schemaVersion: input.intake.schemaVersion,
      fileName: canonical(basename(input.intakePath)),
      path: canonicalPath(input.intakePath),
      sha256: sourceSha256,
      intakeStatus: input.intake.intakeStatus
    },
    decisionSummary: summarize(reviewItems),
    reviewItems,
    acceptedEvidenceScope: reviewItems
      .filter((item) => item.decision === 'accept' || item.decision === 'accept_risk')
      .map((item) => item.evidenceKey),
    unresolvedEvidenceKeys: reviewItems
      .filter((item) => item.decision === 'unreviewed' || item.decision === 'changes_requested' || item.decision === 'defer')
      .map((item) => item.evidenceKey),
    boundaryCompliance: {
      commandsExecutedByReview: false,
      sourceBoundaryPreserved: input.intake.intakeStatus !== 'boundary_violation'
        && input.intake.boundaryCompliance.sourceBoundaryPreserved
    },
    maintainerReviewBoundary: MAINTAINER_REVIEW_BOUNDARY,
    redactionBoundary: input.intake.redactionBoundary,
    nonAuthorizationBoundary: NON_AUTHORIZATION_BOUNDARY,
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
  };
}

export async function writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(
  input: WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageInput
): Promise<WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageResult> {
  const [sourceIntakeText, sourceTaskPackageText, decisionsText] = await Promise.all([
    readFile(input.intakePath, 'utf8'), readFile(input.taskPackagePath, 'utf8'), readFile(input.decisionsPath, 'utf8')
  ]);
  let intake: unknown;
  let decisionInput: unknown;
  try { intake = JSON.parse(sourceIntakeText); decisionInput = JSON.parse(decisionsText); } catch { throw invalidDecisions(); }
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(intake);
  const reviewPackage = buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    intakePath: input.intakePath, sourceIntakeText, sourceTaskPackageText, intake,
    decisionInput: decisionInput as BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInput
  });
  const jsonPath = join(input.outputDir, OUTPUT_JSON_NAME);
  const markdownPath = join(input.outputDir, OUTPUT_MARKDOWN_NAME);
  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(reviewPackage, null, 2)}\n`);
  await writeFile(markdownPath, buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageMarkdown(reviewPackage));
  return { jsonPath, markdownPath, reviewPackage };
}

export async function writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageFromDirectory(
  input: WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageFromDirectoryInput
): Promise<WriteBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageResult> {
  return writeBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    intakePath: join(input.inputDir, INTAKE_JSON_NAME),
    taskPackagePath: join(input.inputDir, 'blocked-goal-recovery-resume-attempt-task-package.json'),
    decisionsPath: join(input.inputDir, DECISIONS_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

export function buildBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageMarkdown(
  value: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage
): string {
  return [
    '# RepoAssure Blocked Goal Recovery Resume Attempt Evidence Review Decision Package', '',
    `Generated at: ${value.generatedAt}`, `Review status: ${value.reviewStatus}`,
    `Source intake SHA-256: ${value.sourceEvidenceIntake.sha256}`, '',
    '## Evidence Review Decisions', '',
    '| Evidence key | Source status | Decision | Evidence | Reviewer | Rationale |',
    '| --- | --- | --- | --- | --- | --- |',
    ...value.reviewItems.map((item) => `| ${[
      item.evidenceKey, item.sourceStatus, item.decision, item.decisionEvidence || 'n/a',
      item.reviewerRole || 'n/a', item.rationale || 'n/a'
    ].map(escapeMarkdownTableCell).join(' | ')} |`),
    '', '## Unresolved Evidence', '',
    ...(value.unresolvedEvidenceKeys.length ? value.unresolvedEvidenceKeys.map((item) => `- ${item}`) : ['- none']),
    '', '## Maintainer Review Boundary', '', `- ${value.maintainerReviewBoundary}`,
    `- Commands executed by this review: ${String(value.boundaryCompliance.commandsExecutedByReview)}`,
    '', '## Blocked Actions', '', ...value.blockedActions.map((item) => `- ${item}`),
    '', '## Redaction Boundary', '', `- ${value.redactionBoundary}`,
    '', '## Non-Authorization Boundary', '', `- ${value.nonAuthorizationBoundary}`, ''
  ].join('\n');
}

function buildEvidenceSources(intake: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake) {
  return [
    ...intake.actionResults.map((item) => source('action', item.actionKey, item)),
    ...intake.resumeCommandResults.map((item) => source('command', item.commandId, item)),
    ...intake.verificationResults.map((item) => source('verification', item.checkId, item))
  ];
}

function source(
  evidenceType: 'action' | 'command' | 'verification',
  sourceId: string,
  item: { status: BlockedGoalRecoveryResumeAttemptEvidenceResultStatus; summary: string; evidenceRefs: string[] }
) {
  return {
    evidenceKey: `${evidenceType}:${sourceId}`, evidenceType, sourceId,
    sourceStatus: item.status, sourceSummary: item.summary, sourceEvidenceRefs: [...item.evidenceRefs]
  };
}

function deriveReviewStatus(
  intake: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  items: BlockedGoalRecoveryResumeAttemptEvidenceReviewItem[]
): BlockedGoalRecoveryResumeAttemptEvidenceReviewStatus {
  if (intake.intakeStatus === 'boundary_violation') return 'blocked_by_boundary_violation';
  if (items.some((item) => item.decision === 'changes_requested')) return 'changes_requested';
  if (items.some((item) => item.decision === 'defer')) return 'deferred';
  if (intake.intakeStatus !== 'complete_for_maintainer_review'
    || items.length === 0 || items.some((item) => item.decision === 'unreviewed')) return 'blocked_or_incomplete';
  if (items.some((item) => item.decision === 'accept_risk')) return 'accepted_with_risk';
  return 'accepted';
}

function summarize(items: BlockedGoalRecoveryResumeAttemptEvidenceReviewItem[]) {
  const count = (decision: BlockedGoalRecoveryResumeAttemptEvidenceRecordedDecision) =>
    items.filter((item) => item.decision === decision).length;
  const unreviewed = count('unreviewed');
  return {
    total: items.length, reviewed: items.length - unreviewed, accepted: count('accept'),
    changesRequested: count('changes_requested'), deferred: count('defer'),
    acceptedRisk: count('accept_risk'), unreviewed
  };
}

function assertDecisionInput(
  value: unknown,
  intake: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  sourceSha256: string
): asserts value is BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInput {
  if (!isRecord(value) || value.sourceEvidenceIntakeSha256 !== sourceSha256
    || !Array.isArray(value.decisions) || !value.decisions.every(isDecisionInputItem)
    || !exactKeys(value, ['sourceEvidenceIntakeSha256', 'decisions'])) throw invalidDecisions();
  const sources = new Map(buildEvidenceSources(intake).map((item) => [item.evidenceKey, item]));
  const keys = value.decisions.map((item) => (item as BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInputItem).evidenceKey);
  if (new Set(keys).size !== keys.length || keys.some((key) => !sources.has(key))
    || value.decisions.some((raw) => {
      const item = raw as BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionInputItem;
      const sourceItem = sources.get(item.evidenceKey)!;
      return (item.decision === 'accept' && sourceItem.sourceStatus !== 'passed')
        || (intake.intakeStatus === 'boundary_violation'
          && (item.decision === 'accept' || item.decision === 'accept_risk'));
    })) throw invalidDecisions();
}

function isDecisionInputItem(value: unknown): boolean {
  return isRecord(value) && canonicalValue(value.evidenceKey) && isDecision(value.decision)
    && canonicalValue(value.evidence) && canonicalValue(value.reviewerRole)
    && (value.rationale === undefined || value.rationale === '' || canonicalValue(value.rationale))
    && (value.decision === 'accept' || canonicalValue(value.rationale))
    && exactKeys(value, value.rationale === undefined
      ? ['evidenceKey', 'decision', 'evidence', 'reviewerRole']
      : ['evidenceKey', 'decision', 'evidence', 'reviewerRole', 'rationale']);
}

function isDecision(value: unknown): boolean {
  return value === 'accept' || value === 'changes_requested' || value === 'defer' || value === 'accept_risk';
}
function exactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(value).sort(); const sorted = [...expected].sort();
  return actual.length === sorted.length && actual.every((item, index) => item === sorted[index]);
}
function canonicalValue(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && canonical(value) === value;
}
function canonical(value: string): string { return redactSensitiveText(value).replace(/\s+/gu, ' ').trim(); }
function canonicalPath(value: string): string { return value.replaceAll('\\', '/').split('/').map(canonical).join('/'); }
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function invalidIntake(): Error { return new Error('Invalid blocked goal recovery resume attempt execution evidence intake'); }
function invalidDecisions(): Error { return new Error('Invalid blocked goal recovery resume attempt evidence review decisions'); }
