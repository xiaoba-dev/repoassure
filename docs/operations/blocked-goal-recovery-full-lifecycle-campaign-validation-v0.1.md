# Blocked Goal Recovery Full Lifecycle Real Campaign Validation v0.1

Status: Implemented

## Input

`blocked-goal-recovery-lifecycle-campaign-input.json` uses schema `repoassure.blocked-goal-recovery-lifecycle-campaign-input.v1`. Each scenario declares a stable ID, expected outcome, and local relative artifact directory.

## Command

```bash
pnpm --silent goal:recover:validate-lifecycle -- --from-dir <campaign-dir>
```

## Outputs

- `blocked-goal-recovery-lifecycle-campaign-summary.json`
- `blocked-goal-recovery-lifecycle-campaign-summary.md`
- schema: `repoassure.blocked-goal-recovery-lifecycle-campaign-summary.v1`

The summary requires all eight outcomes: `accepted`, `accepted_with_risk`, `blocked`, `failed`, `incomplete`, `environment_blocker`, `boundary_violation`, and `rejected_tampered`. It validates each stage with its authoritative runtime contract, verifies cross-stage SHA and evidence bindings, rejects real-path escape and secret-like evidence, and does not execute recovery commands or change external state.

`rejected_tampered` passes only after a contained artifact file was successfully opened/read and artifact validation failed. Missing directories, filesystem failures, path escape, and a valid chain carrying the wrong expected label fail the campaign.
