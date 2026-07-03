# Acceptance Package

Phase 2 acceptance package pilot.

This package owns acceptance implementation modules and runner entrypoints while preserving compatibility wrappers under `src/internal/acceptance` and compatibility outputs under `dist/internal/acceptance`.

Current package responsibilities:

- Own package runner entrypoints for `acceptance`, `goal:audit`, `user:accept`, and `user:handoff`.
- Link the root package to this workspace package through `@hardening-mcp/acceptance: workspace:*` so package subpath exports can be resolved by name.
- Resolve package runner calls to package-owned `packages/acceptance/dist/*` entrypoints while keeping legacy `dist/internal/acceptance/*` JavaScript and declaration files as compatibility outputs.
- Build `packages/acceptance` before the root `src` output when legacy compatibility wrappers depend on package dist declarations.
- Keep legacy acceptance markdown helpers as re-export wrappers over `packages/acceptance/dist/markdown.js`.
- Keep legacy acceptance fatal error formatting as a re-export wrapper over `packages/acceptance/dist/fatal-error.js`.
- Keep legacy repo preflight helpers as re-export wrappers over `packages/acceptance/dist/repo-preflight.js`.
- Keep legacy acceptance report helpers as re-export wrappers over `packages/acceptance/dist/report.js`.
- Keep legacy user acceptance args helpers as re-export wrappers over `packages/acceptance/dist/user-acceptance-args.js`.
- Keep legacy user acceptance Markdown helpers as re-export wrappers over `packages/acceptance/dist/user-acceptance.js`.
- Keep legacy user acceptance handoff Markdown helpers as re-export wrappers over `packages/acceptance/dist/user-acceptance-handoff.js`.
- Keep legacy goal audit Markdown helpers as re-export wrappers over `packages/acceptance/dist/goal-audit.js`.
- Keep legacy acceptance runner helpers as re-export wrappers over `packages/acceptance/dist/run-acceptance.js`, with a direct-run shim so `dist/internal/acceptance/run-acceptance.js` remains executable.
- Keep legacy user acceptance handoff runner helpers as re-export wrappers over `packages/acceptance/dist/run-user-acceptance-handoff.js`, with a package-exported direct-run helper so `dist/internal/acceptance/run-user-acceptance-handoff.js` remains executable.
- Keep legacy goal audit runner helpers as re-export wrappers over `packages/acceptance/dist/run-goal-audit.js`, with a package-exported direct-run helper so `dist/internal/acceptance/run-goal-audit.js` remains executable.
- Keep legacy user acceptance runner helpers as re-export wrappers over `packages/acceptance/dist/run-user-acceptance.js` and `packages/acceptance/dist/user-acceptance-runner-helpers.js`, with a package-exported direct-run helper so `dist/internal/acceptance/run-user-acceptance.js` remains executable.
- Own the validation campaign summary runtime through `campaign-summary`, so multi-target real repo campaigns can produce local `repoassure.validation-campaign-summary.v1` indexes without copying target repo material into committed docs.
- Run `goal:audit` through package-owned source collection, current-item composition, and Markdown rendering while preserving the generated output path.
- Expose `buildCurrentGoalAuditItems()` plus legacy-compatible goal audit helper exports from the package goal audit runner for current item construction and compatibility with the legacy API shape.
- Expose acceptance runner parse, help, command-formatting, direct-run detection, and CLI invocation helpers from the package root API.
- Expose typed `package.json` subpaths for all package-owned acceptance implementation modules and runner entrypoints so runtime and declaration imports resolve through the same package surface.
- Keep `acceptanceCompatibilityContract.packageOwnedModules` as the shared package-owned module contract for structure tests, package subpath specifiers, and runtime import smoke generation.
- Derive `acceptancePackageSourceEntries` from `acceptanceCompatibilityContract.packageOwnedModules` so the package source file list, structure tests, runtime smoke contracts, and type-resolution smoke contracts share one package-owned module surface.
- Derive `acceptancePackageExportEntries` from the same package-owned module contract so package export paths, declaration paths, runtime paths, and subpath specifiers share one compatibility surface.
- Derive `acceptancePackageDistOutputEntries` from `acceptancePackageExportEntries`, including `sourceMapPath` for package `.js.map` outputs, so generated package `.js`, `.d.ts`, and `.js.map` build outputs, structure tests, runtime smoke contracts, and type-resolution smoke contracts share one package export surface.
- Derive `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, and `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` from `acceptancePackageDistOutputEntries` so goal audit source collection, process governance checks, runtime smoke contracts, and type-resolution smoke contracts share one package dist source surface.
- Derive goal audit typed package export checks from `acceptancePackageExportEntries` so package export auditing follows the same export path, declaration path, runtime path, and specifier contract as the smoke gates.
- Treat package typed export auditing as an exact package export surface check: missing, mismatched, or unexpected `packages/acceptance/package.json` exports fail goal audit until they match `acceptancePackageExportEntries`.
- Derive `acceptanceRunnerMainSpecifiers` from `acceptanceEntrypointFiles` so runner `main()` smoke checks share the same runner entrypoint contract as compatibility CLI wrappers.
- Derive `acceptanceRuntimeContractSpecifiers` from the package name so runtime contract smoke checks use one shared root and compatibility subpath list.
- Run all-subpath package import smoke as a standard acceptance quality gate, verifying every `@hardening-mcp/acceptance/*` package export resolves, runner subpaths expose `main()`, root plus compatibility subpaths expose the same `acceptancePackageExportEntries`, `acceptancePackageDistOutputEntries`, `acceptancePackageSourceEntries`, `legacyAcceptanceDistOutputEntries`, and `legacyAcceptanceWrapperSourceEntries` runtime contracts, and root plus `goal-audit-sources` subpath expose the same `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, and `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS` runtime contracts.
- Run package subpath type-resolution smoke as a standard acceptance quality gate, verifying TypeScript resolves every package-owned subpath and the root/compatibility/`goal-audit-sources` contract types, including `acceptancePackageDistOutputEntries`, `acceptancePackageSourceEntries`, `legacyAcceptanceWrapperSourceEntries`, `PACKAGE_ACCEPTANCE_DIST_OUTPUT_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_DECLARATION_SOURCE_SPECS`, `PACKAGE_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, and `LEGACY_ACCEPTANCE_DIST_SOURCE_MAP_SOURCE_SPECS`, through the published `types` entries.
- Collect goal audit source evidence from package-owned acceptance implementation files rather than legacy `src/internal/acceptance/*` implementation files.
- Audit legacy `src/internal/acceptance/*.ts` files as compatibility wrappers by requiring each file to delegate to `packages/acceptance/dist/*`.
- Derive `legacyAcceptanceWrapperSourceEntries` from `legacyAcceptanceCompatibilityModules` so the wrapper source file list, wrapper audit source specs, and structure tests share one compatibility contract.
- Derive `legacyAcceptanceDistOutputEntries` from `legacyAcceptanceCompatibilityModules` and `acceptanceCompatibilityContract.legacyDistRoot` so generated legacy `.js`, `.d.ts`, and `.js.map` output paths share one compatibility contract.
- Derive legacy wrapper, legacy dist JavaScript, and legacy dist declaration source specs from `legacyAcceptanceCompatibilityModules` plus `legacyAcceptanceDistOutputEntries` so source collection audits preserve one compatibility module contract.
- Derive legacy `GOAL_AUDIT_TEXT_SOURCE_PATHS` entries from the same compatibility contracts instead of hand-maintaining legacy source, runtime output, and declaration paths.
- Run `user:handoff` through the package-owned goal audit workspace builder while preserving the generated handoff and goal audit output paths.
- Expose Phase 2b package-owned implementation modules:
  - `compatibility`
  - `markdown`
  - `report`
  - `goal-audit`
  - `goal-audit-requirements`
  - `goal-audit-user-acceptance`
  - `goal-audit-user-acceptance-materials`
  - `goal-audit-sources`
  - `goal-audit-delivery`
  - `goal-audit-runtime`
  - `goal-audit-workflow-artifacts`
  - `goal-audit-observability-security`
  - `goal-audit-process-governance`
  - `goal-audit-evidence-documents`
  - `goal-audit-current-items`
  - `user-acceptance`
  - `user-acceptance-handoff`
  - `fatal-error`
  - `redaction`
  - `repo-preflight`
  - `user-acceptance-args`
  - `run-acceptance`
  - `run-user-acceptance-handoff`
  - `shell-quote`
  - `shell-words`
  - `user-acceptance-record`
  - `user-acceptance-runner-helpers`
  - `run-user-acceptance`
  - `run-goal-audit`
- Preserve generated acceptance output paths:
  - `docs/acceptance/acceptance-run.md`
  - `docs/acceptance/goal-completion-audit.md`
  - `docs/acceptance/user-acceptance-handoff.md`
  - `docs/acceptance/user-acceptance-record.md`
- Preserve legacy compatibility outputs under `dist/internal/acceptance/*`, including `.js` runtime wrappers and `.d.ts` declaration re-exports.

Deferred responsibilities:

- Benchmark report ownership remains outside this acceptance package migration and stays in `src/internal/benchmark` until a separate package decision exists.
- Migrate generated acceptance outputs only after compatibility paths or aliases are available.
