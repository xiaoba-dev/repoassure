# RepoAssure False-Positive Detector Runtime Calibration Implementation Authorization Intake v0.1

Status: completed

Conclusion: `implementation_authorization_intake_prepared_without_inferred_decisions_or_detector_changes`

## Purpose

This intake presents two separate maintainer decisions derived from the
completed bounded design plan. It does not record either answer and does not
authorize or perform a detector change.

Implementation authorization decisions recorded: 0/2

Implementation authorization decisions pending: 2/2

| Question | Catalog fixture | Recorded choice |
| --- | --- | --- |
| `conditional_dead_control_should_consider_form_dirty_prerequisites` | `real-fixture:react-disabled-save-control` | pending |
| `auth_redirect_route_should_preserve_maintainer_review_boundary` | `real-fixture:vite-auth-redirect-route` | pending |

## Choice meanings

The same four choices apply independently to each question:

- `approve_implementation`: explicitly allow a later, separately authorized
  Goal to implement the reviewed question-specific design after all five
  manual gates pass. This choice does not itself run or change the detector.
- `request_revision`: send the design back for a named change before another
  implementation decision is requested.
- `defer`: leave the design available but do not authorize implementation now.
- `reject`: close the proposed implementation path and preserve current
  behavior unless a later reopening Goal is explicitly authorized.

No option is preselected or recommended as a default.

## Question 1

Question:
`conditional_dead_control_should_consider_form_dirty_prerequisites`

Fixture: `real-fixture:react-disabled-save-control`

Current classification: `false_positive_candidate`

### Plain-language decision

Should a later implementation teach the detector to consider an observed,
safe “form became dirty” prerequisite before treating a control that starts
disabled as permanently dead?

### Proposed implementation boundary

- Observe `initial_disabled_before_dirty`.
- Establish only a safe, reversible local dirty-state transition.
- Preserve `false_positive_candidate` only when
  `enabled_after_safe_dirty_transition` is observed.
- Fall back to `needs_maintainer_review` when the prerequisite is unsafe,
  missing, inferred, or contradictory.
- Keep the finding visible and preserve P2 severity.

### Evidence still required before implementation

- Source-fixture availability and privacy confirmation.
- Reviewed initial/dirty-state expected snapshots.
- Positive regression for enablement after a safe dirty transition.
- Counter-regression for controls that remain disabled.
- Maintainer classification and regression-artifact review.

### Rollback

Remove only the question-specific prerequisite rule, restore the current
`review_only` / `false_positive_candidate` contract, and rerun the catalog,
calibration-contract, and consumption regressions.

### Residual risk

`real_dead_control_could_be_hidden_by_incorrect_prerequisite_inference`

An incorrect implementation could mistake a truly dead control for a normal
prerequisite-gated control. The design therefore prohibits inferred form state
and automatic suppression.

Recorded choice: pending

## Question 2

Question:
`auth_redirect_route_should_preserve_maintainer_review_boundary`

Fixture: `real-fixture:vite-auth-redirect-route`

Current classification: `needs_maintainer_review`

### Plain-language decision

Should a later implementation keep an unauthenticated redirect in maintainer
review unless separately reviewed authenticated evidence proves that the
protected route is healthy?

### Proposed implementation boundary

- Preserve `needs_maintainer_review` for
  `unauthenticated_redirect_without_authenticated_evidence`.
- Never infer authenticated route health from an unauthenticated redirect.
- Evaluate authenticated reachability only from separately authorized,
  non-secret, reviewed evidence.
- Surface redirect loops, unexpected off-origin redirects, server failures, or
  authenticated route failures as actionable findings.
- Keep the finding visible and preserve P2 severity.

### Evidence still required before implementation

- Source-fixture availability and privacy confirmation.
- Reviewed unauthenticated redirect snapshot.
- Positive regression preserving review-only behavior without authenticated
  evidence.
- Counter-regressions for unexpected redirects and route failures.
- A documented non-secret authenticated evidence mechanism before exercising
  that branch.
- Maintainer classification and regression-artifact review.

### Rollback

Remove only the question-specific redirect rule, restore the current
`review_only` / `needs_maintainer_review` contract, and rerun the catalog,
calibration-contract, and consumption regressions.

### Residual risk

`unauthenticated_redirect_could_be_mistaken_for_authenticated_route_health`

An incorrect implementation could treat a normal login redirect as proof that
the protected route works. The design therefore requires separate
authenticated evidence and preserves fail-closed maintainer review.

Recorded choice: pending

## Mandatory manual gates

All five gates remain required for either implementation:

1. `maintainer_classification_required_before_detector_change`
2. `fixture_privacy_confirmation_required`
3. `expected_snapshot_confirmation_required`
4. `confidence_threshold_review_required`
5. `regression_artifact_review_required`

Raw source-fixture files available and privacy-confirmed: no

The catalog contains source-path metadata, but the raw source-fixture files
were not present or accessed during the design and intake Goals. A later
implementation cannot treat this metadata as fixture evidence.

## Decision and execution boundary

The next Goal may record only explicit per-question choices using the four
allowed values. A bare “authorize execution” message does not identify a
question or value and must leave both choices pending.

Goal execution authorization treated as per-question implementation answer: no

Default or inferred choice allowed: no

Detector implementation authorized: no

Detector changes authorized: no

Finding suppression authorized: no

Automatic severity downgrade authorized: no

Confidence threshold change authorized: no

Acceptance policy change authorized: no

Action Authorization Receipts issued: 0

Target repositories acquired: 0

Target repositories executed: 0

Target repository writes: 0

