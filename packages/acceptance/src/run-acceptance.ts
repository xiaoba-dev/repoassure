import { spawn } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  acceptanceCompatibilityContract,
  acceptancePackageDistOutputEntries,
  acceptancePackageExportEntries,
  acceptancePackageSourceEntries,
  acceptancePackageSubpathSpecifiers,
  acceptanceRuntimeContractSpecifiers,
  acceptanceRunnerMainSpecifiers,
  legacyAcceptanceDistOutputEntries,
  legacyAcceptanceWrapperSourceEntries
} from './compatibility.js';
import { formatAcceptanceFatalError } from './fatal-error.js';
import {
  LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS,
  PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS
} from './goal-audit-sources.js';
import { buildAcceptanceMarkdown, summarizeAcceptanceChecks, type AcceptanceCheck } from './report.js';
import { shellQuoteArg } from './shell-quote.js';

export interface AcceptanceCliOptions {
  mode: 'standard' | 'full';
  browser: boolean;
  outputPath: string;
}

export interface AcceptanceCommand {
  name: string;
  category: string;
  required: boolean;
  command: string;
  args: string[];
  timeoutMs: number;
  env?: Record<string, string>;
}

interface CommandResult {
  exitCode: number;
  durationMs: number;
  error?: string;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const packageSubpathImportSmokeScript = [
  `const specifiers = ${JSON.stringify(acceptancePackageSubpathSpecifiers, null, 2)};`,
  `const expectedExportEntries = ${JSON.stringify(acceptancePackageExportEntries, null, 2)};`,
  `const expectedPackageDistOutputEntries = ${JSON.stringify(acceptancePackageDistOutputEntries, null, 2)};`,
  `const expectedPackageDistOutputSourceSpecs = ${JSON.stringify(PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS, null, 2)};`,
  `const expectedPackageDistDeclarationSourceSpecs = ${JSON.stringify(PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS, null, 2)};`,
  `const expectedPackageDistSourceMapSourceSpecs = ${JSON.stringify(PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS, null, 2)};`,
  `const expectedLegacyDistSourceMapSourceSpecs = ${JSON.stringify(LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS, null, 2)};`,
  `const expectedPackageSourceEntries = ${JSON.stringify(acceptancePackageSourceEntries, null, 2)};`,
  `const expectedLegacyDistOutputEntries = ${JSON.stringify(legacyAcceptanceDistOutputEntries, null, 2)};`,
  `const expectedLegacyWrapperSourceEntries = ${JSON.stringify(legacyAcceptanceWrapperSourceEntries, null, 2)};`,
  'const expectedSpecifiers = expectedExportEntries.map((entry) => entry.specifier);',
  'if (JSON.stringify(specifiers) !== JSON.stringify(expectedSpecifiers)) {',
  "  throw new Error('Package subpath import smoke specifier list drift');",
  '}',
  'const modules = new Map();',
  'for (const specifier of specifiers) {',
  '  const mod = await import(specifier);',
  '  modules.set(specifier, mod);',
  '  if (Object.keys(mod).length === 0) {',
  '    throw new Error(`${specifier} exports missing`);',
  '  }',
  '}',
  `const runnerMainSpecifiers = ${JSON.stringify(acceptanceRunnerMainSpecifiers, null, 2)};`,
  `const runtimeContractSpecifiers = ${JSON.stringify(acceptanceRuntimeContractSpecifiers, null, 2)};`,
  'for (const specifier of runnerMainSpecifiers) {',
  '  const mod = modules.get(specifier);',
  "  if (typeof mod.main !== 'function') {",
  '    throw new Error(`${specifier} main missing`);',
  '  }',
  '}',
  'for (const specifier of runtimeContractSpecifiers) {',
  '  const mod = modules.get(specifier);',
  '  if (JSON.stringify(mod.acceptancePackageExportEntries) !== JSON.stringify(expectedExportEntries)) {',
  '    throw new Error(`${specifier} acceptancePackageExportEntries drift`);',
  '  }',
  '  if (JSON.stringify(mod.acceptancePackageDistOutputEntries) !== JSON.stringify(expectedPackageDistOutputEntries)) {',
  '    throw new Error(`${specifier} acceptancePackageDistOutputEntries drift`);',
  '  }',
  '  if (JSON.stringify(mod.acceptancePackageSourceEntries) !== JSON.stringify(expectedPackageSourceEntries)) {',
  '    throw new Error(`${specifier} acceptancePackageSourceEntries drift`);',
  '  }',
  '  if (JSON.stringify(mod.legacyAcceptanceDistOutputEntries) !== JSON.stringify(expectedLegacyDistOutputEntries)) {',
  '    throw new Error(`${specifier} legacyAcceptanceDistOutputEntries drift`);',
  '  }',
  '  if (JSON.stringify(mod.legacyAcceptanceWrapperSourceEntries) !== JSON.stringify(expectedLegacyWrapperSourceEntries)) {',
  '    throw new Error(`${specifier} legacyAcceptanceWrapperSourceEntries drift`);',
  '  }',
  '}',
  `const goalAuditSourceContractSpecifiers = [
  '${acceptanceCompatibilityContract.packageName}',
  '${acceptanceCompatibilityContract.packageName}/goal-audit-sources'
];`,
  'for (const specifier of goalAuditSourceContractSpecifiers) {',
  '  const mod = modules.get(specifier);',
  '  if (JSON.stringify(mod.PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS) !== JSON.stringify(expectedPackageDistOutputSourceSpecs)) {',
  '    throw new Error(`${specifier} PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS drift`);',
  '  }',
  '  if (JSON.stringify(mod.PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS) !== JSON.stringify(expectedPackageDistDeclarationSourceSpecs)) {',
  '    throw new Error(`${specifier} PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS drift`);',
  '  }',
  '  if (JSON.stringify(mod.PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS) !== JSON.stringify(expectedPackageDistSourceMapSourceSpecs)) {',
  '    throw new Error(`${specifier} PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS drift`);',
  '  }',
  '  if (JSON.stringify(mod.LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS) !== JSON.stringify(expectedLegacyDistSourceMapSourceSpecs)) {',
  '    throw new Error(`${specifier} LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS drift`);',
  '  }',
  '}',
  "console.log(`Package subpath imports ok (${specifiers.length})`);"
].join('\n');

const STANDARD_COMMANDS: AcceptanceCommand[] = [
  {
    name: 'Unit tests',
    category: '质量门禁',
    required: true,
    command: 'pnpm',
    args: ['test:unit'],
    timeoutMs: 120000
  },
  {
    name: 'E2E smoke tests',
    category: '质量门禁',
    required: true,
    command: 'pnpm',
    args: ['test:e2e'],
    timeoutMs: 120000
  },
  {
    name: 'TypeScript typecheck',
    category: '质量门禁',
    required: true,
    command: 'pnpm',
    args: ['typecheck'],
    timeoutMs: 120000
  },
  {
    name: 'ESLint',
    category: '质量门禁',
    required: true,
    command: 'pnpm',
    args: ['lint'],
    timeoutMs: 120000
  },
  {
    name: 'Build',
    category: '质量门禁',
    required: true,
    command: 'pnpm',
    args: ['build'],
    timeoutMs: 120000
  },
  buildPackageSubpathImportSmokeCommand(),
  buildPackageSubpathTypeResolutionSmokeCommand()
];

const FULL_COMMANDS: AcceptanceCommand[] = [
  {
    name: 'Integration tests',
    category: '完整验收',
    required: true,
    command: 'pnpm',
    args: ['test:integration'],
    timeoutMs: 180000
  },
  {
    name: 'Benchmark',
    category: '完整验收',
    required: true,
    command: 'pnpm',
    args: ['benchmark'],
    timeoutMs: 900000
  }
];

const BROWSER_COMMAND: AcceptanceCommand = {
  name: 'Real Chromium trace E2E',
  category: '完整验收',
  required: true,
  command: 'pnpm',
  args: ['vitest', 'run', 'tests/e2e/run-browser.e2e.test.ts'],
  timeoutMs: 180000,
  env: {
    HARDENING_E2E_BROWSER: '1'
  }
};

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isAcceptanceHelpRequest(args)) {
    process.stdout.write(acceptanceHelpText());
    return 0;
  }

  const options = parseArgs(args);
  await mkdir(dirname(options.outputPath), { recursive: true });

  const commandChecks = await runAcceptanceCommands(options);
  const artifactChecks = await runArtifactChecks(options);
  const checks = [...commandChecks, ...artifactChecks];
  const summary = summarizeAcceptanceChecks(checks);
  const markdown = buildAcceptanceMarkdown({
    generatedAt: new Date().toISOString(),
    mode: options.mode,
    outputPath: options.outputPath,
    summary,
    checks
  });

  await writeFile(options.outputPath, markdown);
  process.stdout.write(`${markdown}\n`);

  return summary.status === 'passed' ? 0 : 1;
}

