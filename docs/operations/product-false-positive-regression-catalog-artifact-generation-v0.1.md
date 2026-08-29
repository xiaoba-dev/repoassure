# Product False-Positive Regression Catalog Artifact Generation v0.1

Status: completed
Date: 2026-07-22
Conclusion: `artifacts_generated_without_detection_behavior_change`

## Scope

This goal generated local false-positive regression catalog artifacts from the implemented contract. It adds a package-owned runner, root script, JSON artifact, and Markdown artifact for maintainer and AI IDE consumption.

It does not modify runtime detectors, suppress findings, downgrade severities automatically, write target repositories, enable telemetry, sync to cloud, deploy, publish packages, change repository visibility, or authorize public release.

## Implemented Runner

- Runner: `packages/acceptance/src/run-false-positive-catalog.ts`
- Package subpath: `@hardening-mcp/acceptance/run-false-positive-catalog`
- Root export: `@hardening-mcp/acceptance`
- Root command: `pnpm false-positive:catalog`
- Default output directory: `artifacts/project-graph/`

## Generated Artifacts

- `artifacts/project-graph/false-positive-regression-catalog.json`
- `artifacts/project-graph/false-positive-regression-catalog.md`

The artifacts are local-only and ignored. They are intended as consumable evidence for maintainers and AI IDEs, not as runtime detector configuration.

## Artifact Contents

The JSON and Markdown include:

- fixture categories
- expected finding snapshots
- severity and rationale review fields
- maintainer decision fields
- redaction metadata
- AI IDE read order
- maintainer review boundary
- local-only and no target repo write boundary

## AI IDE Read Order

1. `artifacts/project-graph/false-positive-regression-catalog.json`
2. `artifacts/project-graph/false-positive-regression-catalog.md`

## Maintainer Review Boundary

Allowed decisions:

- review expected snapshots
- approve fixture classification
- reject fixture classification
- defer fixture classification
- accept risk with notes

Prohibited actions:

- suppress findings
- downgrade severity automatically
- write target repositories
- change runtime detector behavior
- claim hosted dashboard availability

## Boundary

- Local-only artifact generation.
- No runtime detection behavior change.
- No finding suppression.
- No automatic severity downgrade.
- No target repo write.
- No hosted dashboard, telemetry, cloud sync, deployment, public release, pricing, spend, or customer contact.

## Test Evidence

- `tests/unit/false-positive-catalog-artifacts.test.ts` validates artifact bundle shape, Markdown readability, redaction boundary, AI IDE read order, maintainer review boundary, and no target repo write boundary.
- `tests/unit/acceptance-package.test.ts` validates package-owned runner registration and root exports.
- `tests/type-smoke/acceptance-package-subpaths.ts` validates package subpath type consumption.
- `tests/unit/project-structure.test.ts` guards the documentation and autopilot cascade.
- `pnpm build:acceptance` validates the package-owned runner build.

## Generated Evidence

Command used during this goal:

```bash
node packages/acceptance/dist/run-false-positive-catalog.js --generated-at 2026-07-22T00:00:00.000+08:00
```

Result:

- Entries: 5
- Validation: passed
- JSON: `artifacts/project-graph/false-positive-regression-catalog.json`
- Markdown: `artifacts/project-graph/false-positive-regression-catalog.md`

## Next Goal

Product False-Positive Regression Catalog Consumption Validation v0.1 should validate that maintainer and AI IDE workflows can consume the generated JSON/Markdown artifacts in the intended read order, respect the maintainer review boundary, and avoid runtime detector changes, finding suppression, severity downgrades, and target repo writes.
