# Product False-Positive Regression Catalog Detector Calibration Planning v0.1

Status: completed
Date: 2026-07-23
Conclusion: `detector_calibration_plan_ready_without_runtime_behavior_change`

## Scope

This planning goal maps the expanded false-positive regression catalog to future detector calibration work. It is planning and governance only.

It does not change runtime detector behavior, suppress findings, downgrade severities automatically, or write target repositories.

## Inputs

- `docs/operations/product-false-positive-regression-catalog-real-fixture-expansion-v0.1.md`
- `packages/acceptance/src/false-positive-catalog.ts`
- Generated local catalog artifacts:
  - `artifacts/project-graph/false-positive-regression-catalog.json`
  - `artifacts/project-graph/false-positive-regression-catalog.md`
  - `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json`
  - `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.md`

## Calibration Questions

| Fixture | Detector area | Calibration question | Required decision |
| --- | --- | --- | --- |
| `real-fixture:react-disabled-save-control` | `conditional_dead_control` | `conditional_dead_control_should_consider_form_dirty_prerequisites` | Decide whether disabled controls with documented prerequisite state should remain `false_positive_candidate`, become a lower-confidence finding, or stay as maintainer-review findings. |
| `real-fixture:vite-auth-redirect-route` | `auth_redirect_route` | `auth_redirect_route_should_preserve_maintainer_review_boundary` | Decide whether unauthenticated redirect behavior should stay `needs_maintainer_review` unless authenticated evidence exists. |

## Manual Gates

- `maintainer_classification_required_before_detector_change`
- `catalog_fixture_privacy_review_required`
- `expected_snapshot_review_required`
- `confidence_threshold_review_required`
- `regression_artifact_review_required`

These gates mean catalog evidence can guide future calibration, but it cannot silently change detector output.

## Future Implementation Authorization

A separate implementation goal is required before any of the following actions:

- `runtime_detector_change`
- `finding_suppression`
- `automatic_severity_downgrade`
- `detector_confidence_threshold_change`
- `acceptance_policy_change`

The next safe automatic goal is Product False-Positive Regression Catalog Detector Calibration Contract v0.1. That goal should create a machine-readable calibration contract artifact and tests, still without changing runtime detector behavior.

## Acceptance Criteria

- The planning record maps near-real fixtures to detector review questions.
- The planning record defines manual gates before detector behavior can change.
- The planning record identifies which future changes require separate authorization.
- `.autopilot` state advances to the contract artifact goal.
- README, PRD, SPEC, PLAN, Project Intelligence spec/architecture, testing strategy, acceptance checklist, decision log, dev log, and progress snapshot reference this boundary.

## Boundary

- No runtime detection behavior change was implemented.
- No finding suppression was implemented.
- No automatic severity downgrade was implemented.
- No target repository write was authorized.
- No private target repository source or secrets were added.
- No hosted dashboard, cloud sync, telemetry, deployment, public release, repository visibility change, npm publication, GitHub release, customer contact, pricing, or spend change was authorized.

## Next Goal

Product False-Positive Regression Catalog Detector Calibration Contract v0.1.

This next goal may define local-only contract artifacts and tests for calibration review, but must not change runtime detectors until a later implementation goal is explicitly authorized.
