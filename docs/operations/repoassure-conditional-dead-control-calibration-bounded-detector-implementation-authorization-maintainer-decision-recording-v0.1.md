# RepoAssure Conditional Dead Control Calibration Bounded Detector Implementation Authorization Maintainer Decision Recording v0.1

Status: completed

Conclusion:
`maintainer_authorized_bounded_detector_implementation_for_separately_authorized_local_goal_without_detector_changes`

## Decision Result

- Selected choice: `authorize_bounded_detector_implementation`
- Decision evidence: explicit maintainer numeric choice `1`
- Implementation authorization decisions recorded: 1/1
- Pending implementation authorization decisions: 0/1
- Bounded detector implementation direction authorized: yes
- Implementation Goal derivation authorized: yes
- Detector implementation execution authorized: no
- Next Goal execution authorized: no

The decision is complete. The recommendation, 5/5 completed manual gates,
prior direction approval, and ordinary Goal execution authorization were not
treated as the choice.

## Derived Goal

Next Goal: RepoAssure Conditional Dead Control Calibration Bounded Detector
Implementation v0.1.

Status: `ready_to_execute`.

Execution authorization: none. The Goal must receive a separate explicit
authorization before it changes or runs detector code or detector tests.

The later scope is limited to
`conditional_dead_control_should_consider_form_dirty_prerequisites`.

Before detector or test edits, it must record an Architecture Handoff that
chooses the acceptance-classifier or browser-runtime seam; reconciles P2
catalog classification with P1 runtime findings; decides the classification
and prerequisite-evidence schema; defines safe disabled-control observation;
and locks the implementation/test file allowlist and pass criteria.

If those decisions are not safe and unambiguous, it must stop with
`request_implementation_plan_revision`. No detector runtime or
detector-behavior test file was changed by this Goal. The only test change was
the governance-only structure contract in
`tests/unit/project-structure.test.ts`.

## Evidence And Regression Boundary

The later Goal may consume these approved local artifacts without modifying
them:

1. `tests/fixtures/conditional-dead-control-synthetic/fixture-manifest.json`
2. `tests/fixtures/conditional-dead-control-synthetic/form-dirty-states.json`
3. `tests/unit/conditional-dead-control-synthetic-fixture.test.ts`

Positive, counter, and fail-closed regressions must keep the finding visible.
Unsafe, missing, contradictory, or unobservable dirty-transition evidence
must fail closed to `needs_maintainer_review` without inferring form state.

## Gate And Scope Status

- Manual gates completed: 5/5
- Detector implementation execution authorized: no
- Next Goal execution authorized: no
- Architecture Handoff completed: no; required before detector or test edits
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

`auth_redirect_route_should_preserve_maintainer_review_boundary` remains
`request_revision` and is excluded from implementation.

No raw fixture, target, network, external system, or dependency was accessed
or acquired. Nothing was published, deployed, or launched.
