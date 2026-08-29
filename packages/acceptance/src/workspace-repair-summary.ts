import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';

import { redactSensitiveText } from './redaction.js';

const workspaceRepairSummarySchema = 'repoassure.workspace-repair-summary.v1';
const summaryJsonName = 'workspace-repair-summary.json';
const summaryMarkdownName = 'workspace-repair-summary.md';

export type WorkspaceRepairRepositoryState =
  | 'ready'
  | 'no_tasks'
  | 'stale'
  | 'missing_artifacts'
  | 'invalid_artifacts'
  | 'identity_collision';

export type WorkspaceRepairSummaryStatus = 'ready' | 'partial' | 'blocked' | 'empty';
export type WorkspaceRepairSeverity = 'P0' | 'P1' | 'P2';

export interface RunWorkspaceRepairSummaryInput {
  workspaceManifestPath: string;
  outputDir: string;
  generatedAt?: string;
}

export interface WorkspaceRepairSummaryRunResult {
  jsonPath: string;
  markdownPath: string;
  status: WorkspaceRepairSummaryStatus;
  repositoryCount: number;
  taskCount: number;
}

export interface WorkspaceRepairSummaryArtifact {
  schema: typeof workspaceRepairSummarySchema;
  schemaVersion: 1;
  generatedAt: string;
  sourceWorkspaceManifest: string;
  workspaceOutputDir: string;
  status: WorkspaceRepairSummaryStatus;
  summary: WorkspaceRepairSummaryCounts;
  agentContract: WorkspaceRepairAgentContract;
  repositories: WorkspaceRepairRepository[];
  crossRepoActionQueue: WorkspaceRepairQueueItem[];
  diagnostics: WorkspaceRepairDiagnostic[];
  maintainerReview: WorkspaceRepairMaintainerReview;
  redaction: WorkspaceRepairRedaction;
  noWriteProof: WorkspaceRepairNoWriteProof;
}

export interface WorkspaceRepairSummaryCounts {
  totalRepositories: number;
  readyRepositories: number;
  blockedRepositories: number;
  noTaskRepositories: number;
  totalTasks: number;
  p0: number;
  p1: number;
  p2: number;
  requiresMaintainerReview: boolean;
}

export interface WorkspaceRepairAgentContract {
  readOrder: string[];
  boundaries: string[];
}

export interface WorkspaceRepairRepository {
  rank: number | null;
  repoSlug: string;
  repoRoot: string;
  latestRunId: string;
  state: WorkspaceRepairRepositoryState;
  stateReasons: string[];
  sourceManifest: string;
  repairTaskPackage: string | null;
  repairPlan: string | null;
  taskSummary: {
    totalTasks: number;
    p0: number;
    p1: number;
    p2: number;
  };
  highestSeverity: WorkspaceRepairSeverity | null;
  recommendedTaskId: string | null;
  requiresMaintainerReview: boolean;
}

export interface WorkspaceRepairQueueItem {
  workspaceTaskId: string;
  rank: number;
  repoSlug: string;
  repoRoot: string;
  taskId: string;
  severity: WorkspaceRepairSeverity;
  title: string;
  objective: string;
  sourceTaskPackage: string;
  verificationCommands: string[];
  requiresMaintainerReview: true;
}

export interface WorkspaceRepairDiagnostic {
  repoSlug: string;
  code: string;
  message: string;
}

export interface WorkspaceRepairMaintainerReview {
  required: boolean;
  reasons: string[];
  allowedDecisions: Array<'approve' | 'reject' | 'defer' | 'accept_risk'>;
  requiredBefore: string[];
}

export interface WorkspaceRepairRedaction {
  applied: true;
  guarantee: string;
  prohibitedContent: string[];
}

export interface WorkspaceRepairNoWriteProof {
  targetRepoWriteAuthorized: false;
  sourceFilesChanged: false;
  commandsExecuted: false;
  patchesApplied: false;
  outputPaths: string[];
  prohibitedActions: string[];
}

interface WorkspaceManifest {
  schemaVersion: 1;
  generatedAt: string;
  workspaceOutputDir: string;
  repos: WorkspaceManifestRepository[];
}

interface WorkspaceManifestRepository {
  repoSlug: string;
  repoRoot: string;
  latestRunId: string;
  latestRunDir: string;
  latestManifest: string;
  invalidEntry?: boolean;
}

