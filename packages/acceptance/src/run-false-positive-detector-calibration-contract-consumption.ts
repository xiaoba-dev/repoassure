import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { formatMarkdownCodeCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type { FalsePositiveDetectorCalibrationContract } from './run-false-positive-detector-calibration-contract.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultOutputDir = 'artifacts/project-graph';
const defaultContractJsonPath = join(defaultOutputDir, 'false-positive-detector-calibration-contract.json');
const defaultContractMarkdownPath = join(defaultOutputDir, 'false-positive-detector-calibration-contract.md');
const validationJsonFileName = 'false-positive-detector-calibration-contract-consumption-validation.json';
const validationMarkdownFileName = 'false-positive-detector-calibration-contract-consumption-validation.md';
const requiredQuestionIds = [
  'conditional_dead_control_should_consider_form_dirty_prerequisites',
  'auth_redirect_route_should_preserve_maintainer_review_boundary'
] as const;
const requiredManualGates = [
  'maintainer_classification_required_before_detector_change',
  'catalog_fixture_privacy_review_required',
  'expected_snapshot_review_required',
  'confidence_threshold_review_required',
  'regression_artifact_review_required'
] as const;
const requiredFutureAuthorization = [
  'runtime_detector_change',
  'finding_suppression',
  'automatic_severity_downgrade',
  'detector_confidence_threshold_change',
  'acceptance_policy_change'
] as const;

export interface FalsePositiveDetectorCalibrationContractConsumptionCliOptions {
  contractJsonPath?: string;
  contractMarkdownPath?: string;
  outputDir?: string;
  generatedAt?: string;
}

export type FalsePositiveDetectorCalibrationContractConsumptionRunInput =
  FalsePositiveDetectorCalibrationContractConsumptionCliOptions;

export interface FalsePositiveDetectorCalibrationContractConsumptionRunResult {
  validationJsonPath: string;
  validationMarkdownPath: string;
  validationPassed: boolean;
  checkCount: number;
}

export type FalsePositiveDetectorCalibrationContractConsumptionCheckStatus = 'passed' | 'failed';

export interface FalsePositiveDetectorCalibrationContractConsumptionCheck {
  id: string;
  status: FalsePositiveDetectorCalibrationContractConsumptionCheckStatus;
  evidence: string;
}

export interface FalsePositiveDetectorCalibrationContractConsumptionValidationReport {
  schema: 'repoassure.false-positive-detector-calibration-contract-consumption-validation@1';
  generatedAt: string;
  status: FalsePositiveDetectorCalibrationContractConsumptionCheckStatus;
  readOrder: string[];
  inputArtifacts: {
    contractJsonPath: string;
    contractMarkdownPath: string;
  };
  consumption: {
    aiIdeCanConsume: boolean;
    maintainerCanReview: boolean;
    calibrationQuestionIds: string[];
    manualGates: string[];
    futureImplementationAuthorization: string[];
    verificationChecklist: string[];
  };
  boundary: {
    localOnly: true;
    targetRepoWrites: false;
    runtimeDetectionBehaviorChange: false;
    findingSuppression: false;
    automaticSeverityDowngrade: false;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
    cloudSyncEnabled: false;
    prohibitedContentPresent: boolean;
  };
  checks: FalsePositiveDetectorCalibrationContractConsumptionCheck[];
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isFalsePositiveDetectorCalibrationContractConsumptionHelpRequest(args)) {
    process.stdout.write(falsePositiveDetectorCalibrationContractConsumptionHelpText());
    return 0;
  }

  try {
    const result = await runFalsePositiveDetectorCalibrationContractConsumptionValidation(
      parseFalsePositiveDetectorCalibrationContractConsumptionArgs(args)
    );
    process.stdout.write(formatFalsePositiveDetectorCalibrationContractConsumptionCliSummary(result));
    return result.validationPassed ? 0 : 1;
  } catch (error: unknown) {
    process.stderr.write(
      `${formatAcceptanceFatalError('False-positive detector calibration contract consumption validation failed', error)}\n`
    );
    return 1;
  }
}

