# AI IDE Approved Repair Execution Plan v0.1

Status: ai_ide_approved_repair_execution_plan_implemented

## Summary

This operation adds a local approved repair execution plan generated from `ai-ide-repair-approval-receipt.json`.

The command writes:

- `ai-ide-approved-repair-execution-plan.json`
- `ai-ide-approved-repair-execution-plan.md`

The report schema is:

- `repoassure.ai-ide-approved-repair-execution-plan.v1`

The goal is to convert maintainer approval receipt evidence into a narrow, AI IDE readable plan for separately authorized manual repair planning. The plan includes only approval receipt items where `approvalDecision` is `approve`, `decisionType` is `manual_repair_candidate`, and `approvedForManualRepairExecution` is `true`.

## Runtime Changes

The approved repair execution plan includes:

- `executionSummary`
- `approvedExecutionItems`
- `excludedApprovalItems`
- `executionChecklist`
- `rollbackAndReviewChecklist`
- inherited blocked actions from the approval receipt
- maintainer review boundary
- redaction boundary
- non-authorization boundary

Excluded approval items are retained as local evidence with `exclusionReason: not_approved_manual_repair_candidate`, so rejected, deferred, accepted-risk, pending, environment prerequisite, and RepoAssure product backlog items cannot be confused with executable target repo repair work.

## CLI Smoke

The new local entry point is:

```bash
pnpm playbook:plan-approved -- --approval-receipt <ai-ide-repair-approval-receipt.json> --output <dir>
```

Primary smoke test:

- `tests/integration/playbook-plan-approved.test.ts`

## Verification

TDD and pyramid verification:

- Red: `pnpm vitest run tests/unit/ai-ide-approved-repair-execution-plan.test.ts` failed because `packages/acceptance/src/ai-ide-approved-repair-execution-plan.ts` was missing.
- Green: added approved repair execution plan builder, Markdown renderer, writer, package export, and type-smoke coverage.
- Red: `pnpm vitest run tests/integration/playbook-plan-approved.test.ts` failed because `pnpm playbook:plan-approved` did not exist.
- Green: added `scripts/generate-ai-ide-approved-repair-execution-plan.mjs` and `playbook:plan-approved`.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "records AI IDE approved repair execution plan"` failed because this operation document did not exist.
- Green: this operation packet and cascade docs record the validation boundary.

Required gates:

```bash
pnpm vitest run tests/unit/ai-ide-approved-repair-execution-plan.test.ts
pnpm vitest run tests/integration/playbook-plan-approved.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "records AI IDE approved repair execution plan"
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test
pnpm repo:hygiene
pnpm release:check
pnpm goal:audit
```

## Non-Authorization Boundary

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, advisory, or file mutation was created.
- No target repo patch was automatically applied.
- No npm publication was executed.
- No GitHub release was executed.
- No public launch or production marketing announcement was executed.
- No customer contact, pricing/spend change, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.
