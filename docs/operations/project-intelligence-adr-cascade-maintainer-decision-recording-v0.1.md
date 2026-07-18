# Project Intelligence ADR Cascade Maintainer Decision Recording v0.1

Status: completed
Date: 2026-07-18

## Scope

This goal recorded explicit maintainer decisions for the local ADR cascade recommendation draft.

The owner authorized execution in the Codex conversation on 2026-07-18. Based on that authorization, the 11 recommendation draft items were recorded with maintainer decision `repair`.

This record is a decision record only. It does not execute repair, does not rewrite ADRs, and does not mutate specs, docs, tests, logs, source code, hosted dashboard state, cloud sync, telemetry, deployment, release, target repos, or website design-system work.

## Implementation

- Added `packages/acceptance/src/run-project-intelligence-maintainer-decision.ts`.
- Added `pnpm project:intelligence:maintainer-decision`.
- Added package export `@hardening-mcp/acceptance/run-project-intelligence-maintainer-decision`.
- Added unit coverage for maintainer decision record generation, JSON/Markdown output, redaction, missing/malformed recommendation draft failure, unsupported repair execution option rejection, and unsupported decision rejection.
- Generated `artifacts/project-graph/adr-cascade-maintainer-decision-record.md`.
- Generated `artifacts/project-graph/adr-cascade-maintainer-decision-record.json`.

## Real Workspace Result

- Decision items: 11
- Final maintainer decisions written: 11
- Repair decisions recorded: 11
- Repair execution authorized: no
- Source recommendation draft: `artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json`
- Markdown output: `artifacts/project-graph/adr-cascade-maintainer-decision-record.md`
- JSON output: `artifacts/project-graph/adr-cascade-maintainer-decision-record.json`
- Evidence note: `Owner authorized execution in Codex conversation on 2026-07-18.`

## Boundary

Maintainer decisions were recorded, but repair execution was not authorized by this goal.

No automatic ADR/spec/docs edits. No automatic ADR repair. No hosted dashboard. No cloud sync. No telemetry. No deployment. No public launch. No target repo writes. No website visual redesign.

The next goal may prepare a controlled remediation plan from the decision record, but it must still keep actual document mutation behind a separately confirmed remediation execution boundary.

## Verification Evidence

- `pnpm vitest run tests/unit/project-intelligence-maintainer-decision.test.ts`
- `pnpm build:acceptance`
- `node packages/acceptance/dist/run-project-intelligence-maintainer-decision.js --draft artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json --output artifacts/project-graph --decision repair --evidence-note "Owner authorized execution in Codex conversation on 2026-07-18." --maintainer owner`

## Next Goal

Project Intelligence ADR Cascade Controlled Remediation Plan v0.1.