export function parseFalsePositiveDetectorCalibrationContractConsumptionArgs(
  args: string[]
): FalsePositiveDetectorCalibrationContractConsumptionCliOptions {
  const options: FalsePositiveDetectorCalibrationContractConsumptionCliOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? '';

    if (arg === '--') {
      continue;
    }

    if (arg === '--contract-json' || arg.startsWith('--contract-json=')) {
      const parsed = readOptionValue(args, index, '--contract-json');
      options.contractJsonPath = parsed.value;
      if (parsed.consumedNext) {
        index += 1;
      }
      continue;
    }

    if (
      arg === '--contract-md'
      || arg.startsWith('--contract-md=')
      || arg === '--contract-markdown'
      || arg.startsWith('--contract-markdown=')
    ) {
      const optionName = arg.startsWith('--contract-markdown') ? '--contract-markdown' : '--contract-md';
      const parsed = readOptionValue(args, index, optionName);
      options.contractMarkdownPath = parsed.value;
      if (parsed.consumedNext) {
        index += 1;
      }
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const parsed = readOptionValue(args, index, '--output');
      options.outputDir = parsed.value;
      if (parsed.consumedNext) {
        index += 1;
      }
      continue;
    }

    if (arg === '--generated-at' || arg.startsWith('--generated-at=')) {
      const parsed = readOptionValue(args, index, '--generated-at');
      options.generatedAt = parsed.value;
      if (parsed.consumedNext) {
        index += 1;
      }
      continue;
    }

    throw new Error(`Unknown false-positive detector calibration contract consumption option: ${arg}`);
  }

  return options;
}

export function isFalsePositiveDetectorCalibrationContractConsumptionHelpRequest(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h');
}

export function falsePositiveDetectorCalibrationContractConsumptionHelpText(): string {
  return [
    'Usage: pnpm false-positive:calibration-contract:validate [-- --contract-json <path>] [-- --contract-md <path>]',
    '',
    'Validate local false-positive detector calibration contract artifact consumption.',
    '',
    'Options:',
    '  --contract-json <path>      Contract JSON path. Defaults to artifacts/project-graph/false-positive-detector-calibration-contract.json.',
    '  --contract-md <path>        Contract Markdown path. Defaults to artifacts/project-graph/false-positive-detector-calibration-contract.md.',
    '  --output <dir>              Output directory. Defaults to artifacts/project-graph.',
    '  --generated-at <iso>        Stable timestamp for deterministic tests.',
    '  -h, --help                  Show this help.',
    '',
    'Boundary:',
    '  Reads local RepoAssure detector calibration contract artifacts and writes validation artifacts only.',
    '  Does not write target repositories, suppress findings, downgrade severity, or change detector behavior.',
    ''
  ].join('\n');
}

