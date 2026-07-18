import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import type { PythonCliCheckCommandResult } from './python-cli-checks.js';
import { redactSensitiveText } from './redaction.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export interface RepairHandoffCliOptions {
  runDir: string;
  outputDir?: string;
}

export interface RepairHandoffRunInput extends RepairHandoffCliOptions {
  generatedAt?: string;
}

export interface RepairHandoffRunResult {
  packagePath: string;
  markdownPath: string;
  verificationPlanPath: string;
  taskCount: number;
  highestPriority: RepairHandoffPriority | null;
}

export type RepairHandoffMode = 'browser' | 'cli' | 'unknown';
export type RepairHandoffPriority = 'P0' | 'P1' | 'P2';

export interface RepairHandoffManifest {
  schemaVersion?: number;
  mode?: string;
  runId?: string;
  repoRoot?: string;
  artifacts?: Record<string, unknown>;
  commandResults?: PythonCliCheckCommandResult[];
  checks?: Array<{ name?: string; required?: boolean; status?: string; evidence?: string }>;
}

export interface RepairHandoffTask {
  taskId: string;
  priority: RepairHandoffPriority;
  sourceType: 'command_failure' | 'acceptance_check_failure' | 'environment_blocker';
  objective: string;
  issue: {
    title: string;
    mode: RepairHandoffMode;
    command?: string;
    failedCheck?: string;
  };
  evidence: {
    commandResult?: RedactedCommandResult;
    check?: { name: string; required: boolean; status: string; evidence: string };
    sourceArtifacts: Record<string, unknown>;
  };
  impact: string;
  recommendedFix: {
    expectedOutcome: string;
    changeScope: { include: string[]; exclude: string[] };
    implementationSteps: string[];
  };
  verification: {
    commands: string[];
    acceptanceCriteria: string[];
  };
  risks: string[];
  handoffPrompt: string;
}

export interface RepairHandoffAgentContract {
  schema: 'repoassure.repair-handoff.v1';
  primaryReadPath: string;
  readOrder: string[];
  maintainerReviewBoundary: RepairHandoffMaintainerReviewBoundary;
  nextCommands: {
    dryRun: string;
    validationOnly: string;
    patchPlan: string;
  };
  boundaries: string[];
}

export interface RepairHandoffMaintainerReviewBoundary {
  requiredBefore: string[];
  allowedDecisions: Array<'approve' | 'reject' | 'defer' | 'accept_risk'>;
}

export interface RepairActionQueueItem {
  taskId: string;
  priority: RepairHandoffPriority;
  status: 'queued';
  objective: string;
  sourceType: RepairHandoffTask['sourceType'];
  verificationCommands: string[];
  requiresMaintainerReview: boolean;
}

export interface RepairHandoffVerificationChecklist {
  commands: string[];
  acceptanceCriteria: string[];
  completionSignals: string[];
}

export interface RepairHandoffRedactionContract {
  guarantee: string;
  prohibitedContent: string[];
}

export interface RepairHandoffPackage {
  schemaVersion: 1;
  generatedAt: string;
  mode: RepairHandoffMode;
  runId: string;
  repoRoot: string;
  runDir: string;
  summary: {
    totalTasks: number;
    failedCommands: number;
    requiredFailed: number;
    requiredBlocked: number;
    highestPriority: RepairHandoffPriority | null;
  };
  sourceArtifacts: Record<string, unknown>;
  agentContract: RepairHandoffAgentContract;
  repairActionQueue: RepairActionQueueItem[];
  maintainerReview: RepairHandoffMaintainerReviewBoundary;
  verificationChecklist: RepairHandoffVerificationChecklist;
  redaction: RepairHandoffRedactionContract;
  tasks: RepairHandoffTask[];
}

interface BuildRepairHandoffPackageInput {
  generatedAt?: string;
  runDir: string;
  manifest: RepairHandoffManifest;
}

interface RedactedCommandResult {
  command: string;
  args: string[];
  exitCode: number | null;
  timedOut: boolean;
  stdout: string;
  stderr: string;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isRepairHandoffHelpRequest(args)) {
    process.stdout.write(repairHandoffHelpText());
    return 0;
  }

  const options = parseRepairHandoffArgs(args);
  const result = await runRepairHandoff(options);

  process.stdout.write(formatRepairHandoffCliSummary(result));
  return 0;
}

