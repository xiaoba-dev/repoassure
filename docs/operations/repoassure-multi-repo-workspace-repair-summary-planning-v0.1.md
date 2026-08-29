# RepoAssure Multi-Repo Workspace Repair Summary Planning v0.1

Status: completed
Date: 2026-07-25
Conclusion: `multi_repo_workspace_repair_summary_contract_planned_without_production_implementation`

## Purpose

Plan an implementation-ready, local-only cross-repository repair summary above
the existing workspace manifest and per-repository repair artifacts.

## Scope

This Goal defines product, artifact, AI IDE consumption, error, review,
redaction, and no-write contracts. It does not implement the generator, change
production code, execute commands, apply patches, write target repositories,
change the MCP registry, or implement Team Cloud.

## Existing Input Contract

The existing workspace manifest is `schemaVersion: 1` and records
`workspaceOutputDir` plus `repos[]` entries containing `repoSlug`, `repoRoot`,
`latestRunId`, `latestRunDir`, and `latestManifest`.

Each copied latest run already contains `repair-plan.json`,
`repair-plan.md`, `repair-task-package.json`, and
`repair-task-package.md`. The task package is the machine source for the
future summary; the repair plan remains supporting review evidence.

## Proposed Output Artifacts

- `workspace-repair-summary.json`: machine-readable
  `repoassure.workspace-repair-summary.v1` artifact.
- `workspace-repair-summary.md`: human-readable projection.

The JSON contains workspace status, repository states, a deterministic
cross-repo action queue, diagnostics, AI IDE read order, maintainer review,
redaction, and no-write proof.

## AI IDE Read Order

The AI IDE reads the JSON summary and review boundary first, then diagnostics,
repository queue, cross-repo action queue, selected repo manifest, selected
repair task package, selected repair plan, and finally the Markdown view.

Queue position is not approval. The selected task must return to an existing
per-repository repair workflow.

## Cross-Repo Priority Rules

- Priority order: P0 > P1 > P2.
- Tie-break order: severity rank, then `repoSlug`, then `taskId`.
- Blocked entries do not enter the action queue.
- No cross-repository dependency inference, task merging, title-based
  deduplication, or ownership inference is allowed.

## Stale, Missing, and Collision Policy

- Structural run/root/path mismatches become `stale`.
- Missing manifests or task packages become `missing_artifacts`.
- Parse or schema failures become `invalid_artifacts`.
- One slug mapping to multiple normalized roots, or one normalized root
  mapping to multiple slugs, becomes `identity_collision`.
- Affected entries remain visible and require maintainer review.
- Wall-clock age is not used as an implicit stale threshold in v1.

## Redaction Boundary

All artifact-derived text passes through shared RepoAssure redaction. JSON
paths remain local-only locators; Markdown omits absolute repo roots. Secrets,
environment values, credentials, keys, authorization headers, and raw
long-form command output are prohibited.

## Maintainer Review Boundary

Allowed decisions are `approve`, `reject`, `defer`, and `accept_risk`.
Maintainer review is required before selecting work, accepting partial or
blocked state, resolving collisions, executing verification, or modifying
source.

## No-Write Boundary

The future generator may write only the two summary artifacts. Its output
directory must be outside every normalized repo root, and this must be
validated before output creation. Tests must compare source content,
modification times, and directory listings before and after generation.

Production code changed: no

Target repository writes: no

Team Cloud runtime: no

Hosted dashboard: no

## Test Strategy

- Unit/contract: schemas, states, statuses, deterministic ordering, read order,
  redaction, review, collisions, and output-path validation.
- Integration: multiple non-private repos with valid, empty, stale, missing,
  invalid, and collision fixtures plus JSON/Markdown determinism and no-write
  proof.
- E2E: deferred until a later decision authorizes an installed CLI entrypoint.

## Selected Next Goal

RepoAssure Multi-Repo Workspace Repair Summary Contract Implementation v0.1

The next Goal will implement the package-owned local generator and contract
tests for the two summary artifacts. It will not add CLI or MCP entrypoints,
execute commands, apply patches, write target repositories, or implement
hosted capabilities.

## Boundary

| Boundary | Allowed |
| --- | --- |
| Planning and accepted local artifact contract | yes |
| Production generator implementation in this Goal | no |
| Target repository writes | no |
| Command execution or patch application | no |
| MCP tool addition or rename | no |
| Team Cloud, hosted dashboard, sync, or telemetry | no |
| Publication, deployment, customer contact, pricing, or spend | no |

## Verification

- TDD Red: 115 existing structure checks passed; the new planning contract
  failed because this operation record did not yet exist.
- TDD Green: the focused project-structure suite passed 116/116 checks.
- Repository-wide pyramid: 78 test files passed and 1 was skipped; 765 tests
  passed and 1 was skipped.
- `pnpm typecheck`, `pnpm lint`, `pnpm build:acceptance`,
  `pnpm build:src`, `pnpm repo:hygiene`, and `git diff --check` passed.
- `pnpm release:check` passed its automated prerequisites while correctly
  retaining `public release ready: no`.
- `pnpm goal:audit` passed 34/35 checks with no missing evidence and one
  existing manual user-acceptance item.
- `pnpm autopilot:progress:check -- --json` reported `consistent` with 8/8
  checks passed.
