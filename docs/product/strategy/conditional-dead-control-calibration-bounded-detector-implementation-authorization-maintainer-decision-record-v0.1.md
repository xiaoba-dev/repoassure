# Conditional Dead Control Calibration Bounded Detector Implementation Authorization Maintainer Decision Record v0.1

Status: completed

Conclusion:
`maintainer_authorized_bounded_detector_implementation_for_separately_authorized_local_goal_without_detector_changes`

## Recorded Decision

- Selected choice: `authorize_bounded_detector_implementation`
- Decision source: explicit maintainer numeric choice `1` in the current task
- Implementation authorization decisions recorded: 1/1
- Pending implementation authorization decisions: 0/1
- Bounded detector implementation direction authorized: yes
- Implementation Goal derivation authorized: yes
- Detector implementation execution authorized: no
- Next Goal execution authorized: no

The earlier recommendation, the completed 5/5 manual gates, prior direction
approval, and ordinary Goal execution authorization were not used as the
implementation choice. The only choice evidence is the explicit maintainer
value `1`, mapped to `authorize_bounded_detector_implementation` from the four
options shown immediately before that response.

This choice authorizes only derivation of one later, separately authorized
bounded implementation Goal. This decision-recording Goal did not implement,
modify, start, or run the detector.

## Bounded Next Goal

The derived Goal is RepoAssure Conditional Dead Control Calibration Bounded
Detector Implementation v0.1.

It remains `ready_to_execute` with `execution_authorization: null`. A separate
authorization is required before any detector or test implementation work.

If separately authorized, it remains limited to the approved question:
`conditional_dead_control_should_consider_form_dirty_prerequisites`.

Before any detector or test edit, the Goal must record an Architecture Handoff
that resolves all of the following:

1. acceptance-classifier seam versus browser-runtime seam;
2. P2 catalog classification versus P1 runtime finding severity;
3. whether classification and prerequisite evidence require schema changes;
4. how an initially disabled control becomes safely observable;
5. the exact implementation/test file allowlist and pass criteria.

If the seam cannot be chosen safely and unambiguously, the next Goal must stop
with `request_implementation_plan_revision`. It may not modify detector or
detector-behavior test code before that handoff locks scope. This decision Goal
modified no detector runtime or detector-behavior test file; its only test
change was the governance-only structure contract in
`tests/unit/project-structure.test.ts`.

## Approved Local Evidence

The later Goal may read, but must not modify, the approved synthetic fixture
evidence:

1. `tests/fixtures/conditional-dead-control-synthetic/fixture-manifest.json`
2. `tests/fixtures/conditional-dead-control-synthetic/form-dirty-states.json`
3. `tests/unit/conditional-dead-control-synthetic-fixture.test.ts`

After the Architecture Handoff, implementation must use test-driven
development and preserve positive, counter, and fail-closed branches.
Every branch must keep the finding visible. Missing, contradictory, unsafe, or
unobservable dirty-transition evidence must remain
`needs_maintainer_review`; form state may not be inferred.

## Manual Gates

All five gates remain explicitly complete as prior evidence:

1. `maintainer_classification_required_before_detector_change`
2. `fixture_privacy_confirmation_required`
3. `expected_snapshot_confirmation_required`
4. `confidence_threshold_review_required`
5. `regression_artifact_review_required`

Manual gates completed: 5/5.

Gate completion supports the recorded direction. It did not authorize or
execute detector implementation in this Goal.

## Auth-Redirect Separation

`auth_redirect_route_should_preserve_maintainer_review_boundary` remains
`request_revision` and is excluded from implementation.

## Decision And Execution Boundary

- Bounded detector implementation direction authorized: yes
- Bounded detector implementation authorized now: no
- Detector implementation execution authorized: no
- Next Goal execution authorized: no
- Architecture Handoff completed: no; required in the next Goal before edits
- Implementation file scope locked: no
- Detector changes performed: no
- Finding suppression authorized: no
- Automatic severity downgrade authorized: no
- Confidence threshold change authorized: no
- Acceptance policy change authorized: no
- Action Authorization Receipts issued: 0
- Target repositories acquired: 0
- Target repositories executed: 0
- Target repository writes: 0

No raw fixture or target was accessed or acquired. No dependency was
installed, no external system was used, and nothing was published, deployed,
or launched.
