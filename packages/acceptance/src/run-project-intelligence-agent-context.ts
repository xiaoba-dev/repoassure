import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type { ProjectIntelligenceSnapshot } from './run-project-intelligence-snapshot.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultSnapshotPath = 'artifacts/project-graph/project-intelligence-snapshot.json';
const defaultOutputDir = 'artifacts/project-graph';
const contextFileName = 'project-intelligence-agent-context.json';
const markdownFileName = 'project-intelligence-agent-context.md';

const prohibitedActions = [
  'hosted_dashboard',
  'cloud_sync',
  'telemetry',
  'deployment',
  'public_release',
  'repository_visibility_change',
  'npm_publication',
  'github_release',
  'target_repo_write',
  'customer_contact',
  'pricing_change',
  'spend_change',
  'website_design_system_rewrite'
] as const;

export interface ProjectIntelligenceAgentContextCliOptions {
  root?: string;
  snapshotPath?: string;
  outputDir?: string;
}

export interface ProjectIntelligenceAgentContextRunInput extends ProjectIntelligenceAgentContextCliOptions {
  generatedAt?: string;
}

export interface ProjectIntelligenceAgentContextRunResult {
  contextPath: string;
  markdownPath: string;
  productSurfaceCount: number;
  blockerCount: number;
  recommendedGoalCount: number;
}

