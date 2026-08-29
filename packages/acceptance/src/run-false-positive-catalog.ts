import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import {
  buildFalsePositiveRegressionCatalog,
  validateFalsePositiveRegressionCatalog,
  type FalsePositiveRegressionCatalog,
  type FalsePositiveRegressionCatalogValidation
} from './false-positive-catalog.js';
import { formatMarkdownCodeCell } from './markdown.js';
import { redactSensitiveText } from './redaction.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultOutputDir = 'artifacts/project-graph';
const catalogJsonFileName = 'false-positive-regression-catalog.json';
const catalogMarkdownFileName = 'false-positive-regression-catalog.md';

const prohibitedActions = [
  'runtime_detection_behavior_change',
  'finding_suppression',
  'automatic_severity_downgrade',
  'target_repo_write',
  'hosted_dashboard',
  'cloud_sync',
  'telemetry',
  'deployment',
  'public_release',
  'repository_visibility_change',
  'npm_publication',
  'github_release',
  'customer_contact',
  'pricing_change',
  'spend_change',
  'website_design_system_rewrite'
] as const;

export interface FalsePositiveRegressionCatalogCliOptions {
  outputDir?: string;
  generatedAt?: string;
}

export type FalsePositiveRegressionCatalogRunInput = FalsePositiveRegressionCatalogCliOptions;

export interface FalsePositiveRegressionCatalogRunResult {
  catalogJsonPath: string;
  catalogMarkdownPath: string;
  entryCount: number;
  validationPassed: boolean;
}

export interface FalsePositiveRegressionCatalogArtifactDescriptor {
  path: string;
  status: 'generated';
  schema?: string;
}

