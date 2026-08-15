import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type {
  ProjectIntelligenceMaintainerDecisionRecord,
  ProjectIntelligenceMaintainerDecisionRecordItem
} from './run-project-intelligence-maintainer-decision.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultDecisionRecordPath = 'artifacts/project-graph/adr-cascade-maintainer-decision-record.json';
const defaultOutputDir = 'artifacts/project-graph';
const controlledRemediationPlanFileName = 'adr-cascade-controlled-remediation-plan.md';
const controlledRemediationPlanJsonFileName = 'adr-cascade-controlled-remediation-plan.json';

export interface ProjectIntelligenceControlledRemediationPlanCliOptions {
  decisionRecordPath?: string;
  outputDir?: string;
}

export interface ProjectIntelligenceControlledRemediationPlanRunInput
  extends ProjectIntelligenceControlledRemediationPlanCliOptions {
  generatedAt?: string;
}

export interface ProjectIntelligenceControlledRemediationPlanRunResult {
  controlledRemediationPlanPath: string;
  controlledRemediationPlanJsonPath: string;
  itemCount: number;
}

export interface ProjectIntelligenceControlledRemediationPlanItem {
  id: string;
  path: string;
  severity: string;
  finding: string;
  evidence: string[];
  maintainerDecision: 'repair';
  targetFiles: string[];
  executionStep: number;
  proposedAction: string;
  reviewBoundary: string;
  rollbackNote: string;
  verificationChecklist: string[];
  repairExecutionAuthorized: false;
}

export interface ProjectIntelligenceControlledRemediationPlan {
  schema: 'repoassure.project-intelligence.adr-cascade-controlled-remediation-plan@1';
  status: 'controlled_remediation_plan_ready';
  generatedAt: string;
  sourceMaintainerDecisionRecord: string;
  summary: {
    items: number;
    repairDecisionsIncluded: number;
    automaticEditsPlanned: false;
  };
  boundary: {
    automaticDocRewriteAuthorized: false;
    automaticAdrRepairAuthorized: false;
    repairExecutionAuthorized: false;
    requiresSeparateExecutionAuthorization: true;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
  };
  executionOrder: string[];
  sharedTargetFiles: string[];
  items: ProjectIntelligenceControlledRemediationPlanItem[];
}

