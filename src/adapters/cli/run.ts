import {
  formatSecurityImportError,
  listSecurityProviderDescriptors,
  parseSecurityProvider as parseSecurityProviderId,
  type SecurityProvider
} from '@hardening-mcp/security-assurance/security-provider-contracts';

import { version } from '../../index.js';
import { runAnalyzeRepoTool } from '../../tools/analyze-repo-tool.js';
import { runExploreAppTool } from '../../tools/explore-app-tool.js';
import { runGenerateTestsTool } from '../../tools/generate-tests-tool.js';
import { runGenerateRepairPlanTool } from '../../tools/generate-repair-plan-tool.js';
import { runHardenReportTool } from '../../tools/harden-report-tool.js';
import { runHardeningTool } from '../../tools/run-hardening-tool.js';
import { runSecurityImportTool } from '../../tools/security-import-tool.js';
import { createPlaywrightBrowserDriver } from '../../domain/explore/playwright-driver.js';
import { redactSensitiveText } from '../../shared/privacy-redaction.js';

export interface CliIO {
  writeStdout: (chunk: string) => void;
  writeStderr: (chunk: string) => void;
}

export interface RepoUrlCliOptions {
  root?: string;
  url?: string;
  useBrowser: boolean;
  criticalPaths: string[];
  maxRoutes?: number;
  maxActionsPerRoute?: number;
  startCommand?: string;
  bootTimeoutMs?: number;
  workspaceOutputDir?: string;
  storageStatePath?: string;
  trace?: boolean;
  error?: string;
}

export interface GenerateTestsCliOptions {
  findingsPath?: string;
  outputDir?: string;
  smokeRoutes: string[];
  baseUrl?: string;
  error?: string;
}

export interface GenerateRepairPlanCliOptions {
  root?: string;
  runDir?: string;
  error?: string;
}

export interface SecurityImportCliOptions {
  provider?: SecurityProvider;
  scanDir?: string;
  repoRoot?: string;
  runDir?: string;
  error?: string;
}

export async function runCli(args: string[], io: CliIO): Promise<number> {
  const [command, ...rest] = args;

  if (!command || command === '--help' || command === '-h') {
    io.writeStdout(helpText());
    return 0;
  }

  if (command === '--version' || command === '-v') {
    io.writeStdout(`${version}\n`);
    return 0;
  }

  const commandHelp = commandHelpText(command);
  if (commandHelp && isHelpRequest(rest)) {
    io.writeStdout(commandHelp);
    return 0;
  }

  if (command === 'analyze') {
    return runAnalyze(rest, io);
  }

  if (command === 'explore') {
    return runExplore(rest, io);
  }

  if (command === 'generate-tests') {
    return runGenerateTests(rest, io);
  }

  if (command === 'plan') {
    return runGenerateRepairPlan(rest, io);
  }

  if (command === 'report') {
    return runReport(rest, io);
  }

  if (command === 'security') {
    return runSecurity(rest, io);
  }

  if (command === 'run') {
    return runHardening(rest, io);
  }

  writeCliError(io, `Unknown command: ${command}`);
  return 1;
}

async function runSecurity(args: string[], io: CliIO): Promise<number> {
  if (args[0] === 'providers') {
    if (args.length > 1) {
      writeCliError(io, `Unexpected argument: ${args[1]}`);
      return 1;
    }
    io.writeStdout(formatCliJsonOutput({ providers: listSecurityProviderDescriptors() }));
    return 0;
  }

  if (args[0] !== 'import') {
    writeCliError(io, args[0] ? `Unknown security subcommand: ${args[0]}` : 'Missing required security subcommand: import or providers');
    return 1;
  }

  const options = parseSecurityImportOptions(args.slice(1));
  if (options.error) {
    writeCliError(io, options.error);
    return 1;
  }
  if (!options.provider || !options.scanDir || !options.repoRoot || !options.runDir) {
    const missingOptions = [
      !options.provider ? '--provider' : undefined,
      !options.scanDir ? '--scan-dir' : undefined,
      !options.repoRoot ? '--repo' : undefined,
      !options.runDir ? '--run-dir' : undefined
    ].filter((option): option is string => Boolean(option));
    writeCliError(io, `Missing required options: ${missingOptions.join(', ')}`);
    return 1;
  }

  try {
    const result = await runSecurityImportTool({
      provider: options.provider,
      sourcePath: options.scanDir,
      repoRoot: options.repoRoot,
      runDir: options.runDir
    });
    io.writeStdout(formatCliJsonOutput(result));
    return 0;
  } catch (error) {
    const formatted = formatSecurityImportError(error);
    writeCliError(io, `Security import failed [${formatted.code}]: ${formatted.message} Guidance: ${formatted.guidance}`);
    return 1;
  }
}

