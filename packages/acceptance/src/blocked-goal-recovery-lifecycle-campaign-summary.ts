import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, join, resolve, sep } from 'node:path';

import {
  assertBlockedGoalRecoveryConsumptionReportSourceBinding,
  assertBlockedGoalRecoveryPackage
} from './blocked-goal-recovery-consumption-report.js';
import {
  assertBlockedGoalRecoveryConsumptionReport,
  assertBlockedGoalRecoveryDecisionReceiptSourceBinding
} from './blocked-goal-recovery-decision-receipt.js';
import { BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS } from './blocked-goal-recovery-package.js';
import {
  assertBlockedGoalRecoveryResumeAttemptClosureReceipt,
  assertBlockedGoalRecoveryResumeAttemptClosureReceiptSourceBinding,
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageSourceBinding
} from './blocked-goal-recovery-resume-attempt-closure-receipt.js';
import {
  assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage
} from './blocked-goal-recovery-resume-attempt-evidence-review-decision-package.js';
import {
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake,
  assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeSourceBinding,
  assertBlockedGoalRecoveryResumeAttemptTaskPackage
} from './blocked-goal-recovery-resume-attempt-execution-evidence-intake.js';
import {
  assertBlockedGoalRecoveryDecisionReceipt,
  assertBlockedGoalRecoveryResumeAttemptTaskPackageSourceBinding
} from './blocked-goal-recovery-resume-attempt-task-package.js';
import { escapeMarkdownTableCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

export type BlockedGoalRecoveryLifecycleOutcome =
  | 'accepted' | 'accepted_with_risk' | 'blocked' | 'failed' | 'incomplete'
  | 'environment_blocker' | 'boundary_violation' | 'rejected_tampered';

export interface BlockedGoalRecoveryLifecycleCampaignScenarioInput {
  scenarioId: string;
  expectedOutcome: BlockedGoalRecoveryLifecycleOutcome;
  artifactDir: string;
}

export interface BlockedGoalRecoveryLifecycleCampaignInput {
  schemaVersion: 'repoassure.blocked-goal-recovery-lifecycle-campaign-input.v1';
  campaignId: string;
  scenarios: BlockedGoalRecoveryLifecycleCampaignScenarioInput[];
}

export interface BlockedGoalRecoveryLifecycleCampaignScenarioSummary {
  scenarioId: string;
  expectedOutcome: BlockedGoalRecoveryLifecycleOutcome;
  actualOutcome: BlockedGoalRecoveryLifecycleOutcome;
  status: 'passed' | 'failed';
  terminalStage: string;
  trustChainVerified: boolean;
  boundaryPreserved: boolean;
  redactionPreserved: boolean;
  commandsExecuted: false;
  externalStateChanged: false;
  evidence: Array<{ fileName: string; sha256: string }>;
}

export interface BlockedGoalRecoveryLifecycleCampaignSummary {
  schemaVersion: 'repoassure.blocked-goal-recovery-lifecycle-campaign-summary.v1';
  generatedAt: string;
  campaignId: string;
  campaignStatus: {
    status: 'passed' | 'failed';
    totalScenarios: number;
    passedScenarios: number;
    failedScenarios: number;
    rejectedTamperedScenarios: number;
  };
  coverage: Record<BlockedGoalRecoveryLifecycleOutcome, boolean>;
  scenarios: BlockedGoalRecoveryLifecycleCampaignScenarioSummary[];
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
}

export interface WriteBlockedGoalRecoveryLifecycleCampaignSummaryInput {
  generatedAt?: string;
  inputDir: string;
  outputDir?: string;
}

export interface WriteBlockedGoalRecoveryLifecycleCampaignSummaryResult {
  jsonPath: string;
  markdownPath: string;
  summary: BlockedGoalRecoveryLifecycleCampaignSummary;
}

const INPUT_NAME = 'blocked-goal-recovery-lifecycle-campaign-input.json';
const OUTPUT_JSON_NAME = 'blocked-goal-recovery-lifecycle-campaign-summary.json';
const OUTPUT_MARKDOWN_NAME = 'blocked-goal-recovery-lifecycle-campaign-summary.md';
const OUTCOMES: BlockedGoalRecoveryLifecycleOutcome[] = [
  'accepted', 'accepted_with_risk', 'blocked', 'failed', 'incomplete',
  'environment_blocker', 'boundary_violation', 'rejected_tampered'
];

const STAGES = [
  { key: 'recovery', fileName: 'blocked-goal-recovery-package.json', schema: 'repoassure.blocked-goal-recovery-package.v1' },
  { key: 'consumption', fileName: 'blocked-goal-recovery-consumption-report.json', schema: 'repoassure.blocked-goal-recovery-consumption-report.v1', sourceField: 'sourceRecoveryPackage' },
  { key: 'decision', fileName: 'blocked-goal-recovery-decision-receipt.json', schema: 'repoassure.blocked-goal-recovery-decision-receipt.v1', sourceField: 'sourceConsumptionReport' },
  { key: 'task', fileName: 'blocked-goal-recovery-resume-attempt-task-package.json', schema: 'repoassure.blocked-goal-recovery-resume-attempt-task-package.v1', sourceField: 'sourceDecisionReceipt' },
  { key: 'intake', fileName: 'blocked-goal-recovery-resume-attempt-execution-evidence-intake.json', schema: 'repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1', sourceField: 'sourceTaskPackage' },
  { key: 'review', fileName: 'blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json', schema: 'repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1', sourceField: 'sourceEvidenceIntake' },
  { key: 'closure', fileName: 'blocked-goal-recovery-resume-attempt-closure-receipt.json', schema: 'repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1', sourceField: 'sourceEvidenceReviewPackage' }
] as const;

export async function writeBlockedGoalRecoveryLifecycleCampaignSummary(
  input: WriteBlockedGoalRecoveryLifecycleCampaignSummaryInput
): Promise<WriteBlockedGoalRecoveryLifecycleCampaignSummaryResult> {
  const sourceText = await readFile(join(input.inputDir, INPUT_NAME), 'utf8');
  let campaignInput: unknown;
  try { campaignInput = JSON.parse(sourceText); } catch { throw invalidCampaignInput(); }
  assertCampaignInput(campaignInput);
  const scenarios = await Promise.all(campaignInput.scenarios.map((scenario) =>
    validateScenario(input.inputDir, scenario)
  ));
  const passedScenarios = scenarios.filter((scenario) => scenario.status === 'passed').length;
  const summary: BlockedGoalRecoveryLifecycleCampaignSummary = {
    schemaVersion: 'repoassure.blocked-goal-recovery-lifecycle-campaign-summary.v1',
    generatedAt: canonical(input.generatedAt ?? new Date().toISOString()),
    campaignId: campaignInput.campaignId,
    campaignStatus: {
      status: passedScenarios === scenarios.length ? 'passed' : 'failed',
      totalScenarios: scenarios.length,
      passedScenarios,
      failedScenarios: scenarios.length - passedScenarios,
      rejectedTamperedScenarios: scenarios.filter((scenario) => scenario.actualOutcome === 'rejected_tampered').length
    },
    coverage: Object.fromEntries(OUTCOMES.map((outcome) => [
      outcome, scenarios.some((scenario) => scenario.expectedOutcome === outcome && scenario.status === 'passed')
    ])) as Record<BlockedGoalRecoveryLifecycleOutcome, boolean>,
    scenarios,
    redactionBoundary: 'This local campaign summary records sanitized artifact names, hashes, outcomes, and boundaries only; it does not copy target repo source, secrets, credentials, customer data, or raw private evidence.',
    nonAuthorizationBoundary: 'This validation does not execute recovery commands, change external state, mutate target repos, publish, launch, contact customers, change pricing/spend or repository visibility, or claim commercial/hosted availability.'
  };
  if (summary.campaignStatus.status !== 'passed') throw invalidCampaignEvidence();
  const outputDir = input.outputDir ?? input.inputDir;
  const jsonPath = join(outputDir, OUTPUT_JSON_NAME);
  const markdownPath = join(outputDir, OUTPUT_MARKDOWN_NAME);
  await mkdir(outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(markdownPath, buildBlockedGoalRecoveryLifecycleCampaignSummaryMarkdown(summary));
  return { jsonPath, markdownPath, summary };
}

export function buildBlockedGoalRecoveryLifecycleCampaignSummaryMarkdown(
  summary: BlockedGoalRecoveryLifecycleCampaignSummary
): string {
  return [
    '# RepoAssure Blocked Goal Recovery Full Lifecycle Campaign Summary', '',
    `Generated at: ${summary.generatedAt}`, `Campaign: ${summary.campaignId}`,
    `Status: ${summary.campaignStatus.status}`, '',
    '## Outcome Coverage', '',
    ...OUTCOMES.map((outcome) => `- ${outcome}: ${String(summary.coverage[outcome])}`),
    '', '## Scenarios', '',
    '| Scenario | Expected | Actual | Terminal stage | Trust chain | Boundary |',
    '| --- | --- | --- | --- | --- | --- |',
    ...summary.scenarios.map((scenario) => `| ${[
      scenario.scenarioId, scenario.expectedOutcome, scenario.actualOutcome, scenario.terminalStage,
      String(scenario.trustChainVerified), String(scenario.boundaryPreserved)
    ].map(escapeMarkdownTableCell).join(' | ')} |`),
    '', '## Boundaries', '', `- ${summary.redactionBoundary}`, `- ${summary.nonAuthorizationBoundary}`, ''
  ].join('\n');
}

async function validateScenario(
  inputDir: string,
  scenario: BlockedGoalRecoveryLifecycleCampaignScenarioInput
): Promise<BlockedGoalRecoveryLifecycleCampaignScenarioSummary> {
  const artifacts: Array<{ stage: typeof STAGES[number]; text: string; value: Record<string, unknown> }> = [];
  let artifactValidationCompleted = false;
  let artifactObserved = false;
  try {
    const artifactDir = await resolveArtifactDir(inputDir, scenario.artifactDir);
    let gapFound = false;
    for (const stage of STAGES) {
      const loaded = await readStageIfExists(artifactDir, stage, () => { artifactObserved = true; });
      if (!loaded) { gapFound = true; continue; }
      if (gapFound) throw invalidCampaignEvidence();
      artifacts.push({ stage, ...loaded });
    }
    if (artifacts.length === 0) throw invalidCampaignEvidence();
    validateArtifactSemantics(artifacts);
    validateArtifactChain(artifacts);
    artifactValidationCompleted = true;
    const actualOutcome = deriveOutcome(artifacts);
    if (actualOutcome !== scenario.expectedOutcome) throw invalidCampaignEvidence();
    return scenarioSummary(scenario, actualOutcome, artifacts, true);
  } catch (error) {
    if (scenario.expectedOutcome !== 'rejected_tampered'
      || !(error instanceof CampaignEvidenceError) || !artifactObserved || artifactValidationCompleted) {
      if (error instanceof CampaignEvidenceError) throw error;
      throw invalidCampaignEvidence();
    }
    return {
      scenarioId: scenario.scenarioId,
      expectedOutcome: scenario.expectedOutcome,
      actualOutcome: 'rejected_tampered', status: 'passed', terminalStage: 'rejected',
      trustChainVerified: false, boundaryPreserved: true, redactionPreserved: true,
      commandsExecuted: false, externalStateChanged: false,
      evidence: artifacts.map((artifact) => ({
        fileName: artifact.stage.fileName,
        sha256: sha256(artifact.text)
      }))
    };
  }
}

function validateArtifactSemantics(
  artifacts: Array<{ stage: typeof STAGES[number]; text: string; value: Record<string, unknown> }>
): void {
  for (const artifact of artifacts) {
    try {
      if (artifact.stage.key === 'recovery') assertBlockedGoalRecoveryPackage(artifact.value);
      else if (artifact.stage.key === 'consumption') assertBlockedGoalRecoveryConsumptionReport(artifact.value);
      else if (artifact.stage.key === 'decision') assertBlockedGoalRecoveryDecisionReceipt(artifact.value);
      else if (artifact.stage.key === 'task') assertBlockedGoalRecoveryResumeAttemptTaskPackage(artifact.value);
      else if (artifact.stage.key === 'intake') assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(artifact.value);
      else if (artifact.stage.key === 'review') {
        assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(artifact.value);
      } else assertBlockedGoalRecoveryResumeAttemptClosureReceipt(artifact.value);
    } catch {
      throw invalidCampaignEvidence();
    }
  }

  const task = artifacts.find((artifact) => artifact.stage.key === 'task');
  const recovery = artifacts.find((artifact) => artifact.stage.key === 'recovery');
  const consumption = artifacts.find((artifact) => artifact.stage.key === 'consumption');
  const decision = artifacts.find((artifact) => artifact.stage.key === 'decision');
  const intake = artifacts.find((artifact) => artifact.stage.key === 'intake');
  const review = artifacts.find((artifact) => artifact.stage.key === 'review');
  const closure = artifacts.find((artifact) => artifact.stage.key === 'closure');
  try {
    if (recovery && consumption) {
      assertBlockedGoalRecoveryPackage(recovery.value);
      assertBlockedGoalRecoveryConsumptionReport(consumption.value);
      assertBlockedGoalRecoveryConsumptionReportSourceBinding(
        consumption.value,
        recovery.value,
        recovery.text
      );
    }
    if (consumption && decision) {
      assertBlockedGoalRecoveryConsumptionReport(consumption.value);
      assertBlockedGoalRecoveryDecisionReceipt(decision.value);
      assertBlockedGoalRecoveryDecisionReceiptSourceBinding(
        decision.value,
        consumption.value,
        consumption.text
      );
    }
    if (decision && task) {
      assertBlockedGoalRecoveryDecisionReceipt(decision.value);
      assertBlockedGoalRecoveryResumeAttemptTaskPackage(task.value);
      assertBlockedGoalRecoveryResumeAttemptTaskPackageSourceBinding(
        task.value,
        decision.value,
        decision.text
      );
    }
    if (task && intake) {
      assertBlockedGoalRecoveryResumeAttemptTaskPackage(task.value);
      assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(intake.value);
      assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntakeSourceBinding(intake.value, task.text);
    }
    if (intake && review) {
      assertBlockedGoalRecoveryResumeAttemptExecutionEvidenceIntake(intake.value);
      assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(review.value);
      assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackageSourceBinding(
        review.value,
        intake.value,
        intake.text
      );
    }
    if (review && closure) {
      assertBlockedGoalRecoveryResumeAttemptEvidenceReviewDecisionPackage(review.value);
      assertBlockedGoalRecoveryResumeAttemptClosureReceipt(closure.value);
      assertBlockedGoalRecoveryResumeAttemptClosureReceiptSourceBinding(
        closure.value,
        review.value,
        review.text
      );
    }
  } catch {
    throw invalidCampaignEvidence();
  }
}

async function readStageIfExists(
  artifactDir: string,
  stage: typeof STAGES[number],
  onObserved: () => void
): Promise<{
  text: string; value: Record<string, unknown>;
} | null> {
  let text: string;
  try {
    const stagePath = await realpath(join(artifactDir, stage.fileName));
    if (stagePath !== artifactDir && !stagePath.startsWith(`${artifactDir}${sep}`)) throw invalidCampaignInput();
    text = await readFile(stagePath, 'utf8');
    onObserved();
  }
  catch (error) {
    if (isRecord(error) && error.code === 'ENOENT') return null;
    throw error;
  }
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw invalidCampaignEvidence(); }
  if (containsUnsafeSecret(value)) throw invalidCampaignEvidence();
  if (!isRecord(value) || value.schemaVersion !== stage.schema
    || !Array.isArray(value.blockedActions) || !hasCanonicalBlockedActions(value.blockedActions)) {
    throw invalidCampaignEvidence();
  }
  return { text, value };
}

function validateArtifactChain(
  artifacts: Array<{ stage: typeof STAGES[number]; text: string; value: Record<string, unknown> }>
): void {
  for (let index = 1; index < artifacts.length; index += 1) {
    const current = artifacts[index]!;
    const previous = artifacts[index - 1]!;
    const sourceField = 'sourceField' in current.stage ? current.stage.sourceField : undefined;
    if (!sourceField || !isRecord(current.value[sourceField])
      || current.value[sourceField].sha256 !== sha256(previous.text)) throw invalidCampaignEvidence();
  }
}

function deriveOutcome(
  artifacts: Array<{ stage: typeof STAGES[number]; value: Record<string, unknown> }>
): BlockedGoalRecoveryLifecycleOutcome {
  const latest = artifacts.at(-1)!;
  if (latest.stage.key === 'closure') {
    if (latest.value.closureStatus === 'closed') return 'accepted';
    if (latest.value.closureStatus === 'closed_with_accepted_risk') return 'accepted_with_risk';
  }
  if (latest.stage.key === 'review') {
    if (latest.value.reviewStatus === 'blocked_by_boundary_violation') return 'boundary_violation';
    if (latest.value.reviewStatus === 'accepted' || latest.value.reviewStatus === 'accepted_with_risk') {
      return 'incomplete';
    }
    return 'blocked';
  }
  if (latest.stage.key === 'intake') {
    if (latest.value.intakeStatus === 'failed_or_blocked') return 'failed';
    if (latest.value.intakeStatus === 'incomplete' || latest.value.intakeStatus === 'source_not_ready') return 'incomplete';
    if (latest.value.intakeStatus === 'boundary_violation') return 'boundary_violation';
  }
  if (latest.stage.key === 'task' && isRecord(latest.value.boundaryCompliance)
    && latest.value.boundaryCompliance.sourceBoundaryPreserved === false) return 'boundary_violation';
  if (latest.stage.key === 'decision') {
    if (latest.value.resumeAttemptReadiness === 'blocked_by_boundary_violation') return 'boundary_violation';
    return latest.value.decisionStatus === 'approved_for_separate_resume_attempt'
      || latest.value.decisionStatus === 'accepted_with_risk' ? 'incomplete' : 'blocked';
  }
  if (latest.stage.key === 'consumption' && isRecord(latest.value.boundaryCompliance)
    && latest.value.boundaryCompliance.blockedActionsPreserved === false) return 'boundary_violation';
  if (latest.stage.key === 'recovery' && Array.isArray(latest.value.blockers)
    && latest.value.blockers.some((item) => isRecord(item) && item.category === 'environment')) {
    return 'environment_blocker';
  }
  return 'incomplete';
}

function scenarioSummary(
  scenario: BlockedGoalRecoveryLifecycleCampaignScenarioInput,
  actualOutcome: BlockedGoalRecoveryLifecycleOutcome,
  artifacts: Array<{ stage: typeof STAGES[number]; text: string; value: Record<string, unknown> }>,
  trustChainVerified: boolean
): BlockedGoalRecoveryLifecycleCampaignScenarioSummary {
  return {
    scenarioId: scenario.scenarioId, expectedOutcome: scenario.expectedOutcome, actualOutcome, status: 'passed',
    terminalStage: artifacts.at(-1)!.stage.key, trustChainVerified,
    boundaryPreserved: isBoundaryPreserved(artifacts),
    redactionPreserved: true, commandsExecuted: false, externalStateChanged: false,
    evidence: artifacts.map((artifact) => ({ fileName: artifact.stage.fileName, sha256: sha256(artifact.text) }))
  };
}

function isBoundaryPreserved(artifacts: Array<{ value: Record<string, unknown> }>): boolean {
  return artifacts.every((artifact) => {
    const boundary = artifact.value.boundaryCompliance;
    if (!isRecord(boundary)) return true;
    return boundary.recoveryCommandsExecuted !== true
      && boundary.resumeCommandsExecuted !== true
      && boundary.commandsExecuted !== true
      && boundary.commandsExecutedByIntake !== true
      && boundary.commandsExecutedByReview !== true
      && boundary.commandsExecutedByClosure !== true
      && boundary.externalGoalClosedByReceipt !== true
      && boundary.unlistedCommandsExecuted !== true
      && boundary.blockedActionsPreserved !== false
      && boundary.targetRepoMutationByRepoAssure !== true
      && boundary.sourceBoundaryPreserved !== false;
  });
}

function assertCampaignInput(value: unknown): asserts value is BlockedGoalRecoveryLifecycleCampaignInput {
  if (!isRecord(value)
    || value.schemaVersion !== 'repoassure.blocked-goal-recovery-lifecycle-campaign-input.v1'
    || !canonicalValue(value.campaignId)
    || !Array.isArray(value.scenarios) || value.scenarios.length === 0
    || !value.scenarios.every(isScenarioInput)
    || !hasCompleteOutcomeCoverage(value.scenarios)
    || !exactKeys(value, ['schemaVersion', 'campaignId', 'scenarios'])) throw invalidCampaignInput();
  const ids = value.scenarios.map((item) => (item as BlockedGoalRecoveryLifecycleCampaignScenarioInput).scenarioId);
  if (new Set(ids).size !== ids.length) throw invalidCampaignInput();
}

function isScenarioInput(value: unknown): boolean {
  return isRecord(value) && canonicalValue(value.scenarioId) && isOutcome(value.expectedOutcome)
    && canonicalRelativePath(value.artifactDir)
    && exactKeys(value, ['scenarioId', 'expectedOutcome', 'artifactDir']);
}
function hasCompleteOutcomeCoverage(value: unknown[]): boolean {
  return OUTCOMES.every((outcome) => value.some((scenario) =>
    isRecord(scenario) && scenario.expectedOutcome === outcome
  ));
}
async function resolveArtifactDir(inputDir: string, artifactDir: string): Promise<string> {
  const root = await realpath(resolve(inputDir));
  const target = await realpath(resolve(root, artifactDir));
  if (target !== root && !target.startsWith(`${root}${sep}`)) throw invalidCampaignInput();
  return target;
}
function canonicalRelativePath(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !isAbsolute(value)
    && !value.split(/[\\/]/u).includes('..') && canonical(value) === value;
}
function isOutcome(value: unknown): value is BlockedGoalRecoveryLifecycleOutcome {
  return typeof value === 'string' && OUTCOMES.includes(value as BlockedGoalRecoveryLifecycleOutcome);
}
function hasCanonicalBlockedActions(value: unknown[]): boolean {
  return value.length === BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.length
    && value.every((item) => typeof item === 'string')
    && BLOCKED_GOAL_RECOVERY_NON_AUTHORIZATION_BLOCKED_ACTIONS.every((item) => value.includes(item));
}
function exactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(value).sort(); const sorted = [...expected].sort();
  return actual.length === sorted.length && actual.every((item, index) => item === sorted[index]);
}
function canonicalValue(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && canonical(value) === value;
}
function canonical(value: string): string { return redactSensitiveText(value).replace(/\s+/gu, ' ').trim(); }
function containsUnsafeSecret(value: unknown): boolean {
  if (typeof value === 'string') return redactSensitiveText(value) !== value;
  if (Array.isArray(value)) return value.some(containsUnsafeSecret);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, item]) => {
    const sensitiveKey = /^(?:api[_-]?key|access[_-]?token|token|password|passcode|secret|credential|private[_-]?key|authorization|cookie)$/iu.test(key);
    return redactSensitiveText(key) !== key
      || (sensitiveKey && item !== '[REDACTED]')
      || containsUnsafeSecret(item);
  });
}
function sha256(value: string): string { return createHash('sha256').update(value).digest('hex'); }
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function invalidCampaignInput(): Error { return new Error('Invalid blocked goal recovery lifecycle campaign input'); }
class CampaignEvidenceError extends Error {}
function invalidCampaignEvidence(): Error {
  return new CampaignEvidenceError('Invalid blocked goal recovery lifecycle campaign evidence');
}
