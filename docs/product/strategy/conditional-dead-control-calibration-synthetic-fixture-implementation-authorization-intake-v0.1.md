# Conditional Dead Control Calibration Synthetic Fixture Implementation Authorization Intake v0.1

Status: completed

Conclusion:
`synthetic_fixture_implementation_authorization_intake_prepared_without_inferred_choice_or_fixture_work`

## Intake Result

- Approved question:
  `conditional_dead_control_should_consider_form_dirty_prerequisites`
- Revision-requested question:
  `auth_redirect_route_should_preserve_maintainer_review_boundary`
- Implementation options prepared: 4/4
- Implementation decisions recorded: 0/1
- Pending implementation decisions: 1/1
- Preselected choice: none
- Recommended option: `approve_synthetic_fixture_implementation`
- Goal execution authorization treated as implementation choice: no
- Manual gates completed: 0/5
- Synthetic fixture created: no
- Synthetic fixture executed: no
- Detector changes performed: no

This intake prepares one owner decision. It does not record an answer, create
or run the fixture, open a raw source fixture, modify detector behavior, or
complete a manual gate.

## Recommendation

Recommended option: `approve_synthetic_fixture_implementation`.

Why: the completed plan is local-only, original-synthetic, bounded to three
future files, and includes positive, counter, and fail-closed regressions plus
review and rollback. A later implementation would create evidence needed for
the still-incomplete manual gates without accessing an unknown raw fixture or
changing the detector.

This recommendation is not a default and is not a recorded decision. Approval
would authorize only derivation of a later, separately authorized synthetic
fixture implementation Goal. It would not create or execute any file in this
intake and would not authorize detector implementation.

Material risk: a poorly implemented synthetic fixture could encode assumptions
that do not represent a real prerequisite transition. The bounded plan
mitigates that risk with literal state data, positive/counter/fail-closed
snapshots, privacy review, maintainer review, and a fixture-only rollback.

Rollback: before a later implementation begins, choose
`defer_synthetic_fixture_implementation` or
`reject_synthetic_fixture_path`. After a separately authorized implementation,
rollback may remove only the three synthetic fixture/test files and restore the
current review-only evidence boundary.

## Owner Options

No option is selected.

| Option | Plain-language meaning | Bounded next result | What it does not authorize |
| --- | --- | --- | --- |
| `approve_synthetic_fixture_implementation` | “Prepare the local synthetic fixture in a later, separately authorized Goal.” | A decision-recording Goal may derive one implementation Goal bounded to the three proposed files. | Does not create or run the fixture now; does not change the detector or complete a gate. |
| `request_synthetic_fixture_plan_revision` | “Revise the plan before implementation is considered.” | A later planning Goal may address the explicitly named revision. | Does not implement the current plan or infer the requested change. |
| `defer_synthetic_fixture_implementation` | “Pause this fixture path for now.” | Keep the plan available and all five gates incomplete. | Does not approve later work or close the path permanently. |
| `reject_synthetic_fixture_path` | “Close this synthetic fixture path.” | Record the rejection while preserving current detector behavior. | Does not delete historical evidence or alter findings. |

An ordinary “授权执行” message, the prior plan request, this recommendation,
silence, or ambiguous input is not an option selection.

## Bounded Plan Summary

The five conceptual states remain:

1. `initial_disabled_before_dirty`
2. `safe_dirty_transition_available`
3. `enabled_after_safe_dirty_transition`
4. `still_disabled_after_safe_dirty_transition`
5. `dirty_transition_not_safely_observable`

The three proposed future files remain proposals and were not created:

1. `tests/fixtures/conditional-dead-control-synthetic/fixture-manifest.json`
2. `tests/fixtures/conditional-dead-control-synthetic/form-dirty-states.json`
3. `tests/unit/conditional-dead-control-synthetic-fixture.test.ts`

The future fixture must be original, deterministic, local-only, and free of
credentials, tokens, cookies, private source, personal contact data, and
production values. It may not depend on a network or target repository.

Three expected snapshot groups remain planned and unconfirmed:

- positive: initial disabled → safe dirty transition → enabled;
- counter: initial disabled → safe dirty transition → still disabled;
- fail-closed: transition unavailable, unsafe, missing, or contradictory.

The finding must remain visible. No snapshot may automatically suppress a
finding, downgrade severity, alter a confidence threshold, or change
acceptance policy.

## Manual Gates

All five gates remain incomplete:

1. `maintainer_classification_required_before_detector_change`
2. `fixture_privacy_confirmation_required`
3. `expected_snapshot_confirmation_required`
4. `confidence_threshold_review_required`
5. `regression_artifact_review_required`

Manual gates completed: 0/5.

Approving future fixture implementation would not complete any gate. A gate
may change only after separately authorized implementation evidence exists and
the required human review is explicitly recorded.

## Auth-Redirect Separation

`auth_redirect_route_should_preserve_maintainer_review_boundary` remains
`request_revision` and is excluded from implementation.

## Decision And Execution Boundary

- Goal execution authorization treated as implementation choice: no
- Default or inferred choice allowed: no
- Synthetic fixture implementation authorized: no
- Synthetic fixture created: no
- Synthetic fixture executed: no
- Detector implementation execution authorized: no
- Detector changes performed: no
- Action Authorization Receipts issued: 0
- Target repositories acquired: 0
- Target repositories executed: 0
- Target repository writes: 0

No fixture or target was accessed, acquired, installed, analyzed, started,
executed, or written. Nothing was published, deployed, or launched.

## Owner Response Template

```text
conditional_dead_control_synthetic_fixture_implementation:
  <approve_synthetic_fixture_implementation |
   request_synthetic_fixture_plan_revision |
   defer_synthetic_fixture_implementation |
   reject_synthetic_fixture_path>

If requesting revision, name the change:

Optional reason:
```

Leaving the template empty keeps the decision pending.
