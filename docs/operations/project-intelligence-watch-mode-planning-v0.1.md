# Project Intelligence Watch Mode Planning v0.1

Status: completed
Date: 2026-07-19

## Purpose

Define a local-only watch mode for Project Intelligence before implementing any long-running watcher. The goal is to make graph refresh cheaper for Codex / AI IDE sessions while preserving the existing artifact, redaction, and non-authorization boundaries.

## Planned Command

Future implementation command:

```bash
pnpm project:intelligence:watch
```

The planning record does not implement this command. Implementation requires the separate goal `Project Intelligence Watch Mode Implementation v0.1`.

## File-Change Scope

Watch mode should observe only repo-owned source-of-truth inputs and local autopilot state:

- `docs/**/*.md`
- `docs/**/*.json`
- `src/**/*.ts`
- `packages/**/*.ts`
- `apps/**/*.ts`
- `apps/**/*.tsx`
- `tests/**/*.ts`
- `.autopilot/**/*.json`
- `.autopilot/**/*.md`

Watch mode must ignore generated and dependency-heavy paths:

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

## Debounce Strategy

- Default debounce: `1500 ms`.
- Burst behavior: coalesce multiple file events into one refresh cycle.
- Re-entrant behavior: if a refresh is already running, mark a pending refresh and run exactly one additional refresh after the current cycle completes.
- Optional future flag: `--debounce-ms <number>`.

## Refresh Order

Every accepted refresh cycle should run in this order:

1. `pnpm project:intelligence`
2. `pnpm project:intelligence:agent-context`

The first step refreshes `project-intelligence-snapshot.json` / `.md`. The second step derives `project-intelligence-agent-context.json` / `.md` from the latest snapshot and `.autopilot` state.

## Output Artifacts

Watch mode should continue writing only ignored local artifacts under `artifacts/project-graph/`:

- `project-intelligence-snapshot.json`
- `project-intelligence-snapshot.md`
- `project-intelligence-agent-context.json`
- `project-intelligence-agent-context.md`
- future watch status artifact: `project-intelligence-watch-status.json`

The watch status artifact should include last refresh time, refresh count, last successful commands, last failure summary, and current state. It must not include secrets, raw environment values, OTPs, cookies, access tokens, customer data, or private target repo contents.

## Failure Handling

- A failed refresh must not delete the last successful snapshot or agent context package.
- Failure state should be recorded in `project-intelligence-watch-status.json`.
- The CLI summary should show the failed command, sanitized error summary, and next manual action.
- The watcher should keep running after recoverable refresh failures unless the user stops it.
- Unsupported options should fail fast before starting the watcher.

## Manual Stop Boundary

- The user must be able to stop watch mode with `Ctrl+C`.
- Stop should be graceful: no partial JSON writes, no orphan child process, and no background daemon.
- Watch mode must run in the foreground by default.
- No launch agent, cron job, persistent service, or daemon should be created.

## Non-Authorization Boundary

This planning goal does not implement or authorize:

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

## Implementation Acceptance for Next Goal

`Project Intelligence Watch Mode Implementation v0.1` should use TDD and cover:

- CLI argument parsing and help text.
- file-change include / ignore scope.
- debounce and burst coalescing behavior.
- refresh order: snapshot first, agent context second.
- failed refresh status without deleting last good artifacts.
- redaction boundary for status output.
- graceful `Ctrl+C` / abort handling.
- no hosted dashboard, telemetry, cloud sync, deployment, or target repo write options.

## Verification

- `pnpm vitest run tests/unit/project-structure.test.ts` — passed, 102 tests.
- `pnpm repo:hygiene` — passed.
- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm goal:audit` — passed automated checks; user confirmation remains the manual long-goal gate.
- `pnpm test` — sandbox run hit local server integration failures; escalated rerun passed 61 files / 672 tests, 1 skipped.
