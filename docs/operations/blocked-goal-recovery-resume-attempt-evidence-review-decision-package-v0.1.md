# Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1

Status: Implemented

## Inputs

- `blocked-goal-recovery-resume-attempt-task-package.json`
- `blocked-goal-recovery-resume-attempt-execution-evidence-intake.json`
- `blocked-goal-recovery-resume-attempt-evidence-review-decisions.json`

The review revalidates the exact task package SHA-256 and its complete action, command, and verification inventory before reading decisions. The decision envelope includes `sourceEvidenceIntakeSha256` and per-item decisions keyed by `action:<id>`, `command:<id>`, or `verification:<id>`.

## Command

```bash
pnpm --silent goal:recover:review-resume-evidence -- --from-dir <dir>
```

## Outputs

- `blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json`
- `blocked-goal-recovery-resume-attempt-evidence-review-decision-package.md`
- schema: `repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1`

The package does not execute commands, close a goal, or authorize external actions.
