# ADR-0006: Package Build Strategy

- Status: Accepted
- Date: 2026-06-20
- Deciders: hardening-mcp maintainers

## Context

ADR-0005 accepts a phased monorepo migration. The initial Phase 2 package extraction was deferred until the build could preserve compatibility outputs, but the acceptance package pilot is no longer deferred: `packages/acceptance` now owns acceptance implementation modules and runner entrypoints while compatibility outputs remain available under `src/internal/acceptance/*` and `dist/internal/acceptance/*`. Phase 2c shared package extraction is also implemented: `packages/shared` now owns redaction and shell helper implementations while compatibility outputs remain available under `src/shared/*` and `dist/shared/*`. Existing CLI bins, MCP entrypoints, acceptance scripts, goal audit, benchmark runs, tests, and documentation still rely on stable compatibility paths.

Moving source files directly into `packages/*/src` would create three risks:

- Existing imports from `src/domain`, `src/tools`, `src/adapters`, and `src/internal` may break because many modules depend on relative paths into `src/shared` or sibling runtime areas.
- Existing `dist/*` outputs may disappear or move, breaking installed bins and scripted acceptance flows.
- A partial split could make ownership look clearer while making runtime behavior harder to verify.

## Decision

Use a compatibility-first package build strategy:

1. Keep `src/` as the canonical runtime source until each package has a tested extraction plan.
2. Introduce package source trees one package at a time, starting with `packages/acceptance`.
3. For each extracted package, preserve the existing `dist/*` compatibility output until all callers are migrated.
4. Use package-level `src/index.ts` files as narrow public APIs instead of allowing broad cross-package deep imports.
5. Add compatibility wrappers where old paths must continue to exist.
6. Require package-boundary tests before moving implementation files.

The first package extraction target is `packages/acceptance`, because its boundary is narrower than `core` and less coupled than the earlier root shared utility surface. Phase 2c applies the same strategy to `packages/shared` after package-first build order and `dist/shared/*` compatibility wrappers are tested.

## Required Extraction Gates

Before moving implementation into any `packages/*/src` directory, the change must include tests or smoke checks for:

- Existing root scripts that call the moved code.
- Existing `dist/*` compatibility paths.
- Package-level public exports.
- Report or artifact format stability.
- README/spec updates explaining the new ownership boundary.

For `packages/acceptance`, the minimum gates are:

