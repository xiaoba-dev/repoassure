# Project Intelligence Watch Mode Recovery Command UX v0.1

Status: completed
Date: 2026-07-21
Source: `docs/operations/project-intelligence-watch-mode-operator-playbook-consumption-validation-v0.1.md`

## Objective

Improve local Project Intelligence watch mode recovery UX so stale, missing, or malformed watch artifacts produce explicit, source-derived recovery command guidance for maintainers, Codex, and AI IDE sessions.

## Delivered

- Added a machine-readable `recoveryPlan` contract to `project-intelligence-watch-handoff.json`.
- Added a `## Recovery Plan` section to `project-intelligence-watch-handoff.md`.
- `recoveryPlan.status` is `not_needed` when freshness checks pass and `required` when freshness checks fail.
- Failed freshness checks are listed in `recoveryPlan.failedChecks`.
- Recovery commands remain local-only and source-derived:
  - `pnpm project:intelligence:watch -- --once`
  - `pnpm project:intelligence:watch-handoff`
  - `cat artifacts/project-graph/project-intelligence-watch-handoff.md`
- Recovery guidance explicitly says: Do not repair freshness failures by editing generated artifacts by hand.
- Recovery boundary remains local-only: no hosted dashboard, no telemetry, no cloud sync, no target repo writes, and no manual generated-artifact edit path.

## TDD Record

- Red: `tests/unit/project-intelligence-watch-handoff.test.ts` first asserted `recoveryPlan` for both healthy and failing watch status scenarios.
- Green: `packages/acceptance/src/run-project-intelligence-watch-handoff.ts` now builds and serializes `recoveryPlan` plus Markdown recovery guidance.
- Coverage level: unit contract coverage. Real workspace smoke validation is intentionally deferred to the next goal.

## Verification

- `pnpm vitest run tests/unit/project-intelligence-watch-handoff.test.ts`

## Boundary

This goal did not run deployment, public release, repository visibility changes, npm publication, GitHub release creation, customer contact, pricing/spend changes, hosted dashboard work, telemetry, cloud sync, website design-system rewrites, or target repo writes.

## Next Codex Goal

Project Intelligence Watch Mode Recovery UX Real Workspace Smoke v0.1.
