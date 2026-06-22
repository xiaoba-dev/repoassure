import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { shellQuoteArg } from './shell-quote.js';
import { findRepoPathPlaceholder } from './repo-preflight.js';
import type { UserDecision } from './user-acceptance.js';

export type UserAcceptanceMode = 'browser' | 'cli';

export interface UserAcceptanceCliOptions {
  repoRoot: string;
  mode: UserAcceptanceMode;
  url?: string;
  browser: boolean;
  trace: boolean;
  criticalPaths: string[];
  maxRoutes?: number;
  maxActionsPerRoute?: number;
  startCommand?: string;
  bootTimeoutMs?: number;
  storageStatePath?: string;
  validateGeneratedTests: boolean;
  generatedTestTimeoutMs?: number;
  outputPath: string;
  decision: UserDecision;
  notes: string;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultUserAcceptanceOutputPath = join(root, 'docs', 'acceptance', 'user-acceptance-record.md');

export function parseUserAcceptanceArgs(args: string[]): UserAcceptanceCliOptions {
  let repoRoot = '';
  let mode: UserAcceptanceMode = 'browser';
  let url: string | undefined;
  let browser = false;
  let trace = false;
  const criticalPaths: string[] = [];
  let maxRoutes: number | undefined;
  let maxActionsPerRoute: number | undefined;
  let startCommand: string | undefined;
  let bootTimeoutMs: number | undefined;
  let storageStatePath: string | undefined;
  let validateGeneratedTests = false;
  let generatedTestTimeoutMs: number | undefined;
  let outputPath = defaultUserAcceptanceOutputPath;
  let decision: UserDecision = 'pending';
  let notes = '';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--browser') {
      browser = true;
      continue;
    }

