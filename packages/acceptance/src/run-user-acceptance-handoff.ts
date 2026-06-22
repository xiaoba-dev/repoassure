import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import {
  buildGoalAuditMarkdown,
  summarizeGoalAudit,
  type GoalAuditItem,
  type GoalAuditSummary
} from './goal-audit.js';
import { buildGoalAuditItemsFromWorkspace } from './run-goal-audit.js';
import { buildUserAcceptanceHandoffMarkdown } from './user-acceptance-handoff.js';
import { buildUserAcceptanceRepoPreflightChecks } from './user-acceptance-runner-helpers.js';
import type { UserAcceptanceMode } from './user-acceptance-args.js';
import type { UserAcceptanceCheck } from './user-acceptance.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultOutputPath = join(root, 'docs', 'acceptance', 'user-acceptance-handoff.md');
const goalAuditOutputPath = join(root, 'docs', 'acceptance', 'goal-completion-audit.md');

export interface UserAcceptanceHandoffCliOptions {
  outputPath: string;
  mode?: UserAcceptanceMode;
  repoRoot?: string;
}

export interface UserAcceptanceHandoffRunOptions extends UserAcceptanceHandoffCliOptions {
  isDefaultOutputPath: boolean;
}

export interface UserAcceptanceHandoffRunInput {
  options: UserAcceptanceHandoffRunOptions;
  generatedAt: string;
  buildGoalAuditItems: () => Promise<GoalAuditItem[]>;
  writeGoalAudit?: (outputPath: string, markdown: string) => Promise<void>;
  writeHandoff: (outputPath: string, markdown: string) => Promise<void>;
  writeStdout: (markdown: string) => void;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isUserAcceptanceHandoffHelpRequest(args)) {
    process.stdout.write(userAcceptanceHandoffHelpText());
    return 0;
  }

  const options = parseUserAcceptanceHandoffArgs(args);

  return runUserAcceptanceHandoff({
    options: {
      ...options,
      isDefaultOutputPath: options.outputPath === defaultOutputPath
    },
    generatedAt: new Date().toISOString(),
    buildGoalAuditItems: async () => buildGoalAuditItemsFromWorkspace({ root }),
    writeGoalAudit: writeGoalAuditDocument,
    writeHandoff: writeUserAcceptanceHandoff,
    writeStdout: (markdown) => {
      process.stdout.write(`${markdown}\n`);
    }
  });
}

export async function runUserAcceptanceHandoff(input: UserAcceptanceHandoffRunInput): Promise<number> {
  const mode = input.options.mode ?? 'browser';
  const repoPreflightChecks = input.options.repoRoot
    ? await buildUserAcceptanceHandoffRepoPreflightChecksForMode(input.options.repoRoot, mode)
    : undefined;
  const initialItems = await input.buildGoalAuditItems();
  const initialSummary = summarizeGoalAudit(initialItems);
  const initialMarkdown = buildUserAcceptanceHandoffMarkdownFromSummary({
    options: input.options,
    generatedAt: input.generatedAt,
    summary: initialSummary,
    items: initialItems,
    repoPreflightChecks
  });

  await input.writeHandoff(input.options.outputPath, initialMarkdown);

  const finalItems = input.options.isDefaultOutputPath
    ? await input.buildGoalAuditItems()
    : initialItems;
  const finalSummary = summarizeGoalAudit(finalItems);

  if (input.options.isDefaultOutputPath && input.writeGoalAudit) {
    await input.writeGoalAudit(goalAuditOutputPath, buildGoalAuditMarkdown({
      generatedAt: input.generatedAt,
      summary: finalSummary,
      items: finalItems
    }));
  }

  const finalMarkdown = buildUserAcceptanceHandoffMarkdownFromSummary({
    options: input.options,
    generatedAt: input.generatedAt,
    summary: finalSummary,
    items: finalItems,
    repoPreflightChecks
  });

  if (finalMarkdown !== initialMarkdown) {
    await input.writeHandoff(input.options.outputPath, finalMarkdown);
  }

  input.writeStdout(finalMarkdown);

  return finalSummary.missing === 0 && !hasRequiredRepoPreflightBlocker(repoPreflightChecks) ? 0 : 1;
}

