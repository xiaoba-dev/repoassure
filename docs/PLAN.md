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
- Target Repo Repair Goal Execution Evidence Intake v0.1.
- Target Repair Evidence Review Decision Package v0.1.
- Blocked Goal Recovery Package v0.1.
- Blocked Goal Recovery Consumption Validation v0.1.
- Public release and branch protection governance.
- Public website private preview and custom-domain work.

## Next Codex Goal

Blocked Goal Recovery Decision Receipt v0.1

Plain-language explanation: record explicit maintainer decisions over a consumed blocked-goal recovery report before any separate resume attempt, without executing recovery commands or treating the receipt as target-repo, release, launch, customer, pricing, or commercial authorization.

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
- ADR-0031: Target repo repair goal execution evidence intake.
- ADR-0032: Target repair evidence review decision package.
- ADR-0033: Blocked goal recovery package.
- ADR-0034: Blocked goal recovery consumption contract.
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

## Target Repo Repair Goal Execution Evidence Intake v0.1

Status: implemented.

- Add target repo repair goal execution evidence intake schema and writer under `packages/acceptance`.
- Add `pnpm playbook:target-repair-evidence` CLI.
- Extend the near-real campaign E2E fixture through target repair evidence intake.
- Verify with unit, integration, type-smoke, E2E, and structure cascade tests.
- Keep the report local-first and non-executing for target repo mutation, branch, commit, pull request, issue, advisory, release, launch, customer contact, and commercial claims.

## Target Repair Evidence Review Decision Package v0.1

Status: implemented.

- Add target repair evidence review decision package schema and writer under `packages/acceptance`.
- Add `pnpm playbook:target-repair-review` CLI.
- Extend the near-real campaign E2E fixture through target repair evidence review decisions.
- Verify with unit, integration, type-smoke, E2E, and structure cascade tests.
- Keep the package local-first and non-executing for target repo mutation, branch, commit, pull request, issue, advisory, release, launch, customer contact, and commercial claims.

## Blocked Goal Recovery Package v0.1

Status: implemented.

- Add blocked goal recovery package schema and writer under `packages/acceptance`.
- Add `pnpm goal:recover` CLI.
- Extend the near-real campaign E2E fixture through blocked goal recovery package generation.
- Verify with unit, integration, type-smoke, E2E, and structure cascade tests.
- Keep the package local-first and non-executing for target repo mutation, branch, commit, pull request, issue, advisory, release, launch, customer contact, pricing/spend, and commercial or hosted availability claims.

## Blocked Goal Recovery Consumption Validation v0.1

Status: implemented.

- Add recovery consumption report schema and writer under `packages/acceptance`.
- Add `pnpm goal:recover:consume` CLI.
- Extend the near-real campaign E2E fixture through recovery consumption.
- Verify resume readiness, evidence read order, action queue, resume checklist, Markdown readability, redaction, and non-authorization boundaries.
- Keep the report local-first and non-executing for recovery commands, target repo mutation, release, launch, customer contact, pricing/spend, and commercial or hosted availability claims.
