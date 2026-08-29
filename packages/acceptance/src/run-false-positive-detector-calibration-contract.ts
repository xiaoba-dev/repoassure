import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import {
  buildFalsePositiveRegressionCatalog,
  type FalsePositiveRegressionCatalogEntry
} from './false-positive-catalog.js';
import { formatMarkdownCodeCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultOutputDir = 'artifacts/project-graph';
const contractJsonFileName = 'false-positive-detector-calibration-contract.json';
const contractMarkdownFileName = 'false-positive-detector-calibration-contract.md';
const sourcePlanningRecord =
  'docs/operations/product-false-positive-regression-catalog-detector-calibration-planning-v0.1.md';
const catalogArtifactPaths = [
  'artifacts/project-graph/false-positive-regression-catalog.json',
  'artifacts/project-graph/false-positive-regression-catalog.md',
  'artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json',
  'artifacts/project-graph/false-positive-regression-catalog-consumption-validation.md'
] as const;
const requiredFixtureIds = [
  'real-fixture:react-disabled-save-control',
  'real-fixture:vite-auth-redirect-route'
] as const;
const requiredManualGates = [
  'maintainer_classification_required_before_detector_change',
  'catalog_fixture_privacy_review_required',
  'expected_snapshot_review_required',
  'confidence_threshold_review_required',
  'regression_artifact_review_required'
] as const;
const requiredFutureImplementationAuthorization = [
  'runtime_detector_change',
  'finding_suppression',
  'automatic_severity_downgrade',
  'detector_confidence_threshold_change',
  'acceptance_policy_change'
] as const;

export type FalsePositiveDetectorCalibrationProposedAction = 'review_only';

export interface FalsePositiveDetectorCalibrationContractCliOptions {
  outputDir?: string;
  generatedAt?: string;
}

export type FalsePositiveDetectorCalibrationContractRunInput =
  FalsePositiveDetectorCalibrationContractCliOptions;

export interface FalsePositiveDetectorCalibrationContractRunResult {
  contractJsonPath: string;
  contractMarkdownPath: string;
  calibrationQuestionCount: number;
  validationPassed: boolean;
}

export interface FalsePositiveDetectorCalibrationQuestion {
  id: string;
  fixtureId: string;
  sourceFixture: string;
  detectorArea: string;
  expectedClassification: string;
  requiredMaintainerDecision: true;
  proposedAction: FalsePositiveDetectorCalibrationProposedAction;
  question: string;
}

export interface FalsePositiveDetectorCalibrationContractBoundary {
  localOnly: true;
  runtimeDetectionBehaviorChange: boolean;
  findingSuppression: boolean;
  automaticSeverityDowngrade: boolean;
  targetRepoWrites: boolean;
  hostedDashboardImplemented: boolean;
  telemetryEnabled: boolean;
  cloudSyncEnabled: boolean;
}

export interface FalsePositiveDetectorCalibrationContractValidation {
  passed: boolean;
  errors: string[];
  coveredFixtureIds: string[];
  prohibitedContentPresent: boolean;
  boundary: {
    runtimeDetectionBehaviorChange: boolean;
    targetRepoWrites: boolean;
  };
}

export interface FalsePositiveDetectorCalibrationContract {
  schema: 'repoassure.false-positive-detector-calibration-contract@1';
  generatedAt: string;
  sourcePlanningRecord: string;
  sourceCatalog: {
    schema: 'repoassure.false-positive-regression-catalog@1';
    artifacts: string[];
    requiredFixtureIds: string[];
  };
  readOrder: string[];
  calibrationQuestions: FalsePositiveDetectorCalibrationQuestion[];
  manualGates: string[];
  futureImplementationAuthorization: string[];
  boundary: FalsePositiveDetectorCalibrationContractBoundary;
  aiIdeConsumption: {
    readOrder: string[];
    verificationChecklist: string[];
    maintainerReviewBoundary: {
      required: true;
      prohibitedActions: string[];
    };
  };
  validation: {
    nonPrivateFixturesOnly: true;
    sourceCodeIncluded: false;
    secretsIncluded: false;
    prohibitedContentPresent: boolean;
  };
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isFalsePositiveDetectorCalibrationContractHelpRequest(args)) {
    process.stdout.write(falsePositiveDetectorCalibrationContractHelpText());
    return 0;
  }

  try {
    const result = await runFalsePositiveDetectorCalibrationContractArtifacts(
      parseFalsePositiveDetectorCalibrationContractArgs(args)
    );
    process.stdout.write(formatFalsePositiveDetectorCalibrationContractCliSummary(result));
    return result.validationPassed ? 0 : 1;
  } catch (error: unknown) {
    process.stderr.write(
      `${formatAcceptanceFatalError('False-positive detector calibration contract generation failed', error)}\n`
    );
    return 1;
  }
}

