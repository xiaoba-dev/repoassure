# AI IDE Repair Patch Plan Real Campaign Validation v0.1

Status: completed
Date: 2026-07-16

## Goal

Validate that `repair:patch-plan` can consume a real or near-real `repair-execution-report.json` produced by `repair:execute --dry-run`, generate reviewable patch plan inputs, and preserve the no-write boundary for target repositories.

## Evidence

- Added near-real campaign coverage in `tests/unit/repair-patch-plan.test.ts`.
- The test runs `repair:handoff` against `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json`.
- The test runs `repair:execute` in `dry-run` mode.
- The test runs `repair:patch-plan` against the generated dry-run execution report.
- The generated `patch-plan.json` includes `patchPlanInputs`, `maintainerReview`, `verificationChecklist`, and `noWriteProof`.
- The generated `patch-plan.md` includes `Patch Plan Inputs`, `Maintainer Review Boundary`, `Verification Checklist`, and `No-write Proof` sections.
- Secret-like fixture values are redacted from JSON and Markdown output.
- The target fixture source file remains unchanged after patch-plan generation.

## Result

`repair:patch-plan` now supports two input modes:

- `validation-only` execution reports: classify failed verification output into reviewable patch actions.
- `dry-run` execution reports: convert `patchPreview.candidateTasks` into reviewable manual patch inputs without applying patches.

## Boundaries

- No automatic target repo write was authorized.
- No patch application was authorized.
- No commit, pull request, release, deployment, npm publication, repository visibility change, public launch, pricing change, or customer contact was authorized.
- Patch-plan output is evidence for maintainer review, not permission for an AI IDE to modify target repositories automatically.

## Verification

Local verification for this goal includes:

```text
pnpm vitest run tests/unit/repair-patch-plan.test.ts --testNamePattern "near-real patch plan"
pnpm vitest run tests/unit/repair-patch-plan.test.ts
pnpm vitest run tests/unit/repair-handoff.test.ts tests/unit/repair-execute.test.ts tests/unit/repair-patch-plan.test.ts
pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts
pnpm typecheck
pnpm lint
pnpm repo:hygiene
pnpm release:check
pnpm goal:audit
```

## Next Goal

AI IDE Repair Validation-Only Real Campaign Validation v0.1.

Plain-language explanation: the next automatic product-core goal should validate that `repair:execute --validation-only` can consume the same repair handoff package against a controlled near-real target repo, run verification commands safely, generate failed/passed evidence, and still avoid patch application or automatic target repo edits.
