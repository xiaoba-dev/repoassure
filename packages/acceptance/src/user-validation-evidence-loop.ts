import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative } from 'node:path';

import { redactSensitiveText } from './redaction.js';
import type { UserAcceptanceCheck, UserDecision } from './user-acceptance.js';
import type { UserAcceptanceMode } from './user-acceptance-args.js';

export type UserValidationDecision = UserDecision | 'blocked' | 'accept_risk' | 'defer';
export type UserValidationSource = 'maintainer' | 'external_reviewer' | 'unknown';
export type UserValidationStatus = 'pending' | 'accepted' | 'changes_requested' | 'blocked' | 'accepted_risk' | 'deferred';
export type UserValidationNextAction =
  | 'wait_for_maintainer_decision'
  | 'run_goal_audit'
  | 'continue_iteration'
  | 'triage_blocker'
  | 'record_risk_acceptance'
  | 'defer_launch_or_validation'
  | 'inspect_evidence';

export interface UserValidationFeedbackItem {
  source: UserValidationSource;
  decision: UserValidationDecision;
  summary: string;
  evidence: string[];
}

export interface UserValidationEvidenceLoopInput {
  generatedAt: string;
  mode: UserAcceptanceMode;
  runDir: string;
  manifestPath: string;
  userAcceptanceRecordPath: string;
  targetRepoFeedbackSummaryPath?: string;
  aiIdeHandoffPackagePath?: string;
  decision: UserDecision;
  notes: string;
  checks: UserAcceptanceCheck[];
  feedbackItems?: UserValidationFeedbackItem[];
}

export interface UserValidationEvidenceSource {
  kind: 'user_acceptance_record' | 'target_repo_feedback_summary' | 'ai_ide_handoff_package' | 'run_manifest';
  path: string;
  required: boolean;
  description: string;
}

export interface UserValidationFeedbackEvent {
  source: UserValidationSource;
  decision: UserValidationDecision;
  summary: string;
  evidence: string[];
}

export interface UserValidationEvidenceLoop {
  schemaVersion: 'repoassure.user-validation-evidence-loop.v1';
  generatedAt: string;
  mode: UserAcceptanceMode;
  validationStatus: UserValidationStatus;
  feedbackEvents: UserValidationFeedbackEvent[];
  evidenceSources: UserValidationEvidenceSource[];
  triage: {
    nextAction: UserValidationNextAction;
    launchAuthorization: 'not_authorized';
    summary: string;
  };
  qualityGates: {
    localOnly: true;
    requiredChecksPassed: number;
    requiredChecksFailed: number;
    requiredChecksSkipped: number;
    userDecisionRecorded: boolean;
    concreteNotesRequired: boolean;
    concreteNotesPresent: boolean;
  };
  consumptionGuidance: {
    forAiIde: string;
    forMaintainer: string;
    doNotDo: string[];
  };
  redactionBoundary: string;
  nonAuthorizationBoundary: string;
  sourceSummary: {
    manifest: string;
    userAcceptanceRecord: string;
    targetRepoFeedbackSummary?: string;
    aiIdeHandoffPackage?: string;
    feedbackEventCount: number;
  };
}

export interface WriteUserValidationEvidenceLoopResult {
  evidenceLoopPath: string;
  evidenceLoop: UserValidationEvidenceLoop;
}

export async function writeUserValidationEvidenceLoopArtifact(
  input: UserValidationEvidenceLoopInput
): Promise<WriteUserValidationEvidenceLoopResult> {
  const evidenceLoopPath = `${input.runDir}/user-validation-evidence-loop.json`;
  const evidenceLoop = buildUserValidationEvidenceLoop(input);

  await mkdir(dirname(evidenceLoopPath), { recursive: true });
  await writeFile(evidenceLoopPath, `${JSON.stringify(evidenceLoop, null, 2)}\n`);
  await linkUserValidationEvidenceLoopFromManifest(input.manifestPath, evidenceLoopPath);

  return { evidenceLoopPath, evidenceLoop };
}