export interface ProjectIntelligenceAgentContext {
  schema: 'repoassure.project-intelligence-agent-context@1';
  generatedAt: string;
  boundary: {
    localOnly: true;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
    targetRepoWriteAuthorized: false;
    prohibitedActions: string[];
  };
  readOrder: string[];
  currentGoal: {
    id: string;
    status: string;
  };
  recommendedNextGoals: Array<{
    id: string;
    priority: string;
    rationale: string;
  }>;
  productSurfaces: Array<{
    id: string;
    status: string;
    evidence: string[];
  }>;
  blockers: Array<{
    id: string;
    status: string;
    evidence: string[];
  }>;
  evidencePaths: string[];
  redaction: {
    applied: true;
    prohibitedContent: string[];
  };
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceAgentContextHelpRequest(args)) {
    process.stdout.write(projectIntelligenceAgentContextHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceAgentContext(parseProjectIntelligenceAgentContextArgs(args));
    process.stdout.write(formatProjectIntelligenceAgentContextCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence agent context failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceAgentContextArgs(
  args: string[]
): ProjectIntelligenceAgentContextCliOptions {
  let repoRoot: string | undefined;
  let snapshotPath: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg || arg === '--') {
      continue;
    }

    if (arg === '--root' || arg.startsWith('--root=')) {
      const value = readOptionValue(args, index, '--root');
      repoRoot = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--snapshot' || arg.startsWith('--snapshot=')) {
      const value = readOptionValue(args, index, '--snapshot');
      snapshotPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence agent context option: ${arg}`);
  }

  return {
    ...(repoRoot ? { root: repoRoot } : {}),
    ...(snapshotPath ? { snapshotPath } : {}),
    ...(outputDir ? { outputDir } : {})
  };
}

export function isProjectIntelligenceAgentContextHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceAgentContextHelpText(): string {
  return `hardening project intelligence agent context

Usage:
  pnpm project:intelligence:agent-context -- --snapshot <project-intelligence-snapshot.json> --output <artifacts/project-graph>
  pnpm project:intelligence:agent-context -- --help

Options:
  --root <path>      Repository root. Defaults to the current RepoAssure workspace.
  --snapshot <path>  Project intelligence snapshot JSON. Defaults to artifacts/project-graph/project-intelligence-snapshot.json.
  --output <dir>     Output directory. Defaults to artifacts/project-graph.
  --help, -h         Show this help.

`;
}

export async function runProjectIntelligenceAgentContext(
  input: ProjectIntelligenceAgentContextRunInput = {}
): Promise<ProjectIntelligenceAgentContextRunResult> {
  const repoRoot = input.root ? resolve(root, input.root) : root;
  const snapshotPath = input.snapshotPath ? resolve(root, input.snapshotPath) : resolve(repoRoot, defaultSnapshotPath);
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : resolve(repoRoot, defaultOutputDir);
  const snapshot = await readProjectIntelligenceSnapshot(snapshotPath);
  const progress = await readOptionalJson(join(repoRoot, '.autopilot', 'progress', 'snapshot.json'));
  const activeGoal = await readActiveGoal(repoRoot, progress);
  const context = buildProjectIntelligenceAgentContext({
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    snapshot,
    ...(progress ? { progress } : {}),
    ...(activeGoal ? { activeGoal } : {})
  });
  const contextPath = join(outputDir, contextFileName);
  const markdownPath = join(outputDir, markdownFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(contextPath, `${JSON.stringify(context, null, 2)}\n`);
  await writeFile(markdownPath, formatProjectIntelligenceAgentContextMarkdown(context));

  return {
    contextPath,
    markdownPath,
    productSurfaceCount: context.productSurfaces.length,
    blockerCount: context.blockers.length,
    recommendedGoalCount: context.recommendedNextGoals.length
  };
}

export function buildProjectIntelligenceAgentContext(input: {
  generatedAt: string;
  snapshot: ProjectIntelligenceSnapshot;
  progress?: Record<string, unknown>;
  activeGoal?: Record<string, unknown>;
}): ProjectIntelligenceAgentContext {
  const activeGoalId = readString(readObject(input.progress?.active_goal)?.id)
    ?? readString(readObject(input.progress?.next_goal)?.id)
    ?? readString(input.activeGoal?.id)
    ?? 'unknown';
  const activeGoalStatus = readString(readObject(input.progress?.active_goal)?.status)
    ?? readString(readObject(input.progress?.next_goal)?.status)
    ?? readString(input.activeGoal?.status)
    ?? 'unknown';

  const context: ProjectIntelligenceAgentContext = {
    schema: 'repoassure.project-intelligence-agent-context@1',
    generatedAt: input.generatedAt,
    boundary: {
      localOnly: true,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      targetRepoWriteAuthorized: false,
      prohibitedActions: [...prohibitedActions]
    },
    readOrder: [
      contextFileName,
      basename(defaultSnapshotPath),
      '.autopilot/progress/snapshot.json',
      '.autopilot/goals/index.json',
      '.autopilot/goals/<active-goal>.json',
      'docs/PLAN.md',
      'docs/SPEC.md',
      'docs/PRD.md'
    ],
    currentGoal: {
      id: activeGoalId,
      status: activeGoalStatus
    },
    recommendedNextGoals: buildRecommendedNextGoals(activeGoalId, input.activeGoal),
    productSurfaces: buildProductSurfaces(input.snapshot),
    blockers: buildBlockers(input.progress, input.activeGoal),
    evidencePaths: [
      defaultSnapshotPath,
      '.autopilot/progress/snapshot.json',
      '.autopilot/goals/index.json',
      activeGoalId === 'unknown' ? '.autopilot/goals/<active-goal>.json' : `.autopilot/goals/${activeGoalId}.json`,
      'docs/product/specs/project-intelligence-console-spec-v0.1.md',
      'docs/operations/repoassure-product-completion-gap-audit-v0.1.md'
    ],
    redaction: {
      applied: true,
      prohibitedContent: ['secret values', 'authorization tokens', 'private generated artifacts']
    }
  };

  return sanitizeContext(context);
}

export function formatProjectIntelligenceAgentContextMarkdown(context: ProjectIntelligenceAgentContext): string {
  return [
    '# Project Intelligence Agent Context',
    '',
    `Generated at: ${context.generatedAt}`,
    '',
    'Boundary: local-only agent context export. No hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo write is authorized.',
    '',
    '## Current Goal',
    '',
    `- ID: ${context.currentGoal.id}`,
    `- Status: ${context.currentGoal.status}`,
    '',
    '## Read Order',
    '',
    ...context.readOrder.map((path, index) => `${index + 1}. \`${path}\``),
    '',
    '## Recommended Next Goals',
    '',
    ...context.recommendedNextGoals.map((goal) => `- ${goal.priority}: ${titleFromGoalId(goal.id)} (\`${goal.id}\`) — ${goal.rationale}`),
    '',
    '## Product Surfaces',
    '',
    ...context.productSurfaces.map((surface) => `- ${surface.status}: ${surface.id} (${surface.evidence.join(', ')})`),
    '',
    '## Blockers and Non-Authorization Boundary',
    '',
    ...context.blockers.map((blocker) => `- ${blocker.status}: ${blocker.id} (${blocker.evidence.join(', ')})`),
    '',
    '## Evidence Paths',
    '',
    ...context.evidencePaths.map((path) => `- \`${path}\``),
    ''
  ].join('\n');
}

async function readProjectIntelligenceSnapshot(snapshotPath: string): Promise<ProjectIntelligenceSnapshot> {
  let raw: string;

  try {
    raw = await readFile(snapshotPath, 'utf8');
  } catch {
    throw new Error(`missing project intelligence snapshot: ${snapshotPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid project intelligence snapshot: ${message}`, { cause: error });
  }

  if (!isProjectIntelligenceSnapshot(parsed)) {
    throw new Error('invalid project intelligence snapshot: expected local-only repoassure.project-intelligence snapshot');
  }

  return JSON.parse(redactSensitiveText(JSON.stringify(parsed))) as ProjectIntelligenceSnapshot;
}

async function readOptionalJson(path: string): Promise<Record<string, unknown> | undefined> {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
    return readObject(parsed);
  } catch {
    return undefined;
  }
}

async function readActiveGoal(
  repoRoot: string,
  progress: Record<string, unknown> | undefined
): Promise<Record<string, unknown> | undefined> {
  const activeGoalId = readString(readObject(progress?.active_goal)?.id)
    ?? readString(readObject(progress?.next_goal)?.id);
  if (!activeGoalId) {
    return undefined;
  }

  return readOptionalJson(join(repoRoot, '.autopilot', 'goals', `${activeGoalId}.json`));
}