export async function runFalsePositiveDetectorCalibrationContractConsumptionValidation(
  input: FalsePositiveDetectorCalibrationContractConsumptionRunInput = {}
): Promise<FalsePositiveDetectorCalibrationContractConsumptionRunResult> {
  const outputDir = resolveRepoPath(input.outputDir ?? defaultOutputDir);
  const report = await validateFalsePositiveDetectorCalibrationContractConsumptionArtifacts(input);
  const validationJsonPath = join(outputDir, validationJsonFileName);
  const validationMarkdownPath = join(outputDir, validationMarkdownFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(validationJsonPath, `${JSON.stringify(sanitizeReport(report), null, 2)}\n`);
  await writeFile(validationMarkdownPath, formatFalsePositiveDetectorCalibrationContractConsumptionMarkdown(report));

  return {
    validationJsonPath,
    validationMarkdownPath,
    validationPassed: report.status === 'passed',
    checkCount: report.checks.length
  };
}

export async function validateFalsePositiveDetectorCalibrationContractConsumptionArtifacts(
  input: FalsePositiveDetectorCalibrationContractConsumptionRunInput = {}
): Promise<FalsePositiveDetectorCalibrationContractConsumptionValidationReport> {
  const contractJsonPath = resolveRepoPath(input.contractJsonPath ?? defaultContractJsonPath);
  const contractMarkdownPath = resolveRepoPath(input.contractMarkdownPath ?? defaultContractMarkdownPath);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const [rawJson, markdown] = await Promise.all([
    readFile(contractJsonPath, 'utf8'),
    readFile(contractMarkdownPath, 'utf8')
  ]);
  const contract = JSON.parse(rawJson) as Partial<FalsePositiveDetectorCalibrationContract>;
  const contractReadOrder = [...(contract.readOrder ?? [])];
  const resolvedContractReadOrder = contractReadOrder.map((path) => resolveRepoPath(path));
  const readOrder = [
    contractJsonPath,
    contractMarkdownPath
  ];
  const calibrationQuestionIds = [...(contract.calibrationQuestions ?? [])].map((question) => question.id);
  const manualGates = [...(contract.manualGates ?? [])];
  const futureImplementationAuthorization = [...(contract.futureImplementationAuthorization ?? [])];
  const verificationChecklist = [...(contract.aiIdeConsumption?.verificationChecklist ?? [])];
  const prohibitedContentPresent = /sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY/u.test(`${rawJson}\n${markdown}`);
  const checks: FalsePositiveDetectorCalibrationContractConsumptionCheck[] = [
    check(
      'json_schema',
      contract.schema === 'repoassure.false-positive-detector-calibration-contract@1',
      'Contract JSON exposes the expected detector calibration contract schema.'
    ),
    check(
      'json_validation_boundary',
      contract.validation?.sourceCodeIncluded === false
        && contract.validation.secretsIncluded === false
        && contract.validation.prohibitedContentPresent === false,
      'Contract JSON preserves source-code, secrets, and prohibited-content boundaries.'
    ),
    check(
      'json_read_order',
      resolvedContractReadOrder.includes(contractJsonPath)
        && resolvedContractReadOrder.includes(contractMarkdownPath)
        && resolvedContractReadOrder.indexOf(contractJsonPath) < resolvedContractReadOrder.indexOf(contractMarkdownPath),
      'Contract JSON readOrder points to contract JSON before contract Markdown.'
    ),
    check(
      'markdown_ai_ide_read_order',
      markdown.includes('## AI IDE Read Order')
        && containsMarkdownPath(markdown, contractJsonPath, findMatchingOriginalPath(contractReadOrder, contractJsonPath))
        && containsMarkdownPath(markdown, contractMarkdownPath, findMatchingOriginalPath(contractReadOrder, contractMarkdownPath)),
      'Contract Markdown exposes the AI IDE read order.'
    ),
    check(
      'calibration_questions',
      requiredQuestionIds.every((id) => calibrationQuestionIds.includes(id))
        && (contract.calibrationQuestions ?? []).every((question) => question.proposedAction === 'review_only'),
      'Contract exposes required review-only calibration questions.'
    ),
    check(
      'manual_gates',
      requiredManualGates.every((gate) => manualGates.includes(gate)),
      'Contract exposes required manual gates.'
    ),
    check(
      'future_implementation_authorization',
      requiredFutureAuthorization.every((authorization) => futureImplementationAuthorization.includes(authorization)),
      'Contract exposes future implementation authorization requirements.'
    ),
    check(
      'markdown_maintainer_review_boundary',
      markdown.includes('## Maintainer Review Boundary')
        && markdown.includes('Maintainer review required: yes')
        && markdown.includes('Prohibited actions:')
        && markdown.includes('runtime detector behavior change'),
      'Contract Markdown exposes maintainer review boundary and prohibited actions.'
    ),
    check(
      'verification_checklist',
      verificationChecklist.some((item) => item.includes('Read the planning record before the generated contract'))
        && verificationChecklist.some((item) => item.includes('Do not write target repositories')),
      'Contract exposes AI IDE verification checklist.'
    ),
    check(
      'boundary_runtime_detection_behavior_change',
      contract.boundary?.runtimeDetectionBehaviorChange === false,
      'Contract boundary does not authorize runtime detector behavior changes.'
    ),
    check(
      'boundary_target_repo_writes',
      contract.boundary?.targetRepoWrites === false,
      'Contract boundary does not authorize target repo writes.'
    ),
    check(
      'boundary_no_suppression_or_auto_downgrade',
      contract.boundary?.findingSuppression === false && contract.boundary.automaticSeverityDowngrade === false,
      'Contract boundary does not authorize suppression or automatic severity downgrade.'
    ),
    check(
      'redaction_boundary',
      prohibitedContentPresent === false,
      'Contract artifacts do not expose prohibited token or private-key markers.'
    )
  ];
  const status = checks.every((item) => item.status === 'passed') ? 'passed' : 'failed';

  return {
    schema: 'repoassure.false-positive-detector-calibration-contract-consumption-validation@1',
    generatedAt,
    status,
    readOrder,
    inputArtifacts: {
      contractJsonPath,
      contractMarkdownPath
    },
    consumption: {
      aiIdeCanConsume: status === 'passed',
      maintainerCanReview: status === 'passed',
      calibrationQuestionIds,
      manualGates,
      futureImplementationAuthorization,
      verificationChecklist
    },
    boundary: {
      localOnly: true,
      targetRepoWrites: false,
      runtimeDetectionBehaviorChange: false,
      findingSuppression: false,
      automaticSeverityDowngrade: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      prohibitedContentPresent
    },
    checks
  };
}

export function formatFalsePositiveDetectorCalibrationContractConsumptionMarkdown(
  report: FalsePositiveDetectorCalibrationContractConsumptionValidationReport
): string {
  return [
    '# False-Positive Detector Calibration Contract Consumption Validation',
    '',
    `Generated at: ${report.generatedAt}`,
    `Status: ${report.status}`,
    '',
    '## Boundary',
    '',
    '- Local-only consumption validation: yes',
    '- Target repo writes: no',
    '- No target repo writes',
    '- No runtime detection behavior change',
    '- No finding suppression',
    '- No automatic severity downgrade',
    '- Hosted dashboard, telemetry, and cloud sync: not implemented by this validation',
    '',
    '## AI IDE Read Order',
    '',
    ...report.readOrder.map((path, index) => `${index + 1}. ${formatMarkdownCodeCell(path)}`),
    '',
    '## Maintainer Review Boundary',
    '',
    '- Maintainers must review calibration questions before any detector implementation goal.',
    '- AI IDEs may summarize questions, gates, and verification tasks.',
    '- AI IDEs must not suppress findings, downgrade severity automatically, change detectors, or write target repositories.',
    '',
    '## Calibration Questions',
    '',
    ...report.consumption.calibrationQuestionIds.map((id) => `- ${id}`),
    '',
    '## Manual Gates',
    '',
    ...report.consumption.manualGates.map((gate) => `- ${gate}`),
    '',
    '## Future Implementation Authorization Required',
    '',
    ...report.consumption.futureImplementationAuthorization.map((authorization) => `- ${authorization}`),
    '',
    '## Verification Checklist',
    '',
    ...report.consumption.verificationChecklist.map((item) => `- ${item}`),
    '',
    '## Checks',
    '',
    '| Check | Status | Evidence |',
    '| --- | --- | --- |',
    ...report.checks.map((item) => `| ${formatMarkdownCodeCell(item.id)} | ${item.status} | ${item.evidence} |`),
    ''
  ].join('\n');
}

export function isDirectRun(metaUrl: string = import.meta.url, argvPath: string | undefined = process.argv[1]): boolean {
  return Boolean(argvPath && metaUrl === new URL(`file://${resolve(argvPath)}`).href);
}

function check(
  id: string,
  passed: boolean,
  evidence: string
): FalsePositiveDetectorCalibrationContractConsumptionCheck {
  return {
    id,
    status: passed ? 'passed' : 'failed',
    evidence
  };
}

function resolveRepoPath(path: string): string {
  return isAbsolute(path) ? path : resolve(root, path);
}

function containsMarkdownPath(markdown: string, resolvedPath: string, originalPath: string | undefined): boolean {
  return markdown.includes(formatMarkdownCodeCell(resolvedPath))
    || (originalPath !== undefined && markdown.includes(formatMarkdownCodeCell(originalPath)));
}

function findMatchingOriginalPath(paths: string[], resolvedPath: string): string | undefined {
  return paths.find((path) => resolveRepoPath(path) === resolvedPath);
}

function sanitizeReport(
  report: FalsePositiveDetectorCalibrationContractConsumptionValidationReport
): FalsePositiveDetectorCalibrationContractConsumptionValidationReport {
  return JSON.parse(redactSensitiveText(JSON.stringify(report))) as FalsePositiveDetectorCalibrationContractConsumptionValidationReport;
}

function readOptionValue(args: string[], index: number, optionName: string): { value: string; consumedNext: boolean } {
  const current = args[index] ?? '';
  const inlinePrefix = `${optionName}=`;

  if (current.startsWith(inlinePrefix)) {
    const value = current.slice(inlinePrefix.length);
    if (!value) {
      throw new Error(`${optionName} requires a value`);
    }

    return { value, consumedNext: false };
  }

  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${optionName} requires a value`);
  }

  return { value, consumedNext: true };
}

function formatFalsePositiveDetectorCalibrationContractConsumptionCliSummary(
  result: FalsePositiveDetectorCalibrationContractConsumptionRunResult
): string {
  return [
    'False-positive detector calibration contract consumption validation completed.',
    `JSON: ${result.validationJsonPath}`,
    `Markdown: ${result.validationMarkdownPath}`,
    `Checks: ${result.checkCount}`,
    `Validation: ${result.validationPassed ? 'passed' : 'failed'}`,
    ''
  ].join('\n');
}

if (isDirectRun()) {
  process.exitCode = await main();
}
