# AI IDE Repair End-to-End Evidence Package Validation v0.1

Status: completed
Date: 2026-07-16

## Goal

Validate that RepoAssure can aggregate the full AI IDE repair loop into one end-to-end evidence package for AI IDE and maintainer consumption:

- `repair-handoff-package.json`
- dry-run `repair-execution-report.json`
- validation-only `repair-execution-report.json`
- `patch-plan.json`
- no-write proof across the chain

## Evidence

- Added `packages/acceptance/src/run-repair-evidence-package.ts`.
- Added `pnpm repair:evidence-package`.
- Added `tests/unit/repair-evidence-package.test.ts`.
- The test consumes the existing near-real campaign fixture at `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json`.
- The test generates handoff, dry-run execution, validation-only execution, patch plan, and final evidence package artifacts in a temporary output directory.
- The generated `ai-ide-repair-evidence-package.json` contains:
  - `agentContract`
  - `artifactIndex`
  - `repairFlow`
  - `taskMatrix`
  - `maintainerReview`
  - `verificationChecklist`
  - `noWriteProof`
  - redaction boundary
- The Markdown package provides a maintainer-readable reading order and task matrix.
- Secret-like fixture values are redacted from JSON and Markdown output.
- The temporary target repo source file remains unchanged.

## Result

RepoAssure now has an explicit end-to-end repair evidence package. AI IDEs and maintainers no longer need to infer the repair loop from separate files only; they can start from `ai-ide-repair-evidence-package.json`, then follow the artifact index to the detailed handoff, execution reports, and patch plan.

## Boundaries

- No automatic target repo write was authorized.
- No patch application was authorized.
- No commit, issue, pull request, release, deployment, npm publication, repository visibility change, public launch, pricing change, customer contact, or website visual redesign was authorized.
- The evidence package is review evidence, not permission for an AI IDE to modify target repositories automatically.

## Verification

Local verification for this goal includes:

```text
pnpm vitest run tests/unit/repair-evidence-package.test.ts
pnpm vitest run tests/unit/repair-handoff.test.ts tests/unit/repair-execute.test.ts tests/unit/repair-patch-plan.test.ts tests/unit/repair-evidence-package.test.ts
pnpm vitest run tests/unit/project-structure.test.ts tests/unit/goal-audit.test.ts
pnpm typecheck
pnpm lint
pnpm repo:hygiene
pnpm release:check
pnpm goal:audit
```

## Next Goal

Project Intelligence Console Graph Snapshot Generator v0.1.

Plain-language explanation: the next automatic product-core goal should start the local-only Project Intelligence Console by generating JSON graph snapshots for docs, code ownership, and project progress. It should not build hosted dashboard, deploy, publish, or resume website visual redesign.
