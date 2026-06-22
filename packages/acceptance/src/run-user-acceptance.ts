import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import { formatAcceptanceFatalError } from './fatal-error.js';
import {
  buildPythonCliExecutionAcceptanceChecks,
  buildPythonCliSmokeCommands,
  detectPythonCliStaticCheckCommands,
  runPythonCliCheckCommands,
  type PythonCliCheckCommand
} from './python-cli-checks.js';
import {
  writePythonCliAcceptanceArtifacts,
  type PythonCliAcceptanceArtifacts
} from './python-cli-artifacts.js';
import {
  buildPythonCliProfile,
  writePythonCliProfileArtifact,
  type PythonCliProfile
} from './python-cli-profile.js';
import { redactSensitiveText } from './redaction.js';
import { buildUserAcceptanceMarkdown, type UserAcceptanceCheck } from './user-acceptance.js';
import {
  formatUserAcceptanceCommand,
  parseUserAcceptanceArgs,
  type UserAcceptanceCliOptions
} from './user-acceptance-args.js';
import {
  buildUserAcceptanceArtifactChecks,
  buildUserAcceptanceRepoPreflightChecks,
  selectGeneratedTestValidationBaseUrl,
  shouldManageGeneratedTestBootSession,
  writeUserAcceptanceRecord
} from './user-acceptance-runner-helpers.js';

export { formatUserAcceptanceCommand, parseUserAcceptanceArgs };
export type { UserAcceptanceCliOptions };

export interface ExploreBrowserDriver {
  close: () => Promise<void>;
  [key: string]: unknown;
}

export interface BootAppToolSession {
  url: string | null;
  stop: () => Promise<void>;
  [key: string]: unknown;
}

export type RunBootApp = (input: unknown) => Promise<BootAppToolSession>;

export interface RunHardeningInput {
  root: string;
  url?: string;
  startCommand?: string;
  bootTimeoutMs?: number;
  criticalPaths?: string[];
  maxRoutes?: number;
  maxActionsPerRoute?: number;
  bootApp?: RunBootApp;
  browserDriver?: ExploreBrowserDriver;
}

export interface RunHardeningResult {
  reportPath: string;
  findingsPath: string;
  artifactBundle: {
    manifestPath: string;
  };
  repairPlan: {
    repairPlanPath: string;
    repairPlanMarkdownPath: string;
    repairTaskPackagePath: string;
    repairTaskPackageMarkdownPath: string;
  };
  testGeneration: {
    createdFiles: string[];
  };
  explore: {
    artifactFiles: string[];
  };
  report: {
    readinessScore: number;
    issueCounts: { P0: number; P1: number; P2: number };
    patchDiffPath: string;
  };
}

export interface UserAcceptanceDependencies {
  runHardening?: (input: RunHardeningInput) => Promise<RunHardeningResult>;
  runBootApp?: RunBootApp;
  createBrowserDriver?: (input: { storageStatePath?: string; trace?: true }) => Promise<ExploreBrowserDriver>;
}

interface RunHardeningModule {
  runHardeningTool: (input: RunHardeningInput) => Promise<RunHardeningResult>;
}

interface BootAppModule {
  runBootAppTool: RunBootApp;
}

interface PlaywrightDriverModule {
  createPlaywrightBrowserDriver: (input: { storageStatePath?: string; trace?: true }) => Promise<ExploreBrowserDriver>;
}

const defaultGeneratedTestTimeoutMs = 120_000;
const defaultPythonCliCheckTimeoutMs = 120_000;
const defaultPythonCliCheckMaxOutputChars = 2_000;

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isUserAcceptanceHelpRequest(args)) {
    process.stdout.write(userAcceptanceHelpText());
    return 0;
  }

  const options = parseUserAcceptanceArgs(args);

  return await runUserAcceptance(options);
}

export function isUserAcceptanceHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function userAcceptanceHelpText(): string {
  return `hardening user acceptance

Usage:
  pnpm user:accept -- --repo <repo> [--browser] [--decision pending|accepted|changes_requested]
  pnpm user:accept -- --mode cli --repo <python-cli-repo> [--decision pending|accepted|changes_requested]
  pnpm user:accept -- --repo <repo> --browser --validate-generated-tests [--url <running-url>] [--generated-test-timeout-ms <ms>]
  pnpm user:accept -- -h

Options:
  --repo <repo>                         Existing Web App repo with a package.json file.
  --mode <browser|cli>                  Acceptance mode. Defaults to browser; cli is explicit for Python/CLI repos.
  --url <running-url>                   Reuse an already running local app.
  --browser                             Capture browser artifacts during exploration.
  --trace                               Capture Playwright trace when browser mode is enabled.
  --validate-generated-tests            Execute generated Playwright specs; required for accepted.
  --generated-test-timeout-ms <ms>      Timeout for generated spec validation. Default: ${defaultGeneratedTestTimeoutMs}.
  --critical-path <path-or-intent>      Add a route or natural-language critical path.
  --max-routes <n>                      Limit routes explored during hardening.
  --max-actions-per-route <n>           Limit non-destructive interactions per route.
  --start-command <command>             Override inferred app start command.
  --boot-timeout-ms <ms>                Override app boot timeout.
  --storage-state <path>                Reuse Playwright storage state for authenticated flows.
  --output <path>                       Write the acceptance record to a custom path.
  --decision <decision>                 pending, accepted, or changes_requested.
  --notes <text>                        User-visible acceptance notes; required for accepted and changes_requested.
  --help, -h                            Show this help.

`;
}

