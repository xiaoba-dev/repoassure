# ADR-0015: Public Release Readiness Boundary

- Status: Accepted
- Date: 2026-06-25
- Deciders: hardening-mcp maintainers

## Context

ADR-0009 selected Apache-2.0 as the intended open-core license target. ADR-0012 blocked public repository visibility, package publication, public announcements, and repository-level `LICENSE` changes until the public release checklist was complete.

After v0.3, RepoAssure has a local-first GitHub Action wrapper, stable repair-loop agent contracts, and executable public-release readiness checks. The next step is to prepare the public-release materials without actually publishing the repository or package.

This creates a narrower boundary: some materials, especially `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, dependency-license audit, and release notes draft, must exist before a credible public release decision. Adding these materials in a private repository is readiness preparation, not publication authorization.

## Decision

Adopt a public release readiness boundary. Public release readiness boundary means source-release materials can be prepared and checked before any public visibility or package publication action:

- Add repository-level Apache-2.0 `LICENSE` text as readiness material.
- Add `package.json#license: "Apache-2.0"` while keeping `package.json#private: true`.
- Add `CONTRIBUTING.md` with Developer Certificate of Origin and no-CLA policy for the initial public release plan.
- Add `SECURITY.md` with private vulnerability disclosure guidance.
- Add dependency-license audit and public release notes draft under `docs/product/strategy/`.
- Extend `pnpm release:check` to verify these materials and still report `public release ready: no` until manual publication authorization exists.

Adding `LICENSE` is readiness preparation, not publication authorization.

Public release remains blocked until all manual gates are resolved:

- legal review
- trademark/name review
- branch protection or equivalent repository ruleset
- final maintainer publication authorization
- explicit decision to make the repository public, publish packages, announce publicly, or publish external case studies

## Consequences

### Positive

- Public-release materials become reviewable before the risky visibility change.
- The repository can run automated readiness checks without publishing.
- Apache-2.0 source-license intent is visible and machine-checkable.
- Contribution and security policies are available before external users arrive.

### Negative

- A repository-level `LICENSE` can be misread as public publication readiness if detached from the release boundary.
- The checker must keep manual authorization as a not-ready gate.
- ADR-0012 and related docs need a narrower interpretation: `LICENSE` may exist for readiness, while public release actions remain blocked.

## Cascaded Documents

- `docs/product/strategy/public-release-checklist-v0.1.md` records completed readiness materials and remaining manual gates.
- `scripts/check-public-release-readiness.mjs` checks license, contribution policy, security policy, dependency-license audit, release notes draft, hygiene, and manual authorization.
- `docs/product/strategy/dependency-license-audit-v0.1.md` records the current dependency license audit.
- `docs/product/strategy/public-release-notes-v0.1.md` records the draft public release notes.
- `CONTRIBUTING.md` and `SECURITY.md` define inbound contribution and vulnerability disclosure policies.
- `README.md`, operations docs, and PR template distinguish readiness materials from publication authorization.
