import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const prohibitedActions = [
  'write_progress_state',
  'fix_documents',
  'deployment',
  'public_release',
  'repository_visibility_change',
  'npm_publication',
  'github_release',
  'target_repo_write',
  'customer_contact',
  'pricing_change',
  'spend_change'
] as const;

const documentChecks = [
  {
    id: 'progress_markdown_next_goal',
    path: '.autopilot/progress/PROGRESS_SNAPSHOT.md',
    matches: matchesProgressMarkdown
  },
  {
    id: 'plan_next_goal',
    path: 'docs/PLAN.md',
    matches: matchesPlan
  },
  {
    id: 'readme_next_goal',
    path: 'README.md',
    matches: matchesCurrentNarrative
  },
  {
    id: 'prd_next_goal',
    path: 'docs/PRD.md',
    matches: matchesCurrentNarrative
  },
  {
    id: 'spec_next_goal',
    path: 'docs/SPEC.md',
    matches: matchesCurrentNarrative
  }
] as const;

export interface AutopilotProgressConsistencyCliOptions {
  root?: string;
  json: boolean;
}

export interface AutopilotProgressConsistencyRunInput {
  root?: string;
}

export interface AutopilotProgressConsistencyGoal {
  id: string;
  title: string;
  status: string;
}

export interface AutopilotProgressConsistencyCheck {
  id: string;
  path: string;
  status: 'passed' | 'failed';
  expected: string;
  actual: string;
}

export interface AutopilotProgressConsistencyReport {
  schema: 'repoassure.autopilot-progress-consistency@1';
  status: 'consistent' | 'inconsistent';
  canonicalGoal: AutopilotProgressConsistencyGoal;
  checks: AutopilotProgressConsistencyCheck[];
  boundary: {
    localOnly: true;
    readOnly: true;
    targetRepoWriteAuthorized: false;
    prohibitedActions: readonly string[];
  };
}

interface JsonReadResult {
  value?: Record<string, unknown>;
  actual: string;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isAutopilotProgressConsistencyHelpRequest(args)) {
    process.stdout.write(autopilotProgressConsistencyHelpText());
    return 0;
  }

  try {
    const options = parseAutopilotProgressConsistencyArgs(args);
    const report = await runAutopilotProgressConsistency(options);
    process.stdout.write(`${JSON.stringify(report, null, options.json ? 2 : 0)}\n`);
    return report.status === 'consistent' ? 0 : 1;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Autopilot progress consistency check failed', error)}\n`);
    return 1;
  }
}

