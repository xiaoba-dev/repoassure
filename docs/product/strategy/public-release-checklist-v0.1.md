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
- [ ] Branch protection or an equivalent repository ruleset is enabled for `main`.
- [ ] Review project name, package name, and trademark risk.
- [ ] Define which modules are open core and which are commercial-only before hosted dashboard work begins.
- [ ] Confirm no private customer data, secrets, or non-public target repo artifacts are committed.
- [ ] Run full quality gates: unit, integration, typecheck, lint, build, acceptance, and goal audit.
- [ ] Prepare public examples using safe fixture repos or explicitly approved case studies.
- [x] Prepare release notes that describe local-first behavior, artifact boundaries, and non-goals.
- [x] Add GitHub Action usage examples only after ADR-0014 local-first and no-default-upload boundaries are implemented and tested.
- [x] Add or document executable public-release readiness checks for secret exposure, generated artifact hygiene, release boundary status, and current license readiness status.
- [x] Add automated dependency license readiness evidence before first public package publication.
- [x] Prepare local release candidate handoff for review without publication: see `../../operations/release-candidate-handoff-v0.1.md`.
- [ ] Legal review confirms Apache-2.0 license text, contribution policy, and security disclosure policy.
- [ ] Final maintainer authorization exists before changing visibility, publishing packages, or announcing publicly.

## Blockers

Any unresolved legal, security, dependency-license, trademark, or secret-exposure issue blocks public release.

## Follow-up

- `pnpm release:check` currently passes automated public-release prerequisites and reports `public release ready: no`; it is not permission to publish.
- Public Release Readiness v0.2 is recorded in `../../operations/public-release-readiness-v0.2.md`; it preserves `public release ready: no` while documenting the current automated command matrix and manual authorization gates.
- Public Release Candidate Final Review v0.1 is recorded in `../../operations/public-release-candidate-final-review-v0.1.md`; it records automated local gates as passing while preserving the final recommendation: no-go for public release until manual gates close.
- Manual gates remain: branch protection or equivalent ruleset, legal review, trademark review, and final maintainer publication authorization.
- Keep the checklist as a release gate; completing v0.3 distribution readiness does not itself publish the repo or create a license grant.
