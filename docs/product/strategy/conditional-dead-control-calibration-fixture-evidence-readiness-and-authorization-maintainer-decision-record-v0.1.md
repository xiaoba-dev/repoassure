# Conditional Dead Control Calibration Fixture Evidence Maintainer Decision Record v0.1

Status: completed

Conclusion:
`maintainer_requested_synthetic_local_fixture_plan_without_fixture_access_or_detector_changes`

## Explicit Decision Evidence

- Approved question: `conditional_dead_control_should_consider_form_dirty_prerequisites`
- Explicit owner input: `2`
- Option mapping: `2` → `request_synthetic_local_fixture_plan`
- Selected option: `request_synthetic_local_fixture_plan`
- Fixture evidence decisions recorded: 1/1
- Pending fixture evidence decisions: 0/1
- Ordinary Goal execution authorization treated as fixture-evidence choice: no

The owner entered `2` directly after the four-option intake. That exact response
selects only the request for a future bounded synthetic-local-fixture plan.
Earlier generic `授权执行` messages were not used as the choice.

## Authorization Boundary

- Synthetic fixture plan direction authorized: yes
- Synthetic fixture planning execution authorized: no
- Synthetic fixture implementation authorized: no
- Synthetic fixture created: no
- Synthetic fixture executed: no
- Fixture access authorized: no
- Fixture acquisition authorized: no
- Raw source fixture files available: no
- Raw source fixture privacy confirmed: no
- Manual gates completed: 0/5
- Detector implementation execution authorized: no
- Detector changes performed: no
- Action Authorization Receipts issued: 0
- Target repositories acquired / executed / written: 0 / 0 / 0

This decision authorizes creation of the next Goal record only. Executing that
planning Goal requires separate authorization. It does not authorize creating,
accessing, acquiring, installing, analyzing, starting, or running any fixture
or target.

## Preserved Revision Boundary

`auth_redirect_route_should_preserve_maintainer_review_boundary` remains
`request_revision` and is excluded from implementation.

## Next Goal

RepoAssure Conditional Dead Control Calibration Synthetic Fixture Bounded
Planning v0.1 may prepare a local-only plan for five synthetic observable
states, future provenance/privacy rules, regression expectations, review, and
rollback. It may not create or execute the fixture, change detector behavior,
complete any manual gate, issue a receipt, publish, deploy, or launch.
