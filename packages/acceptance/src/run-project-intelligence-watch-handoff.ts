import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatAcceptanceFatalError } from './fatal-error.js';
import { redactSensitiveText } from './redaction.js';
import type { ProjectIntelligenceAgentContext } from './run-project-intelligence-agent-context.js';
import type { ProjectIntelligenceWatchStatus } from './run-project-intelligence-watch.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const defaultOutputDir = 'artifacts/project-graph';
const handoffFileName = 'project-intelligence-watch-handoff.json';
const markdownFileName = 'project-intelligence-watch-handoff.md';
const watchStatusFileName = 'project-intelligence-watch-status.json';
const agentContextFileName = 'project-intelligence-agent-context.json';
const agentContextMarkdownFileName = 'project-intelligence-agent-context.md';
const snapshotFileName = 'project-intelligence-snapshot.json';

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

export interface ProjectIntelligenceWatchHandoffCliOptions {
  root?: string;
  outputDir?: string;
  statusPath?: string;
  agentContextPath?: string;
}

export interface ProjectIntelligenceWatchHandoffRunInput extends ProjectIntelligenceWatchHandoffCliOptions {
  generatedAt?: string;
}

export interface ProjectIntelligenceWatchHandoffRunResult {
  handoffPath: string;
  markdownPath: string;
  freshnessPassedCount: number;
}

export interface ProjectIntelligenceWatchHandoff {
  schema: 'repoassure.project-intelligence-watch-handoff@1';
  generatedAt: string;
  boundary: {
    localOnly: true;
    daemonized: false;
    hostedDashboardImplemented: false;
    telemetryEnabled: false;
    cloudSyncEnabled: false;
    targetRepoWriteAuthorized: false;
    prohibitedActions: string[];
  };
  commands: {
    start: 'pnpm project:intelligence:watch';
    smoke: 'pnpm project:intelligence:watch -- --once';
    agentContext: 'pnpm project:intelligence:agent-context';
    stop: 'Ctrl+C';
  };
  readOrder: string[];
  artifacts: {
    handoffJson: ProjectIntelligenceWatchHandoffArtifact;
    handoffMarkdown: ProjectIntelligenceWatchHandoffArtifact;
    watchStatus: ProjectIntelligenceWatchHandoffArtifact;
    agentContextJson: ProjectIntelligenceWatchHandoffArtifact;
    agentContextMarkdown: ProjectIntelligenceWatchHandoffArtifact;
    snapshot: ProjectIntelligenceWatchHandoffArtifact;
  };
  freshnessChecklist: ProjectIntelligenceWatchHandoffChecklistItem[];
  recoveryPlan: {
    status: 'not_needed' | 'required';
    failedChecks: string[];
    commands: ProjectIntelligenceWatchRecoveryCommand[];
    boundary: {
      localOnly: true;
      manualArtifactEditsAllowed: false;
      targetRepoWritesAllowed: false;
      hostedDashboardAllowed: false;
      telemetryAllowed: false;
      cloudSyncAllowed: false;
    };
  };
  maintainerReviewBoundary: {
    allowedActions: string[];
    prohibitedActions: string[];
  };
  stopInstructions: {
    foregroundOnly: true;
    manualStop: 'Ctrl+C';
    noDaemon: true;
  };
  redaction: {
    applied: true;
    prohibitedContent: string[];
  };
}

export interface ProjectIntelligenceWatchHandoffArtifact {
  path: string;
  status: 'available' | 'expected';
  schema?: string;
}

export interface ProjectIntelligenceWatchHandoffChecklistItem {
  id: string;
  status: 'passed' | 'failed';
  summary: string;
  evidence: string[];
}

export interface ProjectIntelligenceWatchRecoveryCommand {
  id: string;
  command: string;
  reason: string;
}

export async function main(args: string[] = process.argv.slice(2)): Promise<number> {
  if (isProjectIntelligenceWatchHandoffHelpRequest(args)) {
    process.stdout.write(projectIntelligenceWatchHandoffHelpText());
    return 0;
  }

  try {
    const result = await runProjectIntelligenceWatchHandoff(parseProjectIntelligenceWatchHandoffArgs(args));
    process.stdout.write(formatProjectIntelligenceWatchHandoffCliSummary(result));
    return 0;
  } catch (error: unknown) {
    process.stderr.write(`${formatAcceptanceFatalError('Project intelligence watch handoff failed', error)}\n`);
    return 1;
  }
}

