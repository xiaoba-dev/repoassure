# Product Validation Action Queue Runtime v0.3

Status: product_validation_action_queue_implemented

Date: 2026-07-05

Source goal: Product Validation & Repair Loop Hardening v0.3.

Launch authorization status: `not_authorized`.

## Decision

Extend the local real-target campaign summary with a product validation action queue.

The existing `repoassure.validation-campaign-summary.v1` summary already aggregates target repo status, blocker category, product follow-up actions, and evidence paths. This runtime adds `prioritizedActionQueue` so maintainers and AI IDEs can see which cross-repo action should be handled first, who owns it, which targets are affected, which evidence to inspect, and which verification steps close the item.

## Runtime Contract

`campaign-summary.json` now includes:

- `prioritizedActionQueue`
- action item `id`, for example `P0-improve-repair-plan`
- `priority`
- `action`
- `ownerSurface`
- `targetIds`
- `affectedModes`
- `blockerCategories`
- `recommendedVerification`
- `evidenceRefs`
- per-item non-authorization boundary

The action queue groups targets by `nextRecommendedProductAction` and sorts by priority:

- `P0-improve-repair-plan` for product runtime improvements such as repair plan, generated test, or detector quality.
- `P1-document-target-stack` for target environment or maintainer-owned prerequisite work.
- `P2` for lower-risk inspection and follow-up items.

## Markdown Output

`campaign-summary.md` now includes a `Prioritized Action Queue` section before the per-target table.

This gives a reviewer a short execution order before reading every target row.

## Evidence Boundary

No target repo material was uploaded.

No raw target repo artifacts, screenshots, traces, reviewer feedback, customer data, secrets, cookies, OTP, Access tokens, login query-state, reviewer credentials, raw private source, env values, or private repo content were committed.

The action queue records only abstract product actions and redacted local evidence references.

## Verification

TDD and pyramid verification:

```text
pnpm vitest run tests/unit/campaign-summary.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "product validation action queue"
```

The RED tests first failed because `prioritizedActionQueue` and this operation record did not exist. GREEN implementation added the action queue contract and documentation cascade.

## Non-Authorization Boundary

No Action Authorization Receipt was produced.

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.

No customer contact was executed.

No pricing change or spend was executed.

No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.
