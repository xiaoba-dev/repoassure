# RepoAssure False-Positive Detector Runtime Calibration Bounded Design Planning v0.1

Status: completed

Conclusion: `bounded_false_positive_detector_calibration_design_plan_prepared_without_runtime_implementation_or_behavior_change`

## Purpose

This document turns the two explicit `approve` answers into reviewable,
question-specific design candidates. It does not select or implement runtime
detector behavior. Each candidate stays behind a separate per-question
implementation decision and a later execution authorization.

Sources:

- `docs/product/strategy/false-positive-detector-runtime-calibration-per-question-maintainer-decision-record-v0.1.md`
- `packages/acceptance/src/false-positive-catalog.ts`
- `packages/acceptance/src/run-false-positive-detector-calibration-contract.ts`

Bounded designs prepared: 2/2

## Shared design rules

- Preserve the catalog finding and its evidence. A calibration candidate may
  add context; it may not erase a finding.
- Preserve the current P2 severity during design review. No automatic severity
  downgrade is proposed or authorized.
- Do not choose or change a numeric confidence threshold in this Goal.
- When required evidence cannot be collected safely and locally, fail closed
  to maintainer review.
- Do not infer authenticated state, form state, privacy approval, or expected
  snapshots.
- A later implementation must be independently reversible per question.

## Question 1: conditional dead control and dirty prerequisites

Question ID:
`conditional_dead_control_should_consider_form_dirty_prerequisites`

Catalog fixture: `real-fixture:react-disabled-save-control`

Current expected classification: `false_positive_candidate`

Current evidence describes
`examples/public-react-settings/src/SettingsForm.tsx` as a near-real public
React settings form whose Save control is disabled until the form becomes
dirty. This Goal does not open, execute, or modify that example.

### Proposed bounded evidence model

The future implementation candidate may record the following evidence states:

1. `initial_disabled_before_dirty`: the control is disabled while the form is
   in its documented initial, not-dirty state.
2. `safe_dirty_transition_available`: a non-sensitive, reversible local input
   change can establish the prerequisite without authentication, destructive
   action, or external side effect.
3. `enabled_after_safe_dirty_transition`: after that transition, the same
   control becomes enabled.
4. `still_disabled_after_safe_dirty_transition`: the prerequisite is satisfied
   but the control remains disabled.
5. `dirty_transition_not_safely_observable`: the prerequisite cannot be
   established within the approved local evidence boundary.

### Proposed decision matrix

| Evidence state | Design candidate | Required boundary |
| --- | --- | --- |
| `initial_disabled_before_dirty` plus `enabled_after_safe_dirty_transition` | Preserve `false_positive_candidate` and attach prerequisite evidence | Keep the finding visible; no suppression |
| `still_disabled_after_safe_dirty_transition` | Preserve an actionable finding for maintainer classification | Do not auto-downgrade severity |
| `dirty_transition_not_safely_observable` | Use `needs_maintainer_review` | Do not infer form state |
| Missing or contradictory evidence | Use `needs_maintainer_review` | Fail closed |

This is a design candidate only. It does not change the current catalog
classification or runtime behavior.

### Verification and regression evidence

A future authorized implementation must provide:

- a reviewed fixture-privacy confirmation;
- an expected snapshot covering the initial disabled state and the safe dirty
  transition;
- a focused regression proving the control is not treated as permanently dead
  solely because it starts disabled;
- a counter-regression proving a control that remains disabled after the
  prerequisite is still surfaced;
- the existing catalog regression:
  `pnpm vitest run tests/unit/false-positive-catalog.test.ts`;
- the calibration contract and consumption regressions:
  `pnpm vitest run tests/unit/false-positive-detector-calibration-contract.test.ts tests/unit/false-positive-detector-calibration-contract-consumption.test.ts`.

### Rollback criteria

Rollback only this question-specific rule if any of the following occurs:

- it hides or suppresses a real dead control;
- prerequisite evidence is inferred rather than observed;
- results are unstable across identical local runs;
- the reviewed expected snapshot changes unexpectedly;
- privacy or regression-artifact review is withdrawn.

Rollback restores the current `review_only` contract and
`false_positive_candidate` catalog expectation, then reruns the catalog,
contract, and consumption regressions. It must not touch a target repository.

## Question 2: authenticated-route redirect boundary

Question ID:
`auth_redirect_route_should_preserve_maintainer_review_boundary`

Catalog fixture: `real-fixture:vite-auth-redirect-route`

Current expected classification: `needs_maintainer_review`