async function runGenerateRepairPlan(args: string[], io: CliIO): Promise<number> {
  const options = parseGenerateRepairPlanOptions(args);

  if (options.error) {
    writeCliError(io, options.error);
    return 1;
  }

  if (!options.root) {
    writeCliError(io, 'Missing required argument: <repo>');
    return 1;
  }

  try {
    const result = await runGenerateRepairPlanTool({
      root: options.root,
      ...(options.runDir ? { runDir: options.runDir } : {})
    });
    io.writeStdout(formatCliJsonOutput(result));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    writeCliError(io, `Failed to generate repair plan: ${message}`);
    return 1;
  }
}

async function runHardening(args: string[], io: CliIO): Promise<number> {
  const options = parseRepoUrlOptions(args);

  if (options.error) {
    writeCliError(io, options.error);
    return 1;
  }

  if (!options.root) {
    writeCliError(io, 'Missing required argument: <repo>');
    return 1;
  }

  try {
    const browserDriver = options.useBrowser
        ? await createPlaywrightBrowserDriver({
          ...(options.storageStatePath ? { storageStatePath: options.storageStatePath } : {}),
          ...(options.trace ? { trace: true } : {})
        })
      : undefined;
    const result = await runHardeningTool({
      root: options.root,
      ...(options.url ? { url: options.url } : {}),
      ...(options.criticalPaths.length > 0 ? { criticalPaths: options.criticalPaths } : {}),
      ...(options.maxRoutes ? { maxRoutes: options.maxRoutes } : {}),
      ...(options.maxActionsPerRoute !== undefined ? { maxActionsPerRoute: options.maxActionsPerRoute } : {}),
      ...(options.startCommand ? { startCommand: options.startCommand } : {}),
      ...(options.bootTimeoutMs ? { bootTimeoutMs: options.bootTimeoutMs } : {}),
      ...(options.workspaceOutputDir ? { workspaceOutputDir: options.workspaceOutputDir } : {}),
      ...(browserDriver ? { browserDriver } : {})
    });
    io.writeStdout(formatCliJsonOutput(result));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    writeCliError(io, `Failed to run hardening flow: ${message}`);
    return 1;
  }
}

async function runExplore(args: string[], io: CliIO): Promise<number> {
  const options = parseRepoUrlOptions(args);

  if (options.error) {
    writeCliError(io, options.error);
    return 1;
  }

  if (!options.root || !options.url) {
    writeCliError(io, 'Missing required arguments: <repo> <url>');
    return 1;
  }

  try {
    const browserDriver = options.useBrowser
        ? await createPlaywrightBrowserDriver({
          ...(options.storageStatePath ? { storageStatePath: options.storageStatePath } : {}),
          ...(options.trace ? { trace: true } : {})
        })
      : undefined;
    const result = await runExploreAppTool({
      root: options.root,
      url: options.url,
      criticalPaths: options.criticalPaths,
      maxRoutes: options.maxRoutes ?? 20,
      maxActionsPerRoute: options.maxActionsPerRoute ?? 20,
      ...(browserDriver ? { browserDriver } : {})
    });
    io.writeStdout(formatCliJsonOutput(result));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    writeCliError(io, `Failed to explore app: ${message}`);
    return 1;
  }
}