export function buildUserValidationEvidenceLoop(
  input: UserValidationEvidenceLoopInput
): UserValidationEvidenceLoop {
  const requiredChecks = input.checks.filter((check) => check.required);
  const requiredChecksPassed = requiredChecks.filter((check) => check.status === 'passed').length;
  const requiredChecksFailed = requiredChecks.filter((check) => check.status === 'failed').length;
  const requiredChecksSkipped = requiredChecks.filter((check) => check.status === 'skipped').length;
  const feedbackEvents = buildFeedbackEvents(input);
  const validationStatus = classifyValidationStatus(feedbackEvents);
  const concreteNotesRequired = input.decision === 'accepted' || input.decision === 'changes_requested';
  const concreteNotesPresent = input.notes.trim().length > 0;

  return {
    schemaVersion: 'repoassure.user-validation-evidence-loop.v1',
    generatedAt: cleanText(input.generatedAt),
    mode: input.mode,
    validationStatus,
    feedbackEvents,
    evidenceSources: buildEvidenceSources(input),
    triage: {
      nextAction: recommendNextAction(validationStatus, requiredChecksFailed),
      launchAuthorization: 'not_authorized',
      summary: formatTriageSummary(validationStatus, requiredChecksFailed)
    },
    qualityGates: {
      localOnly: true,
      requiredChecksPassed,
      requiredChecksFailed,
      requiredChecksSkipped,
      userDecisionRecorded: input.decision !== 'pending',
      concreteNotesRequired,
      concreteNotesPresent
    },
    consumptionGuidance: {
      forAiIde: 'Read feedbackEvents with evidenceSources, then continue only on changes_requested or blocker triage. Do not treat accepted feedback as launch authorization.',
      forMaintainer: 'Use this package to review whether feedback was received, triaged, deferred, or accepted as risk before deciding the next product validation step.',
      doNotDo: [
        'Do not upload reviewer feedback or target repo material.',
        'Do not treat reviewer feedback as public launch authorization.',
        'Do not store reviewer PII, raw email, OTP, cookie, Access token, login query-state, reviewer credentials, secrets, or raw private repo content.',
        'Do not claim SaaS, Team Cloud, Enterprise, or hosted dashboard availability from this package.'
      ]
    },
    redactionBoundary: 'No reviewer PII, raw email, secrets, raw private repo content, OTP, cookie, Access token, login query-state, reviewer credentials, env values, raw private source, or absolute workstation paths may be stored.',
    nonAuthorizationBoundary: 'This evidence loop does not authorize npm publication, GitHub release, public launch, production marketing announcement, customer contact, pricing change or spend, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.',
    sourceSummary: buildSourceSummary(input, feedbackEvents.length)
  };
}

function buildFeedbackEvents(input: UserValidationEvidenceLoopInput): UserValidationFeedbackEvent[] {
  const defaultEvent: UserValidationFeedbackEvent = {
    source: 'maintainer',
    decision: input.decision,
    summary: input.notes.trim().length > 0 ? input.notes : 'No maintainer validation notes were supplied yet.',
    evidence: ['user acceptance record']
  };

  return [
    defaultEvent,
    ...(input.feedbackItems ?? [])
  ].map((item) => ({
    source: item.source,
    decision: item.decision,
    summary: cleanText(item.summary),
    evidence: item.evidence.map(cleanText)
  }));
}

function classifyValidationStatus(events: UserValidationFeedbackEvent[]): UserValidationStatus {
  if (events.some((event) => event.decision === 'changes_requested')) {
    return 'changes_requested';
  }

  if (events.some((event) => event.decision === 'blocked')) {
    return 'blocked';
  }

  if (events.some((event) => event.decision === 'defer')) {
    return 'deferred';
  }

  if (events.some((event) => event.decision === 'accept_risk')) {
    return 'accepted_risk';
  }

  if (events.some((event) => event.decision === 'accepted')) {
    return 'accepted';
  }

  return 'pending';
}

function recommendNextAction(
  status: UserValidationStatus,
  requiredChecksFailed: number
): UserValidationNextAction {
  if (requiredChecksFailed > 0) {
    return 'triage_blocker';
  }

  switch (status) {
    case 'accepted':
      return 'run_goal_audit';
    case 'changes_requested':
      return 'continue_iteration';
    case 'blocked':
      return 'triage_blocker';
    case 'accepted_risk':
      return 'record_risk_acceptance';
    case 'deferred':
      return 'defer_launch_or_validation';
    case 'pending':
      return 'wait_for_maintainer_decision';
  }
}

