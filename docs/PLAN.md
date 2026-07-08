# RepoAssure PLAN Gateway

Status: Accepted
Owner: maintainer
Purpose: Execution order source-of-truth gateway

## Current Execution State

The open-core local artifact and AI IDE repair evidence pipeline is implemented through the current main branch quality gates.

Recent completed work includes:

- AI IDE repair evidence bundle manifest.
- AI IDE repair evidence bundle E2E automation.
- Public release and branch protection governance.
- Public website private preview and custom-domain work.

## Next Codex Goal

AI IDE Repair Evidence Bundle Consumer Contract v0.1

Plain-language explanation: define and verify that an AI IDE can read only the bundle manifest and still know the artifact reading order, repair/evidence status, verification checklist, maintainer review boundary, and forbidden actions.

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
