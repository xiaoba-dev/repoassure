# Project Intelligence Console Graph Snapshot Generator v0.1

Status: completed
Date: 2026-07-17

## Goal

Implement the first local-only Project Intelligence Console foundation by generating bounded graph snapshot artifacts from repository files.

## Completed Scope

- Added `packages/acceptance/src/run-project-intelligence-snapshot.ts`.
- Added `pnpm project:intelligence`.
- Generates:
  - `artifacts/project-graph/project-intelligence-snapshot.json`
  - `artifacts/project-graph/project-intelligence-snapshot.md`
- Snapshot includes:
  - `docsGraph`
  - `codeGraph`
  - `progressGraph`
  - local-only boundary metadata
  - source coverage metadata
  - redaction metadata
- Added `artifacts/project-graph/` to ignored generated artifacts.

## Evidence

- Focused fixture test: `tests/unit/project-intelligence-snapshot.test.ts`.
- Package export and structure coverage: `tests/unit/acceptance-package.test.ts`, `tests/type-smoke/acceptance-package-subpaths.ts`, `tests/unit/project-structure.test.ts`.
- Real workspace snapshot generated locally:
  - nodes: 2617
  - edges: 3147
  - output: `artifacts/project-graph/project-intelligence-snapshot.json`
  - output: `artifacts/project-graph/project-intelligence-snapshot.md`

## Boundaries

- No hosted dashboard implemented.
- No internal console UI implemented.
- No telemetry, cloud sync, upload, deployment, public launch, repository visibility change, npm publication, GitHub release, pricing/spend change, customer contact, or website visual redesign.
- No target repository modification.

## Next Goal

Project Intelligence Console Local Static Viewer v0.1.

Plain-language explanation: the graph snapshot generator now exists. The next automatic product-core goal should render those local JSON snapshots into a local-only static viewer so maintainers and AI IDEs can inspect docs, code, and progress relationships without hosted dashboard or cloud dependency.
