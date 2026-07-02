import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative } from 'node:path';

import { redactSensitiveText } from './redaction.js';
import type { UserAcceptanceCheck } from './user-acceptance.js';
import type { UserAcceptanceMode } from './user-acceptance-args.js';

export type AiIdeHandoffRunStatus = 'passed' | 'failed' | 'partial';
export type AiIdeHandoffArtifactKind =
  | 'target_repo_feedback_summary'
  | 'hardening_report'
  | 'findings'
  | 'repair_task_package'
  | 'repair_plan'
  | 'patch_diff'
  | 'generated_tests'
  | 'browser_artifacts';
export type AiIdeHandoffPriority = 'P0' | 'P1' | 'P2';

export interface AiIdeHandoffPackageInput {
  generatedAt: string;
  mode: UserAcceptanceMode;
  runDir: string;
  manifestPath: string;
  targetRepoFeedbackSummaryPath: string;
  reportPath?: string;
  findingsPath?: string;
  repairPlanPath?: string;
  repairPlanMarkdownPath?: string;
  repairTaskPackagePath?: string;
  repairTaskPackageMarkdownPath?: string;
  patchDiffPath?: string;
  generatedTestFiles: string[];
  artifactFiles: string[];
  checks: UserAcceptanceCheck[];
}

export interface AiIdeHandoffReadingEntry {
  artifactKind: AiIdeHandoffArtifactKind;
  path: string;
  title: string;
  reason: string;
}

export interface AiIdeHandoffArtifactInventoryEntry {
  artifactKind: AiIdeHandoffArtifactKind;
  path: string;
  available: boolean;
  requiredForAiIde: boolean;
  description: string;
}

export interface AiIdeHandoffPriorityAction {
  id: string;
  priority: AiIdeHandoffPriority;
  source: string;
  action: string;
  evidence: string;
}

export interface AiIdeHandoffPackage {
  schemaVersion: 'repoassure.ai-ide-handoff-package.v1';
  generatedAt: string;
  mode: UserAcceptanceMode;
  runStatus: AiIdeHandoffRunStatus;
  recommendedReadingOrder: AiIdeHandoffReadingEntry[];
  artifactInventory: AiIdeHandoffArtifactInventoryEntry[];
  priorityActions: AiIdeHandoffPriorityAction[];
  consumptionGuidance: {
    forAiIde: string;
    forMaintainer: string;
    doNotDo: string[];
  };
  qualityGates: {
    localOnly: true;
    requiredChecksPassed: number;
    requiredChecksFailed: number;
    requiredChecksSkipped: number;
    missingRequiredArtifacts: AiIdeHandoffArtifactKind[];
  };
  redactionBoundary: string;
  sourceSummary: {
    manifest: string;
    targetRepoFeedbackSummary: string;
    report?: string;
    findings?: string;
    repairPlan?: string;
    repairTaskPackage?: string;
    patchDiff?: string;
    generatedTestsCount: number;
    browserArtifactCount: number;
  };
}

export interface WriteAiIdeHandoffPackageResult {
  handoffPackagePath: string;
  handoffPackage: AiIdeHandoffPackage;
}

export async function writeAiIdeHandoffPackageArtifact(
  input: AiIdeHandoffPackageInput
): Promise<WriteAiIdeHandoffPackageResult> {
  const handoffPackagePath = `${input.runDir}/ai-ide-handoff-package.json`;
  const handoffPackage = buildAiIdeHandoffPackage(input);

  await mkdir(dirname(handoffPackagePath), { recursive: true });
  await writeFile(handoffPackagePath, `${JSON.stringify(handoffPackage, null, 2)}\n`);
  await linkAiIdeHandoffPackageFromManifest(input.manifestPath, handoffPackagePath);

  return { handoffPackagePath, handoffPackage };
}

