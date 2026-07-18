# Project Intelligence ADR Cascade Remediation Backlog v0.1

Status: completed
Date: 2026-07-17

## Scope

This goal generated a maintainer-reviewable backlog from Project Intelligence `missing_cascade` findings.

The backlog is generated locally from `artifacts/project-graph/project-intelligence-snapshot.json` and does not authorize automatic ADR, spec, acceptance, test, or log edits.

## Implementation

- Added `packages/acceptance/src/run-project-intelligence-backlog.ts`.
- Added `pnpm project:intelligence:backlog`.
- Added package export `@hardening-mcp/acceptance/run-project-intelligence-backlog`.
- Added unit coverage for backlog generation, missing/malformed snapshot failure, redaction, and unsupported apply option rejection.
- Generated `artifacts/project-graph/adr-cascade-remediation-backlog.md`.

## Real Workspace Result

- Backlog items: 11
- Source category: `missing_cascade`
- Output: `artifacts/project-graph/adr-cascade-remediation-backlog.md`

Each item requires one maintainer decision:

- approve
- defer
- accept-risk
- repair

## Boundary

No automatic ADR/spec/docs edits. No hosted dashboard. No cloud sync. No telemetry. No deployment. No public launch. No target repo writes. No website visual redesign.

## Verification Evidence

- `pnpm vitest run tests/unit/project-intelligence-backlog.test.ts`
- `pnpm build:acceptance`
- `pnpm typecheck:acceptance`
- `node packages/acceptance/dist/run-project-intelligence-backlog.js --snapshot artifacts/project-graph/project-intelligence-snapshot.json --output artifacts/project-graph`

## Next Goal

Project Intelligence ADR Cascade Remediation Decision Intake v0.1.
