import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultBacklogPath = 'artifacts/project-graph/adr-cascade-remediation-backlog.md';
const defaultOutputDir = 'artifacts/project-graph';
const decisionIntakeFileName = 'adr-cascade-remediation-decision-intake.md';
const decisionIntakeJsonFileName = 'adr-cascade-remediation-decision-intake.json';
const allowedDecisions = ['approve', 'defer', 'accept-risk', 'repair'] as const;

export type ProjectIntelligenceAdrCascadeDecision = typeof allowedDecisions[number];

export interface ProjectIntelligenceDecisionIntakeCliOptions {
  backlogPath?: string;
  outputDir?: string;
}

export interface ProjectIntelligenceDecisionIntakeRunInput extends ProjectIntelligenceDecisionIntakeCliOptions {
  generatedAt?: string;
}

export interface ProjectIntelligenceDecisionIntakeRunResult {
  decisionIntakePath: string;
  decisionIntakeJsonPath: string;
  itemCount: number;
}

export interface ProjectIntelligenceDecisionIntakeItem {
  id: string;
  path: string;
  severity?: string;
  finding?: string;
  evidence: string[];
  suggestedAction?: string;
  allowedDecisions: ProjectIntelligenceAdrCascadeDecision[];
  decision: ProjectIntelligenceAdrCascadeDecision | null;
  evidenceNote: string | null;
  followUpOwner: string | null;
}

export interface ProjectIntelligenceDecisionIntake {
  schema: 'repoassure.project-intelligence.adr-cascade-decision-intake@1';
  status: 'maintainer_decision_required';
  generatedAt: string;
  sourceBacklog: string;
  summary: {
    items: number;
    pending: number;
  };
  boundary: {
    automaticDocRewriteAuthorized: false;
    automaticAdrRepairAuthorized: false;
    repairExecutionAuthorized: false;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
  };
  items: ProjectIntelligenceDecisionIntakeItem[];
}