export function parseAutopilotProgressConsistencyArgs(
  args: string[]
): AutopilotProgressConsistencyCliOptions {
  let root: string | undefined;
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--json') {
      json = true;
      continue;
    }

    if (arg === '--root' || arg.startsWith('--root=')) {
      const option = readOptionValue(args, index, '--root');
      root = resolve(option.value);
      index += option.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown Autopilot progress consistency option: ${arg}`);
  }

  return {
    ...(root ? { root } : {}),
    json
  };
}

export function isAutopilotProgressConsistencyHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function autopilotProgressConsistencyHelpText(): string {
  return [
    'Usage: pnpm autopilot:progress:check -- [options]',
    '',
    'Read-only checks:',
    '  goal index and active goal record',
    '  progress snapshot active/next goal',
    '  progress Markdown, PLAN, README, PRD, and SPEC current-goal narrative',
    '',
    'Options:',
    '  --root <path>  Repository root to inspect',
    '  --json         Pretty-print the JSON report',
    '  --help, -h     Show this help',
    '',
    'This command never edits progress state or documentation.',
    ''
  ].join('\n');
}

export async function runAutopilotProgressConsistency(
  input: AutopilotProgressConsistencyRunInput = {}
): Promise<AutopilotProgressConsistencyReport> {
  const root = resolve(input.root ?? defaultRoot);
  const indexPath = '.autopilot/goals/index.json';
  const indexResult = await readJsonObject(join(root, indexPath));
  const activeGoalId = readString(indexResult.value?.active_goal_id) ?? '';
  const indexGoals = Array.isArray(indexResult.value?.goals) ? indexResult.value.goals : [];
  const indexEntry = indexGoals
    .map(readObject)
    .find((entry) => readString(entry?.id) === activeGoalId);
  const goalPath = readString(indexEntry?.path)
    ?? (activeGoalId ? `.autopilot/goals/${activeGoalId}.json` : '.autopilot/goals/<active-goal>.json');
  const goalResult = activeGoalId
    ? await readJsonObject(join(root, goalPath))
    : { actual: 'active_goal_id missing' };
  const canonicalGoal: AutopilotProgressConsistencyGoal = {
    id: activeGoalId,
    title: readString(goalResult.value?.title) ?? '',
    status: readString(indexEntry?.status) ?? ''
  };
  const checks: AutopilotProgressConsistencyCheck[] = [];

  const goalRecord = goalResult.value;
  const goalRecordMatches = Boolean(
    canonicalGoal.id
    && canonicalGoal.title
    && canonicalGoal.status
    && readString(goalRecord?.id) === canonicalGoal.id
    && readString(goalRecord?.status) === canonicalGoal.status
  );
  checks.push(buildCheck({
    id: 'goal_index_record',
    path: `${indexPath} -> ${goalPath}`,
    passed: goalRecordMatches,
    expected: formatGoal(canonicalGoal),
    actual: goalRecordMatches
      ? formatGoal(canonicalGoal)
      : `${indexResult.actual}; ${goalResult.actual}`
  }));

  const snapshotPath = '.autopilot/progress/snapshot.json';
  const snapshotResult = await readJsonObject(join(root, snapshotPath));
  for (const field of ['active_goal', 'next_goal'] as const) {
    const snapshotGoal = readObject(snapshotResult.value?.[field]);
    const actualGoal = readGoal(snapshotGoal);
    checks.push(buildCheck({
      id: `snapshot_${field}`,
      path: snapshotPath,
      passed: goalsEqual(canonicalGoal, actualGoal),
      expected: formatGoal(canonicalGoal),
      actual: snapshotGoal ? formatGoal(actualGoal) : snapshotResult.actual
    }));
  }

  for (const definition of documentChecks) {
    const document = await readText(join(root, definition.path));
    checks.push(buildCheck({
      id: definition.id,
      path: definition.path,
      passed: document.content !== undefined
        && definition.matches(document.content, canonicalGoal),
      expected: `${canonicalGoal.title} (${canonicalGoal.status})`,
      actual: document.content === undefined
        ? document.actual
        : summarizeDocumentAssertion(document.content, canonicalGoal.title)
    }));
  }

  return {
    schema: 'repoassure.autopilot-progress-consistency@1',
    status: checks.every((check) => check.status === 'passed') ? 'consistent' : 'inconsistent',
    canonicalGoal,
    checks,
    boundary: {
      localOnly: true,
      readOnly: true,
      targetRepoWriteAuthorized: false,
      prohibitedActions
    }
  };
}

function matchesProgressMarkdown(
  content: string,
  goal: AutopilotProgressConsistencyGoal
): boolean {
  if (!goal.title) {
    return false;
  }
  const section = content.match(/^## Next Goal\s*$([\s\S]*?)(?=^## |(?![\s\S]))/imu)?.[1] ?? '';
  return nonEmptyLines(section)[0] === goal.title;
}

function matchesPlan(content: string, goal: AutopilotProgressConsistencyGoal): boolean {
  if (!goal.title || !goal.status) {
    return false;
  }
  const section = content.match(/^## Active \/ Next Codex Goal\s*$([\s\S]*?)(?=^## |(?![\s\S]))/imu)?.[1] ?? '';
  const assertion = nonEmptyLines(section).find((line) => line.startsWith('Next Codex Goal:'));
  if (!assertion) {
    return false;
  }

  const normalizedStatus = goal.status.replaceAll('_', ' ');
  return assertion.includes(goal.title)
    && assertion.toLowerCase().includes(normalizedStatus.toLowerCase());
}

function matchesCurrentNarrative(
  content: string,
  goal: AutopilotProgressConsistencyGoal
): boolean {
  if (!goal.title) {
    return false;
  }
  const assertions = nonEmptyLines(content).filter((line) => (
    /current next(?: safe automatic| local-only)? (?:goal|implementation target)/iu.test(line)
    || /当前下一个(?:安全自动)?目标/u.test(line)
  ));

  return assertions[0]?.includes(goal.title) ?? false;
}

function summarizeDocumentAssertion(content: string, title: string): string {
  const lines = nonEmptyLines(content);
  const matching = lines.find((line) => line.includes(title));
  return matching ? matching.slice(0, 240) : 'current goal assertion missing or mismatched';
}

function nonEmptyLines(content: string): string[] {
  return content
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function goalsEqual(
  expected: AutopilotProgressConsistencyGoal,
  actual: AutopilotProgressConsistencyGoal
): boolean {
  return expected.id.length > 0
    && expected.title.length > 0
    && expected.status.length > 0
    && expected.id === actual.id
    && expected.title === actual.title
    && expected.status === actual.status;
}

function readGoal(value: Record<string, unknown> | undefined): AutopilotProgressConsistencyGoal {
  return {
    id: readString(value?.id) ?? '',
    title: readString(value?.title) ?? '',
    status: readString(value?.status) ?? ''
  };
}

function formatGoal(goal: AutopilotProgressConsistencyGoal): string {
  return `${goal.id}|${goal.title}|${goal.status}`;
}

function buildCheck(input: {
  id: string;
  path: string;
  passed: boolean;
  expected: string;
  actual: string;
}): AutopilotProgressConsistencyCheck {
  return {
    id: input.id,
    path: input.path,
    status: input.passed ? 'passed' : 'failed',
    expected: input.expected,
    actual: input.actual
  };
}

async function readJsonObject(path: string): Promise<JsonReadResult> {
  const text = await readText(path);
  if (text.content === undefined) {
    return { actual: text.actual };
  }

  try {
    const value = readObject(JSON.parse(text.content) as unknown);
    return value
      ? { value, actual: 'loaded' }
      : { actual: 'invalid JSON object' };
  } catch {
    return { actual: 'invalid JSON' };
  }
}

async function readText(path: string): Promise<{ content?: string; actual: string }> {
  try {
    return {
      content: await readFile(path, 'utf8'),
      actual: 'loaded'
    };
  } catch (error: unknown) {
    return {
      actual: isMissingFileError(error) ? 'missing' : 'unreadable'
    };
  }
}

function readObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isMissingFileError(error: unknown): boolean {
  return readObject(error)?.code === 'ENOENT';
}

function readOptionValue(
  args: string[],
  index: number,
  optionName: string
): { value: string; consumedNext: boolean } {
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

export function isDirectRun(
  metaUrl: string = import.meta.url,
  argvPath: string | undefined = process.argv[1]
): boolean {
  return Boolean(argvPath && metaUrl === new URL(`file://${resolve(argvPath)}`).href);
}

if (isDirectRun()) {
  process.exitCode = await main();
}
