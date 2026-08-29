# Product False-Positive Regression Catalog Consumption Validation v0.1

Status: completed
Conclusion: `consumption_validated_without_detection_behavior_change`
Date: 2026-07-22

## Scope

This goal validates that maintainers, Codex, and AI IDE workflows can consume the generated false-positive regression catalog artifacts in the documented order:

1. `artifacts/project-graph/false-positive-regression-catalog.json`
2. `artifacts/project-graph/false-positive-regression-catalog.md`

The validation is local-only and reads generated catalog artifacts. It writes validation artifacts only under `artifacts/project-graph/`.

## AI IDE Read Order

1. Read `artifacts/project-graph/false-positive-regression-catalog.json` first for schema, fixture categories, expected finding snapshots, review fields, verification checklist, and boundary flags.
2. Read `artifacts/project-graph/false-positive-regression-catalog.md` second for maintainer-facing context and review guidance.
3. Read `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json` and `.md` only as evidence that the catalog artifacts are consumable without changing detector behavior.

## Implemented Runner

- Source: `packages/acceptance/src/run-false-positive-catalog-consumption.ts`
- Package export: `@hardening-mcp/acceptance/run-false-positive-catalog-consumption`
- Root command: `pnpm false-positive:catalog:validate`
- Test: `tests/unit/false-positive-catalog-consumption.test.ts`

## Generated Artifacts

- `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json`
- `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.md`

The validation report checks schema, read order, Markdown readability, maintainer review boundary, fixture category coverage, expected snapshot fields, review fields, AI IDE verification checklist, no target repo write boundary, no runtime detection behavior change boundary, no suppression / automatic severity downgrade boundary, and redaction.

## Consumption Boundary

### Maintainer Review Boundary

Maintainers may:

- Review expected finding snapshots.
- Approve, reject, defer, or accept risk for fixture classifications.
- Use the validation report to decide whether catalog artifacts are ready for review.

AI IDEs may:

- Read JSON before Markdown.
- Summarize fixture categories, expected snapshots, and review fields.
- Propose maintainer review tasks.

AI IDEs and maintainers must not:

- Suppress findings.
- Downgrade severity automatically.
- Change runtime detector behavior.
- Write or mutate target repositories.
- Claim hosted dashboard, cloud sync, telemetry, deployment, publication, or public release availability.

## Test Evidence

- `pnpm vitest run tests/unit/false-positive-catalog-consumption.test.ts` — passed.
- `pnpm vitest run tests/unit/false-positive-catalog-consumption.test.ts tests/unit/acceptance-package.test.ts` — passed.
- `pnpm build:acceptance` — passed.
- `pnpm false-positive:catalog:validate -- --generated-at 2026-07-22T00:00:00.000+08:00` — passed, 13 checks.

## Boundary

- No runtime detection behavior change.
- No finding suppression.
- No automatic severity downgrade.
- No target repo writes.
- No hosted dashboard.
- No telemetry.
- No cloud sync.
- No deployment.
- No public release.

## Next Goal

Product False-Positive Regression Catalog Completion Audit v0.1 should audit the planning, contract, artifact generation, and consumption validation sequence as one local-only product slice before any future detection-rule behavior change is considered.
