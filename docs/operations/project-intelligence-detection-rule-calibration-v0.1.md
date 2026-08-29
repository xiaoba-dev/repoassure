# Project Intelligence Detection Rule Calibration v0.1

Status: completed
Date: 2026-07-19

## Purpose

Tighten Project Intelligence `findOrphanCode` ownership documentation detection so an app or package only passes the ownership README check when its own root `README.md` exists.

## Change

- Previous rule: any contained path ending in `/README.md` could satisfy the app ownership documentation check.
- New rule: only the exact app or package root path `${node.id}/README.md` satisfies the check.
- Regression fixture: `apps/nested-readme/docs/README.md` no longer satisfies `apps/nested-readme` ownership documentation.

## Result

- A nested README-only app is reported as `orphan_code`.
- Existing apps or packages with root-level README files continue to pass.
- The rule calibration does not broaden scanning scope and does not reintroduce vendor README false negatives.

## Verification

- `pnpm vitest run tests/unit/project-intelligence-snapshot.test.ts`
- `pnpm vitest run tests/unit/project-intelligence-snapshot.test.ts tests/unit/project-structure.test.ts` — 2 files / 104 tests passed
- `pnpm project:intelligence` — generated 486 nodes / 1129 edges / findings 0
- `pnpm project:intelligence:backlog` — items 0 / missing cascade findings 0
- `pnpm repo:hygiene`
- `pnpm release:check` — automated prerequisites passed; public release remains `not_ready` until manual authorization gates close
- `pnpm typecheck`
- `pnpm lint`
- `pnpm goal:audit` — 34 passed / 1 manual confirmation
- `pnpm test` — sandbox run failed on local server integration tests; escalated rerun passed 60 files / 670 tests, 1 skipped

## Boundary

No hosted dashboard, cloud sync, telemetry, deployment, public release, repository visibility change, npm publication, GitHub release, target repo write, customer contact, pricing change, or spend change was authorized or performed.
