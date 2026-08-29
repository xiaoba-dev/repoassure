# Conditional Dead Control Calibration Implementation Gate Evidence Package v0.1

- Status: completed
- Conclusion: `conditional_dead_control_gate_evidence_package_prepared_with_all_manual_gates_fail_closed`
- Approved question: `conditional_dead_control_should_consider_form_dirty_prerequisites`
- Revision-requested question: `auth_redirect_route_should_preserve_maintainer_review_boundary`
- Gate evidence packets prepared: 5/5
- Manual gates completed: 0/5
- Detector implementation execution authorized: no
- Detector changes performed: no

## Boundary

This package prepares review evidence only. It does not access, acquire,
inspect, execute, or write the catalog fixture or any target repository. It
does not implement detector behavior, suppress findings, downgrade severity,
change a confidence threshold or acceptance policy, issue an authorization
receipt, publish, deploy, or launch.

The catalog metadata names `real-fixture:react-disabled-save-control` and
`examples/public-react-settings/src/SettingsForm.tsx`, but this Goal did not
open or validate that path. Raw fixture availability and privacy therefore
remain unconfirmed.

## Five manual gates

| Manual gate | Evidence status | Prepared evidence | Why it is not complete |
| --- | --- | --- | --- |
| `maintainer_classification_required_before_detector_change` | `prepared_pending_final_gate_confirmation` | The prior explicit `approve_implementation` direction, bounded decision matrix, rollback, and residual risk are collected. | The direction is not detector-execution authorization, and final gate confirmation has not been recorded. |
| `fixture_privacy_confirmation_required` | `blocked_missing_fixture_availability_and_privacy_confirmation` | A minimum provenance/privacy checklist is defined below. | No raw fixture file was accessed; availability and privacy are both unconfirmed. |
| `expected_snapshot_confirmation_required` | `prepared_pending_fixture_and_maintainer_confirmation` | Five expected evidence states and the fail-closed classification matrix are defined below. | No real or synthetic snapshot evidence was executed or confirmed. |
| `confidence_threshold_review_required` | `prepared_no_threshold_change_proposed_pending_confirmation` | The packet explicitly proposes no confidence-threshold change. | A maintainer has not recorded the final threshold-review confirmation. |
| `regression_artifact_review_required` | `prepared_pending_fixture_execution_and_review` | Positive, counter-regression, catalog, contract, and consumption checks are specified. | Fixture-specific regression artifacts were not executed or reviewed. |

Gate aliases used by the runtime calibration contract are preserved:

- `catalog_fixture_privacy_review_required` maps to
  `fixture_privacy_confirmation_required`.
- `expected_snapshot_review_required` maps to
  `expected_snapshot_confirmation_required`.

No alias changes the result: 5/5 evidence packets are prepared, but 0/5
manual gates are complete.

## Fixture provenance and privacy packet

The privacy gate can only be reviewed after a separately authorized evidence
path provides all of the following without secrets or personal data:

1. the exact fixture identifier and source category;
2. evidence that the fixture is already local and safe to inspect, or an
   independently approved synthetic-fixture plan;
3. repository/license or synthetic provenance;
4. confirmation that secrets, credentials, private source, and personal
   contact data are absent or redacted;
5. the reviewer, timestamp, and evidence location.

Current evidence:

- Raw source fixture files available: no
- Raw source fixture privacy confirmed: no
- Fixture access performed in this Goal: no
- Fixture acquisition performed in this Goal: no

These values are evidence gaps, not negative claims about the fixture itself.

## Expected snapshot packet

The expected snapshot must represent these bounded states:

1. `initial_disabled_before_dirty`
2. `safe_dirty_transition_available`
3. `enabled_after_safe_dirty_transition`
4. `still_disabled_after_safe_dirty_transition`
5. `dirty_transition_not_safely_observable`

The review matrix is fail-closed:

| Observed evidence | Review result | Finding behavior |
| --- | --- | --- |
| Initially disabled, safe dirty transition is available, then enabled | Preserve `false_positive_candidate` and attach prerequisite evidence. | Keep the finding visible; do not suppress it. |
| Still disabled after the safe dirty transition | Treat as an actionable finding requiring maintainer classification. | Do not downgrade severity automatically. |
| Dirty transition is unsafe, unavailable, missing, or contradictory | `needs_maintainer_review` | Infer no form state and change no detector behavior. |

Expected snapshot packet prepared: yes. Expected snapshot confirmed: no.

## Confidence-threshold review packet

- Confidence-threshold change proposed: no
- Automatic severity downgrade proposed: no
- Finding suppression proposed: no
- Acceptance-policy change proposed: no
- Review status:
  `prepared_no_threshold_change_proposed_pending_confirmation`

Any later implementation must remain within the existing confidence boundary
unless a separate, explicit review authorizes a change.

## Regression artifact review packet

Required positive regression:

- control starts disabled;
- an approved safe dirty-state transition is applied;
- control becomes enabled;
- finding remains visible as `false_positive_candidate` with prerequisite
  evidence.

Required counter-regression:

- control starts disabled;
- the same safe dirty-state transition is applied;
- control remains disabled;
- result remains actionable and receives no automatic severity downgrade.

Required repository checks:

```text
pnpm vitest run tests/unit/false-positive-catalog.test.ts
pnpm vitest run tests/unit/false-positive-detector-calibration-contract.test.ts tests/unit/false-positive-detector-calibration-contract-consumption.test.ts
```

These commands are the proposed review contract. Fixture-specific execution in
this Goal: no. Regression artifact review completed: no.

## Rollback and residual risk

If a later, independently authorized implementation fails review, rollback
must remove only the question-specific prerequisite rule, restore
`review_only` / `false_positive_candidate`, and rerun catalog, contract, and
consumption regressions. Rollback must not write a target repository.

Residual risk:
`real_dead_control_could_be_hidden_by_incorrect_prerequisite_inference`.

## Auth-redirect separation

`auth_redirect_route_should_preserve_maintainer_review_boundary` remains
`request_revision`. It is excluded from implementation and from every gate
packet in this package. No auth-redirect implementation is authorized.

## Outcome

The five evidence packets are ready for manual review, while every gate
remains fail-closed. The next bounded step is to prepare fixture-evidence
readiness and authorization choices. It is not detector implementation
authorization and does not grant fixture or target access.
