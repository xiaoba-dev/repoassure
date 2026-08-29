import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type {
  WorkspaceRepairRepositoryState,
  WorkspaceRepairSummaryArtifact,
  WorkspaceRepairSummaryStatus
} from './workspace-repair-summary.js';

const expectedSummarySchema = 'repoassure.workspace-repair-summary.v1';
const consumptionSchema =
  'repoassure.workspace-repair-summary-consumption-validation@1';
const allowedDecisions = ['approve', 'reject', 'defer', 'accept_risk'] as const;

export interface ValidateWorkspaceRepairSummaryConsumptionInput {
  summaryJsonPath: string;
  summaryMarkdownPath: string;
  generatedAt?: string;
}

export type WorkspaceRepairSummaryConsumptionCheckStatus = 'passed' | 'failed';
export type WorkspaceRepairSummaryConsumptionNextAction =
  | 'maintainer_review'
  | 'stop_blocked'
  | 'no_tasks';

export interface WorkspaceRepairSummaryConsumptionCheck {
  id: string;
  status: WorkspaceRepairSummaryConsumptionCheckStatus;
  evidence: string;
}

export interface WorkspaceRepairSummaryConsumptionReport {
  schema: typeof consumptionSchema;
  generatedAt: string;
  status: WorkspaceRepairSummaryConsumptionCheckStatus;
  workspaceStatus: WorkspaceRepairSummaryStatus;
  readOrder: string[];
  selection: {
    recommendedWorkspaceTaskId: string | null;
    selectableWorkspaceTaskIds: string[];
    blockedRepositorySlugs: string[];
    queueRankAuthorizesExecution: false;
    nextAction: WorkspaceRepairSummaryConsumptionNextAction;
    haltRequired: boolean;
  };
  maintainerReview: {
    required: boolean;
    allowedDecisions: Array<(typeof allowedDecisions)[number]>;
  };
  diagnostics: {
    total: number;
    repositorySlugs: string[];
    codes: string[];
  };
  boundary: {
    localOnly: true;
    targetRepoWrites: false;
    commandsExecuted: false;
    patchesApplied: false;
    prohibitedContentPresent: boolean;
  };
  checks: WorkspaceRepairSummaryConsumptionCheck[];
}

export async function validateWorkspaceRepairSummaryConsumption(
  input: ValidateWorkspaceRepairSummaryConsumptionInput
): Promise<WorkspaceRepairSummaryConsumptionReport> {
  const summaryJsonPath = resolve(input.summaryJsonPath);
  const summaryMarkdownPath = resolve(input.summaryMarkdownPath);
  const [rawJson, markdown] = await Promise.all([
    readFile(summaryJsonPath, 'utf8'),
    readFile(summaryMarkdownPath, 'utf8')
  ]);
  const artifact = parseWorkspaceRepairSummaryArtifact(rawJson);
  const blockedRepositories = artifact.repositories.filter((repository) =>
    isBlockedRepositoryState(repository.state)
  );
  const blockedRepositorySlugs = blockedRepositories
    .map((repository) => repository.repoSlug)
    .sort();
  const selectableWorkspaceTaskIds = artifact.crossRepoActionQueue
    .filter((task) => !blockedRepositorySlugs.includes(task.repoSlug))
    .map((task) => task.workspaceTaskId);
  const prohibitedContentPresent = containsProhibitedContent(`${rawJson}\n${markdown}`);
  const resolvedReadOrder = artifact.agentContract.readOrder.map((entry) => {
    if (entry === 'workspace-repair-summary.json') {
      return summaryJsonPath;
    }
    if (entry === 'workspace-repair-summary.md') {
      return summaryMarkdownPath;
    }
    return entry;
  });
  const checks = buildChecks({
    artifact,
    markdown,
    summaryJsonPath,
    summaryMarkdownPath,
    resolvedReadOrder,
    blockedRepositorySlugs,
    prohibitedContentPresent
  });
  const status = checks.every((item) => item.status === 'passed')
    ? 'passed'
    : 'failed';

  return {
    schema: consumptionSchema,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    status,
    workspaceStatus: artifact.status,
    readOrder: resolvedReadOrder,
    selection: {
      recommendedWorkspaceTaskId: selectableWorkspaceTaskIds[0] ?? null,
      selectableWorkspaceTaskIds,
      blockedRepositorySlugs,
      queueRankAuthorizesExecution: false,
      nextAction: deriveNextAction(artifact),
      haltRequired: artifact.status === 'blocked'
    },
    maintainerReview: {
      required: artifact.maintainerReview.required,
      allowedDecisions: [...allowedDecisions]
    },
    diagnostics: {
      total: artifact.diagnostics.length,
      repositorySlugs: uniqueSorted(
        artifact.diagnostics.map((diagnostic) => diagnostic.repoSlug)
      ),
      codes: uniqueSorted(
        artifact.diagnostics.map((diagnostic) => diagnostic.code)
      )
    },
    boundary: {
      localOnly: true,
      targetRepoWrites: false,
      commandsExecuted: false,
      patchesApplied: false,
      prohibitedContentPresent
    },
    checks
  };
}

