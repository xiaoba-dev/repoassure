import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type { ProjectIntelligenceAdrCascadeDecision } from './run-project-intelligence-decision-intake.js';
import type {
  ProjectIntelligenceRecommendationDraft,
  ProjectIntelligenceRecommendationDraftItem
} from './run-project-intelligence-recommendation-draft.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultRecommendationDraftPath = 'artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json';
const defaultOutputDir = 'artifacts/project-graph';
const maintainerDecisionRecordFileName = 'adr-cascade-maintainer-decision-record.md';
const maintainerDecisionRecordJsonFileName = 'adr-cascade-maintainer-decision-record.json';
const allowedDecisions = ['approve', 'defer', 'accept-risk', 'repair'] as const;

export interface ProjectIntelligenceMaintainerDecisionCliOptions {
  recommendationDraftPath?: string;
  outputDir?: string;
  decision?: ProjectIntelligenceAdrCascadeDecision;
  evidenceNote?: string;
  maintainer?: string;
}

export interface ProjectIntelligenceMaintainerDecisionRunInput
  extends ProjectIntelligenceMaintainerDecisionCliOptions {
  generatedAt?: string;
}

export interface ProjectIntelligenceMaintainerDecisionRunResult {
  maintainerDecisionRecordPath: string;
  maintainerDecisionRecordJsonPath: string;
  itemCount: number;
}

export interface ProjectIntelligenceMaintainerDecisionRecordItem {
  id: string;
  path: string;
  severity: string;
  finding: string;
  evidence: string[];
  recommendedDecision: ProjectIntelligenceAdrCascadeDecision;
  maintainerDecision: ProjectIntelligenceAdrCascadeDecision;
  evidenceNote: string;
  maintainer: string;
  rationale: string;
  risk: string;
  followUp: string;
  repairExecutionAuthorized: false;
}

export interface ProjectIntelligenceMaintainerDecisionRecord {
  schema: 'repoassure.project-intelligence.adr-cascade-maintainer-decision-record@1';
  status: 'maintainer_decisions_recorded';
  generatedAt: string;
  sourceRecommendationDraft: string;
  summary: {
    items: number;
    finalDecisionsWritten: number;
    repairDecisionsRecorded: number;
  };
  boundary: {
    finalMaintainerDecisionWritten: true;
    automaticDocRewriteAuthorized: false;
    automaticAdrRepairAuthorized: false;
    repairExecutionAuthorized: false;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
  };
  items: ProjectIntelligenceMaintainerDecisionRecordItem[];
}

