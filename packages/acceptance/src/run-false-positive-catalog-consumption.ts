import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { formatMarkdownCodeCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';
import type { FalsePositiveRegressionCatalogArtifactBundle } from './run-false-positive-catalog.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultOutputDir = 'artifacts/project-graph';
const defaultCatalogJsonPath = join(defaultOutputDir, 'false-positive-regression-catalog.json');
const defaultCatalogMarkdownPath = join(defaultOutputDir, 'false-positive-regression-catalog.md');
const validationJsonFileName = 'false-positive-regression-catalog-consumption-validation.json';
const validationMarkdownFileName = 'false-positive-regression-catalog-consumption-validation.md';

export interface FalsePositiveRegressionCatalogConsumptionCliOptions {
  catalogJsonPath?: string;
  catalogMarkdownPath?: string;
  outputDir?: string;
  generatedAt?: string;
}

export type FalsePositiveRegressionCatalogConsumptionRunInput =
  FalsePositiveRegressionCatalogConsumptionCliOptions;

export interface FalsePositiveRegressionCatalogConsumptionRunResult {
  validationJsonPath: string;
  validationMarkdownPath: string;
  validationPassed: boolean;
  checkCount: number;
}

export type FalsePositiveRegressionCatalogConsumptionCheckStatus = 'passed' | 'failed';

export interface FalsePositiveRegressionCatalogConsumptionCheck {
  id: string;
  status: FalsePositiveRegressionCatalogConsumptionCheckStatus;
  evidence: string;
}

export interface FalsePositiveRegressionCatalogConsumptionValidationReport {
  schema: 'repoassure.false-positive-regression-catalog-consumption-validation@1';
  generatedAt: string;
  status: FalsePositiveRegressionCatalogConsumptionCheckStatus;
  readOrder: string[];
  inputArtifacts: {
    catalogJsonPath: string;
    catalogMarkdownPath: string;
  };
  consumption: {
    aiIdeCanConsume: boolean;
    maintainerCanReview: boolean;
    fixtureCategoriesCovered: string[];
    expectedSnapshotFields: string[];
    reviewFields: string[];
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
  checks: FalsePositiveRegressionCatalogConsumptionCheck[];
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isFalsePositiveRegressionCatalogConsumptionHelpRequest(args)) {
    process.stdout.write(falsePositiveRegressionCatalogConsumptionHelpText());
    return 0;
  }

  try {
    const result = await runFalsePositiveRegressionCatalogConsumptionValidation(
      parseFalsePositiveRegressionCatalogConsumptionArgs(args)
    );
    process.stdout.write(formatFalsePositiveRegressionCatalogConsumptionCliSummary(result));
    return result.validationPassed ? 0 : 1;
  } catch (error: unknown) {
    process.stderr.write(
      `${formatAcceptanceFatalError('False-positive regression catalog consumption validation failed', error)}\n`
    );
    return 1;
  }
}

export function parseFalsePositiveRegressionCatalogConsumptionArgs(
  args: string[]
): FalsePositiveRegressionCatalogConsumptionCliOptions {
  const options: FalsePositiveRegressionCatalogConsumptionCliOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? '';

    if (arg === '--') {
      continue;
    }

    if (arg === '--catalog-json' || arg.startsWith('--catalog-json=')) {
      const parsed = readOptionValue(args, index, '--catalog-json');
      options.catalogJsonPath = parsed.value;
      if (parsed.consumedNext) {
        index += 1;
      }
      continue;
    }

    if (
      arg === '--catalog-md'
      || arg.startsWith('--catalog-md=')
      || arg === '--catalog-markdown'
      || arg.startsWith('--catalog-markdown=')
    ) {
      const optionName = arg.startsWith('--catalog-markdown') ? '--catalog-markdown' : '--catalog-md';
      const parsed = readOptionValue(args, index, optionName);
      options.catalogMarkdownPath = parsed.value;
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

    throw new Error(`Unknown false-positive catalog consumption option: ${arg}`);
  }

  return options;
}

export function isFalsePositiveRegressionCatalogConsumptionHelpRequest(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h');
}

export function falsePositiveRegressionCatalogConsumptionHelpText(): string {
  return [
    'Usage: pnpm false-positive:catalog:validate [-- --catalog-json <path>] [-- --catalog-md <path>]',
    '',
    'Validate local false-positive regression catalog artifact consumption.',
    '',
    'Options:',
    '  --catalog-json <path>      Catalog JSON path. Defaults to artifacts/project-graph/false-positive-regression-catalog.json.',
    '  --catalog-md <path>        Catalog Markdown path. Defaults to artifacts/project-graph/false-positive-regression-catalog.md.',
    '  --output <dir>             Output directory. Defaults to artifacts/project-graph.',
    '  --generated-at <iso>       Stable timestamp for deterministic tests.',
    '  -h, --help                 Show this help.',
    '',
    'Boundary:',
    '  Reads local RepoAssure catalog artifacts and writes validation artifacts only.',
    '  Does not write target repositories, suppress findings, downgrade severity, or change detector behavior.',
    ''
  ].join('\n');
}

export async function runFalsePositiveRegressionCatalogConsumptionValidation(
  input: FalsePositiveRegressionCatalogConsumptionRunInput = {}
): Promise<FalsePositiveRegressionCatalogConsumptionRunResult> {
  const outputDir = resolveRepoPath(input.outputDir ?? defaultOutputDir);
  const report = await validateFalsePositiveRegressionCatalogConsumptionArtifacts(input);
  const validationJsonPath = join(outputDir, validationJsonFileName);
  const validationMarkdownPath = join(outputDir, validationMarkdownFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(validationJsonPath, `${JSON.stringify(sanitizeReport(report), null, 2)}\n`);
  await writeFile(validationMarkdownPath, formatFalsePositiveRegressionCatalogConsumptionMarkdown(report));

  return {
    validationJsonPath,
    validationMarkdownPath,
    validationPassed: report.status === 'passed',
    checkCount: report.checks.length
  };
}

export async function validateFalsePositiveRegressionCatalogConsumptionArtifacts(
  input: FalsePositiveRegressionCatalogConsumptionRunInput = {}
): Promise<FalsePositiveRegressionCatalogConsumptionValidationReport> {
  const catalogJsonPath = resolveRepoPath(input.catalogJsonPath ?? defaultCatalogJsonPath);
  const catalogMarkdownPath = resolveRepoPath(input.catalogMarkdownPath ?? defaultCatalogMarkdownPath);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const [rawJson, markdown] = await Promise.all([
    readFile(catalogJsonPath, 'utf8'),
    readFile(catalogMarkdownPath, 'utf8')
  ]);
  const bundle = JSON.parse(rawJson) as Partial<FalsePositiveRegressionCatalogArtifactBundle>;
  const bundleReadOrder = [...(bundle.readOrder ?? [])];
  const resolvedBundleReadOrder = bundleReadOrder.map((path) => resolveRepoPath(path));
  const readOrder = [
    catalogJsonPath,
    catalogMarkdownPath
  ];
  const prohibitedContentPresent = /sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY/u.test(`${rawJson}\n${markdown}`);
  const fixtureCategories = [...(bundle.catalog?.contract.fixtureCategories ?? [])];
  const expectedSnapshotFields = [...(bundle.catalog?.contract.expectedSnapshotFields ?? [])];
  const reviewFields = [...(bundle.catalog?.contract.reviewFields ?? [])];
  const verificationChecklist = [...(bundle.aiIdeConsumption?.verificationChecklist ?? [])];
  const checks: FalsePositiveRegressionCatalogConsumptionCheck[] = [
    check(
      'json_schema',
      bundle.schema === 'repoassure.false-positive-regression-catalog-artifacts@1',
      'Catalog JSON exposes the expected artifact bundle schema.'
    ),
    check(
      'json_validation_passed',
      bundle.validation?.passed === true,
      'Catalog JSON validation.passed is true.'
    ),
    check(
      'json_read_order',
      resolvedBundleReadOrder.length === 2
        && resolvedBundleReadOrder[0] === catalogJsonPath
        && resolvedBundleReadOrder[1] === catalogMarkdownPath,
      'Catalog JSON readOrder points to JSON first and Markdown second.'
    ),
    check(
      'markdown_ai_ide_read_order',
      markdown.includes('## AI IDE Read Order')
        && containsMarkdownPath(markdown, catalogJsonPath, bundleReadOrder[0])
        && containsMarkdownPath(markdown, catalogMarkdownPath, bundleReadOrder[1]),
      'Catalog Markdown exposes the AI IDE read order.'
    ),
    check(
      'markdown_maintainer_review_boundary',
      markdown.includes('## Maintainer Review Boundary')
        && markdown.includes('Allowed decisions:')
        && markdown.includes('Prohibited actions:'),
      'Catalog Markdown exposes allowed maintainer decisions and prohibited actions.'
    ),
    check(
      'fixture_categories',
      fixtureCategories.includes('browser_hardening_findings')
        && fixtureCategories.includes('project_intelligence_findings')
        && fixtureCategories.includes('security_assurance_findings')
        && fixtureCategories.includes('repair_planner_consumption')
        && fixtureCategories.includes('mixed_run_bundle_regressions')
        && fixtureCategories.includes('real_world_fixture_regressions'),
      'Catalog covers all required fixture categories.'
    ),
    check(
      'expected_snapshot_fields',
      expectedSnapshotFields.includes('finding_id')
        && expectedSnapshotFields.includes('source_fixture')
        && expectedSnapshotFields.includes('expected_classification')
        && expectedSnapshotFields.includes('maintainer_decision')
        && expectedSnapshotFields.includes('regression_commands'),
      'Catalog exposes expected finding snapshot fields.'
    ),
    check(
      'review_fields',
      reviewFields.includes('false_positive_risk')
        && reviewFields.includes('rationale')
        && reviewFields.includes('maintainer_decision')
        && reviewFields.includes('accepted_risk_notes'),
      'Catalog exposes maintainer review fields.'
    ),
    check(
      'verification_checklist',
      verificationChecklist.some((item) => item.includes('Read JSON before Markdown'))
        && verificationChecklist.some((item) => item.includes('Do not write or mutate target repositories')),
      'Catalog exposes AI IDE verification checklist.'
    ),
    check(
      'boundary_no_target_repo_writes',
      bundle.boundary?.targetRepoWriteAuthorized === false,
      'Catalog boundary does not authorize target repo writes.'
    ),
    check(
      'boundary_no_runtime_detection_change',
      bundle.boundary?.runtimeDetectionBehaviorChange === false,
      'Catalog boundary does not authorize runtime detector behavior changes.'
    ),
    check(
      'boundary_no_suppression_or_auto_downgrade',
      bundle.boundary?.findingSuppression === false && bundle.boundary.automaticSeverityDowngrade === false,
      'Catalog boundary does not authorize suppression or automatic severity downgrade.'
    ),
    check(
      'redaction_boundary',
      prohibitedContentPresent === false && bundle.validation?.redaction.prohibitedContentPresent === false,
      'Catalog artifacts do not expose prohibited token or private-key markers.'
    )
  ];
  const status = checks.every((item) => item.status === 'passed') ? 'passed' : 'failed';

  return {
    schema: 'repoassure.false-positive-regression-catalog-consumption-validation@1',
    generatedAt,
    status,
    readOrder,
    inputArtifacts: {
      catalogJsonPath,
      catalogMarkdownPath
    },
    consumption: {
      aiIdeCanConsume: status === 'passed',
      maintainerCanReview: status === 'passed',
      fixtureCategoriesCovered: fixtureCategories,
      expectedSnapshotFields,
      reviewFields,
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

export function formatFalsePositiveRegressionCatalogConsumptionMarkdown(
  report: FalsePositiveRegressionCatalogConsumptionValidationReport
): string {
  return [
    '# False-Positive Regression Catalog Consumption Validation',
    '',
    `Generated at: ${report.generatedAt}`,
    `Status: ${report.status}`,
    '',
    '## Boundary',
    '',
    '- Local-only consumption validation: yes',
    '- Target repo writes: no',
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
    '- Maintainers may review, approve, reject, defer, or accept risk for fixture classifications.',
    '- AI IDEs may summarize findings and propose review tasks.',
    '- AI IDEs must not suppress findings, downgrade severity automatically, change detectors, or write target repositories.',
    '',
    '## Fixture Categories',
    '',
    ...report.consumption.fixtureCategoriesCovered.map((category) => `- ${category}`),
    '',
    '## Expected Snapshot Fields',
    '',
    ...report.consumption.expectedSnapshotFields.map((field) => `- ${field}`),
    '',
    '## Review Fields',
    '',
    ...report.consumption.reviewFields.map((field) => `- ${field}`),
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

function check(id: string, passed: boolean, evidence: string): FalsePositiveRegressionCatalogConsumptionCheck {
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

function sanitizeReport(
  report: FalsePositiveRegressionCatalogConsumptionValidationReport
): FalsePositiveRegressionCatalogConsumptionValidationReport {
  return JSON.parse(redactSensitiveText(JSON.stringify(report))) as FalsePositiveRegressionCatalogConsumptionValidationReport;
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

function formatFalsePositiveRegressionCatalogConsumptionCliSummary(
  result: FalsePositiveRegressionCatalogConsumptionRunResult
): string {
  return [
    'False-positive regression catalog consumption validation completed.',
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
