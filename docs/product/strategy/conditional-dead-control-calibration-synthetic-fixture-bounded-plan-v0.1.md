# Conditional Dead Control Calibration Synthetic Fixture Bounded Plan v0.1

Status: completed

Conclusion:
`synthetic_fixture_bounded_plan_prepared_without_fixture_creation_execution_or_detector_changes`

## Planning Result

- Approved question:
  `conditional_dead_control_should_consider_form_dirty_prerequisites`
- Revision-requested question:
  `auth_redirect_route_should_preserve_maintainer_review_boundary`
- Synthetic states defined: 5/5
- Proposed future files: 3
- Expected snapshots planned: 3
- Manual gates completed: 0/5
- Synthetic fixture created: no
- Synthetic fixture executed: no
- Detector changes performed: no

This is planning material only. It does not create or execute a fixture,
inspect a raw source fixture, modify detector behavior, complete a manual gate,
or authorize implementation.

## Synthetic State Contract

| State ID | Conceptual input | Expected evidence | Fail-closed boundary |
| --- | --- | --- | --- |
| `initial_disabled_before_dirty` | A new local form begins with `dirty=false` and the control disabled. | Record the initial prerequisite state without treating the control as permanently dead. | Initial disabled state alone cannot suppress or reclassify a finding. |
| `safe_dirty_transition_available` | One non-sensitive local text value can change reversibly without authentication, network, or destructive action. | Record that the prerequisite can be established safely. | If safety or observability is unclear, stop before interaction. |
| `enabled_after_safe_dirty_transition` | The conceptual safe transition changes `dirty` to true and enables the same control. | Preserve visible `false_positive_candidate` evidence with the prerequisite trace. | Keep the finding visible; no suppression or severity downgrade. |
| `still_disabled_after_safe_dirty_transition` | The same conceptual safe transition makes the form dirty but the control stays disabled. | Preserve an actionable result for maintainer classification. | Do not infer a false positive or automatically downgrade severity. |
| `dirty_transition_not_safely_observable` | The transition is missing, contradictory, unsafe, authenticated, external, or otherwise outside scope. | Produce `needs_maintainer_review`. | Infer no form state and change no detector behavior. |

The future fixture contract should use explicit, non-secret fields such as
`stateId`, `initialDirty`, `initialDisabled`, `transitionKind`,
`transitionSafe`, `afterDirty`, `afterDisabled`, and `observable`. This Goal
does not implement that schema.

## Proposed Future File Layout

The following paths are proposals and were not created:

1. `tests/fixtures/conditional-dead-control-synthetic/fixture-manifest.json`
   — future local-only provenance, privacy, state ids, and review metadata.
2. `tests/fixtures/conditional-dead-control-synthetic/form-dirty-states.json`
   — future deterministic synthetic inputs and expected snapshots.
3. `tests/unit/conditional-dead-control-synthetic-fixture.test.ts`
   — future positive, counter, and fail-closed regression consumer.

Proposed future files: 3

## Local-Only Provenance And Privacy Boundary

- Source category: `synthetic_local`
- Proposed provenance: `repoassure_authored_from_bounded_plan`
- External source code copied: no
- Raw source fixture accessed: no
- Credentials, tokens, cookies, private source, personal contact data, or
  production values allowed: no
- Network or target-repository dependency allowed: no
- Future privacy review required before execution: yes

Any later implementation must create original deterministic values only. It
must not copy the catalog path or treat metadata about a public fixture as
permission to inspect it. A future manifest must record reviewer, reviewed
time, evidence location, license status (`not_applicable_original_synthetic`),
and confirmation that secret/private/personal data is absent.

## Expected Snapshot Plan

Three future snapshot groups are planned:

1. Positive snapshot: initial disabled → safe dirty transition → enabled;
   finding remains visible as `false_positive_candidate` with prerequisite
   evidence.
2. Counter snapshot: initial disabled → same safe dirty transition → still
   disabled; result stays actionable for maintainer classification with no
   automatic severity downgrade.
3. Fail-closed snapshot: transition unavailable, unsafe, missing, or
   contradictory; result is `needs_maintainer_review` with no inferred form
   state.

Expected snapshots planned: 3. Expected snapshots confirmed: 0.

## Regression Plan

### Positive regression

Verify the same conceptual control starts disabled, receives one safe
non-sensitive dirty transition, becomes enabled, and keeps the finding visible
with prerequisite evidence.

### Counter-regression

Verify the same transition can leave a genuinely dead control disabled, and
that result remains actionable without suppression, severity downgrade, or a
confidence-threshold change.

### Fail-closed regression

Verify unsafe, unavailable, missing, or contradictory transition evidence
produces `needs_maintainer_review` and performs no interaction outside the
local synthetic boundary.

The existing catalog and calibration contract checks remain future companion
regressions. They are not fixture-specific evidence and were not used to mark
any manual gate complete in this Goal.

## Review And Rollback

Future review must confirm provenance/privacy, all three expected snapshot
groups, unchanged confidence threshold, positive/counter/fail-closed
regressions, and the final maintainer classification.

Rollback must remove only the future synthetic fixture and question-specific
consumer, restore the current `review_only` /
`false_positive_candidate` boundary, and rerun the catalog, calibration
contract, and consumption regressions. Rollback must not touch a target
repository or hide a finding.

## Manual Gates

All five gates remain incomplete:

1. `maintainer_classification_required_before_detector_change`
2. `fixture_privacy_confirmation_required`
3. `expected_snapshot_confirmation_required`
4. `confidence_threshold_review_required`
5. `regression_artifact_review_required`

Manual gates completed: 0/5. This plan alone cannot complete any gate.

## Auth-Redirect Separation

`auth_redirect_route_should_preserve_maintainer_review_boundary` remains
`request_revision` and is excluded from implementation.

## Next Authorization Boundary

The next Goal may prepare these four unselected options:

- `approve_synthetic_fixture_implementation`
- `request_synthetic_fixture_plan_revision`
- `defer_synthetic_fixture_implementation`
- `reject_synthetic_fixture_path`

Ordinary Goal execution authorization is not an implementation choice. The
next Goal may prepare the intake only; it may not preselect an option, create
or execute the fixture, change detector behavior, issue a receipt, publish,
deploy, or launch.