- `pnpm test:unit`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm goal:audit`
- Smoke checks for `acceptance`, `user:accept`, and `user:handoff` scripts when their implementation paths change.

## Consequences

### Positive

- Package extraction can proceed without breaking CLI, MCP, benchmark, goal audit, and user acceptance workflows.
- `packages/acceptance` becomes a safe pilot for Phase 2 before touching broader runtime packages.
- Public package APIs become explicit instead of emerging from accidental relative imports.

### Negative

- The migration takes longer because compatibility wrappers and tests are required.
- Some code may temporarily exist behind old `src/*` paths and new package APIs during the migration window.
- Build configuration remains more complex until compatibility paths can be retired.

### Follow-up

- Continue package extraction one bounded package at a time only after wrapper compatibility tests stay green.
- Keep `dist/internal/acceptance/*` JavaScript and declaration outputs available as compatibility surfaces until downstream callers no longer rely on them.
- Keep `dist/shared/*` JavaScript and declaration outputs available as compatibility surfaces until downstream callers no longer rely on them.
- Update ADR-0005 and the monorepo structure spec as each package extraction phase completes.
- Do not broaden Phase 2c into `core`, `browser-explorer`, or `repair-planner` extraction without a separate TDD goal.

## Implementation Note

Phase 2a is historical context; current acceptance execution targets package-owned runners in `packages/acceptance/dist/*`, and the implementation modules live in `packages/acceptance/src/*`. The legacy `src/internal/acceptance/*` sources and generated `dist/internal/acceptance/*` files are compatibility wrapper/output surfaces, not the active implementation owner.

The acceptance package pilot is no longer deferred. Phase 2c shared package extraction is implemented with compatibility wrappers. Broader package extraction for `browser-explorer`, `repair-planner`, and `core` remains deferred until each package has equivalent compatibility-output and import-boundary tests.

## Current Phase 2 Status

Phase 2 implementation modules now live under `packages/acceptance/src` for the acceptance report, goal audit, user acceptance, user handoff, repo preflight, shell parsing, generated-test validation helpers, and runner entrypoints.

Current root scripts call package-owned acceptance runners:

- `pnpm acceptance` runs `packages/acceptance/dist/run-acceptance.js`.
- `pnpm goal:audit` runs `packages/acceptance/dist/run-goal-audit.js`.
- `pnpm user:accept` runs `packages/acceptance/dist/run-user-acceptance.js`.
- `pnpm user:handoff` runs `packages/acceptance/dist/run-user-acceptance-handoff.js`.

The package-owned `goal:audit` runner now reads package-owned source evidence and composes current audit items through package modules. Current goal audit item construction is exposed from the package runner API through `buildCurrentGoalAuditItems()`, and the runner subpath also re-exports the required document path and user acceptance record helper APIs needed for legacy compatibility. This preserves the legacy API shape while routing the implementation through package source collection, current-item composition, and package-owned helper modules. Package redaction and shell quoting are also exposed as package-owned helper APIs so acceptance reporting and command formatting no longer depend on root shared exports. The acceptance runner parse, help, command-formatting, direct-run detection, and CLI invocation helpers are exposed from the package root API as compatibility-safe package surfaces. The package-owned `user:handoff` runner also consumes the package goal audit workspace builder instead of dynamically loading the legacy goal audit item builder.

The root package now depends on `@hardening-mcp/acceptance` through `workspace:*`. The package `exports` map gives `types` and `default` entries to every package-owned acceptance implementation module and runner entrypoint so external runtime and TypeScript declaration resolution use one explicit package surface. Goal audit now treats this as an exact package export surface derived from `acceptancePackageExportEntries`: missing, mismatched, or unexpected `packages/acceptance/package.json` exports fail architecture migration evidence. `acceptancePackageDistOutputEntries` is exported from the package root API and derived from `acceptancePackageExportEntries` to keep generated package `.js`, `.d.ts`, and `.js.map` output governance tied to the same export contract. `acceptancePackageSourceEntries` is exported from the package root API and derived from `acceptanceCompatibilityContract.packageOwnedModules` to keep package source file governance tied to the same module contract. `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, and `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` are exported from the package root API and derived from `acceptancePackageDistOutputEntries` to keep goal audit source collection and process governance checks tied to the same package dist output contract. `legacyAcceptanceWrapperSourceEntries` is exported from the package root API and derived from `legacyAcceptanceCompatibilityModules` to keep wrapper-audit callers out of internal source path construction.

The standard acceptance gate now includes an all-subpath package import smoke command that imports the package root plus every `@hardening-mcp/acceptance/*` export with Node, verifies each subpath has runtime exports, verifies the runner subpaths export `main()`, checks that root and compatibility subpaths expose identical `acceptancePackageExportEntries`, `acceptancePackageDistOutputEntries`, `acceptancePackageSourceEntries`, `legacyAcceptanceDistOutputEntries`, and `legacyAcceptanceWrapperSourceEntries` runtime contracts, and checks that root and `goal-audit-sources` subpaths expose identical `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, and `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` runtime contracts.

The package subpath type-resolution smoke also covers `acceptancePackageDistOutputEntries`, `AcceptancePackageDistOutputEntry`, `acceptancePackageSourceEntries`, `AcceptancePackageSourceEntry`, `legacyAcceptanceWrapperSourceEntries`, `LegacyAcceptanceWrapperSourceEntry`, `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, and `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` through package root, `./compatibility`, and `./goal-audit-sources` declarations, so source and dist-output contract drift is caught by TypeScript resolution before release or user handoff.

The standard acceptance gate also includes a package subpath type-resolution smoke command that runs TypeScript against `tests/type-smoke/acceptance-package-subpaths.ts`, which imports the package root plus every `@hardening-mcp/acceptance/*` export through the package `types` entries.

Package acceptance entrypoint resolution now targets package-owned `packages/acceptance/dist/*` runners. The compatibility contract is exposed through the package root and `./compatibility` subpath. It still records `dist/internal/acceptance` as the legacy output root, but package wrapper execution no longer imports that legacy dist tree.

Package build order is now package-first for the acceptance and shared packages: `pnpm build` runs `build:shared`, `build:acceptance`, then `build:src`, and `pnpm typecheck` builds package declarations before checking root `src`. This lets legacy `src/internal/acceptance/*` and `src/shared/*` compatibility wrappers re-export package dist APIs without violating the root `src` build `rootDir`.

The legacy `dist/internal/acceptance/*` remains a compatibility output, not the current package execution path. Existing tests may still compare package behavior against `src/internal/acceptance/*` to preserve behavior during the compatibility window, but new source evidence and package ownership checks should point at `packages/acceptance/src/*`. Goal audit now checks generated `.js` wrappers, `.d.ts` declaration re-exports, and `.js.map` source maps under `dist/internal/acceptance/*`. The legacy markdown helper path is now a re-export wrapper over `packages/acceptance/dist/markdown.js`, the legacy fatal error formatter is now a re-export wrapper over `packages/acceptance/dist/fatal-error.js`, the legacy repo preflight helper path is now a re-export wrapper over `packages/acceptance/dist/repo-preflight.js`, the legacy acceptance report helper path is now a re-export wrapper over `packages/acceptance/dist/report.js`, the legacy user acceptance args helper path is now a re-export wrapper over `packages/acceptance/dist/user-acceptance-args.js`, the legacy user acceptance Markdown helper path is now a re-export wrapper over `packages/acceptance/dist/user-acceptance.js`, the legacy user acceptance handoff Markdown helper path is now a re-export wrapper over `packages/acceptance/dist/user-acceptance-handoff.js`, the legacy goal audit Markdown helper path is now a re-export wrapper over `packages/acceptance/dist/goal-audit.js`, the legacy acceptance runner path is now a re-export wrapper over `packages/acceptance/dist/run-acceptance.js` with a direct-run shim for executable `dist/internal/acceptance/run-acceptance.js` compatibility, the legacy user acceptance handoff runner path is now a re-export wrapper over `packages/acceptance/dist/run-user-acceptance-handoff.js` with a package-exported direct-run helper for executable `dist/internal/acceptance/run-user-acceptance-handoff.js` compatibility, the legacy goal audit runner path is now a re-export wrapper over `packages/acceptance/dist/run-goal-audit.js` with a package-exported direct-run helper for executable `dist/internal/acceptance/run-goal-audit.js` compatibility, and the legacy user acceptance runner path is now a re-export wrapper over `packages/acceptance/dist/run-user-acceptance.js` plus `packages/acceptance/dist/user-acceptance-runner-helpers.js` with a package-exported direct-run helper for executable `dist/internal/acceptance/run-user-acceptance.js` compatibility.

The legacy `dist/shared/*` remains a compatibility output, not the current package execution path. `packages/shared/src` owns the redaction, shell quote, and shell words implementations. `src/shared/*` now re-exports `packages/shared/dist/*`, while package root and `./compatibility` exports expose `sharedPackageExportEntries`, `sharedPackageDistOutputEntries`, `sharedPackageSourceEntries`, `legacySharedDistOutputEntries`, and `legacySharedWrapperSourceEntries` so structure tests and type-smoke checks share one exact shared package extraction contract.