interface RunManifest {
  schemaVersion: 1;
  runId: string;
  repoRoot: string;
  entrypoints: {
    repairTaskPackage: string;
    repairPlan: string;
  };
}

interface RepairTaskPackage {
  schemaVersion: 1;
  generatedAt: string;
  runId: string;
  repoRoot: string;
  sourceManifest: string;
  summary: RepairArtifactSummary;
  tasks: RepairTask[];
}

interface RepairPlan {
  schemaVersion: 1;
  generatedAt: string;
  runId: string;
  repoRoot: string;
  sourceManifest: string;
  summary: RepairArtifactSummary;
  tasks: unknown[];
}

interface RepairArtifactSummary {
  totalTasks: number;
  p0: number;
  p1: number;
  p2: number;
}

interface RepairTask {
  taskId: string;
  severity: WorkspaceRepairSeverity;
  title: string;
  objective: string;
  verification: {
    commands: string[];
  };
}

interface ProcessedRepository {
  source: WorkspaceManifestRepository;
  state: WorkspaceRepairRepositoryState;
  stateReasons: string[];
  diagnostics: WorkspaceRepairDiagnostic[];
  runManifest: RunManifest | null;
  taskPackage: RepairTaskPackage | null;
}

export async function runWorkspaceRepairSummary(
  input: RunWorkspaceRepairSummaryInput
): Promise<WorkspaceRepairSummaryRunResult> {
  const workspaceManifestPath = resolve(input.workspaceManifestPath);
  const outputDir = resolve(input.outputDir);
  const workspaceManifest = parseWorkspaceManifest(await readFile(workspaceManifestPath, 'utf8'));

  assertOutputOutsideRepositories(outputDir, workspaceManifest.repos);

  const collisionIndexes = findIdentityCollisionIndexes(workspaceManifest.repos);
  const processedRepositories = await Promise.all(
    workspaceManifest.repos.map(async (repository, index) => {
      if (repository.invalidEntry) {
        return blockedRepository(
          repository,
          'invalid_artifacts',
          'invalid_workspace_repository',
          'Workspace repository entry is missing required identity or latest-run fields.'
        );
      }

      if (collisionIndexes.has(index)) {
        return blockedRepository(
          repository,
          'identity_collision',
          'identity_collision',
          'Repository slug or normalized root collides with another workspace entry.'
        );
      }

      return processRepository(repository);
    })
  );
  const queue = buildQueue(processedRepositories);
  const repositories = buildRepositories(processedRepositories, queue);
  const diagnostics = processedRepositories
    .flatMap((repository) => repository.diagnostics)
    .sort((left, right) => left.repoSlug.localeCompare(right.repoSlug) || left.code.localeCompare(right.code));
  const status = deriveWorkspaceStatus(repositories, queue);
  const jsonPath = resolve(outputDir, summaryJsonName);
  const markdownPath = resolve(outputDir, summaryMarkdownName);
  const artifact = buildArtifact({
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    workspaceManifestPath,
    outputDir,
    status,
    repositories,
    queue,
    diagnostics,
    jsonPath,
    markdownPath
  });

  await mkdir(outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
  await writeFile(markdownPath, formatWorkspaceRepairSummaryMarkdown(artifact));

  return {
    jsonPath,
    markdownPath,
    status,
    repositoryCount: repositories.length,
    taskCount: queue.length
  };
}

export function formatWorkspaceRepairSummaryMarkdown(artifact: WorkspaceRepairSummaryArtifact): string {
  const repositoryRows = artifact.repositories.length > 0
    ? artifact.repositories.map((repository) => {
        return `| ${repository.rank ?? '-'} | ${escapeTable(repository.repoSlug)} | ${repository.state} | ${repository.taskSummary.totalTasks} | ${repository.highestSeverity ?? '-'} |`;
      })
    : ['| - | No repositories | - | 0 | - |'];
  const queueRows = artifact.crossRepoActionQueue.length > 0
    ? artifact.crossRepoActionQueue.map((task) => {
        return `| ${task.rank} | ${escapeTable(task.workspaceTaskId)} | ${task.severity} | ${escapeTable(task.title)} |`;
      })
    : ['| - | No queued tasks | - | - |'];
  const diagnosticRows = artifact.diagnostics.length > 0
    ? artifact.diagnostics.map((diagnostic) => {
        return `| ${escapeTable(diagnostic.repoSlug)} | ${escapeTable(diagnostic.code)} | ${escapeTable(diagnostic.message)} |`;
      })
    : ['| - | none | No diagnostics recorded. |'];

  return [
    '# Workspace Repair Summary',
    '',
    `Generated at: ${artifact.generatedAt}`,
    `Status: ${artifact.status}`,
    '',
    '## Summary',
    '',
    `- Repositories: ${artifact.summary.totalRepositories}`,
    `- Tasks: ${artifact.summary.totalTasks}`,
    `- P0/P1/P2: ${artifact.summary.p0}/${artifact.summary.p1}/${artifact.summary.p2}`,
    '',
    '## AI IDE Read Order',
    '',
    ...artifact.agentContract.readOrder.map((step, index) => `${index + 1}. ${step}`),
    '',
    '## Repositories',
    '',
    '| Rank | Repository | State | Tasks | Highest severity |',
    '| ---: | --- | --- | ---: | --- |',
    ...repositoryRows,
    '',
    '## Cross-Repository Action Queue',
    '',
    '| Rank | Workspace task | Severity | Title |',
    '| ---: | --- | --- | --- |',
    ...queueRows,
    '',
    '## Diagnostics',
    '',
    '| Repository | Code | Detail |',
    '| --- | --- | --- |',
    ...diagnosticRows,
    '',
    '## Maintainer Review Required',
    '',
    ...artifact.maintainerReview.requiredBefore.map((boundary) => `- ${boundary}`),
    '',
    'Queue rank is recommendation evidence, not authorization.',
    ''
  ].join('\n');
}

function buildArtifact(input: {
  generatedAt: string;
  workspaceManifestPath: string;
  outputDir: string;
  status: WorkspaceRepairSummaryStatus;
  repositories: WorkspaceRepairRepository[];
  queue: WorkspaceRepairQueueItem[];
  diagnostics: WorkspaceRepairDiagnostic[];
  jsonPath: string;
  markdownPath: string;
}): WorkspaceRepairSummaryArtifact {
  const counts = countTasks(input.repositories, input.queue);
  const blockedRepositories = input.repositories.filter((repository) => isBlockedState(repository.state));
  const reviewRequired = input.queue.length > 0 || blockedRepositories.length > 0;
  const reviewReasons = [
    ...(input.queue.length > 0 ? ['Queued repair tasks require an explicit maintainer decision.'] : []),
    ...(blockedRepositories.length > 0
      ? ['Blocked repository states require an explicit maintainer decision.']
      : [])
  ];

  return {
    schema: workspaceRepairSummarySchema,
    schemaVersion: 1,
    generatedAt: cleanText(input.generatedAt),
    sourceWorkspaceManifest: cleanText(input.workspaceManifestPath),
    workspaceOutputDir: cleanText(input.outputDir),
    status: input.status,
    summary: {
      ...counts,
      requiresMaintainerReview: reviewRequired
    },
    agentContract: {
      readOrder: [
        summaryJsonName,
        'maintainerReview',
        'diagnostics',
        'repositories',
        'crossRepoActionQueue',
        'selectedRepository.latestManifest',
        'selectedRepository.repair-task-package.json',
        'selectedRepository.repair-plan.json',
        summaryMarkdownName
      ],
      boundaries: [
        'Stop when the selected repository is blocked.',
        'Do not infer approval from queue rank.',
        'Do not execute verification commands from this summary.',
        'Hand the selected task to an existing per-repository review workflow.'
      ]
    },
    repositories: input.repositories,
    crossRepoActionQueue: input.queue,
    diagnostics: input.diagnostics,
    maintainerReview: {
      required: reviewRequired,
      reasons: reviewReasons,
      allowedDecisions: ['approve', 'reject', 'defer', 'accept_risk'],
      requiredBefore: [
        'selecting a queued task',
        'running verification commands',
        'applying patches',
        'changing target repository files'
      ]
    },
    redaction: {
      applied: true,
      guarantee: 'All artifact-derived text is redacted before entering the workspace summary.',
      prohibitedContent: ['secrets', 'tokens', 'credentials', 'cookies', 'private keys', 'authorization headers']
    },
    noWriteProof: {
      targetRepoWriteAuthorized: false,
      sourceFilesChanged: false,
      commandsExecuted: false,
      patchesApplied: false,
      outputPaths: [cleanText(input.jsonPath), cleanText(input.markdownPath)],
      prohibitedActions: [
        'command execution',
        'patch application',
        'target repository writes',
        'branch, commit, issue, pull request, or advisory creation'
      ]
    }
  };
}

async function processRepository(repository: WorkspaceManifestRepository): Promise<ProcessedRepository> {
  const runManifestSource = await readOptionalFile(repository.latestManifest);

  if (runManifestSource.status === 'missing') {
    return blockedRepository(repository, 'missing_artifacts', 'missing_latest_manifest', 'Latest run manifest does not exist.');
  }

  let runManifest: RunManifest;
  try {
    runManifest = parseRunManifest(runManifestSource.source);
  } catch {
    return blockedRepository(repository, 'invalid_artifacts', 'invalid_latest_manifest', 'Latest run manifest is not valid JSON with required fields.');
  }

  const staleReason = findStaleReason(repository, runManifest);
  if (staleReason) {
    return blockedRepository(repository, 'stale', staleReason.code, staleReason.message, runManifest);
  }

  if (!isPathWithin(resolve(runManifest.entrypoints.repairTaskPackage), resolve(repository.latestRunDir))
    || !isPathWithin(resolve(runManifest.entrypoints.repairPlan), resolve(repository.latestRunDir))) {
    return blockedRepository(
      repository,
      'invalid_artifacts',
      'artifact_outside_latest_run',
      'Repair task package or repair plan is outside latestRunDir.',
      runManifest
    );
  }

  const taskPackageSource = await readOptionalFile(runManifest.entrypoints.repairTaskPackage);
  if (taskPackageSource.status === 'missing') {
    return blockedRepository(repository, 'missing_artifacts', 'missing_repair_task_package', 'Repair task package does not exist.', runManifest);
  }

  const repairPlanSource = await readOptionalFile(runManifest.entrypoints.repairPlan);
  if (repairPlanSource.status === 'missing') {
    return blockedRepository(repository, 'missing_artifacts', 'missing_repair_plan', 'Repair plan does not exist.', runManifest);
  }

  let taskPackage: RepairTaskPackage;
  let repairPlan: RepairPlan;
  try {
    taskPackage = parseRepairTaskPackage(taskPackageSource.source);
    repairPlan = parseRepairPlan(repairPlanSource.source);
  } catch {
    return blockedRepository(repository, 'invalid_artifacts', 'invalid_repair_artifacts', 'Repair task package or repair plan is invalid.', runManifest);
  }

  if (taskPackage.runId !== repository.latestRunId
    || resolve(taskPackage.repoRoot) !== resolve(repository.repoRoot)) {
    return blockedRepository(repository, 'stale', 'stale_repair_task_package', 'Repair task package identity does not match the workspace repository.', runManifest);
  }

  if (repairPlan.runId !== repository.latestRunId
    || resolve(repairPlan.repoRoot) !== resolve(repository.repoRoot)) {
    return blockedRepository(repository, 'stale', 'stale_repair_plan', 'Repair plan identity does not match the workspace repository.', runManifest);
  }

  const taskIds = taskPackage.tasks.map((task) => task.taskId);
  if (new Set(taskIds).size !== taskIds.length) {
    return blockedRepository(
      repository,
      'invalid_artifacts',
      'duplicate_workspace_task_id',
      'Repair task package contains duplicate task ids.',
      runManifest
    );
  }

  return {
    source: repository,
    state: taskPackage.tasks.length > 0 ? 'ready' : 'no_tasks',
    stateReasons: [],
    diagnostics: [],
    runManifest,
    taskPackage
  };
}

function buildQueue(repositories: ProcessedRepository[]): WorkspaceRepairQueueItem[] {
  return repositories
    .filter((repository): repository is ProcessedRepository & {
      runManifest: RunManifest;
      taskPackage: RepairTaskPackage;
    } => repository.state === 'ready' && repository.runManifest !== null && repository.taskPackage !== null)
    .flatMap((repository) => repository.taskPackage.tasks.map((task) => ({
      workspaceTaskId: `${cleanText(repository.source.repoSlug)}:${cleanText(task.taskId)}`,
      rank: 0,
      repoSlug: cleanText(repository.source.repoSlug),
      repoRoot: cleanText(repository.source.repoRoot),
      taskId: cleanText(task.taskId),
      severity: task.severity,
      title: cleanText(task.title),
      objective: cleanText(task.objective),
      sourceTaskPackage: cleanText(repository.runManifest.entrypoints.repairTaskPackage),
      verificationCommands: task.verification.commands.map(cleanText),
      requiresMaintainerReview: true as const
    })))
    .sort((left, right) => {
      return severityRank(left.severity) - severityRank(right.severity)
        || left.repoSlug.localeCompare(right.repoSlug)
        || left.taskId.localeCompare(right.taskId);
    })
    .map((task, index) => ({
      ...task,
      rank: index + 1
    }));
}

function buildRepositories(
  processedRepositories: ProcessedRepository[],
  queue: WorkspaceRepairQueueItem[]
): WorkspaceRepairRepository[] {
  return processedRepositories
    .map((repository): WorkspaceRepairRepository => {
      const tasks = queue.filter((task) => task.repoSlug === cleanText(repository.source.repoSlug));
      const taskSummary = {
        totalTasks: tasks.length,
        p0: tasks.filter((task) => task.severity === 'P0').length,
        p1: tasks.filter((task) => task.severity === 'P1').length,
        p2: tasks.filter((task) => task.severity === 'P2').length
      };

      return {
        rank: tasks[0]?.rank ?? null,
        repoSlug: cleanText(repository.source.repoSlug),
        repoRoot: cleanText(repository.source.repoRoot),
        latestRunId: cleanText(repository.source.latestRunId),
        state: repository.state,
        stateReasons: repository.stateReasons,
        sourceManifest: cleanText(repository.source.latestManifest),
        repairTaskPackage: repository.runManifest
          ? cleanText(repository.runManifest.entrypoints.repairTaskPackage)
          : null,
        repairPlan: repository.runManifest
          ? cleanText(repository.runManifest.entrypoints.repairPlan)
          : null,
        taskSummary,
        highestSeverity: tasks[0]?.severity ?? null,
        recommendedTaskId: tasks[0]?.taskId ?? null,
        requiresMaintainerReview: tasks.length > 0 || isBlockedState(repository.state)
      };
    })
    .sort((left, right) => {
      return (left.rank ?? Number.MAX_SAFE_INTEGER) - (right.rank ?? Number.MAX_SAFE_INTEGER)
        || left.repoSlug.localeCompare(right.repoSlug);
    });
}

function deriveWorkspaceStatus(
  repositories: WorkspaceRepairRepository[],
  queue: WorkspaceRepairQueueItem[]
): WorkspaceRepairSummaryStatus {
  const blockedCount = repositories.filter((repository) => isBlockedState(repository.state)).length;
  const validCount = repositories.length - blockedCount;

  if (blockedCount > 0) {
    return validCount > 0 ? 'partial' : 'blocked';
  }

  return queue.length > 0 ? 'ready' : 'empty';
}

function countTasks(
  repositories: WorkspaceRepairRepository[],
  queue: WorkspaceRepairQueueItem[]
): Omit<WorkspaceRepairSummaryCounts, 'requiresMaintainerReview'> {
  return {
    totalRepositories: repositories.length,
    readyRepositories: repositories.filter((repo) => repo.state === 'ready').length,
    blockedRepositories: repositories.filter((repo) => isBlockedState(repo.state)).length,
    noTaskRepositories: repositories.filter((repo) => repo.state === 'no_tasks').length,
    totalTasks: queue.length,
    p0: queue.filter((task) => task.severity === 'P0').length,
    p1: queue.filter((task) => task.severity === 'P1').length,
    p2: queue.filter((task) => task.severity === 'P2').length
  };
}

function parseWorkspaceManifest(source: string): WorkspaceManifest {
  let value: unknown;
  try {
    value = JSON.parse(source) as unknown;
  } catch {
    throw new Error('Invalid workspace manifest');
  }

  if (!isRecord(value)
    || value.schemaVersion !== 1
    || typeof value.generatedAt !== 'string'
    || typeof value.workspaceOutputDir !== 'string'
    || !Array.isArray(value.repos)) {
    throw new Error('Invalid workspace manifest');
  }

  return {
    schemaVersion: 1,
    generatedAt: value.generatedAt,
    workspaceOutputDir: value.workspaceOutputDir,
    repos: value.repos.map(normalizeWorkspaceManifestRepository)
  };
}

function parseRunManifest(source: string): RunManifest {
  const value = JSON.parse(source) as unknown;

  if (!isRecord(value)
    || value.schemaVersion !== 1
    || typeof value.runId !== 'string'
    || typeof value.repoRoot !== 'string'
    || !isRecord(value.entrypoints)
    || typeof value.entrypoints.repairTaskPackage !== 'string'
    || typeof value.entrypoints.repairPlan !== 'string') {
    throw new Error('Invalid run manifest');
  }

  return value as unknown as RunManifest;
}

function parseRepairTaskPackage(source: string): RepairTaskPackage {
  const value = JSON.parse(source) as unknown;

  if (!isRecord(value)
    || value.schemaVersion !== 1
    || typeof value.generatedAt !== 'string'
    || typeof value.runId !== 'string'
    || typeof value.repoRoot !== 'string'
    || typeof value.sourceManifest !== 'string'
    || !isRepairArtifactSummary(value.summary)
    || !Array.isArray(value.tasks)
    || !value.tasks.every(isRepairTask)) {
    throw new Error('Invalid repair task package');
  }

  return value as unknown as RepairTaskPackage;
}

function parseRepairPlan(source: string): RepairPlan {
  const value = JSON.parse(source) as unknown;

  if (!isRecord(value)
    || value.schemaVersion !== 1
    || typeof value.generatedAt !== 'string'
    || typeof value.runId !== 'string'
    || typeof value.repoRoot !== 'string'
    || typeof value.sourceManifest !== 'string'
    || !isRepairArtifactSummary(value.summary)
    || !Array.isArray(value.tasks)) {
    throw new Error('Invalid repair plan');
  }

  return value as unknown as RepairPlan;
}

function isWorkspaceManifestRepository(value: unknown): value is WorkspaceManifestRepository {
  return isRecord(value)
    && typeof value.repoSlug === 'string'
    && typeof value.repoRoot === 'string'
    && typeof value.latestRunId === 'string'
    && typeof value.latestRunDir === 'string'
    && typeof value.latestManifest === 'string';
}

function normalizeWorkspaceManifestRepository(
  value: unknown,
  index: number
): WorkspaceManifestRepository {
  if (isWorkspaceManifestRepository(value)) {
    return value;
  }

  const record = isRecord(value) ? value : {};
  const repoSlug = typeof record.repoSlug === 'string' && record.repoSlug.trim()
    ? record.repoSlug
    : `invalid-repository-${index + 1}`;

  return {
    repoSlug,
    repoRoot: typeof record.repoRoot === 'string' ? record.repoRoot : '',
    latestRunId: typeof record.latestRunId === 'string' ? record.latestRunId : '',
    latestRunDir: typeof record.latestRunDir === 'string' ? record.latestRunDir : '',
    latestManifest: typeof record.latestManifest === 'string' ? record.latestManifest : '',
    invalidEntry: true
  };
}

function isRepairTask(value: unknown): value is RepairTask {
  return isRecord(value)
    && typeof value.taskId === 'string'
    && isSeverity(value.severity)
    && typeof value.title === 'string'
    && typeof value.objective === 'string'
    && isRecord(value.verification)
    && Array.isArray(value.verification.commands)
    && value.verification.commands.every((command) => typeof command === 'string');
}

function isRepairArtifactSummary(value: unknown): value is RepairArtifactSummary {
  return isRecord(value)
    && isNonNegativeInteger(value.totalTasks)
    && isNonNegativeInteger(value.p0)
    && isNonNegativeInteger(value.p1)
    && isNonNegativeInteger(value.p2)
    && value.totalTasks === value.p0 + value.p1 + value.p2;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSeverity(value: unknown): value is WorkspaceRepairSeverity {
  return value === 'P0' || value === 'P1' || value === 'P2';
}

function severityRank(severity: WorkspaceRepairSeverity): number {
  return severity === 'P0' ? 0 : severity === 'P1' ? 1 : 2;
}

function isBlockedState(state: WorkspaceRepairRepositoryState): boolean {
  return state !== 'ready' && state !== 'no_tasks';
}

function blockedRepository(
  repository: WorkspaceManifestRepository,
  state: Extract<
    WorkspaceRepairRepositoryState,
    'stale' | 'missing_artifacts' | 'invalid_artifacts' | 'identity_collision'
  >,
  code: string,
  message: string,
  runManifest: RunManifest | null = null
): ProcessedRepository {
  const cleanMessage = cleanText(message);

  return {
    source: repository,
    state,
    stateReasons: [cleanMessage],
    diagnostics: [{
      repoSlug: cleanText(repository.repoSlug),
      code,
      message: cleanMessage
    }],
    runManifest,
    taskPackage: null
  };
}

function findIdentityCollisionIndexes(repositories: WorkspaceManifestRepository[]): Set<number> {
  const collisionIndexes = new Set<number>();
  const indexesBySlug = new Map<string, number[]>();
  const indexesByRoot = new Map<string, number[]>();

  repositories.forEach((repository, index) => {
    if (repository.invalidEntry) {
      return;
    }

    const slugIndexes = indexesBySlug.get(repository.repoSlug) ?? [];
    slugIndexes.push(index);
    indexesBySlug.set(repository.repoSlug, slugIndexes);

    const normalizedRoot = resolve(repository.repoRoot);
    const rootIndexes = indexesByRoot.get(normalizedRoot) ?? [];
    rootIndexes.push(index);
    indexesByRoot.set(normalizedRoot, rootIndexes);
  });

  for (const indexes of indexesBySlug.values()) {
    const roots = new Set(indexes.map((index) => resolve(repositories[index]?.repoRoot ?? '')));
    if (roots.size > 1) {
      indexes.forEach((index) => collisionIndexes.add(index));
    }
  }

  for (const indexes of indexesByRoot.values()) {
    const slugs = new Set(indexes.map((index) => repositories[index]?.repoSlug ?? ''));
    if (slugs.size > 1) {
      indexes.forEach((index) => collisionIndexes.add(index));
    }
  }

  return collisionIndexes;
}

function findStaleReason(
  repository: WorkspaceManifestRepository,
  runManifest: RunManifest
): { code: string; message: string } | null {
  if (runManifest.runId !== repository.latestRunId) {
    return {
      code: 'stale_run_id',
      message: 'Workspace latestRunId does not match the latest run manifest.'
    };
  }

  if (resolve(runManifest.repoRoot) !== resolve(repository.repoRoot)) {
    return {
      code: 'stale_repo_root',
      message: 'Workspace repoRoot does not match the latest run manifest.'
    };
  }

  if (!isPathWithin(resolve(repository.latestManifest), resolve(repository.latestRunDir))) {
    return {
      code: 'stale_manifest_location',
      message: 'Workspace latestManifest is outside latestRunDir.'
    };
  }

  return null;
}

async function readOptionalFile(path: string): Promise<
  { status: 'present'; source: string } | { status: 'missing' }
> {
  try {
    return {
      status: 'present',
      source: await readFile(path, 'utf8')
    };
  } catch {
    return { status: 'missing' };
  }
}

function assertOutputOutsideRepositories(
  outputDir: string,
  repositories: WorkspaceManifestRepository[]
): void {
  for (const repository of repositories) {
    if (!repository.repoRoot) {
      continue;
    }

    if (isPathWithin(outputDir, resolve(repository.repoRoot))) {
      throw new Error(`Workspace summary output must be outside target repository: ${repository.repoSlug}`);
    }
  }
}

function isPathWithin(candidate: string, parent: string): boolean {
  const pathFromParent = relative(parent, candidate);
  return pathFromParent === '' || (!pathFromParent.startsWith('..') && !isAbsolute(pathFromParent));
}

function cleanText(value: string): string {
  return redactSensitiveText(value).replace(/\s+/gu, ' ').trim();
}

function escapeTable(value: string): string {
  return value.replace(/\|/gu, '\\|').replace(/\r?\n/gu, ' ');
}