export function buildAiIdeHandoffPackage(input: AiIdeHandoffPackageInput): AiIdeHandoffPackage {
  const requiredChecks = input.checks.filter((check) => check.required);
  const requiredChecksPassed = requiredChecks.filter((check) => check.status === 'passed').length;
  const requiredChecksFailed = requiredChecks.filter((check) => check.status === 'failed').length;
  const requiredChecksSkipped = requiredChecks.filter((check) => check.status === 'skipped').length;
  const artifactInventory = buildArtifactInventory(input);

  return {
    schemaVersion: 'repoassure.ai-ide-handoff-package.v1',
    generatedAt: input.generatedAt,
    mode: input.mode,
    runStatus: classifyRunStatus(requiredChecksFailed, requiredChecksSkipped),
    recommendedReadingOrder: buildRecommendedReadingOrder(input),
    artifactInventory,
    priorityActions: buildPriorityActions(input.checks),
    consumptionGuidance: {
      forAiIde: 'Follow recommendedReadingOrder first, inspect linked artifacts only through relative paths, then implement the smallest target-repo changes needed to satisfy priorityActions.',
      forMaintainer: 'Review qualityGates and priorityActions before handing this package to an AI IDE. Treat missing required artifacts as a product follow-up, not target repo evidence.',
      doNotDo: [
        'Do not upload private target repo material.',
        'Do not infer customer identity from local paths.',
        'Do not mark public release, npm publish, SaaS, Team Cloud, Enterprise, or hosted dashboard availability from this package.'
      ]
    },
    qualityGates: {
      localOnly: true,
      requiredChecksPassed,
      requiredChecksFailed,
      requiredChecksSkipped,
      missingRequiredArtifacts: artifactInventory
        .filter((artifact) => artifact.requiredForAiIde && !artifact.available)
        .map((artifact) => artifact.artifactKind)
    },
    redactionBoundary: 'No secrets or raw private repo content may be stored. Do not store OTP, cookie, Access token, login query-state, reviewer credentials, env values, raw private source, or absolute workstation paths.',
    sourceSummary: buildSourceSummary(input)
  };
}

function classifyRunStatus(requiredChecksFailed: number, requiredChecksSkipped: number): AiIdeHandoffRunStatus {
  if (requiredChecksFailed > 0) {
    return 'failed';
  }

  if (requiredChecksSkipped > 0) {
    return 'partial';
  }

  return 'passed';
}

function buildRecommendedReadingOrder(input: AiIdeHandoffPackageInput): AiIdeHandoffReadingEntry[] {
  return [
    buildReadingEntry('target_repo_feedback_summary', input.runDir, input.targetRepoFeedbackSummaryPath, 'Target repo feedback summary', 'AI IDE should start here to understand runStatus, blocker category, and next product action.'),
    buildReadingEntry('hardening_report', input.runDir, input.reportPath, 'Hardening report', 'Read second for issue details and readiness context.'),
    buildReadingEntry('repair_task_package', input.runDir, input.repairTaskPackageMarkdownPath ?? input.repairTaskPackagePath, 'Executable repair task package', 'Use this before broad refactoring because it is the most directly actionable task list.'),
    buildReadingEntry('repair_plan', input.runDir, input.repairPlanMarkdownPath ?? input.repairPlanPath, 'Repair plan', 'Use this to understand prioritization and remediation rationale.'),
    buildReadingEntry('patch_diff', input.runDir, input.patchDiffPath, 'Patch diff', 'Inspect only after reading plans; apply manually only when it matches maintainer intent.'),
    buildReadingEntry('generated_tests', input.runDir, input.generatedTestFiles[0], 'Generated tests', 'Use generated specs as candidate regression coverage, not as guaranteed passing tests.'),
    buildReadingEntry('browser_artifacts', input.runDir, input.artifactFiles[0], 'Browser artifacts', 'Use screenshots and traces to confirm UI evidence when present.')
  ].filter((entry): entry is AiIdeHandoffReadingEntry => entry !== undefined);
}

function buildReadingEntry(
  artifactKind: AiIdeHandoffArtifactKind,
  runDir: string,
  path: string | undefined,
  title: string,
  reason: string
): AiIdeHandoffReadingEntry | undefined {
  if (!path) {
    return undefined;
  }

  return {
    artifactKind,
    path: formatRelativeArtifactLink(runDir, path),
    title,
    reason
  };
}

function buildArtifactInventory(input: AiIdeHandoffPackageInput): AiIdeHandoffArtifactInventoryEntry[] {
  const entries: AiIdeHandoffArtifactInventoryEntry[] = [
    buildInventoryEntry(input.runDir, 'target_repo_feedback_summary', input.targetRepoFeedbackSummaryPath, true, 'Machine-readable target repo acceptance feedback summary.'),
    buildInventoryEntry(input.runDir, 'hardening_report', input.reportPath, true, 'Human-readable hardening report.'),
    buildInventoryEntry(input.runDir, 'findings', input.findingsPath, true, 'Structured findings or target repo profile source.'),
    buildInventoryEntry(input.runDir, 'repair_task_package', input.repairTaskPackageMarkdownPath ?? input.repairTaskPackagePath, true, 'Prioritized executable repair tasks.'),
    buildInventoryEntry(input.runDir, 'repair_plan', input.repairPlanMarkdownPath ?? input.repairPlanPath, true, 'Repair planning rationale and task grouping.'),
    buildInventoryEntry(input.runDir, 'patch_diff', input.patchDiffPath, false, 'Candidate patch material for manual review.'),
    buildInventoryEntry(input.runDir, 'generated_tests', input.generatedTestFiles[0], input.mode === 'browser', 'Generated test candidate for browser-mode target repos.'),
    buildInventoryEntry(input.runDir, 'browser_artifacts', input.artifactFiles[0], input.mode === 'browser', 'Screenshots, traces, or other browser evidence.')
  ];

  return entries;
}

