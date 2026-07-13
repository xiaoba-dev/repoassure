import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import {
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  type BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage
} from './blocked-goal-recovery-resume-attempt-evidence-review-decision-package.js';
import {
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeSourceBinding,
  type BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake
} from './blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';
import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from './blocked-goal-recovery-package.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export interface BlockedGoalRecoveryResumeAttemptClosureInput {
  sourceEvidenceReviewPackageSha256: string;
  closureEvidence: string;
  reviewerRole: string;
  acknowledgedRiskEvidenceKeys: string[];
}

export interface BuildBlockedGoalRecoveryResumeAttemptClosureReceiptInput {
  generatedAt?: string;
  reviewPackagePath: string;
  sourceReviewPackageText: string;
  sourceIntakeText: string;
  sourceTaskPackageText: string;
  reviewPackage: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage;
  closureInput: BlockedGoalRecoveryResumeAttemptClosureInput;
}

export interface WriteBlockedGoalRecoveryResumeAttemptClosureReceiptInput {
  generatedAt?: string;
  reviewPackagePath: string;
  intakePath: string;
  taskPackagePath: string;
  closureInputPath: string;
  outputDir: string;
}

export interface WriteBlockedGoalRecoveryResumeAttemptClosureReceiptFromDirectoryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface BlockedGoalRecoveryResumeAttemptClosureReceipt {
  schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1';
  generatedAt: string;
  closureStatus: 'closed' | 'closed_with_accepted_risk';
  sourceEvidenceReviewPackage: {
    schemaVersion: string;
    fileName: string;
    path: string;
    sha256: string;
    reviewStatus: 'accepted' | 'accepted_with_risk';
  };
  closureEvidence: string;
  reviewerRole: string;
  closedEvidenceScope: string[];
  acceptedRiskEvidenceKeys: string[];
  residualRisks: Array<{ evidenceKey: string; rationale: string; decisionEvidence: string }>;
  verificationSummary: { total: number; accepted: number; acceptedRisk: number };
  boundaryCompliance: {
    commandsExecutedByClosure: false;
    externalGoalClosedByReceipt: false;
    sourceBoundaryPreserved: true;
  };
  maintainerReviewBoundary: string;
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  blockedActions: string[];
}

export interface WriteBlockedGoalRecoveryResumeAttemptClosureReceiptResult {
  jsonPath: string;
  markdownPath: string;
  receipt: BlockedGoalRecoveryResumeAttemptClosureReceipt;
}

const REVIEW_JSON_NAME = 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json';
const CLOSURE_INPUT_JSON_NAME = 'blocked-goal-recovery-resume-attempt-closure-input.json';
const OUTPUT_JSON_NAME = 'blocked-goal-recovery-resume-attempt-closure-receipt.json';
const OUTPUT_MARKDOWN_NAME = 'blocked-goal-recovery-resume-attempt-closure-receipt.md';
const MAINTAINER_REVIEW_BOUNDARY =
  'This receipt records local closure of accepted resume-attempt evidence; it does not execute commands, close an external goal, or authorize follow-on work.';
const NON_AUTHORIZATION_BOUNDARY =
  'This closure receipt does not execute recovery commands, modify target repo files, create target repo branch, commit, pull request, issue, or advisory, publish npm, create GitHub release, run public launch, contact customers, change pricing/spend, change repository visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.';

