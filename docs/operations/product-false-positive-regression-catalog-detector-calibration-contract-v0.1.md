# Product False-Positive Regression Catalog Detector Calibration Contract v0.1

Status: completed
Date: 2026-07-23
Conclusion: `calibration_contract_generated_without_runtime_behavior_change`

## Scope

This goal converts the completed detector calibration planning record into a local-only, machine-readable calibration contract.

It does not change runtime detector behavior, suppress findings, downgrade severity automatically, modify confidence thresholds, change acceptance policy, or write target repositories.

## Inputs

- `docs/operations/product-false-positive-regression-catalog-detector-calibration-planning-v0.1.md`
- `packages/acceptance/src/false-positive-catalog.ts`
- Generated local catalog artifacts:
  - `artifacts/project-graph/false-positive-regression-catalog.json`
  - `artifacts/project-graph/false-positive-regression-catalog.md`
  - `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json`
  - `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.md`

## Implemented Artifacts

- `packages/acceptance/src/run-false-positive-detector-calibration-contract.ts`
- `pnpm false-positive:calibration-contract`
- `@hardening-mcp/acceptance/run-false-positive-detector-calibration-contract`
- `artifacts/project-graph/false-positive-detector-calibration-contract.json`
- `artifacts/project-graph/false-positive-detector-calibration-contract.md`

## Contract Content

The generated contract records:

- AI IDE read order:
  1. `docs/operations/product-false-positive-regression-catalog-detector-calibration-planning-v0.1.md`
  2. `artifacts/project-graph/false-positive-regression-catalog.json`
  3. `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json`
  4. `artifacts/project-graph/false-positive-detector-calibration-contract.json`
  5. `artifacts/project-graph/false-positive-detector-calibration-contract.md`
- Calibration question `conditional_dead_control_should_consider_form_dirty_prerequisites` for `real-fixture:react-disabled-save-control`.
- Calibration question `auth_redirect_route_should_preserve_maintainer_review_boundary` for `real-fixture:vite-auth-redirect-route`.
- Manual gates:
  - `maintainer_classification_required_before_detector_change`
  - `catalog_fixture_privacy_review_required`
  - `expected_snapshot_review_required`
  - `confidence_threshold_review_required`
  - `regression_artifact_review_required`
- Future implementation authorization requirements:
  - `runtime_detector_change`
  - `finding_suppression`
  - `automatic_severity_downgrade`
  - `detector_confidence_threshold_change`
  - `acceptance_policy_change`

## Acceptance Evidence

- `tests/unit/false-positive-detector-calibration-contract.test.ts` verifies contract schema, read order, calibration questions, manual gates, future authorization requirements, redaction, and no runtime behavior change / no target repo write boundary.
- `tests/unit/acceptance-package.test.ts` verifies package-owned compatibility registration and CLI parsing.
- `tests/type-smoke/acceptance-package-subpaths.ts` verifies the new subpath export compiles.
- `pnpm false-positive:calibration-contract -- --generated-at 2026-07-23T08:00:00.000+08:00` generated local JSON/Markdown artifacts and reported validation passed.

## Boundary

- No runtime detection behavior change was implemented.
- No finding suppression was implemented.
- No automatic severity downgrade was implemented.
- No detector confidence threshold change was implemented.
- No acceptance policy change was implemented.
- No target repository write was authorized.
- No private target repository source or secrets were added.
- No hosted dashboard, cloud sync, telemetry, deployment, public release, repository visibility change, npm publication, GitHub release, customer contact, pricing, or spend change was authorized.

## Next Goal

Product False-Positive Regression Catalog Detector Calibration Contract Consumption Validation v0.1.

The next goal should validate that AI IDEs and maintainers can consume the generated calibration contract artifacts in the intended order, block unsafe interpretations, and preserve the same no-runtime-change boundary.