interface ProjectIntelligenceControlledRemediationPlanMarkdownInput {
  generatedAt: string;
  decisionRecordPath: string;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceControlledRemediationPlanHelpRequest(args)) {
    process.stdout.write(projectIntelligenceControlledRemediationPlanHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceControlledRemediationPlan(
      parseProjectIntelligenceControlledRemediationPlanArgs(args)
    );
    process.stdout.write(formatProjectIntelligenceControlledRemediationPlanCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence controlled remediation plan failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceControlledRemediationPlanArgs(
  args: string[]
): ProjectIntelligenceControlledRemediationPlanCliOptions {
  let decisionRecordPath: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--decision-record' || arg.startsWith('--decision-record=')) {
      const value = readOptionValue(args, index, '--decision-record');
      decisionRecordPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence controlled remediation option: ${arg}`);
  }

  return {
    ...(decisionRecordPath ? { decisionRecordPath } : {}),
    ...(outputDir ? { outputDir } : {})
  };
}

export function isProjectIntelligenceControlledRemediationPlanHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceControlledRemediationPlanHelpText(): string {
  return `hardening project intelligence controlled remediation plan

Usage:
  pnpm project:intelligence:controlled-remediation-plan -- --decision-record <adr-cascade-maintainer-decision-record.json> --output <artifacts/project-graph>
  pnpm project:intelligence:controlled-remediation-plan -- --help

Options:
  --decision-record <path>  ADR cascade maintainer decision record JSON. Defaults to artifacts/project-graph/adr-cascade-maintainer-decision-record.json.
  --output <dir>           Output directory. Defaults to artifacts/project-graph.
  --help, -h               Show this help.

`;
}

export async function runProjectIntelligenceControlledRemediationPlan(
  input: ProjectIntelligenceControlledRemediationPlanRunInput = {}
): Promise<ProjectIntelligenceControlledRemediationPlanRunResult> {
  const decisionRecordPath = input.decisionRecordPath
    ? resolve(root, input.decisionRecordPath)
    : resolve(root, defaultDecisionRecordPath);
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : resolve(root, defaultOutputDir);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const decisionRecord = await readProjectIntelligenceMaintainerDecisionRecord(decisionRecordPath);
  const plan = buildProjectIntelligenceControlledRemediationPlan({
    decisionRecord,
    decisionRecordPath,
    generatedAt
  });
  const controlledRemediationPlanPath = join(outputDir, controlledRemediationPlanFileName);
  const controlledRemediationPlanJsonPath = join(outputDir, controlledRemediationPlanJsonFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(controlledRemediationPlanPath, formatProjectIntelligenceControlledRemediationPlanMarkdown(plan, {
    generatedAt,
    decisionRecordPath
  }));
  await writeFile(controlledRemediationPlanJsonPath, `${JSON.stringify(plan, null, 2)}\n`);

  return {
    controlledRemediationPlanPath,
    controlledRemediationPlanJsonPath,
    itemCount: plan.items.length
  };
}

export function formatProjectIntelligenceControlledRemediationPlanMarkdown(
  plan: ProjectIntelligenceControlledRemediationPlan,
  input: ProjectIntelligenceControlledRemediationPlanMarkdownInput
): string {
  return [
    '# Project Intelligence ADR Cascade Controlled Remediation Plan',
    '',
    `Status: ${plan.status}`,
    `Generated at: ${input.generatedAt}`,
    `Generated from: ${basename(input.decisionRecordPath)}`,
    '',
    '## Controlled Remediation Boundary',
    '',
    'This plan does not authorize automatic ADR/spec/docs edits or repair execution.',
    'A separate remediation execution goal must approve concrete file edits.',
    'Generated graph artifacts remain local-only and ignored.',
    '',
    '## Summary',
    '',
    `- Plan items: ${plan.summary.items}`,
    `- Repair decisions included: ${plan.summary.repairDecisionsIncluded}`,
    '- Automatic edits planned: no',
    '- Repair execution authorized: no',
    '',
    '## Proposed Execution Order',
    '',
    ...plan.items.map((item) => `${item.executionStep}. ${item.id} -> ${item.path}`),
    '',
    '## Shared Target Files',
    '',
    ...plan.sharedTargetFiles.map((path) => `- ${path}`),
    '',
    '## Items',
    '',
    ...plan.items.flatMap(formatControlledRemediationPlanItem),
    ''
  ].join('\n');
}

async function readProjectIntelligenceMaintainerDecisionRecord(
  decisionRecordPath: string
): Promise<ProjectIntelligenceMaintainerDecisionRecord> {
  let raw: string;

  try {
    raw = await readFile(decisionRecordPath, 'utf8');
  } catch (error: unknown) {
    throw new Error(`missing ADR cascade maintainer decision record: ${decisionRecordPath}`, { cause: error });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid ADR cascade maintainer decision record: ${message}`, { cause: error });
  }

  if (!isProjectIntelligenceMaintainerDecisionRecord(parsed)) {
    throw new Error('invalid ADR cascade maintainer decision record: expected maintainer decision record JSON');
  }

  return sanitizeMaintainerDecisionRecord(parsed);
}

function buildProjectIntelligenceControlledRemediationPlan(input: {
  decisionRecord: ProjectIntelligenceMaintainerDecisionRecord;
  decisionRecordPath: string;
  generatedAt: string;
}): ProjectIntelligenceControlledRemediationPlan {
  const items = input.decisionRecord.items
    .filter(isRepairDecisionItem)
    .map((item, index) => buildControlledRemediationPlanItem(item, index + 1));

  return {
    schema: 'repoassure.project-intelligence.adr-cascade-controlled-remediation-plan@1',
    status: 'controlled_remediation_plan_ready',
    generatedAt: input.generatedAt,
    sourceMaintainerDecisionRecord: input.decisionRecordPath,
    summary: {
      items: items.length,
      repairDecisionsIncluded: items.length,
      automaticEditsPlanned: false
    },
    boundary: {
      automaticDocRewriteAuthorized: false,
      automaticAdrRepairAuthorized: false,
      repairExecutionAuthorized: false,
      requiresSeparateExecutionAuthorization: true,
      hostedDashboardImplemented: false,
      telemetryEnabled: false
    },
    executionOrder: items.map((item) => item.id),
    sharedTargetFiles: [
      'docs/PRD.md',
      'docs/SPEC.md',
      'docs/PLAN.md',
      'docs/testing/strategy/test-strategy-v0.1.md',
      'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      'docs/logs/decision-log.md',
      'docs/logs/dev-log.md',
      'docs/product/specs/project-intelligence-console-spec-v0.1.md',
      'docs/architecture/specs/project-intelligence-console-architecture-v0.1.md'
    ],
    items
  };
}

function buildControlledRemediationPlanItem(
  item: ProjectIntelligenceMaintainerDecisionRecordItem,
  executionStep: number
): ProjectIntelligenceControlledRemediationPlanItem {
  return {
    id: item.id,
    path: item.path,
    severity: item.severity,
    finding: item.finding,
    evidence: item.evidence.map(redactControlledRemediationText),
    maintainerDecision: 'repair',
    targetFiles: [
      item.path,
      'docs/PRD.md',
      'docs/SPEC.md',
      'docs/PLAN.md',
      'docs/testing/strategy/test-strategy-v0.1.md',
      'docs/acceptance/checklists/acceptance-checklist-v0.1.md',
      'docs/logs/decision-log.md',
      'docs/logs/dev-log.md'
    ],
    executionStep,
    proposedAction: 'Add explicit cascade links from this ADR to canonical product, spec, plan, testing, acceptance, and log surfaces.',
    reviewBoundary: 'Maintainer must approve concrete file edits before execution.',
    rollbackNote: 'Revert only the cascade-link edits for this ADR and rerun project intelligence checks.',
    verificationChecklist: [
      'Confirm ADR cascade references are accurate.',
      'Confirm canonical docs reference the ADR decision without overclaiming implementation.',
      'Confirm testing strategy and acceptance checklist describe the updated governance boundary.',
      'Run project intelligence snapshot/freshness checks after the separate remediation execution goal.'
    ],
    repairExecutionAuthorized: false
  };
}

function formatControlledRemediationPlanItem(item: ProjectIntelligenceControlledRemediationPlanItem): string[] {
  return [
    `### ${item.id}: ${item.path}`,
    '',
    `- Finding: ${item.finding}`,
    `- Severity: ${item.severity}`,
    `- Evidence: ${item.evidence.length > 0 ? item.evidence.join(', ') : item.path}`,
    `- Maintainer decision: ${item.maintainerDecision}`,
    `- Target files: ${item.targetFiles.join(', ')}`,
    `- Proposed action: ${item.proposedAction}`,
    `- Review boundary: ${item.reviewBoundary}`,
    `- Rollback note: ${item.rollbackNote}`,
    '- Verification checklist:',
    ...item.verificationChecklist.map((check) => `  - ${check}`),
    '- Repair execution authorized: no',
    ''
  ].map(redactControlledRemediationText);
}

function isRepairDecisionItem(
  item: ProjectIntelligenceMaintainerDecisionRecordItem
): item is ProjectIntelligenceMaintainerDecisionRecordItem & { maintainerDecision: 'repair' } {
  return item.maintainerDecision === 'repair';
}

function isProjectIntelligenceMaintainerDecisionRecord(
  value: unknown
): value is ProjectIntelligenceMaintainerDecisionRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectIntelligenceMaintainerDecisionRecord>;
  return candidate.schema === 'repoassure.project-intelligence.adr-cascade-maintainer-decision-record@1'
    && candidate.status === 'maintainer_decisions_recorded'
    && candidate.boundary?.finalMaintainerDecisionWritten === true
    && candidate.boundary.automaticDocRewriteAuthorized === false
    && candidate.boundary.automaticAdrRepairAuthorized === false
    && candidate.boundary.repairExecutionAuthorized === false
    && Array.isArray(candidate.items)
    && typeof candidate.summary?.items === 'number'
    && candidate.summary.finalDecisionsWritten === candidate.items.length;
}

