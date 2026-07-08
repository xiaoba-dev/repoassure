# RepoAssure PLAN Gateway

Status: Accepted
Owner: maintainer
Purpose: Execution order source-of-truth gateway

## Current Execution State

The open-core local artifact and AI IDE repair evidence pipeline is implemented through the current main branch quality gates.

Recent completed work includes:

- AI IDE repair evidence bundle manifest.
- AI IDE repair evidence bundle E2E automation.
- AI IDE Repair Evidence Bundle Consumer Contract v0.1.
- Target Repo Repair Goal Proposal Package v0.1.
- Target Repo Repair Goal Authorization Receipt v0.1.
- Authorized Target Repo Repair Goal Task Package v0.1.
- Public release and branch protection governance.
- Public website private preview and custom-domain work.

## Next Codex Goal

Authorized Target Repo Repair Goal Task Package v0.1

Plain-language explanation: convert a local target repo repair goal authorization receipt into an AI IDE-readable task package for a later separate target repo repair goal, without mutating the target repo or treating the package as direct repair execution.

## Execution Rules

- Use TDD for behavior changes.
- Use the testing pyramid: focused unit tests, integration smoke, full test suite, repo hygiene, release check, and goal audit.
- Continue using isolated worktrees because the main workspace may contain unrelated user changes.
- Do not publish, launch, contact customers, change pricing/spend, mutate target repos, or claim hosted/commercial availability without a separate authorization goal.

## Governing Execution Sources

- `docs/goals/codex-goal.md`
- `docs/goals/active/`
- `docs/goals/completed/`
- `docs/acceptance/checklists/acceptance-checklist-v0.1.md`
- `docs/acceptance/goal-completion-audit.md`
- `docs/testing/strategy/test-strategy-v0.1.md`
- `docs/logs/dev-log.md`
- `docs/logs/decision-log.md`
- `docs/logs/blockers.md`

## Related ADRs

- ADR-0014: Distribution and repair loop readiness.
- ADR-0015: Public release readiness boundary.
- ADR-0024: Autopilot-compatible documentation architecture.
- ADR-0025: AI IDE repair evidence bundle consumer contract.
- ADR-0028: Target repo repair goal proposal package.
- ADR-0029: Target repo repair goal authorization receipt.
- ADR-0030: Authorized target repo repair goal task package.
## AI IDE Repair Execution Replay Readiness v0.1

Status: implemented.

- Add replay readiness schema and writer under `packages/acceptance`.
- Add `pnpm playbook:replay` CLI.
- Verify with unit, integration, and structure cascade tests.
- Keep the report local-first and non-authorizing for target repo mutation, release, launch, customer contact, and commercial claims.

## AI IDE Repair Replay Real Campaign Validation v0.1

Status: implemented.

- Extend the near-real campaign E2E fixture through bundle, contract, and replay readiness.
- Verify sanitized-boundary wording used by generated campaign evidence.
- Keep validation local-first and non-authorizing for target repo mutation, release, launch, customer contact, and commercial claims.

## Target Repo Repair Goal Proposal Package v0.1

Status: implemented.

- Add proposal package schema and writer under `packages/acceptance`.
- Add `pnpm playbook:proposal` CLI.
- Extend the near-real campaign E2E fixture through proposal package generation.
- Verify with unit, integration, type-smoke, E2E, and structure cascade tests.
- Keep the package local-first and non-authorizing for target repo mutation, release, launch, customer contact, and commercial claims.

## Target Repo Repair Goal Authorization Receipt v0.1

Status: implemented.

- Add authorization receipt schema and writer under `packages/acceptance`.
- Add `pnpm playbook:authorize` CLI.
- Extend the near-real campaign E2E fixture through authorization receipt generation.
- Verify with unit, integration, type-smoke, E2E, and structure cascade tests.
- Keep the receipt local-first and non-executing for target repo mutation, release, launch, customer contact, and commercial claims.

## Authorized Target Repo Repair Goal Task Package v0.1

Status: implemented.

- Add authorized target repo repair goal task package schema and writer under `packages/acceptance`.
- Add `pnpm playbook:target-repair-goal` CLI.
- Extend the near-real campaign E2E fixture through target repair goal task package generation.
- Verify with unit, integration, type-smoke, E2E, and structure cascade tests.
- Keep the package local-first and non-executing for target repo mutation, branch, commit, pull request, issue, advisory, release, launch, customer contact, and commercial claims.
