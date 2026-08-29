# Project Intelligence Watch Mode Local Smoke Validation v0.1

Status: completed
Date: 2026-07-20
Source implementation record: `docs/operations/project-intelligence-watch-mode-implementation-v0.1.md`

## Purpose

Validate the implemented local-only Project Intelligence watch mode against a real local file-change cycle in an isolated fixture. The goal was to prove that Codex / AI IDE sessions can rely on watch-generated Project Intelligence artifacts without daemonizing, uploading data, opening a hosted dashboard, or writing to a target repo.

## Smoke Fixture

The smoke test creates an isolated temporary repo with only safe local fixture paths:

- accepted source-of-truth paths: `docs/`, `packages/acceptance/src/`, `.autopilot/progress/`
- ignored paths: `.autopilot/cache/`, `.autopilot/secrets/`, `artifacts/project-graph/`, `node_modules/`
- output path: `artifacts/project-graph/`

The smoke uses the same watch runtime through `runProjectIntelligenceWatch`, injects a fake local refresh to avoid shelling out, and writes fixture snapshot / agent context artifacts in the same order as the production command contract.

## Validated Behavior

- Accepted real file changes in `docs/PRD.md`, `packages/acceptance/src/smoke.ts`, and `.autopilot/progress/snapshot.json` triggered one refresh cycle.
- Ignored generated, dependency, cache, and secret paths did not trigger a refresh.
- A short configured debounce window coalesced burst writes into one refresh.
- Refresh order remained deterministic:
  1. `pnpm project:intelligence`
  2. `pnpm project:intelligence:agent-context`
- `project-intelligence-watch-status.json` recorded:
  - `schema: repoassure.project-intelligence-watch-status@1`
  - `status: stopped`
  - `refreshCount: 1`
  - watched / ignored scope
  - sanitized changed paths
  - latest snapshot and agent context output paths
  - local-only / no daemon / no telemetry / no hosted dashboard / no cloud sync / no target repo write boundary
- Abort/manual-stop behavior resolved the foreground watch run and did not leave a background process.

## Runtime Hardening Found by Smoke

The first smoke attempt exposed that `fs.watch(repoRoot, { recursive: true })` can fail under local file descriptor pressure with `EMFILE`. The implementation was hardened to use bounded polling over allowed docs/code/autopilot files instead of an unbounded recursive repo watcher. This keeps the runtime deterministic and aligned with the product boundary:

- scan only source-of-truth include scope
- skip generated/dependency/cache/secret directories before refresh
- keep debounce-based refresh semantics
- keep foreground stop behavior

## TDD Record

- Red: added `tests/integration/project-intelligence-watch-smoke.test.ts`. The first run timed out because the runtime had no watcher-ready synchronization and leaked the watcher after timeout.
- Green: added `onReady` synchronization and cleanup, then replaced recursive `fs.watch` with bounded polling after the smoke exposed `EMFILE`.
- Refactor / hardening: calibrated the status assertion so `.autopilot/secrets/` remains visible as an ignored boundary while never appearing in `lastChangedPaths`.

## Verification

- `pnpm vitest run tests/integration/project-intelligence-watch-smoke.test.ts` — passed, 1 test.

Additional repository-level verification is recorded in `docs/logs/dev-log.md` for this goal.

## Non-Authorization Boundary

This goal did not perform or authorize:

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
- pricing or spend change
- website design-system rewrite

## Next Goal

Next safe automatic goal: `Project Intelligence Watch Mode AI IDE Consumption Handoff v0.1`.

That goal should produce and validate a local handoff package telling Codex / AI IDE sessions how to run watch mode, read `project-intelligence-agent-context`, inspect `project-intelligence-watch-status`, and stop the watcher cleanly. It must still avoid hosted dashboard, telemetry, cloud sync, deployment, public release, and target repo writes.
