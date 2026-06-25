import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type { RepairHandoffPackage, RepairHandoffTask } from './run-repair-handoff.js';
import { parseShellWords } from './shell-words.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultTimeoutMs = 120_000;
const defaultMaxOutputChars = 2_000;

export type RepairExecuteMode = 'dry-run' | 'validation-only';
export type RepairExecutionStatus = 'planned' | 'passed' | 'failed';

export interface RepairExecuteCliOptions {
  packagePath: string;
  taskIds: string[];
  all: boolean;
  dryRun: boolean;
  validationOnly: boolean;
  outputDir?: string;
  timeoutMs: number;
  maxOutputChars: number;
}

export interface RepairExecuteRunInput {
  packagePath: string;
  taskIds?: string[];
  all?: boolean;
  dryRun?: boolean;
  validationOnly?: boolean;
  outputDir?: string;
  timeoutMs?: number;
  maxOutputChars?: number;
  generatedAt?: string;
  env?: NodeJS.ProcessEnv;
}

export interface RepairExecuteRunResult {
  reportPath: string;
  markdownPath: string;
  taskCount: number;
  status: RepairExecutionStatus;
}

export interface RepairVerificationCommandResult {
  taskId: string;
  command: string;
  exitCode: number | null;
  timedOut: boolean;
  stdout: string;
  stderr: string;
}

export interface RepairExecutionTaskReport {
  taskId: string;
  priority: string;
  objective: string;
  executionStatus: RepairExecutionStatus;
  mode: RepairExecuteMode;
  verificationCommands: string[];
  verificationResults: RepairVerificationCommandResult[];
  handoffPrompt: string;
  nextAction: string;
}

export interface RepairExecutionReport {
  schemaVersion: 1;
  generatedAt: string;
  mode: RepairExecuteMode;
  status: RepairExecutionStatus;
  packagePath: string;
  repoRoot: string;
  runId: string;
  summary: {
    selectedTasks: number;
    verificationCommands: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  agentContract: RepairExecutionAgentContract;
  tasks: RepairExecutionTaskReport[];
}

export interface RepairExecutionAgentContract {
  schema: 'repoassure.repair-execution-report.v1';
  readOrder: string[];
  resultSemantics: {
    planned: string;
    passed: string;
    failed: string;
  };
  nextCommands: {
    patchPlan: string;
  };
  boundaries: string[];
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isRepairExecuteHelpRequest(args)) {
    process.stdout.write(repairExecuteHelpText());
    return 0;
  }

  const options = parseRepairExecuteArgs(args);
  const result = await runRepairExecute(options);

  process.stdout.write(formatRepairExecuteCliSummary(result));
  return 0;
}