    if (arg === '--mode' || arg.startsWith('--mode=')) {
      const value = readOptionValue(args, index, '--mode');
      mode = parseMode(value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--trace') {
      trace = true;
      continue;
    }

    if (arg === '--validate-generated-tests') {
      validateGeneratedTests = true;
      continue;
    }

    if (arg === '--generated-test-timeout-ms' || arg.startsWith('--generated-test-timeout-ms=')) {
      const value = readPositiveIntegerOption(args, index, '--generated-test-timeout-ms');
      generatedTestTimeoutMs = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--repo' || arg.startsWith('--repo=')) {
      const value = readOptionValue(args, index, '--repo');
      repoRoot = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--url' || arg.startsWith('--url=')) {
      const value = readOptionValue(args, index, '--url');
      url = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--critical-path' || arg.startsWith('--critical-path=')) {
      const value = readOptionValue(args, index, '--critical-path');
      criticalPaths.push(value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--max-routes' || arg.startsWith('--max-routes=')) {
      const value = readPositiveIntegerOption(args, index, '--max-routes');
      maxRoutes = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--max-actions-per-route' || arg.startsWith('--max-actions-per-route=')) {
      const value = readNonNegativeIntegerOption(args, index, '--max-actions-per-route');
      maxActionsPerRoute = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--start-command' || arg.startsWith('--start-command=')) {
      const value = readOptionValue(args, index, '--start-command');
      startCommand = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--boot-timeout-ms' || arg.startsWith('--boot-timeout-ms=')) {
      const value = readPositiveIntegerOption(args, index, '--boot-timeout-ms');
      bootTimeoutMs = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--storage-state' || arg.startsWith('--storage-state=')) {
      const value = readOptionValue(args, index, '--storage-state');
      storageStatePath = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--decision' || arg.startsWith('--decision=')) {
      const value = readOptionValue(args, index, '--decision');
      decision = parseDecision(value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--notes' || arg.startsWith('--notes=')) {
      const value = readOptionValue(args, index, '--notes');
      notes = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown user acceptance option: ${arg}`);
  }

  if (!repoRoot) {
    throw new Error('Missing required option: --repo <path>');
  }

  if (decision === 'accepted' && !hasConcreteAcceptanceNotes(notes)) {
    throw new Error('--notes with concrete acceptance confirmation is required when --decision accepted');
  }

  if (decision === 'accepted' && mode === 'browser' && !validateGeneratedTests) {
    throw new Error('--validate-generated-tests is required when --decision accepted');
  }

  if (decision === 'changes_requested' && !hasConcreteChangeNotes(notes)) {
    throw new Error('--notes with concrete change details is required when --decision changes_requested');
  }

  return {
    repoRoot,
    mode,
    ...(url ? { url } : {}),
    browser,
    trace,
    criticalPaths,
    ...(maxRoutes ? { maxRoutes } : {}),
    ...(maxActionsPerRoute !== undefined ? { maxActionsPerRoute } : {}),
    ...(startCommand ? { startCommand } : {}),
    ...(bootTimeoutMs ? { bootTimeoutMs } : {}),
    ...(storageStatePath ? { storageStatePath } : {}),
    validateGeneratedTests,
    ...(generatedTestTimeoutMs ? { generatedTestTimeoutMs } : {}),
    outputPath,
    decision,
    notes
  };
}

export function formatUserAcceptanceCommand(options: UserAcceptanceCliOptions): string {
  return [
    'pnpm user:accept --',
    `--repo ${formatUserAcceptanceRepoArg(options.repoRoot)}`,
    ...(options.mode === 'cli' ? [`--mode ${options.mode}`] : []),
    ...(options.url ? [`--url ${shellQuoteArg(options.url)}`] : []),
    ...(options.browser ? ['--browser'] : []),
    ...(options.trace ? ['--trace'] : []),
    ...(options.validateGeneratedTests ? ['--validate-generated-tests'] : []),
    ...options.criticalPaths.map((path) => `--critical-path ${shellQuoteArg(path)}`),
    ...(options.maxRoutes ? [`--max-routes ${options.maxRoutes}`] : []),
    ...(options.maxActionsPerRoute !== undefined ? [`--max-actions-per-route ${options.maxActionsPerRoute}`] : []),
    ...(options.startCommand ? [`--start-command ${shellQuoteArg(options.startCommand)}`] : []),
    ...(options.bootTimeoutMs ? [`--boot-timeout-ms ${options.bootTimeoutMs}`] : []),
    ...(options.storageStatePath ? [`--storage-state ${shellQuoteArg(options.storageStatePath)}`] : []),
    ...(options.generatedTestTimeoutMs ? [`--generated-test-timeout-ms ${options.generatedTestTimeoutMs}`] : []),
    ...(options.outputPath !== defaultUserAcceptanceOutputPath ? [`--output ${shellQuoteArg(options.outputPath)}`] : []),
    `--decision ${shellQuoteArg(options.decision)}`,
    ...(options.notes ? [`--notes ${shellQuoteArg(options.notes)}`] : [])
  ].join(' ');
}

function parseMode(value: string): UserAcceptanceMode {
  if (value === 'browser' || value === 'cli') {
    return value;
  }

  throw new Error('--mode must be browser or cli');
}

function formatUserAcceptanceRepoArg(repoRoot: string): string {
  return findRepoPathPlaceholder(repoRoot) ?? shellQuoteArg(repoRoot);
}

function readOptionValue(args: string[], index: number, optionName: string): { value: string; consumedNext: boolean } {
  const current = args[index] ?? '';

  if (current.startsWith(`${optionName}=`)) {
    const value = current.slice(optionName.length + 1).trim();
    if (!value) {
      throw new Error(`Missing value for ${optionName}`);
    }
    return { value, consumedNext: false };
  }

  const value = args[index + 1]?.trim();
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${optionName}`);
  }

  return { value, consumedNext: true };
}

function readPositiveIntegerOption(args: string[], index: number, optionName: string): { value: number; consumedNext: boolean } {
  const value = readOptionValue(args, index, optionName);
  const parsed = Number(value.value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${optionName} must be a positive integer`);
  }

  return {
    value: parsed,
    consumedNext: value.consumedNext
  };
}

function readNonNegativeIntegerOption(args: string[], index: number, optionName: string): { value: number; consumedNext: boolean } {
  const value = readOptionValue(args, index, optionName);
  const parsed = Number(value.value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${optionName} must be a non-negative integer`);
  }

  return {
    value: parsed,
    consumedNext: value.consumedNext
  };
}

function parseDecision(value: string): UserDecision {
  if (value === 'pending' || value === 'accepted' || value === 'changes_requested') {
    return value;
  }

  throw new Error('--decision must be pending, accepted, or changes_requested');
}

function hasConcreteChangeNotes(notes: string): boolean {
  return hasConcreteUserNotes(notes)
    && notes !== '<具体修改项>';
}

function hasConcreteAcceptanceNotes(notes: string): boolean {
  return hasConcreteUserNotes(notes)
    && notes !== '<用户确认>';
}

function hasConcreteUserNotes(notes: string): boolean {
  return notes.length > 0
    && notes !== '<具体修改项>'
    && notes !== '<用户确认>'
    && notes !== '待用户填写'
    && notes !== '待用户填写。';
}