export interface FalsePositiveRegressionCatalogArtifactBundle {
  schema: 'repoassure.false-positive-regression-catalog-artifacts@1';
  generatedAt: string;
  readOrder: string[];
  artifacts: {
    catalogJson: FalsePositiveRegressionCatalogArtifactDescriptor;
    catalogMarkdown: FalsePositiveRegressionCatalogArtifactDescriptor;
  };
  catalog: FalsePositiveRegressionCatalog;
  validation: FalsePositiveRegressionCatalogValidation;
  boundary: {
    localOnly: true;
    targetRepoWriteAuthorized: false;
    runtimeDetectionBehaviorChange: false;
    findingSuppression: false;
    automaticSeverityDowngrade: false;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
    cloudSyncEnabled: false;
    prohibitedActions: string[];
  };
  aiIdeConsumption: {
    readOrder: string[];
    maintainerReviewBoundary: {
      allowedActions: string[];
      prohibitedActions: string[];
    };
    verificationChecklist: string[];
  };
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isFalsePositiveRegressionCatalogHelpRequest(args)) {
    process.stdout.write(falsePositiveRegressionCatalogHelpText());
    return 0;
  }

  try {
    const result = await runFalsePositiveRegressionCatalogArtifacts(parseFalsePositiveRegressionCatalogArgs(args));
    process.stdout.write(formatFalsePositiveRegressionCatalogCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('False-positive regression catalog generation failed', error)}\n`);
    return 1;
  }
}

export function parseFalsePositiveRegressionCatalogArgs(args: string[]): FalsePositiveRegressionCatalogCliOptions {
  const options: FalsePositiveRegressionCatalogCliOptions = {};

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

    throw new Error(`Unknown false-positive catalog option: ${arg}`);
  }

  return options;
}

export function isFalsePositiveRegressionCatalogHelpRequest(args: string[]): boolean {
  return args.includes('--help') || args.includes('-h');
}

export function falsePositiveRegressionCatalogHelpText(): string {
  return [
    'Usage: pnpm false-positive:catalog [-- --output <dir>] [-- --generated-at <iso>]',
    '',
    'Generate local false-positive regression catalog artifacts.',
    '',
    'Options:',
    '  --output <dir>        Output directory. Defaults to artifacts/project-graph.',
    '  --generated-at <iso>  Stable timestamp for deterministic tests.',
    '  -h, --help           Show this help.',
    '',
    'Boundary:',
    '  Writes local RepoAssure artifacts only.',
    '  Does not write target repositories, suppress findings, or change detector behavior.',
    ''
  ].join('\n');
}

export async function runFalsePositiveRegressionCatalogArtifacts(
  input: FalsePositiveRegressionCatalogRunInput = {}
): Promise<FalsePositiveRegressionCatalogRunResult> {
  const outputDir = input.outputDir ?? defaultOutputDir;
  const resolvedOutputDir = resolveOutputDir(outputDir);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const bundle = buildFalsePositiveRegressionCatalogArtifactBundle({
    outputDir,
    generatedAt
  });
  const catalogJsonPath = join(resolvedOutputDir, catalogJsonFileName);
  const catalogMarkdownPath = join(resolvedOutputDir, catalogMarkdownFileName);

  await mkdir(resolvedOutputDir, { recursive: true });
  await writeFile(catalogJsonPath, `${JSON.stringify(sanitizeBundle(bundle), null, 2)}\n`);
  await writeFile(catalogMarkdownPath, formatFalsePositiveRegressionCatalogMarkdown(bundle));

  return {
    catalogJsonPath,
    catalogMarkdownPath,
    entryCount: bundle.catalog.entries.length,
    validationPassed: bundle.validation.passed
  };
}

export function buildFalsePositiveRegressionCatalogArtifactBundle(input: {
  outputDir?: string;
  generatedAt?: string;
} = {}): FalsePositiveRegressionCatalogArtifactBundle {
  const outputDir = input.outputDir ?? defaultOutputDir;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const catalog = buildFalsePositiveRegressionCatalog({ generatedAt });
  const validation = validateFalsePositiveRegressionCatalog(catalog);
  const catalogJsonPath = join(outputDir, catalogJsonFileName);
  const catalogMarkdownPath = join(outputDir, catalogMarkdownFileName);
  const readOrder = [catalogJsonPath, catalogMarkdownPath];

  return {
    schema: 'repoassure.false-positive-regression-catalog-artifacts@1',
    generatedAt,
    readOrder,
    artifacts: {
      catalogJson: {
        path: catalogJsonPath,
        status: 'generated',
        schema: 'repoassure.false-positive-regression-catalog@1'
      },
      catalogMarkdown: {
        path: catalogMarkdownPath,
        status: 'generated'
      }
    },
    catalog,
    validation,
    boundary: {
      localOnly: true,
      targetRepoWriteAuthorized: false,
      runtimeDetectionBehaviorChange: false,
      findingSuppression: false,
      automaticSeverityDowngrade: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      prohibitedActions: [...prohibitedActions]
    },
    aiIdeConsumption: {
      readOrder,
      maintainerReviewBoundary: {
        allowedActions: [
          'review expected snapshots',
          'approve fixture classification',
          'reject fixture classification',
          'defer fixture classification',
          'accept risk with notes'
        ],
        prohibitedActions: [
          'suppress findings',
          'downgrade severity automatically',
          'write target repository',
          'change runtime detector behavior',
          'publish hosted dashboard claims'
        ]
      },
      verificationChecklist: [
        'Read JSON before Markdown for canonical machine-readable fields.',
        'Confirm validation.passed is true and redaction.prohibitedContentPresent is false.',
        'Review maintainer_decision fields before fixture classification changes.',
        'Do not suppress findings or downgrade severity automatically.',
        'Do not write or mutate target repositories from these artifacts.'
      ]
    }
  };
}

export function formatFalsePositiveRegressionCatalogMarkdown(
  bundle: FalsePositiveRegressionCatalogArtifactBundle
): string {
  return [
    '# False-Positive Regression Catalog Artifacts',
    '',
    `Generated at: ${bundle.generatedAt}`,
    '',
    '## Boundary',
    '',
    '- Local-only artifact generation: yes',
    '- Target repo writes: no',
    '- No runtime detection behavior change',
    '- No finding suppression',
    '- No automatic severity downgrade',
    '- Hosted dashboard, telemetry, and cloud sync: not implemented by this artifact',
    '',
    '## AI IDE Read Order',
    '',
    ...bundle.aiIdeConsumption.readOrder.map((path, index) => `${index + 1}. \`${path}\``),
    '',
    '## Maintainer Review Boundary',
    '',
    'Allowed decisions:',
    '',
    ...bundle.aiIdeConsumption.maintainerReviewBoundary.allowedActions.map((action) => `- ${action}`),
    '',
    'Prohibited actions:',
    '',
    ...bundle.aiIdeConsumption.maintainerReviewBoundary.prohibitedActions.map((action) => `- ${action}`),
    '',
    '## Fixture Categories',
    '',
    ...bundle.catalog.contract.fixtureCategories.map((category) => `- ${category}`),
    '',
    '## Expected Finding Snapshots',
    '',
    '| Finding | Fixture | Category | Origin | Non-private | Severity | Expected classification | Maintainer decision |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...bundle.catalog.entries.map((entry) => [
      formatMarkdownCodeCell(entry.findingId),
      formatMarkdownCodeCell(entry.sourceFixture),
      entry.fixtureCategory,
      entry.fixtureOrigin,
      entry.privacy.nonPrivate ? 'yes' : 'no',
      entry.expectedSnapshot.severity,
      entry.expectedSnapshot.expected_classification,
      entry.expectedSnapshot.maintainer_decision
    ].join(' | ')).map((row) => `| ${row} |`),
    '',
    '## Review Fields',
    '',
    ...bundle.catalog.contract.reviewFields.map((field) => `- ${field}`),
    '',
    '## Validation',
    '',
    `- Passed: ${bundle.validation.passed ? 'yes' : 'no'}`,
    `- Covered fixture categories: ${bundle.validation.coveredFixtureCategories.join(', ')}`,
    `- Boundary target repo writes: ${bundle.validation.boundary.targetRepoWrites ? 'yes' : 'no'}`,
    `- Boundary runtime detection behavior change: ${bundle.validation.boundary.runtimeDetectionBehaviorChange ? 'yes' : 'no'}`,
    '',
    '## Redaction',
    '',
    `- Prohibited content present: ${bundle.validation.redaction.prohibitedContentPresent ? 'yes' : 'no'}`,
    '- Prohibited token and private-key markers checked: yes',
    '',
    '## Verification Checklist',
    '',
    ...bundle.aiIdeConsumption.verificationChecklist.map((item) => `- ${item}`),
    ''
  ].join('\n');
}

function resolveOutputDir(outputDir: string): string {
  return isAbsolute(outputDir) ? outputDir : resolve(root, outputDir);
}

function sanitizeBundle(bundle: FalsePositiveRegressionCatalogArtifactBundle): FalsePositiveRegressionCatalogArtifactBundle {
  return JSON.parse(redactSensitiveText(JSON.stringify(bundle))) as FalsePositiveRegressionCatalogArtifactBundle;
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

function formatFalsePositiveRegressionCatalogCliSummary(
  result: FalsePositiveRegressionCatalogRunResult
): string {
  return [
    'False-positive regression catalog artifacts generated.',
    `JSON: ${result.catalogJsonPath}`,
    `Markdown: ${result.catalogMarkdownPath}`,
    `Entries: ${result.entryCount}`,
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
