# Product False-Positive Regression Catalog Planning v0.1

Status: completed
Date: 2026-07-21
Conclusion: plan_ready_for_local_contract_implementation

## Purpose

Plan a local-only false-positive regression catalog for RepoAssure findings and Project Intelligence detection rules. The catalog is intended to make future detection changes safer by recording representative fixtures, expected finding snapshots, severity and rationale review fields, and maintainer review boundaries before any runtime detection behavior is changed.

## Scope

This goal is planning-only. It defines the contract for a future catalog implementation but does not add suppression logic, does not change existing finding classifiers, and does not modify target repositories.

## Finding Source Audit

The initial catalog should cover these finding sources:

- `src/types/findings.ts`: shared browser hardening finding shape and P0/P1/P2 severity vocabulary.
- `packages/browser-explorer/src/explore-app.ts`: browser/fetch exploration finding generation, including console, page, request, route, interaction, and action evidence.
- `packages/acceptance/src/run-project-intelligence-snapshot.ts`: Project Intelligence findings such as `missing_cascade`, `orphan_code`, `missing_test_link`, and `progress_state_mismatch`.
- `packages/acceptance/src/run-project-intelligence-backlog.ts`: downstream consumption of `missing_cascade` findings into maintainer-reviewable backlog items.
- `packages/repair-planner/src/generate-repair-plan.ts`: repair planner consumption of hardening and security findings.
- `packages/repair-planner/src/repair-plan.ts`: finding type to repair intent mapping.

## Fixture Categories

The first implementation should define local fixtures for:

- `browser_hardening_findings`: browser exploration findings where evidence is expected to remain actionable.
- `project_intelligence_findings`: docs/code/progress graph findings from local Project Intelligence snapshots.
- `security_assurance_findings`: imported provider-backed security evidence after normalization and redaction.
- `repair_planner_consumption`: downstream repair plan behavior for known finding shapes.
- `mixed_run_bundle_regressions`: run-scoped evidence bundles that combine hardening, security, and Project Intelligence artifacts.

## Expected Finding Snapshot Fields

Each catalog entry should include at least:

- `finding_id`
- `source_fixture`
- `category`
- `type`
- `severity`
- `path`
- `evidence`
- `expected_classification`
- `false_positive_risk`
- `rationale`
- `maintainer_decision`
- `accepted_risk_notes`
- `regression_commands`

These fields should be stable enough for contract tests while remaining human-reviewable.

## Severity And Rationale Review Fields

The catalog should require:

- `false_positive_risk`: low / medium / high risk that the finding is noise.
- `rationale`: short explanation for why the expected classification is correct.
- `maintainer_decision`: approve / defer / accept-risk / revise-fixture.
- `accepted_risk_notes`: required when a noisy or borderline case is intentionally retained.
- `owner_notes`: optional maintainer context that is not interpreted as automatic suppression.

## Maintainer Review Boundary

The catalog is evidence and regression input. It is not a release gate by itself and does not authorize automatic suppression or repair. A future implementation must keep these boundaries:

- Local-only fixtures and generated catalog outputs.
- No runtime detection behavior change in the planning goal.
- No target repo writes.
- No hosted dashboard, cloud sync, telemetry, deployment, public release, npm publication, GitHub release, pricing, spend, or customer contact action.
- No automatic downgrading of severity without an explicit maintainer decision and a separate implementation goal.

## Test Strategy

The next implementation goal should follow the testing pyramid:

- Unit / contract: validate catalog schema, fixture categories, expected finding snapshots, severity/rationale review fields, and prohibited runtime behavior changes.
- Integration: generate or consume a local fixture catalog from non-private sample inputs and prove redaction and no target repo writes.
- E2E: defer until the catalog becomes part of an end-to-end hardening or Project Intelligence command.

## Next Goal

Product False-Positive Regression Catalog Contract Implementation v0.1.

Plain-language explanation: implement the local catalog contract and fixtures, then add contract tests proving future detection changes can be checked against expected false-positive / true-positive examples without changing runtime detection behavior in the same step.

## Verification

- `pnpm vitest run tests/unit/project-structure.test.ts` — passed, 102 tests.
- `pnpm repo:hygiene` — passed.
- `pnpm release:check` — automated prerequisites passed; `public release ready: no` remains expected because manual publication gates are not closed.
- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm test` — sandbox run failed on localhost boot/MCP listen tests; elevated localhost-permitted rerun passed: 67 test files passed, 1 skipped; 687 tests passed, 1 skipped.
- `pnpm goal:audit` — passed automated evidence scope and reports ready for user acceptance; manual MVP/user confirmation remains required.
