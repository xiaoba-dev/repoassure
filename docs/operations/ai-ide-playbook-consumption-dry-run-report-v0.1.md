# AI IDE Playbook Consumption Dry-Run Report v0.1

Status: ai_ide_playbook_consumption_dry_run_report_implemented

## Summary

This operation adds a local dry-run consumer for `ai-ide-repair-playbook.json`.

The consumer generates:

- `ai-ide-playbook-consumption-report.json`
- `ai-ide-playbook-consumption-report.md`

The report schema is:

- `repoassure.ai-ide-playbook-consumption-report.v1`

The goal is to verify that an AI IDE can read a repair playbook and produce a reviewable understanding report before any target repo repair work starts.

## Runtime Changes

The dry-run report includes:

- `campaignUnderstanding`: summarizes target status, passed / blocked / failed counts, and per-target recommended handling.
- `repairTaskUnderstanding`: records action ids, target ids, target statuses, read-order artifact kinds, verification checklist, and maintainer review requirement.
- `readOrderCompliance`: confirms each execution step has read order, verification checklist, and maintainer review boundary.
- `dryRunDecision.blockedActions`: explicitly blocks target repo mutation, branch / commit / pull request / issue / advisory creation, publication, launch, customer contact, and commercial availability claims.

This creates a local evidence layer between "playbook generated" and "maintainer approves target repo repair".

## CLI Smoke

The new local entry point is:

```bash
pnpm playbook:consume -- --playbook <ai-ide-repair-playbook.json> --output <dir>
```

It writes both JSON and Markdown reports to the selected local output directory.

Primary smoke test:

- `tests/integration/playbook-consume.test.ts`

## Verification

TDD and pyramid verification:

- Red: `pnpm vitest run tests/unit/ai-ide-playbook-consumption-report.test.ts` failed because the consumption report module was missing.
- Green: added `packages/acceptance/src/ai-ide-playbook-consumption-report.ts`, JSON builder, Markdown renderer, writer, package export, and type-smoke coverage.
- Red: `pnpm vitest run tests/integration/playbook-consume.test.ts` failed because `pnpm playbook:consume` did not exist.
- Green: added `scripts/generate-ai-ide-playbook-consumption-report.mjs` and `playbook:consume`.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "playbook consumption dry-run report"` failed because this operation document did not exist.
- Green: this operation packet and cascade docs record the validation boundary.

Required gates:

```bash
pnpm vitest run tests/unit/ai-ide-playbook-consumption-report.test.ts
pnpm vitest run tests/integration/playbook-consume.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "playbook consumption dry-run report"
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
