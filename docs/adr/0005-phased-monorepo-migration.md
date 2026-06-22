# ADR-0005: Phased Monorepo Migration

- Status: Accepted
- Date: 2026-06-20
- Deciders: hardening-mcp maintainers

## Context

The project now contains multiple logical products and ownership areas: CLI, MCP server, core hardening flow, browser explorer, repair planner, acceptance tooling, shared utilities, docs, examples, and artifacts. A monorepo layout is appropriate, but current scripts, tests, `bin` entries, goal audit, benchmark runner, and documentation still depend on stable compatibility paths.

Phase 0 and Phase 1 are complete. Phase 2 acceptance package pilot is implemented: `packages/acceptance/src` owns acceptance implementation modules and package runner entrypoints, while legacy `src/internal/acceptance/*` and `dist/internal/acceptance/*` remain compatibility wrapper/output surfaces. ADR-0006 defines the package build and compatibility strategy for this pilot.

## Decision

Move toward monorepo in phases:

1. Phase 0: Add workspace scaffold and ownership docs.
2. Phase 1: Add app shells in `apps/cli` and `apps/mcp-server`, while preserving old `dist/adapters/*` bin compatibility.
3. Phase 2: Extract runtime ownership one package at a time, with the acceptance package pilot already implemented through `packages/acceptance/src` and compatibility wrappers.
4. Phase 3: Add dashboard expansion only when product workflow requires it.

Do not move `src/shared/*` into `packages/shared/src` until the build can preserve `dist/shared/*` compatibility outputs and existing imports have a tested migration path. Broader package extraction remains phased until each package has equivalent wrapper, import-boundary, build, typecheck, and acceptance gates.

## Consequences

### Positive

- The repository gains monorepo ownership boundaries without breaking existing users.
- CLI/MCP bins, benchmark, goal audit, and acceptance docs remain valid.
- The acceptance package now has real package-owned implementation while preserving legacy compatibility paths.
- Broader package extraction remains phased instead of hidden behind partial migrations.

### Negative

- Non-acceptance package directories remain shells or placeholders until their compatibility gates are defined.
- Some duplication of structure documentation is necessary during the compatibility window.

### Follow-up

- Design package build strategy for `packages/shared`.
- Add compatibility wrapper tests before moving shared code.
- Update goal audit as each non-acceptance package boundary becomes a canonical runtime path.