export function parseFalsePositiveDetectorCalibrationContractArgs(
  args: string[]
): FalsePositiveDetectorCalibrationContractCliOptions {
  const options: FalsePositiveDetectorCalibrationContractCliOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? '';

    if (arg === '--') {
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

    throw new Error(`Unknown false-positive detector calibration contract option: ${arg}`);
  }

  return options;
}

export function isFalsePositiveDetectorCalibrationContractHelpRequest(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h');
}

export function falsePositiveDetectorCalibrationContractHelpText(): string {
  return [
    'Usage: pnpm false-positive:calibration-contract [-- --output <dir>] [-- --generated-at <iso>]',
    '',
    'Generate local false-positive detector calibration contract artifacts.',
    '',
    'Options:',
    '  --output <dir>        Output directory. Defaults to artifacts/project-graph.',
    '  --generated-at <iso>  Stable timestamp for deterministic tests.',
    '  -h, --help           Show this help.',
    '',
    'Boundary:',
    '  Writes local RepoAssure calibration contract artifacts only.',
    '  Does not change detector behavior, suppress findings, downgrade severity, or write target repositories.',
    ''
  ].join('\n');
}

export async function runFalsePositiveDetectorCalibrationContractArtifacts(
  input: FalsePositiveDetectorCalibrationContractRunInput = {}
): Promise<FalsePositiveDetectorCalibrationContractRunResult> {
  const outputDir = input.outputDir ?? defaultOutputDir;
  const resolvedOutputDir = resolveOutputDir(outputDir);
  const contract = buildFalsePositiveDetectorCalibrationContract({
    outputDir,
    generatedAt: input.generatedAt ?? new Date().toISOString()
  });
  const validation = validateFalsePositiveDetectorCalibrationContract(contract);
  const contractJsonPath = join(resolvedOutputDir, contractJsonFileName);
  const contractMarkdownPath = join(resolvedOutputDir, contractMarkdownFileName);

  await mkdir(resolvedOutputDir, { recursive: true });
  await writeFile(contractJsonPath, `${JSON.stringify(sanitizeContract(contract), null, 2)}\n`);
  await writeFile(contractMarkdownPath, formatFalsePositiveDetectorCalibrationContractMarkdown(contract));

  return {
    contractJsonPath,
    contractMarkdownPath,
    calibrationQuestionCount: contract.calibrationQuestions.length,
    validationPassed: validation.passed
  };
}

export function buildFalsePositiveDetectorCalibrationContract(input: {
  outputDir?: string;
  generatedAt?: string;
} = {}): FalsePositiveDetectorCalibrationContract {
  const outputDir = input.outputDir ?? defaultOutputDir;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const contractJsonPath = join(outputDir, contractJsonFileName);
  const contractMarkdownPath = join(outputDir, contractMarkdownFileName);
  const catalog = buildFalsePositiveRegressionCatalog({ generatedAt });
  const realFixtureEntries = requiredFixtureIds.map((fixtureId) => {
    const entry = catalog.entries.find((candidate) => candidate.findingId === fixtureId);
    if (!entry) {
      throw new Error(`Missing calibration fixture in false-positive catalog: ${fixtureId}`);
    }

    return entry;
  });
  const calibrationQuestions = realFixtureEntries.map(buildCalibrationQuestion);
  const contract: FalsePositiveDetectorCalibrationContract = {
    schema: 'repoassure.false-positive-detector-calibration-contract@1',
    generatedAt,
    sourcePlanningRecord,
    sourceCatalog: {
      schema: 'repoassure.false-positive-regression-catalog@1',
      artifacts: [...catalogArtifactPaths],
      requiredFixtureIds: [...requiredFixtureIds]
    },
    readOrder: [
      sourcePlanningRecord,
      catalogArtifactPaths[0],
      catalogArtifactPaths[2],
      contractJsonPath,
      contractMarkdownPath
    ],
    calibrationQuestions,
    manualGates: [...requiredManualGates],
    futureImplementationAuthorization: [...requiredFutureImplementationAuthorization],
    boundary: {
      localOnly: true,
      runtimeDetectionBehaviorChange: false,
      findingSuppression: false,
      automaticSeverityDowngrade: false,
      targetRepoWrites: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false
    },
    aiIdeConsumption: {
      readOrder: [
        sourcePlanningRecord,
        catalogArtifactPaths[0],
        catalogArtifactPaths[2],
        contractJsonPath,
        contractMarkdownPath
      ],
      verificationChecklist: [
        'Read the planning record before the generated contract.',
        'Confirm every calibration question references a catalog fixture ID.',
        'Confirm every calibration question remains review_only before any detector implementation goal.',
        'Verify all manual gates are present before proposing detector calibration changes.',
        'Do not suppress findings, downgrade severity, or change detector behavior from this contract.',
        'Do not write target repositories from this contract.'
      ],
      maintainerReviewBoundary: {
        required: true,
        prohibitedActions: [
          'runtime detector behavior change',
          'finding suppression',
          'automatic severity downgrade',
          'target repository write',
          'hosted dashboard availability claim'
        ]
      }
    },
    validation: {
      nonPrivateFixturesOnly: true,
      sourceCodeIncluded: false,
      secretsIncluded: false,
      prohibitedContentPresent: false
    }
  };

  return {
    ...contract,
    validation: {
      ...contract.validation,
      prohibitedContentPresent: hasProhibitedContent(contract)
    }
  };
}