interface ProjectIntelligenceDecisionIntakeMarkdownInput {
  generatedAt: string;
  backlogPath: string;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceDecisionIntakeHelpRequest(args)) {
    process.stdout.write(projectIntelligenceDecisionIntakeHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceDecisionIntake(parseProjectIntelligenceDecisionIntakeArgs(args));
    process.stdout.write(formatProjectIntelligenceDecisionIntakeCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence decision intake failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceDecisionIntakeArgs(
  args: string[]
): ProjectIntelligenceDecisionIntakeCliOptions {
  let backlogPath: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--backlog' || arg.startsWith('--backlog=')) {
      const value = readOptionValue(args, index, '--backlog');
      backlogPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence decision intake option: ${arg}`);
  }

  return {
    ...(backlogPath ? { backlogPath } : {}),
    ...(outputDir ? { outputDir } : {})
  };
}

export function isProjectIntelligenceDecisionIntakeHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceDecisionIntakeHelpText(): string {
  return `hardening project intelligence decision intake

Usage:
  pnpm project:intelligence:decision-intake -- --backlog <adr-cascade-remediation-backlog.md> --output <artifacts/project-graph>
  pnpm project:intelligence:decision-intake -- --help

Options:
  --backlog <path>  ADR cascade remediation backlog Markdown. Defaults to artifacts/project-graph/adr-cascade-remediation-backlog.md.
  --output <dir>    Output directory. Defaults to artifacts/project-graph.
  --help, -h        Show this help.

`;
}

export async function runProjectIntelligenceDecisionIntake(
  input: ProjectIntelligenceDecisionIntakeRunInput = {}
): Promise<ProjectIntelligenceDecisionIntakeRunResult> {
  const backlogPath = input.backlogPath ? resolve(root, input.backlogPath) : resolve(root, defaultBacklogPath);
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : resolve(root, defaultOutputDir);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const intake = await buildProjectIntelligenceDecisionIntake(backlogPath, generatedAt);
  const decisionIntakePath = join(outputDir, decisionIntakeFileName);
  const decisionIntakeJsonPath = join(outputDir, decisionIntakeJsonFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(decisionIntakePath, formatProjectIntelligenceDecisionIntakeMarkdown(intake, {
    generatedAt,
    backlogPath
  }));
  await writeFile(decisionIntakeJsonPath, `${JSON.stringify(intake, null, 2)}\n`);

  return {
    decisionIntakePath,
    decisionIntakeJsonPath,
    itemCount: intake.items.length
  };
}

export function formatProjectIntelligenceDecisionIntakeMarkdown(
  intake: ProjectIntelligenceDecisionIntake,
  input: ProjectIntelligenceDecisionIntakeMarkdownInput
): string {
  return [
    '# Project Intelligence ADR Cascade Remediation Decision Intake',
    '',
    `Status: ${intake.status}`,
    `Generated at: ${input.generatedAt}`,
    `Generated from: ${basename(input.backlogPath)}`,
    '',
    '## Decision Boundary',
    '',
    'This intake does not authorize automatic ADR/spec/docs edits or repair execution.',
    'Allowed decisions: approve / defer / accept-risk / repair.',
    'Generated graph artifacts remain local-only and ignored.',
    '',
    '## Summary',
    '',
    `- Decision items: ${intake.summary.items}`,
    `- Pending decisions: ${intake.summary.pending}`,
    '- Automatic ADR repair authorized: no',
    '',
    '## Items',
    '',
    ...intake.items.flatMap(formatDecisionIntakeItem),
    ''
  ].join('\n');
}

async function buildProjectIntelligenceDecisionIntake(
  backlogPath: string,
  generatedAt: string
): Promise<ProjectIntelligenceDecisionIntake> {
  const items = await readBacklogItems(backlogPath);

  return {
    schema: 'repoassure.project-intelligence.adr-cascade-decision-intake@1',
    status: 'maintainer_decision_required',
    generatedAt,
    sourceBacklog: backlogPath,
    summary: {
      items: items.length,
      pending: items.length
    },
    boundary: {
      automaticDocRewriteAuthorized: false,
      automaticAdrRepairAuthorized: false,
      repairExecutionAuthorized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false
    },
    items
  };
}

async function readBacklogItems(backlogPath: string): Promise<ProjectIntelligenceDecisionIntakeItem[]> {
  let raw: string;

  try {
    raw = await readFile(backlogPath, 'utf8');
  } catch (error: unknown) {
    throw new Error(`missing ADR cascade backlog: ${backlogPath}`, { cause: error });
  }

  const redacted = redactDecisionIntakeText(raw);
  if (!redacted.includes('# Project Intelligence ADR Cascade Remediation Backlog')
    || !redacted.includes('Status: maintainer_review_required')) {
    throw new Error('invalid ADR cascade backlog: expected Project Intelligence ADR cascade remediation backlog');
  }

  const itemBlocks = redacted.split(/\n(?=### RA-ADR-CASCADE-\d{3}: )/u)
    .filter((block) => /^### RA-ADR-CASCADE-\d{3}: /u.test(block));
  const items = itemBlocks.map(parseBacklogItem);

  if (items.length === 0) {
    throw new Error('invalid ADR cascade backlog: expected at least one RA-ADR-CASCADE item');
  }

  return items;
}

function parseBacklogItem(block: string): ProjectIntelligenceDecisionIntakeItem {
  const headingMatch = /^### (RA-ADR-CASCADE-\d{3}): (.+)$/mu.exec(block);
  if (!headingMatch) {
    throw new Error('invalid ADR cascade backlog: malformed RA-ADR-CASCADE item');
  }
  const severity = readListValue(block, 'Severity');
  const finding = readListValue(block, 'Finding');
  const suggestedAction = readListValue(block, 'Suggested action');

  return {
    id: headingMatch[1] ?? '',
    path: headingMatch[2] ?? '',
    evidence: readListValue(block, 'Evidence')?.split(',').map((entry) => entry.trim()).filter(Boolean) ?? [],
    allowedDecisions: [...allowedDecisions],
    decision: null,
    evidenceNote: null,
    followUpOwner: null,
    ...(severity ? { severity } : {}),
    ...(finding ? { finding } : {}),
    ...(suggestedAction ? { suggestedAction } : {})
  };
}

function readListValue(block: string, label: string): string | undefined {
  const pattern = new RegExp(`^- ${escapeRegExp(label)}: (.+)$`, 'mu');
  return pattern.exec(block)?.[1];
}

function formatDecisionIntakeItem(item: ProjectIntelligenceDecisionIntakeItem): string[] {
  return [
    `### ${item.id}: ${item.path}`,
    '',
    `- Severity: ${item.severity ?? 'unknown'}`,
    `- Finding: ${item.finding ?? 'unknown'}`,
    `- Evidence: ${item.evidence.length > 0 ? item.evidence.join(', ') : item.path}`,
    `- Suggested action: ${item.suggestedAction ?? 'Add graph-visible downstream cascade evidence or explicitly accept risk.'}`,
    '- Current decision: pending',
    '- [ ] Decision: approve / defer / accept-risk / repair',
    '- [ ] Evidence note:',
    '- [ ] Follow-up owner:',
    '- [ ] Repair authorized by maintainer:',
    ''
  ].map(redactDecisionIntakeText);
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function redactDecisionIntakeText(value: string): string {
  return redactSensitiveText(value).replace(/Authorization:\s*Bearer\s+\S+/giu, '[REDACTED_AUTHORIZATION]');
}

function formatProjectIntelligenceDecisionIntakeCliSummary(
  result: ProjectIntelligenceDecisionIntakeRunResult
): string {
  return [
    'Project intelligence ADR cascade decision intake generated.',
    `Decision intake: ${result.decisionIntakePath}`,
    `Decision intake JSON: ${result.decisionIntakeJsonPath}`,
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
