# Product False-Positive Regression Catalog Detector Calibration Authorization Intake v0.1

Status: completed
Date: 2026-07-23
Conclusion: `authorization_intake_created_pending_maintainer_decisions`

## Scope

This goal creates a local maintainer decision intake for detector calibration questions from the completed false-positive detector calibration slice.

It does not approve detector changes by itself. No decision is prefilled. The maintainer must explicitly choose `approve`, `reject`, `defer`, or `accept-risk` for each calibration question before any future implementation goal may design runtime detector behavior changes.

## Decision Options

- `approve`: maintainer authorizes a future goal to design a bounded detector behavior change for this question.
- `reject`: maintainer rejects detector behavior changes for this question.
- `defer`: maintainer postpones the decision; no detector behavior change may be designed yet.
- `accept-risk`: maintainer accepts the current false-positive or calibration risk without changing detectors.

## Decision Intake

| Calibration question | Source fixture | Decision | Required evidence | Notes |
| --- | --- | --- | --- | --- |
| `conditional_dead_control_should_consider_form_dirty_prerequisites` | `real-fixture:react-disabled-save-control` | pending | Maintainer classification, fixture privacy confirmation, expected snapshot confirmation, confidence-threshold review | No decision is prefilled. |
| `auth_redirect_route_should_preserve_maintainer_review_boundary` | `real-fixture:vite-auth-redirect-route` | pending | Maintainer classification, fixture privacy confirmation, expected snapshot confirmation, confidence-threshold review | No decision is prefilled. |

## Manual Gates

- `maintainer_classification_required_before_detector_change`
- `fixture_privacy_confirmation_required`
- `expected_snapshot_confirmation_required`
- `confidence_threshold_review_required`
- `regression_artifact_review_required`

## Future Authorization Boundary

The intake only prepares decision slots. A future implementation goal remains blocked unless maintainer decisions are explicit and supported by evidence.

Blocked future actions without explicit decisions:

- Runtime detector behavior change.
- Finding suppression.
- Automatic severity downgrade.
- Detector confidence threshold change.
- Acceptance policy change.
- Target repository write.

## Boundary

- Local only: yes.
- Runtime detector behavior change: no.
- Finding suppression: no.
- Automatic severity downgrade: no.
- Detector confidence threshold change: no.
- Acceptance policy change: no.
- Target repository write: no.
- Hosted dashboard: no.
- Cloud sync: no.
- Telemetry: no.
- Deployment: no.
- Public release: no.

## Verification Plan

- `pnpm vitest run tests/unit/project-structure.test.ts`
- Focused detector calibration contract and package tests.
- `pnpm typecheck`
- `pnpm lint`
- `pnpm repo:hygiene`
- `pnpm release:check`
- `pnpm goal:audit`

## Decision

Authorization intake exists and is pending maintainer decisions.

No runtime detector behavior change was implemented. No finding suppression was implemented. No automatic severity downgrade was implemented. No detector confidence threshold change was implemented. No acceptance policy change was implemented. No target repository write was authorized.

## Next Goal

Product False-Positive Regression Catalog Detector Calibration Maintainer Decision Recording v0.1.

The next goal should record explicit maintainer decisions from this intake. It must not invent or prefill missing decisions, and it must not implement detector behavior changes.
