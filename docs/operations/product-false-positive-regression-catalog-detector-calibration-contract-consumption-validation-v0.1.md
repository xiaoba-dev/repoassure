# Product False-Positive Regression Catalog Detector Calibration Contract Consumption Validation v0.1

Status: completed
Date: 2026-07-23
Conclusion: `contract_consumption_validated_without_runtime_behavior_change`

## Scope

This goal validates that AI IDEs and maintainers can consume the generated false-positive detector calibration contract artifacts safely.

It does not change runtime detector behavior, suppress findings, downgrade severity automatically, modify detector confidence thresholds, change acceptance policy, or write target repositories.

## Inputs

- `artifacts/project-graph/false-positive-detector-calibration-contract.json`
- `artifacts/project-graph/false-positive-detector-calibration-contract.md`
- `docs/operations/product-false-positive-regression-catalog-detector-calibration-contract-v0.1.md`

## Implemented Artifacts

- `packages/acceptance/src/run-false-positive-detector-calibration-contract-consumption.ts`
- `pnpm false-positive:calibration-contract:validate`
- `@hardening-mcp/acceptance/run-false-positive-detector-calibration-contract-consumption`
- `artifacts/project-graph/false-positive-detector-calibration-contract-consumption-validation.json`
- `artifacts/project-graph/false-positive-detector-calibration-contract-consumption-validation.md`

## Consumption Validation

The generated validation report records:

- AI IDE read order:
  1. `artifacts/project-graph/false-positive-detector-calibration-contract.json`
  2. `artifacts/project-graph/false-positive-detector-calibration-contract.md`
- 13 passed checks.
- Calibration question coverage:
  - `conditional_dead_control_should_consider_form_dirty_prerequisites`
  - `auth_redirect_route_should_preserve_maintainer_review_boundary`
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
- Maintainer review boundary.
- Fail-closed checks for runtime detector behavior change, target repo writes, finding suppression, automatic severity downgrade, and prohibited secret-like content.

## Acceptance Evidence

- `tests/unit/false-positive-detector-calibration-contract-consumption.test.ts` verifies JSON/Markdown read order, AI IDE consumption, maintainer review boundary, manual gates, future authorization, fail-closed runtime-change checks, fail-closed Markdown boundary checks, local writer output, CLI args, and redaction.
- `tests/unit/acceptance-package.test.ts` verifies package-owned compatibility registration and CLI parsing.
- `tests/type-smoke/acceptance-package-subpaths.ts` verifies the new subpath export compiles.
- `tests/unit/project-structure.test.ts` guards package module registration, generated dist output, operation record, completed goal summary, next-goal metadata, and canonical doc cascade.
- `pnpm false-positive:calibration-contract:validate -- --generated-at 2026-07-23T09:00:00.000+08:00` generated local JSON/Markdown artifacts and reported 13 checks passed.

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

Product False-Positive Regression Catalog Detector Calibration Completion Audit v0.1.

The next goal should audit and close the current local-only detector calibration slice across planning, contract generation, contract consumption validation, generated artifacts, tests, package exports, and documentation cascade.
