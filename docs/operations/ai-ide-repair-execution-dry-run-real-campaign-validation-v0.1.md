# AI IDE Repair Execution Dry-Run Real Campaign Validation v0.1

Status: completed
Date: 2026-07-16

## Summary

This execution goal validates that `repair:execute --dry-run` can consume a real or near-real AI IDE repair decision package and produce an execution report without modifying the target repository.

Fixture used:

- `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json`

The validation flow generates a repair handoff package, selects every queued `repairActionQueue` task, and runs `runRepairExecute` in dry-run mode.

## Validated Contract

The dry-run execution report now exposes:

- `executionPlan`,
- `patchPreview`,
- `maintainerReview`,
- `verificationChecklist`,
- `noWriteProof`,
- selected task execution status,
- redaction-safe JSON and Markdown output.

The report read order is:

1. `summary`
2. `executionPlan`
3. `patchPreview`
4. `tasks[]`
5. `tasks[].verificationCommands`
6. `maintainerReview`
7. `verificationChecklist`
8. `noWriteProof`

## No-write Boundary

No automatic target repo write was authorized.

The dry-run test verifies target source content and file mtime are unchanged after report generation. The only written files are local execution report artifacts under the configured output directory.

The dry-run report also records:

- `targetRepoWriteAuthorized: false`,
- `sourceFilesChanged: false`,
- prohibited actions inherited from the maintainer review boundary.

## TDD Evidence

Red:

- `pnpm vitest run tests/unit/repair-execute.test.ts --testNamePattern "dry-runs a near-real repair decision package"` failed because `executionPlan` was missing.

Green:

- `runRepairExecute` and `buildRepairExecutionReport` now emit the dry-run execution contract.
- The same focused test now passes.

## Verification

Commands run:

- `pnpm vitest run tests/unit/repair-execute.test.ts --testNamePattern "dry-runs a near-real repair decision package"`
- `pnpm vitest run tests/unit/repair-execute.test.ts`

## Boundaries

This goal did not:

- apply patches,
- change target repository source files,
- create branches, commits, issues, pull requests, or advisories,
- mark acceptance as passed,
- deploy,
- publish npm packages,
- create a GitHub release,
- change repository visibility,
- perform public launch or customer contact,
- perform website visual redesign.

## Next Goal

Recommended next goal:

`AI IDE Repair Patch Plan Real Campaign Validation v0.1`

That goal should validate that `repair:patch-plan` can consume the dry-run execution report and produce patch-plan inputs without applying patches or writing target repositories.
