# AI IDE Handoff Material Quality Runtime v0.1

## Status

`ai_ide_handoff_material_quality_runtime_implemented`

Source backlog: Product Backlog Prioritization v0.1 / Priority 2.

Implementation status: `implemented_minimal_runtime`.

Launch authorization status: `not_authorized`.

## Decision

Implement a local-first AI IDE handoff package runtime for target repo acceptance runs.

Browser and Python/CLI user acceptance runs now write:

- `target-repo-feedback-summary.json`
- `ai-ide-handoff-package.json`
- manifest backlink `artifacts.aiIdeHandoffPackagePath`
- acceptance check `ai-ide-handoff-package.json 已生成`

The handoff package schema is `repoassure.ai-ide-handoff-package.v1`.

## Runtime Contract

`ai-ide-handoff-package.json` includes:

- `schemaVersion`
- `generatedAt`
- `mode`
- `runStatus`
- `recommendedReadingOrder`
- `artifactInventory`
- `priorityActions`
- `consumptionGuidance`
- `qualityGates`
- `redactionBoundary`
- `sourceSummary`

The package is designed to be the first machine-readable index an AI IDE or maintainer reads after an acceptance run.

## Reading Order

The runtime recommends this order when artifacts exist:

1. `target-repo-feedback-summary.json`
2. `hardening-report.md`
3. `repair-task-package.md` or `repair-task-package.json`
4. `repair-plan.md` or `repair-plan.json`
5. `patch.diff`
6. generated tests
7. browser artifacts

This order is advisory. Maintainers still decide whether to apply any repair, patch, or generated test.

## Quality Boundary

The package is local-only and uses relative artifact links.

It must not upload target repo source, logs, screenshots, traces, generated tests, findings, repair material, or private artifacts.

It must not store secrets, raw private repo content, OTP, cookie, Access token, login query-state, reviewer credentials, env values, raw private source, or absolute workstation paths.

## Implementation

- Runtime module: `packages/acceptance/src/ai-ide-handoff-package.ts`
- Browser runner integration: `packages/acceptance/src/run-user-acceptance.ts`
- Python/CLI runner integration: `packages/acceptance/src/run-user-acceptance.ts`
- Package export: `@hardening-mcp/acceptance/ai-ide-handoff-package`
- Unit tests: `tests/unit/ai-ide-handoff-package.test.ts`
- Runner integration tests: `tests/unit/user-acceptance.test.ts`
- Structure and cascade tests: `tests/unit/project-structure.test.ts`

## Verification

Expected verification commands:

```text
pnpm build
pnpm vitest run tests/unit/ai-ide-handoff-package.test.ts tests/unit/user-acceptance.test.ts tests/unit/project-structure.test.ts tests/unit/public-release-readiness.test.ts
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
- uploading target repo material to any hosted service
