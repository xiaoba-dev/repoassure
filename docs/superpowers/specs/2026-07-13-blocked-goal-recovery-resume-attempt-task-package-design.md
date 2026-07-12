# Blocked Goal Recovery Resume Attempt Task Package v0.1 Design

Status: Accepted for implementation
Date: 2026-07-13

## Problem

A recovery decision receipt proves which actions and resume commands were reviewed, but an AI IDE still needs a bounded task package describing exactly what may be attempted, in what order, and how to verify it. Passing raw receipt fields directly to an execution agent would invite guesswork and could blur the non-execution boundary.

## Decision

Add `pnpm --silent goal:recover:prepare-resume -- --from-dir <dir>`.

Input:

- `blocked-goal-recovery-decision-receipt.json`

Outputs:

- `blocked-goal-recovery-resume-attempt-task-package.json`
- `blocked-goal-recovery-resume-attempt-task-package.md`
- schema `repoassure.blocked-goal-recovery-resume-attempt-task-package.v1`

The task package binds to the exact raw receipt SHA-256 and derives its status from receipt decisions and boundary evidence. It emits ordered action tasks, command tasks, prerequisites, verification checklist, excluded items, and inherited blocked actions.

Only approved or explicitly risk-accepted items may enter the allowed task scope. Rejected, deferred, unreviewed, missing-command, mixed, or boundary-violating receipts produce a blocked package with no executable command scope.

## Boundary

The package does not run recovery or resume commands. It does not modify target repos, create branches/commits/PRs/issues/advisories, publish, release, launch, contact customers, change pricing/spend or repository visibility, or claim commercial/hosted availability.

## Verification

Use TDD, focused unit and CLI integration tests, near-real campaign E2E, package/type/structure contracts, full testing pyramid, repository gates, independent review, PR CI, merge, and main CI.
