# Blocked Goal Recovery Consumption Validation v0.1

Status: blocked_goal_recovery_consumption_implemented
Date: 2026-07-13

## Summary

RepoAssure can now consume a local blocked-goal recovery package as a bounded AI IDE and maintainer review report:

```bash
pnpm goal:recover:consume -- --from-dir <dir>
```

The command reads `blocked-goal-recovery-package.json` and writes `blocked-goal-recovery-consumption-report.json` / `.md` using schema `repoassure.blocked-goal-recovery-consumption-report.v1`.

## Consumption Contract

The report contains source package SHA-256 provenance, resume readiness, evidence read order, automatic retry / maintainer decision / external prerequisite action items, a resume checklist, boundary compliance, and inherited review, redaction, non-authorization, and blocked-action boundaries.

| Recovery package status | Consumption readiness |
| --- | --- |
| `ready_to_resume` | `ready_to_resume_after_review` |
| `retryable_with_automatic_actions` | `automatic_retry_candidates_available` |
| `requires_maintainer_or_external_action` | `waiting_for_maintainer_or_external_action` |

Readiness is review evidence, not automatic resume authorization.

## Boundaries

- The report does not execute recovery commands.
- Automatic retry candidates require review before execution.
- Maintainer decisions and external prerequisites must be resolved before resume.
- No target repo branch, commit, pull request, issue, advisory, or file mutation is created.
- No npm publication, GitHub release, public launch, customer contact, pricing/spend change, or commercial/hosted availability claim is authorized.

## Testing

- Unit: `tests/unit/blocked-goal-recovery-consumption-report.test.ts`
- Integration: `tests/integration/goal-recover-consume.test.ts`
- E2E: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Type smoke: `tests/type-smoke/acceptance-package-subpaths.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

The E2E campaign builds the acceptance package once and then runs each Node script directly. This preserves every artifact assertion while avoiding repeated compilation at each stage.
