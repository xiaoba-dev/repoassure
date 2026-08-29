# Conditional Dead Control Calibration Fixture Evidence Readiness and Authorization Intake v0.1

- Status: completed
- Conclusion: `conditional_dead_control_fixture_evidence_readiness_and_authorization_intake_prepared_without_inferred_choice_or_fixture_access`
- Question: `conditional_dead_control_should_consider_form_dirty_prerequisites`
- Revision-requested question:
  `auth_redirect_route_should_preserve_maintainer_review_boundary`
- Fixture evidence options prepared: 4/4
- Fixture evidence decisions recorded: 0/1
- Preselected choice: none
- Recommended option: `request_synthetic_local_fixture_plan`
- Fixture access authorized: no
- Fixture acquisition authorized: no
- Detector implementation execution authorized: no
- Detector changes performed: no

## Purpose and boundary

This intake prepares one explicit owner decision about how to resolve the
fixture-evidence gap. It does not record the decision, access or acquire a
fixture, implement a synthetic fixture, inspect a target repository, or
change detector behavior.

Ordinary Goal execution authorization is not a fixture-evidence choice.
Choosing an option later will authorize only the stated planning or recording
step. Fixture access, acquisition, synthetic implementation, regression
execution, detector implementation, and target actions remain separately
gated.

The catalog metadata names `real-fixture:react-disabled-save-control` and
`examples/public-react-settings/src/SettingsForm.tsx`. These values are hints,
not proof that the file exists, is local, is public, or is privacy-safe. This
Goal did not open or validate that path.

## Owner choices

No option is selected.

| Option | Small-language meaning | Evidence needed with the answer | What it does not authorize |
| --- | --- | --- | --- |
| `confirm_existing_local_public_fixture_evidence` | “I already have a local, public-safe evidence source and will identify it.” | Provide all minimum fields below using a non-secret evidence reference. If the fields are incomplete, the decision remains pending. | Does not authorize Codex to open, inspect, copy, execute, or modify the fixture. |
| `request_synthetic_local_fixture_plan` | “Do not use the unknown raw fixture; prepare a safe synthetic-fixture plan first.” | An explicit choice is sufficient for a later plan-only Goal. | Does not authorize creating or running the synthetic fixture or changing the detector. |
| `defer_fixture_evidence` | “Pause this implementation path without rejecting it.” | An explicit choice; an optional reason may be recorded. | Does not complete any manual gate or authorize any action. |
| `reject_implementation_path` | “Stop the conditional-dead-control implementation path.” | An explicit choice; an optional reason may be recorded. | Does not alter existing catalog classifications, detector behavior, or the separate auth-redirect revision request. |

## Recommendation

Recommended option: `request_synthetic_local_fixture_plan`.

Why: current evidence proves neither raw fixture availability nor privacy.
A plan-only synthetic path is the most reversible way to define representative
states without exposing unknown source material. This recommendation is not a
recorded decision, does not preselect the option, and does not authorize
synthetic implementation.

If the owner already possesses a verifiably local and public-safe source,
`confirm_existing_local_public_fixture_evidence` may be more direct, but the
minimum evidence fields must accompany that choice.

## Minimum non-secret fixture evidence

The following fields are required before an existing fixture reference can be
reviewed:

| Field | Minimum acceptable value |
| --- | --- |
| `fixture_identifier` | The exact stable fixture identifier. |
| `evidence_location` | A bounded local evidence reference or owner-supplied public source reference; no secret URL, token, or credential. |
| `source_category` | `existing_local_public`, `owner_supplied_public`, or `synthetic`. |
| `provenance` | Who created or supplied the evidence and how it entered the review boundary. |
| `license_status` | A non-secret license or permitted-use statement; `unknown` is not confirmation. |
| `privacy_confirmation` | Explicit confirmation that private source, secrets, credentials, and personal contact data are absent or redacted. |
| `reviewer` | The accountable human reviewer or maintainer role. |
| `reviewed_at` | An explicit timestamp associated with the review. |

Do not put source contents, credentials, personal information, or secret-like
values in the decision response. A path or public reference is evidence
metadata, not access authorization.

## Decision recording rules

The later decision record must:

1. name
   `conditional_dead_control_should_consider_form_dirty_prerequisites`;
2. contain exactly one of the four option ids;
3. use a separate explicit owner answer rather than an ordinary
   “授权执行” message;
4. keep the decision pending if the response is missing, ambiguous, or, for
   `confirm_existing_local_public_fixture_evidence`, lacks any required
   evidence field;
5. record no Action Authorization Receipt and perform no fixture or target
   action.

Current state:

- Fixture evidence decisions recorded: 0/1
- Pending fixture evidence decisions: 1/1
- Raw source fixture files available: no
- Raw source fixture privacy confirmed: no
- Manual gates completed: 0/5

## Fail-closed outcomes

| Later explicit choice | Bounded next result |
| --- | --- |
| `confirm_existing_local_public_fixture_evidence` with complete metadata | Record the owner evidence reference; fixture review/access remains separately gated. |
| `confirm_existing_local_public_fixture_evidence` with incomplete metadata | Keep the decision pending and request only the missing non-secret fields. |
| `request_synthetic_local_fixture_plan` | Permit derivation of one plan-only synthetic-fixture Goal; no implementation. |
| `defer_fixture_evidence` | Keep all five manual gates incomplete and pause this path. |
| `reject_implementation_path` | Close this implementation direction without changing runtime behavior. |
| Missing or ambiguous answer | Keep the decision pending; infer nothing. |

## Unchanged separation

`auth_redirect_route_should_preserve_maintainer_review_boundary` remains
`request_revision` and is excluded from implementation.

No finding is suppressed, no severity is downgraded, no confidence threshold
or acceptance policy changes, no receipt is issued, and no fixture or target
is accessed, acquired, installed, analyzed, executed, or written. Nothing is
published, deployed, or launched.

## Owner response template

```text
conditional_dead_control_should_consider_form_dirty_prerequisites:
  <confirm_existing_local_public_fixture_evidence |
   request_synthetic_local_fixture_plan |
   defer_fixture_evidence |
   reject_implementation_path>

If confirming existing evidence, also provide:
- fixture_identifier:
- evidence_location:
- source_category:
- provenance:
- license_status:
- privacy_confirmation:
- reviewer:
- reviewed_at:

Optional reason:
```

Leaving the template empty is valid and means the decision is still pending.
