# Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1 Design

## Goal

Record explicit maintainer decisions over every action, command, and verification result in a resume-attempt evidence intake without executing commands or authorizing unrelated work.

## Inputs

- `blocked-goal-recovery-resume-attempt-execution-evidence-intake.json`
- `blocked-goal-recovery-resume-attempt-evidence-review-decisions.json`
- The decision envelope binds to exact intake bytes with SHA-256.

## Decisions

Stable evidence keys are `action:<actionKey>`, `command:<commandId>`, and `verification:<checkId>`.

Supported decisions are `accept`, `changes_requested`, `defer`, and `accept_risk`. Missing decisions remain unreviewed. Boundary-violating intake cannot be accepted or risk-accepted. Plain acceptance requires passed source evidence. Non-accept decisions require rationale.

## Output

Schema: `repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1`.

Status precedence: boundary blocked, changes requested, deferred, incomplete, accepted with risk, accepted. The package records source provenance, per-item decisions, summary, accepted scope, unresolved items, maintainer review boundary, redaction boundary, non-authorization boundary, and blocked actions.

## Boundary

The package records review decisions only. It does not execute commands, mutate target repos, close a goal automatically, publish, launch, contact customers, change pricing/spend or visibility, or claim commercial/hosted availability.
