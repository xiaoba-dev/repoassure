# AI IDE Repair Decision Package v0.1

Status: ai_ide_repair_decision_package_implemented

## Summary

This operation adds a local maintainer decision package generated from `ai-ide-playbook-consumption-report.json`.

The command writes:

- `ai-ide-repair-decision-package.json`
- `ai-ide-repair-decision-package.md`

The report schema is:

- `repoassure.ai-ide-repair-decision-package.v1`

The goal is to separate AI IDE understanding from maintainer approval. The decision package tells the maintainer which tasks are repair candidates, which tasks are environment prerequisites, which tasks should go back to the RepoAssure product backlog, and which targets require no action.

## Runtime Changes

The decision package includes:

- `decisionSummary`
- `decisionItems`
- `targetReviewSummary`
- `maintainerDecisionChecklist`
- inherited blocked actions from the dry-run consumption report

Decision item types:

- `manual_repair_candidate`
- `environment_prerequisite`
- `repoassure_product_improvement`
- `deferred_or_blocked`

## CLI Smoke

The new local entry point is:

```bash
pnpm playbook:decide -- --consumption-report <ai-ide-playbook-consumption-report.json> --output <dir>
```

Primary smoke test:

- `tests/integration/playbook-decide.test.ts`

## Verification

TDD and pyramid verification:

- Red: `pnpm vitest run tests/unit/ai-ide-repair-decision-package.test.ts` failed because `packages/acceptance/src/ai-ide-repair-decision-package.ts` was missing.
- Green: added decision package builder, Markdown renderer, writer, package export, and type-smoke coverage.
- Red: `pnpm vitest run tests/integration/playbook-decide.test.ts` failed because `pnpm playbook:decide` did not exist.
- Green: added `scripts/generate-ai-ide-repair-decision-package.mjs` and `playbook:decide`.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "AI IDE repair decision package"` failed because this operation document did not exist.
- Green: this operation packet and cascade docs record the validation boundary.

Required gates:

```bash
pnpm vitest run tests/unit/ai-ide-repair-decision-package.test.ts
pnpm vitest run tests/integration/playbook-decide.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "AI IDE repair decision package"
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
