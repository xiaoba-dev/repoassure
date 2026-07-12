# ADR-0036: Blocked Goal Recovery Resume Attempt Task Package

Status: Accepted
Date: 2026-07-13

## Context

ADR-0035 records maintainer decisions but intentionally does not translate them into an execution queue. A later resume attempt needs a deterministic package that carries only approved or explicitly risk-accepted scope, preserves exact receipt provenance, and remains non-executing.

## Decision

Adopt Blocked Goal Recovery Resume Attempt Task Package v0.1.

- `pnpm --silent goal:recover:prepare-resume -- --from-dir <dir>` reads the decision receipt and writes local JSON/Markdown task artifacts.
- The package hashes the exact receipt bytes and validates the full receipt, canonical decision summaries, classified action arrays, command decisions, readiness, and blocked-action boundary.
- A separate task-input envelope must provide the SHA-256 of the exact receipt reviewed; stale or modified receipt bytes fail closed.
- Only `approve` and `accept_risk` action and command decisions enter the task scope.
- Rejected, deferred, mixed, incomplete, missing-command, unreviewed, malformed, or boundary-invalid receipts emit a blocked package with empty action and command queues.
- Action and command tasks retain source evidence, stable IDs, order, and `separate_reviewed_attempt` execution mode.
- Every command remains `executed: false`; generation never invokes a recovery command.

## Consequences

An AI IDE can consume a bounded queue without inferring authorization from chat or status text. Actual resume execution and its evidence remain a separate goal and review boundary.

The package does not mutate target repos, publish, launch, contact customers, change pricing/spend or repository visibility, or authorize commercial/hosted availability claims.