function sanitizeMaintainerDecisionRecord(
  decisionRecord: ProjectIntelligenceMaintainerDecisionRecord
): ProjectIntelligenceMaintainerDecisionRecord {
  return sanitizeJsonValue(decisionRecord) as ProjectIntelligenceMaintainerDecisionRecord;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactControlledRemediationText(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeJsonValue(entry)]));
  }

  return value;
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

function redactControlledRemediationText(value: string): string {
  return redactSensitiveText(value.replace(/Authorization:\s*Bearer\s+\S+/giu, '[REDACTED_AUTHORIZATION]'));
}

function formatProjectIntelligenceControlledRemediationPlanCliSummary(
  result: ProjectIntelligenceControlledRemediationPlanRunResult
): string {
  return [
    'Project intelligence ADR cascade controlled remediation plan generated.',
    `Controlled remediation plan: ${result.controlledRemediationPlanPath}`,
    `Controlled remediation plan JSON: ${result.controlledRemediationPlanJsonPath}`,
    `Items: ${result.itemCount}`,
    ''
  ].join('\n');
}

export function isDirectRun(metaUrl: string = import.meta.url, argvPath: string | undefined = process.argv[1]): boolean {
  return Boolean(argvPath && metaUrl === new URL(`file://${resolve(argvPath)}`).href);
}

if (isDirectRun()) {
  process.exitCode = await main();
}
