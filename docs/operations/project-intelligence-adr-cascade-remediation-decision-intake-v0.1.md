# Project Intelligence ADR Cascade Remediation Decision Intake v0.1

Status: completed
Date: 2026-07-17

## Scope

This goal generated a maintainer-reviewable decision intake package from the local ADR cascade remediation backlog.

The intake package records one pending decision slot for each backlog item and does not authorize automatic ADR, spec, docs, tests, log, or source edits.

## Implementation

- Added `packages/acceptance/src/run-project-intelligence-decision-intake.ts`.
- Added `pnpm project:intelligence:decision-intake`.
- Added package export `@hardening-mcp/acceptance/run-project-intelligence-decision-intake`.
- Added unit coverage for decision intake generation, JSON/Markdown output, redaction, missing/malformed backlog failure, and unsupported repair option rejection.
- Generated `artifacts/project-graph/adr-cascade-remediation-decision-intake.md`.
- Generated `artifacts/project-graph/adr-cascade-remediation-decision-intake.json`.

## Real Workspace Result

- Decision items: 11
- Pending decisions: 11
- Source backlog: `artifacts/project-graph/adr-cascade-remediation-backlog.md`
- Markdown output: `artifacts/project-graph/adr-cascade-remediation-decision-intake.md`
- JSON output: `artifacts/project-graph/adr-cascade-remediation-decision-intake.json`

Each item keeps the following allowed decision values:

- approve
- defer
- accept-risk
- repair

## Boundary

No automatic ADR/spec/docs edits. No automatic ADR repair. No hosted dashboard. No cloud sync. No telemetry. No deployment. No public launch. No target repo writes. No website visual redesign.

This intake is not a maintainer decision. It only provides decision slots and evidence structure for review.

## Verification Evidence

- `pnpm vitest run tests/unit/project-intelligence-decision-intake.test.ts`
- `pnpm build:acceptance`
- `node packages/acceptance/dist/run-project-intelligence-decision-intake.js --backlog artifacts/project-graph/adr-cascade-remediation-backlog.md --output artifacts/project-graph`

## Next Goal

Project Intelligence ADR Cascade Remediation Recommendation Draft v0.1.
