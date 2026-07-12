# Blocked Goal Recovery Decision Receipt v0.1 Design

Status: Accepted for implementation
Date: 2026-07-13

## Problem

`blocked-goal-recovery-consumption-report.json` explains what an AI IDE or maintainer must review, but it does not record explicit decisions over each queued recovery action. A later resume attempt therefore has no deterministic evidence that automatic retries, maintainer decisions, external prerequisites, and risks were reviewed.

## Decision

Add a local-first `goal:recover:decide` workflow that consumes:

- `blocked-goal-recovery-consumption-report.json`
- `blocked-goal-recovery-decisions.json`

and writes:

- `blocked-goal-recovery-decision-receipt.json`
- `blocked-goal-recovery-decision-receipt.md`

The receipt schema is `repoassure.blocked-goal-recovery-decision-receipt.v1`.

## Stable Action Identity

Each consumption action gains an `actionKey` so decisions remain deterministic when one blocker contains multiple actions:

- automatic retry: `automatic:<encodedBlockerId>:<opaqueActionId>`
- maintainer decision: `maintainer:<encodedBlockerId>:<opaqueActionId>`
- external prerequisite: `external:<encodedBlockerId>:<opaqueActionId>`

Maintainer/external actions receive content-stable opaque IDs rather than order-dependent ordinals. Resume commands receive stable `commandId` values. Decision input items reference exactly one source action or command ID. Duplicate, unknown, malformed, colliding, or contradictory inputs are rejected.

## Decision Contract

Each decision is one of `approve`, `reject`, `defer`, or `accept_risk` and records evidence plus reviewer role. Decision-specific rationale is required for reject, defer, and accept-risk outcomes. Allowed action decisions are preserved from source evidence; external prerequisite approval requires explicit completion evidence and cannot be waived through accept-risk. Every resume command requires a separate command-level decision. Missing decisions remain explicitly unreviewed and block readiness.

The receipt includes source provenance with a SHA-256 digest of the raw consumption report bytes, per-action review items, decision summary, approved/rejected/deferred/risk-accepted sets, reviewed resume commands, maintainer boundary, redaction boundary, non-authorization boundary, and blocked actions.

`resumeAttemptReadiness` may indicate that evidence is ready for a separate resume attempt, but the receipt never runs a command and is not itself execution authorization.

## Boundaries

- No recovery or resume command is executed.
- No target repo file, branch, commit, pull request, issue, or advisory is created or changed.
- No publication, GitHub release, public launch, customer contact, pricing/spend change, repository visibility change, or commercial/hosted availability claim is authorized.
- Source paths, evidence, rationale, commands, and errors remain redacted.

## Verification

Use Red-Green-Refactor with focused unit tests, CLI integration tests, the near-real campaign E2E chain, package/type/structure contracts, full testing pyramid, repository hygiene, release check, goal audit, independent review, PR CI, merge, and main CI.
