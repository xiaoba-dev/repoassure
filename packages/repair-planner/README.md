# Repair Planner Package

Phase 2d repair-planner package extraction is implemented with compatibility wrappers.

This package owns repair plan implementation modules for:

- `generate-repair-plan`
- `repair-plan`

The package exports typed root, `compatibility`, `generate-repair-plan`, and `repair-plan` subpaths. It depends on `@hardening-mcp/shared` for redaction and shell quoting.

`RepairPlanSummary` and generated JSON/Markdown expose P0/P1/P2/P3 counts. Security provider P3 findings remain actionable repair tasks instead of disappearing during plan ingestion.

Security tasks expose an explicit `trustBoundary` before provider-controlled content, use a generic RepoAssure-owned title, derive collision-free task identity from the normalized `findingId`, and render provider text as Markdown literals. Provider remediation and verification remain review evidence rather than executable commands.

Compatibility boundary:

- `src/domain/repair-plan/*` and `src/types/repair-plan.ts` compatibility wrappers keep legacy source imports working.
- `dist/domain/repair-plan/*` and `dist/types/repair-plan.*` remain generated compatibility outputs.
- `packages/repair-planner/src` is the implementation owner; root `src` paths must not regain duplicate repair planner implementation logic.