export function parseProjectIntelligenceWatchHandoffArgs(
  args: string[]
): ProjectIntelligenceWatchHandoffCliOptions {
  let repoRoot: string | undefined;
  let outputDir: string | undefined;
  let statusPath: string | undefined;
  let agentContextPath: string | undefined;

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

    if (arg === '--output' || arg.startsWith('--output=')) {
      const value = readOptionValue(args, index, '--output');
      outputDir = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--status' || arg.startsWith('--status=')) {
      const value = readOptionValue(args, index, '--status');
      statusPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    if (arg === '--agent-context' || arg.startsWith('--agent-context=')) {
      const value = readOptionValue(args, index, '--agent-context');
      agentContextPath = resolve(root, value.value);
      index += value.consumedNext ? 1 : 0;
      continue;
    }

    throw new Error(`Unknown project intelligence watch handoff option: ${arg}`);
  }

  return {
    ...(repoRoot ? { root: repoRoot } : {}),
    ...(outputDir ? { outputDir } : {}),
    ...(statusPath ? { statusPath } : {}),
    ...(agentContextPath ? { agentContextPath } : {})
  };
}

export function isProjectIntelligenceWatchHandoffHelpRequest(args: string[]): boolean {
  return args.some((arg) => arg === '--help' || arg === '-h');
}

export function projectIntelligenceWatchHandoffHelpText(): string {
  return `hardening project intelligence watch handoff

Usage:
  pnpm project:intelligence:watch-handoff
  pnpm project:intelligence:watch-handoff -- --status <project-intelligence-watch-status.json> --agent-context <project-intelligence-agent-context.json>
  pnpm project:intelligence:watch-handoff -- --help

Options:
  --root <path>           Repository root. Defaults to the current RepoAssure workspace.
  --output <dir>          Output directory. Defaults to artifacts/project-graph.
  --status <path>         Watch status JSON. Defaults to artifacts/project-graph/project-intelligence-watch-status.json.
  --agent-context <path>  Agent context JSON. Defaults to artifacts/project-graph/project-intelligence-agent-context.json.
  --help, -h              Show this help.

Boundaries:
  Local-only AI IDE handoff. No hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo write is authorized.

`;
}

