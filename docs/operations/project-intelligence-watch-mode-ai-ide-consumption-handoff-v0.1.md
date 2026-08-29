# Project Intelligence Watch Mode AI IDE Consumption Handoff v0.1

Status: completed
Date: 2026-07-20
Source: `docs/operations/project-intelligence-watch-mode-local-smoke-validation-v0.1.md`

## Objective

Produce and validate a local AI IDE consumption handoff for Project Intelligence watch mode. The handoff tells Codex / AI IDE sessions how to run `pnpm project:intelligence:watch`, read watch-generated Project Intelligence artifacts, confirm freshness, and stop the foreground watcher without hosted services, telemetry, cloud sync, deployment, public release, or target repo writes.

## Delivered Runtime

- Added `packages/acceptance/src/run-project-intelligence-watch-handoff.ts`.
- Added `pnpm project:intelligence:watch-handoff`.
- Added package export `@hardening-mcp/acceptance/run-project-intelligence-watch-handoff`.
- Added compatibility entrypoint `projectIntelligenceWatchHandoff`.
- Added type-smoke coverage for the new package subpath.

## Output Artifacts

Default output directory:

```text
artifacts/project-graph/
```

Generated files:

- `project-intelligence-watch-handoff.json`
- `project-intelligence-watch-handoff.md`

The JSON schema is:

```text
repoassure.project-intelligence-watch-handoff@1
```

The handoff includes AI IDE read order, watch/smoke/agent-context/stop commands, artifact paths, freshness checklist, maintainer review boundary, foreground stop instructions, and redaction metadata.

## AI IDE Read Order

1. `project-intelligence-watch-handoff.json`
2. `project-intelligence-watch-status.json`
3. `project-intelligence-agent-context.json`
4. `project-intelligence-agent-context.md`
5. `project-intelligence-snapshot.json`
6. `.autopilot/progress/snapshot.json`
7. `.autopilot/goals/index.json`
8. `.autopilot/goals/<active-goal>.json`
9. `docs/PLAN.md`
10. `docs/SPEC.md`
11. `docs/PRD.md`

## Commands

```bash
pnpm project:intelligence:watch
pnpm project:intelligence:watch -- --once
pnpm project:intelligence:agent-context
pnpm project:intelligence:watch-handoff
```

Stop the foreground watcher with `Ctrl+C`.

## TDD Record

- Red: added `tests/unit/project-intelligence-watch-handoff.test.ts`. The first run failed because `packages/acceptance/src/run-project-intelligence-watch-handoff.ts` did not exist.
- Green: implemented the handoff runner, package script, package export, compatibility entrypoint, type-smoke import, and structure assertions.
- Refine: generated the real handoff artifact with `pnpm project:intelligence:watch-handoff` and cascaded the contract into docs and `.autopilot` state.

## Verification

- `pnpm vitest run tests/unit/project-intelligence-watch-handoff.test.ts` — passed, 2 tests.
- `pnpm build:acceptance` — passed.
- `pnpm vitest run tests/unit/acceptance-package.test.ts tests/unit/project-structure.test.ts` — passed, 133 tests.
- `pnpm project:intelligence:watch-handoff` — passed, generated JSON/Markdown handoff artifacts and 6/6 freshness checks passed.

## Boundary

This goal does not authorize hosted dashboard, cloud sync, telemetry, deployment, public release, repository visibility change, npm publication, GitHub release, target repo writes, customer contact, pricing or spend changes, or website design-system rewrite.

## Next Codex Goal

Project Intelligence Watch Mode End-to-End Local Fixture Validation v0.1.

Plain-language explanation: validate the whole local Project Intelligence loop in one fixture: snapshot generation, agent context export, watch status, and watch handoff all point to each other correctly and remain local-only.
