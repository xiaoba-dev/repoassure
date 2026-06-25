import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type { RepairExecutionReport, RepairVerificationCommandResult } from './run-repair-execute.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export type PatchActionType = 'import-sort' | 'format-fix' | 'type-fix' | 'config-fix' | 'test-fix' | 'manual-investigation';
export type PatchRisk = 'low' | 'medium' | 'high';
export type PatchPlanStatus = 'no_actions' | 'review_required';

export interface RepairPatchPlanCliOptions {
  reportPath: string;
  outputDir?: string;
}

export interface RepairPatchPlanRunInput extends RepairPatchPlanCliOptions {
  generatedAt?: string;
}

export interface RepairPatchPlanRunResult {
  planPath: string;
  markdownPath: string;
  actionCount: number;
  autoFixCandidates: number;
  status: PatchPlanStatus;
}

export interface PatchAction {
  actionId: string;
  taskId: string;
  command: string;
  actionType: PatchActionType;
  title: string;
  targetFiles: string[];
  evidence: string;
  errorCode: string | null;
  rationale: string;
  recommendedChange: string;
  suggestedCommands: string[];
  autoFixCandidate: boolean;
  risk: PatchRisk;
  reviewNotes: string[];
}

export interface PatchPlan {
  schemaVersion: 1;
  generatedAt: string;
  status: PatchPlanStatus;
  executionReportPath: string;
  repoRoot: string;
  runId: string;
  summary: {
    totalActions: number;
    autoFixCandidates: number;
    manualReviewRequired: number;
    affectedFiles: number;
  };
  actions: PatchAction[];
  boundaries: string[];
  agentContract: PatchPlanAgentContract;
}

export interface PatchPlanAgentContract {
  schema: 'repoassure.patch-plan.v1';
  applyPolicy: 'manual-review-only';
  readOrder: string[];
  reviewWorkflow: string[];
  nextCommands: {
    validate: string;
  };
  boundaries: string[];
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isRepairPatchPlanHelpRequest(args)) {
    process.stdout.write(repairPatchPlanHelpText());
    return 0;
  }

  const options = parseRepairPatchPlanArgs(args);
  const result = await runRepairPatchPlan(options);

  process.stdout.write(formatRepairPatchPlanCliSummary(result));
  return 0;
}

export function parseRepairPatchPlanArgs(args: string[]): RepairPatchPlanCliOptions {
  let reportPath: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--report' || arg.startsWith('--report=')) {
      const value = readOptionValue(args, index, '--report');
      reportPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown repair patch plan option: ${arg}`);
  }

  if (!reportPath) {
    throw new Error('--report <repair-execution-report.json> is required');
  }

  return {
    reportPath,
    ...(outputDir ? { outputDir } : {})
  };
}

export function isRepairPatchPlanHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function repairPatchPlanHelpText(): string {
  return `hardening repair patch plan

Usage:
  pnpm repair:patch-plan -- --report <repair-execution-report.json>
  pnpm repair:patch-plan -- --report <repair-execution-report.json> --output <output-dir>
  pnpm repair:patch-plan -- --help

Options:
  --report <path>      repair-execution-report.json path.
  --output <dir>       Output directory. Defaults next to the report file.
  --help, -h           Show this help.

`;
}

export async function runRepairPatchPlan(input: RepairPatchPlanRunInput): Promise<RepairPatchPlanRunResult> {
  const report = JSON.parse(await readFile(input.reportPath, 'utf8')) as RepairExecutionReport;
  const plan = buildPatchPlan({
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    executionReportPath: input.reportPath,
    report
  });
  const outputDir = input.outputDir ?? dirname(input.reportPath);
  const planPath = join(outputDir, 'patch-plan.json');
  const markdownPath = join(outputDir, 'patch-plan.md');

  await mkdir(outputDir, { recursive: true });
  await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`);
  await writeFile(markdownPath, formatPatchPlanMarkdown(plan));

  return {
    planPath,
    markdownPath,
    actionCount: plan.summary.totalActions,
    autoFixCandidates: plan.summary.autoFixCandidates,
    status: plan.status
  };
}

export function buildPatchPlan(input: {
  generatedAt: string;
  executionReportPath: string;
  report: RepairExecutionReport;
}): PatchPlan {
  const actions = input.report.tasks.flatMap((task) => {
    return task.verificationResults
      .filter((result) => result.exitCode !== 0 || result.timedOut)
      .flatMap((result) => classifyVerificationResult(task.taskId, result));
  });
  const affectedFiles = new Set(actions.flatMap((action) => action.targetFiles));
  const autoFixCandidates = actions.filter((action) => action.autoFixCandidate).length;

  return {
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    status: actions.length > 0 ? 'review_required' : 'no_actions',
    executionReportPath: cleanText(input.executionReportPath),
    repoRoot: cleanText(input.report.repoRoot),
    runId: cleanText(input.report.runId),
    summary: {
      totalActions: actions.length,
      autoFixCandidates,
      manualReviewRequired: actions.length - autoFixCandidates,
      affectedFiles: affectedFiles.size
    },
    actions,
    boundaries: [
      'This patch plan does not modify target repository files.',
      'Review every action before applying edits in an AI IDE or editor.',
      'After applying any patch, rerun repair:execute --validation-only and user acceptance.'
    ],
    agentContract: buildPatchPlanAgentContract()
  };
}

