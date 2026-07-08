# Target Repo Repair Goal Execution Evidence Intake v0.1

Status: target_repo_repair_goal_execution_evidence_intake_implemented
Date: 2026-07-09

## Summary

RepoAssure now imports local execution evidence from a separately authorized target repo repair goal:

```text
pnpm playbook:target-repair-evidence -- --from-dir <dir>
```

The command reads:

- `ai-ide-authorized-target-repo-repair-goal-task-package.json`
- `target-repo-repair-goal-execution-evidence-input.json`

It writes:

- `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json`
- `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md`

The output schema is:

```text
repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1
```

## Contract

The report includes:

- `intakeStatus`
- `sourceTaskPackage`
- `executionSummary`
- `goalReports`
- `boundaryReport`
- `reviewChecklist`
- `maintainerReviewBoundary`
- `nonAuthorizationBoundary`
- `redactionBoundary`
- `blockedActions`

`intakeStatus` is `ready_for_maintainer_review` only when every approved repair goal is verified and no boundary violation is reported. Missing, blocked, or failed evidence becomes `blocked_or_incomplete`. Unauthorized actions become `boundary_violation_detected`.

## Implementation Notes

- Added `packages/acceptance/src/ai-ide-target-repo-repair-goal-execution-evidence-intake-report.ts`.
- Added `scripts/generate-ai-ide-target-repo-repair-goal-execution-evidence-intake-report.mjs`.
- Added `pnpm playbook:target-repair-evidence`.
- Added `@hardening-mcp/acceptance/ai-ide-target-repo-repair-goal-execution-evidence-intake-report`.
- Extended the near-real E2E campaign chain through target repair goal execution evidence intake.

## Verification

- Unit: `tests/unit/ai-ide-target-repo-repair-goal-execution-evidence-intake-report.test.ts`
- Integration: `tests/integration/playbook-target-repair-evidence.test.ts`
- E2E: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Type smoke: `tests/type-smoke/acceptance-package-subpaths.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Record

- Red: added unit tests for `repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1`; test failed because the module did not exist.
- Green: implemented the intake report builder, Markdown renderer, file writer, and directory discovery.
- Red: added CLI smoke for `pnpm playbook:target-repair-evidence`; test failed because the script and command did not exist.
- Green: added the CLI script, package command, package export, compatibility contract entry, and type-smoke import.
- Red: extended the E2E campaign fixture through `playbook:target-repair-evidence`; test failed on artifact ordering after the command generated outputs.
- Green: corrected sorted artifact expectations.
- Red: added structure cascade test; test failed because ADR-0031 and operation docs did not exist.
- Green: added ADR, operation packet, and documentation cascade.

## Boundaries

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, advisory, or file mutation was created by RepoAssure.
- No target repo patch was automatically applied by RepoAssure.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public launch or production marketing announcement was executed.
- No customer contact was authorized.
- No pricing change or spend was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
