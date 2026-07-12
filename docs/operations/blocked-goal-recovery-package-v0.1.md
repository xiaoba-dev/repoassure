# Blocked Goal Recovery Package v0.1

Status: blocked_goal_recovery_package_implemented
Date: 2026-07-12

## Summary

RepoAssure now generates a local recovery package for blocked or incomplete goals:

```bash
pnpm goal:recover -- --from-dir <dir>
```

The command reads:

- `blocked-goal-recovery-input.json`

It writes:

- `blocked-goal-recovery-package.json`
- `blocked-goal-recovery-package.md`

Schema:

```text
repoassure.blocked-goal-recovery-package.v1
```

## Blocker Model

Supported categories:

- `environment`
- `external_service`
- `authorization_required`
- `maintainer_decision_required`
- `technical_unknown`
- `test_instability`
- `security_or_compliance`
- `product_scope`

Supported statuses:

- `blocked`
- `incomplete`
- `deferred`
- `retryable`

## Output Contract

The recovery package includes:

- source goal, audit, and log provenance.
- blocker summary.
- normalized blockers.
- attempted actions and evidence references.
- automatic recovery actions.
- maintainer decision requests.
- external prerequisites.
- resume commands.
- maintainer review boundary.
- redaction boundary.
- non-authorization boundary.
- blocked actions.

## Boundaries

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, advisory, or file mutation was created by RepoAssure.
- No npm publication or GitHub release was created.
- No public launch or production marketing announcement was executed.
- No customer contact, pricing/spend change, commercial availability claim, or hosted dashboard availability claim was made.

## Testing

- Unit: `tests/unit/blocked-goal-recovery-package.test.ts`
- Integration: `tests/integration/goal-recover.test.ts`
- E2E: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Type smoke: `tests/type-smoke/acceptance-package-subpaths.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Notes

- Red: added unit coverage for blocker categories, statuses, recovery actions, decision requests, prerequisites, resume commands, and boundaries; test failed because the module did not exist.
- Green: added package writer, Markdown renderer, CLI script, package exports, type smoke import, and integration coverage.
- E2E: extended the local campaign fixture through `goal:recover`.
