# Blocked Goal Recovery Decision Receipt v0.1

Status: Implemented

## Inputs

- `blocked-goal-recovery-consumption-report.json`
- `blocked-goal-recovery-decisions.json`

Decision file example:

```json
{
  "decisions": [
    {
      "actionKey": "automatic:B1-test:A1-rerun",
      "decision": "approve",
      "evidence": "Retry command and evidence were reviewed.",
      "reviewerRole": "maintainer"
    }
  ]
}
```

`reject`, `defer`, and `accept_risk` decisions also require a non-empty `rationale`.

## Command

```bash
pnpm --silent goal:recover:decide -- --from-dir <dir>
```

## Outputs

- `blocked-goal-recovery-decision-receipt.json`
- `blocked-goal-recovery-decision-receipt.md`
- schema: `repoassure.blocked-goal-recovery-decision-receipt.v1`

The receipt records raw-source SHA-256 provenance, per-action decisions, decision summary, separate-resume readiness, reviewed resume commands, and preserved blocked actions.

## Interpretation

- `approved_for_separate_resume_attempt` or `accepted_with_risk` means a later goal may prepare a separate resume attempt.
- `rejected`, `deferred`, `mixed_decisions`, or `blocked_or_incomplete` prevents that transition.
- The receipt does not execute a command and is not target-repo, release, launch, customer, pricing/spend, repository visibility, or commercial/hosted authorization.
