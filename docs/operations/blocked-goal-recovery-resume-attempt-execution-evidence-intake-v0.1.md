# Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1

Status: Implemented

## Inputs

- `blocked-goal-recovery-resume-attempt-task-package.json`
- `blocked-goal-recovery-resume-attempt-execution-evidence-input.json`

The evidence input declares the exact source task package SHA-256, attempt metadata, action results, resume command results, verification results, boundary evidence, and redaction boundary.

## Command

```bash
pnpm --silent goal:recover:intake-resume-evidence -- --from-dir <dir>
```

## Outputs

- `blocked-goal-recovery-resume-attempt-execution-evidence-intake.json`
- `blocked-goal-recovery-resume-attempt-execution-evidence-intake.md`
- schema: `repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1`

Statuses are `complete_for_maintainer_review`, `failed_or_blocked`, `incomplete`, `boundary_violation`, and `source_not_ready`.

The intake does not execute commands and does not accept evidence. Acceptance requires a later Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1.
