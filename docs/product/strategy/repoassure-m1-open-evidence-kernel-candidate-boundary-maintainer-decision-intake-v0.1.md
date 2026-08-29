# RepoAssure M1 Open Evidence Kernel Candidate Boundary Maintainer Decision Intake v0.1

Status: `awaiting_explicit_maintainer_decision`

Candidate: `provider_neutral_read_only_evidence_envelope_adapter_boundary`

Selected decision: `pending`

Recommendation: `none_not_authorized`

Candidate decisions recorded: 0/1. Candidate decisions pending: 1/1.

## Decision Boundary

Execution authorization is not the candidate-boundary decision. This Goal was
authorized only to prepare this blank decision card. It did not select,
recommend, default, accept, or infer any answer.

The candidate remains non-authoritative. Original contracts remain authoritative.
M1 remains incomplete, M2 remains incomplete, and M3–M5 remain strategy-only.

## One Question For The Maintainer

What should RepoAssure do with the K1 candidate boundary?

- [ ] `approve_for_separately_gated_contract_design`
  - Meaning: allow Project Autopilot to create a future contract-design Goal.
  - Limit: that future Goal must start unauthorized and may design only after a
    separate execution authorization; this choice does not create a schema or
    authorize contract, adapter, runtime, CLI/MCP, provider, or M1 work.
  - Reversal path: revise or reject the later design before implementation.
- [ ] `request_revision`
  - Meaning: keep K1 unaccepted and request a revised candidate plan.
  - Limit: no design or implementation Goal is derived from the current K1.
  - Reversal path: review a revised intake in a separately gated future Goal.
- [ ] `defer`
  - Meaning: leave K1 pending and pause this direction without rejecting it.
  - Limit: no downstream K1 Goal is derived while deferred.
  - Reversal path: reopen the decision through a separately authorized Goal.
- [ ] `reject`
  - Meaning: record that K1 is not an accepted boundary.
  - Limit: no K1 design or implementation Goal is derived.
  - Reversal path: any materially new candidate must begin with new planning and
    a new separately authorized decision intake.

All four boxes are intentionally blank. Option order carries no preference.
No default or recommendation is authorized.

## Preserved Decisions And Zero Actions

- `auth_redirect`: `request_revision`.
- Final acceptance: `defer`.
- Representative execution: Web=`defer`, Python/CLI=`defer`, MCP/Agent=`defer`.
- Representative acquisition: Web=`defer`, Python/CLI=`defer`, MCP/Agent=`defer`.
- Schema, contract specification, adapter, runtime, detector, fixture,
  dependency, provider, target, receipt, publication, deployment, launch,
  commit, push, and pull-request actions: 0.
- Detector or behavior tests executed: 0.

## Future Recording Gate

The next Goal may record a choice only after it receives its own execution
authorization and the maintainer supplies exactly one explicit option token.
Missing, ambiguous, multiple, or out-of-vocabulary input must fail closed and
leave `selected_decision` as `pending`.
