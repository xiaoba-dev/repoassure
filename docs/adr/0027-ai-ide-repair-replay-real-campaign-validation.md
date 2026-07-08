# ADR-0027: AI IDE Repair Replay Real Campaign Validation

Status: Accepted
Date: 2026-07-08

## Context

ADR-0025 added the AI IDE repair evidence consumer contract. ADR-0026 added the replay readiness report generated from that contract.

Those pieces need to be validated against a real-campaign-shaped fixture, not only isolated hand-authored contracts. The product needs proof that a maintainer or AI IDE can take a local campaign summary through the full repair evidence chain and end with a replay readiness report that is ready for maintainer review.

## Decision

Extend the real-campaign-shaped AI IDE repair evidence E2E validation to cover:

```text
campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay
```

The validation must prove that:

- the bundle manifest is generated from local repair evidence artifacts.
- the consumer contract is generated from the bundle manifest.
- the replay readiness report is generated from the consumer contract.
- `replayReadiness` reaches `ready_for_maintainer_replay_review` for a complete verified fixture.
- blocked actions remain enforced.
- redaction boundary wording supports both explicit `redact` language and real campaign `sanitized summaries / never store secrets` language.
- the final replay readiness report remains review evidence only.

## Boundaries

This real campaign replay validation is local readiness evidence only.

It does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, file mutation, npm publication, GitHub release, public launch, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

## Consequences

- RepoAssure has an executable, near-real validation path for the complete AI IDE repair evidence chain.
- The replay readiness checker now accepts equivalent sanitized-boundary wording found in generated campaign evidence.
- Maintainers can trust that `playbook:bundle`, `playbook:contract`, and `playbook:replay` work together before opening any separate target-repo repair goal.
- Future repair execution features must keep this chain local-first and non-authorizing.