export function assertBlockedGoalRecoveryResumeAttemptClosureReceipt(
  value: unknown
): asserts value is BlockedGoalRecoveryResumeAttemptClosureReceipt {
  if (!isRecord(value)
    || value.schemaVersion !== 'repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1'
    || !canonicalValue(value.generatedAt)
    || (value.closureStatus !== 'closed' && value.closureStatus !== 'closed_with_accepted_risk')
    || !isRecord(value.sourceEvidenceReviewPackage)
    || value.sourceEvidenceReviewPackage.schemaVersion
      !== 'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1'
    || !canonicalValue(value.sourceEvidenceReviewPackage.fileName)
    || !canonicalValue(value.sourceEvidenceReviewPackage.path)
    || typeof value.sourceEvidenceReviewPackage.sha256 !== 'string'
    || !/^[a-f0-9]{64}$/u.test(value.sourceEvidenceReviewPackage.sha256)
    || (value.sourceEvidenceReviewPackage.reviewStatus !== 'accepted'
      && value.sourceEvidenceReviewPackage.reviewStatus !== 'accepted_with_risk')
    || !exactKeys(value.sourceEvidenceReviewPackage, [
      'schemaVersion', 'fileName', 'path', 'sha256', 'reviewStatus'
    ])
    || !canonicalValue(value.closureEvidence) || !canonicalValue(value.reviewerRole)
    || !Array.isArray(value.closedEvidenceScope) || !value.closedEvidenceScope.every(canonicalValue)
    || !Array.isArray(value.acceptedRiskEvidenceKeys) || !value.acceptedRiskEvidenceKeys.every(canonicalValue)
    || new Set(value.acceptedRiskEvidenceKeys).size !== value.acceptedRiskEvidenceKeys.length
    || !Array.isArray(value.residualRisks) || !value.residualRisks.every((item) =>
      isRecord(item) && canonicalValue(item.evidenceKey) && canonicalValue(item.rationale)
      && canonicalValue(item.decisionEvidence)
      && exactKeys(item, ['evidenceKey', 'rationale', 'decisionEvidence'])
    )
    || !isVerificationSummary(value.verificationSummary)
    || !isRecord(value.boundaryCompliance)
    || value.boundaryCompliance.commandsExecutedByClosure !== false
    || value.boundaryCompliance.externalGoalClosedByReceipt !== false
    || value.boundaryCompliance.sourceBoundaryPreserved !== true
    || !exactKeys(value.boundaryCompliance, [
      'commandsExecutedByClosure', 'externalGoalClosedByReceipt', 'sourceBoundaryPreserved'
    ])
    || value.maintainerReviewBoundary !== MAINTAINER_REVIEW_BOUNDARY
    || !canonicalValue(value.redactionBoundary)
    || value.nonAuthorizationBoundary !== NON_AUTHORIZATION_BOUNDARY
    || !hasCanonicalBlockedActions(value.blockedActions)
    || !exactKeys(value, [
      'schemaVersion', 'generatedAt', 'closureStatus', 'sourceEvidenceReviewPackage', 'closureEvidence',
      'reviewerRole', 'closedEvidenceScope', 'acceptedRiskEvidenceKeys', 'residualRisks',
      'verificationSummary', 'boundaryCompliance', 'maintainerReviewBoundary', 'redactionBoundary',
      'nonAuthorizationBoundary', 'blockedActions'
    ])) throw invalidClosureReceipt();
}

export function assertBlockedGoalRecoveryResumeAttemptClosureReceiptSourceBinding(
  receipt: BlockedGoalRecoveryResumeAttemptClosureReceipt,
  reviewPackage: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  sourceReviewPackageText: string
): void {
  let parsedReviewPackage: unknown;
  try { parsedReviewPackage = JSON.parse(sourceReviewPackageText); } catch { throw invalidReviewPackage(); }
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(parsedReviewPackage);
  assertBlockedGoalRecoveryResumeAttemptClosureReceipt(receipt);
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(reviewPackage);
  const riskItems = reviewPackage.reviewItems.filter((item) => item.decision === 'accept_risk');
  const expectedResidualRisks = riskItems.map((item) => ({
    evidenceKey: item.evidenceKey, rationale: item.rationale, decisionEvidence: item.decisionEvidence
  }));
  const expectedSummary = {
    total: reviewPackage.decisionSummary.total,
    accepted: reviewPackage.decisionSummary.accepted,
    acceptedRisk: reviewPackage.decisionSummary.acceptedRisk
  };
  if (!isDeepStrictEqual(parsedReviewPackage, reviewPackage)
    || (reviewPackage.reviewStatus !== 'accepted' && reviewPackage.reviewStatus !== 'accepted_with_risk')
    || receipt.sourceEvidenceReviewPackage.sha256 !== createHash('sha256').update(sourceReviewPackageText).digest('hex')
    || receipt.sourceEvidenceReviewPackage.reviewStatus !== reviewPackage.reviewStatus
    || receipt.closureStatus !== (riskItems.length > 0 ? 'closed_with_accepted_risk' : 'closed')
    || !isDeepStrictEqual(receipt.closedEvidenceScope, reviewPackage.acceptedEvidenceScope)
    || !isDeepStrictEqual(receipt.acceptedRiskEvidenceKeys, riskItems.map((item) => item.evidenceKey))
    || !isDeepStrictEqual(receipt.residualRisks, expectedResidualRisks)
    || !isDeepStrictEqual(receipt.verificationSummary, expectedSummary)) throw invalidClosureReceipt();
}