export function isAcceptanceHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function acceptanceHelpText(): string {
  return `hardening acceptance

Usage:
  pnpm acceptance -- [--full] [--browser] [--output <path>]
  pnpm acceptance -- -h

Options:
  --full           Run integration tests and benchmark in addition to standard gates.
  --browser        Run the real Chromium trace E2E check. Requires browser permissions.
  --output <path>  Write the acceptance report to a custom path. Default: docs/acceptance/acceptance-run.md.
  --help, -h       Show this help.

`;
}

export function parseArgs(args: string[]): AcceptanceCliOptions {
  let mode: AcceptanceCliOptions['mode'] = 'standard';
  let browser = false;
  let outputPath = join(root, 'docs', 'acceptance', 'acceptance-run.md');

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--full') {
      mode = 'full';
      continue;
    }

    if (arg === '--browser') {
      browser = true;
      continue;
    }

    if (arg === '--output') {
      const value = args[index + 1]?.trim();
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --output');
      }
      outputPath = resolve(root, value);
      index += 1;
      continue;
    }

    if (arg?.startsWith('--output=')) {
      const value = arg.slice('--output='.length).trim();
      if (!value) {
        throw new Error('Missing value for --output');
      }
      outputPath = resolve(root, value);
      continue;
    }

    throw new Error(`Unknown acceptance option: ${arg ?? ''}`);
  }

  return {
    mode,
    browser,
    outputPath
  };
}