function buildInventoryEntry(
  runDir: string,
  artifactKind: AiIdeHandoffArtifactKind,
  path: string | undefined,
  requiredForAiIde: boolean,
  description: string
): AiIdeHandoffArtifactInventoryEntry {
  return {
    artifactKind,
    path: path ? formatRelativeArtifactLink(runDir, path) : 'missing',
    available: Boolean(path),
    requiredForAiIde,
    description
  };
}

function buildPriorityActions(checks: UserAcceptanceCheck[]): AiIdeHandoffPriorityAction[] {
  const failedOrSkippedRequiredChecks = checks.filter((check) => check.required && check.status !== 'passed');

  if (failedOrSkippedRequiredChecks.length === 0) {
    return [{
      id: 'review-artifacts',
      priority: 'P2',
      source: 'acceptance checks',
      action: 'Review artifacts in recommendedReadingOrder and only create follow-up work when maintainer inspection finds a product or target repo issue.',
      evidence: 'All required checks passed.'
    }];
  }

  return failedOrSkippedRequiredChecks.map((check, index) => ({
    id: `resolve-required-check-${index + 1}`,
    priority: check.status === 'failed' ? 'P0' : 'P1',
    source: sanitizeHandoffText(check.name),
    action: `Resolve required acceptance check: ${sanitizeHandoffText(check.name)}`,
    evidence: sanitizeHandoffText(check.evidence)
  }));
}

function buildSourceSummary(input: AiIdeHandoffPackageInput): AiIdeHandoffPackage['sourceSummary'] {
  const summary: AiIdeHandoffPackage['sourceSummary'] = {
    manifest: formatRelativeArtifactLink(input.runDir, input.manifestPath),
    targetRepoFeedbackSummary: formatRelativeArtifactLink(input.runDir, input.targetRepoFeedbackSummaryPath),
    generatedTestsCount: input.generatedTestFiles.length,
    browserArtifactCount: input.artifactFiles.length
  };

  if (input.reportPath) {
    summary.report = formatRelativeArtifactLink(input.runDir, input.reportPath);
  }
  if (input.findingsPath) {
    summary.findings = formatRelativeArtifactLink(input.runDir, input.findingsPath);
  }
  if (input.repairPlanMarkdownPath ?? input.repairPlanPath) {
    summary.repairPlan = formatRelativeArtifactLink(input.runDir, input.repairPlanMarkdownPath ?? input.repairPlanPath ?? '');
  }
  if (input.repairTaskPackageMarkdownPath ?? input.repairTaskPackagePath) {
    summary.repairTaskPackage = formatRelativeArtifactLink(input.runDir, input.repairTaskPackageMarkdownPath ?? input.repairTaskPackagePath ?? '');
  }
  if (input.patchDiffPath) {
    summary.patchDiff = formatRelativeArtifactLink(input.runDir, input.patchDiffPath);
  }

  return summary;
}

function formatRelativeArtifactLink(fromDir: string, artifactPath: string): string {
  const relativePath = isAbsolute(artifactPath)
    ? relative(fromDir, artifactPath)
    : artifactPath;

  return redactSensitiveText(relativePath.replaceAll('\\', '/'));
}

function sanitizeHandoffText(value: string): string {
  return redactSensitiveText(value)
    .replace(/\b(Cookie\s*:\s*)[^\r\n]*/giu, '$1[REDACTED]')
    .replace(/\b(Set-Cookie\s*:\s*)[^\r\n]*/giu, '$1[REDACTED]');
}

async function linkAiIdeHandoffPackageFromManifest(manifestPath: string, handoffPackagePath: string): Promise<void> {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Record<string, unknown>;
    const artifacts = isRecord(manifest.artifacts) ? manifest.artifacts : {};

    await writeFile(manifestPath, `${JSON.stringify({
      ...manifest,
      artifacts: {
        ...artifacts,
        aiIdeHandoffPackagePath: handoffPackagePath
      }
    }, null, 2)}\n`);
  } catch {
    // The handoff package remains useful if a malformed manifest cannot be updated.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
