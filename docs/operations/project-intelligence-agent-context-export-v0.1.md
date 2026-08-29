# Project Intelligence Agent Context Export v0.1

Status: completed
Date: 2026-07-19

## Purpose

Generate a concise local-only context package for Codex / AI IDE agents from the existing Project Intelligence graph snapshot and `.autopilot` state. The package reduces repeated full-repo scanning and gives agents a stable read order before proposing or executing future goals.

## Implemented Scope

- Added `pnpm project:intelligence:agent-context`.
- Added `packages/acceptance/src/run-project-intelligence-agent-context.ts`.
- Added package exports for `@hardening-mcp/acceptance/run-project-intelligence-agent-context`.
- Writes ignored local artifacts:
  - `artifacts/project-graph/project-intelligence-agent-context.json`
  - `artifacts/project-graph/project-intelligence-agent-context.md`
- Includes:
  - read order for agents,
  - current goal state,
  - recommended next goal,
  - implemented product surfaces,
  - blocker / manual gate summary,
  - evidence paths,
  - redaction and non-authorization boundary.

## Acceptance Evidence

- JSON schema: `repoassure.project-intelligence-agent-context@1`.
- Output remains local-only and under the ignored `artifacts/project-graph/` boundary.
- Markdown states the boundary in plain language for human and AI review.
- No hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo write is implemented.

## Verification

- `pnpm vitest run tests/unit/project-intelligence-agent-context.test.ts` — passed, 2 tests.
- `pnpm vitest run tests/unit/project-structure.test.ts` — passed, 102 tests.
- `pnpm project:intelligence` — generated snapshot, 492 nodes / 1145 edges.
- `pnpm project:intelligence:agent-context` — generated context package, 4 product surfaces / 16 blockers / 1 recommended goal.
- `pnpm repo:hygiene` — passed.
- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm goal:audit` — passed automated checks; user confirmation remains the manual long-goal gate.
- `pnpm test` — sandbox run hit local server integration failures; escalated rerun passed 61 files / 672 tests, 1 skipped.

## Selected Next Goal

`Project Intelligence Watch Mode Planning v0.1`

Plain-language explanation: plan a local-only watch mode before implementation. The planning goal should define file-change scope, debounce behavior, artifact refresh flow, failure handling, and manual stop boundary, without starting hosted dashboard, telemetry, cloud sync, deployment, public release, or target repo writes.

## Non-Authorization Boundary

This goal did not execute deployment, public launch, repository visibility change, npm publication, GitHub release, hosted dashboard, cloud sync, telemetry, pricing/spend change, customer contact, website design-system rewrite, or target repo write.
