# Target Repo Repair Goal Proposal Package v0.1

Status: target_repo_repair_goal_proposal_package_implemented
Date: 2026-07-08

## Summary

RepoAssure now generates a local target repo repair goal proposal package from replay readiness evidence:

```text
pnpm playbook:proposal -- --from-dir <dir>
```

The command reads `ai-ide-repair-execution-replay-readiness.json` and writes:

- `ai-ide-target-repo-repair-goal-proposal-package.json`
- `ai-ide-target-repo-repair-goal-proposal-package.md`

The output schema is:

```text
repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1
```

## Contract

The package includes:

- `proposalReadiness`
- `sourceReplayReadiness`
- `prerequisites`
- `artifactReadOrder`
- `allowedRepairScope`
- `repairTaskBreakdown`
- `verificationCommands`
- `maintainerApprovalBoundary`
- `nonAuthorizationBoundary`
- `redactionBoundary`
- `blockedActions`

For a complete replay readiness report, `proposalReadiness` is `ready_for_maintainer_goal_authorization`. The package still requires separate maintainer approval before any target repo repair work.

## Implementation Notes

- Added `packages/acceptance/src/ai-ide-target-repo-repair-goal-proposal-package.ts`.
- Added `scripts/generate-ai-ide-target-repo-repair-goal-proposal-package.mjs`.
- Added `pnpm playbook:proposal`.
- Added `@hardening-mcp/acceptance/ai-ide-target-repo-repair-goal-proposal-package`.
- Extended the near-real E2E campaign chain through `playbook:proposal`.

## Verification

- Unit: `tests/unit/ai-ide-target-repo-repair-goal-proposal-package.test.ts`
- Integration: `tests/integration/playbook-proposal.test.ts`
- E2E: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Type smoke: `tests/type-smoke/acceptance-package-subpaths.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Record

- Red: added unit tests for `repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1`; test failed because the module did not exist.
- Green: implemented the proposal package builder, Markdown renderer, file writer, and directory discovery.
- Red: added CLI smoke for `pnpm playbook:proposal`; test failed because the script and command did not exist.
- Green: added the CLI script, package command, package export, compatibility contract entry, and type-smoke import.
- Red: extended the E2E campaign fixture through `playbook:proposal`; test exposed the missing proposal artifact expectation in the canonical artifact list.
- Green: updated E2E artifact assertions.
- Red: added structure cascade test; test failed because ADR-0028 and operation docs did not exist.
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
