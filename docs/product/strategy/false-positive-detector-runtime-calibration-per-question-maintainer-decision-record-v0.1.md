# RepoAssure False-Positive Detector Runtime Calibration Per-Question Maintainer Decision Recording v0.1

Status: completed

Conclusion: `maintainer_approved_both_false_positive_detector_calibration_questions_for_separately_gated_design_planning_without_detector_implementation_authorization`

Prepared: 2026-07-29

## Maintainer Decision Result

The maintainer explicitly answered `approve` for both named calibration
questions. Each approval authorizes only a later, separately gated bounded
design-planning Goal. Neither answer authorizes detector implementation or a
runtime behavior change.

- Explicit calibration decisions: 2/2
- Approved calibration decisions: 2/2
- Pending calibration decisions: 0/2
- Goal execution authorization treated as per-question answer: no
- Human Approval Policy: `explicit_per_question_decisions_recorded`

| Calibration question | Current decision | Source fixture | Evidence |
| --- | --- | --- | --- |
| `conditional_dead_control_should_consider_form_dirty_prerequisites` | approve | `real-fixture:react-disabled-save-control` | `explicit_maintainer_answer` |
| `auth_redirect_route_should_preserve_maintainer_review_boundary` | approve | `real-fixture:vite-auth-redirect-route` | `explicit_maintainer_answer` |

## Approval Meaning

- Bounded design planning authorized: yes
- Detector implementation authorized: no
- Runtime detector behavior change authorized: no

The successor Goal may prepare question-specific design proposals, evidence
requirements, verification plans, and rollback criteria. It must not change
detector code, thresholds, severity, suppression, or acceptance policy.

## Manual Gates

- `maintainer_classification_required_before_detector_change`
- `fixture_privacy_confirmation_required`
- `expected_snapshot_confirmation_required`
- `confidence_threshold_review_required`
- `regression_artifact_review_required`

## Authorization Boundary

- Bounded design planning authorized: yes
- Detector implementation authorized: no
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

No target or external system was accessed. No target was acquired, cloned,
installed, analyzed, started, executed, or written.

## Historical Pending State

Before these explicit answers were supplied, ordinary Goal execution
authorization was correctly not treated as a per-question answer. The interim
conclusion was
`per_question_calibration_decision_record_prepared_without_inferred_answers`.

## Next Goal

RepoAssure False-Positive Detector Runtime Calibration Bounded Design Planning
v0.1.

This next Goal is ready for a separate execution authorization. It may prepare
only a local bounded design plan and may not implement detector changes.
