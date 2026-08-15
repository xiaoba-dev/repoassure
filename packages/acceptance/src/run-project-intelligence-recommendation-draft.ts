import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type {
  ProjectIntelligenceAdrCascadeDecision,
  ProjectIntelligenceDecisionIntake,
  ProjectIntelligenceDecisionIntakeItem
} from './run-project-intelligence-decision-intake.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultIntakePath = 'artifacts/project-graph/adr-cascade-remediation-decision-intake.json';
const defaultOutputDir = 'artifacts/project-graph';
const recommendationDraftFileName = 'adr-cascade-remediation-recommendation-draft.md';
const recommendationDraftJsonFileName = 'adr-cascade-remediation-recommendation-draft.json';

export interface ProjectIntelligenceRecommendationDraftCliOptions {
  intakePath?: string;
  outputDir?: string;
}

export interface ProjectIntelligenceRecommendationDraftRunInput
  extends ProjectIntelligenceRecommendationDraftCliOptions {
  generatedAt?: string;
}

export interface ProjectIntelligenceRecommendationDraftRunResult {
  recommendationDraftPath: string;
  recommendationDraftJsonPath: string;
  itemCount: number;
}

export interface ProjectIntelligenceRecommendationDraftItem {
  id: string;
  path: string;
  severity: string;
  finding: string;
  evidence: string[];
  currentFinalDecision: ProjectIntelligenceAdrCascadeDecision | null;
  recommendedDecision: ProjectIntelligenceAdrCascadeDecision;
  rationale: string;
  risk: string;
  followUp: string;
}

export interface ProjectIntelligenceRecommendationDraft {
  schema: 'repoassure.project-intelligence.adr-cascade-recommendation-draft@1';
  status: 'maintainer_review_required';
  generatedAt: string;
  sourceIntake: string;
  summary: {
    items: number;
    recommendedRepair: number;
    finalDecisionsWritten: 0;
  };
  boundary: {
    finalMaintainerDecisionWritten: false;
    automaticDocRewriteAuthorized: false;
    automaticAdrRepairAuthorized: false;
    repairExecutionAuthorized: false;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
  };
  items: ProjectIntelligenceRecommendationDraftItem[];
}

interface ProjectIntelligenceRecommendationDraftMarkdownInput {
  generatedAt: string;
  intakePath: string;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceRecommendationDraftHelpRequest(args)) {
    process.stdout.write(projectIntelligenceRecommendationDraftHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceRecommendationDraft(
      parseProjectIntelligenceRecommendationDraftArgs(args)
    );
    process.stdout.write(formatProjectIntelligenceRecommendationDraftCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence recommendation draft failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceRecommendationDraftArgs(
  args: string[]
): ProjectIntelligenceRecommendationDraftCliOptions {
  let intakePath: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--intake' || arg.startsWith('--intake=')) {
      const value = readOptionValue(args, index, '--intake');
      intakePath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence recommendation draft option: ${arg}`);
  }

  return {
    ...(intakePath ? { intakePath } : {}),
    ...(outputDir ? { outputDir } : {})
  };
}

export function isProjectIntelligenceRecommendationDraftHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceRecommendationDraftHelpText(): string {
  return `hardening project intelligence recommendation draft

Usage:
  pnpm project:intelligence:recommendation-draft -- --intake <adr-cascade-remediation-decision-intake.json> --output <artifacts/project-graph>
  pnpm project:intelligence:recommendation-draft -- --help

Options:
  --intake <path>  ADR cascade decision intake JSON. Defaults to artifacts/project-graph/adr-cascade-remediation-decision-intake.json.
  --output <dir>   Output directory. Defaults to artifacts/project-graph.
  --help, -h       Show this help.

`;
}

export async function runProjectIntelligenceRecommendationDraft(
  input: ProjectIntelligenceRecommendationDraftRunInput = {}
): Promise<ProjectIntelligenceRecommendationDraftRunResult> {
  const intakePath = input.intakePath ? resolve(root, input.intakePath) : resolve(root, defaultIntakePath);
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : resolve(root, defaultOutputDir);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const intake = await readProjectIntelligenceDecisionIntake(intakePath);
  const recommendationDraft = buildProjectIntelligenceRecommendationDraft(intake, intakePath, generatedAt);
  const recommendationDraftPath = join(outputDir, recommendationDraftFileName);
  const recommendationDraftJsonPath = join(outputDir, recommendationDraftJsonFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(recommendationDraftPath, formatProjectIntelligenceRecommendationDraftMarkdown(
    recommendationDraft,
    { generatedAt, intakePath }
  ));
  await writeFile(recommendationDraftJsonPath, `${JSON.stringify(recommendationDraft, null, 2)}\n`);

  return {
    recommendationDraftPath,
    recommendationDraftJsonPath,
    itemCount: recommendationDraft.items.length
  };
}

export function formatProjectIntelligenceRecommendationDraftMarkdown(
  recommendationDraft: ProjectIntelligenceRecommendationDraft,
  input: ProjectIntelligenceRecommendationDraftMarkdownInput
): string {
  return [
    '# Project Intelligence ADR Cascade Remediation Recommendation Draft',
    '',
    `Status: ${recommendationDraft.status}`,
    `Generated at: ${input.generatedAt}`,
    `Generated from: ${basename(input.intakePath)}`,
    '',
    '## Decision Boundary',
    '',
    'This draft does not write final maintainer decisions.',
    'This draft does not authorize automatic ADR/spec/docs edits or repair execution.',
    'Generated graph artifacts remain local-only and ignored.',
    '',
    '## Summary',
    '',
    `- Draft items: ${recommendationDraft.summary.items}`,
    `- Recommended repair: ${recommendationDraft.summary.recommendedRepair}`,
    '- Final maintainer decisions written: 0',
    '',
    '## Items',
    '',
    ...recommendationDraft.items.flatMap(formatRecommendationDraftItem),
    ''
  ].join('\n');
}

function buildProjectIntelligenceRecommendationDraft(
  intake: ProjectIntelligenceDecisionIntake,
  intakePath: string,
  generatedAt: string
): ProjectIntelligenceRecommendationDraft {
  const items = intake.items.map(buildRecommendationDraftItem);

  return {
    schema: 'repoassure.project-intelligence.adr-cascade-recommendation-draft@1',
    status: 'maintainer_review_required',
    generatedAt,
    sourceIntake: intakePath,
    summary: {
      items: items.length,
      recommendedRepair: items.filter((item) => item.recommendedDecision === 'repair').length,
      finalDecisionsWritten: 0
    },
    boundary: {
      finalMaintainerDecisionWritten: false,
      automaticDocRewriteAuthorized: false,
      automaticAdrRepairAuthorized: false,
      repairExecutionAuthorized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false
    },
    items
  };
}

async function readProjectIntelligenceDecisionIntake(intakePath: string): Promise<ProjectIntelligenceDecisionIntake> {
  let raw: string;

  try {
    raw = await readFile(intakePath, 'utf8');
  } catch (error: unknown) {
    throw new Error(`missing ADR cascade decision intake: ${intakePath}`, { cause: error });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid ADR cascade decision intake: ${message}`, { cause: error });
  }

  if (!isProjectIntelligenceDecisionIntake(parsed)) {
    throw new Error('invalid ADR cascade decision intake: expected decision intake JSON');
  }

  return sanitizeDecisionIntake(parsed);
}

function isProjectIntelligenceDecisionIntake(value: unknown): value is ProjectIntelligenceDecisionIntake {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectIntelligenceDecisionIntake>;
  return candidate.schema === 'repoassure.project-intelligence.adr-cascade-decision-intake@1'
    && candidate.status === 'maintainer_decision_required'
    && candidate.boundary?.automaticDocRewriteAuthorized === false
    && candidate.boundary.automaticAdrRepairAuthorized === false
    && candidate.boundary.repairExecutionAuthorized === false
    && Array.isArray(candidate.items)
    && typeof candidate.summary?.items === 'number'
    && typeof candidate.summary.pending === 'number';
}

function buildRecommendationDraftItem(
  item: ProjectIntelligenceDecisionIntakeItem
): ProjectIntelligenceRecommendationDraftItem {
  return {
    id: item.id,
    path: item.path,
    severity: item.severity ?? 'unknown',
    finding: item.finding ?? 'unknown',
    evidence: item.evidence.map(redactRecommendationDraftText),
    currentFinalDecision: item.decision,
    recommendedDecision: recommendDecisionForItem(item),
    rationale: rationaleForItem(item),
    risk: riskForItem(item),
    followUp: 'Keep the item pending if maintainer disagrees; no source document is changed by this draft.'
  };
}

function sanitizeDecisionIntake(intake: ProjectIntelligenceDecisionIntake): ProjectIntelligenceDecisionIntake {
  return sanitizeJsonValue(intake) as ProjectIntelligenceDecisionIntake;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactRecommendationDraftText(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeJsonValue(entry)]));
  }

  return value;
}