interface ProjectIntelligenceMaintainerDecisionMarkdownInput {
  generatedAt: string;
  recommendationDraftPath: string;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceMaintainerDecisionHelpRequest(args)) {
    process.stdout.write(projectIntelligenceMaintainerDecisionHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceMaintainerDecisionRecord(
      parseProjectIntelligenceMaintainerDecisionArgs(args)
    );
    process.stdout.write(formatProjectIntelligenceMaintainerDecisionCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence maintainer decision failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceMaintainerDecisionArgs(
  args: string[]
): ProjectIntelligenceMaintainerDecisionCliOptions {
  let recommendationDraftPath: string | undefined;
  let outputDir: string | undefined;
  let decision: ProjectIntelligenceAdrCascadeDecision | undefined;
  let evidenceNote: string | undefined;
  let maintainer: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--draft' || arg.startsWith('--draft=')) {
      const value = readOptionValue(args, index, '--draft');
      recommendationDraftPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--decision' || arg.startsWith('--decision=')) {
      const value = readOptionValue(args, index, '--decision');
      decision = parseMaintainerDecision(value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--evidence-note' || arg.startsWith('--evidence-note=')) {
      const value = readOptionValue(args, index, '--evidence-note');
      evidenceNote = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--maintainer' || arg.startsWith('--maintainer=')) {
      const value = readOptionValue(args, index, '--maintainer');
      maintainer = value.value;
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence maintainer decision option: ${arg}`);
  }

  return {
    ...(recommendationDraftPath ? { recommendationDraftPath } : {}),
    ...(outputDir ? { outputDir } : {}),
    ...(decision ? { decision } : {}),
    ...(evidenceNote ? { evidenceNote } : {}),
    ...(maintainer ? { maintainer } : {})
  };
}

export function isProjectIntelligenceMaintainerDecisionHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceMaintainerDecisionHelpText(): string {
  return `hardening project intelligence maintainer decision

Usage:
  pnpm project:intelligence:maintainer-decision -- --draft <adr-cascade-remediation-recommendation-draft.json> --decision repair --evidence-note <note> --maintainer <owner> --output <artifacts/project-graph>
  pnpm project:intelligence:maintainer-decision -- --help

Options:
  --draft <path>          ADR cascade recommendation draft JSON. Defaults to artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json.
  --decision <decision>   Maintainer decision to record for every draft item. Allowed: approve, defer, accept-risk, repair. Defaults to repair.
  --evidence-note <note>  Maintainer evidence note. Defaults to owner authorization recorded in the current Codex conversation.
  --maintainer <name>     Maintainer label. Defaults to owner.
  --output <dir>          Output directory. Defaults to artifacts/project-graph.
  --help, -h              Show this help.

`;
}

export async function runProjectIntelligenceMaintainerDecisionRecord(
  input: ProjectIntelligenceMaintainerDecisionRunInput = {}
): Promise<ProjectIntelligenceMaintainerDecisionRunResult> {
  const recommendationDraftPath = input.recommendationDraftPath
    ? resolve(root, input.recommendationDraftPath)
    : resolve(root, defaultRecommendationDraftPath);
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : resolve(root, defaultOutputDir);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const decision = input.decision ?? 'repair';
  const evidenceNote = input.evidenceNote ?? 'Owner authorized execution in Codex conversation on 2026-07-18.';
  const maintainer = input.maintainer ?? 'owner';
  const recommendationDraft = await readProjectIntelligenceRecommendationDraft(recommendationDraftPath);
  const maintainerDecisionRecord = buildProjectIntelligenceMaintainerDecisionRecord({
    recommendationDraft,
    recommendationDraftPath,
    generatedAt,
    decision,
    evidenceNote,
    maintainer
  });
  const maintainerDecisionRecordPath = join(outputDir, maintainerDecisionRecordFileName);
  const maintainerDecisionRecordJsonPath = join(outputDir, maintainerDecisionRecordJsonFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(maintainerDecisionRecordPath, formatProjectIntelligenceMaintainerDecisionRecordMarkdown(
    maintainerDecisionRecord,
    { generatedAt, recommendationDraftPath }
  ));
  await writeFile(maintainerDecisionRecordJsonPath, `${JSON.stringify(maintainerDecisionRecord, null, 2)}\n`);

  return {
    maintainerDecisionRecordPath,
    maintainerDecisionRecordJsonPath,
    itemCount: maintainerDecisionRecord.items.length
  };
}

export function formatProjectIntelligenceMaintainerDecisionRecordMarkdown(
  maintainerDecisionRecord: ProjectIntelligenceMaintainerDecisionRecord,
  input: ProjectIntelligenceMaintainerDecisionMarkdownInput
): string {
  return [
    '# Project Intelligence ADR Cascade Maintainer Decision Record',
    '',
    `Status: ${maintainerDecisionRecord.status}`,
    `Generated at: ${input.generatedAt}`,
    `Generated from: ${basename(input.recommendationDraftPath)}`,
    '',
    '## Decision Boundary',
    '',
    'This record captures maintainer decisions only.',
    'This record does not authorize automatic ADR/spec/docs edits or repair execution.',
    'Generated graph artifacts remain local-only and ignored.',
    '',
    '## Summary',
    '',
    `- Decision items: ${maintainerDecisionRecord.summary.items}`,
    `- Final maintainer decisions written: ${maintainerDecisionRecord.summary.finalDecisionsWritten}`,
    `- Repair decisions recorded: ${maintainerDecisionRecord.summary.repairDecisionsRecorded}`,
    '- Repair execution authorized: no',
    '',
    '## Items',
    '',
    ...maintainerDecisionRecord.items.flatMap(formatMaintainerDecisionRecordItem),
    ''
  ].join('\n');
}

async function readProjectIntelligenceRecommendationDraft(
  recommendationDraftPath: string
): Promise<ProjectIntelligenceRecommendationDraft> {
  let raw: string;

  try {
    raw = await readFile(recommendationDraftPath, 'utf8');
  } catch (error: unknown) {
    throw new Error(`missing ADR cascade recommendation draft: ${recommendationDraftPath}`, { cause: error });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid ADR cascade recommendation draft: ${message}`, { cause: error });
  }

  if (!isProjectIntelligenceRecommendationDraft(parsed)) {
    throw new Error('invalid ADR cascade recommendation draft: expected recommendation draft JSON');
  }

  return sanitizeRecommendationDraft(parsed);
}

function buildProjectIntelligenceMaintainerDecisionRecord(input: {
  recommendationDraft: ProjectIntelligenceRecommendationDraft;
  recommendationDraftPath: string;
  generatedAt: string;
  decision: ProjectIntelligenceAdrCascadeDecision;
  evidenceNote: string;
  maintainer: string;
}): ProjectIntelligenceMaintainerDecisionRecord {
  const items = input.recommendationDraft.items.map((item) => buildMaintainerDecisionRecordItem({
    item,
    decision: input.decision,
    evidenceNote: input.evidenceNote,
    maintainer: input.maintainer
  }));

  return {
    schema: 'repoassure.project-intelligence.adr-cascade-maintainer-decision-record@1',
    status: 'maintainer_decisions_recorded',
    generatedAt: input.generatedAt,
    sourceRecommendationDraft: input.recommendationDraftPath,
    summary: {
      items: items.length,
      finalDecisionsWritten: items.length,
      repairDecisionsRecorded: items.filter((item) => item.maintainerDecision === 'repair').length
    },
    boundary: {
      finalMaintainerDecisionWritten: true,
      automaticDocRewriteAuthorized: false,
      automaticAdrRepairAuthorized: false,
      repairExecutionAuthorized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false
    },
    items
  };
}

function buildMaintainerDecisionRecordItem(input: {
  item: ProjectIntelligenceRecommendationDraftItem;
  decision: ProjectIntelligenceAdrCascadeDecision;
  evidenceNote: string;
  maintainer: string;
}): ProjectIntelligenceMaintainerDecisionRecordItem {
  return {
    id: input.item.id,
    path: input.item.path,
    severity: input.item.severity,
    finding: input.item.finding,
    evidence: input.item.evidence.map(redactMaintainerDecisionText),
    recommendedDecision: input.item.recommendedDecision,
    maintainerDecision: input.decision,
    evidenceNote: redactMaintainerDecisionText(input.evidenceNote),
    maintainer: redactMaintainerDecisionText(input.maintainer),
    rationale: redactMaintainerDecisionText(input.item.rationale),
    risk: redactMaintainerDecisionText(input.item.risk),
    followUp: redactMaintainerDecisionText(input.item.followUp),
    repairExecutionAuthorized: false
  };
}

function formatMaintainerDecisionRecordItem(item: ProjectIntelligenceMaintainerDecisionRecordItem): string[] {
  return [
    `### ${item.id}: ${item.path}`,
    '',
    `- Finding: ${item.finding}`,
    `- Severity: ${item.severity}`,
    `- Evidence: ${item.evidence.length > 0 ? item.evidence.join(', ') : item.path}`,
    `- Recommendation: ${item.recommendedDecision}`,
    `- Maintainer decision: ${item.maintainerDecision}`,
    `- Evidence note: ${item.evidenceNote}`,
    `- Maintainer: ${item.maintainer}`,
    `- Rationale: ${item.rationale}`,
    `- Risk: ${item.risk}`,
    `- Rollback / follow-up: ${item.followUp}`,
    '- Repair execution authorized: no',
    ''
  ].map(redactMaintainerDecisionText);
}

function isProjectIntelligenceRecommendationDraft(value: unknown): value is ProjectIntelligenceRecommendationDraft {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectIntelligenceRecommendationDraft>;
  return candidate.schema === 'repoassure.project-intelligence.adr-cascade-recommendation-draft@1'
    && candidate.status === 'maintainer_review_required'
    && candidate.boundary?.finalMaintainerDecisionWritten === false
    && candidate.boundary.automaticDocRewriteAuthorized === false
    && candidate.boundary.automaticAdrRepairAuthorized === false
    && candidate.boundary.repairExecutionAuthorized === false
    && Array.isArray(candidate.items)
    && typeof candidate.summary?.items === 'number'
    && candidate.summary.finalDecisionsWritten === 0;
}

function sanitizeRecommendationDraft(
  recommendationDraft: ProjectIntelligenceRecommendationDraft
): ProjectIntelligenceRecommendationDraft {
  return sanitizeJsonValue(recommendationDraft) as ProjectIntelligenceRecommendationDraft;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactMaintainerDecisionText(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeJsonValue(entry)]));
  }

  return value;
}

function parseMaintainerDecision(value: string): ProjectIntelligenceAdrCascadeDecision {
  if ((allowedDecisions as readonly string[]).includes(value)) {
    return value as ProjectIntelligenceAdrCascadeDecision;
  }

  throw new Error(`Unsupported maintainer decision: ${value}`);
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

function redactMaintainerDecisionText(value: string): string {
  return redactSensitiveText(value.replace(/Authorization:\s*Bearer\s+\S+/giu, '[REDACTED_AUTHORIZATION]'));
}

function formatProjectIntelligenceMaintainerDecisionCliSummary(
  result: ProjectIntelligenceMaintainerDecisionRunResult
): string {
  return [
    'Project intelligence ADR cascade maintainer decision record generated.',
    `Maintainer decision record: ${result.maintainerDecisionRecordPath}`,
    `Maintainer decision record JSON: ${result.maintainerDecisionRecordJsonPath}`,
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