export function buildBlockedGoalRecoveryResumeAttemptClosureReceipt(
  input: BuildBlockedGoalRecoveryResumeAttemptClosureReceiptInput
): BlockedGoalRecoveryResumeAttemptClosureReceipt {
  let parsedReviewPackage: unknown;
  try { parsedReviewPackage = JSON.parse(input.sourceReviewPackageText); } catch { throw invalidReviewPackage(); }
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(parsedReviewPackage);
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(input.reviewPackage);
  if (!isDeepStrictEqual(parsedReviewPackage, input.reviewPackage)) throw invalidReviewPackage();
  if (input.reviewPackage.reviewStatus !== 'accepted'
    && input.reviewPackage.reviewStatus !== 'accepted_with_risk') throw invalidReviewPackage();
  const intake = parseAndValidateIntake(input.sourceIntakeText);
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeSourceBinding(
    intake, input.sourceTaskPackageText
  );
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageSourceBinding(
    input.reviewPackage,
    intake,
    input.sourceIntakeText
  );

  const sourceSha256 = createHash('sha256').update(input.sourceReviewPackageText).digest('hex');
  const riskItems = input.reviewPackage.reviewItems.filter((item) => item.decision === 'accept_risk');
  const riskKeys = riskItems.map((item) => item.evidenceKey);
  assertClosureInput(input.closureInput, sourceSha256, riskKeys);

  return {
    schemaVersion: 'repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1',
    generatedAt: canonical(input.generatedAt ?? new Date().toISOString()),
    closureStatus: riskKeys.length > 0 ? 'closed_with_accepted_risk' : 'closed',
    sourceEvidenceReviewPackage: {
      schemaVersion: input.reviewPackage.schemaVersion,
      fileName: canonical(basename(input.reviewPackagePath)),
      path: canonicalPath(input.reviewPackagePath),
      sha256: sourceSha256,
      reviewStatus: input.reviewPackage.reviewStatus
    },
    closureEvidence: input.closureInput.closureEvidence,
    reviewerRole: input.closureInput.reviewerRole,
    closedEvidenceScope: [...input.reviewPackage.acceptedEvidenceScope],
    acceptedRiskEvidenceKeys: [...riskKeys],
    residualRisks: riskItems.map((item) => ({
      evidenceKey: item.evidenceKey, rationale: item.rationale, decisionEvidence: item.decisionEvidence
    })),
    verificationSummary: {
      total: input.reviewPackage.decisionSummary.total,
      accepted: input.reviewPackage.decisionSummary.accepted,
      acceptedRisk: input.reviewPackage.decisionSummary.acceptedRisk
    },
    boundaryCompliance: {
      commandsExecutedByClosure: false,
      externalGoalClosedByReceipt: false,
      sourceBoundaryPreserved: true
    },
    maintainerReviewBoundary: MAINTAINER_REVIEW_BOUNDARY,
    redactionBoundary: input.reviewPackage.redactionBoundary,
    nonAuthorizationBoundary: NON_AUTHORIZATION_BOUNDARY,
    blockedActions: [...BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS]
  };
}

