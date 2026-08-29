# Product False-Positive Regression Catalog Real Fixture Expansion v0.1

Status: completed
Date: 2026-07-23
Conclusion: `real_fixtures_expanded_without_detection_behavior_change`

## Scope

This goal expands the local false-positive regression catalog with non-private near-real fixture candidates. It is evidence and regression catalog work only.

## Completed Changes

- Added `real_world_fixture_regressions` to the catalog fixture categories.
- Added two near-real public fixture candidates:
  - `real-fixture:react-disabled-save-control`
  - `real-fixture:vite-auth-redirect-route`
- Added machine-readable fixture provenance:
  - `fixtureOrigin`
  - `privacy.nonPrivate`
  - `privacy.sourceCodeIncluded`
  - `privacy.secretsIncluded`
- Updated catalog validation so every entry must remain non-private, source-free, and secret-free.
- Updated catalog Markdown output so AI IDEs and maintainers can see fixture origin and non-private status in the expected snapshot table.
- Updated consumption validation so `real_world_fixture_regressions` is required coverage.

## Generated Artifacts

- `artifacts/project-graph/false-positive-regression-catalog.json`
- `artifacts/project-graph/false-positive-regression-catalog.md`
- `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json`
- `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.md`

The generated artifacts are ignored local evidence. They are not publication artifacts and do not authorize target repository changes.

## Verification

- `pnpm vitest run tests/unit/false-positive-catalog.test.ts` failed first as Red because `real_world_fixture_regressions`, `fixtureOrigin`, and privacy metadata were missing.
- `pnpm vitest run tests/unit/false-positive-catalog.test.ts tests/unit/false-positive-catalog-artifacts.test.ts tests/unit/false-positive-catalog-consumption.test.ts` passed after implementation.
- `pnpm vitest run tests/unit/acceptance-package.test.ts tests/type-smoke/acceptance-package-subpaths.ts` passed.
- `pnpm false-positive:catalog -- --generated-at 2026-07-23T00:00:00.000+08:00` passed with 7 entries and validation passed.
- `pnpm false-positive:catalog:validate -- --generated-at 2026-07-23T00:00:00.000+08:00` passed with 13 checks.

## Boundary

- No runtime detection behavior change was implemented.
- No finding suppression was implemented.
- No automatic severity downgrade was implemented.
- No target repository write was authorized.
- No hosted dashboard, cloud sync, telemetry, deployment, public release, repository visibility change, npm publication, GitHub release, customer contact, pricing, or spend change was authorized.
- No private target repository source or secrets were added.

## Next Goal

The next safe automatic goal is Product False-Positive Regression Catalog Detector Calibration Planning v0.1.

That goal should use the expanded near-real fixture catalog to plan detector calibration and review policy, but still must not change runtime detector behavior until a separate implementation goal is explicitly authorized.
