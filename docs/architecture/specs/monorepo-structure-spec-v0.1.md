# Monorepo Structure Spec v0.1

Status: Accepted for phased migration
Date: 2026-06-20

## Purpose

Move `hardening-mcp` toward a monorepo that separates runnable apps, reusable packages, tests, documentation, examples, and generated artifacts without disrupting the current CLI/MCP/product acceptance flow.

## Current State

The current implementation is a phased monorepo workspace: CLI/MCP runtime entrypoints still preserve the root package compatibility bins, while `packages/acceptance` now owns the acceptance implementation modules, runner entrypoints, goal audit, and user acceptance handoff. The legacy `src/internal/acceptance/*` and `dist/internal/acceptance/*` paths remain compatibility wrapper/output surfaces during the migration window.

```text
apps/
  cli/
  mcp-server/
packages/
  acceptance/
src/
  adapters/
  tools/
  domain/
  shared/
  internal/
  types/
tests/
docs/
artifacts/
fixtures/
```

Remaining non-acceptance runtime code still has useful internal boundaries, but core orchestration, browser exploration, repair planning, shared utilities, and app entrypoint implementation are still coupled through the root package during the compatibility window.

## Target Shape

```text
apps/
  cli/
  mcp-server/
  web-dashboard/          # future
packages/
  core/
  browser-explorer/
  repair-planner/
  acceptance/
  shared/
tests/
  unit/
  integration/
  e2e/
fixtures/
docs/
  product/
  architecture/
  acceptance/
  goals/
  logs/
artifacts/
  benchmark-runs/
  user-acceptance-runs/   # future
examples/
```

## Ownership Rules

| Area | Responsibility | Current source | Future package/app |
| --- | --- | --- | --- |
| CLI entrypoint | User-facing command-line app | `src/adapters/cli` | `apps/cli` |
| MCP entrypoint | stdio MCP server and registry | `src/adapters/mcp` | `apps/mcp-server` |
| Core orchestration | hardening flow and tool contracts | `src/tools`, selected `src/domain/*` | `packages/core` |
| Browser explorer | Playwright/fetch exploration and interaction model | `src/domain/explore` | `packages/browser-explorer` |
| Repair planner | repair plan and repair task package generation | `src/domain/repair-plan`, `src/types/repair-plan.ts` | `packages/repair-planner` |
| Acceptance | acceptance, user acceptance, and goal audit | `src/internal/acceptance` | `packages/acceptance` |
| Benchmark | benchmark runner and spike report generation | `src/internal/benchmark`, `scripts/run-benchmark.mjs` | Deferred separate package decision |
| Shared utilities | redaction and shell helpers | `src/shared` | `packages/shared` |

## Artifact Rules

- Generated target repo artifacts stay in the target repo: `<target>/.hardening/`, `<target>/hardening-report.md`, `<target>/tests/hardening/`.
- This repo's own generated artifacts stay under `artifacts/`.
- `docs/acceptance/` may keep human-readable acceptance records that summarize target repo runs.
- Do not commit central copies of target repo `.hardening/runs/*` unless they are deliberate fixtures.

## Migration Phases

### Phase 0: Scaffold and Contract

Phase 0 status: completed.

- `pnpm-workspace.yaml` declares the `apps/*` and `packages/*` workspaces.
- `apps/*` and `packages/*` ownership docs exist.
- This structure spec is the architecture contract for phased migration.
- Structure tests guard the workspace declaration and package/app ownership directories.

### Phase 1: App Shell Split

Phase 1 app shell status: implemented with compatibility wrappers.

- Move CLI and MCP entrypoints to `apps/cli` and `apps/mcp-server`.
- Keep implementation imports pointed at the root package until packages are split.
- Preserve existing bins:
  - `hardening`
  - `hardening-mcp`