function formatTriageSummary(status: UserValidationStatus, requiredChecksFailed: number): string {
  if (requiredChecksFailed > 0) {
    return 'Required validation checks failed; triage blockers before asking for maintainer acceptance.';
  }

  switch (status) {
    case 'accepted':
      return 'Validation was accepted; run goal audit and keep launch authorization separate.';
    case 'changes_requested':
      return 'Concrete changes were requested; continue implementation and re-run validation.';
    case 'blocked':
      return 'Validation is blocked; document blocker evidence and retry after the external condition changes.';
    case 'accepted_risk':
      return 'Risk was accepted for validation purposes; record scope and keep launch authorization separate.';
    case 'deferred':
      return 'Validation or launch decision was deferred; do not proceed as accepted.';
    case 'pending':
      return 'Validation is waiting for maintainer or reviewer decision.';
  }
}

function buildEvidenceSources(input: UserValidationEvidenceLoopInput): UserValidationEvidenceSource[] {
  return [
    buildEvidenceSource(input.runDir, 'run_manifest', input.manifestPath, true, 'Run manifest linking local validation artifacts.'),
    buildEvidenceSource(input.runDir, 'user_acceptance_record', input.userAcceptanceRecordPath, true, 'Human-readable user acceptance record.'),
    buildEvidenceSource(input.runDir, 'target_repo_feedback_summary', input.targetRepoFeedbackSummaryPath, true, 'Machine-readable target repo feedback summary.'),
    buildEvidenceSource(input.runDir, 'ai_ide_handoff_package', input.aiIdeHandoffPackagePath, true, 'AI IDE handoff material quality package.')
  ].filter((source): source is UserValidationEvidenceSource => source !== undefined);
}

function buildEvidenceSource(
  runDir: string,
  kind: UserValidationEvidenceSource['kind'],
  path: string | undefined,
  required: boolean,
  description: string
): UserValidationEvidenceSource | undefined {
  if (!path) {
    return undefined;
  }

  return {
    kind,
    path: formatRelativeArtifactLink(runDir, path),
    required,
    description
  };
}

function buildSourceSummary(
  input: UserValidationEvidenceLoopInput,
  feedbackEventCount: number
): UserValidationEvidenceLoop['sourceSummary'] {
  return {
    manifest: formatRelativeArtifactLink(input.runDir, input.manifestPath),
    userAcceptanceRecord: formatRelativeArtifactLink(input.runDir, input.userAcceptanceRecordPath),
    ...(input.targetRepoFeedbackSummaryPath ? { targetRepoFeedbackSummary: formatRelativeArtifactLink(input.runDir, input.targetRepoFeedbackSummaryPath) } : {}),
    ...(input.aiIdeHandoffPackagePath ? { aiIdeHandoffPackage: formatRelativeArtifactLink(input.runDir, input.aiIdeHandoffPackagePath) } : {}),
    feedbackEventCount
  };
}

async function linkUserValidationEvidenceLoopFromManifest(
  manifestPath: string,
  evidenceLoopPath: string
): Promise<void> {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Record<string, unknown>;
    await writeFile(manifestPath, `${JSON.stringify({
      ...manifest,
      artifacts: {
        ...(typeof manifest.artifacts === 'object' && manifest.artifacts !== null ? manifest.artifacts : {}),
        userValidationEvidenceLoopPath: evidenceLoopPath
      }
    }, null, 2)}\n`);
  } catch {
    // The evidence loop remains useful if a malformed manifest cannot be updated.
  }
}

function formatRelativeArtifactLink(runDir: string, path: string): string {
  const value = isAbsolute(path) ? relative(runDir, path) || '.' : path;
  return cleanText(value.replaceAll('\\', '/'));
}

function cleanText(value: string): string {
  return redactReviewerPii(redactSensitiveText(value)).replace(/\s+/gu, ' ').trim();
}

function redactReviewerPii(value: string): string {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, '[REDACTED_EMAIL]')
    .replace(/\b(Cookie\s*:\s*)[^\r\n]*/giu, '$1[REDACTED]')
    .replace(/\b(Set-Cookie\s*:\s*)[^\r\n]*/giu, '$1[REDACTED]');
}
