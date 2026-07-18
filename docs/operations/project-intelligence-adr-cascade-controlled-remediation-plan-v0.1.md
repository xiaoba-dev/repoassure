# Project Intelligence ADR Cascade Controlled Remediation Plan v0.1

Status: completed
Date: 2026-07-18

## Scope

This goal generated a controlled remediation plan from the local ADR cascade maintainer decision record.

The source record contains 11 maintainer decisions with `maintainerDecision=repair`. This goal converted those decisions into a local, reviewable plan with file-level scope, execution order, rollback notes, and verification checklist.

This plan is planning evidence only. It does not execute repair, does not rewrite ADRs, and does not mutate specs, docs, tests, logs, source code, hosted dashboard state, cloud sync, telemetry, deployment, release, target repos, or website design-system work.

## Implementation

- Added `packages/acceptance/src/run-project-intelligence-controlled-remediation-plan.ts`.
- Added `pnpm project:intelligence:controlled-remediation-plan`.
- Added package export `@hardening-mcp/acceptance/run-project-intelligence-controlled-remediation-plan`.
- Added unit coverage for controlled remediation plan generation, JSON/Markdown output, redaction, missing/malformed maintainer decision record failure, and unsupported execution option rejection.
- Generated `artifacts/project-graph/adr-cascade-controlled-remediation-plan.md`.
- Generated `artifacts/project-graph/adr-cascade-controlled-remediation-plan.json`.

## Real Workspace Result

- Plan items: 11
- Repair decisions included: 11
- Automatic edits planned: no
- Repair execution authorized: no
- Source maintainer decision record: `artifacts/project-graph/adr-cascade-maintainer-decision-record.json`
- Markdown output: `artifacts/project-graph/adr-cascade-controlled-remediation-plan.md`
- JSON output: `artifacts/project-graph/adr-cascade-controlled-remediation-plan.json`

## Boundary

The controlled remediation plan is ready, but repair execution remains unauthorized.

No automatic ADR/spec/docs edits. No automatic ADR repair. No hosted dashboard. No cloud sync. No telemetry. No deployment. No public launch. No target repo writes. No website visual redesign.

The next goal may execute the controlled remediation plan only after separate maintainer authorization for concrete file edits.

## Verification Evidence

- `pnpm vitest run tests/unit/project-intelligence-controlled-remediation-plan.test.ts`
- `pnpm build:acceptance`
- `pnpm typecheck:acceptance`
- `node packages/acceptance/dist/run-project-intelligence-controlled-remediation-plan.js --decision-record artifacts/project-graph/adr-cascade-maintainer-decision-record.json --output artifacts/project-graph`

## Next Goal

Project Intelligence ADR Cascade Controlled Remediation Execution v0.1.
