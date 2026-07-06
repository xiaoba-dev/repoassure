# AI IDE Repair Approval Receipt v0.1

Status: ai_ide_repair_approval_receipt_implemented

## Summary

This operation adds a local maintainer approval receipt generated from `ai-ide-repair-decision-package.json` and a local approval decisions file.

The command writes:

- `ai-ide-repair-approval-receipt.json`
- `ai-ide-repair-approval-receipt.md`

The report schema is:

- `repoassure.ai-ide-repair-approval-receipt.v1`

The goal is to turn maintainer review into durable local evidence before any separate repair execution starts. The receipt records whether each decision item is approved, rejected, deferred, accepted as risk, or still pending.

## Runtime Changes

The approval receipt includes:

- `receiptSummary`
- `approvalItems`
- `maintainerApprovalChecklist`
- inherited blocked actions from the decision package
- maintainer review boundary
- redaction boundary
- non-authorization boundary

Approval decisions:

- `approve`
- `reject`
- `defer`
- `accept_risk`
- `pending`

Only `approve` on a `manual_repair_candidate` marks an item as eligible for a later, separately authorized manual repair execution workflow. This receipt does not execute that workflow.

## CLI Smoke

The new local entry point is:

```bash
pnpm playbook:approve -- --decision-package <ai-ide-repair-decision-package.json> --approvals <approval-decisions.json> --output <dir>
```

Primary smoke test:

- `tests/integration/playbook-approve.test.ts`

## Verification

TDD and pyramid verification:

- Red: `pnpm vitest run tests/unit/ai-ide-repair-approval-receipt.test.ts` failed because `packages/acceptance/src/ai-ide-repair-approval-receipt.ts` was missing.
- Green: added approval receipt builder, Markdown renderer, writer, package export, and type-smoke coverage.
- Red: `pnpm vitest run tests/integration/playbook-approve.test.ts` failed because `pnpm playbook:approve` did not exist.
- Green: added `scripts/generate-ai-ide-repair-approval-receipt.mjs` and `playbook:approve`.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "AI IDE repair approval receipt"` failed because this operation document did not exist.
- Green: this operation packet and cascade docs record the validation boundary.

Required gates:

```bash
pnpm vitest run tests/unit/ai-ide-repair-approval-receipt.test.ts
pnpm vitest run tests/integration/playbook-approve.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "AI IDE repair approval receipt"
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