export function parseRepairExecuteArgs(args: string[]): RepairExecuteCliOptions {
  let packagePath: string | undefined;
  let outputDir: string | undefined;
  const taskIds: string[] = [];
  let all = false;
  let dryRun = false;
  let validationOnly = false;
  let timeoutMs = defaultTimeoutMs;
  let maxOutputChars = defaultMaxOutputChars;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--package' || arg.startsWith('--package=')) {
      const value = readOptionValue(args, index, '--package');
      packagePath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--task' || arg.startsWith('--task=')) {
      const value = readOptionValue(args, index, '--task');
      taskIds.push(value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--all') {
      all = true;
      continue;
    }

    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg === '--validation-only') {
      validationOnly = true;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--timeout-ms' || arg.startsWith('--timeout-ms=')) {
      const value = readOptionValue(args, index, '--timeout-ms');
      timeoutMs = parsePositiveInteger(value.value, '--timeout-ms');
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--max-output-chars' || arg.startsWith('--max-output-chars=')) {
      const value = readOptionValue(args, index, '--max-output-chars');
      maxOutputChars = parsePositiveInteger(value.value, '--max-output-chars');
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown repair execute option: ${arg}`);
  }

  if (!packagePath) {
    throw new Error('--package <repair-handoff-package.json> is required');
  }

  if (!all && taskIds.length === 0) {
    throw new Error('--task <taskId> or --all is required');
  }

  if (all && taskIds.length > 0) {
    throw new Error('--task and --all cannot be combined');
  }

  if (dryRun && validationOnly) {
    throw new Error('--dry-run and --validation-only cannot be combined');
  }

  return {
    packagePath,
    taskIds,
    all,
    dryRun,
    validationOnly: validationOnly || !dryRun,
    timeoutMs,
    maxOutputChars,
    ...(outputDir ? { outputDir } : {})
  };
}

export function isRepairExecuteHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function repairExecuteHelpText(): string {
  return `hardening repair execute

Usage:
  pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --dry-run
  pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --validation-only
  pnpm repair:execute -- --package <repair-handoff-package.json> --all --validation-only
  pnpm repair:execute -- --help

Options:
  --package <path>             repair-handoff-package.json path.
  --task <taskId>              Select one task. Repeatable.
  --all                        Select every task.
  --dry-run                    Write an execution plan without running verification commands.
  --validation-only            Run verification commands only; does not edit the target repo.
  --output <dir>               Output directory. Defaults next to the package file.
  --timeout-ms <ms>            Per-command timeout. Default: ${defaultTimeoutMs}.
  --max-output-chars <n>       Max stdout/stderr chars per stream. Default: ${defaultMaxOutputChars}.
  --help, -h                   Show this help.

`;
}

export async function runRepairExecute(input: RepairExecuteRunInput): Promise<RepairExecuteRunResult> {
  const pkg = JSON.parse(await readFile(input.packagePath, 'utf8')) as RepairHandoffPackage;
  const selectedTasks = selectRepairTasks(pkg, {
    taskIds: input.taskIds ?? [],
    all: input.all ?? false
  });
  const mode = input.dryRun ? 'dry-run' : 'validation-only';
  const verificationResults = mode === 'validation-only'
    ? await runVerificationCommands({
      tasks: selectedTasks,
      cwd: pkg.repoRoot,
      timeoutMs: input.timeoutMs ?? defaultTimeoutMs,
      maxOutputChars: input.maxOutputChars ?? defaultMaxOutputChars,
      env: buildVerificationEnvironment(pkg.repoRoot, input.env ?? process.env)
    })
    : [];
  const report = buildRepairExecutionReport({
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    packagePath: input.packagePath,
    mode,
    pkg,
    selectedTaskIds: selectedTasks.map((task) => task.taskId),
    verificationResults
  });
  const outputDir = input.outputDir ?? dirname(input.packagePath);
  const reportPath = join(outputDir, 'repair-execution-report.json');
  const markdownPath = join(outputDir, 'repair-execution-report.md');

  await mkdir(outputDir, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(markdownPath, formatRepairExecutionReportMarkdown(report));

  return {
    reportPath,
    markdownPath,
    taskCount: selectedTasks.length,
    status: report.status
  };
}

export function buildRepairExecutionReport(input: {
  generatedAt: string;
  packagePath: string;
  mode: RepairExecuteMode;
  pkg: RepairHandoffPackage;
  selectedTaskIds: string[];
  verificationResults: RepairVerificationCommandResult[];
}): RepairExecutionReport {
  const selectedTasks = selectRepairTasks(input.pkg, {
    taskIds: input.selectedTaskIds,
    all: false
  });
  const taskReports = selectedTasks.map((task) => buildTaskReport(input.mode, task, input.verificationResults));
  const failed = input.verificationResults.filter((result) => result.exitCode !== 0 || result.timedOut).length;
  const passed = input.verificationResults.filter((result) => result.exitCode === 0 && !result.timedOut).length;
  const skipped = input.mode === 'dry-run' ? selectedTasks.length : 0;
  const status: RepairExecutionStatus = input.mode === 'dry-run'
    ? 'planned'
    : failed > 0 ? 'failed' : 'passed';

  return {
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    mode: input.mode,
    status,
    packagePath: cleanText(input.packagePath),
    repoRoot: cleanText(input.pkg.repoRoot),
    runId: cleanText(input.pkg.runId),
    summary: {
      selectedTasks: selectedTasks.length,
      verificationCommands: input.verificationResults.length,
      passed,
      failed,
      skipped
    },
    agentContract: buildRepairExecutionAgentContract(),
    tasks: taskReports
  };
}

export function formatRepairExecutionReportMarkdown(report: RepairExecutionReport): string {
  return `# Repair Execution Report

| Field | Value |
| --- | --- |
| Mode | ${report.mode} |
| Status | ${report.status} |
| Repo Root | ${report.repoRoot} |
| Run ID | ${report.runId} |
| Selected Tasks | ${report.summary.selectedTasks} |
| Verification Commands | ${report.summary.verificationCommands} |
| Passed | ${report.summary.passed} |
| Failed | ${report.summary.failed} |
| Skipped | ${report.summary.skipped} |

## Agent Contract

- Schema: ${report.agentContract.schema}
- Read order: ${report.agentContract.readOrder.join(', ')}
- Planned: ${report.agentContract.resultSemantics.planned}
- Passed: ${report.agentContract.resultSemantics.passed}
- Failed: ${report.agentContract.resultSemantics.failed}
- Patch plan: ${report.agentContract.nextCommands.patchPlan}
- Boundaries: ${report.agentContract.boundaries.join(' ')}

${report.tasks.map(formatTaskMarkdown).join('\n\n')}
`;
}

function buildRepairExecutionAgentContract(): RepairExecutionAgentContract {
  return {
    schema: 'repoassure.repair-execution-report.v1',
    readOrder: [
      'status',
      'summary',
      'tasks[]',
      'tasks[].executionStatus',
      'tasks[].verificationResults',
      'tasks[].nextAction'
    ],
    resultSemantics: {
      planned: 'No verification commands were run.',
      passed: 'All selected verification commands exited zero.',
      failed: 'At least one selected verification command failed or timed out.'
    },
    nextCommands: {
      patchPlan: 'pnpm repair:patch-plan -- --report <repair-execution-report.json>'
    },
    boundaries: [
      'Validation-only mode does not modify target repository files.',
      'Reports contain redacted command output summaries, not raw secrets.',
      'A failed report is evidence for patch planning, not permission to auto-edit.'
    ]
  };
}

function buildTaskReport(
  mode: RepairExecuteMode,
  task: RepairHandoffTask,
  allResults: RepairVerificationCommandResult[]
): RepairExecutionTaskReport {
  const verificationResults = allResults.filter((result) => result.taskId === task.taskId);
  const failed = verificationResults.some((result) => result.exitCode !== 0 || result.timedOut);
  const executionStatus: RepairExecutionStatus = mode === 'dry-run'
    ? 'planned'
    : failed ? 'failed' : 'passed';

  return {
    taskId: task.taskId,
    priority: task.priority,
    objective: cleanText(task.objective),
    executionStatus,
    mode,
    verificationCommands: task.verification.commands.map(cleanText),
    verificationResults,
    handoffPrompt: cleanText(task.handoffPrompt),
    nextAction: formatTaskNextAction(mode, executionStatus)
  };
}

async function runVerificationCommands(input: {
  tasks: RepairHandoffTask[];
  cwd: string;
  timeoutMs: number;
  maxOutputChars: number;
  env: NodeJS.ProcessEnv;
}): Promise<RepairVerificationCommandResult[]> {
  const results: RepairVerificationCommandResult[] = [];

  for (const task of input.tasks) {
    for (const command of task.verification.commands) {
      results.push(await runVerificationCommand({
        taskId: task.taskId,
        command,
        cwd: input.cwd,
        timeoutMs: input.timeoutMs,
        maxOutputChars: input.maxOutputChars,
        env: input.env
      }));
    }
  }

  return results;
}

function runVerificationCommand(input: {
  taskId: string;
  command: string;
  cwd: string;
  timeoutMs: number;
  maxOutputChars: number;
  env: NodeJS.ProcessEnv;
}): Promise<RepairVerificationCommandResult> {
  const words = parseShellWords(input.command);

  if (!words) {
    return Promise.resolve({
      taskId: input.taskId,
      command: cleanText(input.command),
      exitCode: null,
      timedOut: false,
      stdout: '',
      stderr: 'Unable to parse verification command'
    });
  }

  const [command, ...args] = words;

  if (!command) {
    throw new Error(`Verification command is empty for task ${input.taskId}`);
  }

  return new Promise((resolveCommand) => {
    const child = spawn(command, args, {
      cwd: input.cwd,
      env: input.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, input.timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout = truncateOutput(`${stdout}${chunk}`, input.maxOutputChars);
    });
    child.stderr.on('data', (chunk: string) => {
      stderr = truncateOutput(`${stderr}${chunk}`, input.maxOutputChars);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolveCommand({
        taskId: input.taskId,
        command: cleanText(input.command),
        exitCode: null,
        timedOut,
        stdout: '',
        stderr: cleanText(`${error.name}: ${error.message}`)
      });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolveCommand({
        taskId: input.taskId,
        command: cleanText(input.command),
        exitCode: code,
        timedOut,
        stdout: cleanText(stdout),
        stderr: cleanText(stderr)
      });
    });
  });
}

function selectRepairTasks(pkg: RepairHandoffPackage, options: { taskIds: string[]; all: boolean }): RepairHandoffTask[] {
  if (options.all) {
    return pkg.tasks;
  }

  const selected = options.taskIds.map((taskId) => {
    const task = pkg.tasks.find((candidate) => candidate.taskId === taskId);
    if (!task) {
      throw new Error(`Unknown repair task: ${taskId}`);
    }

    return task;
  });

  return selected;
}

function formatTaskMarkdown(task: RepairExecutionTaskReport): string {
  const results = task.verificationResults.length > 0
    ? task.verificationResults.map((result) => `- \`${result.command}\`: ${formatResultStatus(result)} exit=${result.exitCode ?? 'n/a'} ${formatResultOutput(result)}`).join('\n')
    : '- Not executed.';

  return `## ${task.taskId}

- Status: ${task.executionStatus}
- Priority: ${task.priority}
- Objective: ${task.objective}
- Next Action: ${task.nextAction}

### Verification Results

${results}
`;
}

