# Public Release Checklist v0.1

Status: Automated readiness prepared; manual publication gates pending
Date: 2026-06-22
Source ADR: [ADR-0009](../../adr/0009-commercialization-and-licensing-strategy.md)

## Purpose

Define the gate that must pass before any public open-source release, package publication, external announcement, or license grant.

## Release Boundary

This checklist does not publish the project. It defines prerequisites for a future public release.

## Checklist

- [x] Add repository-level Apache-2.0 `LICENSE` text as readiness material.
- [x] Confirm Apache-2.0 remains the open-core license target.
- [x] Decide whether to remove or keep `package.json` `"private": true`: keep it for the first public source-readiness phase; npm package publication remains blocked.
- [x] Run dependency license scan and document incompatible dependencies, if any: see `dependency-license-audit-v0.1.md`.
- [x] Add executable private pre-release readiness check: `pnpm release:check`.
- [x] Add contribution policy, including CLA or Developer Certificate of Origin decision.
- [x] Add security disclosure policy.
- [x] Branch protection or an equivalent repository ruleset is enabled for `main`, or an equivalent release control is closed for `main`: see `../../operations/equivalent-release-control-closure-v0.1.md`.
- [x] Review project name, package name, and trademark risk: maintainer accepted current RepoAssure naming risk in Public Release Manual Decision Intake v0.2.
- [x] Define which modules are open core and which are commercial-only before hosted dashboard work begins: see ADR-0009 and ADR-0016.
- [x] Confirm no private customer data, secrets, or non-public target repo artifacts are committed: covered by `pnpm repo:hygiene`, sensitive-material scan, and Equivalent Release Control Closure v0.1.
- [x] Run full quality gates: unit, integration, typecheck, lint, build, acceptance, and goal audit: covered by local closure evidence and GitHub `RepoAssure CI` / `Quality Gates`.
- [x] Prepare public examples using safe fixture repos or explicitly approved case studies: use `examples/` and `fixtures/`; no external customer case study is authorized.
- [x] Prepare release notes that describe local-first behavior, artifact boundaries, and non-goals.
- [x] Add GitHub Action usage examples only after ADR-0014 local-first and no-default-upload boundaries are implemented and tested.
- [x] Add or document executable public-release readiness checks for secret exposure, generated artifact hygiene, release boundary status, and current license readiness status.
- [x] Add automated dependency license readiness evidence before first public package publication.
- [x] Prepare local release candidate handoff for review without publication: see `../../operations/release-candidate-handoff-v0.1.md`.
- [x] Legal review confirms Apache-2.0 license text, contribution policy, and security disclosure policy: maintainer approved current readiness materials in Public Release Manual Decision Intake v0.2.
- [x] Final maintainer authorization exists before changing visibility, publishing packages, or announcing publicly: authorization is recorded in Public Release Manual Decision Intake v0.2, but execution remains blocked by the deferred branch protection or equivalent repository ruleset gate.

## Blockers

Any unresolved branch protection or equivalent repository ruleset issue blocks public release. Future legal, security, dependency-license, trademark, or secret-exposure changes must be reviewed before they are included in release materials.

## Follow-up

