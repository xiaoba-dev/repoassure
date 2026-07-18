# Project Intelligence Console Local Static Viewer v0.1

Status: completed
Date: 2026-07-17

## Scope

This goal implemented a local-only static viewer for Project Intelligence snapshots.

The viewer reads `artifacts/project-graph/project-intelligence-snapshot.json` and generates `artifacts/project-graph/project-intelligence-viewer.html` under the ignored `artifacts/project-graph/` boundary. It is intended for maintainer and AI IDE review of `docsGraph`, `codeGraph`, and `progressGraph` without introducing a hosted dashboard.

## Implementation

- Added `packages/acceptance/src/run-project-intelligence-viewer.ts`.
- Added `pnpm project:intelligence:view`.
- Exported the runner through `@hardening-mcp/acceptance/run-project-intelligence-viewer`.
- Added unit coverage for HTML generation, missing snapshot failure, malformed snapshot failure, redaction boundary, and unsupported CLI options.
- Kept the generated viewer self-contained and local-only.

## Generated Artifact

- `artifacts/project-graph/project-intelligence-viewer.html`

The artifact is generated and ignored. It should not be committed as a product source file.

## Boundary

No hosted dashboard. No cloud sync. No telemetry. No deployment. No public launch. No target repo writes. No website visual redesign.

## Verification Evidence

- `pnpm vitest run tests/unit/project-intelligence-viewer.test.ts`
- `pnpm typecheck:acceptance`
- `pnpm build:acceptance`
- `node packages/acceptance/dist/run-project-intelligence-viewer.js --snapshot artifacts/project-graph/project-intelligence-snapshot.json --output artifacts/project-graph`

## Next Goal

Project Intelligence Console Graph Freshness and Staleness Checks v0.1.
