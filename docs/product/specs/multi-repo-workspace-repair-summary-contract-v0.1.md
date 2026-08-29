# RepoAssure Multi-Repo Workspace Repair Summary Contract v0.1

Status: implemented
Date: 2026-07-25
Schema: `repoassure.workspace-repair-summary.v1`
Implementation status: implemented in
`packages/acceptance/src/workspace-repair-summary.ts`

## Purpose

Define a deterministic, local-only summary that turns one RepoAssure workspace
manifest and its per-repository repair task packages into a reviewable
cross-repository queue for an AI IDE.

This contract does not authorize command execution, patch application, target
repository writes, Team Cloud, hosted dashboards, cloud sync, telemetry, or
commercial availability claims.

## Existing Input Contract

The required source is the existing workspace `manifest.json` with
`schemaVersion: 1` and:

- `generatedAt`
- `workspaceOutputDir`
- `repos[]`
  - `repoSlug`
  - `repoRoot`
  - `latestRunId`
  - `latestRunDir`
  - `latestManifest`

For each repository, `latestManifest` must resolve to a run manifest whose
`runId` and `repoRoot` agree with the workspace record. The run manifest must
provide an existing `repairTaskPackage` entrypoint. `repairPlan` is a
supporting human-review artifact and must not replace the task package as the
machine source.

## Output Artifacts

The implementation writes exactly two bounded artifacts:

- `workspace-repair-summary.json`: machine-readable source of truth.
- `workspace-repair-summary.md`: human-readable projection generated from the
  JSON model.

Both artifacts are written only under an explicitly validated workspace output
directory. They are not public-export or hosted-service artifacts.

## JSON Contract

The JSON artifact uses `schema: repoassure.workspace-repair-summary.v1` and
`schemaVersion: 1`.

Required top-level fields:

- `generatedAt`
- `sourceWorkspaceManifest`
- `workspaceOutputDir`
- `status`: `ready | partial | blocked | empty`
- `summary`
- `agentContract`
- `repositories`
- `crossRepoActionQueue`
- `diagnostics`
- `maintainerReview`
- `redaction`
- `noWriteProof`

### Summary

`summary` contains:

- `totalRepositories`
- `readyRepositories`
- `blockedRepositories`
- `noTaskRepositories`
- `totalTasks`
- `p0`
- `p1`
- `p2`
- `requiresMaintainerReview`

### Repository Record

Each `repositories[]` record contains:

- `rank`
- `repoSlug`
- `repoRoot`
- `latestRunId`
- `state`
- `stateReasons`
- `sourceManifest`
- `repairTaskPackage`
- `repairPlan`
- `taskSummary`
- `highestSeverity`
- `recommendedTaskId`
- `requiresMaintainerReview`

Repository state is:
`ready | no_tasks | stale | missing_artifacts | invalid_artifacts | identity_collision`.

### Cross-Repo Action Queue

Each `crossRepoActionQueue[]` item contains:

- `workspaceTaskId`: `${repoSlug}:${taskId}`
- `rank`
- `repoSlug`
- `repoRoot`
- `taskId`
- `severity`
- `title`
- `objective`
- `sourceTaskPackage`
- `verificationCommands`
- `requiresMaintainerReview`

The queue contains tasks only from `ready` repositories. Blocked repository
states remain visible in `repositories` and `diagnostics`; they must never be
silently dropped.

## AI IDE Read Order

The machine-readable `agentContract.readOrder` is:

1. `workspace-repair-summary.json`
2. `maintainerReview`
3. `diagnostics`
4. `repositories`
5. `crossRepoActionQueue`
6. the selected repository `latestManifest`
7. the selected repository `repair-task-package.json`
8. the selected repository `repair-plan.json`
9. `workspace-repair-summary.md` for human review

An AI IDE must stop on a blocked selected repository, must not infer approval
from queue rank, and must hand the selected task to an existing per-repository
review workflow. It must not execute verification commands from this summary.

## Cross-Repo Priority Rules

Priority order is P0 > P1 > P2.

Deterministic task ordering is severity rank, then `repoSlug`, then `taskId`.
Repository rank is the first task rank in that repository; repositories with
no tasks sort after ready repositories, and blocked repository states sort
after all valid repositories by `repoSlug`.

No cross-repository dependency inference is allowed in v1 because current
source artifacts do not contain a reviewed dependency graph. The summary must
not merge tasks, infer shared ownership, or automatically deduplicate similar
titles across repositories.

## Stale, Missing, and Collision Policy

The v1 freshness model is structural, not age-based:

- `stale`: workspace `latestRunId` disagrees with run-manifest `runId`,
  `latestManifest` is outside `latestRunDir`, or normalized `repoRoot` values
  disagree.