export function buildPackageSubpathImportSmokeCommand(): AcceptanceCommand {
  return {
    name: 'Package subpath import smoke',
    category: '质量门禁',
    required: true,
    command: 'node',
    args: ['--input-type=module', '-e', packageSubpathImportSmokeScript],
    timeoutMs: 30000
  };
}

export function buildPackageSubpathTypeResolutionSmokeCommand(): AcceptanceCommand {
  return {
    name: 'Package subpath type-resolution smoke',
    category: '质量门禁',
    required: true,
    command: 'node',
    args: [
      'node_modules/typescript/bin/tsc',
      '--ignoreConfig',
      '--noEmit',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--strict',
      '--skipLibCheck',
      '--types',
      'node',
      'tests/type-smoke/acceptance-package-subpaths.ts'
    ],
    timeoutMs: 30000
  };
}

async function runAcceptanceCommands(options: AcceptanceCliOptions): Promise<AcceptanceCheck[]> {
  const commands = [...STANDARD_COMMANDS];

  if (options.mode === 'full') {
    commands.push(...FULL_COMMANDS);
  }

  if (options.browser) {
    commands.push(BROWSER_COMMAND);
  }

  const checks: AcceptanceCheck[] = [];

  for (const command of commands) {
    const result = await runCommand(command);
    checks.push({
      name: command.name,
      category: command.category,
      required: command.required,
      status: result.exitCode === 0 ? 'passed' : 'failed',
      durationMs: result.durationMs,
      command: formatAcceptanceCommand(command),
      detail: result.exitCode === 0 ? 'exitCode=0' : result.error ?? `exitCode=${result.exitCode}`
    });
  }

  return checks;
}

async function runArtifactChecks(options: AcceptanceCliOptions): Promise<AcceptanceCheck[]> {
  const docs = [
    ['README', join(root, 'README.md')],
    ['用户验收指南', join(root, 'docs', 'acceptance', 'guides', 'user-acceptance-guide.md')],
    ['测试策略', join(root, 'docs', 'testing', 'strategy', 'test-strategy-v0.1.md')],
    ['开发日志', join(root, 'docs', 'logs', 'dev-log.md')],
    ['阻塞日志', join(root, 'docs', 'logs', 'blockers.md')]
  ] as const;
  const checks: AcceptanceCheck[] = [];

  for (const [name, path] of docs) {
    const exists = await fileExists(path);
    checks.push({
      name: `${name} 文档存在`,
      category: '产物检查',
      required: true,
      status: exists ? 'passed' : 'failed',
      detail: path
    });
  }

  const spikeResultsPath = join(root, 'docs', 'logs', 'spike-results.md');
  const spikeResults = await readOptionalText(spikeResultsPath);
  const benchmarkPassed = spikeResults.includes('| Go/No-go | Go |');
  checks.push({
    name: 'Benchmark 结果为 Go',
    category: '产物检查',
    required: options.mode === 'full',
    status: benchmarkPassed ? 'passed' : options.mode === 'full' ? 'failed' : 'skipped',
    detail: spikeResultsPath
  });

  const packageJson = await readOptionalText(join(root, 'package.json'));
  checks.push({
    name: 'package scripts 暴露 acceptance',
    category: '产物检查',
    required: true,
    status: packageJson.includes('"acceptance"') ? 'passed' : 'failed',
    detail: 'pnpm acceptance'
  });

  return checks;
}

function runCommand(command: AcceptanceCommand): Promise<CommandResult> {
  return new Promise((resolveCommand) => {
    const startedAt = Date.now();
    const child = spawn(command.command, command.args, {
      cwd: root,
      env: {
        ...process.env,
        ...command.env
      },
      stdio: 'inherit'
    });
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      child.kill('SIGTERM');
      resolveCommand({
        exitCode: 124,
        durationMs: Date.now() - startedAt,
        error: `Timed out after ${command.timeoutMs}ms`
      });
    }, command.timeoutMs);

    child.on('error', (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolveCommand({
        exitCode: 1,
        durationMs: Date.now() - startedAt,
        error: error.message
      });
    });

    child.on('exit', (code) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolveCommand({
        exitCode: code ?? 1,
        durationMs: Date.now() - startedAt
      });
    });
  });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readOptionalText(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

export function formatAcceptanceCommand(command: AcceptanceCommand): string {
  const envPrefix = command.env
    ? `${Object.entries(command.env)
      .map(([key, value]) => `${key}=${shellQuoteArg(value)}`)
      .join(' ')} `
    : '';

  return `${envPrefix}${[shellQuoteArg(command.command), ...command.args.map((arg) => shellQuoteArg(arg))].join(' ')}`;
}

if (isDirectRun(import.meta.url, process.argv[1])) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('Acceptance runner failed', error)}\n`);
    process.exitCode = 1;
  });
}

export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean {
  return argvPath !== undefined && fileURLToPath(moduleUrl) === resolve(argvPath);
}
