import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type { RepairExecutionReport, RepairExecutionStatus, RepairExecutionTaskReport } from './run-repair-execute.js';
import type { RepairHandoffPackage, RepairHandoffPriority } from './run-repair-handoff.js';
import type { PatchPlan } from './run-repair-patch-plan.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export type RepairEvidencePackageStatus = 'no_actions' | 'review_required';

export interface RepairEvidencePackageCliOptions {
  handoffPackagePath: string;
  dryRunReportPath: string;
  validationReportPath: string;
  patchPlanPath: string;
  outputDir?: string;
}

export interface RepairEvidencePackageRunInput extends RepairEvidencePackageCliOptions {
  generatedAt?: string;
}

export interface RepairEvidencePackageRunResult {
  packagePath: string;
  markdownPath: string;
  taskCount: number;
  status: RepairEvidencePackageStatus;
}

export interface RepairEvidenceArtifactIndexEntry {
  role: 'repair-handoff' | 'repair-execution-dry-run' | 'repair-execution-validation-only' | 'repair-patch-plan';
  path: string;
  schema: string;
  status: string;
  readAfter: string[];
  summary: Record<string, number | string | null>;
}

export interface RepairEvidenceFlowStage {
  stage: 'handoff' | 'dry-run' | 'validation-only' | 'patch-plan' | 'maintainer-review';
  status: string;
  artifactRole: string;
  purpose: string;
}

export interface RepairEvidenceTaskMatrixItem {
  taskId: string;
  priority: RepairHandoffPriority;
  sourceType: string;
  objective: string;
  dryRunStatus: RepairExecutionStatus | 'missing';
  validationStatus: RepairExecutionStatus | 'missing';
  verificationCommands: string[];
  patchActionCount: number;
  patchActionTypes: string[];
  nextAction: string;
}

export interface RepairEvidenceAgentContract {
  schema: 'repoassure.repair-evidence-package.v1';
  primaryReadPath: 'ai-ide-repair-evidence-package.json';
  readOrder: string[];
  nextCommands: {
    rerunValidation: string;
    regeneratePatchPlan: string;
  };
  boundaries: string[];
}

export interface RepairEvidencePackage {
  schemaVersion: 1;
  generatedAt: string;
  status: RepairEvidencePackageStatus;
  runId: string;
  repoRoot: string;
  summary: {
    queuedTasks: number;
    dryRunPlanned: number;
    validationPassed: number;
    validationFailed: number;
    validationSkipped: number;
    patchActions: number;
  };
  agentContract: RepairEvidenceAgentContract;
  artifactIndex: RepairEvidenceArtifactIndexEntry[];
  repairFlow: RepairEvidenceFlowStage[];
  taskMatrix: RepairEvidenceTaskMatrixItem[];
  maintainerReview: {
    requiredBefore: string[];
    allowedDecisions: string[];
  };
  verificationChecklist: {
    commands: string[];
    completionSignals: string[];
  };
  noWriteProof: {
    targetRepoWriteAuthorized: false;
    sourceFilesChanged: false;
    patchesApplied: false;
    evidenceSources: Array<'repair-execution-dry-run' | 'repair-execution-validation-only' | 'repair-patch-plan'>;
    prohibitedActions: string[];
  };
  redaction: {
    guarantee: string;
    prohibitedContent: string[];
  };
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isRepairEvidencePackageHelpRequest(args)) {
    process.stdout.write(repairEvidencePackageHelpText());
    return 0;
  }

  const options = parseRepairEvidencePackageArgs(args);
  const result = await runRepairEvidencePackage(options);

  process.stdout.write(formatRepairEvidencePackageCliSummary(result));
  return 0;
}

