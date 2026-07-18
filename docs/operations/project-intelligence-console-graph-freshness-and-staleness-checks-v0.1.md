# Project Intelligence Console Graph Freshness and Staleness Checks v0.1

Status: completed
Date: 2026-07-17

## Scope

This goal extended the local Project Intelligence snapshot and viewer with deterministic freshness and staleness findings.

The checks remain local-only and write only ignored artifacts under `artifacts/project-graph/`.

## Implementation

- Added `findings` to `project-intelligence-snapshot.json`.
- Added `summary.findings` counts for total, high, medium, and low findings.
- Added Markdown output for freshness and staleness findings.
- Added local static viewer rendering for findings.
- Covered missing cascade, orphan app ownership documentation, missing package test links, and progress active-goal mismatch with unit tests.

## Real Workspace Result

Latest local snapshot result:

- Total findings: 11
- High: 0
- Medium: 11
- Low: 0
- Current category: `missing_cascade`

The current findings identify ADRs that lack graph-visible downstream cascade evidence.

## Generated Artifacts

- `artifacts/project-graph/project-intelligence-snapshot.json`
- `artifacts/project-graph/project-intelligence-snapshot.md`
- `artifacts/project-graph/project-intelligence-viewer.html`

These files are ignored generated artifacts and should not be committed as source.

## Boundary

No hosted dashboard. No cloud sync. No telemetry. No deployment. No public launch. No target repo writes. No website visual redesign.

## Verification Evidence

- `pnpm vitest run tests/unit/project-intelligence-snapshot.test.ts tests/unit/project-intelligence-viewer.test.ts`
- `pnpm build:acceptance`
- `node packages/acceptance/dist/run-project-intelligence-snapshot.js --root . --output artifacts/project-graph`
- `node packages/acceptance/dist/run-project-intelligence-viewer.js --snapshot artifacts/project-graph/project-intelligence-snapshot.json --output artifacts/project-graph`

## Next Goal

Project Intelligence ADR Cascade Remediation Backlog v0.1.