export async function runUserAcceptance(
  options: UserAcceptanceCliOptions,
  dependencies: UserAcceptanceDependencies = {}
): Promise<number> {
  const repoPreflightChecks = await buildUserAcceptanceRepoPreflightChecks(options.repoRoot, { mode: options.mode });

  if (repoPreflightChecks.some((check) => check.required && check.status === 'failed')) {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: new Date().toISOString(),
      repoRoot: options.repoRoot,
      mode: options.mode,
      command: formatUserAcceptanceCommand(options),
      decision: options.decision,
      notes: options.notes,
      checks: repoPreflightChecks
    });

    await writeUserAcceptanceRecord(options.outputPath, markdown);
    process.stdout.write(`${markdown}\n`);

    return 1;
  }

  if (options.mode === 'cli') {
    return await runPythonCliUserAcceptance(options, repoPreflightChecks);
  }

  const runHardening = dependencies.runHardening ?? await loadDefaultRunHardeningTool();
  const runBootApp = dependencies.runBootApp ?? await loadDefaultRunBootAppTool();
  const createBrowserDriver = dependencies.createBrowserDriver ?? await loadDefaultCreatePlaywrightBrowserDriver();
  const managedBoot: {
    session: BootAppToolSession | null;
    baseUrl: string | undefined;
  } = {
    session: null,
    baseUrl: undefined
  };
  const managedBootRunner: RunBootApp = async (input) => {
    const session = await runBootApp(input);
    managedBoot.session = session;
    if (session.url) {
      managedBoot.baseUrl = session.url;
    }

    return {
      ...session,
      stop: async () => {}
    };
  };
  let browserDriver: ExploreBrowserDriver | undefined;

  try {
    const createdBrowserDriver = options.browser
      ? await createBrowserDriver({
          ...(options.storageStatePath ? { storageStatePath: options.storageStatePath } : {}),
          ...(options.trace ? { trace: true } : {})
        })
      : undefined;
    browserDriver = createdBrowserDriver ? closeBrowserDriverOnce(createdBrowserDriver) : undefined;
    const result = await runHardening({
      root: options.repoRoot,
      ...(options.url ? { url: options.url } : {}),
      ...(options.startCommand ? { startCommand: options.startCommand } : {}),
      ...(options.bootTimeoutMs ? { bootTimeoutMs: options.bootTimeoutMs } : {}),
      ...(options.criticalPaths.length > 0 ? { criticalPaths: options.criticalPaths } : {}),
      ...(options.maxRoutes ? { maxRoutes: options.maxRoutes } : {}),
      ...(options.maxActionsPerRoute !== undefined ? { maxActionsPerRoute: options.maxActionsPerRoute } : {}),
      ...(shouldManageGeneratedTestBootSession(options) ? { bootApp: managedBootRunner } : {}),
      ...(browserDriver ? { browserDriver } : {})
    });
    const validationBaseUrl = selectGeneratedTestValidationBaseUrl(options.url, managedBoot.baseUrl);
    const checks = await buildUserAcceptanceArtifactChecks({
      repoRoot: options.repoRoot,
      reportPath: result.reportPath,
      findingsPath: result.findingsPath,
      manifestPath: result.artifactBundle.manifestPath,
      repairPlanPath: result.repairPlan.repairPlanPath,
      repairPlanMarkdownPath: result.repairPlan.repairPlanMarkdownPath,
      repairTaskPackagePath: result.repairPlan.repairTaskPackagePath,
      repairTaskPackageMarkdownPath: result.repairPlan.repairTaskPackageMarkdownPath,
      patchDiffPath: result.report.patchDiffPath,
      generatedTestFiles: result.testGeneration.createdFiles,
      artifactFiles: result.explore.artifactFiles,
      browser: options.browser,
      validateGeneratedTests: options.validateGeneratedTests,
      generatedTestTimeoutMs: options.generatedTestTimeoutMs ?? defaultGeneratedTestTimeoutMs,
      ...(validationBaseUrl ? { baseUrl: validationBaseUrl } : {})
    });
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: new Date().toISOString(),
      repoRoot: options.repoRoot,
      mode: options.mode,
      command: formatUserAcceptanceCommand(options),
      decision: options.decision,
      notes: options.notes,
      readinessScore: result.report.readinessScore,
      issueCounts: result.report.issueCounts,
      reportPath: result.reportPath,
      findingsPath: result.findingsPath,
      checks
    });

    await writeUserAcceptanceRecord(options.outputPath, markdown);
    process.stdout.write(`${markdown}\n`);

    return checks.some((check) => check.required && check.status === 'failed') ? 1 : 0;
  } catch (error: unknown) {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: new Date().toISOString(),
      repoRoot: options.repoRoot,
      mode: options.mode,
      command: formatUserAcceptanceCommand(options),
      decision: options.decision,
      notes: options.notes,
      checks: [buildUnexpectedFailureCheck(error, options.mode)]
    });

    await writeUserAcceptanceRecord(options.outputPath, markdown);
    process.stdout.write(`${markdown}\n`);

    return 1;
  } finally {
    if (browserDriver) {
      await browserDriver.close();
    }
    if (managedBoot.session) {
      await managedBoot.session.stop();
    }
  }
}

