# ADR-0042: Goal Audit Advisory Process Records

Status: Accepted
Date: 2026-08-28

## Context

`pnpm goal:audit` is a required step of the `Quality Gates` CI job: any item it reports as
missing fails the whole job. Its 35 items are not one kind of check. Most verify something a
user of the product can observe — required documents exist, package export surfaces match
their contracts, reports declare their local-first and secret boundaries. Three verify that a
development process was recorded: that `docs/logs/dev-log.md` still spells `### TDD 记录`,
`Red：` and `Green：`, that `docs/logs/blockers.md` still contains a 2026-era `listen EPERM`
entry, that `docs/goals/codex-goal.md` still carries a `## Token Control Policy` heading.

Those three had no failure attribution behind their blocking status. The defects this repository
actually shipped — an unreadable `h1`, a false "signed artifacts" claim, a packed CLI that could
not install — all passed `goal:audit` green. Meanwhile the process needles taxed every change:
`tests/unit/goal-audit.test.ts` asserted `status: 'passed'` for all three against the working
tree, so a slice that did not append the expected prose to the dev log failed `pnpm test:unit`
before `goal:audit` ever ran.

Deleting them would lose a real signal. The logs do drift, and knowing that is worth something.
What is not worth anything is a release being blocked by it.

## Decision

Split enforcement from reporting inside the audit rather than at the CI step.

`GoalAuditItem` gains an optional `enforcement: 'blocking' | 'advisory'` field; absent means
blocking, so every existing item keeps its current weight. `GoalAuditSummary` gains an
`advisory` count. `summarizeGoalAudit` counts a missing advisory item into `advisory` instead of
`missing`, and `missing` alone drives `overallStatus` and both exit codes (`run-goal-audit` and
`run-user-acceptance-handoff`).

Exactly three items are advisory: `开发流程 / TDD 与测试金字塔执行记录`,
`日志治理 / 阻塞与决策记录`, and `Token 控制 / 精准上下文与小步审计`. The seven `架构迁移`
items in the same module stay blocking — they check package exports and compatibility wrappers,
whose drift breaks imports for real consumers.

Advisory items stay in the generated report. `docs/acceptance/goal-completion-audit.md` gains a
`流程记录漂移（不阻塞）` summary row, and a drifted advisory item renders as
`未达标（不阻塞）` with its missing markers and next action intact.

The three unit tests that asserted those items pass against the checked-in logs are replaced by
one test asserting the enforcement contract: the three items are reported, are advisory, and
never move the blocking count.

Existence checks are untouched. All twelve `REQUIRED_DOCUMENT_PATHS` still block, because a
missing user-acceptance guide is a real gap for whoever installs this.

## Consequences

A stale process note no longer fails CI, and no longer has to be written before a slice can go
green — but it is still visible, counted, and named in the audit document, so the drift is a
report rather than a secret.

`goal:audit` remains a required CI step and still fails on missing documents, mismatched package
exports, broken compatibility wrappers, stale acceptance runs, and unmet release-readiness or
security-boundary claims. This ADR narrows what the gate blocks on; it does not remove the gate,
change any artifact schema, or authorize npm publication, GitHub release, public launch,
production marketing announcement, customer contact, pricing/spend, repository visibility
change, or SaaS/Team Cloud/Enterprise/hosted availability claims.

The reverse risk is that advisory drift is ignored indefinitely and the logs decay. That is
accepted: the logs are for the maintainer, and a maintainer who stops reading them is not helped
by a red build.