export async function runProjectIntelligenceWatchHandoff(
  input: ProjectIntelligenceWatchHandoffRunInput = {}
): Promise<ProjectIntelligenceWatchHandoffRunResult> {
  const repoRoot = input.root ? resolve(root, input.root) : root;
  const outputDir = input.outputDir ? resolve(root, input.outputDir) : resolve(repoRoot, defaultOutputDir);
  const statusPath = input.statusPath ? resolve(root, input.statusPath) : join(outputDir, watchStatusFileName);
  const agentContextPath = input.agentContextPath
    ? resolve(root, input.agentContextPath)
    : join(outputDir, agentContextFileName);
  const watchStatus = await readWatchStatus(statusPath);
  const agentContext = await readAgentContext(agentContextPath);
  const handoff = buildProjectIntelligenceWatchHandoff({
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    watchStatus,
    agentContext
  });
  await markAvailableArtifacts(handoff, repoRoot, outputDir);
  const handoffPath = join(outputDir, handoffFileName);
  const markdownPath = join(outputDir, markdownFileName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(handoffPath, `${JSON.stringify(handoff, null, 2)}\n`);
  await writeFile(markdownPath, formatProjectIntelligenceWatchHandoffMarkdown(handoff));

  return {
    handoffPath,
    markdownPath,
    freshnessPassedCount: handoff.freshnessChecklist.filter((item) => item.status === 'passed').length
  };
}

export function buildProjectIntelligenceWatchHandoff(input: {
  generatedAt: string;
  watchStatus: ProjectIntelligenceWatchStatus;
  agentContext: ProjectIntelligenceAgentContext;
}): ProjectIntelligenceWatchHandoff {
  const freshnessChecklist = buildFreshnessChecklist(input.watchStatus, input.agentContext);
  const handoff: ProjectIntelligenceWatchHandoff = {
    schema: 'repoassure.project-intelligence-watch-handoff@1',
    generatedAt: input.generatedAt,
    boundary: {
      localOnly: true,
      daemonized: false,
      hostedDashboardImplemented: false,
      telemetryEnabled: false,
      cloudSyncEnabled: false,
      targetRepoWriteAuthorized: false,
      prohibitedActions: [...prohibitedActions]
    },
    commands: {
      start: 'pnpm project:intelligence:watch',
      smoke: 'pnpm project:intelligence:watch -- --once',
      agentContext: 'pnpm project:intelligence:agent-context',
      stop: 'Ctrl+C'
    },
    readOrder: [
      handoffFileName,
      watchStatusFileName,
      agentContextFileName,
      agentContextMarkdownFileName,
      snapshotFileName,
      '.autopilot/progress/snapshot.json',
      '.autopilot/goals/index.json',
      '.autopilot/goals/<active-goal>.json',
      'docs/PLAN.md',
      'docs/SPEC.md',
      'docs/PRD.md'
    ],
    artifacts: {
      handoffJson: { path: join(defaultOutputDir, handoffFileName), status: 'available', schema: 'repoassure.project-intelligence-watch-handoff@1' },
      handoffMarkdown: { path: join(defaultOutputDir, markdownFileName), status: 'available' },
      watchStatus: { path: join(defaultOutputDir, watchStatusFileName), status: 'available', schema: input.watchStatus.schema },
      agentContextJson: { path: join(defaultOutputDir, agentContextFileName), status: 'available', schema: input.agentContext.schema },
      agentContextMarkdown: { path: join(defaultOutputDir, agentContextMarkdownFileName), status: 'expected' },
      snapshot: {
        path: input.watchStatus.lastOutputs?.snapshotPath ?? join(defaultOutputDir, snapshotFileName),
        status: 'expected'
      }
    },
    freshnessChecklist,
    recoveryPlan: buildRecoveryPlan(freshnessChecklist),
    maintainerReviewBoundary: {
      allowedActions: [
        'read local Project Intelligence artifacts',
        'confirm watch status freshness',
        'propose the next local-only Codex goal',
        'request maintainer review for gated actions'
      ],
      prohibitedActions: [...prohibitedActions]
    },
    stopInstructions: {
      foregroundOnly: true,
      manualStop: 'Ctrl+C',
      noDaemon: true
    },
    redaction: {
      applied: true,
      prohibitedContent: ['secret values', 'authorization tokens', 'private generated artifacts']
    }
  };

  return sanitizeHandoff(handoff);
}

export function formatProjectIntelligenceWatchHandoffMarkdown(
  handoff: ProjectIntelligenceWatchHandoff
): string {
  return [
    '# Project Intelligence Watch Handoff',
    '',
    `Generated at: ${handoff.generatedAt}`,
    '',
    'Boundary: local-only AI IDE handoff. No hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo write is authorized.',
    '',
    '## Commands',
    '',
    `- Start watch: \`${handoff.commands.start}\``,
    `- Smoke check: \`${handoff.commands.smoke}\``,
    `- Regenerate agent context: \`${handoff.commands.agentContext}\``,
    `- Stop foreground watch: \`${handoff.commands.stop}\``,
    '',
    '## AI IDE Read Order',
    '',
    ...handoff.readOrder.map((path, index) => `${index + 1}. \`${path}\``),
    '',
    '## Freshness Checklist',
    '',
    ...handoff.freshnessChecklist.map((item) => `- ${item.status}: ${item.id} — ${item.summary} (${item.evidence.join(', ')})`),
    '',
    '## Recovery Plan',
    '',
    `Recovery status: ${handoff.recoveryPlan.status}`,
    `Failed checks: ${handoff.recoveryPlan.failedChecks.length > 0 ? handoff.recoveryPlan.failedChecks.join(', ') : 'none'}`,
    '',
    'Do not repair freshness failures by editing generated artifacts by hand.',
    'Regenerate source-derived artifacts with local commands only.',
    '',
    ...(handoff.recoveryPlan.commands.length > 0
      ? handoff.recoveryPlan.commands.map((command) => `- \`${command.command}\` — ${command.reason}`)
      : ['- No recovery command needed; freshness checks passed.']),
    '',
    '## Stop Boundary',
    '',
    '- Foreground only: true',
    `- Manual stop: \`${handoff.stopInstructions.manualStop}\``,
    '- Daemonized watcher: false',
    '',
    '## Maintainer Review Boundary',
    '',
    ...handoff.maintainerReviewBoundary.prohibitedActions.map((action) => `- Not authorized: ${action}`),
    ''
  ].join('\n');
}

function buildFreshnessChecklist(
  watchStatus: ProjectIntelligenceWatchStatus,
  agentContext: ProjectIntelligenceAgentContext
): ProjectIntelligenceWatchHandoffChecklistItem[] {
  return [
    {
      id: 'watch_status_schema',
      status: watchStatus.schema === 'repoassure.project-intelligence-watch-status@1' ? 'passed' : 'failed',
      summary: 'Watch status artifact uses the expected schema.',
      evidence: [watchStatusFileName]
    },
    {
      id: 'watch_refresh_count',
      status: watchStatus.refreshCount > 0 && watchStatus.status !== 'failed' ? 'passed' : 'failed',
      summary: `Watch mode recorded ${watchStatus.refreshCount} successful refresh cycle(s).`,
      evidence: [watchStatusFileName]
    },
    {
      id: 'watch_commands',
      status: includesAll(watchStatus.lastSuccessfulCommands, ['pnpm project:intelligence', 'pnpm project:intelligence:agent-context'])
        ? 'passed'
        : 'failed',
      summary: 'Watch mode refreshed snapshot before agent context.',
      evidence: [watchStatusFileName]
    },
    {
      id: 'agent_context_schema',
      status: agentContext.schema === 'repoassure.project-intelligence-agent-context@1' ? 'passed' : 'failed',
      summary: 'Agent context artifact uses the expected schema.',
      evidence: [agentContextFileName]
    },
    {
      id: 'watch_boundary',
      status: watchStatus.boundary.localOnly === true
        && watchStatus.boundary.daemonized === false
        && watchStatus.boundary.hostedDashboardImplemented === false
        && watchStatus.boundary.telemetryEnabled === false
        && watchStatus.boundary.cloudSyncEnabled === false
        && watchStatus.boundary.targetRepoWriteAuthorized === false
        && watchStatus.boundary.manualStop === 'Ctrl+C'
        ? 'passed'
        : 'failed',
      summary: 'Watch mode remains local-only, foreground-only, and manually stopped.',
      evidence: [watchStatusFileName]
    },
    {
      id: 'agent_context_boundary',
      status: agentContext.boundary.localOnly === true
        && agentContext.boundary.hostedDashboardImplemented === false
        && agentContext.boundary.telemetryEnabled === false
        && agentContext.boundary.targetRepoWriteAuthorized === false
        ? 'passed'
        : 'failed',
      summary: 'Agent context does not authorize hosted dashboard, telemetry, or target repo writes.',
      evidence: [agentContextFileName]
    }
  ];
}

function buildRecoveryPlan(
  checklist: ProjectIntelligenceWatchHandoffChecklistItem[]
): ProjectIntelligenceWatchHandoff['recoveryPlan'] {
  const failedChecks = checklist.filter((item) => item.status === 'failed').map((item) => item.id);

  return {
    status: failedChecks.length > 0 ? 'required' : 'not_needed',
    failedChecks,
    commands: failedChecks.length > 0
      ? [
          {
            id: 'regenerate_snapshot_and_context',
            command: 'pnpm project:intelligence:watch -- --once',
            reason: 'Regenerate source-derived snapshot, agent context, and watch status from local source-of-truth files.'
          },
          {
            id: 'regenerate_handoff',
            command: 'pnpm project:intelligence:watch-handoff',
            reason: 'Regenerate the AI IDE handoff after freshness artifacts have been refreshed.'
          },
          {
            id: 'inspect_handoff',
            command: 'cat artifacts/project-graph/project-intelligence-watch-handoff.md',
            reason: 'Review the refreshed human-readable recovery and boundary guidance.'
          }
        ]
      : [],
    boundary: {
      localOnly: true,
      manualArtifactEditsAllowed: false,
      targetRepoWritesAllowed: false,
      hostedDashboardAllowed: false,
      telemetryAllowed: false,
      cloudSyncAllowed: false
    }
  };
}

async function readWatchStatus(path: string): Promise<ProjectIntelligenceWatchStatus> {
  const parsed = await readJson(path, 'project intelligence watch status');

  if (!isWatchStatus(parsed)) {
    throw new Error(`invalid project intelligence watch status: ${path}`);
  }

  return JSON.parse(redactSensitiveText(JSON.stringify(parsed))) as ProjectIntelligenceWatchStatus;
}

async function readAgentContext(path: string): Promise<ProjectIntelligenceAgentContext> {
  const parsed = await readJson(path, 'project intelligence agent context');

  if (!isAgentContext(parsed)) {
    throw new Error(`invalid project intelligence agent context: ${path}`);
  }

  return JSON.parse(redactSensitiveText(JSON.stringify(parsed))) as ProjectIntelligenceAgentContext;
}

async function readJson(path: string, label: string): Promise<unknown> {
  let raw: string;

  try {
    raw = await readFile(path, 'utf8');
  } catch {
    throw new Error(`missing ${label}: ${path}`);
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid ${label}: ${message}`, { cause: error });
  }
}

function isWatchStatus(value: unknown): value is ProjectIntelligenceWatchStatus {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectIntelligenceWatchStatus>;
  return candidate.schema === 'repoassure.project-intelligence-watch-status@1'
    && typeof candidate.refreshCount === 'number'
    && Array.isArray(candidate.lastSuccessfulCommands)
    && candidate.boundary?.localOnly === true;
}

function isAgentContext(value: unknown): value is ProjectIntelligenceAgentContext {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectIntelligenceAgentContext>;
  return candidate.schema === 'repoassure.project-intelligence-agent-context@1'
    && candidate.boundary?.localOnly === true
    && Array.isArray(candidate.readOrder);
}

function readOptionValue(
  args: string[],
  index: number,
  option: string
): { value: string; consumedNext: boolean } {
  const arg = args[index] ?? '';

  if (arg.startsWith(`${option}=`)) {
    const value = arg.slice(option.length + 1);
    if (!value) {
      throw new Error(`${option} requires a value`);
    }

    return { value, consumedNext: false };
  }

  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${option} requires a value`);
  }

  return { value, consumedNext: true };
}

