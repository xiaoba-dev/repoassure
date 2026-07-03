# Repair Task Actionability Runtime v0.1

## Status

`repair_task_actionability_runtime_implemented`

Source backlog: Product Backlog Prioritization v0.1 / Priority 3.

Implementation status: `implemented_minimal_runtime`.

Launch authorization status: `not_authorized`.

## Decision

Implement a local-first repair task actionability runtime for generated repair material.

`repair-task-package.json` and `repair-handoff-package.json` now include task-level `actionability` metadata so an AI IDE or maintainer can understand what is safe to run, what requires review, and what must not be auto-applied.

## Runtime Contract

Each task actionability block includes:

- `dependencies`
- `suggestedVerificationCommands`
- `patchApplicabilityEvidence`
- `aiIdeExecutionPrompt`
- `manualReviewBoundary`
- `riskNotes`
- `noAutoApplyBoundary`

The contract is advisory. It improves task execution quality and reviewability, but it does not authorize automatic code changes.

## Actionability Boundary

The runtime records:

- verification commands that should be run after a repair
- source evidence and target areas used to judge patch applicability
- maintainer review requirements
- risk notes for stale evidence, environment blockers, or user-visible behavior changes
- explicit no-auto-apply boundary

Do not auto-apply generated patches.

Do not edit target repository files without explicit maintainer approval.

Do not weaken tests, acceptance checks, or security evidence to make a task pass.

## Implementation

- Repair task package generation: `packages/repair-planner/src/generate-repair-plan.ts`
- Repair task package types: `packages/repair-planner/src/repair-plan.ts`
- Repair handoff package generation: `packages/acceptance/src/run-repair-handoff.ts`
- Compatibility type wrapper: `src/types/repair-plan.ts`
- Unit tests: `tests/unit/repair-plan.test.ts`
- Repair handoff tests: `tests/unit/repair-handoff.test.ts`
- Structure and cascade tests: `tests/unit/project-structure.test.ts`

## Verification

Expected verification commands:

```text
pnpm build:packages
pnpm vitest run tests/unit/repair-plan.test.ts tests/unit/repair-handoff.test.ts tests/unit/project-structure.test.ts
pnpm typecheck
pnpm lint
pnpm test
```

## Non-Authorization Boundary

This runtime does not authorize:

- npm publication
- GitHub release
- public launch
- production marketing announcement
- customer contact
- pricing change or spend
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims
- auto-applying patches
- editing target repository files without explicit maintainer approval
- creating branches, commits, issues, pull requests, or advisories without explicit maintainer approval