export function formatPatchPlanMarkdown(plan: PatchPlan): string {
  const actions = plan.actions.length > 0
    ? plan.actions.map(formatPatchActionMarkdown).join('\n\n')
    : 'No patch actions were generated.';

  return `# Patch Plan

| Field | Value |
| --- | --- |
| Status | ${plan.status} |
| Repo Root | ${plan.repoRoot} |
| Run ID | ${plan.runId} |
| Total Actions | ${plan.summary.totalActions} |
| Auto-fix Candidates | ${plan.summary.autoFixCandidates} |
| Manual Review Required | ${plan.summary.manualReviewRequired} |
| Affected Files | ${plan.summary.affectedFiles} |

## Agent Contract

- Schema: ${plan.agentContract.schema}
- Apply policy: ${plan.agentContract.applyPolicy}
- Read order: ${plan.agentContract.readOrder.join(', ')}
- Review workflow: ${plan.agentContract.reviewWorkflow.join(' ')}
- Validate: ${plan.agentContract.nextCommands.validate}
- Boundaries: ${plan.agentContract.boundaries.join(' ')}

${actions}
`;
}

function buildPatchPlanAgentContract(): PatchPlanAgentContract {
  return {
    schema: 'repoassure.patch-plan.v1',
    applyPolicy: 'manual-review-only',
    readOrder: [
      'status',
      'summary',
      'actions[]',
      'actions[].targetFiles',
      'actions[].recommendedChange',
      'actions[].suggestedCommands',
      'actions[].reviewNotes'
    ],
    reviewWorkflow: [
      'Review each action before applying edits in an AI IDE or editor.',
      'Apply only the smallest relevant patch.',
      'Rerun validation-only and user acceptance after edits.'
    ],
    nextCommands: {
      validate: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --validation-only'
    },
    boundaries: [
      'Does not write target repository files.',
      'Does not run formatters, create commits, open PRs, or upload artifacts.',
      'Auto-fix candidates still require review before execution.'
    ]
  };
}

function classifyVerificationResult(taskId: string, result: RepairVerificationCommandResult): PatchAction[] {
  const rawOutput = redactSensitiveText(`${result.stdout}\n${result.stderr}`).trim();
  const output = cleanText(rawOutput);
  const lines = extractMypyErrorLines(rawOutput);

  if (/\bI001\b/u.test(output)) {
    return buildRuffImportSortActions(taskId, result, output);
  }

  if (lines.length > 0) {
    return lines.map((line, index) => buildMypyAction(taskId, result, line, index));
  }

  return [buildManualAction(taskId, result, output)];
}

function extractMypyErrorLines(output: string): string[] {
  const matches = [...output.matchAll(/([A-Za-z0-9_./-]+\.py:\d+:\s+error:\s+.*?\s+\[[a-z-]+\])(?=\s+[A-Za-z0-9_./-]+\.py:\d+:\s+error:|$)/gsu)];

  if (matches.length > 0) {
    return matches.map((match) => cleanText(match[1] ?? ''));
  }

  return output
    .split(/\r?\n/u)
    .map(cleanText)
    .filter((line) => /^[A-Za-z0-9_./-]+\.py:\d+:\s+error:/u.test(line));
}

function buildRuffImportSortActions(taskId: string, result: RepairVerificationCommandResult, output: string): PatchAction[] {
  const targetFiles = [...new Set([...output.matchAll(/-->\s+([^:\s]+):\d+:\d+/gu)].map((match) => cleanText(match[1] ?? 'unknown')))];
  const files = targetFiles.length > 0 ? targetFiles : ['unknown'];

  return files.map((targetFile) => ({
    actionId: `${taskId}-import-sort-${slugify(targetFile)}`,
    taskId,
    command: cleanText(result.command),
    actionType: 'import-sort',
    title: `Organize imports in ${targetFile}`,
    targetFiles: [targetFile],
    evidence: output,
    errorCode: 'I001',
    rationale: 'Ruff I001 indicates imports are unsorted or unformatted.',
    recommendedChange: 'Run Ruff import sorting or apply equivalent import ordering changes, then review the diff.',
    suggestedCommands: ['ruff check . --fix', cleanText(result.command)],
    autoFixCandidate: true,
    risk: 'low',
    reviewNotes: [
      'Auto-fix candidate, but review the resulting import order.',
      'Do not combine with unrelated formatting or behavior changes.'
    ]
  }));
}