function recommendDecisionForItem(item: ProjectIntelligenceDecisionIntakeItem): ProjectIntelligenceAdrCascadeDecision {
  if (item.finding === 'missing_cascade') {
    return 'repair';
  }

  return 'defer';
}

function rationaleForItem(item: ProjectIntelligenceDecisionIntakeItem): string {
  if (item.finding === 'missing_cascade') {
    return 'Missing cascade evidence should be repaired because downstream docs need graph-visible linkage.';
  }

  return 'Decision needs maintainer review because the finding type is not automatically classifiable.';
}

function riskForItem(item: ProjectIntelligenceDecisionIntakeItem): string {
  if (item.severity === 'medium') {
    return 'Medium documentation governance risk if left unresolved.';
  }

  return `${capitalize(item.severity ?? 'unknown')} documentation governance risk if left unresolved.`;
}

function formatRecommendationDraftItem(item: ProjectIntelligenceRecommendationDraftItem): string[] {
  return [
    `### ${item.id}: ${item.path}`,
    '',
    `- Finding: ${item.finding}`,
    `- Severity: ${item.severity}`,
    `- Evidence: ${item.evidence.length > 0 ? item.evidence.join(', ') : item.path}`,
    `- Current final decision: ${item.currentFinalDecision ?? 'pending'}`,
    `- Recommended decision: ${item.recommendedDecision}`,
    `- Rationale: ${item.rationale}`,
    `- Risk: ${item.risk}`,
    `- Rollback / follow-up: ${item.followUp}`,
    '- [ ] Maintainer decision: approve / defer / accept-risk / repair',
    '- [ ] Maintainer evidence note:',
    '- [ ] Maintainer owner:',
    '',
  ].map(redactRecommendationDraftText);
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

function redactRecommendationDraftText(value: string): string {
  return redactSensitiveText(value).replace(/Authorization:\s*Bearer\s+\S+/giu, '[REDACTED_AUTHORIZATION]');
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatProjectIntelligenceRecommendationDraftCliSummary(
  result: ProjectIntelligenceRecommendationDraftRunResult
): string {
  return [
    'Project intelligence ADR cascade recommendation draft generated.',
    `Recommendation draft: ${result.recommendationDraftPath}`,
    `Recommendation draft JSON: ${result.recommendationDraftJsonPath}`,
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