function formatResultStatus(result: RepairVerificationCommandResult): 'passed' | 'failed' {
  return result.exitCode === 0 && !result.timedOut ? 'passed' : 'failed';
}

function formatResultOutput(result: RepairVerificationCommandResult): string {
  const output = result.stdout || result.stderr;
  return output ? output : 'n/a';
}

function formatTaskNextAction(mode: RepairExecuteMode, status: RepairExecutionStatus): string {
  if (mode === 'dry-run') {
    return 'Review the selected task, then rerun with --validation-only or hand the task to an AI IDE for code changes.';
  }

  if (status === 'passed') {
    return 'Re-run user acceptance and regenerate repair handoff to confirm this task disappears.';
  }

  return 'Use the failed verification output as evidence for the next code repair step.';
}

function formatRepairExecuteCliSummary(result: RepairExecuteRunResult): string {
  return [
    '# Repair Execute',
    '',
    `- Report: ${result.reportPath}`,
    `- Markdown: ${result.markdownPath}`,
    `- Tasks: ${result.taskCount}`,
    `- Status: ${result.status}`,
    ''
  ].join('\n');
}

function readOptionValue(args: string[], index: number, optionName: string): { value: string; consumedNext: boolean } {
  const arg = args[index];
  const inlinePrefix = `${optionName}=`;

  if (arg?.startsWith(inlinePrefix)) {
    const value = arg.slice(inlinePrefix.length);
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

function parsePositiveInteger(value: string, optionName: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${optionName} must be a positive integer`);
  }

  return parsed;
}

function truncateOutput(value: string, maxOutputChars: number): string {
  return value.length > maxOutputChars ? value.slice(0, maxOutputChars) : value;
}

function buildVerificationEnvironment(cwd: string, env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const venvBin = join(cwd, '.venv', 'bin');
  const currentPath = env.PATH ?? '';

  return {
    ...env,
    PATH: currentPath ? `${venvBin}${delimiter}${currentPath}` : venvBin
  };
}

function cleanText(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

if (isDirectRun(import.meta.url, process.argv[1])) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('Repair execute runner failed', error)}\n`);
    process.exitCode = 1;
  });
}

export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean {
  return argvPath !== undefined && fileURLToPath(moduleUrl) === resolve(argvPath);
}
