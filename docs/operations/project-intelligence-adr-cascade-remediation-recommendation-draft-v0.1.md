# Project Intelligence ADR Cascade Remediation Recommendation Draft v0.1

Status: completed
Date: 2026-07-17

## Scope

This goal generated a maintainer-reviewable recommendation draft from the local ADR cascade remediation decision intake.

The draft recommends one decision value for each pending item and records rationale, risk, evidence, and rollback / follow-up notes. It does not write final maintainer decisions and does not authorize automatic ADR, spec, docs, tests, log, or source edits.

## Implementation

- Added `packages/acceptance/src/run-project-intelligence-recommendation-draft.ts`.
- Added `pnpm project:intelligence:recommendation-draft`.
- Added package export `@hardening-mcp/acceptance/run-project-intelligence-recommendation-draft`.
- Added unit coverage for recommendation draft generation, JSON/Markdown output, redaction, missing/malformed intake failure, and unsupported apply/repair option rejection.
- Generated `artifacts/project-graph/adr-cascade-remediation-recommendation-draft.md`.
- Generated `artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json`.

## Real Workspace Result

- Draft items: 11
- Recommended repair decisions: 11
- Final maintainer decisions written: 0
- Source intake: `artifacts/project-graph/adr-cascade-remediation-decision-intake.json`
- Markdown output: `artifacts/project-graph/adr-cascade-remediation-recommendation-draft.md`
- JSON output: `artifacts/project-graph/adr-cascade-remediation-recommendation-draft.json`

Each item keeps maintainer decision options pending:

- approve
- defer
- accept-risk
- repair

## Boundary

No final maintainer decision was written. No automatic ADR/spec/docs edits. No automatic ADR repair. No hosted dashboard. No cloud sync. No telemetry. No deployment. No public launch. No target repo writes. No website visual redesign.

This draft is advisory evidence only. The maintainer must explicitly approve, defer, accept risk, or request repair for each item before any downstream document remediation goal can execute.

## Verification Evidence

- `pnpm vitest run tests/unit/project-intelligence-recommendation-draft.test.ts`
- `pnpm build:acceptance`
- `node packages/acceptance/dist/run-project-intelligence-recommendation-draft.js --intake artifacts/project-graph/adr-cascade-remediation-decision-intake.json --output artifacts/project-graph`

## Next Goal

Project Intelligence ADR Cascade Maintainer Decision Recording v0.1.