async function runGenerateTests(args: string[], io: CliIO): Promise<number> {
  const options = parseGenerateTestsOptions(args);

  if (options.error) {
    writeCliError(io, options.error);
    return 1;
  }

  if (!options.findingsPath || !options.outputDir) {
    writeCliError(io, 'Missing required arguments: <findingsPath> <outputDir>');
    return 1;
  }

  try {
    const result = await runGenerateTestsTool({
      findingsPath: options.findingsPath,
      outputDir: options.outputDir,
      ...(options.smokeRoutes.length > 0 ? { smokeRoutes: options.smokeRoutes } : {}),
      ...(options.baseUrl ? { baseUrl: options.baseUrl } : {})
    });
    io.writeStdout(formatCliJsonOutput(result));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    writeCliError(io, `Failed to generate tests: ${message}`);
    return 1;
  }
}

async function runReport(args: string[], io: CliIO): Promise<number> {
  const [runDir, outputPath] = args;
  const argumentError = unexpectedPositionalArgument(args, 2);

  if (!runDir || !outputPath) {
    writeCliError(io, 'Missing required arguments: <runDir> <outputPath>');
    return 1;
  }

  if (argumentError) {
    writeCliError(io, argumentError);
    return 1;
  }

  try {
    const result = await runHardenReportTool({ runDir, outputPath });
    io.writeStdout(formatCliJsonOutput(result));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    writeCliError(io, `Failed to write report: ${message}`);
    return 1;
  }
}

async function runAnalyze(args: string[], io: CliIO): Promise<number> {
  const [root] = args;
  const argumentError = unexpectedPositionalArgument(args, 1);

  if (!root) {
    writeCliError(io, 'Missing required argument: <repo>');
    return 1;
  }

  if (argumentError) {
    writeCliError(io, argumentError);
    return 1;
  }

  try {
    const result = await runAnalyzeRepoTool({ root });
    io.writeStdout(formatCliJsonOutput(result));
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    writeCliError(io, `Failed to analyze repo: ${message}`);
    return 1;
  }
}

function writeCliError(io: CliIO, message: string): void {
  io.writeStderr(`${redactSensitiveText(message)}\n`);
}

export function formatCliJsonOutput(value: unknown): string {
  return `${redactSensitiveText(JSON.stringify(value, null, 2))}\n`;
}

function helpText(): string {
  return `hardening ${version}

Usage:
  hardening analyze <repo>
  hardening explore <repo> <url> [--browser] [--critical-path <path-or-intent>] [--max-routes <n>] [--max-actions-per-route <n>] [--storage-state <path>] [--trace]
  hardening generate-tests <findingsPath> <outputDir> [--smoke-route <path-or-url>] [--base-url <url>]
  hardening plan <repo> [--run-dir <dir>]
  hardening report <runDir> <outputPath>
  hardening security import --provider <provider> --scan-dir <dir> --repo <repo> --run-dir <dir>
  hardening run <repo> [url] [--browser] [--critical-path <path-or-intent>] [--max-routes <n>] [--max-actions-per-route <n>] [--storage-state <path>] [--trace] [--start-command <command>] [--boot-timeout-ms <ms>] [--workspace-output <dir>]

Options:
  --help, -h     Show this help.
  --version, -v  Show the CLI version.

`;
}

