# AI IDE Repair Decision Package Contract Hardening v0.1

Status: completed
Date: 2026-07-16

## Summary

This goal hardened the AI IDE repair decision package contract so coding agents can consume the package deterministically instead of guessing from a generic report.

The package now exposes:

- `repairActionQueue` for ordered AI IDE repair work.
- `maintainerReview` for explicit maintainer-only approval boundaries.
- `verificationChecklist` for deterministic post-repair checks.
- `redaction` for privacy and evidence-handling guarantees.
- Environment blocker tasks when a required check is blocked.
- Passed-run empty-queue guidance when no repair actions remain.

## Contract Changes

The AI IDE reading order now points agents through summary, agent contract, `repairActionQueue`, task evidence, recommended fixes, verification commands, `maintainerReview`, `verificationChecklist`, and `redaction`.

The maintainer review boundary states that the generated package does not modify target repository files, does not create branches, commits, issues, pull requests, or advisories, and must not be treated as a repair execution authorization.

No automatic target repo write was authorized.

## TDD Evidence

Red:

- Added contract tests requiring deterministic AI IDE read order, repair action queue, maintainer review boundary, verification checklist, redaction contract, and passed/environment-blocker behavior.
- The focused run failed because the new contract fields did not exist yet.
- The cascade structure test failed because this operation record did not exist yet.

Green:

- Implemented the package fields and Markdown sections.
- Added environment blocker task construction and passed-run empty queue guidance.
- Updated downstream repair execution fixtures to consume the hardened package shape.
- Added this operation record and Autopilot progress state.

Verification:

- `pnpm vitest run tests/unit/repair-handoff.test.ts tests/unit/repair-execute.test.ts tests/unit/repair-patch-plan.test.ts`
- `pnpm typecheck`

## Boundaries

- No automatic target repo write was authorized.
- No website visual redesign was authorized.
- No deployment was authorized.
- No public release was authorized.
- No repository visibility change was authorized.
- No npm publication or GitHub release was authorized.
- No public launch, customer contact, pricing, or spend change was authorized.

## Next Goal

The next executable product-core goal is `AI IDE Repair Decision Package Real Campaign Validation v0.1`.

That goal should validate the hardened contract against real or near-real non-private campaign artifacts and confirm JSON, Markdown, reading order, repair queue, maintainer review boundary, verification checklist, and redaction behavior remain consumable without automatic target repo writes.