- Required gates:
  - `pnpm build`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test:unit`
  - smoke CLI help
- MCP server integration tests

Implementation note: during the compatibility window, `apps/cli/index.js` and `apps/mcp-server/index.js` invoke the built `dist/adapters/*` entrypoints. The package `bin` fields intentionally continue to point at `dist/adapters/cli/index.js` and `dist/adapters/mcp/index.js` so existing users, goal audit, benchmark, and acceptance docs remain valid.

### Phase 2: Package Boundary Split

Phase 2 status: acceptance package pilot implemented; broader package extraction remains deferred.

- Extract `packages/acceptance` first as the Phase 2 implementation-owner pilot.
- Extract `packages/shared` only after `dist/shared/*` compatibility preservation is tested.
- Extract `packages/browser-explorer` and `packages/repair-planner` next.
- Extract `packages/core` only after CLI/MCP import boundaries are stable.
- Keep public APIs narrow and typed.

Current decision:

- Keep `src/shared/*` as the canonical runtime source during Phase 1.
- Do not move `src/shared/*` into `packages/shared/src` until the build can preserve `dist/shared/*` compatibility outputs.
- Follow [ADR-0006: Package Build Strategy](../../adr/0006-package-build-strategy.md) before moving implementation files into `packages/*/src`.
- Extract `packages/acceptance` first as the Phase 2 pilot because its boundary is narrower than `core` and less coupled than `shared`.
- Before moving shared code, implement a package build strategy that can compile package sources, preserve `dist/shared/*` compatibility outputs, and avoid breaking existing relative imports in `src/domain`, `src/tools`, `src/adapters`, and `src/internal`.
- Phase 2 acceptance package pilot status: implemented as package-owned runner entrypoints with compatibility outputs.
- `packages/acceptance` now owns implementation modules and runner entrypoints for `acceptance`, `goal:audit`, `user:accept`, and `user:handoff`, while `src/internal/acceptance/*` remains a compatibility wrapper surface and `dist/internal/acceptance/*` remains a compatibility output surface.
- Package acceptance wrapper resolution now points at `packages/acceptance/dist/*`; legacy `dist/internal/acceptance/*` remains a compatibility output surface, not the package execution target, and `.js` runtime wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps are checked by goal audit.
- Package build order is package-first for the acceptance pilot: `pnpm build` runs `build:packages` before `build:src`, and `pnpm typecheck` builds package declarations before checking root `src`.
- Legacy acceptance markdown helpers now re-export `packages/acceptance/dist/markdown.js`, proving selected `src/internal/acceptance/*` paths can become compatibility wrappers rather than duplicate implementations.
- Legacy acceptance fatal error formatting now re-exports `packages/acceptance/dist/fatal-error.js`, keeping redacted fatal errors package-owned while preserving the old source path.
- Legacy repo preflight helpers now re-export `packages/acceptance/dist/repo-preflight.js`, keeping repo root and `package.json` manifest checks package-owned while preserving the old source path.
- Legacy acceptance report helpers now re-export `packages/acceptance/dist/report.js`, keeping acceptance summary and Markdown generation package-owned while preserving the old source path.
- Legacy user acceptance args helpers now re-export `packages/acceptance/dist/user-acceptance-args.js`, keeping real-project acceptance command parsing and formatting package-owned while preserving the old source path.
- Legacy user acceptance Markdown helpers now re-export `packages/acceptance/dist/user-acceptance.js`, keeping real-project acceptance record rendering package-owned while preserving the old source path.
- Legacy user acceptance handoff Markdown helpers now re-export `packages/acceptance/dist/user-acceptance-handoff.js`, keeping final manual acceptance handoff rendering package-owned while preserving the old source path.
- Legacy goal audit Markdown helpers now re-export `packages/acceptance/dist/goal-audit.js`, keeping goal audit summary and Markdown rendering package-owned while preserving the old source path.
- Legacy acceptance runner helpers now re-export `packages/acceptance/dist/run-acceptance.js`, keeping acceptance CLI parsing and command formatting package-owned while a direct-run shim preserves executable legacy dist compatibility.
- Legacy user acceptance handoff runner helpers now re-export `packages/acceptance/dist/run-user-acceptance-handoff.js`, keeping handoff CLI parsing, repo preflight, and handoff writing package-owned while a direct-run shim preserves executable legacy dist compatibility.
- Legacy goal audit runner helpers now re-export `packages/acceptance/dist/run-goal-audit.js`, keeping goal audit workspace collection and writing package-owned while a direct-run shim preserves executable legacy dist compatibility.
- Legacy user acceptance runner helpers now re-export `packages/acceptance/dist/run-user-acceptance.js` and `packages/acceptance/dist/user-acceptance-runner-helpers.js`, keeping real-project acceptance orchestration and generated-test validation package-owned while a direct-run shim preserves executable legacy dist compatibility.
- `user:handoff` now consumes the package-owned goal audit workspace builder instead of dynamically importing the legacy `dist/internal/acceptance/run-goal-audit.js` item loader.
- Package goal audit source collection now reads package-owned acceptance implementation files for user acceptance, handoff, repo preflight, and goal audit evidence, while legacy `src/internal/acceptance/*` remains only a compatibility behavior surface.
- Goal audit also reads legacy `src/internal/acceptance/*.ts` through `legacyAcceptanceWrapperSourceEntries` and a dedicated wrapper-audit source list; it fails if any legacy file stops delegating to `packages/acceptance/dist/*`.
- Benchmark report ownership remains outside the acceptance package pilot and stays in `src/internal/benchmark` until a separate package decision exists.
- Current goal audit item construction is owned by the package runner API through `buildCurrentGoalAuditItems()`, which delegates to the package workspace source reader and current-item composer.
- The package `run-goal-audit` subpath also preserves the legacy helper API shape for required document paths, user acceptance record classification, accepted-record checks, and acceptance-run freshness checks.
- The root package depends on `@hardening-mcp/acceptance` via `workspace:*`; all package-owned acceptance module subpaths in `packages/acceptance/package.json` now declare both `types` and `default` entries, and the package root exports `acceptancePackageSourceEntries` plus `legacyAcceptanceWrapperSourceEntries` for goal audit and structure tests.
- Goal audit treats the acceptance package exports as an exact package export surface derived from `acceptancePackageExportEntries`; missing, mismatched, or unexpected `packages/acceptance/package.json` exports fail the architecture migration evidence.
- `acceptancePackageDistOutputEntries` is derived from `acceptancePackageExportEntries`, so package dist `.js`, `.d.ts`, and `.js.map` structure tests, runtime smoke checks, and package type-resolution checks share the same package export contract.
- `acceptancePackageDistOutputEntries` and `legacyAcceptanceDistOutputEntries` include `.js.map` source map paths through `sourceMapPath`, so generated package and legacy compatibility source maps are governed by the same dist output contracts as runtime JavaScript and declarations.
- `acceptancePackageSourceEntries` is derived from `acceptanceCompatibilityContract.packageOwnedModules`, so source file structure tests, runtime smoke checks, and package type-resolution checks share the same package-owned source contract.
- `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, and `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` are derived from `acceptancePackageDistOutputEntries`, so goal audit source collection, process governance checks, runtime smoke checks, and package type-resolution checks share the same package dist source contract.
- Standard acceptance now runs an all-subpath package import smoke gate for every `@hardening-mcp/acceptance/*` package export, proving package export resolution during routine validation, verifying runner subpaths expose `main()`, checking root/compatibility runtime contracts for `acceptancePackageExportEntries`, `acceptancePackageDistOutputEntries`, `acceptancePackageSourceEntries`, `legacyAcceptanceDistOutputEntries`, and `legacyAcceptanceWrapperSourceEntries`, and checking that root and `goal-audit-sources` package subpaths expose identical package and legacy source map source specs through `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, and `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`.
- Standard acceptance also runs a package subpath type-resolution smoke gate, proving TypeScript resolves every package-owned acceptance subpath and the root/compatibility/`goal-audit-sources` contract types, including `acceptancePackageDistOutputEntries`, `acceptancePackageSourceEntries`, `legacyAcceptanceWrapperSourceEntries`, `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, and `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, through the package `types` entries.
- Phase 2b package-owned implementation status: `packages/acceptance` now exposes `compatibility`, `markdown`, `report`, `goal-audit`, `goal-audit-requirements`, `goal-audit-user-acceptance`, `goal-audit-user-acceptance-materials`, `goal-audit-sources`, `goal-audit-delivery`, `goal-audit-runtime`, `goal-audit-workflow-artifacts`, `goal-audit-observability-security`, `goal-audit-process-governance`, `goal-audit-evidence-documents`, `goal-audit-current-items`, `user-acceptance`, `user-acceptance-handoff`, `fatal-error`, `redaction`, `repo-preflight`, `user-acceptance-args`, `run-acceptance`, `run-user-acceptance-handoff`, `shell-quote`, `shell-words`, `user-acceptance-record`, `user-acceptance-runner-helpers`, `run-user-acceptance`, and `run-goal-audit` as implementation modules, with the old `src/internal/acceptance/*` behavior kept in compatibility tests.
- Remaining Phase 2 acceptance work is governance and compatibility evidence, not moving more `src/internal/acceptance/*` implementation modules.

### Phase 3: Acceptance and Dashboard Expansion

- Acceptance runners already live under `packages/acceptance`; future work should focus on generated output compatibility and any real UI workflow.
- Add `apps/web-dashboard` only when there is a real UI workflow.
- Add artifact index support for multi-repo runs under `artifacts/user-acceptance-runs/`.

## Non-Goals

- No behavior changes during Phase 0.
- No dependency upgrades as part of the structure migration.
- No source-code package split without green quality gates.
- No moving target repo artifacts into this repo's source tree.

## Acceptance Criteria

- `pnpm-workspace.yaml` declares `apps/*` and `packages/*`.
- `apps/cli`, `apps/mcp-server`, and planned `packages/*` ownership docs exist.
- README points readers to this spec.
- `tests/unit/project-structure.test.ts` guards the completed Phase 0 scaffold, Phase 1 app shell compatibility, and Phase 2 acceptance package pilot.
- Phase 2 acceptance package pilot is part of the current acceptance criteria: `packages/acceptance` owns package implementation modules and runner entrypoints, legacy `src/internal/acceptance/*` and `dist/internal/acceptance/*` remain compatibility wrapper/output surfaces, and package subpath runtime/type smoke gates pass.
- Current quality gates continue to pass: `pnpm test:unit`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `pnpm acceptance -- --full --browser`.