function commandHelpText(command: string): string | undefined {
  if (command === 'analyze') {
    return `hardening analyze

Usage:
  hardening analyze <repo>

Arguments:
  <repo>  Path to the target repository.

Options:
  --help, -h  Show this help.

`;
  }

  if (command === 'explore') {
    return `hardening explore

Usage:
  hardening explore <repo> <url> [--browser] [--critical-path <path-or-intent>] [--max-routes <n>] [--max-actions-per-route <n>] [--storage-state <path>] [--trace]

Arguments:
  <repo>  Path to the target repository.
  <url>   Running app URL to explore.

Options:
  --browser                    Use a real Playwright browser driver.
  --critical-path <value>      Prioritize a path or natural-language user flow. Can be repeated.
  --max-routes <n>             Limit discovered routes.
  --max-actions-per-route <n>  Limit interactions per route. Use 0 to disable interactions.
  --storage-state <path>       Reuse a Playwright storage state file.
  --trace                      Capture trace artifacts when browser mode is enabled.
  --help, -h                   Show this help.

`;
  }

  if (command === 'generate-tests') {
    return `hardening generate-tests

Usage:
  hardening generate-tests <findingsPath> <outputDir> [--smoke-route <path-or-url>] [--base-url <url>]

Arguments:
  <findingsPath>  Path to a hardening findings JSON file.
  <outputDir>     Directory where generated Playwright specs will be written.

Options:
  --smoke-route <value>  Add a known route or URL to generated smoke coverage. Can be repeated.
  --base-url <url>       Set the generated spec default base URL.
  --help, -h             Show this help.

`;
  }

  if (command === 'report') {
    return `hardening report

Usage:
  hardening report <runDir> <outputPath>

Arguments:
  <runDir>      Hardening run artifact directory.
  <outputPath>  Markdown report output path.

Options:
  --help, -h  Show this help.

`;
  }

  if (command === 'plan') {
    return `hardening plan

Usage:
  hardening plan <repo> [--run-dir <dir>]

Arguments:
  <repo>  Path to the target repository.

Options:
  --run-dir <dir>  Optional hardening run directory. Default: <repo>/.hardening/latest.
  --help, -h       Show this help.

`;
  }

  if (command === 'run') {
    return `hardening run

Usage:
  hardening run <repo> [url] [--browser] [--critical-path <path-or-intent>] [--max-routes <n>] [--max-actions-per-route <n>] [--storage-state <path>] [--trace] [--start-command <command>] [--boot-timeout-ms <ms>] [--workspace-output <dir>]

Arguments:
  <repo>  Path to the target repository.
  [url]   Optional running app URL. If omitted, the tool attempts to boot the app.

Options:
  --browser                    Use a real Playwright browser driver.
  --critical-path <value>      Prioritize a path or natural-language user flow. Can be repeated.
  --max-routes <n>             Limit discovered routes.
  --max-actions-per-route <n>  Limit interactions per route. Use 0 to disable interactions.
  --storage-state <path>       Reuse a Playwright storage state file.
  --trace                      Capture trace artifacts when browser mode is enabled.
  --start-command <command>    Override the detected app start command.
  --boot-timeout-ms <ms>       Override app boot timeout.
  --workspace-output <dir>     Also copy this repo run bundle into a shared multi-repo workspace output directory.
  --help, -h                   Show this help.

`;
  }

  if (command === 'security') {
    return `hardening security

Usage:
  hardening security providers
  hardening security import --provider <provider> --scan-dir <dir> --repo <repo> --run-dir <dir>

Options:
  --provider <provider>  Provider id returned by hardening security providers.
  --scan-dir <dir>       Local directory containing normalized scan.json.
  --repo <repo>          Path to the target repository.
  --run-dir <dir>        New or artifact-empty directory below <repo>/.hardening/; symbolic links are rejected.
  --help, -h             Show this help.

Input contract:
  Schema: repoassure.normalized-security-scan.v1
  Output artifacts are create-only and never overwrite prior evidence.
  Native provider formats are not accepted. Normalize evidence into scan.json before import.

`;
  }

  return undefined;
}

export function parseSecurityImportOptions(args: string[]): SecurityImportCliOptions {
  let provider: SecurityImportCliOptions['provider'];
  let scanDir: string | undefined;
  let repoRoot: string | undefined;
  let runDir: string | undefined;
  let error: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg) {
      continue;
    }

    if (arg === '--provider' || arg.startsWith('--provider=')) {
      const value = readOptionValue(args, index, '--provider');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        try {
          provider = parseSecurityProviderId(value.value);
        } catch (providerError) {
          const formatted = formatSecurityImportError(providerError);
          error = `[${formatted.code}] ${formatted.message} Run hardening security providers and provide a normalized scan.json.`;
        }
      }
      continue;
    }

    if (arg === '--scan-dir' || arg.startsWith('--scan-dir=')) {
      const value = readOptionValue(args, index, '--scan-dir');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        scanDir = value.value;
      }
      continue;
    }

    if (arg === '--repo' || arg.startsWith('--repo=')) {
      const value = readOptionValue(args, index, '--repo');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        repoRoot = value.value;
      }
      continue;
    }

    if (arg === '--run-dir' || arg.startsWith('--run-dir=')) {
      const value = readOptionValue(args, index, '--run-dir');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        runDir = value.value;
      }
      continue;
    }

    error = arg.startsWith('--') ? `Unknown option: ${arg}` : `Unexpected argument: ${arg}`;
  }

  return {
    ...(provider ? { provider } : {}),
    ...(scanDir ? { scanDir } : {}),
    ...(repoRoot ? { repoRoot } : {}),
    ...(runDir ? { runDir } : {}),
    ...(error ? { error } : {})
  };
}

