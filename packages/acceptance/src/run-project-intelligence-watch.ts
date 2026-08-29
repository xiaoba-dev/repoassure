import { mkdir, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import {
  runProjectIntelligenceAgentContext,
  type ProjectIntelligenceAgentContextRunResult
} from './run-project-intelligence-agent-context.js';
import {
  runProjectIntelligenceSnapshot,
  type ProjectIntelligenceSnapshotRunResult
} from './run-project-intelligence-snapshot.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultOutputDir = 'artifacts/project-graph';
const defaultStatusFileName = 'project-intelligence-watch-status.json';
const defaultDebounceMs = 1500;
const refreshCommands = ['pnpm project:intelligence', 'pnpm project:intelligence:agent-context'] as const;
const watchedPrefixes = ['docs/', 'src/', 'packages/', 'apps/', 'tests/', '.autopilot/'] as const;
const watchedRootDirectories = ['docs', 'src', 'packages', 'apps', 'tests', '.autopilot'] as const;
const watchedFileExtensions = ['.md', '.json', '.ts', '.tsx'] as const;
const ignoredPrefixes = [
  '.git/',
  '.hardening/',
  'artifacts/',
  'benchmark-runs/',
  'coverage/',
  'dist/',
  'node_modules/',
  'test-results/',
  '.autopilot/runs/',
  '.autopilot/cache/',
  '.autopilot/secrets/'
] as const;

export interface ProjectIntelligenceWatchCliOptions {
  root?: string;
  outputDir?: string;
  statusPath?: string;
  debounceMs?: number;
  once?: boolean;
}

export interface ProjectIntelligenceWatchRunInput extends ProjectIntelligenceWatchCliOptions {
  generatedAt?: string;
  pollIntervalMs?: number;
  signal?: AbortSignal;
  refresh?: ProjectIntelligenceWatchRefresh;
  onStatus?: (status: ProjectIntelligenceWatchStatus) => void;
  onReady?: () => void;
}

export interface ProjectIntelligenceWatchRunResult {
  statusPath: string;
  refreshCount: number;
  status: ProjectIntelligenceWatchStatusState;
}

export interface ProjectIntelligenceWatchRefreshInput {
  root: string;
  outputDir: string;
  generatedAt: string;
  changedPaths: string[];
}

export interface ProjectIntelligenceWatchRefreshResult {
  commands: string[];
  snapshotPath: string;
  agentContextPath: string;
}

export type ProjectIntelligenceWatchRefresh = (
  changedPaths: string[],
  input: ProjectIntelligenceWatchRefreshInput
) => Promise<ProjectIntelligenceWatchRefreshResult>;

export type ProjectIntelligenceWatchStatusState = 'idle' | 'refreshing' | 'running' | 'failed' | 'stopped';

export interface ProjectIntelligenceWatchStatus {
  schema: 'repoassure.project-intelligence-watch-status@1';
  generatedAt: string;
  status: ProjectIntelligenceWatchStatusState;
  refreshCount: number;
  debounceMs: number;
  watchedScope: string[];
  ignoredScope: string[];
  lastChangedPaths: string[];
  lastSuccessfulCommands: string[];
  lastOutputs?: {
    snapshotPath: string;
    agentContextPath: string;
  };
  lastFailure?: {
    generatedAt: string;
    summary: string;
  };
  boundary: {
    localOnly: true;
    daemonized: false;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
    cloudSyncEnabled: false;
    targetRepoWriteAuthorized: false;
    manualStop: 'Ctrl+C';
  };
}

export interface ProjectIntelligenceWatchController {
  notifyChange: (path: string) => void;
  waitForIdle: () => Promise<void>;
  stop: () => Promise<void>;
  getStatus: () => ProjectIntelligenceWatchStatus;
}

interface ProjectIntelligenceWatchControllerInput {
  root?: string;
  outputDir?: string;
  statusPath?: string;
  debounceMs?: number;
  generatedAt?: string;
  refresh?: ProjectIntelligenceWatchRefresh;
  onStatus?: (status: ProjectIntelligenceWatchStatus) => void;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceWatchHelpRequest(args)) {
    process.stdout.write(projectIntelligenceWatchHelpText());
    return 0;
  }

  try {
    const abortController = new AbortController();
    const onSigint = (): void => abortController.abort();
    process.once('SIGINT', onSigint);
    const result = await runProjectIntelligenceWatch({
      ...parseProjectIntelligenceWatchArgs(args),
      signal: abortController.signal
    });
    process.off('SIGINT', onSigint);
    process.stdout.write(formatProjectIntelligenceWatchCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence watch failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceWatchArgs(args: string[]): ProjectIntelligenceWatchCliOptions {
  let repoRoot: string | undefined;
  let outputDir: string | undefined;
  let statusPath: string | undefined;
  let debounceMs: number | undefined;
  let once = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--once') {
      once = true;
      continue;
    }

    if (arg === '--root' || arg.startsWith('--root=')) {
      const value = readOptionValue(args, index, '--root');
      repoRoot = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--status' || arg.startsWith('--status=')) {
      const value = readOptionValue(args, index, '--status');
      statusPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--debounce-ms' || arg.startsWith('--debounce-ms=')) {
      const value = readOptionValue(args, index, '--debounce-ms');
      debounceMs = parsePositiveInteger(value.value, '--debounce-ms');
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence watch option: ${arg}`);
  }

  return {
    ...(repoRoot ? { root: repoRoot } : {}),
    ...(outputDir ? { outputDir } : {}),
    ...(statusPath ? { statusPath } : {}),
    ...(debounceMs ? { debounceMs } : {}),
    ...(once ? { once } : {})
  };
}

export function isProjectIntelligenceWatchHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceWatchHelpText(): string {
  return `hardening project intelligence watch

Usage:
  pnpm project:intelligence:watch
  pnpm project:intelligence:watch -- --once
  pnpm project:intelligence:watch -- --debounce-ms 1500
  pnpm project:intelligence:watch -- --help

Options:
  --root <path>         Repository root. Defaults to the current RepoAssure workspace.
  --output <dir>        Output directory. Defaults to artifacts/project-graph.
  --status <path>       Watch status JSON. Defaults to artifacts/project-graph/project-intelligence-watch-status.json.
  --debounce-ms <ms>    Debounce window. Defaults to 1500.
  --once                Run one refresh and stop. Useful for smoke checks.
  --help, -h            Show this help.

Boundaries:
  Local-only, foreground only, no daemon, no telemetry, no hosted dashboard, no target repo writes.

`;
}

export async function runProjectIntelligenceWatch(
  input: ProjectIntelligenceWatchRunInput = {}
): Promise<ProjectIntelligenceWatchRunResult> {
  const controller = createProjectIntelligenceWatchController(input);

  if (input.once === true) {
    controller.notifyChange('docs/PRD.md');
    await controller.waitForIdle();
    await controller.stop();
    const status = controller.getStatus();

    return {
      statusPath: resolveStatusPath(input.root, input.outputDir, input.statusPath),
      refreshCount: status.refreshCount,
      status: status.status
    };
  }

  const repoRoot = resolveRepoRoot(input.root);
  let watchers: ProjectIntelligenceFileWatcher[] = [];

  try {
    watchers = await createProjectIntelligenceWatchers(repoRoot, (changedPath) => controller.notifyChange(changedPath), {
      pollIntervalMs: input.pollIntervalMs ?? Math.min(250, Math.max(25, input.debounceMs ?? defaultDebounceMs))
    });
  } catch (error: unknown) {
    controller.notifyChange('docs/PRD.md');
    await controller.waitForIdle();
    await controller.stop();
    throw new Error(`unable to start local project intelligence watcher: ${errorMessage(error)}`, { cause: error });
  }

  await new Promise<void>((resolvePromise) => {
    const stop = (): void => {
      for (const watcher of watchers) {
        watcher.close();
      }
      input.signal?.removeEventListener('abort', stop);
      resolvePromise();
    };

    if (input.signal?.aborted) {
      stop();
      return;
    }

    input.signal?.addEventListener('abort', stop, { once: true });
    input.onReady?.();
  });
  await controller.stop();
  const status = controller.getStatus();

  return {
    statusPath: resolveStatusPath(input.root, input.outputDir, input.statusPath),
    refreshCount: status.refreshCount,
    status: status.status
  };
}

export function createProjectIntelligenceWatchController(
  input: ProjectIntelligenceWatchControllerInput = {}
): ProjectIntelligenceWatchController {
  const repoRoot = resolveRepoRoot(input.root);
  const outputDir = resolveOutputDir(repoRoot, input.outputDir);
  const statusPath = resolveStatusPath(repoRoot, outputDir, input.statusPath);
  const debounceMs = input.debounceMs ?? defaultDebounceMs;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const refresh = input.refresh ?? defaultProjectIntelligenceRefresh;
  const changedPaths = new Set<string>();
  const idleWaiters = new Set<() => void>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let refreshing = false;
  let pendingAfterRefresh = false;
  let lastRefreshPromise: Promise<void> = Promise.resolve();
  let status = buildProjectIntelligenceWatchStatus({
    generatedAt,
    status: 'idle',
    debounceMs,
    refreshCount: 0,
    lastChangedPaths: [],
    lastSuccessfulCommands: []
  });

  const publishStatus = async (nextStatus: ProjectIntelligenceWatchStatus): Promise<void> => {
    status = nextStatus;
    input.onStatus?.(status);
    await writeProjectIntelligenceWatchStatus(statusPath, status);
  };

  const resolveIdleWaiters = (): void => {
    if (timer || refreshing) {
      return;
    }

    for (const waiter of idleWaiters) {
      waiter();
    }
    idleWaiters.clear();
  };

  const runRefresh = async (): Promise<void> => {
    if (refreshing) {
      pendingAfterRefresh = true;
      return;
    }

    refreshing = true;
    const currentChangedPaths = [...changedPaths].sort();
    changedPaths.clear();

    try {
      await publishStatus({
        ...status,
        generatedAt,
        status: 'refreshing',
        lastChangedPaths: currentChangedPaths
      });
      const result = await refresh(currentChangedPaths, {
        root: repoRoot,
        outputDir,
        generatedAt,
        changedPaths: currentChangedPaths
      });
      await publishStatus({
        ...status,
        generatedAt,
        status: 'running',
        refreshCount: status.refreshCount + 1,
        lastChangedPaths: currentChangedPaths,
        lastSuccessfulCommands: result.commands.map(redactSensitiveText),
        lastOutputs: {
          snapshotPath: relative(repoRoot, result.snapshotPath) || result.snapshotPath,
          agentContextPath: relative(repoRoot, result.agentContextPath) || result.agentContextPath
        }
      });
    } catch (error: unknown) {
      await publishStatus({
        ...status,
        generatedAt,
        status: 'failed',
        lastChangedPaths: currentChangedPaths,
        lastFailure: {
          generatedAt,
          summary: redactSensitiveText(errorMessage(error))
        }
      });
      throw error;
    } finally {
      refreshing = false;
      if (pendingAfterRefresh || changedPaths.size > 0) {
        pendingAfterRefresh = false;
        lastRefreshPromise = runRefresh();
      } else {
        resolveIdleWaiters();
      }
    }
  };

  const scheduleRefresh = (): void => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;
      lastRefreshPromise = runRefresh();
    }, debounceMs);
  };

  return {
    notifyChange(path: string): void {
      const normalizedPath = normalizeProjectPath(path);

      if (!shouldRefreshProjectIntelligencePath(normalizedPath)) {
        return;
      }

      changedPaths.add(normalizedPath);
      scheduleRefresh();
    },
    async waitForIdle(): Promise<void> {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
        lastRefreshPromise = runRefresh();
      }

      await lastRefreshPromise;

      if (!timer && !refreshing) {
        return;
      }

      await new Promise<void>((resolvePromise) => {
        idleWaiters.add(resolvePromise);
      });
      await lastRefreshPromise;
    },
    async stop(): Promise<void> {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      await lastRefreshPromise;
      await publishStatus({
        ...status,
        generatedAt,
        status: status.status === 'failed' ? 'failed' : 'stopped'
      });
    },
    getStatus(): ProjectIntelligenceWatchStatus {
      return status;
    }
  };
}

export function shouldRefreshProjectIntelligencePath(path: string): boolean {
  const normalizedPath = normalizeProjectPath(path);

  if (!normalizedPath || ignoredPrefixes.some((prefix) => normalizedPath === prefix.slice(0, -1) || normalizedPath.startsWith(prefix))) {
    return false;
  }

  if (!watchedPrefixes.some((prefix) => normalizedPath.startsWith(prefix))) {
    return false;
  }

  return watchedFileExtensions.some((extension) => normalizedPath.endsWith(extension));
}

async function defaultProjectIntelligenceRefresh(
  _changedPaths: string[],
  input: ProjectIntelligenceWatchRefreshInput
): Promise<ProjectIntelligenceWatchRefreshResult> {
  const snapshot: ProjectIntelligenceSnapshotRunResult = await runProjectIntelligenceSnapshot({
    root: input.root,
    outputDir: input.outputDir,
    generatedAt: input.generatedAt
  });
  const agentContext: ProjectIntelligenceAgentContextRunResult = await runProjectIntelligenceAgentContext({
    root: input.root,
    snapshotPath: snapshot.snapshotPath,
    outputDir: input.outputDir,
    generatedAt: input.generatedAt
  });

  return {
    commands: [...refreshCommands],
    snapshotPath: snapshot.snapshotPath,
    agentContextPath: agentContext.contextPath
  };
}

interface ProjectIntelligenceFileWatcher {
  close: () => void;
}

async function createProjectIntelligenceWatchers(
  repoRoot: string,
  onChange: (changedPath: string) => void,
  input: { pollIntervalMs: number }
): Promise<ProjectIntelligenceFileWatcher[]> {
  let previousState = await readProjectIntelligenceWatchFileState(repoRoot);
  let scanning = false;
  const scan = async (): Promise<void> => {
    if (scanning) {
      return;
    }

    scanning = true;
    try {
      const nextState = await readProjectIntelligenceWatchFileState(repoRoot);
      for (const [path, mtimeMs] of nextState) {
        if (previousState.get(path) !== mtimeMs) {
          onChange(path);
        }
      }
      previousState = nextState;
    } finally {
      scanning = false;
    }
  };
  const timer = setInterval(() => {
    void scan();
  }, input.pollIntervalMs);

  return [{
    close(): void {
      clearInterval(timer);
    }
  }];
}

async function readProjectIntelligenceWatchFileState(repoRoot: string): Promise<Map<string, number>> {
  const files = await collectProjectIntelligenceWatchFiles(repoRoot);
  const state = new Map<string, number>();

  for (const file of files) {
    try {
      const fileStat = await stat(join(repoRoot, file));
      if (fileStat.isFile()) {
        state.set(file, fileStat.mtimeMs);
      }
    } catch {
      continue;
    }
  }

  return state;
}

async function collectProjectIntelligenceWatchFiles(repoRoot: string): Promise<string[]> {
  const directories = await collectProjectIntelligenceWatchDirectories(repoRoot);
  const files: string[] = [];

  for (const { absolutePath, relativePath } of directories) {
    const entries = await readdir(absolutePath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = normalizeProjectPath(join(relativePath, entry.name));
        if (shouldRefreshProjectIntelligencePath(filePath)) {
          files.push(filePath);
        }
      }
    }
  }

  return files.sort();
}

async function collectProjectIntelligenceWatchDirectories(repoRoot: string): Promise<Array<{
  absolutePath: string;
  relativePath: string;
}>> {
  const directories: Array<{ absolutePath: string; relativePath: string }> = [];

  for (const rootDirectory of watchedRootDirectories) {
    const absolutePath = join(repoRoot, rootDirectory);
    try {
      const directoryStat = await stat(absolutePath);
      if (!directoryStat.isDirectory()) {
        continue;
      }
    } catch {
      continue;
    }

    await collectProjectIntelligenceWatchDirectory(repoRoot, rootDirectory, directories);
  }

  return directories;
}

async function collectProjectIntelligenceWatchDirectory(
  repoRoot: string,
  relativePath: string,
  directories: Array<{ absolutePath: string; relativePath: string }>
): Promise<void> {
  const normalizedPath = normalizeProjectPath(relativePath);

  if (isIgnoredProjectIntelligenceDirectory(normalizedPath)) {
    return;
  }

  const absolutePath = join(repoRoot, normalizedPath);
  directories.push({ absolutePath, relativePath: normalizedPath });

  const entries = await readdir(absolutePath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await collectProjectIntelligenceWatchDirectory(repoRoot, join(normalizedPath, entry.name), directories);
    }
  }
}

function isIgnoredProjectIntelligenceDirectory(path: string): boolean {
  const normalizedPath = normalizeProjectPath(path);
  const pathWithSlash = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;

  return ignoredPrefixes.some((prefix) => pathWithSlash === prefix || pathWithSlash.startsWith(prefix));
}

function buildProjectIntelligenceWatchStatus(input: {
  generatedAt: string;
  status: ProjectIntelligenceWatchStatusState;
  debounceMs: number;
  refreshCount: number;
  lastChangedPaths: string[];
  lastSuccessfulCommands: string[];
}): ProjectIntelligenceWatchStatus {
  return {
    schema: 'repoassure.project-intelligence-watch-status@1',
    generatedAt: input.generatedAt,
    status: input.status,
    refreshCount: input.refreshCount,
    debounceMs: input.debounceMs,
    watchedScope: [
      'docs/**/*.md',
      'docs/**/*.json',
      'src/**/*.ts',
      'packages/**/*.ts',
      'apps/**/*.ts',
      'apps/**/*.tsx',
      'tests/**/*.ts',
      '.autopilot/**/*.json',
      '.autopilot/**/*.md'
    ],
    ignoredScope: [...ignoredPrefixes],
    lastChangedPaths: input.lastChangedPaths.map(redactSensitiveText),
    lastSuccessfulCommands: input.lastSuccessfulCommands,
    boundary: {
      localOnly: true,
      daemonized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      targetRepoWriteAuthorized: false,
      manualStop: 'Ctrl+C'
    }
  };
}

async function writeProjectIntelligenceWatchStatus(
  statusPath: string,
  status: ProjectIntelligenceWatchStatus
): Promise<void> {
  await mkdir(dirname(statusPath), { recursive: true });
  const tempPath = `${statusPath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(status, null, 2)}\n`);
  await rename(tempPath, statusPath);
}

function resolveRepoRoot(repoRoot?: string): string {
  return repoRoot ? resolve(root, repoRoot) : root;
}

function resolveOutputDir(repoRoot: string, outputDir?: string): string {
  return outputDir ? resolve(root, outputDir) : resolve(repoRoot, defaultOutputDir);
}

function resolveStatusPath(repoRoot?: string, outputDir?: string, statusPath?: string): string {
  if (statusPath) {
    return resolve(root, statusPath);
  }

  const resolvedRoot = resolveRepoRoot(repoRoot);
  const resolvedOutputDir = outputDir ? resolve(root, outputDir) : resolve(resolvedRoot, defaultOutputDir);

  return join(resolvedOutputDir, defaultStatusFileName);
}

function normalizeProjectPath(path: string): string {
  return path.replace(/\\/gu, '/').replace(/^\.\/+/u, '');
}

function formatProjectIntelligenceWatchCliSummary(result: ProjectIntelligenceWatchRunResult): string {
  return [
    `Project intelligence watch status: ${result.status}`,
    `Refresh count: ${result.refreshCount}`,
    `Status artifact: ${result.statusPath}`,
    ''
  ].join('\n');
}

function parsePositiveInteger(value: string, optionName: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== value) {
    throw new Error(`${optionName} must be a positive integer`);
  }

  return parsed;
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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isDirectRun(metaUrl: string = import.meta.url, argvPath: string | undefined = process.argv[1]): boolean {
  return Boolean(argvPath && metaUrl === new URL(`file://${resolve(argvPath)}`).href);
}

if (isDirectRun()) {
  process.exitCode = await main();
}
