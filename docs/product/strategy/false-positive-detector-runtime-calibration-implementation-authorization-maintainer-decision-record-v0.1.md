# RepoAssure False-Positive Detector Runtime Calibration Implementation Authorization Maintainer Decision Recording v0.1

Status: completed

Conclusion: `maintainer_approved_conditional_dead_control_implementation_and_requested_auth_redirect_revision_without_detector_changes`

## Maintainer Decisions

The maintainer supplied both answers explicitly:

| Question | Decision | Effect |
| --- | --- | --- |
| `conditional_dead_control_should_consider_form_dirty_prerequisites` | `approve_implementation` | The implementation direction may proceed to a separate five-gate evidence-preparation Goal. This is not permission to change code or detector behavior now. |
| `auth_redirect_route_should_preserve_maintainer_review_boundary` | `request_revision` | The proposal must be revised. It is excluded from implementation and from the next Goal. |

- Implementation authorization decisions recorded: 2/2
- Approved implementation directions: 1/2
- Revision requests: 1/2
- Pending questions: 0/2

## Meaning In Plain Language

The first answer means “the direction looks acceptable; prepare the required
proof and review material next.” It does not mean “start changing the
detector.”

The second answer means “do not implement this version; revise the proposal
first.”

## Five Manual Gates Preserved

The approved direction cannot reach implementation until a later,
separately authorized Goal has prepared and passed all five gates:

1. `maintainer_classification_required_before_detector_change`
2. `fixture_privacy_confirmation_required`
3. `expected_snapshot_confirmation_required`
4. `confidence_threshold_review_required`
5. `regression_artifact_review_required`

Raw source-fixture availability and privacy are not inferred by this
decision. They remain evidence gaps to be handled fail-closed in the next
Goal.

## Authorization Boundary

- Conditional-dead-control implementation direction authorized: yes
- Auth-redirect implementation direction authorized: no
- Detector implementation execution authorized now: no
- Detector changes performed: no
- Runtime detector behavior changed: no
- Findings suppressed: no
- Severity automatically downgraded: no
- Confidence threshold changed: no
- Acceptance policy changed: no
- Action Authorization Receipts issued: 0
- Target repositories acquired: 0
- Target repositories executed: 0
- Target repository writes: 0
- Publication, deployment, or launch performed: no

## Next Goal

RepoAssure Conditional Dead Control Calibration Implementation Gate Evidence
Preparation v0.1.

It may prepare local-only evidence for the five manual gates for the approved
first question. It must preserve the second question as `request_revision`
and must not implement or change the detector.