export function parseGenerateRepairPlanOptions(args: string[]): GenerateRepairPlanCliOptions {
  const positional: string[] = [];
  let runDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--run-dir') {
      const value = args[index + 1]?.trim();
      if (!value || value.startsWith('--')) {
        return buildGenerateRepairPlanOptions(positional[0], runDir, 'Missing value for --run-dir');
      }
      runDir = value;
      index += 1;
      continue;
    }

    if (arg?.startsWith('--run-dir=')) {
      const value = arg.slice('--run-dir='.length).trim();
      if (!value) {
        return buildGenerateRepairPlanOptions(positional[0], runDir, 'Missing value for --run-dir');
      }
      runDir = value;
      continue;
    }

    if (arg?.startsWith('--')) {
      return buildGenerateRepairPlanOptions(positional[0], runDir, `Unknown option: ${arg}`);
    }

    positional.push(arg ?? '');
  }

  const argumentError = unexpectedPositionalArgument(positional, 1);
  if (argumentError) {
    return buildGenerateRepairPlanOptions(positional[0], runDir, argumentError);
  }

  return buildGenerateRepairPlanOptions(positional[0], runDir);
}

function buildGenerateRepairPlanOptions(root: string | undefined, runDir: string | undefined, error?: string): GenerateRepairPlanCliOptions {
  return {
    ...(root ? { root } : {}),
    ...(runDir ? { runDir } : {}),
    ...(error ? { error } : {})
  };
}

function isHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function parseGenerateTestsOptions(args: string[]): GenerateTestsCliOptions {
  const positional: string[] = [];
  const smokeRoutes: string[] = [];
  let baseUrl: string | undefined;
  let error: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg) {
      continue;
    }

    if (arg === '--smoke-route' || arg.startsWith('--smoke-route=')) {
      const value = readOptionValue(args, index, '--smoke-route');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        smokeRoutes.push(value.value);
      }
      continue;
    }

    if (arg === '--base-url' || arg.startsWith('--base-url=')) {
      const value = readOptionValue(args, index, '--base-url');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        baseUrl = value.value;
      }
      continue;
    }

    if (arg.startsWith('-')) {
      error = `Unknown option: ${arg}`;
      continue;
    }

    positional.push(arg);
  }
  const parseError = error ?? unexpectedPositionalArgument(positional, 2);

  return {
    smokeRoutes,
    ...(positional[0] ? { findingsPath: positional[0] } : {}),
    ...(positional[1] ? { outputDir: positional[1] } : {}),
    ...(baseUrl ? { baseUrl } : {}),
    ...(parseError ? { error: parseError } : {})
  };
}

