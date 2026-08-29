# RepoAssure Product Completion Gap Audit v0.1

Status: completed
Date: 2026-07-19

## Purpose

Audit the current RepoAssure product state from canonical docs, `.autopilot` state, package scripts, source layout, tests, and key roadmap specs. Classify remaining work as implemented, deferred, blocked, or safe to execute automatically.

## Inputs Reviewed

- `docs/PRD.md`
- `docs/SPEC.md`
- `docs/PLAN.md`
- `docs/product/specs/mvp-spec-v0.3.md`
- `docs/product/specs/project-intelligence-console-spec-v0.1.md`
- `docs/product/specs/public-website-spec-v0.1.md`
- `docs/product/specs/team-cloud-enterprise-spec-v0.1.md`
- `docs/product/strategy/public-release-checklist-v0.1.md`
- `docs/operations/private-preview-external-reviewer-feedback-intake-v0.1.md`
- `.autopilot/goals/index.json`
- `.autopilot/progress/snapshot.json`
- `package.json` scripts
- `apps/`, `packages/`, `src/`, `scripts/`, and `tests/` entrypoints

## Implemented Product Surfaces

| Surface | Status | Evidence |
| --- | --- | --- |
| Local CLI hardening flow | implemented | `src/adapters/cli/`, `src/tools/`, `pnpm app:cli`, integration tests |
| MCP server | implemented | `src/adapters/mcp/`, `pnpm app:mcp`, MCP integration tests |
| Run-scoped evidence bundles | implemented | `.hardening/runs/<run-id>/manifest.json`, `.hardening/latest`, integrity hashing |
| AI IDE repair handoff | implemented | `pnpm repair:handoff`, `repair-handoff.test.ts` |
| Repair execution dry-run and validation-only | implemented | `pnpm repair:execute`, `repair-execute.test.ts` |
| Patch plan | implemented | `pnpm repair:patch-plan`, `repair-patch-plan.test.ts` |
| End-to-end repair evidence package | implemented | `pnpm repair:evidence-package`, `repair-evidence-package.test.ts` |
| Browser acceptance mode | implemented | `pnpm user:accept -- --browser`, E2E and acceptance tests |
| Python/CLI acceptance mode | implemented | Python CLI profile/check/artifact tests |
| Project Intelligence graph snapshot | implemented | `pnpm project:intelligence`, `project-intelligence-snapshot.test.ts` |
| Project Intelligence local static viewer | implemented | `pnpm project:intelligence:view`, `project-intelligence-viewer.test.ts` |
| Project Intelligence findings and ADR cascade workflow | implemented | backlog, decision intake, recommendation draft, maintainer decision, controlled remediation plan |
| Public website | implemented | `apps/website`, `pnpm build:website`, `pnpm verify:website`, public website tests |
| Public release readiness checks | implemented but non-authorizing | `pnpm release:check`, public-release readiness tests |

## Blocked or Manual-Gated Work

| Gap | Classification | Reason |
| --- | --- | --- |
| Public source release execution | blocked | Branch protection / equivalent repository ruleset remains deferred; release gates still no-go. |
| npm publication | blocked | `package.json` remains private and publication requires separate release authorization. |
| GitHub release | blocked | Same public release manual gates. |
| Production marketing launch | blocked | Requires explicit public launch authorization and claim review. |
| Private preview feedback triage | blocked on external input | `Feedback received: no`; triage must wait for real redacted reviewer feedback. |
| Team Cloud / hosted dashboard | product-decision and commercial implementation future work | ADR-0016 and Team Cloud spec define roadmap only; no paid cloud runtime in current increment. |
| Enterprise integrations / SSO / RBAC / policy center | product-decision and commercial implementation future work | Requires separate commercial implementation ADR/goals. |
| Website design system follow-up | deferred by owner direction | Owner paused design-system-related tasks pending new external design. |

## Safe Auto-Executable Gaps

| Candidate | Why safe | Priority |
| --- | --- | --- |
| Project Intelligence Agent Context Export v0.1 | Already defined as P1 in Project Intelligence spec; local-only; improves Codex/AI IDE context consumption without hosted dashboard, deployment, or target repo writes. | P1 |
| Project Intelligence Watch Mode Planning v0.1 | Spec-defined P1, but implementation may add long-running process complexity; should follow context export. | P1 |
| Product false-positive regression catalog planning | Useful but less directly tied to current graph/autopilot workflow. | P1 |

## Selected Next Goal

`Project Intelligence Agent Context Export v0.1`

Plain-language explanation: generate a concise local-only Project Intelligence context export for Codex / AI IDE agents, derived from the existing graph snapshot. It should summarize product surfaces, current goal state, blockers, next recommended goal candidates, and strict non-authorization boundaries. This is the best next step because it makes future long-running Codex goals consume project state more reliably without starting hosted dashboard, cloud sync, deployment, public release, target repo mutation, or design-system work.

## Non-Authorization Boundary

This audit did not execute deployment, public launch, repository visibility change, npm publication, GitHub release, hosted dashboard, cloud sync, telemetry, pricing/spend change, customer contact, website design-system rewrite, or target repo write.

## Verification

- `pnpm vitest run tests/unit/project-structure.test.ts` — passed, 102 tests.
- `pnpm repo:hygiene` — passed.
- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm goal:audit` — passed with automated readiness complete and one remaining manual user-acceptance confirmation.
- `pnpm test` — sandbox run hit local server integration failures; escalated rerun passed, 60 files / 670 tests, 1 skipped.
