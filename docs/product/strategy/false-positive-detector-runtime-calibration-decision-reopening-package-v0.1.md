# RepoAssure False-Positive Detector Runtime Calibration Decision Reopening Preparation v0.1

Status: completed

Conclusion: `false_positive_detector_runtime_calibration_decision_reopening_package_prepared_without_per_question_decisions_or_detector_changes`

Prepared: 2026-07-29

## Purpose

This local-only package refreshes the two existing false-positive detector
calibration decision slots after the maintainer selected
`false_positive_detector_runtime_calibration` as a priority direction.
Direction selection is not a per-question answer and does not authorize
detector design or implementation.

## Source Records

- Direction decision:
  `docs/product/strategy/remaining-gated-product-work-maintainer-direction-decision-record-v0.1.md`
- Authorization intake:
  `docs/operations/product-false-positive-regression-catalog-detector-calibration-authorization-intake-v0.1.md`
- Pending decision record:
  `docs/operations/product-false-positive-regression-catalog-detector-calibration-maintainer-decision-recording-v0.1.md`
- Follow-up record:
  `docs/operations/product-false-positive-regression-catalog-detector-calibration-maintainer-decision-follow-up-v0.1.md`

## Refreshed Decision State

- Calibration decisions recorded: 0/2
- Calibration decisions pending: 2/2
- Direction selection treated as per-question calibration approval: no
- Goal execution authorization treated as a per-question answer: no

| Calibration question | Source fixture | Current decision | Required evidence |
| --- | --- | --- | --- |
| `conditional_dead_control_should_consider_form_dirty_prerequisites` | `real-fixture:react-disabled-save-control` | pending | Maintainer classification, fixture privacy confirmation, expected snapshot confirmation, confidence-threshold review |
| `auth_redirect_route_should_preserve_maintainer_review_boundary` | `real-fixture:vite-auth-redirect-route` | pending | Maintainer classification, fixture privacy confirmation, expected snapshot confirmation, confidence-threshold review |

## Per-Question Options

Each question requires one explicit maintainer answer:

- `approve`: allow a later, separately authorized Goal to design a bounded
  detector calibration for that question; this is not runtime implementation
  authorization.
- `reject`: reject the proposed calibration direction for that question and
  preserve current detector behavior.
- `defer`: leave the question pending and keep detector design and
  implementation blocked.
- `accept-risk`: accept the known false-positive or calibration risk without
  changing detector behavior.

No option is selected in this package.

## Manual Gates

- `maintainer_classification_required_before_detector_change`
- `fixture_privacy_confirmation_required`
- `expected_snapshot_confirmation_required`
- `confidence_threshold_review_required`
- `regression_artifact_review_required`

All five gates remain required before a later implementation Goal may be
considered.

## Authorization Boundary

- Detector changes authorized: no
- Runtime detector behavior change: no
- Finding suppression: no
- Automatic severity downgrade: no
- Detector confidence threshold change: no
- Acceptance policy change: no
- Action Authorization Receipts issued: 0
- Target repositories acquired: 0
- Target repositories executed: 0
- Target repository writes: 0
- Publication, deployment, or launch: no

This package did not access, acquire, clone, install, analyze, start, execute,
or write any target repository. It did not access an external system or
change a product entrypoint.

## Next Goal

RepoAssure False-Positive Detector Runtime Calibration Per-Question Maintainer
Decision Recording v0.1.

The next Goal may record only explicit answers supplied for the two questions.
It must preserve any unanswered slot as pending and must not infer answers
from the selected direction or ordinary Goal execution authorization.
