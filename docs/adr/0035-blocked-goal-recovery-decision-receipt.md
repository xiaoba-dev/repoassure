# ADR-0035: Blocked Goal Recovery Decision Receipt

Status: Accepted
Date: 2026-07-13

## Context

The recovery consumption report provides an evidence read order, stable action queue, and reviewed resume commands, but it does not prove that a maintainer decided each recovery action. A later resume attempt needs deterministic, local evidence instead of relying on chat context.

## Decision

Adopt Blocked Goal Recovery Decision Receipt v0.1.

- Every recovery action has a stable opaque `actionKey`, and every resume command has a stable `commandId`; neither identity depends on queue order.
- `pnpm --silent goal:recover:decide -- --from-dir <dir>` reads the consumption report and explicit maintainer decisions.
- Supported decisions are `approve`, `reject`, `defer`, and `accept_risk`.
- Missing decisions remain unreviewed; duplicate or unknown action keys are rejected.
- Source allowed decisions are enforced. External prerequisite approval requires explicit completion evidence and cannot be waived with accept-risk.
- Resume commands require separate command-level decisions.
- The receipt hashes the raw source report bytes and derives decision status and separate-resume readiness from reviewed evidence.
- The decisions envelope must declare the same raw report SHA-256, preventing stale decisions from approving modified action or command content.
- A ready receipt is evidence for a later, separate resume attempt. It does not execute any resume command.

## Consequences

The AI IDE repair pipeline gains an auditable decision gate before a separate recovery attempt. The next task package can consume the receipt without guessing which actions were reviewed.

The receipt does not execute recovery commands, mutate target repos, publish, launch, contact customers, change pricing/spend, change repository visibility, or authorize commercial/hosted availability claims.