export function validateFalsePositiveDetectorCalibrationContract(
  contract: FalsePositiveDetectorCalibrationContract
): FalsePositiveDetectorCalibrationContractValidation {
  const errors: string[] = [];
  const coveredFixtureIds = contract.calibrationQuestions.map((question) => question.fixtureId);

  if (contract.schema !== 'repoassure.false-positive-detector-calibration-contract@1') {
    errors.push('Unexpected calibration contract schema.');
  }

  for (const fixtureId of requiredFixtureIds) {
    if (!coveredFixtureIds.includes(fixtureId)) {
      errors.push(`Missing calibration fixture: ${fixtureId}`);
    }
  }

  for (const gate of requiredManualGates) {
    if (!contract.manualGates.includes(gate)) {
      errors.push(`Missing manual gate: ${gate}`);
    }
  }

  for (const authorization of requiredFutureImplementationAuthorization) {
    if (!contract.futureImplementationAuthorization.includes(authorization)) {
      errors.push(`Missing future implementation authorization: ${authorization}`);
    }
  }

  for (const question of contract.calibrationQuestions) {
    if (question.requiredMaintainerDecision !== true) {
      errors.push(`Calibration question ${question.id} must require maintainer decision.`);
    }

    if (question.proposedAction !== 'review_only') {
      errors.push(`Calibration question ${question.id} must remain review_only.`);
    }
  }

  if (contract.boundary.runtimeDetectionBehaviorChange !== false) {
    errors.push('Calibration contract must not change runtime detection behavior.');
  }

  if (contract.boundary.findingSuppression !== false) {
    errors.push('Calibration contract must not suppress findings.');
  }

  if (contract.boundary.automaticSeverityDowngrade !== false) {
    errors.push('Calibration contract must not downgrade severity automatically.');
  }

  if (contract.boundary.targetRepoWrites !== false) {
    errors.push('Calibration contract must not write target repositories.');
  }

  if (contract.validation.sourceCodeIncluded !== false) {
    errors.push('Calibration contract must not include source code.');
  }

  if (contract.validation.secretsIncluded !== false) {
    errors.push('Calibration contract must not include secrets.');
  }

  const prohibitedContentPresent = hasProhibitedContent(contract);
  if (prohibitedContentPresent) {
    errors.push('Calibration contract contains prohibited secret-like content.');
  }

  return {
    passed: errors.length === 0,
    errors,
    coveredFixtureIds,
    prohibitedContentPresent,
    boundary: {
      runtimeDetectionBehaviorChange: contract.boundary.runtimeDetectionBehaviorChange,
      targetRepoWrites: contract.boundary.targetRepoWrites
    }
  };
}

