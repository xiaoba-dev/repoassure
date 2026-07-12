# Blocked Goal Recovery Resume Attempt Closure Receipt v0.1

Status: Implemented

## Inputs

- `blocked-goal-recovery-resume-attempt-evidence-review-decision-package.json`
- `blocked-goal-recovery-resume-attempt-execution-evidence-intake.json`
- `blocked-goal-recovery-resume-attempt-task-package.json`
- `blocked-goal-recovery-resume-attempt-closure-input.json`

The closure input contains `sourceEvidenceReviewPackageSha256`, canonical closure evidence, reviewer role, and the exact ordered `acknowledgedRiskEvidenceKeys` set.

## Command

```bash
pnpm --silent goal:recover:close-resume-attempt -- --from-dir <dir>
```

## Outputs

- `blocked-goal-recovery-resume-attempt-closure-receipt.json`
- `blocked-goal-recovery-resume-attempt-closure-receipt.md`
- schema: `repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1`

The workflow revalidates the complete task -> intake -> review trust chain. Only accepted or accepted-with-risk review packages are eligible. The receipt does not execute commands or close an external goal.
