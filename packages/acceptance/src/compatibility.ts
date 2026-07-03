export const acceptanceEntrypointFiles = {
  acceptance: 'run-acceptance.js',
  goalAudit: 'run-goal-audit.js',
  userAcceptance: 'run-user-acceptance.js',
  userHandoff: 'run-user-acceptance-handoff.js',
  repairHandoff: 'run-repair-handoff.js',
  repairExecute: 'run-repair-execute.js',
  repairPatchPlan: 'run-repair-patch-plan.js'
} as const;

export type AcceptanceEntrypointKind = keyof typeof acceptanceEntrypointFiles;

export const acceptanceCompatibilityContract = {
  packageName: '@hardening-mcp/acceptance',
  legacyDistRoot: 'dist/internal/acceptance',
  packageOwnedModules: ['compatibility', 'markdown', 'report', 'goal-audit', 'goal-audit-requirements', 'goal-audit-user-acceptance', 'goal-audit-user-acceptance-materials', 'goal-audit-sources', 'goal-audit-delivery', 'goal-audit-runtime', 'goal-audit-workflow-artifacts', 'goal-audit-observability-security', 'goal-audit-process-governance', 'goal-audit-evidence-documents', 'goal-audit-current-items', 'goal-audit-v03-distribution', 'goal-audit-public-release-readiness', 'user-acceptance', 'user-acceptance-handoff', 'fatal-error', 'redaction', 'repo-preflight', 'python-cli-profile', 'python-cli-checks', 'python-cli-artifacts', 'target-repo-feedback-summary', 'ai-ide-handoff-package', 'user-validation-evidence-loop', 'campaign-summary', 'user-acceptance-args', 'run-acceptance', 'run-user-acceptance-handoff', 'run-repair-handoff', 'run-repair-execute', 'run-repair-patch-plan', 'shell-quote', 'shell-words', 'user-acceptance-record', 'user-acceptance-runner-helpers', 'run-user-acceptance', 'run-goal-audit'],
  outputPaths: {
    acceptanceRun: 'docs/acceptance/acceptance-run.md',
    goalCompletionAudit: 'docs/acceptance/goal-completion-audit.md',
    userAcceptanceHandoff: 'docs/acceptance/user-acceptance-handoff.md',
    userAcceptanceRecord: 'docs/acceptance/user-acceptance-record.md'
  }
} as const;

export const legacyAcceptanceCompatibilityModules = [
  'fatal-error',
  'goal-audit',
  'markdown',
  'repo-preflight',
  'report',
  'run-acceptance',
  'run-goal-audit',
  'run-user-acceptance-handoff',
  'run-user-acceptance',
  'user-acceptance-args',
  'user-acceptance-handoff',
  'user-acceptance'
] as const;

export type LegacyAcceptanceCompatibilityModule = typeof legacyAcceptanceCompatibilityModules[number];

export interface LegacyAcceptanceWrapperSourceEntry {
  readonly moduleName: LegacyAcceptanceCompatibilityModule;
  readonly path: string;
}

export const legacyAcceptanceWrapperSourceEntries: readonly LegacyAcceptanceWrapperSourceEntry[] =
  legacyAcceptanceCompatibilityModules.map((moduleName): LegacyAcceptanceWrapperSourceEntry => ({
    moduleName,
    path: `src/internal/acceptance/${moduleName}.ts`
  }));

export interface LegacyAcceptanceDistOutputEntry {
  readonly moduleName: LegacyAcceptanceCompatibilityModule;
  readonly jsPath: string;
  readonly declarationPath: string;
  readonly sourceMapPath: string;
}

export const legacyAcceptanceDistOutputEntries: readonly LegacyAcceptanceDistOutputEntry[] =
  legacyAcceptanceCompatibilityModules.map((moduleName): LegacyAcceptanceDistOutputEntry => ({
    moduleName,
    jsPath: `${acceptanceCompatibilityContract.legacyDistRoot}/${moduleName}.js`,
    declarationPath: `${acceptanceCompatibilityContract.legacyDistRoot}/${moduleName}.d.ts`,
    sourceMapPath: `${acceptanceCompatibilityContract.legacyDistRoot}/${moduleName}.js.map`
  }));

