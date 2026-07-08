# Target Repo Repair Goal Authorization Receipt v0.1

Status: target_repo_repair_goal_authorization_receipt_implemented
Date: 2026-07-08

## Summary

RepoAssure now generates a local target repo repair goal authorization receipt from a proposal package and maintainer decision input:

```text
pnpm playbook:authorize -- --from-dir <dir> --decisions <authorization-decisions.json>
```

The command reads `ai-ide-target-repo-repair-goal-proposal-package.json` and writes:

- `ai-ide-target-repo-repair-goal-authorization-receipt.json`
- `ai-ide-target-repo-repair-goal-authorization-receipt.md`

The output schema is:

```text
repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1
```

## Contract

The receipt includes:

- `authorizationStatus`
- `sourceProposalPackage`
- `decisionSummary`
- `authorizationItems`
- `approvedScope`
- `rejectedItems`
- `deferredItems`
- `riskAcceptedItems`
- `verificationRequirements`
- `maintainerApprovalBoundary`
- `nonAuthorizationBoundary`
- `redactionBoundary`
- `blockedActions`

Supported maintainer decision values are:

- `approve`
- `reject`
- `defer`
- `accept_risk`

Only approved proposal scopes that match the allowed repair scope and a ready proposal can be marked `authorizedForSeparateTargetRepoRepairGoal`. The receipt still does not execute target repo work.

## Implementation Notes

- Added `packages/acceptance/src/ai-ide-target-repo-repair-goal-authorization-receipt.ts`.
- Added `scripts/generate-ai-ide-target-repo-repair-goal-authorization-receipt.mjs`.
- Added `pnpm playbook:authorize`.
- Added `@hardening-mcp/acceptance/ai-ide-target-repo-repair-goal-authorization-receipt`.
- Extended the near-real E2E campaign chain through `playbook:authorize`.

## Verification

- Unit: `tests/unit/ai-ide-target-repo-repair-goal-authorization-receipt.test.ts`
- Integration: `tests/integration/playbook-authorization.test.ts`
- E2E: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Type smoke: `tests/type-smoke/acceptance-package-subpaths.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Record

- Red: added unit tests for `repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1`; test failed because the module did not exist.
- Green: implemented the authorization receipt builder, Markdown renderer, file writer, and directory discovery.
- Red: added CLI smoke for `pnpm playbook:authorize`; test failed because the script and command did not exist.
- Green: added the CLI script, package command, package export, compatibility contract entry, and type-smoke import.
- Red: extended the E2E campaign fixture through `playbook:authorize`; test failed because the command did not exist.
- Green: added E2E authorization receipt generation and artifact assertions.
- Red: added structure cascade test; test failed because ADR-0029 and operation docs did not exist.
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
