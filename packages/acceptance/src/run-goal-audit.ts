import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { buildGoalAuditMarkdown, summarizeGoalAudit, type GoalAuditItem } from './goal-audit.js';
import { buildCurrentGoalAuditItemsFromSources } from './goal-audit-current-items.js';
import { readGoalAuditTextSources } from './goal-audit-sources.js';
import { classifyUserAcceptanceRecord } from './user-acceptance-record.js';

export { REQUIRED_DOCUMENT_PATHS } from './goal-audit-requirements.js';
export {
  classifyUserAcceptanceRecord,
  isAcceptanceRunFreshEnough,
  isAcceptedUserAcceptanceRecord,
  type UserAcceptanceRecordCheckOptions,
  type UserAcceptanceRecordStatus
} from './user-acceptance-record.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const outputPath = join(root, 'docs', 'acceptance', 'goal-completion-audit.md');

export interface GoalAuditRunInput {
  generatedAt: string;
  buildGoalAuditItems: () => Promise<GoalAuditItem[]>;
  writeGoalAudit: (outputPath: string, markdown: string) => Promise<void>;
  writeStdout: (markdown: string) => void;
}

export interface GoalAuditWorkspaceInput {
  root: string;
  readText?: (path: string) => Promise<string>;
  pathExists?: (path: string) => Promise<boolean>;
  pathExistsSync?: (path: string) => boolean;
}

export async function main(): Promise<number> {
  return runGoalAudit({
    generatedAt: new Date().toISOString(),
    buildGoalAuditItems: buildCurrentGoalAuditItems,
    writeGoalAudit: writeGoalAuditDocument,
    writeStdout: (markdown) => {
      process.stdout.write(`${markdown}\n`);
    }
  });
}

export async function runGoalAudit(input: GoalAuditRunInput): Promise<number> {
  const items = await input.buildGoalAuditItems();
  const summary = summarizeGoalAudit(items);
  const markdown = buildGoalAuditMarkdown({
    generatedAt: input.generatedAt,
    summary,
    items
  });

  await input.writeGoalAudit(outputPath, markdown);
  input.writeStdout(markdown);

  return summary.missing === 0 ? 0 : 1;
}

export async function writeGoalAuditDocument(targetPath: string, markdown: string): Promise<void> {
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, markdown);
}

export async function buildCurrentGoalAuditItems(): Promise<GoalAuditItem[]> {
  return buildGoalAuditItemsFromWorkspace({ root });
}

export async function buildGoalAuditItemsFromWorkspace(input: GoalAuditWorkspaceInput): Promise<GoalAuditItem[]> {
  const readText = input.readText ?? readUtf8Text;
  const pathExists = input.pathExists ?? fileExists;
  const sources = await readGoalAuditTextSources({
    root: input.root,
    readText
  });
  const userAcceptanceStatus = classifyUserAcceptanceRecord(sources.userAcceptanceRecord, {
    pathExists: input.pathExistsSync ?? existsSync,
    goalLastUpdatedText: sources.codexGoal
  });

  return buildCurrentGoalAuditItemsFromSources({
    sources,
    pathExists: async (path) => pathExists(join(input.root, path)),
    userAcceptanceStatus
  });
}

if (isDirectRun(import.meta.url, process.argv[1])) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('Goal audit failed', error)}\n`);
    process.exitCode = 1;
  });
}

export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean {
  return argvPath !== undefined && fileURLToPath(moduleUrl) === resolve(argvPath);
}

async function readUtf8Text(path: string): Promise<string> {
  return readFile(path, 'utf8');
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