function buildChecks(input: {
  artifact: WorkspaceRepairSummaryArtifact;
  markdown: string;
  summaryJsonPath: string;
  summaryMarkdownPath: string;
  resolvedReadOrder: string[];
  blockedRepositorySlugs: string[];
  prohibitedContentPresent: boolean;
}): WorkspaceRepairSummaryConsumptionCheck[] {
  const queueRepositories = input.artifact.crossRepoActionQueue.map((task) => task.repoSlug);

  return [
    check(
      'schema_identity',
      input.artifact.schema === expectedSummarySchema
        && input.artifact.schemaVersion === 1,
      'Workspace summary exposes the expected schema identity.'
    ),
    check(
      'json_first_read_order',
      input.resolvedReadOrder[0] === input.summaryJsonPath
        && input.resolvedReadOrder.at(-1) === input.summaryMarkdownPath,
      'AI IDE read order starts with JSON and ends with Markdown.'
    ),
    check(
      'markdown_readability',
      input.markdown.includes('# Workspace Repair Summary')
        && input.markdown.includes('## AI IDE Read Order')
        && input.markdown.includes('## Repositories')
        && input.markdown.includes('## Cross-Repository Action Queue')
        && input.markdown.includes('## Diagnostics')
        && input.markdown.includes('## Maintainer Review Required'),
      'Markdown exposes all required human-review sections.'
    ),
    check(
      'deterministic_queue_order',
      hasDeterministicQueueOrder(input.artifact),
      'Queue ranks and P0/P1/P2 ordering are deterministic.'
    ),
    check(
      'blocked_repositories_excluded',
      queueRepositories.every((repoSlug) => !input.blockedRepositorySlugs.includes(repoSlug)),
      'Blocked repositories contribute no selectable queue tasks.'
    ),
    check(
      'blocked_repository_diagnostics',
      input.blockedRepositorySlugs.every((repoSlug) =>
        input.artifact.diagnostics.some((diagnostic) => diagnostic.repoSlug === repoSlug)
      ),
      'Every blocked repository exposes a diagnostic for maintainer review.'
    ),
    check(
      'queue_rank_is_not_authorization',
      input.artifact.agentContract.boundaries.some((boundary) =>
        boundary.includes('Do not infer approval from queue rank.')
      ),
      'Queue rank remains recommendation evidence, not execution authorization.'
    ),
    check(
      'maintainer_decision_boundary',
      arraysEqual(input.artifact.maintainerReview.allowedDecisions, allowedDecisions)
        && (
          input.artifact.crossRepoActionQueue.length === 0
          || input.artifact.maintainerReview.required
        ),
      'Maintainer review exposes approve, reject, defer, and accept_risk.'
    ),
    check(
      'no_write_boundary',
      input.artifact.noWriteProof.targetRepoWriteAuthorized === false
        && input.artifact.noWriteProof.sourceFilesChanged === false
        && input.artifact.noWriteProof.commandsExecuted === false
        && input.artifact.noWriteProof.patchesApplied === false,
      'Consumption does not authorize commands, patches, or target repository writes.'
    ),
    check(
      'redaction_boundary',
      input.artifact.redaction.applied === true && !input.prohibitedContentPresent,
      'Summary artifacts contain no prohibited secret or private-key markers.'
    ),
    check(
      'workspace_state_contract',
      stateMatchesContents(input.artifact),
      'Workspace status agrees with repository and queue contents.'
    )
  ];
}