function isProjectIntelligenceSnapshot(value: unknown): value is ProjectIntelligenceSnapshot {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectIntelligenceSnapshot>;
  return candidate.schemaVersion === 1
    && candidate.boundary?.localOnly === true
    && candidate.boundary.hostedDashboardImplemented === false
    && candidate.boundary.telemetryEnabled === false
    && Array.isArray(candidate.findings)
    && typeof candidate.summary?.findings?.total === 'number';
}

function buildRecommendedNextGoals(
  activeGoalId: string,
  activeGoal: Record<string, unknown> | undefined
): ProjectIntelligenceAgentContext['recommendedNextGoals'] {
  const objective = readString(activeGoal?.objective) ?? '';
  const goals = activeGoalId === 'unknown'
    ? []
    : [{
      id: activeGoalId,
      priority: readString(activeGoal?.priority) ?? 'P1',
      rationale: objective || 'Active local-only Project Intelligence goal from .autopilot progress state.'
    }];

  return goals.length > 0
    ? goals
    : [{
      id: 'project-intelligence-agent-context-export-v0.1',
      priority: 'P1',
      rationale: 'Generate a local-only context package before selecting broader Project Intelligence automation.'
    }];
}

function buildProductSurfaces(snapshot: ProjectIntelligenceSnapshot): ProjectIntelligenceAgentContext['productSurfaces'] {
  const surfaces: ProjectIntelligenceAgentContext['productSurfaces'] = [
    {
      id: 'project_intelligence_snapshot',
      status: 'implemented',
      evidence: [defaultSnapshotPath]
    }
  ];

  if (snapshot.docsGraph.nodes.some((node) => node.path?.includes('project-intelligence-console-spec'))) {
    surfaces.push({
      id: 'project_intelligence_spec',
      status: 'implemented',
      evidence: ['docs/product/specs/project-intelligence-console-spec-v0.1.md']
    });
  }

  if (snapshot.codeGraph.nodes.some((node) => node.id === 'packages/acceptance')) {
    surfaces.push({
      id: 'acceptance_package',
      status: 'implemented',
      evidence: ['packages/acceptance']
    });
  }

  surfaces.push({
    id: 'project_intelligence_viewer',
    status: 'implemented',
    evidence: ['artifacts/project-graph/project-intelligence-viewer.html']
  });

  return surfaces;
}

function buildBlockers(
  progress: Record<string, unknown> | undefined,
  activeGoal: Record<string, unknown> | undefined
): ProjectIntelligenceAgentContext['blockers'] {
  const progressBlockedActions = readStringArray(progress?.blocked_actions);
  const goalBlockedActions = readStringArray(activeGoal?.blocked_actions);
  const blocked = new Set([...progressBlockedActions, ...goalBlockedActions, ...prohibitedActions]);

  return [...blocked].sort().map((id) => ({
    id,
    status: id === 'public_release' || id === 'repository_visibility_change' || id === 'npm_publication' || id === 'github_release'
      ? 'manual_gate'
      : 'not_authorized',
    evidence: [
      '.autopilot/progress/snapshot.json',
      '.autopilot/goals/<active-goal>.json'
    ]
  }));
}

function readObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? redactSensitiveText(value) : undefined;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(redactSensitiveText)
    : [];
}

function sanitizeContext(context: ProjectIntelligenceAgentContext): ProjectIntelligenceAgentContext {
  return JSON.parse(redactSensitiveText(JSON.stringify(context))) as ProjectIntelligenceAgentContext;
}

function titleFromGoalId(id: string): string {
  const version = id.match(/-v\d+(?:\.\d+)*$/u)?.[0].slice(1);
  const title = id
    .replace(/-v\d+(?:\.\d+)*$/u, '')
    .split('-')
    .map((part) => part.length === 0 ? part : `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ')
    .replace(/\bAdr\b/gu, 'ADR')
    .replace(/\bAi\b/gu, 'AI');
  return version ? `${title} ${version}` : title;
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

function formatProjectIntelligenceAgentContextCliSummary(
  result: ProjectIntelligenceAgentContextRunResult
): string {
  return [
    'Project intelligence agent context generated.',
    `Context: ${result.contextPath}`,
    `Markdown: ${result.markdownPath}`,
    `Product surfaces: ${result.productSurfaceCount}`,
    `Blockers: ${result.blockerCount}`,
    `Recommended goals: ${result.recommendedGoalCount}`,
    ''
  ].join('\n');
}

export function isDirectRun(metaUrl: string = import.meta.url, argvPath: string | undefined = process.argv[1]): boolean {
  return Boolean(argvPath && metaUrl === new URL(`file://${resolve(argvPath)}`).href);
}

if (isDirectRun()) {
  process.exitCode = await main();
}
