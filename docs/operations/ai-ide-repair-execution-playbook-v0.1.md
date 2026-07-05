# AI IDE Repair Execution Playbook v0.1

Status: ai_ide_repair_execution_playbook_runtime_implemented

## Summary

This operation implements a local-first AI IDE repair execution playbook that turns the campaign-level `prioritizedActionQueue` into ordered, reviewable repair guidance for maintainers and AI IDEs.

The runtime writes:

- `ai-ide-repair-playbook.json`
- `ai-ide-repair-playbook.md`

Schema: `repoassure.ai-ide-repair-execution-playbook.v1`

Generation command:

```bash
pnpm playbook:generate -- --campaign-summary <campaign-summary.json> --output <dir>
```

Implementation entrypoints:

- `packages/acceptance/src/ai-ide-repair-playbook.ts`
- `@hardening-mcp/acceptance/ai-ide-repair-playbook`
- `scripts/generate-ai-ide-repair-playbook.mjs`

## Input Contract

The playbook consumes `repoassure.validation-campaign-summary.v1`, especially:

- `prioritizedActionQueue`
- `targets[].evidence.targetRepoFeedbackSummary`
- `targets[].evidence.aiIdeHandoffPackage`
- `targets[].evidence.repairTaskPackage`
- `targets[].evidence.userValidationEvidenceLoop`

For each queued action, the generated execution plan links the local evidence chain:

1. `target-repo-feedback-summary.json`
2. `ai-ide-handoff-package.json`
3. `repair-task-package.json`
4. `user-validation-evidence-loop.json`

## Runtime Behavior

The runtime is intentionally narrow:

- It reads a local campaign summary.
- It writes local JSON and Markdown playbook artifacts.
- It preserves artifact file names while redacting sensitive path segments.
- It records `maintainerReviewBoundary` and `nonAuthorizationBoundary` on every execution step.
- It includes execution guardrails that prohibit automatic target repo mutations.

## Non-Authorization Boundary

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, or advisory was created.
- No target repo patch was automatically applied.
- No npm publication was executed.
- No GitHub release was executed.
- No public launch or production marketing announcement was executed.
- No customer contact, pricing/spend change, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.

## Verification

TDD and pyramid verification:

- Red: `pnpm vitest run tests/unit/ai-ide-repair-playbook.test.ts` failed because `packages/acceptance/src/ai-ide-repair-playbook.ts` did not exist.
- Green: implemented the playbook builder, Markdown formatter, writer, package export, and CLI script.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "AI IDE repair execution playbook"` failed because this operation document did not exist.
- Green: added this operation packet and cascaded the runtime into README, testing strategy, acceptance checklist, decision log, and dev log.

Required quality gates for the implementation goal:

```bash
pnpm vitest run tests/unit/ai-ide-repair-playbook.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "AI IDE repair execution playbook"
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm repo:hygiene
pnpm release:check
pnpm goal:audit
```
