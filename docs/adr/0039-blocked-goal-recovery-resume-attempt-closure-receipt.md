# ADR-0039: Blocked Goal Recovery Resume Attempt Closure Receipt

Status: Accepted
Date: 2026-07-13

## Context

ADR-0038 records explicit maintainer decisions over resume-attempt evidence, but an accepted review package is not a durable final closure record. A local consumer needs one exact-source-bound receipt that preserves accepted scope and residual risk without confusing evidence closure with an external Goal state transition.

## Decision

Add `repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1` and `pnpm --silent goal:recover:close-resume-attempt`.

The workflow reads the exact task package, execution evidence intake, evidence review decision package, and a closure input bound to the review package raw-byte SHA-256. It revalidates the task-to-intake SHA and inventory binding, then the intake-to-review SHA and evidence-field binding. Only `accepted` and `accepted_with_risk` may close. Accepted-risk closure requires exact acknowledgement of every risk evidence key. Runtime validation recomputes source summaries, scopes, typed evidence keys, boundary state, and blocked actions before emitting JSON/Markdown.

## Consequences

The receipt makes local closure auditable and carries residual risks explicitly. It does not execute commands, close an external goal, mutate a target repo, or authorize release, launch, customer contact, pricing/spend, visibility, or commercial/hosted availability claims.
