# Authorized Target Repo Repair Goal Task Package v0.1

Status: authorized_target_repo_repair_goal_task_package_implemented
Date: 2026-07-09

## Summary

RepoAssure now generates a local authorized target repo repair goal task package from a target repo repair goal authorization receipt:

```text
pnpm playbook:target-repair-goal -- --from-dir <dir>
```

The command reads `ai-ide-target-repo-repair-goal-authorization-receipt.json` and writes:

- `ai-ide-authorized-target-repo-repair-goal-task-package.json`
- `ai-ide-authorized-target-repo-repair-goal-task-package.md`

The output schema is:

```text
repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1
```

## Contract

The package includes:

- `taskPackageStatus`
- `sourceAuthorizationReceipt`
- `approvedRepairGoals`
- `excludedAuthorizationItems`
- `verificationChecklist`
- `maintainerReviewBoundary`
- `nonAuthorizationBoundary`
- `redactionBoundary`
- `blockedActions`

Only authorization receipt items with `authorizedForSeparateTargetRepoRepairGoal: true` become `approvedRepairGoals`. Rejected, deferred, and risk-accepted items become `excludedAuthorizationItems`.

## Implementation Notes

- Added `packages/acceptance/src/ai-ide-authorized-target-repo-repair-goal-task-package.ts`.
- Added `scripts/generate-ai-ide-authorized-target-repo-repair-goal-task-package.mjs`.
- Added `pnpm playbook:target-repair-goal`.
- Added `@hardening-mcp/acceptance/ai-ide-authorized-target-repo-repair-goal-task-package`.
- Extended the near-real E2E campaign chain through `playbook:target-repair-goal`.

## Verification

- Unit: `tests/unit/ai-ide-authorized-target-repo-repair-goal-task-package.test.ts`
- Integration: `tests/integration/playbook-target-repair-goal.test.ts`
- E2E: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Type smoke: `tests/type-smoke/acceptance-package-subpaths.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Record

- Red: added unit tests for `repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1`; test failed because the module did not exist.
- Green: implemented the task package builder, Markdown renderer, file writer, and directory discovery.
- Red: added CLI smoke for `pnpm playbook:target-repair-goal`; test failed because the script and command did not exist.
- Green: added the CLI script, package command, package export, compatibility contract entry, and type-smoke import.
- Red: extended the E2E campaign fixture through `playbook:target-repair-goal`; test failed because the command did not exist.
- Green: added E2E task package generation and artifact assertions.
- Red: added structure cascade test; test failed because ADR-0030 and operation docs did not exist.
- Green: added ADR, operation packet, and documentation cascade.

## Boundaries

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, advisory, or file mutation was created.
- No target repo patch was automatically applied.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public launch or production marketing announcement was executed.
- No customer contact was authorized.
- No pricing change or spend was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