export function formatFalsePositiveDetectorCalibrationContractMarkdown(
  contract: FalsePositiveDetectorCalibrationContract
): string {
  const validation = validateFalsePositiveDetectorCalibrationContract(contract);

  return [
    '# False-Positive Detector Calibration Contract',
    '',
    `Generated at: ${contract.generatedAt}`,
    '',
    '## Boundary',
    '',
    '- Local-only artifact generation: yes',
    `- Runtime detection behavior change: ${contract.boundary.runtimeDetectionBehaviorChange ? 'yes' : 'no'}`,
    `- Finding suppression: ${contract.boundary.findingSuppression ? 'yes' : 'no'}`,
    `- Automatic severity downgrade: ${contract.boundary.automaticSeverityDowngrade ? 'yes' : 'no'}`,
    `- Target repo writes: ${contract.boundary.targetRepoWrites ? 'yes' : 'no'}`,
    '- Hosted dashboard, telemetry, and cloud sync: not implemented by this artifact',
    '',
    '## AI IDE Read Order',
    '',
    ...contract.aiIdeConsumption.readOrder.map((path, index) => `${index + 1}. \`${path}\``),
    '',
    '## Calibration Questions',
    '',
    '| Fixture | Detector area | Question | Required maintainer decision | Proposed action |',
    '| --- | --- | --- | --- | --- |',
    ...contract.calibrationQuestions.map((question) => [
      formatMarkdownCodeCell(question.fixtureId),
      formatMarkdownCodeCell(question.detectorArea),
      formatMarkdownCodeCell(question.id),
      question.requiredMaintainerDecision ? 'yes' : 'no',
      question.proposedAction
    ].join(' | ')).map((row) => `| ${row} |`),
    '',
    '## Manual Gates',
    '',
    ...contract.manualGates.map((gate) => `- ${gate}`),
    '',
    '## Future Implementation Authorization Required',
    '',
    ...contract.futureImplementationAuthorization.map((authorization) => `- ${authorization}`),
    '',
    '## Maintainer Review Boundary',
    '',
    '- Maintainer review required: yes',
    'Prohibited actions:',
    '',
    ...contract.aiIdeConsumption.maintainerReviewBoundary.prohibitedActions.map((action) => `- ${action}`),
    '',
    '## Verification Checklist',
    '',
    ...contract.aiIdeConsumption.verificationChecklist.map((item) => `- ${item}`),
    '',
    '## Validation',
    '',
    `- Passed: ${validation.passed ? 'yes' : 'no'}`,
    `- Covered fixture IDs: ${validation.coveredFixtureIds.join(', ')}`,
    `- Prohibited content present: ${validation.prohibitedContentPresent ? 'yes' : 'no'}`,
    ''
  ].join('\n');
}

function buildCalibrationQuestion(
  entry: FalsePositiveRegressionCatalogEntry
): FalsePositiveDetectorCalibrationQuestion {
  if (entry.findingId === 'real-fixture:react-disabled-save-control') {
    return {
      id: 'conditional_dead_control_should_consider_form_dirty_prerequisites',
      fixtureId: entry.findingId,
      sourceFixture: entry.sourceFixture,
      detectorArea: 'conditional_dead_control',
      expectedClassification: entry.expectedSnapshot.expected_classification,
      requiredMaintainerDecision: true,
      proposedAction: 'review_only',
      question:
        'Decide whether disabled controls with documented prerequisite state should remain false_positive_candidate, become lower-confidence findings, or stay as maintainer-review findings.'
    };
  }

  return {
    id: 'auth_redirect_route_should_preserve_maintainer_review_boundary',
    fixtureId: entry.findingId,
    sourceFixture: entry.sourceFixture,
    detectorArea: 'auth_redirect_route',
    expectedClassification: entry.expectedSnapshot.expected_classification,
    requiredMaintainerDecision: true,
    proposedAction: 'review_only',
    question:
      'Decide whether unauthenticated redirect behavior should stay needs_maintainer_review unless authenticated evidence exists.'
  };
}

function resolveOutputDir(outputDir: string): string {
  return isAbsolute(outputDir) ? outputDir : resolve(root, outputDir);
}

function sanitizeContract(
  contract: FalsePositiveDetectorCalibrationContract
): FalsePositiveDetectorCalibrationContract {
  return JSON.parse(redactSensitiveText(JSON.stringify(contract))) as FalsePositiveDetectorCalibrationContract;
}

function hasProhibitedContent(contract: FalsePositiveDetectorCalibrationContract): boolean {
  return /sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY/u.test(JSON.stringify(contract));
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

function formatFalsePositiveDetectorCalibrationContractCliSummary(
  result: FalsePositiveDetectorCalibrationContractRunResult
): string {
  return [
    'False-positive detector calibration contract artifacts generated.',
    `JSON: ${result.contractJsonPath}`,
    `Markdown: ${result.contractMarkdownPath}`,
    `Calibration questions: ${result.calibrationQuestionCount}`,
    `Validation: ${result.validationPassed ? 'passed' : 'failed'}`,
    ''
  ].join('\n');
}

export function isDirectRun(metaUrl: string = import.meta.url, argvPath: string | undefined = process.argv[1]): boolean {
  return Boolean(argvPath && metaUrl === new URL(`file://${resolve(argvPath)}`).href);
}

if (isDirectRun()) {
  process.exitCode = await main();
}