async function runPythonCliUserAcceptance(
  options: UserAcceptanceCliOptions,
  repoPreflightChecks: UserAcceptanceCheck[]
): Promise<number> {
  try {
    const profile = await buildPythonCliProfile(options.repoRoot);
    const profilePath = await writePythonCliProfileArtifact(options.repoRoot, profile);
    const smokeCommands = buildPythonCliSmokeCommands(profile);
    const staticCommands = detectPythonCliStaticCheckCommands(profile);
    const artifactChecks = buildPythonCliAcceptanceChecks(profile, profilePath, smokeCommands, staticCommands);
    const executableCommands = [...smokeCommands, ...staticCommands];
    const commandResults = await runPythonCliCheckCommands({
      commands: executableCommands,
      cwd: options.repoRoot,
      timeoutMs: defaultPythonCliCheckTimeoutMs,
      maxOutputChars: defaultPythonCliCheckMaxOutputChars
    });
    const executionChecks = buildPythonCliExecutionAcceptanceChecks(executableCommands, commandResults);
    const artifacts = await writePythonCliAcceptanceArtifacts({
      repoRoot: options.repoRoot,
      profile,
      smokeCommands,
      staticCommands,
      commandResults,
      checks: [
        ...artifactChecks,
        ...executionChecks
      ]
    });
    const checks = [
      ...repoPreflightChecks,
      ...artifactChecks,
      ...executionChecks,
      ...buildPythonCliArtifactChecks(artifacts)
    ];
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: new Date().toISOString(),
      repoRoot: options.repoRoot,
      mode: options.mode,
      command: formatUserAcceptanceCommand(options),
      decision: options.decision,
      notes: options.notes,
      reportPath: artifacts.reportPath,
      findingsPath: profilePath,
      checks
    });

    await writeUserAcceptanceRecord(options.outputPath, markdown);
    process.stdout.write(`${markdown}\n`);

    return checks.some((check) => check.required && check.status === 'failed') ? 1 : 0;
  } catch (error: unknown) {
    const markdown = buildUserAcceptanceMarkdown({
      generatedAt: new Date().toISOString(),
      repoRoot: options.repoRoot,
      mode: options.mode,
      command: formatUserAcceptanceCommand(options),
      decision: options.decision,
      notes: options.notes,
      checks: [buildUnexpectedFailureCheck(error, options.mode)]
    });

    await writeUserAcceptanceRecord(options.outputPath, markdown);
    process.stdout.write(`${markdown}\n`);

    return 1;
  }
}