function includesAll(values: string[], expected: string[]): boolean {
  return expected.every((item) => values.includes(item));
}

function sanitizeHandoff(handoff: ProjectIntelligenceWatchHandoff): ProjectIntelligenceWatchHandoff {
  return JSON.parse(redactSensitiveText(JSON.stringify(handoff))) as ProjectIntelligenceWatchHandoff;
}

async function markAvailableArtifacts(
  handoff: ProjectIntelligenceWatchHandoff,
  repoRoot: string,
  outputDir: string
): Promise<void> {
  const artifactPaths: Array<[ProjectIntelligenceWatchHandoffArtifact, string]> = [
    [handoff.artifacts.agentContextMarkdown, join(outputDir, agentContextMarkdownFileName)],
    [handoff.artifacts.snapshot, resolveArtifactPath(repoRoot, handoff.artifacts.snapshot.path)]
  ];

  await Promise.all(artifactPaths.map(async ([artifact, absolutePath]) => {
    if (await fileExists(absolutePath)) {
      artifact.status = 'available';
    }
  }));
}

function resolveArtifactPath(repoRoot: string, artifactPath: string): string {
  return artifactPath.startsWith('/') ? artifactPath : join(repoRoot, artifactPath);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function formatProjectIntelligenceWatchHandoffCliSummary(
  result: ProjectIntelligenceWatchHandoffRunResult
): string {
  return [
    'Project Intelligence watch handoff generated.',
    `Handoff JSON: ${result.handoffPath}`,
    `Handoff Markdown: ${result.markdownPath}`,
    `Freshness checks passed: ${result.freshnessPassedCount}`,
    ''
  ].join('\n');
}

if (process.argv[1] && basename(process.argv[1]) === 'run-project-intelligence-watch-handoff.js') {
  void main().then((code) => {
    process.exitCode = code;
  });
}