- `missing_artifacts`: `latestManifest`, repair task package, or another
  required source path does not exist.
- `invalid_artifacts`: JSON cannot be parsed or required schema fields are
  invalid.
- `identity_collision`: the same `repoSlug` maps to more than one normalized
  `repoRoot`, or the same normalized `repoRoot` maps to more than one
  `repoSlug`.

An identity collision blocks every affected repository entry and requires
maintainer review. Missing, stale, or invalid repositories produce `partial`
when at least one valid repository remains; otherwise the workspace status is
`blocked`. A valid workspace with no repair tasks is `empty`.

Wall-clock age alone does not mark a repository stale in v1. A future age
threshold requires a separate accepted contract and must record the threshold
in the artifact.

## Repo Identity Policy

`repoSlug` remains the stable workspace-local identity key. `repoRoot` remains
a local locator needed by the AI IDE and must not be presented as a public
identifier. The Markdown projection shows `repoSlug` by default and omits the
absolute root.

The implementation must validate identities before queue construction. It
must not repair, rewrite, merge, or silently select one side of a collision.

## Redaction Boundary

The generator must reuse the shared RepoAssure redaction utility for all
human-provided or artifact-derived text.

The output must not contain environment values, tokens, credentials, private
keys, authorization headers, or raw long-form command output. Redaction
failure is fail-closed. `repoRoot` and artifact paths are local-only locators
in JSON; the Markdown projection omits absolute roots and uses workspace-local
artifact labels.

## Maintainer Review Boundary

`maintainerReview.allowedDecisions` is
`approve | reject | defer | accept_risk`.

Review is required before:

- selecting a queued task for an existing repair workflow;
- accepting a blocked or partial workspace;
- resolving an identity collision;
- running any verification command;
- applying any patch or modifying source.

Queue order is recommendation evidence, not authorization.

## No-Write Boundary

The output directory must be outside every normalized `repoRoot`. Validation
must finish before creating either output artifact.

`noWriteProof` must record:

- `targetRepoWriteAuthorized: false`
- `sourceFilesChanged: false`
- `commandsExecuted: false`
- `patchesApplied: false`
- `outputPaths`
- `prohibitedActions`

Integration tests must snapshot target repository file content, modification
times, and directory listings before and after generation.

## Error And Status Semantics

- Invalid top-level workspace JSON fails before writing output.
- Valid workspace JSON with invalid repository entries produces a bounded
  `partial` or `blocked` summary.
- An empty `repos` array produces `empty` with an empty action queue.
- Duplicate `workspaceTaskId` values are invalid and block the affected
  entries.
- Diagnostics are bounded, redacted, deterministic, and sorted by `repoSlug`
  and diagnostic code.

## Package And Entrypoint Ownership

The first implementation belongs in `@hardening-mcp/acceptance`, alongside
the existing AI IDE repair artifact generators. It should expose a typed
package subpath and a local package script. CLI or MCP productization is not
part of the first implementation Goal.

## Testing Pyramid

### Unit And Contract

- workspace manifest and per-repo artifact schema validation;
- deterministic P0/P1/P2 and tie-break ordering;
- every repository state and workspace status;
- collision and duplicate task handling;
- AI IDE read order and maintainer-review boundary;
- redaction and output-path rejection.

### Integration

- two or more non-private repository fixtures;
- mixed P0/P1/P2 queues;
- valid, empty, stale, missing, invalid, and collision entries;
- deterministic JSON/Markdown generation;
- source content, mtime, and directory no-write proof.

### E2E

Deferred until the local generator contract is accepted and a later Goal
decides whether it belongs in the installed CLI. No MCP or CLI entrypoint is
authorized by this contract.

### AI IDE Consumption Validation

RepoAssure Multi-Repo Workspace Repair Summary AI IDE Consumption Validation
v0.1 is complete with conclusion
`workspace_repair_summary_ai_ide_consumption_validated_without_entrypoints_or_target_writes`.
The package-owned read-only validator covers ready, partial, blocked, and
empty summaries; JSON-first read order; blocked-repository diagnostics and
selection exclusion; queue rank non-authorization; exact maintainer decision
options; schema and Markdown readability; redaction; exact output allowlist;
and target source content, mtime, and directory no-write proof. It does not
change the deferred CLI/MCP decision.

## Explicit Non-Goals

- Team Cloud runtime, hosted dashboard, shared artifact history, collaboration,
  RBAC, approval service, or cloud persistence.
- Command execution, automatic patch application, source modification, or
  target repository writes.
- Cross-repository dependency inference, task merging, automatic
  deduplication, or ownership inference.
- MCP registry changes, validation-only MCP exposure, deployment, publication,
  pricing, spend, or customer contact.