export function parseRepairHandoffArgs(args: string[]): RepairHandoffCliOptions {
  let runDir: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--run' || arg.startsWith('--run=')) {
      const value = readOptionValue(args, index, '--run');
      runDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown repair handoff option: ${arg}`);
  }

  if (!runDir) {
    throw new Error('--run <run-dir> is required');
  }

  return {
    runDir,
    ...(outputDir ? { outputDir } : {})
  };
}

export function isRepairHandoffHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function repairHandoffHelpText(): string {
  return `hardening repair handoff

Usage:
  pnpm repair:handoff -- --run <run-dir>
  pnpm repair:handoff -- --run <run-dir> --output <output-dir>
  pnpm repair:handoff -- --help

Options:
  --run <run-dir>       Existing hardening run bundle directory containing manifest.json.
  --output <dir>        Output directory. Defaults to the run bundle directory.
  --help, -h            Show this help.

`;
}

export async function runRepairHandoff(input: RepairHandoffRunInput): Promise<RepairHandoffRunResult> {
  const manifestPath = join(input.runDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as RepairHandoffManifest;
  const outputDir = input.outputDir ?? input.runDir;
  const pkg = buildRepairHandoffPackage({
    runDir: input.runDir,
    manifest,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {})
  });
  const packagePath = join(outputDir, 'repair-handoff-package.json');
  const markdownPath = join(outputDir, 'repair-handoff-package.md');
  const verificationPlanPath = join(outputDir, 'verification-plan.md');

  await mkdir(outputDir, { recursive: true });
  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  await writeFile(markdownPath, formatRepairHandoffMarkdown(pkg));
  await writeFile(verificationPlanPath, formatVerificationPlanMarkdown(pkg));

  return {
    packagePath,
    markdownPath,
    verificationPlanPath,
    taskCount: pkg.summary.totalTasks,
    highestPriority: pkg.summary.highestPriority
  };
}

export function buildRepairHandoffPackage(input: BuildRepairHandoffPackageInput): RepairHandoffPackage {
  const mode = normalizeMode(input.manifest.mode);
  const sourceArtifacts = redactJsonObject(input.manifest.artifacts ?? {});
  const failedCommands = (input.manifest.commandResults ?? [])
    .filter((result) => result.exitCode !== 0 || result.timedOut);
  const failedCommandValues = new Set(failedCommands.map((result) => formatCommandValue(result.command, result.args)));
  const failedChecks = (input.manifest.checks ?? [])
    .filter((check) => check.status === 'failed')
    .filter((check) => !isDuplicateCommandExecutionCheck(check.name, failedCommandValues));
  const blockedChecks = (input.manifest.checks ?? [])
    .filter((check) => check.status === 'blocked');
  const commandTasks = failedCommands.map((result) => buildCommandFailureTask({
    result,
    mode,
    sourceArtifacts
  }));
  const checkTasks = failedChecks.map((check) => buildCheckFailureTask({
    check,
    mode,
    sourceArtifacts
  }));
  const blockerTasks = blockedChecks.map((check) => buildEnvironmentBlockerTask({
    check,
    mode,
    sourceArtifacts
  }));
  const tasks = [...commandTasks, ...checkTasks, ...blockerTasks].sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority));
  const requiredFailed = failedChecks.filter((check) => check.required).length;
  const requiredBlocked = blockedChecks.filter((check) => check.required).length;

  return {
    schemaVersion: 1,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    mode,
    runId: cleanText(input.manifest.runId ?? basenameRunId(input.runDir)),
    repoRoot: cleanText(input.manifest.repoRoot ?? 'unknown'),
    runDir: cleanText(input.runDir),
    summary: {
      totalTasks: tasks.length,
      failedCommands: failedCommands.length,
      requiredFailed,
      requiredBlocked,
      highestPriority: tasks[0]?.priority ?? null
    },
    sourceArtifacts,
    agentContract: buildRepairHandoffAgentContract(),
    repairActionQueue: buildRepairActionQueue(tasks),
    maintainerReview: buildMaintainerReviewBoundary(),
    verificationChecklist: buildVerificationChecklist(tasks),
    redaction: buildRedactionContract(),
    tasks
  };
}

export function formatRepairHandoffMarkdown(pkg: RepairHandoffPackage): string {
  const taskSections = pkg.tasks.length > 0
    ? pkg.tasks.map(formatRepairHandoffTaskMarkdown).join('\n\n')
    : 'No executable repair tasks were generated.';

  return `# Repair Handoff Package

| Field | Value |
| --- | --- |
| Mode | ${pkg.mode} |
| Run ID | ${pkg.runId} |
| Repo Root | ${pkg.repoRoot} |
| Total Tasks | ${pkg.summary.totalTasks} |
| Failed Commands | ${pkg.summary.failedCommands} |
| Required Failed Checks | ${pkg.summary.requiredFailed} |
| Required Blocked Checks | ${pkg.summary.requiredBlocked} |
| Highest Priority | ${pkg.summary.highestPriority ?? 'n/a'} |

## Agent Contract

- Schema: ${pkg.agentContract.schema}
- Primary read path: ${pkg.agentContract.primaryReadPath}
- Read order: ${pkg.agentContract.readOrder.join(', ')}
- Dry run: ${pkg.agentContract.nextCommands.dryRun}
- Validation only: ${pkg.agentContract.nextCommands.validationOnly}
- Patch plan: ${pkg.agentContract.nextCommands.patchPlan}
- Boundaries: ${pkg.agentContract.boundaries.join(' ')}

## AI IDE Repair Decision Contract

AI IDEs and coding agents should read this package in the declared order, plan from repairActionQueue, and stop before any target repository write unless the maintainer separately authorizes a repair execution goal.

## Repair Action Queue

${pkg.repairActionQueue.length > 0 ? pkg.repairActionQueue.map((item) => `- ${item.taskId} (${item.priority}, ${item.status}) — ${item.objective}`).join('\n') : '- No queued repair actions.'}

## Maintainer Review Boundary

- Required before: ${pkg.maintainerReview.requiredBefore.join(', ')}
- Allowed decisions: ${pkg.maintainerReview.allowedDecisions.join(', ')}

## Verification Checklist

### Commands

${pkg.verificationChecklist.commands.length > 0 ? pkg.verificationChecklist.commands.map((command) => `- \`${command}\``).join('\n') : '- Re-run the original acceptance command and project quality gates.'}

### Completion Signals

${pkg.verificationChecklist.completionSignals.map((signal) => `- ${signal}`).join('\n')}

${taskSections}
`;
}

function buildRepairHandoffAgentContract(): RepairHandoffAgentContract {
  return {
    schema: 'repoassure.repair-handoff.v1',
    primaryReadPath: '.hardening/latest/repair-handoff-package.json',
    readOrder: [
      'summary',
      'agentContract',
      'repairActionQueue[]',
      'tasks[]',
      'tasks[].evidence',
      'tasks[].recommendedFix',
      'tasks[].verification.commands',
      'maintainerReview',
      'verificationChecklist',
      'redaction'
    ],
    maintainerReviewBoundary: buildMaintainerReviewBoundary(),
    nextCommands: {
      dryRun: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --dry-run',
      validationOnly: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --validation-only',
      patchPlan: 'pnpm repair:patch-plan -- --report <repair-execution-report.json>'
    },
    boundaries: [
      'Does not modify target repository files.',
      'Must not modify target repository files unless the maintainer separately authorizes a repair execution goal.',
      'Does not create branches, commits, issues, pull requests, or advisories.',
      'Read redacted evidence only; do not infer or reconstruct secrets.'
    ]
  };
}

function buildMaintainerReviewBoundary(): RepairHandoffMaintainerReviewBoundary {
  return {
    requiredBefore: [
      'applying patches',
      'changing target repository files',
      'creating branches, commits, issues, pull requests, or advisories',
      'marking acceptance as passed'
    ],
    allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk']
  };
}

function buildRepairActionQueue(tasks: RepairHandoffTask[]): RepairActionQueueItem[] {
  return tasks.map((task) => ({
    taskId: task.taskId,
    priority: task.priority,
    status: 'queued',
    objective: task.objective,
    sourceType: task.sourceType,
    verificationCommands: task.verification.commands,
    requiresMaintainerReview: true
  }));
}

function buildVerificationChecklist(tasks: RepairHandoffTask[]): RepairHandoffVerificationChecklist {
  const completionSignals = tasks.length === 0
    ? ['No queued repair actions remain.']
    : [];

  return {
    commands: [...new Set(tasks.flatMap((task) => task.verification.commands))],
    acceptanceCriteria: tasks.flatMap((task) => task.verification.acceptanceCriteria.map((item) => `${task.taskId}: ${item}`)),
    completionSignals: [
      ...completionSignals,
      'All selected verification commands exit zero or have recorded environment blockers.',
      'Repair handoff package no longer contains completed taskIds after a fresh run.',
      'Maintainer review decision is recorded before any target repo write.'
    ]
  };
}

function buildRedactionContract(): RepairHandoffRedactionContract {
  return {
    guarantee: 'All command output, evidence, paths, and prompts are redacted before entering this package.',
    prohibitedContent: ['secrets', 'tokens', 'cookies', 'private keys', 'authorization headers', 'raw credentials']
  };
}

export function formatVerificationPlanMarkdown(pkg: RepairHandoffPackage): string {
  const commands = [...new Set(pkg.tasks.flatMap((task) => task.verification.commands))];
  const criteria = pkg.tasks.flatMap((task) => task.verification.acceptanceCriteria.map((item) => `${task.taskId}: ${item}`));

  return `# Verification Plan

## Commands

${commands.length > 0 ? commands.map((command) => `- \`${command}\``).join('\n') : '- Re-run the original acceptance command and project quality gates.'}

## Acceptance Criteria

${criteria.length > 0 ? criteria.map((item) => `- ${item}`).join('\n') : '- No repair tasks remain in the handoff package.'}
`;
}

function buildCommandFailureTask(input: {
  result: PythonCliCheckCommandResult;
  mode: RepairHandoffMode;
  sourceArtifacts: Record<string, unknown>;
}): RepairHandoffTask {
  const command = formatCommandValue(input.result.command, input.result.args);
  const taskId = `pycli-failed-${slugify(command)}`;
  const output = cleanText(input.result.stdout || input.result.stderr || 'No command output captured.');

  return {
    taskId,
    priority: 'P1',
    sourceType: 'command_failure',
    objective: `修复失败命令：${command}`,
    issue: {
      title: `Command failed: ${command}`,
      mode: input.mode,
      command
    },
    evidence: {
      commandResult: redactCommandResult(input.result),
      sourceArtifacts: input.sourceArtifacts
    },
    impact: cleanText(`该命令在 acceptance run 中失败，会阻止目标 repo 达到可交接的质量门禁。证据：${output}`),
    recommendedFix: {
      expectedOutcome: `命令 \`${command}\` 重新执行时 exit code 为 0，且不再输出同类失败。`,
      changeScope: {
        include: [
          '优先修改导致该命令失败的最小相关代码、配置或测试夹具。',
          '保留现有 acceptance artifact，修复后通过新 run bundle 重新生成证据。'
        ],
        exclude: [
          '不要删除失败检查来规避问题。',
          '不要扩大到无关重构、全仓格式化或行为不相关的改动。',
          '不要引入明文 secret、token、cookie 或本地私有路径。'
        ]
      },
      implementationSteps: [
        `读取 sourceArtifacts 和 commandResult，定位 \`${command}\` 失败原因。`,
        '编写或保留能复现失败的最小测试。',
        '实施最小修复，并只调整相关代码或配置。',
        `重新运行 \`${command}\`，确认 exit code 为 0。`,
        '重新运行 acceptance flow，确认 repair handoff 不再生成该任务。'
      ]
    },
    verification: {
      commands: [command],
      acceptanceCriteria: [
        `\`${command}\` exit code 为 0。`,
        '重新生成的 acceptance manifest 中该 commandResult 不再失败。',
        'repair-handoff-package.json 不再包含当前 taskId。'
      ]
    },
    risks: [
      '只修复命令输出中的表层症状可能掩盖真实行为缺陷。',
      '静态检查修复可能影响公共 API，需要同步运行项目测试。'
    ],
    handoffPrompt: cleanText(`你是接手目标 repo 的修复 Agent。请修复任务 ${taskId}：${command} 当前失败。基于 evidence 和 sourceArtifacts 做最小改动，修复后运行 verification.commands，并重新生成 acceptance run bundle。`)
  };
}