export function parseRepairEvidencePackageArgs(args: string[]): RepairEvidencePackageCliOptions {
  let handoffPackagePath: string | undefined;
  let dryRunReportPath: string | undefined;
  let validationReportPath: string | undefined;
  let patchPlanPath: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--handoff' || arg.startsWith('--handoff=')) {
      const value = readOptionValue(args, index, '--handoff');
      handoffPackagePath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--dry-run-report' || arg.startsWith('--dry-run-report=')) {
      const value = readOptionValue(args, index, '--dry-run-report');
      dryRunReportPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--validation-report' || arg.startsWith('--validation-report=')) {
      const value = readOptionValue(args, index, '--validation-report');
      validationReportPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--patch-plan' || arg.startsWith('--patch-plan=')) {
      const value = readOptionValue(args, index, '--patch-plan');
      patchPlanPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown repair evidence package option: ${arg}`);
  }

  if (!handoffPackagePath) {
    throw new Error('--handoff <repair-handoff-package.json> is required');
  }

  if (!dryRunReportPath) {
    throw new Error('--dry-run-report <repair-execution-report.json> is required');
  }

  if (!validationReportPath) {
    throw new Error('--validation-report <repair-execution-report.json> is required');
  }

  if (!patchPlanPath) {
    throw new Error('--patch-plan <patch-plan.json> is required');
  }

  return {
    handoffPackagePath,
    dryRunReportPath,
    validationReportPath,
    patchPlanPath,
    ...(outputDir ? { outputDir } : {})
  };
}

export function isRepairEvidencePackageHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function repairEvidencePackageHelpText(): string {
  return `hardening repair evidence package

Usage:
  pnpm repair:evidence-package -- --handoff <repair-handoff-package.json> --dry-run-report <repair-execution-report.json> --validation-report <repair-execution-report.json> --patch-plan <patch-plan.json>
  pnpm repair:evidence-package -- --help

Options:
  --handoff <path>              repair-handoff-package.json path.
  --dry-run-report <path>       dry-run repair-execution-report.json path.
  --validation-report <path>    validation-only repair-execution-report.json path.
  --patch-plan <path>           patch-plan.json path.
  --output <dir>                Output directory. Defaults next to the patch plan file.
  --help, -h                    Show this help.

`;
}

export async function runRepairEvidencePackage(input: RepairEvidencePackageRunInput): Promise<RepairEvidencePackageRunResult> {
  const handoffPackage = JSON.parse(await readFile(input.handoffPackagePath, 'utf8')) as RepairHandoffPackage;
  const dryRunReport = JSON.parse(await readFile(input.dryRunReportPath, 'utf8')) as RepairExecutionReport;
  const validationReport = JSON.parse(await readFile(input.validationReportPath, 'utf8')) as RepairExecutionReport;
  const patchPlan = JSON.parse(await readFile(input.patchPlanPath, 'utf8')) as PatchPlan;
  const evidencePackage = buildRepairEvidencePackage({
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    paths: {
      handoffPackagePath: input.handoffPackagePath,
      dryRunReportPath: input.dryRunReportPath,
      validationReportPath: input.validationReportPath,
      patchPlanPath: input.patchPlanPath
    },
    handoffPackage,
    dryRunReport,
    validationReport,
    patchPlan
  });
  const outputDir = input.outputDir ?? dirname(input.patchPlanPath);
  const packagePath = join(outputDir, 'ai-ide-repair-evidence-package.json');
  const markdownPath = join(outputDir, 'ai-ide-repair-evidence-package.md');

  await mkdir(outputDir, { recursive: true });
  await writeFile(packagePath, `${JSON.stringify(evidencePackage, null, 2)}\n`);
  await writeFile(markdownPath, formatRepairEvidencePackageMarkdown(evidencePackage));

  return {
    packagePath,
    markdownPath,
    taskCount: evidencePackage.summary.queuedTasks,
    status: evidencePackage.status
  };
}

export function buildRepairEvidencePackage(input: {
  generatedAt: string;
  paths: RepairEvidencePackageCliOptions;
  handoffPackage: RepairHandoffPackage;
  dryRunReport: RepairExecutionReport;
  validationReport: RepairExecutionReport;
  patchPlan: PatchPlan;
}): RepairEvidencePackage {
  assertSameRun(input.handoffPackage, input.dryRunReport, input.validationReport, input.patchPlan);
  const taskMatrix = buildTaskMatrix(input.handoffPackage, input.dryRunReport, input.validationReport, input.patchPlan);
  const patchActions = input.patchPlan.summary.totalActions;
  const status: RepairEvidencePackageStatus = input.validationReport.summary.failed > 0
    || input.validationReport.summary.skipped > 0
    || patchActions > 0
    ? 'review_required'
    : 'no_actions';

  return {
    schemaVersion: 1,
    generatedAt: cleanText(input.generatedAt),
    status,
    runId: cleanText(input.handoffPackage.runId),
    repoRoot: cleanText(input.handoffPackage.repoRoot),
    summary: {
      queuedTasks: input.handoffPackage.repairActionQueue.length,
      dryRunPlanned: input.dryRunReport.summary.selectedTasks,
      validationPassed: input.validationReport.summary.passed,
      validationFailed: input.validationReport.summary.failed,
      validationSkipped: input.validationReport.summary.skipped,
      patchActions
    },
    agentContract: buildRepairEvidenceAgentContract(),
    artifactIndex: buildArtifactIndex(input.paths, input.handoffPackage, input.dryRunReport, input.validationReport, input.patchPlan),
    repairFlow: buildRepairFlow(input.handoffPackage, input.dryRunReport, input.validationReport, input.patchPlan, status),
    taskMatrix,
    maintainerReview: {
      requiredBefore: dedupe([
        ...input.handoffPackage.maintainerReview.requiredBefore,
        ...input.dryRunReport.maintainerReview.requiredBefore,
        ...input.validationReport.maintainerReview.requiredBefore,
        ...input.patchPlan.maintainerReview.requiredBefore
      ].map(cleanText)),
      allowedDecisions: dedupe([
        ...input.handoffPackage.maintainerReview.allowedDecisions,
        ...input.dryRunReport.maintainerReview.allowedDecisions,
        ...input.validationReport.maintainerReview.allowedDecisions,
        ...input.patchPlan.maintainerReview.allowedDecisions
      ].map(cleanText))
    },
    verificationChecklist: {
      commands: dedupe([
        ...input.handoffPackage.verificationChecklist.commands,
        ...input.dryRunReport.verificationChecklist.commands,
        ...input.validationReport.verificationChecklist.commands,
        ...input.patchPlan.verificationChecklist.commands
      ].map(cleanText)),
      completionSignals: dedupe([
        ...input.handoffPackage.verificationChecklist.completionSignals,
        ...input.dryRunReport.verificationChecklist.completionSignals,
        ...input.validationReport.verificationChecklist.completionSignals,
        ...input.patchPlan.verificationChecklist.completionSignals
      ].map(cleanText))
    },
    noWriteProof: {
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      patchesApplied: false,
      evidenceSources: [
        'repair-execution-dry-run',
        'repair-execution-validation-only',
        'repair-patch-plan'
      ],
      prohibitedActions: dedupe([
        ...input.dryRunReport.noWriteProof.prohibitedActions,
        ...input.validationReport.noWriteProof.prohibitedActions,
        ...input.patchPlan.noWriteProof.prohibitedActions
      ].map(cleanText))
    },
    redaction: {
      guarantee: 'All indexed paths, task evidence, command outputs, and next actions are redacted before entering this evidence package.',
      prohibitedContent: ['secrets', 'tokens', 'cookies', 'private keys', 'authorization headers']
    }
  };
}

export function formatRepairEvidencePackageMarkdown(evidencePackage: RepairEvidencePackage): string {
  return `# AI IDE Repair Evidence Package

| Field | Value |
| --- | --- |
| Status | ${evidencePackage.status} |
| Run ID | ${evidencePackage.runId} |
| Repo Root | ${evidencePackage.repoRoot} |
| Queued Tasks | ${evidencePackage.summary.queuedTasks} |
| Dry-run Planned | ${evidencePackage.summary.dryRunPlanned} |
| Validation Passed | ${evidencePackage.summary.validationPassed} |
| Validation Failed | ${evidencePackage.summary.validationFailed} |
| Validation Skipped | ${evidencePackage.summary.validationSkipped} |
| Patch Actions | ${evidencePackage.summary.patchActions} |

## Agent Contract

- Schema: ${evidencePackage.agentContract.schema}
- Primary read path: ${evidencePackage.agentContract.primaryReadPath}
- Read order: ${evidencePackage.agentContract.readOrder.join(', ')}
- Rerun validation: ${evidencePackage.agentContract.nextCommands.rerunValidation}
- Regenerate patch plan: ${evidencePackage.agentContract.nextCommands.regeneratePatchPlan}
- Boundaries: ${evidencePackage.agentContract.boundaries.join(' ')}

## Artifact Index

${evidencePackage.artifactIndex.map((artifact) => `- ${artifact.role}: ${artifact.path} (${artifact.schema}, status=${artifact.status}, read after=${artifact.readAfter.join(', ') || 'none'})`).join('\n')}

## Repair Flow

${evidencePackage.repairFlow.map((stage) => `- ${stage.stage}: ${stage.status} via ${stage.artifactRole}. ${stage.purpose}`).join('\n')}

## Task Matrix

| Task | Priority | Dry-run | Validation | Patch Actions | Next Action |
| --- | --- | --- | --- | ---: | --- |
${evidencePackage.taskMatrix.map((task) => `| ${task.taskId} | ${task.priority} | ${task.dryRunStatus} | ${task.validationStatus} | ${task.patchActionCount} | ${task.nextAction} |`).join('\n')}

## Maintainer Review Boundary

- Required before: ${evidencePackage.maintainerReview.requiredBefore.join(', ')}
- Allowed decisions: ${evidencePackage.maintainerReview.allowedDecisions.join(', ')}

## Verification Checklist

${evidencePackage.verificationChecklist.commands.map((command) => `- \`${command}\``).join('\n') || '- n/a'}

## No-write Proof

- Target repo write authorized: ${evidencePackage.noWriteProof.targetRepoWriteAuthorized}
- Source files changed: ${evidencePackage.noWriteProof.sourceFilesChanged}
- Patches applied: ${evidencePackage.noWriteProof.patchesApplied}
- Evidence sources: ${evidencePackage.noWriteProof.evidenceSources.join(', ')}
- Prohibited actions: ${evidencePackage.noWriteProof.prohibitedActions.join(', ')}
`;
}

function assertSameRun(
  handoffPackage: RepairHandoffPackage,
  dryRunReport: RepairExecutionReport,
  validationReport: RepairExecutionReport,
  patchPlan: PatchPlan
): void {
  const runIds = new Set([handoffPackage.runId, dryRunReport.runId, validationReport.runId, patchPlan.runId]);
  const repoRoots = new Set([handoffPackage.repoRoot, dryRunReport.repoRoot, validationReport.repoRoot, patchPlan.repoRoot]);

  if (runIds.size !== 1) {
    throw new Error('Repair evidence package inputs must reference the same runId');
  }

  if (repoRoots.size !== 1) {
    throw new Error('Repair evidence package inputs must reference the same repoRoot');
  }

  if (dryRunReport.mode !== 'dry-run') {
    throw new Error('--dry-run-report must point to a dry-run repair execution report');
  }

  if (validationReport.mode !== 'validation-only') {
    throw new Error('--validation-report must point to a validation-only repair execution report');
  }
}

function buildRepairEvidenceAgentContract(): RepairEvidenceAgentContract {
  return {
    schema: 'repoassure.repair-evidence-package.v1',
    primaryReadPath: 'ai-ide-repair-evidence-package.json',
    readOrder: [
      'summary',
      'artifactIndex',
      'repairFlow',
      'taskMatrix',
      'maintainerReview',
      'verificationChecklist',
      'noWriteProof'
    ],
    nextCommands: {
      rerunValidation: 'pnpm repair:execute -- --package <repair-handoff-package.json> --task <taskId> --validation-only',
      regeneratePatchPlan: 'pnpm repair:patch-plan -- --report <repair-execution-report.json>'
    },
    boundaries: [
      'This package is evidence for AI IDE and maintainer consumption, not permission to modify the target repository.',
      'Read patch-plan actions as review inputs only.',
      'Record maintainer approval before source edits, commits, issues, pull requests, releases, uploads, or acceptance changes.'
    ]
  };
}

function buildArtifactIndex(
  paths: RepairEvidencePackageCliOptions,
  handoffPackage: RepairHandoffPackage,
  dryRunReport: RepairExecutionReport,
  validationReport: RepairExecutionReport,
  patchPlan: PatchPlan
): RepairEvidenceArtifactIndexEntry[] {
  return [
    {
      role: 'repair-handoff',
      path: cleanText(paths.handoffPackagePath),
      schema: handoffPackage.agentContract.schema,
      status: handoffPackage.summary.totalTasks > 0 ? 'queued' : 'no_actions',
      readAfter: [],
      summary: {
        totalTasks: handoffPackage.summary.totalTasks,
        failedCommands: handoffPackage.summary.failedCommands,
        requiredFailed: handoffPackage.summary.requiredFailed,
        requiredBlocked: handoffPackage.summary.requiredBlocked,
        highestPriority: handoffPackage.summary.highestPriority
      }
    },
    {
      role: 'repair-execution-dry-run',
      path: cleanText(paths.dryRunReportPath),
      schema: dryRunReport.agentContract.schema,
      status: dryRunReport.status,
      readAfter: ['repair-handoff'],
      summary: cleanSummary(dryRunReport.summary)
    },
    {
      role: 'repair-execution-validation-only',
      path: cleanText(paths.validationReportPath),
      schema: validationReport.agentContract.schema,
      status: validationReport.status,
      readAfter: ['repair-handoff', 'repair-execution-dry-run'],
      summary: cleanSummary(validationReport.summary)
    },
    {
      role: 'repair-patch-plan',
      path: cleanText(paths.patchPlanPath),
      schema: patchPlan.agentContract.schema,
      status: patchPlan.status,
      readAfter: ['repair-execution-validation-only'],
      summary: cleanSummary(patchPlan.summary)
    }
  ];
}

function buildRepairFlow(
  handoffPackage: RepairHandoffPackage,
  dryRunReport: RepairExecutionReport,
  validationReport: RepairExecutionReport,
  patchPlan: PatchPlan,
  status: RepairEvidencePackageStatus
): RepairEvidenceFlowStage[] {
  return [
    {
      stage: 'handoff',
      status: handoffPackage.summary.totalTasks > 0 ? 'queued' : 'no_actions',
      artifactRole: 'repair-handoff',
      purpose: 'AI IDE reads queued repair tasks, evidence, and maintainer review boundary.'
    },
    {
      stage: 'dry-run',
      status: dryRunReport.status,
      artifactRole: 'repair-execution-dry-run',
      purpose: 'AI IDE previews selected tasks and patch inputs without running verification commands.'
    },
    {
      stage: 'validation-only',
      status: validationReport.status,
      artifactRole: 'repair-execution-validation-only',
      purpose: 'AI IDE reads passed, failed, and skipped verification results without source writes.'
    },
    {
      stage: 'patch-plan',
      status: patchPlan.status,
      artifactRole: 'repair-patch-plan',
      purpose: 'Maintainer reviews patch actions before any edits.'
    },
    {
      stage: 'maintainer-review',
      status,
      artifactRole: 'ai-ide-repair-evidence-package',
      purpose: 'Maintainer decides approve, reject, defer, or accept risk based on the full evidence chain.'
    }
  ];
}

function buildTaskMatrix(
  handoffPackage: RepairHandoffPackage,
  dryRunReport: RepairExecutionReport,
  validationReport: RepairExecutionReport,
  patchPlan: PatchPlan
): RepairEvidenceTaskMatrixItem[] {
  return handoffPackage.repairActionQueue.map((queueItem) => {
    const task = handoffPackage.tasks.find((candidate) => candidate.taskId === queueItem.taskId);
    const dryRunTask = findReportTask(dryRunReport, queueItem.taskId);
    const validationTask = findReportTask(validationReport, queueItem.taskId);
    const patchActions = patchPlan.actions.filter((action) => action.taskId === queueItem.taskId);
    const validationStatus = validationTask?.executionStatus ?? 'missing';

    return {
      taskId: cleanText(queueItem.taskId),
      priority: queueItem.priority,
      sourceType: cleanText(queueItem.sourceType),
      objective: cleanText(queueItem.objective),
      dryRunStatus: dryRunTask?.executionStatus ?? 'missing',
      validationStatus,
      verificationCommands: (task?.verification.commands ?? queueItem.verificationCommands).map(cleanText),
      patchActionCount: patchActions.length,
      patchActionTypes: dedupe(patchActions.map((action) => cleanText(action.actionType))),
      nextAction: buildTaskMatrixNextAction(validationStatus, patchActions.length)
    };
  });
}

function findReportTask(report: RepairExecutionReport, taskId: string): RepairExecutionTaskReport | undefined {
  return report.tasks.find((task) => task.taskId === taskId);
}

function buildTaskMatrixNextAction(status: RepairExecutionStatus | 'missing', patchActionCount: number): string {
  if (status === 'passed') {
    return 'Rerun user acceptance and regenerate repair handoff to confirm this task disappears.';
  }

  if (status === 'failed') {
    return patchActionCount > 0
      ? 'Review patch plan actions, apply only after maintainer approval, then rerun validation-only.'
      : 'Review failed verification evidence and add a patch action before editing.';
  }

  if (status === 'skipped') {
    return 'Resolve manual environment or placeholder context before rerunning validation-only.';
  }

  if (status === 'planned') {
    return 'Run validation-only before making repair decisions.';
  }

  return 'Regenerate repair execution reports for this task.';
}

function cleanSummary(summary: Record<string, number | string | null>): Record<string, number | string | null> {
  return Object.fromEntries(
    Object.entries(summary).map(([key, value]) => [cleanText(key), typeof value === 'string' ? cleanText(value) : value])
  );
}

function dedupe<T>(values: T[]): T[] {
  return values.filter((value, index, all) => all.indexOf(value) === index);
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

function formatRepairEvidencePackageCliSummary(result: RepairEvidencePackageRunResult): string {
  return [
    '# AI IDE Repair Evidence Package',
    '',
    `- Package: ${result.packagePath}`,
    `- Markdown: ${result.markdownPath}`,
    `- Tasks: ${result.taskCount}`,
    `- Status: ${result.status}`,
    ''
  ].join('\n');
}

function cleanText(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

if (isDirectRun(import.meta.url, process.argv[1])) {
  main().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error: unknown) => {
    process.stderr.write(`${formatAcceptanceFatalError('Repair evidence package runner failed', error)}\n`);
    process.exitCode = 1;
  });
}

export function isDirectRun(moduleUrl: string, argvPath: string | undefined): boolean {
  return argvPath !== undefined && fileURLToPath(moduleUrl) === resolve(argvPath);
}
