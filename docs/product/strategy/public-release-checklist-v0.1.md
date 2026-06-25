# Public Release Checklist v0.1

Status: Draft
Date: 2026-06-22
Source ADR: [ADR-0009](../../adr/0009-commercialization-and-licensing-strategy.md)

## Purpose

Define the gate that must pass before any public open-source release, package publication, external announcement, or license grant.

## Release Boundary

This checklist does not publish the project. It defines prerequisites for a future public release.

## Checklist

- [ ] Add repository-level `LICENSE` text after legal review.
- [ ] Confirm Apache-2.0 remains the open-core license target.
- [ ] Decide whether to remove or keep `package.json` `"private": true`.
- [ ] Run dependency license scan and document incompatible dependencies, if any.
- [ ] Add contribution policy, including CLA or Developer Certificate of Origin decision.
- [ ] Add security disclosure policy.
- [ ] Branch protection or an equivalent repository ruleset is enabled for `main`.
- [ ] Review project name, package name, and trademark risk.
- [ ] Define which modules are open core and which are commercial-only before hosted dashboard work begins.
- [ ] Confirm no private customer data, secrets, or non-public target repo artifacts are committed.
- [ ] Run full quality gates: unit, integration, typecheck, lint, build, acceptance, and goal audit.
- [ ] Prepare public examples using safe fixture repos or explicitly approved case studies.
- [ ] Prepare release notes that describe local-first behavior, artifact boundaries, and non-goals.
- [ ] Add GitHub Action usage examples only after ADR-0014 local-first and no-default-upload boundaries are implemented and tested.
- [ ] Add or document executable public-release readiness checks for dependency licenses, secret exposure, generated artifact hygiene, and release boundary status.

## Blockers

Any unresolved legal, security, dependency-license, trademark, or secret-exposure issue blocks public release.

## Follow-up

- Convert this draft into an executable release checklist when public release becomes an active goal.
- Add automated dependency license scanning before the first public package publication.
- Keep the checklist as a release gate; completing v0.3 distribution readiness does not itself publish the repo or create a license grant.
