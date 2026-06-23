import { join } from 'node:path';

import {
  acceptancePackageDistOutputEntries,
  legacyAcceptanceCompatibilityModules,
  legacyAcceptanceDistOutputEntries,
  legacyAcceptanceWrapperSourceEntries,
  type acceptanceCompatibilityContract,
  type AcceptancePackageDistOutputEntry,
  type LegacyAcceptanceCompatibilityModule
} from './compatibility.js';

type KebabToPascal<T extends string> = T extends `${infer Head}-${infer Tail}`
  ? `${Capitalize<Head>}${KebabToPascal<Tail>}`
  : Capitalize<T>;
type PackageAcceptanceDistModule = 'index' | typeof acceptanceCompatibilityContract.packageOwnedModules[number];
type PackageAcceptanceDistSourceKey<T extends PackageAcceptanceDistModule = PackageAcceptanceDistModule> =
  T extends PackageAcceptanceDistModule ? `packageAcceptanceDist${KebabToPascal<T>}` : never;
type PackageAcceptanceDistDeclarationSourceKey<T extends PackageAcceptanceDistModule = PackageAcceptanceDistModule> =
  T extends PackageAcceptanceDistModule ? `packageAcceptanceDist${KebabToPascal<T>}Declaration` : never;
type PackageAcceptanceDistSourceMapSourceKey<T extends PackageAcceptanceDistModule = PackageAcceptanceDistModule> =
  T extends PackageAcceptanceDistModule ? `packageAcceptanceDist${KebabToPascal<T>}SourceMap` : never;
type PackageAcceptanceDistTextSourcePaths = Readonly<Record<
  PackageAcceptanceDistSourceKey | PackageAcceptanceDistDeclarationSourceKey | PackageAcceptanceDistSourceMapSourceKey,
  string
>>;
type LegacyAcceptanceSourceKey<T extends LegacyAcceptanceCompatibilityModule = LegacyAcceptanceCompatibilityModule> =
  T extends LegacyAcceptanceCompatibilityModule ? `legacyAcceptance${KebabToPascal<T>}` : never;
type LegacyDistAcceptanceSourceKey<T extends LegacyAcceptanceCompatibilityModule = LegacyAcceptanceCompatibilityModule> =
  T extends LegacyAcceptanceCompatibilityModule ? `legacyDistAcceptance${KebabToPascal<T>}` : never;
type LegacyDistAcceptanceDeclarationSourceKey<
  T extends LegacyAcceptanceCompatibilityModule = LegacyAcceptanceCompatibilityModule
> = T extends LegacyAcceptanceCompatibilityModule ? `legacyDistAcceptance${KebabToPascal<T>}Declaration` : never;
type LegacyDistAcceptanceSourceMapSourceKey<
  T extends LegacyAcceptanceCompatibilityModule = LegacyAcceptanceCompatibilityModule
> = T extends LegacyAcceptanceCompatibilityModule ? `legacyDistAcceptance${KebabToPascal<T>}SourceMap` : never;
type LegacyAcceptanceTextSourcePaths = Readonly<Record<
  | LegacyAcceptanceSourceKey
  | LegacyDistAcceptanceSourceKey
  | LegacyDistAcceptanceDeclarationSourceKey
  | LegacyDistAcceptanceSourceMapSourceKey,
  string
>>;

