# Project Intelligence Watch Mode Implementation v0.1

Status: completed
Date: 2026-07-19
Source planning record: `docs/operations/project-intelligence-watch-mode-planning-v0.1.md`

## Purpose

Implement the local-only Project Intelligence watch runtime planned in v0.1. The goal is to let Codex / AI IDE sessions refresh Project Intelligence artifacts after bounded docs/code/autopilot edits without manually remembering both refresh commands.

## Implemented Command

```bash
pnpm project:intelligence:watch
```

Supported safe options:

- `--once`: run one refresh and stop. This is used for smoke validation and CI-friendly checks.
- `--debounce-ms <ms>`: override the default debounce window.
- `--root <path>`: set repository root.
- `--output <dir>`: set the Project Intelligence artifact directory.
- `--status <path>`: set the watch status artifact path.
- `--help` / `-h`: show usage.

Unsupported hosted or write-oriented options fail before the watcher starts.

## Runtime Behavior

- Watches only bounded source-of-truth paths:
  - `docs/**/*.md`
  - `docs/**/*.json`
  - `src/**/*.ts`
  - `packages/**/*.ts`
  - `apps/**/*.ts`
  - `apps/**/*.tsx`
  - `tests/**/*.ts`
  - `.autopilot/**/*.json`
  - `.autopilot/**/*.md`
- Ignores generated, dependency, cache, secret, and metadata paths:
  - `artifacts/**`
  - `.hardening/**`
  - `dist/**`
  - `packages/*/dist/**`
  - `apps/*/dist/**`
  - `node_modules/**`
  - `.git/**`
  - `.autopilot/runs/**`
  - `.autopilot/cache/**`
  - `.autopilot/secrets/**`
- Uses a default `1500 ms` debounce window.
- Uses bounded local polling over the allowed source-of-truth file scope. This replaced an earlier recursive `fs.watch` approach after local smoke validation exposed `EMFILE` file descriptor pressure.
- Coalesces burst events into one refresh cycle.
- If a refresh is already running, records a pending refresh and runs one additional cycle afterward.
- Refresh order is deterministic:
  1. `pnpm project:intelligence`
  2. `pnpm project:intelligence:agent-context`

The implementation reuses the local TypeScript runtime functions behind those commands rather than shelling out, while the status contract records the command order that users and AI IDEs should understand.

## Output Artifacts

All outputs remain ignored local artifacts under `artifacts/project-graph/`:

- `project-intelligence-snapshot.json`
- `project-intelligence-snapshot.md`
- `project-intelligence-agent-context.json`
- `project-intelligence-agent-context.md`
- `project-intelligence-watch-status.json`

The watch status artifact schema is:

```text
repoassure.project-intelligence-watch-status@1
```

It records:

- current status
- refresh count
- debounce window
- watched / ignored scope
- last changed paths
- last successful commands
- latest snapshot and agent context outputs
- sanitized failure summary when a refresh fails
- local-only / no daemon / no telemetry / no hosted dashboard / no target repo write boundary

## TDD Record

- Red: added `tests/unit/project-intelligence-watch.test.ts` before implementation. The first run failed because `packages/acceptance/src/run-project-intelligence-watch.ts` did not exist.
- Green: implemented `run-project-intelligence-watch.ts`, package exports, compatibility entrypoint, root script, type-smoke import, and contract assertions.
- Refactor / hardening: added `--once` for deterministic local smoke checks and status artifact verification without keeping CI or Codex sessions blocked by a foreground watcher.

## Verification

- `pnpm vitest run tests/unit/project-intelligence-watch.test.ts` — passed, 5 tests.
- `pnpm vitest run tests/unit/acceptance-package.test.ts` — passed, 31 tests.
- `pnpm vitest run tests/unit/project-structure.test.ts` — passed, 102 tests.
- `pnpm build:acceptance` — passed.
- `pnpm project:intelligence:watch -- --once` — passed, generated `artifacts/project-graph/project-intelligence-watch-status.json` with `status: stopped` and `refreshCount: 1`.
- `pnpm repo:hygiene` — passed.
- `pnpm release:check` — passed automated prerequisites; public release remains `no` pending manual legal/trademark/branch protection/final authorization gates.
- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm goal:audit` — passed automated checks; one user/manual confirmation gate remains by design.
- `pnpm test` — sandbox run failed on local server/timeout restrictions; escalated rerun passed 62 files / 677 tests, 1 skipped.

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

Project Intelligence Watch Mode Local Smoke Validation v0.1 has now completed.

Next safe automatic goal after local smoke validation: `Project Intelligence Watch Mode AI IDE Consumption Handoff v0.1`.

That goal should package how Codex / AI IDE sessions consume watch-generated artifacts and stop the watcher cleanly. It must still avoid hosted dashboard, telemetry, cloud sync, deployment, public release, and target repo writes.