function buildCheckFailureTask(input: {
  check: { name?: string; required?: boolean; status?: string; evidence?: string };
  mode: RepairHandoffMode;
  sourceArtifacts: Record<string, unknown>;
}): RepairHandoffTask {
  const name = cleanText(input.check.name ?? 'Unnamed acceptance check');
  const taskId = `acceptance-check-${slugify(name)}`;
  const priority: RepairHandoffPriority = input.check.required ? 'P0' : 'P2';
  const evidence = cleanText(input.check.evidence ?? 'No evidence captured.');

  return {
    taskId,
    priority,
    sourceType: 'acceptance_check_failure',
    objective: `修复失败验收项：${name}`,
    issue: {
      title: `Acceptance check failed: ${name}`,
      mode: input.mode,
      failedCheck: name
    },
    evidence: {
      check: {
        name,
        required: input.check.required ?? false,
        status: cleanText(input.check.status ?? 'failed'),
        evidence
      },
      sourceArtifacts: input.sourceArtifacts
    },
    impact: input.check.required
      ? '必需验收项失败，当前 run 不能被视为可交付。'
      : '可选验收项失败，需要作为质量改进任务处理。',
    recommendedFix: {
      expectedOutcome: `验收项 \`${name}\` 在重新运行后通过或有明确的用户确认豁免。`,
      changeScope: {
        include: ['优先修复该验收项直接指向的代码、配置或文档。'],
        exclude: ['不要移除验收项或降低 required 级别来规避失败。']
      },
      implementationSteps: [
        '读取验收项 evidence 和关联 sourceArtifacts。',
        '补充最小复现或验证步骤。',
        '实施最小修复。',
        '重新运行 acceptance flow 并确认该验收项通过。'
      ]
    },
    verification: {
      commands: ['pnpm user:accept -- --repo <repo> --decision pending'],
      acceptanceCriteria: [
        `验收项 \`${name}\` 状态为 passed。`,
        '新的 repair handoff 不再包含当前 taskId。'
      ]
    },
    risks: ['验收项可能依赖外部环境，修复前需要区分产品问题和环境阻塞。'],
    handoffPrompt: cleanText(`你是接手目标 repo 的修复 Agent。请修复验收项 ${name}。不要降低验收门槛；修复后重新运行 acceptance flow。`)
  };
}