export const GOAL_AUDIT_TEXT_SOURCE_PATHS = {
  packageJson: 'package.json',
  acceptancePackageJson: 'packages/acceptance/package.json',
  sharedPackageJson: 'packages/shared/package.json',
  repairPlannerPackageJson: 'packages/repair-planner/package.json',
  browserExplorerPackageJson: 'packages/browser-explorer/package.json',
  codexGoal: 'docs/goals/codex-goal.md',
  toolRegistry: 'src/adapters/mcp/tool-registry.ts',
  mcpServerSource: 'src/adapters/mcp/server.ts',
  mcpServerTest: 'tests/integration/mcp-server.test.ts',
  cliRun: 'src/adapters/cli/run.ts',
  analyzeRepo: 'src/domain/analyze/analyze-repo.ts',
  privacyRedaction: 'packages/shared/src/privacy-redaction.ts',
  playwrightDriver: 'packages/browser-explorer/src/playwright-driver.ts',
  legacyBrowserExplorerExploreApp: 'src/domain/explore/explore-app.ts',
  legacyBrowserExplorerPlaywrightDriver: 'src/domain/explore/playwright-driver.ts',
  bootAppTool: 'src/tools/boot-app-tool.ts',
  exploreAppTool: 'src/tools/explore-app-tool.ts',
  runHardening: 'src/tools/run-hardening-tool.ts',
  generateTestsTool: 'src/tools/generate-tests-tool.ts',
  generateRepairPlanTool: 'src/tools/generate-repair-plan-tool.ts',
  repairPlanGenerator: 'packages/repair-planner/src/generate-repair-plan.ts',
  legacyRepairPlanGenerator: 'src/domain/repair-plan/generate-repair-plan.ts',
  legacyRepairPlanTypes: 'src/types/repair-plan.ts',
  repairPlanTests: 'tests/unit/repair-plan.test.ts',
  hardenReport: 'src/domain/reports/harden-report.ts',
  acceptanceRun: 'docs/acceptance/acceptance-run.md',
  spikeResults: 'docs/logs/spike-results.md',
  readme: 'README.md',
  userAcceptanceGuide: 'docs/acceptance/guides/user-acceptance-guide.md',
  sampleHardeningReport: 'docs/testing/samples/sample-hardening-report.md',
  testStrategy: 'docs/testing/strategy/test-strategy-v0.1.md',
  acceptanceChecklist: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
  userAcceptanceHandoff: 'docs/acceptance/user-acceptance-handoff.md',
  userAcceptanceHandoffBuilder: 'packages/acceptance/src/user-acceptance-handoff.ts',
  userAcceptanceHandoffRunner: 'packages/acceptance/src/run-user-acceptance-handoff.ts',
  userAcceptanceHandoffTests: 'tests/unit/user-acceptance-handoff.test.ts',
  repoPreflight: 'packages/acceptance/src/repo-preflight.ts',
  userAcceptanceArgs: 'packages/acceptance/src/user-acceptance-args.ts',
  userAcceptanceBuilder: 'packages/acceptance/src/user-acceptance.ts',
  userAcceptanceRunner: 'packages/acceptance/src/run-user-acceptance.ts',
  userAcceptanceTests: 'tests/unit/user-acceptance.test.ts',
  devLog: 'docs/logs/dev-log.md',
  blockersLog: 'docs/logs/blockers.md',
  decisionLog: 'docs/logs/decision-log.md',
  goalAuditSource: 'packages/acceptance/src/run-goal-audit.ts',
  goalAuditTests: 'tests/unit/goal-audit.test.ts',
  userAcceptanceRecord: 'docs/acceptance/user-acceptance-record.md',
  legacySharedPrivacyRedaction: 'src/shared/privacy-redaction.ts',
  legacySharedShellQuote: 'src/shared/shell-quote.ts',
  legacySharedShellWords: 'src/shared/shell-words.ts',
  ...buildPackageAcceptanceDistTextSourcePaths(),
  ...buildLegacyAcceptanceTextSourcePaths()
} as const;

export const PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS = acceptancePackageDistOutputEntries.map((entry) => {
  const moduleName = packageAcceptanceDistModuleName(entry);
  const key = packageAcceptanceDistSourceKey(moduleName);

  return { key, path: GOAL_AUDIT_TEXT_SOURCE_PATHS[key] };
});

export const PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS = acceptancePackageDistOutputEntries.map((entry) => {
  const moduleName = packageAcceptanceDistModuleName(entry);
  const key = packageAcceptanceDistDeclarationSourceKey(moduleName);

  return { key, path: GOAL_AUDIT_TEXT_SOURCE_PATHS[key] };
});

export const PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS = acceptancePackageDistOutputEntries.map((entry) => {
  const moduleName = packageAcceptanceDistModuleName(entry);
  const key = packageAcceptanceDistSourceMapSourceKey(moduleName);

  return { key, path: GOAL_AUDIT_TEXT_SOURCE_PATHS[key] };
});

