# Blocked Goal Recovery Resume Attempt Task Package v0.1

Status: Implemented

## Input

- `blocked-goal-recovery-decision-receipt.json`
- The receipt must be internally canonical and ready for a separate resume attempt.

## Command

```bash
pnpm --silent goal:recover:prepare-resume -- --from-dir <dir>
```

Explicit paths are also supported:

```bash
pnpm --silent goal:recover:prepare-resume -- --receipt <path> --output <dir>
```

## Outputs

- `blocked-goal-recovery-resume-attempt-task-package.json`
- `blocked-goal-recovery-resume-attempt-task-package.md`
- schema: `repoassure.blocked-goal-recovery-resume-attempt-task-package.v1`

The package contains exact source receipt SHA-256 provenance, readiness or blocked reasons, ordered action tasks, ordered resume command tasks, prerequisites, a verification checklist, excluded items, and preserved boundaries.

## Interpretation

- `ready_for_separate_resume_attempt` means all scope is approved.
- `ready_with_accepted_risk` means all scope is approved or explicitly risk-accepted.
- `blocked_by_decision_receipt` means no action or command scope may be consumed from the package.
- `commandsExecuted` and every command task's `executed` field remain `false`.

This command generates evidence only. It does not execute a resume command and is not authorization for target repo mutation, release, launch, customer contact, pricing/spend, repository visibility, or commercial/hosted availability.
