# RepoAssure Overnight Autonomous Multi-Goal Campaign Design

Status: Accepted by owner in the 2026-07-13 Codex session
Timezone: Asia/Shanghai (UTC+08:00)
Hard stop: 2026-07-13 08:00

## Objective

Run a bounded overnight campaign that completes a sequence of acceptance-sized Execution Goals. Each goal must pass its own TDD, testing, documentation, and review gates before Project Autopilot derives the next goal from `docs/PLAN.md > docs/SPEC.md > docs/PRD.md`.

## Control Model

The Codex UI keeps one campaign goal active. Repository work is divided into child Execution Goals with explicit scope, evidence, and completion state. The campaign does not skip an incomplete goal and does not use elapsed time as completion evidence.

The first child goal is **Blocked Goal Recovery Consumption Validation v0.1**. Campaign bootstrap also repairs two prerequisites discovered from the latest `main`:

- `docs/PLAN.md` still recommends the already implemented Blocked Goal Recovery Package v0.1.
- The full repair-evidence E2E test rebuilds the acceptance package once per stage and now exceeds its 120-second timeout.

## First Child Goal

Add a local `goal:recover:consume` workflow that reads `blocked-goal-recovery-package.json` and emits:

- `blocked-goal-recovery-consumption-report.json`
- `blocked-goal-recovery-consumption-report.md`

The report must tell an AI IDE or maintainer:

- whether recovery is ready, automatically retryable, or waiting on a maintainer/external prerequisite;
- which evidence to read first;
- which automatic actions may be proposed;
- which decisions and prerequisites remain unresolved;
- which resume commands may be used only after the corresponding gates are satisfied;
- which target-repo, release, launch, customer, pricing, and commercial actions remain blocked.

The report is evidence only. It does not execute recovery commands or authorize any external action.

## Execution And Error Handling

1. Build and verify a clean baseline.
2. Use the existing E2E timeout as the Red case; remove repeated compilation without weakening assertions.
3. Add failing unit and integration tests for recovery-package consumption.
4. Implement the smallest typed writer, Markdown renderer, CLI, exports, and E2E coverage.
5. Cascade the accepted behavior into PRD, Spec, Plan, operations, testing, acceptance, decision log, and development log.
6. Run the full quality gate and open a PR only after verification passes.

Quota, rate-limit, and external network failures must be recorded in the campaign checkpoint. The next heartbeat resumes the current child goal from that checkpoint. It must not mark the goal complete or select another goal.

## Campaign Stop Rules

- Do not start a large child goal after 07:15 Asia/Shanghai.
- Stop immediately at manual approval, publication, launch, repository visibility, customer-contact, pricing/spend, or target-repo mutation gates not covered by a separate authorization.
- By 08:00, report completed goals, evidence, incomplete work, blockers, PR/CI state, and the next recommended Codex Goal.

## Team Handoff Contract

Team route: `selective`.

- Project Autopilot: select child goals, enforce source-of-truth order, and verify completion.
- Engineering: implement behavior through TDD in the isolated worktree.
- QA: verify unit, integration, E2E, type, lint, hygiene, release, and goal-audit evidence.
- Documentation Steward: reconcile PRD, Spec, Plan, operations, testing, acceptance, and logs.
- Release Manager: limit remote work to branch, PR, CI, and authorized merge boundaries.

Handoff inputs: accepted PRD, Spec, Plan, ADR-0033, current recovery package implementation, and baseline test evidence.

Handoff outputs: patches, tests, generated artifact contract, documentation cascade, quality-gate evidence, PR/CI state, and residual risks.

Gates: Red-Green-Refactor, testing pyramid, source-of-truth consistency, non-authorization boundaries, and no unapproved external side effects.

Return condition: all child-goal acceptance evidence returns to Project Autopilot before another goal is selected.

Typed handoff schema: `project-autopilot/specialist-handoff@1` when a specialist handoff artifact is emitted.