export const LEGACY_ACCEPTANCE_WRAPPER_SOURCE_SPECS = legacyAcceptanceCompatibilityModules.map((moduleName) => {
  const key = legacyAcceptanceSourceKey(moduleName);

  return { key, path: GOAL_AUDIT_TEXT_SOURCE_PATHS[key] };
});

export const LEGACY_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS = legacyAcceptanceDistOutputEntries.map(({ moduleName }) => {
  const key = legacyDistAcceptanceSourceKey(moduleName);

  return { key, path: GOAL_AUDIT_TEXT_SOURCE_PATHS[key] };
});

export const LEGACY_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS = legacyAcceptanceDistOutputEntries.map(({ moduleName }) => {
  const key = legacyDistAcceptanceDeclarationSourceKey(moduleName);

  return { key, path: GOAL_AUDIT_TEXT_SOURCE_PATHS[key] };
});

export const LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS = legacyAcceptanceDistOutputEntries.map(({ moduleName }) => {
  const key = legacyDistAcceptanceSourceMapSourceKey(moduleName);

  return { key, path: GOAL_AUDIT_TEXT_SOURCE_PATHS[key] };
});

export const GOAL_AUDIT_GROUPED_TEXT_SOURCE_PATHS = {
  cliSmokeTests: [
    'tests/unit/cli-options.test.ts',
    'tests/integration/cli-analyze.test.ts',
    'tests/integration/cli-generated-artifacts.test.ts',
    'tests/integration/cli-run.test.ts'
  ],
  mcpProtocolTests: [
    'tests/integration/mcp-server.test.ts',
    'tests/unit/mcp-tool-registry.test.ts',
    'tests/unit/boot-session-store.test.ts',
    'tests/unit/mcp-fatal-error.test.ts'
  ],
  securityTests: [
    'tests/unit/privacy-redaction.test.ts',
    'tests/unit/analyze-repo.test.ts',
    'tests/unit/cli-options.test.ts',
    'tests/unit/mcp-tool-registry.test.ts',
    'tests/unit/harden-report.test.ts',
    'tests/unit/user-acceptance.test.ts',
    'tests/unit/user-acceptance-handoff.test.ts',
    'tests/unit/playwright-driver.test.ts'
  ],
  artifactTests: [
    'tests/integration/run-hardening-tool.test.ts',
    'tests/integration/cli-generated-artifacts.test.ts',
    'tests/integration/generate-tests-tool.test.ts',
    'tests/integration/harden-report-tool.test.ts',
    'tests/e2e/run-browser.e2e.test.ts'
  ],
  observabilityTests: [
    'tests/integration/analyze-tool.test.ts',
    'tests/integration/cli-analyze.test.ts',
    'tests/integration/boot-tool.test.ts',
    'tests/integration/explore-tool.test.ts',
    'tests/integration/run-hardening-tool.test.ts',
    'tests/integration/cli-run.test.ts',
    'tests/e2e/run-browser.e2e.test.ts',
    'tests/unit/harden-report.test.ts'
  ]
} as const;

export type GoalAuditTextSourceKey = keyof typeof GOAL_AUDIT_TEXT_SOURCE_PATHS;
export type GoalAuditGroupedTextSourceKey = keyof typeof GOAL_AUDIT_GROUPED_TEXT_SOURCE_PATHS;
export type GoalAuditSourceKey = GoalAuditTextSourceKey | GoalAuditGroupedTextSourceKey;
export type GoalAuditTextSources = Record<GoalAuditSourceKey, string>;

export interface ReadGoalAuditTextSourcesInput {
  root: string;
  readText: (path: string) => Promise<string>;
}

function buildPackageAcceptanceDistTextSourcePaths(): PackageAcceptanceDistTextSourcePaths {
  const distEntries = acceptancePackageDistOutputEntries.flatMap((entry) => {
    const moduleName = packageAcceptanceDistModuleName(entry);

    return [
      [packageAcceptanceDistSourceKey(moduleName), entry.jsPath],
      [packageAcceptanceDistDeclarationSourceKey(moduleName), entry.declarationPath],
      [packageAcceptanceDistSourceMapSourceKey(moduleName), entry.sourceMapPath]
    ] as const;
  });

  return Object.fromEntries(distEntries) as PackageAcceptanceDistTextSourcePaths;
}