export function parseRepoUrlOptions(args: string[]): RepoUrlCliOptions {
  const positional: string[] = [];
  let useBrowser = false;
  const criticalPaths: string[] = [];
  let maxRoutes: number | undefined;
  let maxActionsPerRoute: number | undefined;
  let startCommand: string | undefined;
  let bootTimeoutMs: number | undefined;
  let workspaceOutputDir: string | undefined;
  let storageStatePath: string | undefined;
  let trace = false;
  let error: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg) {
      continue;
    }

    if (arg === '--browser') {
      useBrowser = true;
      continue;
    }

    if (arg === '--trace') {
      trace = true;
      continue;
    }

    if (arg === '--critical-path' || arg.startsWith('--critical-path=')) {
      const value = readOptionValue(args, index, '--critical-path');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        criticalPaths.push(value.value);
      }
      continue;
    }

    if (arg === '--max-routes' || arg.startsWith('--max-routes=')) {
      const value = readPositiveIntegerOption(args, index, '--max-routes');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        maxRoutes = value.value;
      }
      continue;
    }

    if (arg === '--max-actions-per-route' || arg.startsWith('--max-actions-per-route=')) {
      const value = readNonNegativeIntegerOption(args, index, '--max-actions-per-route');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value !== undefined) {
        maxActionsPerRoute = value.value;
      }
      continue;
    }

    if (arg === '--start-command' || arg.startsWith('--start-command=')) {
      const value = readOptionValue(args, index, '--start-command');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        startCommand = value.value;
      }
      continue;
    }

    if (arg === '--boot-timeout-ms' || arg.startsWith('--boot-timeout-ms=')) {
      const value = readPositiveIntegerOption(args, index, '--boot-timeout-ms');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        bootTimeoutMs = value.value;
      }
      continue;
    }

    if (arg === '--storage-state' || arg.startsWith('--storage-state=')) {
      const value = readOptionValue(args, index, '--storage-state');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        storageStatePath = value.value;
      }
      continue;
    }

    if (arg === '--workspace-output' || arg.startsWith('--workspace-output=')) {
      const value = readOptionValue(args, index, '--workspace-output');
      if (value.consumedNext) {
        index += 1;
      }
      if (value.error) {
        error = value.error;
      } else if (value.value) {
        workspaceOutputDir = value.value;
      }
      continue;
    }

    if (arg.startsWith('-')) {
      error = `Unknown option: ${arg}`;
      continue;
    }

    positional.push(arg);
  }
  const parseError = error ?? unexpectedPositionalArgument(positional, 2);

  return {
    useBrowser,
    criticalPaths,
    ...(positional[0] ? { root: positional[0] } : {}),
    ...(positional[1] ? { url: positional[1] } : {}),
    ...(maxRoutes ? { maxRoutes } : {}),
    ...(maxActionsPerRoute !== undefined ? { maxActionsPerRoute } : {}),
    ...(startCommand ? { startCommand } : {}),
    ...(bootTimeoutMs ? { bootTimeoutMs } : {}),
    ...(workspaceOutputDir ? { workspaceOutputDir } : {}),
    ...(storageStatePath ? { storageStatePath } : {}),
    ...(trace ? { trace: true } : {}),
    ...(parseError ? { error: parseError } : {})
  };
}

function unexpectedPositionalArgument(positional: string[], allowedCount: number): string | undefined {
  const unexpected = positional[allowedCount];
  return unexpected ? `Unexpected argument: ${unexpected}` : undefined;
}

function readOptionValue(
  args: string[],
  index: number,
  optionName: string
): { value?: string; consumedNext: boolean; error?: string } {
  const current = args[index] ?? '';
  const inlinePrefix = `${optionName}=`;

  if (current.startsWith(inlinePrefix)) {
    const value = current.slice(inlinePrefix.length).trim();
    return value ? { value, consumedNext: false } : { consumedNext: false, error: `Missing value for ${optionName}` };
  }

  const next = args[index + 1]?.trim();

  if (!next || next.startsWith('-')) {
    return { consumedNext: false, error: `Missing value for ${optionName}` };
  }

  return { value: next, consumedNext: true };
}

function readPositiveIntegerOption(
  args: string[],
  index: number,
  optionName: string
): { value?: number; consumedNext: boolean; error?: string } {
  return readIntegerOption(args, index, optionName, (value) => value > 0, 'positive integer');
}

function readNonNegativeIntegerOption(
  args: string[],
  index: number,
  optionName: string
): { value?: number; consumedNext: boolean; error?: string } {
  return readIntegerOption(args, index, optionName, (value) => value >= 0, 'non-negative integer');
}

function readIntegerOption(
  args: string[],
  index: number,
  optionName: string,
  isValid: (value: number) => boolean,
  label: string
): { value?: number; consumedNext: boolean; error?: string } {
  const option = readOptionValue(args, index, optionName);

  if (option.error || !option.value) {
    return {
      consumedNext: option.consumedNext,
      ...(option.error ? { error: option.error } : {})
    };
  }

  const parsed = Number(option.value);

  if (!Number.isInteger(parsed) || !isValid(parsed)) {
    return {
      consumedNext: option.consumedNext,
      error: `Invalid ${label} for ${optionName}: ${option.value}`
    };
  }

  return {
    value: parsed,
    consumedNext: option.consumedNext
  };
}
