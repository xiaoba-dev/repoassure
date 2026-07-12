# Blocked Goal Recovery Resume Attempt Closure Receipt v0.1 Design

## Purpose

Convert an accepted resume-attempt evidence review decision package into a local, auditable closure receipt without executing commands or changing external state.

## Inputs

- Exact bytes of `blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json`.
- `blocked-goal-recovery-resume-attempt-closure-input.json` containing the exact source SHA-256, closure evidence, reviewer role, and the complete acknowledged accepted-risk evidence-key set.

## State Contract

- `accepted` becomes `closed`.
- `accepted_with_risk` becomes `closed_with_accepted_risk` only when every accepted-risk key is acknowledged exactly.
- `changes_requested`, `deferred`, `blocked_or_incomplete`, and `blocked_by_boundary_violation` fail closed.
- Runtime validation recomputes review summaries, accepted/unresolved scopes, typed evidence keys, boundary state, and blocked actions before closure.

## Boundaries

The receipt records local closure evidence only. It does not execute recovery commands, close an external Goal, mutate a target repo, publish, launch, contact customers, change pricing/spend or repository visibility, or claim commercial/hosted availability.

