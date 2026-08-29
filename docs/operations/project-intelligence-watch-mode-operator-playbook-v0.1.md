# Project Intelligence Watch Mode Operator Playbook v0.1

Status: completed
Date: 2026-07-21
Source: `docs/operations/project-intelligence-watch-mode-end-to-end-local-fixture-validation-v0.1.md`

## Objective

Give maintainers, Codex, and AI IDEs a local-only operating guide for Project Intelligence watch mode after the end-to-end fixture loop has been validated.

This playbook covers how to start the watcher, run a one-shot smoke check, read the generated artifacts, diagnose freshness failures, recover from malformed or stale artifacts, stop the foreground watcher, and preserve non-authorization boundaries.

## Command Sequence

Use these commands from the RepoAssure workspace root:

1. Start the foreground watcher:
   `pnpm project:intelligence:watch`
2. Run a one-shot smoke check:
   `pnpm project:intelligence:watch -- --once`
3. Regenerate agent context directly when watch status is stale or missing:
   `pnpm project:intelligence:agent-context`
4. Generate the AI IDE handoff:
   `pnpm project:intelligence:watch-handoff`

The long-running watch command is foreground-only. Stop it with `Ctrl+C`. Do not daemonize it, background it as a service, or treat it as hosted infrastructure.

## AI IDE Read Order

AI IDEs and Codex sessions should read artifacts in this order:

1. `artifacts/project-graph/project-intelligence-watch-handoff.json`
2. `artifacts/project-graph/project-intelligence-watch-status.json`
3. `artifacts/project-graph/project-intelligence-agent-context.json`
4. `artifacts/project-graph/project-intelligence-agent-context.md`
5. `artifacts/project-graph/project-intelligence-snapshot.json`
6. `.autopilot/progress/snapshot.json`
7. `.autopilot/goals/index.json`
8. `.autopilot/goals/<active-goal>.json`
9. `docs/PLAN.md`
10. `docs/SPEC.md`
11. `docs/PRD.md`

The JSON handoff is the primary machine contract. The Markdown handoff is the human-readable companion. If the JSON and Markdown disagree, regenerate the handoff and trust the JSON schema only after freshness checks pass.

## Freshness Diagnosis

Check `freshnessChecklist` in `project-intelligence-watch-handoff.json` before acting on the active goal:

- `watch_status_schema` must be `passed`.
- `watch_refresh_count` must be `passed`; a zero refresh count means the watcher did not successfully run.
- `watch_commands` must be `passed`; snapshot must be refreshed before agent context.
- `agent_context_schema` must be `passed`.
- `watch_boundary` must be `passed`; local-only, foreground-only, no daemon, no hosted dashboard, no telemetry, no cloud sync, no target repo writes.
- `agent_context_boundary` must be `passed`; agent context must not authorize hosted dashboard, telemetry, or target repo writes.

If any item is `failed`, do not use the handoff to choose a new execution goal until the recovery step below succeeds.

## Failure Recovery

Use the smallest recovery that matches the failure:

- Missing `project-intelligence-snapshot.json`: run `pnpm project:intelligence`, then rerun `pnpm project:intelligence:agent-context` and `pnpm project:intelligence:watch-handoff`.
- Missing or malformed `project-intelligence-agent-context.json`: run `pnpm project:intelligence:agent-context`, then rerun `pnpm project:intelligence:watch-handoff`.
- Missing or malformed `project-intelligence-watch-status.json`: run `pnpm project:intelligence:watch -- --once`, then rerun `pnpm project:intelligence:watch-handoff`.
- Stale or failed freshness checklist: rerun `pnpm project:intelligence:watch -- --once`; if it still fails, inspect the failed checklist evidence and record the blocker in `docs/logs/blockers.md`.
- Handoff artifact status remains `expected` for an artifact that exists: rerun `pnpm project:intelligence:watch-handoff`; if it remains wrong, treat it as a product bug and add it to `docs/logs/dev-log.md`.

Do not repair these failures by editing generated artifacts by hand. Regenerate them from source-of-truth files.

## Stop Boundary

- Stop the foreground watcher with `Ctrl+C`.
- Do not leave background watch processes running after a validation session.
- Do not add a daemon, cron, launch agent, service manager, telemetry loop, cloud sync, or hosted dashboard as part of this playbook.

## Prohibited Actions

This playbook does not authorize:

- hosted dashboard
- cloud sync
- telemetry
- deployment
- public release
- repository visibility change
- npm publication
- GitHub release
- target repo writes
- customer contact
- pricing change
- spend change
- website design-system rewrite

Any target repo writes require a separate owner-authorized repair execution goal. Watch mode and this playbook are read-only with respect to target repositories.

## TDD Record

- Red: updated `tests/unit/project-structure.test.ts` to require the operator playbook, completed goal metadata, command sequence, AI IDE read order, freshness diagnosis, recovery boundaries, and next goal selection.
- Green: added this playbook and cascaded it into canonical docs, Project Intelligence spec/architecture, testing strategy, acceptance checklist, decision log, dev log, and `.autopilot` progress.
- Refine: kept the playbook local-only and operational; no hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo write behavior was added.

## Validation Plan

- `pnpm vitest run tests/unit/project-structure.test.ts`
- `pnpm project:intelligence:watch -- --once`
- `pnpm project:intelligence:watch-handoff`
- `pnpm repo:hygiene`
- `pnpm release:check`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm goal:audit`

## Next Codex Goal

Project Intelligence Watch Mode Operator Playbook Consumption Validation v0.1.

Plain-language explanation: now that the operator playbook exists, validate that a maintainer or AI IDE can consume it as an execution guide, follow the artifact read order, detect failed freshness checks, and stop at the maintainer review boundary without modifying target repos or expanding into hosted/cloud behavior.
