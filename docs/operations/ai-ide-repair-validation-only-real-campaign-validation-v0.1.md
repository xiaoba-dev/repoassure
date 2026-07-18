# AI IDE Repair Validation-Only Real Campaign Validation v0.1

Status: completed
Date: 2026-07-16

## Goal

Validate that `repair:execute --validation-only` can consume a real or near-real repair handoff package against a controlled target repo, run bounded verification commands, and produce actionable passed / failed / skipped evidence without applying patches or automatically changing target repository files.

## Evidence

- Added near-real validation-only coverage in `tests/unit/repair-execute.test.ts`.
- The test consumes `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json` through `repair:handoff`.
- The test runs `repair:execute --validation-only` with a controlled fake `pnpm` command inside a temporary target repo.
- Runnable verification commands produce one `passed` task and one `failed` task.
- Placeholder commands such as `pnpm user:accept -- --repo <repo> --decision pending` are not executed and are recorded as `skipped`.
- Secret-like fixture values are redacted from JSON and Markdown output.
- The target fixture source file remains unchanged after validation-only execution.

## Result

Validation-only execution now distinguishes:

- `passed`: runnable verification command exits zero.
- `failed`: runnable verification command exits non-zero or times out.
- `skipped`: no runnable local verification command exists because the command contains placeholders or requires manual environment context.

This gives AI IDEs and maintainers a clearer report: command evidence can drive patch planning, while placeholder/manual checks remain explicit review items instead of false failures.

## Boundaries

- No automatic target repo write was authorized.
- No patch application was authorized.
- No commit, pull request, release, deployment, npm publication, repository visibility change, public launch, pricing change, or customer contact was authorized.
- Validation-only output is evidence for maintainer review and patch planning, not permission for an AI IDE to modify target repositories automatically.

## Verification

Local verification for this goal includes:

```text
pnpm vitest run tests/unit/repair-execute.test.ts --testNamePattern "validation-only near-real campaign"
pnpm vitest run tests/unit/repair-execute.test.ts
pnpm vitest run tests/unit/repair-handoff.test.ts tests/unit/repair-execute.test.ts tests/unit/repair-patch-plan.test.ts
pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts
pnpm typecheck
pnpm lint
pnpm repo:hygiene
pnpm release:check
pnpm goal:audit
```

## Next Goal

AI IDE Repair End-to-End Evidence Package Validation v0.1.

Plain-language explanation: the next automatic product-core goal should validate the complete evidence package that a maintainer or AI IDE would consume: repair handoff package, dry-run execution report, validation-only execution report, patch plan, and no-write proof.