Current evidence describes
`examples/public-vite-auth/src/routes/admin.tsx` as a near-real public route
that redirects unauthenticated users before protected content renders. This
Goal does not open, execute, authenticate against, or modify that example.

### Proposed bounded evidence model

The future implementation candidate may record the following evidence states:

1. `unauthenticated_redirect_without_authenticated_evidence`: the local run
   observes an unauthenticated redirect, but no separately reviewed
   authenticated evidence exists.
2. `known_local_auth_boundary_observed`: the redirect stays within a reviewed
   local origin and matches the expected authentication boundary.
3. `authenticated_evidence_required_before_route_reclassification`: the route
   cannot be reclassified from unauthenticated evidence alone.
4. `authenticated_route_content_observed`: separately authorized and reviewed
   authenticated evidence reaches the protected route content.
5. `unexpected_redirect_or_route_failure`: a redirect loop, unexpected
   off-origin redirect, server failure, or authenticated route failure is
   observed.

### Proposed decision matrix

| Evidence state | Design candidate | Required boundary |
| --- | --- | --- |
| `unauthenticated_redirect_without_authenticated_evidence` | Preserve `needs_maintainer_review` | Do not infer authenticated reachability |
| `known_local_auth_boundary_observed` without authenticated evidence | Preserve `needs_maintainer_review` with redirect context | Keep P2 and the finding visible |
| `authenticated_route_content_observed` | Evaluate the route using the separately reviewed authenticated evidence | Do not treat unauthenticated redirect alone as a failure |
| `unexpected_redirect_or_route_failure` | Preserve an actionable finding for maintainer classification | Never auto-suppress or auto-downgrade |
| Missing or contradictory evidence | Preserve `needs_maintainer_review` | Fail closed |

This is a design candidate only. It does not create credentials, authenticate
to a target, change the current catalog classification, or change runtime
behavior.

### Verification and regression evidence

A future authorized implementation must provide:

- a reviewed fixture-privacy confirmation with no credentials or private
  storage state;
- an expected snapshot for the unauthenticated redirect boundary;
- a focused regression proving unauthenticated redirect evidence remains
  review-only without authenticated evidence;
- a counter-regression for redirect loops, unexpected off-origin redirects,
  server failures, and authenticated route failures;
- a documented, non-secret authenticated evidence mechanism before exercising
  the authenticated branch;
- the existing catalog, calibration contract, and contract-consumption
  regressions listed for Question 1.

### Rollback criteria

Rollback only this question-specific rule if any of the following occurs:

- it treats unauthenticated redirect evidence as proof of authenticated route
  health;
- it suppresses an unexpected redirect or route failure;
- it requires or leaks credentials, tokens, cookies, or private storage state;
- results are unstable across identical local runs;
- expected-snapshot or regression-artifact review is withdrawn.

Rollback restores the current `review_only` contract and
`needs_maintainer_review` catalog expectation, then reruns the catalog,
contract, and consumption regressions. It must not touch a target repository.

## Manual gates

All five gates remain mandatory for each question:

1. `maintainer_classification_required_before_detector_change`
2. `fixture_privacy_confirmation_required`
3. `expected_snapshot_confirmation_required`
4. `confidence_threshold_review_required`
5. `regression_artifact_review_required`

The runtime calibration contract uses the older labels
`catalog_fixture_privacy_review_required` and
`expected_snapshot_review_required` for two equivalent controls. A future
implementation plan must map those aliases explicitly; it may not treat the
name difference as a passed gate.

The catalog records source-fixture path metadata, but the corresponding raw
fixture files were not present or accessed during this design-only Goal.
Future implementation intake must therefore confirm evidence-source
availability and privacy before any fixture execution or detector change.

## Future implementation authorization boundary

The next Goal may prepare two unfilled authorization questions. It may not
answer them. For each question, the allowed decision vocabulary is:

- `approve_implementation`
- `request_revision`
- `defer`
- `reject`

An implementation may proceed only when:

1. the maintainer explicitly answers the relevant per-question implementation
   authorization;
2. all five manual gates have evidence;
3. a later implementation Goal is separately authorized for execution.

Ordinary Goal execution authorization is not a per-question implementation
answer.

Runtime detector implementation authorized: no

Runtime behavior changed: no

Finding suppression authorized: no

Automatic severity downgrade authorized: no

Confidence threshold change authorized: no

Acceptance policy change authorized: no

Action Authorization Receipts issued: 0

Target repositories acquired: 0

Target repositories executed: 0

Target repository writes: 0