export async function writeBlockedGoalRecoveryResumeAttemptClosureReceipt(
  input: WriteBlockedGoalRecoveryResumeAttemptClosureReceiptInput
): Promise<WriteBlockedGoalRecoveryResumeAttemptClosureReceiptResult> {
  const [sourceReviewPackageText, sourceIntakeText, sourceTaskPackageText, closureInputText] = await Promise.all([
    readFile(input.reviewPackagePath, 'utf8'), readFile(input.intakePath, 'utf8'),
    readFile(input.taskPackagePath, 'utf8'), readFile(input.closureInputPath, 'utf8')
  ]);
  let reviewPackage: unknown;
  let closureInput: unknown;
  try { reviewPackage = JSON.parse(sourceReviewPackageText); closureInput = JSON.parse(closureInputText); }
  catch { throw invalidClosureInput(); }
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(reviewPackage);
  const receipt = buildBlockedGoalRecoveryResumeAttemptClosureReceipt({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    reviewPackagePath: input.reviewPackagePath,
    sourceReviewPackageText,
    sourceIntakeText,
    sourceTaskPackageText,
    reviewPackage,
    closureInput: closureInput as BlockedGoalRecoveryResumeAttemptClosureInput
  });
  const jsonPath = join(input.outputDir, OUTPUT_JSON_NAME);
  const markdownPath = join(input.outputDir, OUTPUT_MARKDOWN_NAME);
  await mkdir(input.outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(receipt, null, 2)}\n`);
  await writeFile(markdownPath, buildBlockedGoalRecoveryResumeAttemptClosureReceiptMarkdown(receipt));
  return { jsonPath, markdownPath, receipt };
}

export async function writeBlockedGoalRecoveryResumeAttemptClosureReceiptFromDirectory(
  input: WriteBlockedGoalRecoveryResumeAttemptClosureReceiptFromDirectoryInput
): Promise<WriteBlockedGoalRecoveryResumeAttemptClosureReceiptResult> {
  return writeBlockedGoalRecoveryResumeAttemptClosureReceipt({
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    reviewPackagePath: join(input.inputDir, REVIEW_JSON_NAME),
    intakePath: join(input.inputDir, 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json'),
    taskPackagePath: join(input.inputDir, 'blocked-goal-recovery-resume-attempt-task-package.json'),
    closureInputPath: join(input.inputDir, CLOSURE_INPUT_JSON_NAME),
    outputDir: input.outputDir ?? input.inputDir
  });
}

function parseAndValidateIntake(sourceIntakeText: string): BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake {
  let intake: unknown;
  try { intake = JSON.parse(sourceIntakeText); } catch { throw invalidReviewPackage(); }
  try { assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(intake); }
  catch { throw invalidReviewPackage(); }
  return intake;
}

export function assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageSourceBinding(
  reviewPackage: BlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage,
  intake: BlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  sourceIntakeText: string
): void {
  let parsedIntake: unknown;
  try { parsedIntake = JSON.parse(sourceIntakeText); } catch { throw invalidReviewPackage(); }
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(parsedIntake);
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(intake);
  const expectedSources = [
    ...intake.actionResults.map((item) => sourceItem('action', item.actionKey, item)),
    ...intake.resumeCommandResults.map((item) => sourceItem('command', item.commandId, item)),
    ...intake.verificationResults.map((item) => sourceItem('verification', item.checkId, item))
  ];
  const actualSources = reviewPackage.reviewItems.map((item) => ({
    evidenceKey: item.evidenceKey, evidenceType: item.evidenceType, sourceId: item.sourceId,
    sourceStatus: item.sourceStatus, sourceSummary: item.sourceSummary, sourceEvidenceRefs: item.sourceEvidenceRefs
  }));
  const intakeSha256 = createHash('sha256').update(sourceIntakeText).digest('hex');
  if (!isDeepStrictEqual(parsedIntake, intake)
    || reviewPackage.sourceEvidenceIntake.sha256 !== intakeSha256
    || reviewPackage.sourceEvidenceIntake.intakeStatus !== intake.intakeStatus
    || !isDeepStrictEqual(actualSources, expectedSources)) throw invalidReviewPackage();
}

function sourceItem(
  evidenceType: 'action' | 'command' | 'verification',
  sourceId: string,
  item: { status: string; summary: string; evidenceRefs: string[] }
) {
  return {
    evidenceKey: `${evidenceType}:${sourceId}`, evidenceType, sourceId,
    sourceStatus: item.status, sourceSummary: item.summary, sourceEvidenceRefs: [...item.evidenceRefs]
  };
}

export function buildBlockedGoalRecoveryResumeAttemptClosureReceiptMarkdown(
  value: BlockedGoalRecoveryResumeAttemptClosureReceipt
): string {
  return [
    '# RepoAssure Blocked Goal Recovery Resume Attempt Closure Receipt', '',
    `Generated at: ${value.generatedAt}`, `Closure status: ${value.closureStatus}`,
    `Source review package SHA-256: ${value.sourceEvidenceReviewPackage.sha256}`, '',
    '## Closed Evidence Scope', '',
    ...value.closedEvidenceScope.map((item) => `- ${item}`),
    '', '## Residual Risks', '',
    ...(value.residualRisks.length ? [
      '| Evidence key | Rationale | Decision evidence |', '| --- | --- | --- |',
      ...value.residualRisks.map((item) => `| ${[
        item.evidenceKey, item.rationale, item.decisionEvidence
      ].map(escapeMarkdownTableCell).join(' | ')} |`)
    ] : ['- none']),
    '', '## Closure Evidence', '', `- Evidence: ${value.closureEvidence}`, `- Reviewer role: ${value.reviewerRole}`,
    '', '## Maintainer Review Boundary', '', `- ${value.maintainerReviewBoundary}`,
    `- Commands executed by closure: ${String(value.boundaryCompliance.commandsExecutedByClosure)}`,
    `- External goal closed by receipt: ${String(value.boundaryCompliance.externalGoalClosedByReceipt)}`,
    '', '## Blocked Actions', '', ...value.blockedActions.map((item) => `- ${item}`),
    '', '## Redaction Boundary', '', `- ${value.redactionBoundary}`,
    '', '## Non-Authorization Boundary', '', `- ${value.nonAuthorizationBoundary}`, ''
  ].join('\n');
}

function assertClosureInput(value: unknown, sourceSha256: string, riskKeys: string[]):
asserts value is BlockedGoalRecoveryResumeAttemptClosureInput {
  if (!isRecord(value) || value.sourceEvidenceReviewPackageSha256 !== sourceSha256
    || !canonicalValue(value.closureEvidence) || !canonicalValue(value.reviewerRole)
    || !Array.isArray(value.acknowledgedRiskEvidenceKeys)
    || !value.acknowledgedRiskEvidenceKeys.every(canonicalValue)
    || new Set(value.acknowledgedRiskEvidenceKeys).size !== value.acknowledgedRiskEvidenceKeys.length
    || !isDeepStrictEqual(value.acknowledgedRiskEvidenceKeys, riskKeys)
    || !exactKeys(value, [
      'sourceEvidenceReviewPackageSha256', 'closureEvidence', 'reviewerRole', 'acknowledgedRiskEvidenceKeys'
    ])) throw invalidClosureInput();
}

function exactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(value).sort(); const sorted = [...expected].sort();
  return actual.length === sorted.length && actual.every((item, index) => item === sorted[index]);
}
function isVerificationSummary(value: unknown): value is { total: number; accepted: number; acceptedRisk: number } {
  return isRecord(value)
    && ['total', 'accepted', 'acceptedRisk'].every((key) =>
      typeof value[key] === 'number' && Number.isInteger(value[key]) && value[key] >= 0
    )
    && exactKeys(value, ['total', 'accepted', 'acceptedRisk']);
}
function hasCanonicalBlockedActions(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length === BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.length
    && value.every((item) => typeof item === 'string')
    && BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.every((item) => value.includes(item));
}
function canonicalValue(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && canonical(value) === value;
}
function canonical(value: string): string { return redactSensitiveText(value).replace(/\s+/gu, ' ').trim(); }
function canonicalPath(value: string): string { return value.replaceAll('\\', '/').split('/').map(canonical).join('/'); }
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function invalidReviewPackage(): Error {
  return new Error('Invalid blocked goal recovery resume attempt evidence review decision package');
}
function invalidClosureInput(): Error {
  return new Error('Invalid blocked goal recovery resume attempt closure input');
}
function invalidClosureReceipt(): Error {
  return new Error('Invalid blocked goal recovery resume attempt closure receipt');
}
