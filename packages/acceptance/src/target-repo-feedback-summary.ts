import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative } from 'node:path';

import { redactSensitiveText } from './redaction.js';
import type { UserAcceptanceCheck } from './user-acceptance.js';
import type { UserAcceptanceMode } from './user-acceptance-args.js';

export type TargetRepoFeedbackRunStatus = 'passed' | 'failed' | 'blocked' | 'partial';
export type TargetRepoMetadataClass = 'synthetic_fixture' | 'public_repo' | 'private_repo_redacted' | 'unknown';
export type TargetRepoFeedbackBlockerCategory =
  | 'none'
  | 'environment'
  | 'dependency_install'
  | 'build_or_typecheck'
  | 'runtime_boot'
  | 'browser_exploration'
  | 'generated_test_validation'
  | 'security_boundary'
  | 'user_input_required'
  | 'unknown';
export type TargetRepoFeedbackNextAction =
  | 'inspect_artifacts'
  | 'improve_detector'
  | 'improve_generated_tests'
  | 'improve_repair_plan'
  | 'document_target_stack'
  | 'request_user_input'
  | 'no_action';

export interface TargetRepoFeedbackSummaryInput {
  generatedAt: string;
  mode: UserAcceptanceMode;
  repoRoot: string;
  runDir: string;
  manifestPath: string;
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

export interface TargetRepoFeedbackSummary {
  schema: 'repoassure.target-repo-feedback-summary.v1';
  generatedAt: string;
  mode: UserAcceptanceMode;
  runStatus: TargetRepoFeedbackRunStatus;
  targetRepoMetadataClass: TargetRepoMetadataClass;
  acceptanceResult: {
    requiredChecksPassed: number;
    requiredChecksFailed: number;
    generatedTests: 'generated' | 'missing' | 'not_applicable';
    generatedTestsValidated: boolean | 'not_requested';
    reportGenerated: boolean;
    repairArtifactsProduced: boolean;
  };
  blockerCategory: TargetRepoFeedbackBlockerCategory;
  nextRecommendedProductAction: TargetRepoFeedbackNextAction;
  artifactLinks: {
    manifest: string;
    report?: string;
    findings?: string;
    repairPlan?: string;
    repairPlanMarkdown?: string;
    repairTaskPackage?: string;
    repairTaskPackageMarkdown?: string;
    patchDiff?: string;
    generatedTests: string[];
    screenshots: string[];
    traces: string[];
    otherArtifacts: string[];
  };
  redactionBoundary: string;
  maintainerTriageGuidance: string;
}

export interface WriteTargetRepoFeedbackSummaryResult {
  summaryPath: string;
  summary: TargetRepoFeedbackSummary;
}

export async function writeTargetRepoFeedbackSummaryArtifact(
  input: TargetRepoFeedbackSummaryInput
): Promise<WriteTargetRepoFeedbackSummaryResult> {
  const summaryPath = `${input.runDir}/target-repo-feedback-summary.json`;
  const summary = buildTargetRepoFeedbackSummary(input);

  await mkdir(dirname(summaryPath), { recursive: true });
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  await linkFeedbackSummaryFromManifest(input.manifestPath, summaryPath);

  return { summaryPath, summary };
}

export function buildTargetRepoFeedbackSummary(input: TargetRepoFeedbackSummaryInput): TargetRepoFeedbackSummary {
  const requiredChecks = input.checks.filter((check) => check.required);
  const requiredChecksFailed = requiredChecks.filter((check) => check.status === 'failed').length;
  const requiredChecksPassed = requiredChecks.filter((check) => check.status === 'passed').length;
  const blockerCategory = classifyBlockerCategory(input.checks);

  return {
    schema: 'repoassure.target-repo-feedback-summary.v1',
    generatedAt: input.generatedAt,
    mode: input.mode,
    runStatus: classifyRunStatus(input.checks, blockerCategory),
    targetRepoMetadataClass: classifyTargetRepoMetadata(input.repoRoot),
    acceptanceResult: {
      requiredChecksPassed,
      requiredChecksFailed,
      generatedTests: input.mode === 'browser'
        ? input.generatedTestFiles.length > 0 ? 'generated' : 'missing'
        : 'not_applicable',
      generatedTestsValidated: classifyGeneratedTestValidation(input.checks),
      reportGenerated: hasPassedCheck(input.checks, 'hardening-report.md 已生成'),
      repairArtifactsProduced: hasPassedCheck(input.checks, 'repair-plan.json 已生成')
        && hasPassedCheck(input.checks, 'repair-task-package.json 已生成')
    },
    blockerCategory,
    nextRecommendedProductAction: recommendNextAction(blockerCategory, input.checks),
    artifactLinks: buildArtifactLinks(input),
    redactionBoundary: 'No secrets or raw private repo content may be stored. Do not store OTP, cookie, Access token, login query-state, reviewer credentials, env values, raw private source, or absolute workstation paths.',
    maintainerTriageGuidance: formatMaintainerTriageGuidance(blockerCategory)
  };
}

function classifyRunStatus(
  checks: UserAcceptanceCheck[],
  blockerCategory: TargetRepoFeedbackBlockerCategory
): TargetRepoFeedbackRunStatus {
  if (checks.some((check) => check.required && check.status === 'failed')) {
    return blockerCategory === 'user_input_required' || blockerCategory === 'environment' ? 'blocked' : 'failed';
  }

  if (checks.some((check) => check.required && check.status === 'skipped')) {
    return 'partial';
  }

  return 'passed';
}

function classifyTargetRepoMetadata(repoRoot: string): TargetRepoMetadataClass {
  const normalized = repoRoot.replaceAll('\\', '/');

  if (normalized.includes('/fixtures/') || normalized.endsWith('/fixtures')) {
    return 'synthetic_fixture';
  }

  if (/github\.com[/:][^/]+\/[^/]+/u.test(normalized)) {
    return 'public_repo';
  }

  if (repoRoot.trim().length === 0 || repoRoot.includes('<')) {
    return 'unknown';
  }

  return 'private_repo_redacted';
}

function classifyGeneratedTestValidation(checks: UserAcceptanceCheck[]): boolean | 'not_requested' {
  const validationCheck = checks.find((check) => check.name === 'generated Playwright spec 执行验证');

  if (!validationCheck || validationCheck.status === 'skipped') {
    return 'not_requested';
  }

  return validationCheck.status === 'passed';
}

function classifyBlockerCategory(checks: UserAcceptanceCheck[]): TargetRepoFeedbackBlockerCategory {
  const failedRequired = checks.find((check) => check.required && check.status === 'failed');

  if (!failedRequired) {
    return 'none';
  }

  const text = `${failedRequired.name} ${failedRequired.evidence}`.toLowerCase();

  if (text.includes('repo root') || text.includes('package.json') || text.includes('pyproject.toml')) {
    return 'user_input_required';
  }

  if (text.includes('generated playwright')) {
    return 'generated_test_validation';
  }

  if (
    text.includes('enoent') ||
    text.includes('command not found') ||
    text.includes('not found:') ||
    text.includes('no such file or directory')
  ) {
    return 'environment';
  }

  if (text.includes('browser') || text.includes('explor')) {
    return 'browser_exploration';
  }

  if (text.includes('boot') || text.includes('runtime') || text.includes('start command')) {
    return 'runtime_boot';
  }

  if (text.includes('install') || text.includes('dependency')) {
    return 'dependency_install';
  }

  if (text.includes('typecheck') || text.includes('build') || text.includes('pytest') || text.includes('ruff') || text.includes('mypy')) {
    return 'build_or_typecheck';
  }

  if (text.includes('secret') || text.includes('token') || text.includes('credential')) {
    return 'security_boundary';
  }

  if (text.includes('env') || text.includes('timeout')) {
    return 'environment';
  }

  return 'unknown';
}

function recommendNextAction(
  blockerCategory: TargetRepoFeedbackBlockerCategory,
  checks: UserAcceptanceCheck[]
): TargetRepoFeedbackNextAction {
  if (blockerCategory === 'none') {
    return 'no_action';
  }

  if (blockerCategory === 'generated_test_validation') {
    return 'improve_generated_tests';
  }

  if (blockerCategory === 'user_input_required') {
    return 'request_user_input';
  }

  if (blockerCategory === 'environment') {
    return 'document_target_stack';
  }

  if (blockerCategory === 'browser_exploration') {
    return 'improve_detector';
  }

  if (blockerCategory === 'unknown' && checks.some((check) => check.name.includes('repair'))) {
    return 'improve_repair_plan';
  }

  return 'inspect_artifacts';
}

function buildArtifactLinks(input: TargetRepoFeedbackSummaryInput): TargetRepoFeedbackSummary['artifactLinks'] {
  const generatedTests = input.generatedTestFiles.map((path) => formatRelativeArtifactLink(input.runDir, path));
  const screenshots: string[] = [];
  const traces: string[] = [];
  const otherArtifacts: string[] = [];

  for (const artifactFile of input.artifactFiles) {
    const link = formatRelativeArtifactLink(input.runDir, artifactFile);

    if (/\.(?:png|jpg|jpeg|webp)$/iu.test(artifactFile)) {
      screenshots.push(link);
    } else if (/\.trace\.zip$/iu.test(artifactFile)) {
      traces.push(link);
    } else {
      otherArtifacts.push(link);
    }
  }

  const links: TargetRepoFeedbackSummary['artifactLinks'] = {
    manifest: formatRelativeArtifactLink(input.runDir, input.manifestPath),
    generatedTests,
    screenshots,
    traces,
    otherArtifacts
  };

  if (input.reportPath) {
    links.report = formatRelativeArtifactLink(input.runDir, input.reportPath);
  }
  if (input.findingsPath) {
    links.findings = formatRelativeArtifactLink(input.runDir, input.findingsPath);
  }
  if (input.repairPlanPath) {
    links.repairPlan = formatRelativeArtifactLink(input.runDir, input.repairPlanPath);
  }
  if (input.repairPlanMarkdownPath) {
    links.repairPlanMarkdown = formatRelativeArtifactLink(input.runDir, input.repairPlanMarkdownPath);
  }
  if (input.repairTaskPackagePath) {
    links.repairTaskPackage = formatRelativeArtifactLink(input.runDir, input.repairTaskPackagePath);
  }
  if (input.repairTaskPackageMarkdownPath) {
    links.repairTaskPackageMarkdown = formatRelativeArtifactLink(input.runDir, input.repairTaskPackageMarkdownPath);
  }
  if (input.patchDiffPath) {
    links.patchDiff = formatRelativeArtifactLink(input.runDir, input.patchDiffPath);
  }

  return links;
}

function formatRelativeArtifactLink(fromDir: string, artifactPath: string): string {
  const relativePath = isAbsolute(artifactPath)
    ? relative(fromDir, artifactPath)
    : artifactPath;

  return redactSensitiveText(relativePath.replaceAll('\\', '/'));
}

function hasPassedCheck(checks: UserAcceptanceCheck[], name: string): boolean {
  return checks.some((check) => check.name === name && check.status === 'passed');
}

function formatMaintainerTriageGuidance(blockerCategory: TargetRepoFeedbackBlockerCategory): string {
  if (blockerCategory === 'none') {
    return 'No product bug is implied by this run. Maintainer may inspect artifacts for learning and mark no follow-up action.';
  }

  if (blockerCategory === 'user_input_required') {
    return 'Treat this as a user-input request unless repeated valid target repos show the same failure.';
  }

  if (blockerCategory === 'environment') {
    return 'Treat this as a Python/CLI environment prerequisite issue when the evidence shows ENOENT, command not found, timeout, or missing tool output. Check that the target repo has a documented setup path, create or activate .venv, install the project and dev extras with python -m pip install -e ".[dev]" when available, then rerun the linked acceptance commands before filing a product bug.';
  }

  return `Triage this as a possible product bug or docs task in area ${blockerCategory}; inspect linked artifacts before creating follow-up work.`;
}

async function linkFeedbackSummaryFromManifest(manifestPath: string, summaryPath: string): Promise<void> {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Record<string, unknown>;
    const artifacts = isRecord(manifest.artifacts) ? manifest.artifacts : {};

    await writeFile(manifestPath, `${JSON.stringify({
      ...manifest,
      artifacts: {
        ...artifacts,
        targetRepoFeedbackSummaryPath: summaryPath
      }
    }, null, 2)}\n`);
  } catch {
    // The summary is still useful if a malformed manifest cannot be updated.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