function buildMypyAction(taskId: string, result: RepairVerificationCommandResult, line: string, index: number): PatchAction {
  const parsed = parseMypyLine(line);
  const classification = classifyMypyError(parsed.errorCode, parsed.message);
  const targetFile = parsed.file ?? 'unknown';

  return {
    actionId: `${taskId}-${classification.actionType}-${slugify(targetFile)}-${parsed.line ?? index + 1}-${parsed.errorCode ?? 'mypy'}`,
    taskId,
    command: cleanText(result.command),
    actionType: classification.actionType,
    title: classification.title,
    targetFiles: [cleanText(targetFile)],
    evidence: cleanText(line),
    errorCode: parsed.errorCode,
    rationale: classification.rationale,
    recommendedChange: classification.recommendedChange,
    suggestedCommands: [cleanText(result.command)],
    autoFixCandidate: false,
    risk: classification.risk,
    reviewNotes: [
      'Manual review required before editing types or control flow.',
      'Prefer narrow type annotations, guards, or API-compatible changes over broad ignores.'
    ]
  };
}

function buildManualAction(taskId: string, result: RepairVerificationCommandResult, output: string): PatchAction {
  return {
    actionId: `${taskId}-manual-investigation`,
    taskId,
    command: cleanText(result.command),
    actionType: 'manual-investigation',
    title: 'Investigate failed verification command',
    targetFiles: [],
    evidence: output,
    errorCode: null,
    rationale: 'The failure did not match known patch planning rules.',
    recommendedChange: 'Inspect the verification output and create a targeted patch plan manually.',
    suggestedCommands: [cleanText(result.command)],
    autoFixCandidate: false,
    risk: 'medium',
    reviewNotes: ['Manual review required because no deterministic rule matched this failure.']
  };
}

function parseMypyLine(line: string): { file: string | null; line: string | null; message: string; errorCode: string | null } {
  const match = /^([^:\s]+):(\d+):\s+error:\s+(.+?)(?:\s+\[([a-z-]+)\])?$/u.exec(line.trim());

  return {
    file: match?.[1] ?? null,
    line: match?.[2] ?? null,
    message: cleanText(match?.[3] ?? line),
    errorCode: match?.[4] ?? null
  };
}

function classifyMypyError(errorCode: string | null, message: string): {
  actionType: PatchActionType;
  title: string;
  rationale: string;
  recommendedChange: string;
  risk: PatchRisk;
} {
  if (errorCode === 'index') {
    return {
      actionType: 'type-fix',
      title: 'Add object narrowing before indexing',
      rationale: 'Mypy [index] usually means a value typed as object or an imprecise union is indexed without narrowing.',
      recommendedChange: 'Introduce a TypedDict, dataclass, protocol, cast, or runtime guard before indexing the value.',
      risk: 'medium'
    };
  }

  if (errorCode === 'return-value') {
    return {
      actionType: 'type-fix',
      title: 'Handle Optional return path',
      rationale: 'Optional return value is flowing into a non-optional return contract.',
      recommendedChange: 'Add an explicit None guard, fallback value, or update the function return type if None is valid.',
      risk: 'medium'
    };
  }

  if (errorCode === 'attr-defined') {
    return {
      actionType: 'type-fix',
      title: 'Align attribute access with declared API',
      rationale: 'Mypy [attr-defined] indicates the target type does not declare the accessed attribute.',
      recommendedChange: 'Use the correct API, refine the type annotation, or wrap the object in a helper with a declared method.',
      risk: 'medium'
    };
  }

  return {
    actionType: 'type-fix',
    title: 'Review mypy type error',
    rationale: `Mypy reported a type error${errorCode ? ` [${errorCode}]` : ''}: ${message}`,
    recommendedChange: 'Apply the narrowest type-safe change and rerun mypy.',
    risk: 'medium'
  };
}

function formatPatchActionMarkdown(action: PatchAction): string {
  return `## ${action.actionId}

- Type: ${action.actionType}
- Task: ${action.taskId}
- Risk: ${action.risk}
- Auto-fix Candidate: ${action.autoFixCandidate ? 'yes' : 'no'}
- Target Files: ${action.targetFiles.join(', ') || 'n/a'}
- Review: ${action.autoFixCandidate ? 'Review generated diff before accepting.' : 'Manual review required.'}

### Recommended Change

${action.recommendedChange}

### Suggested Commands

${action.suggestedCommands.map((command) => `- \`${command}\``).join('\n')}
`;
}

function formatRepairPatchPlanCliSummary(result: RepairPatchPlanRunResult): string {
  return [
    '# Repair Patch Plan',
    '',
    `- Plan: ${result.planPath}`,
    `- Markdown: ${result.markdownPath}`,
    `- Actions: ${result.actionCount}`,
    `- Auto-fix candidates: ${result.autoFixCandidates}`,
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

function cleanText(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');

  return slug || 'unknown';
}

if (isDirectRun(import.meta.url, process.argv[1])) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('Repair patch plan runner failed', error)}\n`);
    process.exitCode = 1;
  });
}

export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean {
  return argvPath !== undefined && fileURLToPath(moduleUrl) === resolve(argvPath);
}
