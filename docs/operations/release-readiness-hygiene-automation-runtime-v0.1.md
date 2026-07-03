# Release Readiness Hygiene Automation Runtime v0.1

## Status

`release_readiness_hygiene_automation_runtime_implemented`

Source backlog: Product Backlog Prioritization v0.1 / Priority 5.

Implementation status: `implemented_minimal_runtime`.

Launch authorization status: `not_authorized`.

## Decision

Implement a local-first release readiness hygiene automation runtime that generates a maintainer-reviewable evidence package without performing any release or launch action.

The runtime writes:

- `release-readiness-hygiene.json`
- `release-readiness-hygiene.md`

The evidence package schema is `repoassure.release-readiness-hygiene.v1`.

The command is:

```text
pnpm release:hygiene
```

## Runtime Contract

`release-readiness-hygiene.json` includes:

- `schemaVersion`
- `generatedAt`
- `status`
- `localOnly`
- `launchAuthorization`
- `checks`
- `rerunCommands`
- `consumptionGuidance`
- `redactionBoundary`
- `nonAuthorizationBoundary`

The runtime keeps these checks easy to rerun and inspect:

- `release:check`
- `repo:hygiene`
- `sensitive-material-scan`
- `goal:audit`
- package.json keeps `private: true`

## Evidence Boundary

The runtime is local-only and writes generated evidence under the local artifacts directory.

It must not upload target repo material, private artifacts, reviewer feedback, customer data, secrets, raw private repo content, raw private source, cookies, access tokens, reviewer credentials, or environment values.

Sensitive findings are redacted before being written to the evidence package.

## Implementation

- Runtime script: `scripts/generate-release-hygiene-evidence.mjs`
- Package command: `pnpm release:hygiene`
- Unit tests: `tests/unit/release-hygiene-evidence.test.ts`
- Structure and cascade tests: `tests/unit/project-structure.test.ts`

## Verification

Expected verification commands:

```text
pnpm vitest run tests/unit/release-hygiene-evidence.test.ts
pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "records release readiness hygiene automation"
pnpm release:hygiene
pnpm release:check
pnpm repo:hygiene
pnpm goal:audit
pnpm build
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
- uploading target repo material, private artifacts, reviewer feedback, customer data, or raw private repo content

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.