function parseWorkspaceRepairSummaryArtifact(source: string): WorkspaceRepairSummaryArtifact {
  let value: unknown;
  try {
    value = JSON.parse(source) as unknown;
  } catch {
    throw new Error('Invalid workspace repair summary JSON');
  }

  if (!isRecord(value)
    || value.schema !== expectedSummarySchema
    || value.schemaVersion !== 1
    || !isWorkspaceStatus(value.status)
    || !isRecord(value.agentContract)
    || !Array.isArray(value.agentContract.readOrder)
    || !value.agentContract.readOrder.every(isString)
    || !Array.isArray(value.agentContract.boundaries)
    || !value.agentContract.boundaries.every(isString)
    || !Array.isArray(value.repositories)
    || !value.repositories.every(isRepository)
    || !Array.isArray(value.crossRepoActionQueue)
    || !value.crossRepoActionQueue.every(isQueueTask)
    || !Array.isArray(value.diagnostics)
    || !value.diagnostics.every(isDiagnostic)
    || !isRecord(value.maintainerReview)
    || typeof value.maintainerReview.required !== 'boolean'
    || !Array.isArray(value.maintainerReview.allowedDecisions)
    || !isRecord(value.redaction)
    || value.redaction.applied !== true
    || !isRecord(value.noWriteProof)) {
    throw new Error('Invalid workspace repair summary contract');
  }

  return value as unknown as WorkspaceRepairSummaryArtifact;
}

function deriveNextAction(
  artifact: WorkspaceRepairSummaryArtifact
): WorkspaceRepairSummaryConsumptionNextAction {
  if (artifact.status === 'blocked') {
    return 'stop_blocked';
  }
  if (artifact.crossRepoActionQueue.length === 0) {
    return 'no_tasks';
  }
  return 'maintainer_review';
}

function hasDeterministicQueueOrder(artifact: WorkspaceRepairSummaryArtifact): boolean {
  return artifact.crossRepoActionQueue.every((task, index, queue) => {
    if (task.rank !== index + 1) {
      return false;
    }
    const previous = queue[index - 1];
    return previous === undefined || compareQueueTasks(previous, task) <= 0;
  });
}

function compareQueueTasks(
  left: WorkspaceRepairSummaryArtifact['crossRepoActionQueue'][number],
  right: WorkspaceRepairSummaryArtifact['crossRepoActionQueue'][number]
): number {
  return severityRank(left.severity) - severityRank(right.severity)
    || left.repoSlug.localeCompare(right.repoSlug)
    || left.taskId.localeCompare(right.taskId);
}

function severityRank(severity: 'P0' | 'P1' | 'P2'): number {
  return severity === 'P0' ? 0 : severity === 'P1' ? 1 : 2;
}

function stateMatchesContents(artifact: WorkspaceRepairSummaryArtifact): boolean {
  const blockedCount = artifact.repositories.filter((repository) =>
    isBlockedRepositoryState(repository.state)
  ).length;
  const validCount = artifact.repositories.length - blockedCount;

  if (artifact.status === 'blocked') {
    return blockedCount > 0 && validCount === 0 && artifact.crossRepoActionQueue.length === 0;
  }
  if (artifact.status === 'partial') {
    return blockedCount > 0 && validCount > 0;
  }
  if (artifact.status === 'empty') {
    return blockedCount === 0 && artifact.crossRepoActionQueue.length === 0;
  }
  return blockedCount === 0 && artifact.crossRepoActionQueue.length > 0;
}

function isRepository(value: unknown): boolean {
  return isRecord(value)
    && typeof value.repoSlug === 'string'
    && isRepositoryState(value.state);
}

function isQueueTask(value: unknown): boolean {
  return isRecord(value)
    && typeof value.workspaceTaskId === 'string'
    && typeof value.rank === 'number'
    && typeof value.repoSlug === 'string'
    && typeof value.taskId === 'string'
    && (value.severity === 'P0' || value.severity === 'P1' || value.severity === 'P2');
}

function isDiagnostic(value: unknown): boolean {
  return isRecord(value)
    && typeof value.repoSlug === 'string'
    && typeof value.code === 'string'
    && typeof value.message === 'string';
}

function isBlockedRepositoryState(state: WorkspaceRepairRepositoryState): boolean {
  return state !== 'ready' && state !== 'no_tasks';
}

function isRepositoryState(value: unknown): value is WorkspaceRepairRepositoryState {
  return value === 'ready'
    || value === 'no_tasks'
    || value === 'stale'
    || value === 'missing_artifacts'
    || value === 'invalid_artifacts'
    || value === 'identity_collision';
}

function isWorkspaceStatus(value: unknown): value is WorkspaceRepairSummaryStatus {
  return value === 'ready'
    || value === 'partial'
    || value === 'blocked'
    || value === 'empty';
}

function containsProhibitedContent(value: string): boolean {
  return /sk-live-|ghp_|AKIA|BEGIN PRIVATE KEY|authorization:\s*bearer/iu.test(value);
}

function arraysEqual(
  left: unknown[],
  right: readonly string[]
): boolean {
  return left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function check(
  id: string,
  passed: boolean,
  evidence: string
): WorkspaceRepairSummaryConsumptionCheck {
  return {
    id,
    status: passed ? 'passed' : 'failed',
    evidence
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}
