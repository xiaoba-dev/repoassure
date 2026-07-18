# AI IDE Repair Decision Package Real Campaign Validation v0.1

Status: completed
Date: 2026-07-16

## Summary

This goal validates the hardened AI IDE repair decision package against a near-real, non-private campaign fixture.

The validation fixture is:

- `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json`

It represents a campaign run with:

- failed test command evidence,
- failed lint command evidence,
- a required maintainer acceptance decision failure,
- a required environment blocker,
- generated repair package artifact references,
- sensitive token and cookie-like evidence that must be redacted.

## Validated Contract

The generated package proves AI IDEs can consume:

- deterministic reading order,
- `repairActionQueue`,
- `maintainerReview`,
- `verificationChecklist`,
- `redaction`,
- environment blocker tasks,
- JSON output,
- Markdown output,
- verification plan output.

The validation also proves no automatic target repo write was authorized or performed. The test creates a temporary target repo source file, runs `runRepairHandoff`, and verifies that source file content and mtime remain unchanged.

## TDD Evidence

Red:

- Added a fixture-consumption test requiring `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json`.
- The test failed because the near-real campaign fixture did not exist.

Green:

- Added the near-real campaign fixture.
- Verified JSON package fields, Markdown readability, verification plan readability, redaction, environment blocker handling, maintainer review boundary, and no target source mutation.

Verification:

- `pnpm vitest run tests/unit/repair-handoff.test.ts`
- `pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "initializes brownfield Autopilot state"`

## Boundaries

- No automatic target repo write was authorized.
- No website visual redesign was authorized.
- No deployment was authorized.
- No public release was authorized.
- No repository visibility change was authorized.
- No npm publication or GitHub release was authorized.
- No public launch, customer contact, pricing, or spend change was authorized.

## Next Goal

The next executable product-core goal is `AI IDE Repair Execution Dry-Run Real Campaign Validation v0.1`.

That goal should validate that `repair:execute --dry-run` can consume selected tasks from a real or near-real repair decision package and produce execution reports without modifying target repository files.