function buildPythonCliAcceptanceChecks(
  profile: PythonCliProfile,
  profilePath: string,
  smokeCommands: PythonCliCheckCommand[],
  staticCommands: PythonCliCheckCommand[]
): UserAcceptanceCheck[] {
  return [
    {
      name: 'python-cli-profile.json 已生成',
      required: true,
      status: 'passed',
      evidence: profilePath
    },
    {
      name: 'Python CLI console entrypoint 已检测',
      required: true,
      status: Object.keys(profile.consoleScripts).length > 0 ? 'passed' : 'failed',
      evidence: Object.keys(profile.consoleScripts).length > 0
        ? formatPythonCliCommandNames(smokeCommands)
        : 'No [project.scripts] console entrypoints detected'
    },
    {
      name: 'Python CLI smoke check plan 已生成',
      required: true,
      status: smokeCommands.length > 0 ? 'passed' : 'failed',
      evidence: smokeCommands.length > 0
        ? formatPythonCliCommands(smokeCommands)
        : 'No safe CLI smoke command can be planned'
    },
    {
      name: 'Python CLI static/test check plan 已生成',
      required: false,
      status: staticCommands.length > 0 ? 'passed' : 'skipped',
      evidence: staticCommands.length > 0
        ? formatPythonCliCommands(staticCommands)
        : 'No pytest, ruff, or mypy optional dependency detected'
    },
    {
      name: 'Python CLI profile 阻塞项检查',
      required: true,
      status: profile.blockers.length === 0 ? 'passed' : 'failed',
      evidence: profile.blockers.length === 0 ? `confidence=${profile.confidence}` : profile.blockers.join('; ')
    }
  ];
}

function buildPythonCliArtifactChecks(artifacts: PythonCliAcceptanceArtifacts): UserAcceptanceCheck[] {
  return [
    {
      name: 'hardening-report.md 已生成',
      required: true,
      status: 'passed',
      evidence: artifacts.reportPath
    },
    {
      name: 'run manifest 已生成',
      required: true,
      status: 'passed',
      evidence: artifacts.manifestPath
    },
    {
      name: 'repair-plan.json 已生成',
      required: true,
      status: 'passed',
      evidence: artifacts.repairPlanPath
    },
    {
      name: 'repair-plan.md 已生成',
      required: true,
      status: 'passed',
      evidence: artifacts.repairPlanMarkdownPath
    },
    {
      name: 'repair-task-package.json 已生成',
      required: true,
      status: 'passed',
      evidence: artifacts.repairTaskPackagePath
    },
    {
      name: 'repair-task-package.md 已生成',
      required: true,
      status: 'passed',
      evidence: artifacts.repairTaskPackageMarkdownPath
    }
  ];
}

function formatPythonCliCommandNames(commands: PythonCliCheckCommand[]): string {
  return commands.map((command) => command.command).join(', ');
}

function formatPythonCliCommands(commands: PythonCliCheckCommand[]): string {
  return commands.map((command) => `${command.command} ${command.args.join(' ')}`.trim()).join('; ');
}

if (isDirectRun(import.meta.url, process.argv[1])) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('User acceptance runner failed', error)}\n`);
    process.exitCode = 1;
  });
}

function closeBrowserDriverOnce(browserDriver: ExploreBrowserDriver): ExploreBrowserDriver {
  let closed = false;

  return {
    ...browserDriver,
    close: async () => {
      if (closed) {
        return;
      }

      closed = true;
      await browserDriver.close();
    }
  };
}

function buildUnexpectedFailureCheck(error: unknown, mode: UserAcceptanceCliOptions['mode'] = 'browser'): UserAcceptanceCheck {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  return {
    name: mode === 'cli' ? 'Python CLI acceptance flow 执行完成' : 'hardening flow 执行完成',
    required: true,
    status: 'failed',
    evidence: truncateText(redactSensitiveText(message))
  };
}

async function loadDefaultRunHardeningTool(): Promise<(input: RunHardeningInput) => Promise<RunHardeningResult>> {
  const module = await import(new URL('../../../dist/tools/run-hardening-tool.js', import.meta.url).href) as Partial<RunHardeningModule>;

  if (typeof module.runHardeningTool !== 'function') {
    throw new Error('User acceptance runner dependency does not export runHardeningTool()');
  }

  return module.runHardeningTool;
}

async function loadDefaultRunBootAppTool(): Promise<RunBootApp> {
  const module = await import(new URL('../../../dist/tools/boot-app-tool.js', import.meta.url).href) as Partial<BootAppModule>;

  if (typeof module.runBootAppTool !== 'function') {
    throw new Error('User acceptance runner dependency does not export runBootAppTool()');
  }

  return module.runBootAppTool;
}

async function loadDefaultCreatePlaywrightBrowserDriver(): Promise<(input: { storageStatePath?: string; trace?: true }) => Promise<ExploreBrowserDriver>> {
  const module = await import(new URL('../../../dist/domain/explore/playwright-driver.js', import.meta.url).href) as Partial<PlaywrightDriverModule>;

  if (typeof module.createPlaywrightBrowserDriver !== 'function') {
    throw new Error('User acceptance runner dependency does not export createPlaywrightBrowserDriver()');
  }

  return module.createPlaywrightBrowserDriver;
}

export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean {
  return argvPath !== undefined && fileURLToPath(moduleUrl) === resolve(argvPath);
}

function truncateText(value: string): string {
  return value.replaceAll('\n', ' ').slice(0, 500);
}