function buildEnvironmentBlockerTask(input: {
  check: { name?: string; required?: boolean; status?: string; evidence?: string };
  mode: RepairHandoffMode;
  sourceArtifacts: Record<string, unknown>;
}): RepairHandoffTask {
  const name = cleanText(input.check.name ?? 'Unnamed environment blocker');
  const taskId = `environment-blocker-${slugify(name)}`;
  const priority: RepairHandoffPriority = input.check.required ? 'P0' : 'P2';
  const evidence = cleanText(input.check.evidence ?? 'No environment blocker evidence captured.');

  return {
    taskId,
    priority,
    sourceType: 'environment_blocker',
    objective: `解除环境阻塞：${name}`,
    issue: {
      title: `Environment blocker: ${name}`,
      mode: input.mode,
      failedCheck: name
    },
    evidence: {
      check: {
        name,
        required: input.check.required ?? false,
        status: cleanText(input.check.status ?? 'blocked'),
        evidence
      },
      sourceArtifacts: input.sourceArtifacts
    },
    impact: input.check.required
      ? '必需环境门禁阻塞，当前 run 不能被视为可交付或失败修复完成。'
      : '可选环境门禁阻塞，需要先区分环境限制与产品缺陷。',
    recommendedFix: {
      expectedOutcome: `环境阻塞 \`${name}\` 被解除，或记录 maintainer 接受的环境豁免。`,
      changeScope: {
        include: ['优先修复或记录该环境阻塞直接指向的运行条件、权限、依赖或配置。'],
        exclude: ['不要把环境阻塞伪装成产品通过；不要降低 required 级别来规避阻塞。']
      },
      implementationSteps: [
        '读取 blocker evidence 和关联 sourceArtifacts。',
        '判断 blocker 是本地权限、依赖、浏览器、网络、端口还是目标 repo 缺陷。',
        '修复可控环境条件，或记录 maintainer 接受的环境豁免。',
        '重新运行 acceptance flow 并确认 blocker 解除。'
      ]
    },
    verification: {
      commands: ['pnpm user:accept -- --repo <repo> --decision pending'],
      acceptanceCriteria: [
        `环境阻塞 \`${name}\` 状态不再为 blocked。`,
        '新的 repair handoff 不再包含当前 environment blocker taskId。'
      ]
    },
    risks: ['环境阻塞可能掩盖真实产品缺陷，解除后必须重新运行验收。'],
    handoffPrompt: cleanText(`你是接手目标 repo 的修复 Agent。请先处理环境阻塞 ${name}，不要把 blocked 伪装为 passed；解除后重新运行 acceptance flow。`)
  };
}