- `pnpm release:check` currently passes automated public-release prerequisites and reports `public release ready: no`; it is not permission to publish.
- Public Release Readiness v0.2 is recorded in `../../operations/public-release-readiness-v0.2.md`; it preserves `public release ready: no` while documenting the current automated command matrix and manual authorization gates.
- Public Release Candidate Final Review v0.1 is recorded in `../../operations/public-release-candidate-final-review-v0.1.md`; it records automated local gates as passing while preserving the final recommendation: no-go for public release until manual gates close.
- Public Release Manual Gate Input Collection v0.1 is recorded in `../../operations/public-release-manual-gate-input-collection-v0.1.md`; it collects legal, trademark/name, branch protection or equivalent ruleset, final maintainer authorization, reviewer feedback, dependency/license, and secret/customer data exposure decisions, but no gate is closed without explicit maintainer evidence.
- Public Release Manual Gate Closure v0.1 is recorded in `../../operations/public-release-manual-gate-closure-v0.1.md`; current status is `not_closed_missing_manual_evidence`, and public release remains no-go because legal review, trademark/name review, branch protection or equivalent repository ruleset, final maintainer publication authorization, and reviewer feedback decision are not closed.
- Public Release Manual Gate Closure v0.2 is recorded in `../../operations/public-release-manual-gate-closure-v0.2.md`; current status is `not_closed_after_fresh_evidence_review`, and public release remains no-go after fresh evidence review because repository remains private, latest CI is successful, branch protection / repository rulesets still return HTTP 403, and legal, trademark/name, final publication authorization, reviewer feedback decision, dependency/license risk acceptance, and secret/customer data exposure confirmation are still missing.
- Public Release Manual Gate Evidence Intake v0.1 is recorded in `../../operations/public-release-manual-gate-evidence-intake-v0.1.md`; current status is `evidence_intake_incomplete`, with automated readiness evidence present but legal, trademark/name, branch protection or equivalent repository ruleset, final maintainer publication authorization, and reviewer feedback evidence still missing.
- Public Release Manual Gate Evidence Completion v0.1 is recorded in `../../operations/public-release-manual-gate-evidence-completion-v0.1.md`; current status is `incomplete_missing_manual_evidence`, and no gate was completed, closed, or passed because required maintainer evidence was not supplied.
- Public Release Manual Evidence Decision v0.1 is recorded in `../../operations/public-release-manual-evidence-decision-v0.1.md`; current status is `pending_manual_decisions`, and all manual gates remain `pending_decision` because no explicit approve/reject/defer/accept-risk decision was supplied.
- Public Release Manual Evidence Decision Closure v0.1 is recorded in `../../operations/public-release-manual-evidence-decision-closure-v0.1.md`; current status is `not_closed_pending_decisions`, and decision closure remains not_closed because no explicit approve/reject/defer/accept-risk decisions were supplied.
- Public Release Manual Decision Input v0.1 is recorded in `../../operations/public-release-manual-decision-input-v0.1.md`; current status is `pending_input`, with blank decision/evidence/date/notes/scope fields for every manual gate and no prefilled approve/reject/defer/accept-risk decision.
- Public Release Manual Decision Input Completion v0.1 is recorded in `../../operations/public-release-manual-decision-input-completion-v0.1.md`; current status is `not_completed_missing_explicit_decisions`, because authorization to execute the Codex goal did not supply explicit approve/reject/defer/accept-risk values, evidence, dates, notes, or scope for the manual gates.
- Public Release Manual Decision Intake v0.2 is recorded in `../../operations/public-release-manual-decision-intake-v0.2.md`; current status is `decisions_recorded_release_execution_blocked`, with legal review approved, trademark/name risk accepted, final maintainer publication authorization approved, reviewer feedback wait risk accepted, dependency/license risk accepted, and secret/customer data exposure approved based on automated verification. Branch protection or equivalent repository ruleset is deferred because GitHub private repo branch protection/rulesets still return HTTP 403, so public release remains no-go.
- Public Release Manual Decision Input Review v0.1 is recorded in `../../operations/public-release-manual-decision-input-review-v0.1.md`; current status is `not_ready_pending_input`, because the maintainer decision input form remains blank and public release remains no-go.
- Public Release Manual Decision Input Review v0.2 is recorded in `../../operations/public-release-manual-decision-input-review-v0.2.md`; current status is `reviewed_release_execution_still_blocked`, because all seven maintainer decisions are present and reviewable, but branch protection or equivalent repository ruleset remains deferred. Current blocking manual gate: branch protection or equivalent repository ruleset.
- Equivalent Release Control Design v0.1 is recorded in `../../operations/equivalent-release-control-design-v0.1.md`; current status is `designed_not_executed`. The fallback evidence contract is defined, but it has not been executed or explicitly closed, so it does not satisfy the branch protection or equivalent repository ruleset checklist item.
- Equivalent Release Control Closure v0.1 is recorded in `../../operations/equivalent-release-control-closure-v0.1.md`; current status is `closed_release_execution_ready`. Public Release Authorization v0.1 is recorded in `public-release-authorization-v0.1.md`; current status is `ready_for_public_source_release_execution`. These records do not execute repository visibility change, npm publication, GitHub release, public launch, production marketing announcement, or commercial availability claims.
- Current blocking manual gate: none for public source release readiness; public release execution still requires a separate execution goal before any public action.
- Keep the checklist as a release gate; completing v0.3 distribution readiness does not itself publish the repo or create a license grant.