export function parseUserAcceptanceHandoffArgs(args: string[]): UserAcceptanceHandoffCliOptions {
  let outputPath = defaultOutputPath;
  let mode: UserAcceptanceMode = 'browser';
  let repoRoot: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--mode' || arg.startsWith('--mode=')) {
      const value = readOptionValue(args, index, '--mode');
      mode = parseMode(value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--repo' || arg.startsWith('--repo=')) {
      const value = readOptionValue(args, index, '--repo');
      repoRoot = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown user handoff option: ${arg}`);
  }

  return {
    outputPath,
    mode,
    ...(repoRoot ? { repoRoot } : {})
  };
}

export function isUserAcceptanceHandoffHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function userAcceptanceHandoffHelpText(): string {
  return `hardening user acceptance handoff

Usage:
  pnpm user:handoff
  pnpm user:handoff -- --repo <repo>
  pnpm user:handoff -- --mode cli --repo <python-cli-repo>
  pnpm user:handoff -- --output <path>
  pnpm user:handoff -- --help

Options:
  --repo <repo>            Render concrete user:accept commands for an existing repo path.
  --mode <browser|cli>     Acceptance mode for repo preflight and suggested commands. Default: browser.
  --output <path>          Write the handoff package to a custom path. Default: docs/acceptance/user-acceptance-handoff.md.
  --help, -h               Show this help.

`;
}

export async function writeUserAcceptanceHandoff(outputPath: string, markdown: string): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown);
}

export async function writeGoalAuditDocument(outputPath: string, markdown: string): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown);
}

export async function buildUserAcceptanceHandoffRepoPreflightChecks(repoRoot: string): Promise<UserAcceptanceCheck[]> {
  return buildUserAcceptanceHandoffRepoPreflightChecksForMode(repoRoot, 'browser');
}

export async function buildUserAcceptanceHandoffRepoPreflightChecksForMode(
  repoRoot: string,
  mode: UserAcceptanceMode
): Promise<UserAcceptanceCheck[]> {
  return buildUserAcceptanceRepoPreflightChecks(repoRoot, { mode });
}

if (isDirectRun(import.meta.url, process.argv[1])) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('User acceptance handoff failed', error)}\n`);
    process.exitCode = 1;
  });
}

export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean {
  return argvPath !== undefined && fileURLToPath(moduleUrl) === resolve(argvPath);
}

function hasRequiredRepoPreflightBlocker(checks: UserAcceptanceCheck[] | undefined): boolean {
  return checks?.some((check) => check.required && check.status !== 'passed') ?? false;
}

function buildUserAcceptanceHandoffMarkdownFromSummary(input: {
  options: UserAcceptanceHandoffRunOptions;
  generatedAt: string;
  summary: GoalAuditSummary;
  items: GoalAuditItem[];
  repoPreflightChecks: UserAcceptanceCheck[] | undefined;
}): string {
  const qualityGateItem = findAcceptanceRunQualityGateItem(input.items);
  const architectureItems = findArchitectureMigrationItems(input.items);
  const userAcceptanceItem = findUserAcceptanceGoalItem(input.items);

  return buildUserAcceptanceHandoffMarkdown({
    generatedAt: input.generatedAt,
    overallStatus: input.summary.overallStatus,
    automaticPassed: input.summary.passed,
    automaticMissing: input.summary.missing,
    manualRequired: input.summary.manualRequired,
    goalAuditPath: 'docs/acceptance/goal-completion-audit.md',
    userAcceptanceRecordPath: 'docs/acceptance/user-acceptance-record.md',
    userAcceptanceGuidePath: 'docs/acceptance/guides/user-acceptance-guide.md',
    acceptanceChecklistPath: 'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
    ...(qualityGateItem ? { qualityGateItem } : {}),
    ...(architectureItems.length > 0 ? { architectureItems } : {}),
    ...(userAcceptanceItem ? { userAcceptanceItem } : {}),
    mode: input.options.mode ?? 'browser',
    ...(input.options.repoRoot ? { repoRoot: input.options.repoRoot } : {}),
    ...(input.repoPreflightChecks ? { repoPreflightChecks: input.repoPreflightChecks } : {})
  });
}

function parseMode(value: string): UserAcceptanceMode {
  if (value === 'browser' || value === 'cli') {
    return value;
  }

  throw new Error('--mode must be browser or cli');
}

function findAcceptanceRunQualityGateItem(items: GoalAuditItem[]): GoalAuditItem | undefined {
  return items.find((item) => item.category === '质量门禁' && item.requirement === '完整验收门禁通过');
}

function findArchitectureMigrationItems(items: GoalAuditItem[]): GoalAuditItem[] {
  return items.filter((item) => item.category === '架构迁移');
}

function findUserAcceptanceGoalItem(items: GoalAuditItem[]): GoalAuditItem | undefined {
  return items.find((item) => item.category === '用户验收' && item.requirement === '用户确认 MVP 符合预期');
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
