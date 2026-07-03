# User Validation Evidence Loop Runtime v0.1

## Status

`user_validation_evidence_loop_runtime_implemented`

Source backlog: Product Backlog Prioritization v0.1 / Priority 4.

Implementation status: `implemented_minimal_runtime`.

Launch authorization status: `not_authorized`.

## Decision

Implement a local-first user validation evidence loop runtime for real target repo acceptance runs.

Browser and Python/CLI user acceptance runs now write:

- `user-validation-evidence-loop.json`
- manifest backlink `artifacts.userValidationEvidenceLoopPath`
- acceptance check `user-validation-evidence-loop.json 已生成`

The evidence loop schema is `repoassure.user-validation-evidence-loop.v1`.

## Runtime Contract

`user-validation-evidence-loop.json` includes:

- `schemaVersion`
- `generatedAt`
- `mode`
- `validationStatus`
- `feedbackEvents`
- `evidenceSources`
- `triage`
- `qualityGates`
- `consumptionGuidance`
- `redactionBoundary`
- `nonAuthorizationBoundary`
- `sourceSummary`

The package is designed to let an AI IDE or maintainer distinguish:

- feedback received
- feedback waiting for maintainer decision
- changes requested
- blockers
- accepted risk
- deferred validation or launch decision

## Evidence Boundary

The runtime is local-only and uses relative artifact links.

It must not upload reviewer feedback, target repo source, logs, screenshots, traces, generated tests, findings, repair material, private artifacts, or launch decision material.

It must not store reviewer PII, raw email, OTP, cookie, Access token, login query-state, reviewer credentials, secrets, raw private repo content, env values, raw private source, or absolute workstation paths.

No reviewer PII may be stored in the package.

## Implementation

- Runtime module: `packages/acceptance/src/user-validation-evidence-loop.ts`
- Browser runner integration: `packages/acceptance/src/run-user-acceptance.ts`
- Python/CLI runner integration: `packages/acceptance/src/run-user-acceptance.ts`
- Package export: `@hardening-mcp/acceptance/user-validation-evidence-loop`
- Unit tests: `tests/unit/user-validation-evidence-loop.test.ts`
- Runner integration tests: `tests/unit/user-acceptance.test.ts`
- Structure and cascade tests: `tests/unit/project-structure.test.ts`

## Verification

Expected verification commands:

```text
pnpm build
pnpm vitest run tests/unit/user-validation-evidence-loop.test.ts tests/unit/user-acceptance.test.ts tests/unit/project-structure.test.ts
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
- external reviewer outreach
- storing reviewer PII or credentials
- uploading reviewer feedback or target repo material to any hosted service