function isDuplicateCommandExecutionCheck(name: string | undefined, failedCommandValues: Set<string>): boolean {
  const prefix = 'Python CLI check 执行: ';

  if (!name?.startsWith(prefix)) {
    return false;
  }

  return failedCommandValues.has(cleanText(name.slice(prefix.length)));
}

function formatRepairHandoffTaskMarkdown(task: RepairHandoffTask): string {
  return `## ${task.taskId}

- Priority: ${task.priority}
- Objective: ${task.objective}
- Impact: ${task.impact}

### Verification

${task.verification.commands.map((command) => `- \`${command}\``).join('\n') || '- Re-run acceptance flow.'}

### Handoff Prompt

${task.handoffPrompt}
`;
}

function formatRepairHandoffCliSummary(result: RepairHandoffRunResult): string {
  return [
    '# Repair Handoff',
    '',
    `- Package: ${result.packagePath}`,
    `- Markdown: ${result.markdownPath}`,
    `- Verification plan: ${result.verificationPlanPath}`,
    `- Tasks: ${result.taskCount}`,
    `- Highest priority: ${result.highestPriority ?? 'n/a'}`,
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

function normalizeMode(value: string | undefined): RepairHandoffMode {
  if (value === 'browser' || value === 'cli') {
    return value;
  }

  return 'unknown';
}

function priorityRank(priority: RepairHandoffPriority): number {
  return { P0: 0, P1: 1, P2: 2 }[priority];
}

function redactCommandResult(result: PythonCliCheckCommandResult): RedactedCommandResult {
  return {
    command: cleanText(result.command),
    args: result.args.map(cleanText),
    exitCode: typeof result.exitCode === 'number' ? result.exitCode : null,
    timedOut: Boolean(result.timedOut),
    stdout: cleanText(result.stdout),
    stderr: cleanText(result.stderr)
  };
}

function formatCommandValue(command: string, args: string[]): string {
  return cleanText(`${command} ${args.join(' ')}`.trim());
}

function basenameRunId(runDir: string): string {
  return runDir.split(/[\\/]/u).filter(Boolean).at(-1) ?? 'unknown';
}

function cleanText(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

function redactJsonValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return cleanText(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactJsonValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [cleanText(key), redactJsonValue(entry)])
    );
  }

  return value;
}

function redactJsonObject(value: Record<string, unknown>): Record<string, unknown> {
  return redactJsonValue(value) as Record<string, unknown>;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');

  return slug || 'task';
}

if (isDirectRun(import.meta.url, process.argv[1])) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('Repair handoff runner failed', error)}\n`);
    process.exitCode = 1;
  });
}

export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean {
  return argvPath !== undefined && fileURLToPath(moduleUrl) === resolve(argvPath);
}