export interface AcceptancePackageExportEntry {
  readonly exportPath: string;
  readonly types: string;
  readonly default: string;
  readonly specifier: string;
}

export interface AcceptancePackageSourceEntry {
  readonly moduleName: typeof acceptanceCompatibilityContract.packageOwnedModules[number];
  readonly path: string;
}

export const acceptancePackageSourceEntries: readonly AcceptancePackageSourceEntry[] =
  acceptanceCompatibilityContract.packageOwnedModules.map((moduleName): AcceptancePackageSourceEntry => ({
    moduleName,
    path: `packages/acceptance/src/${moduleName}.ts`
  }));

export const acceptancePackageExportEntries: readonly AcceptancePackageExportEntry[] = [
  {
    exportPath: '.',
    types: './dist/index.d.ts',
    default: './dist/index.js',
    specifier: acceptanceCompatibilityContract.packageName
  },
  ...acceptanceCompatibilityContract.packageOwnedModules.map((moduleName): AcceptancePackageExportEntry => ({
    exportPath: `./${moduleName}`,
    types: `./dist/${moduleName}.d.ts`,
    default: `./dist/${moduleName}.js`,
    specifier: `${acceptanceCompatibilityContract.packageName}/${moduleName}`
  }))
];

export interface AcceptancePackageDistOutputEntry {
  readonly exportPath: string;
  readonly jsPath: string;
  readonly declarationPath: string;
  readonly sourceMapPath: string;
}

export const acceptancePackageDistOutputEntries: readonly AcceptancePackageDistOutputEntry[] =
  acceptancePackageExportEntries.map((entry): AcceptancePackageDistOutputEntry => ({
    exportPath: entry.exportPath,
    jsPath: `packages/acceptance/${entry.default.replace(/^\.\//u, '')}`,
    declarationPath: `packages/acceptance/${entry.types.replace(/^\.\//u, '')}`,
    sourceMapPath: `packages/acceptance/${entry.default.replace(/^\.\//u, '')}.map`
  }));

export const acceptancePackageSubpathSpecifiers = acceptancePackageExportEntries.map((entry) => entry.specifier);

export const acceptanceRunnerMainSpecifiers = Object.values(acceptanceEntrypointFiles).map((fileName) => {
  const moduleName = fileName.replace(/\.js$/u, '');

  return `${acceptanceCompatibilityContract.packageName}/${moduleName}`;
});

export const acceptanceRuntimeContractSpecifiers = [
  acceptanceCompatibilityContract.packageName,
  `${acceptanceCompatibilityContract.packageName}/compatibility`
] as const;

export interface AcceptanceRunnerModule {
  main: (...args: unknown[]) => Promise<number> | number;
}

export function resolveAcceptanceEntrypointUrl(
  kind: AcceptanceEntrypointKind,
  baseUrl: string = import.meta.url
): URL {
  return new URL(acceptanceEntrypointFiles[kind], baseUrl);
}

export async function runAcceptanceEntrypoint(kind: AcceptanceEntrypointKind, args?: string[]): Promise<number> {
  const module = await import(resolveAcceptanceEntrypointUrl(kind).href) as Partial<AcceptanceRunnerModule>;

  if (typeof module.main !== 'function') {
    throw new Error(`Acceptance compatibility entrypoint does not export main(): ${acceptanceEntrypointFiles[kind]}`);
  }

  if (kind === 'goalAudit') {
    return await module.main();
  }

  return await module.main(args ?? process.argv.slice(2));
}

export async function runAcceptanceEntrypointCli(kind: AcceptanceEntrypointKind): Promise<void> {
  const exitCode = await runAcceptanceEntrypoint(kind);
  process.exitCode = exitCode;
}
