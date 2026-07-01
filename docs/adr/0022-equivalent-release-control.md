# ADR-0022: Equivalent Release Control

- Status: Accepted
- Date: 2026-07-01
- Deciders: RepoAssure maintainers

## Context

ADR-0012 requires branch protection or repository rulesets for `main` before public source release. The current GitHub private repo plan still returns `HTTP 403` for both branch protection and repository rulesets.

Public Release Manual Decision Input Review v0.2 confirmed that all seven maintainer decisions are present and reviewable, but the branch protection or equivalent repository ruleset gate remains the only blocking manual gate.

The repository must not be made public only to unlock branch protection.

## Decision

Design an equivalent release control as a fallback candidate for the branch protection or repository ruleset gate.

This control is a manual release governance substitute for the current private repo plan limitation. It does not close the branch protection gate by itself. Public Source Release Execution remains blocked until the equivalent control is executed and explicitly closed.

The equivalent release control must require a complete evidence package for the exact release commit SHA:

- Exact release commit SHA and repository visibility state.
- RepoAssure CI / Quality Gates success for the exact SHA.
- Local full test evidence, including elevated localhost integration tests when required.
- `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm repo:hygiene`, and `pnpm release:check` evidence.
- Secret/customer-data exposure scan evidence for tracked release materials.
- Diff review proving no generated artifacts, private target repo evidence, reviewer PII, env files, private keys, or logs are committed.
- Maintainer approval for equivalent control closure, including scope and residual risk acceptance.

Do not make the repository public only to unlock branch protection.

## Non-Decision

This ADR does not authorize repository visibility change, npm publication, GitHub release, public launch, production marketing announcement, SaaS/Team Cloud/Enterprise availability claim, hosted dashboard availability claim, customer logo use, or case study use.

This ADR does not replace GitHub branch protection permanently. If the GitHub plan later supports private repo branch protection or rulesets, ADR-0012 remains the preferred control.

## Cascaded Documents

- `docs/operations/equivalent-release-control-design-v0.1.md` records the concrete evidence contract and execution boundary.
- `docs/product/strategy/public-release-checklist-v0.1.md` records the equivalent control as designed but not executed.
- `README.md` and `docs/architecture/overview.md` reference ADR-0022 in the release governance chain.
- `docs/acceptance/checklists/acceptance-checklist-v0.1.md` and `docs/testing/strategy/test-strategy-v0.1.md` record the acceptance and test boundary.
- `docs/logs/decision-log.md` and `docs/logs/dev-log.md` record the decision chronologically.

## Consequences

### Positive

- Public release governance can proceed without making the repository public only to unlock GitHub branch protection.
- The release blocker is reduced from an undefined substitute to a precise evidence contract.
- Maintainer approval remains explicit and auditable.

### Negative

- The control is weaker than platform-enforced branch protection because direct pushes to `main` remain technically possible.
- The control requires disciplined manual evidence collection and review.
- Public source release remains blocked until a separate closure goal executes this control.

### Follow-up

- Execute Equivalent Release Control Closure v0.1 only if the maintainer chooses the fallback instead of upgrading GitHub branch protection/rulesets.
- Prefer enabling GitHub branch protection/rulesets when plan permissions become available.
