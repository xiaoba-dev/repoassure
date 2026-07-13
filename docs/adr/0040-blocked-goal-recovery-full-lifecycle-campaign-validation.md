# ADR-0040: Blocked Goal Recovery Full Lifecycle Campaign Validation

Status: Accepted
Date: 2026-07-13

## Context

The recovery lifecycle has independently tested stages from blocker packaging through closure receipt. A single happy-path E2E does not prove outcome coverage or demonstrate that tampered chains are rejected consistently.

## Decision

Add `repoassure.blocked-goal-recovery-lifecycle-campaign-summary.v1` and `pnpm --silent goal:recover:validate-lifecycle`.

The validator reads local artifact directories rather than trusting self-reported status. It invokes the authoritative runtime validator for every present stage, checks cross-artifact inventory bindings, exact adjacent SHA-256 links, canonical blocked actions, secret-like evidence, command non-execution, external-state boundaries, and real-path containment. A passing campaign must cover `accepted`, `accepted_with_risk`, `blocked`, `failed`, `incomplete`, `environment_blocker`, `boundary_violation`, and `rejected_tampered`.

## Consequences

Maintainers receive one sanitized campaign summary with explicit outcome coverage and evidence hashes. `rejected_tampered` succeeds only when a contained artifact file was successfully opened/read and authoritative artifact validation rejects it; missing input, I/O errors, path escape, and expected-outcome mismatches do not count as tamper evidence. The validator does not execute commands or change external state.
