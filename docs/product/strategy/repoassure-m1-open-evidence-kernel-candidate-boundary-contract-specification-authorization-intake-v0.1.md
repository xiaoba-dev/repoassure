# RepoAssure M1 Open Evidence Kernel Candidate Boundary Contract Specification Authorization Intake v0.1

Status: `awaiting_explicit_maintainer_decision`

Conclusion: `k1_contract_specification_authorization_intake_prepared_without_inferred_choice_specification_schema_or_runtime_changes`

Candidate: `provider_neutral_read_only_evidence_envelope_adapter_boundary`

Selected decision: `pending`

Recommendation: `none_not_authorized`

Decisions recorded: 0/1. Decisions pending: 1/1.

## Decision Boundary

Goal execution authorization is not the contract-specification authorization decision. The current Goal was authorized only to prepare this blank intake. It did not select, recommend, default, accept, or infer an answer.

Original contracts and original artifact bytes remain authoritative. K1 remains a disposable, rebuildable, reference-only, non-authoritative candidate. M1 remains incomplete, M2 remains incomplete, and M3–M5 remain strategy-only.

## One Question For The Maintainer

What should RepoAssure do next with K1 contract-specification drafting?

- [ ] `approve_for_separately_gated_contract_specification_drafting`
  - Meaning: allow Project Autopilot to derive one future contract-specification drafting Goal.
  - Limit: that future Goal must start with `execution_authorization: null`; this option does not itself authorize drafting, schema creation, contract acceptance, implementation, or M1 advancement.
  - Reversal: revise or reject the later draft before any contract acceptance.
- [ ] `request_contract_design_revision`
  - Meaning: keep specification drafting unapproved and request a revised K1 design plan.
  - Limit: no specification Goal is derived from the present design.
  - Reversal: review a revised design through a separately gated future Goal.
- [ ] `defer_contract_specification_drafting`
  - Meaning: pause specification drafting without rejecting K1.
  - Limit: no downstream specification Goal is derived while deferred.
  - Reversal: reopen the decision through a separately authorized Goal.
- [ ] `reject_contract_specification_path`
  - Meaning: reject the current K1 contract-specification path.
  - Limit: no specification or implementation Goal is derived from this K1 path.
  - Reversal: any materially new path begins with new planning and a new separately authorized intake.

All four boxes are intentionally blank. Option order carries no preference. No default or recommendation is authorized.

## Five Separate Gates

1. This completed Goal prepares only the blank intake.
2. The next Goal may record exactly one explicit token only after its own execution authorization.
3. Only an explicit approval may derive a separate drafting Goal, again with `execution_authorization: null`.
4. A completed draft still requires a separate maintainer acceptance or revision decision.
5. Contract implementation and M1 advancement remain separately gated after any acceptance.

## Preserved Decisions And Zero Actions

- `auth_redirect`: `request_revision`.
- Final acceptance: `defer`.
- Representative execution: Web=`defer`, Python/CLI=`defer`, MCP/Agent=`defer`.
- Representative acquisition: Web=`defer`, Python/CLI=`defer`, MCP/Agent=`defer`.
- Specification drafts, schemas, authoritative contract acceptance, adapter/runtime implementations, detector/fixture/dependency/provider/target actions, authorization receipts, publication, deployment, launch, commit, push, and pull-request actions: 0.
- Detector or behavior tests executed: 0.

## Future Recording Gate

The next Goal may record a choice only after separate execution authorization and exactly one explicit option token from the maintainer. Missing, ambiguous, multiple, or out-of-vocabulary input must fail closed and leave `selected_decision` as `pending`.