function buildLegacyAcceptanceTextSourcePaths(): LegacyAcceptanceTextSourcePaths {
  const wrapperEntries = legacyAcceptanceWrapperSourceEntries.map(({ moduleName, path }) => [
    legacyAcceptanceSourceKey(moduleName),
    path
  ] as const);
  const distEntries = legacyAcceptanceDistOutputEntries.flatMap((entry) => [
    [legacyDistAcceptanceSourceKey(entry.moduleName), entry.jsPath],
    [legacyDistAcceptanceDeclarationSourceKey(entry.moduleName), entry.declarationPath],
    [legacyDistAcceptanceSourceMapSourceKey(entry.moduleName), entry.sourceMapPath]
  ] as const);

  return Object.fromEntries([...wrapperEntries, ...distEntries]) as LegacyAcceptanceTextSourcePaths;
}

function packageAcceptanceDistModuleName(entry: AcceptancePackageDistOutputEntry): PackageAcceptanceDistModule {
  return (entry.exportPath === '.' ? 'index' : entry.exportPath.slice(2)) as PackageAcceptanceDistModule;
}

function packageAcceptanceDistSourceKey<T extends PackageAcceptanceDistModule>(
  moduleName: T
): PackageAcceptanceDistSourceKey<T> {
  return `packageAcceptanceDist${toPascalCase(moduleName)}` as PackageAcceptanceDistSourceKey<T>;
}

function packageAcceptanceDistDeclarationSourceKey<T extends PackageAcceptanceDistModule>(
  moduleName: T
): PackageAcceptanceDistDeclarationSourceKey<T> {
  return `packageAcceptanceDist${toPascalCase(moduleName)}Declaration` as PackageAcceptanceDistDeclarationSourceKey<T>;
}

function packageAcceptanceDistSourceMapSourceKey<T extends PackageAcceptanceDistModule>(
  moduleName: T
): PackageAcceptanceDistSourceMapSourceKey<T> {
  return `packageAcceptanceDist${toPascalCase(moduleName)}SourceMap` as PackageAcceptanceDistSourceMapSourceKey<T>;
}

function legacyAcceptanceSourceKey<T extends LegacyAcceptanceCompatibilityModule>(moduleName: T): LegacyAcceptanceSourceKey<T> {
  return `legacyAcceptance${toPascalCase(moduleName)}` as LegacyAcceptanceSourceKey<T>;
}

function legacyDistAcceptanceSourceKey<T extends LegacyAcceptanceCompatibilityModule>(
  moduleName: T
): LegacyDistAcceptanceSourceKey<T> {
  return `legacyDistAcceptance${toPascalCase(moduleName)}` as LegacyDistAcceptanceSourceKey<T>;
}

function legacyDistAcceptanceDeclarationSourceKey<T extends LegacyAcceptanceCompatibilityModule>(
  moduleName: T
): LegacyDistAcceptanceDeclarationSourceKey<T> {
  return `legacyDistAcceptance${toPascalCase(moduleName)}Declaration` as LegacyDistAcceptanceDeclarationSourceKey<T>;
}

function legacyDistAcceptanceSourceMapSourceKey<T extends LegacyAcceptanceCompatibilityModule>(
  moduleName: T
): LegacyDistAcceptanceSourceMapSourceKey<T> {
  return `legacyDistAcceptance${toPascalCase(moduleName)}SourceMap` as LegacyDistAcceptanceSourceMapSourceKey<T>;
}

function toPascalCase<T extends string>(value: T): KebabToPascal<T> {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('') as KebabToPascal<T>;
}

export async function readGoalAuditTextSources(input: ReadGoalAuditTextSourcesInput): Promise<GoalAuditTextSources> {
  const entries = await Promise.all([
    ...Object.entries(GOAL_AUDIT_TEXT_SOURCE_PATHS).map(async ([key, path]) => [
      key,
      await input.readText(join(input.root, path))
    ] as const),
    ...Object.entries(GOAL_AUDIT_GROUPED_TEXT_SOURCE_PATHS).map(async ([key, paths]) => [
      key,
      (await Promise.all(paths.map(async (path) => input.readText(join(input.root, path))))).join('\n')
    ] as const)
  ]);

  return Object.fromEntries(entries) as GoalAuditTextSources;
}
