# ADR-0044: Retire The Blocked Goal Recovery MCP Surface

Status: Accepted
Date: 2026-08-28
Supersedes: ADR-0041

## Context

ADR-0041 exposed the eight blocked-goal recovery lifecycle stages as MCP tools so an AI IDE
could consume recovery evidence without shell-specific orchestration. Most of that record is
about how to expose the lifecycle safely: directory-only arguments, contained input and output
real paths, bounded non-following reads, device/inode revalidation, and a constant-false
non-execution receipt on every call. That reasoning held. What it never asked is whether the
lifecycle belonged on the product's MCP surface at all.

It did not. The server listed sixteen tools, and every installed copy received all sixteen with
no flag to turn any of them off. Eight answered the question RepoAssure exists to answer —
whether an AI-generated repository is ready to ship. The other eight managed this repository's
own blocked autopilot goals: create a recovery package, record a decision receipt, close a
resume attempt. An AI IDE pointed at this server has no reason to call
`close_blocked_goal_resume_attempt`, and shipping it advertises a product that does something
it does not do.

PR #71 removed the adapter on 2026-08-28 as commit `6b78bf9`, taking
`src/adapters/mcp/blocked-goal-recovery-tools.ts` and the eight registry entries with it. That
change landed without an ADR. The trail therefore still recorded ADR-0041 as Accepted, the ADR
index still showed it that way, and twelve current-state documents still described the removed
tools as an available surface — `docs/architecture/overview.md` still pointed at the deleted
adapter file as though it were present. A unit test in `tests/unit/project-structure.test.ts`
asserted that the documentation still named all eight tools, so the drift was not merely
unnoticed; it was pinned in place by a green test.

Two smaller leftovers came from the same change. The server's own `instructions` string still
told every connecting client it could "consume blocked-goal recovery artifacts", which is the
most user-visible form of the claim. And `expectedRecoveryTools` in
`tests/integration/mcp-external-ai-ide-config.test.ts` was emptied rather than repointed, so its
`expect.arrayContaining([])` had become vacuous and the external-configuration gate no longer
asserted any tool set at all.

## Decision

Retire the MCP adapter for the blocked-goal recovery lifecycle, and supersede ADR-0041.

The MCP surface is product tools only. At the time of the removal that was eight; ADR-0043
subsequently added `prepare_repair_handoff`, `preview_repair_execution`, and
`generate_repair_patch_plan`; ADR-0045 later added `list_security_providers` and
`import_security_evidence`. The count is not the decision —
the rule is: a tool belongs on this surface when it helps answer whether a repository is ready
to ship. Nothing is added here; this record ratifies a removal that already shipped and states
the boundary the surface holds.

**The recovery lifecycle itself is not removed.** `packages/acceptance` still owns all eight
stage modules, from `blocked-goal-recovery-package.ts` through
`blocked-goal-recovery-lifecycle-campaign-summary.ts`, and the `pnpm goal:recover:*` scripts
still drive them. Their unit tests still cover the lifecycle through the CLI path it actually
runs on. ADR-0033 through ADR-0040 remain Accepted and continue to govern those artifacts and
their schemas. What ended is one transport in front of the lifecycle, not the lifecycle.

The `repoassure.mcp-blocked-goal-recovery-tool-result.v1` envelope is withdrawn with the
adapter that produced it. No consumer contract outside this repository depended on it: it was
reachable only through the local stdio server, and the sole recorded consumption is the dated
2026-07-14 manual acceptance. The stage artifact schemas the CLI writes are untouched.

The MCP-boundary protections ADR-0041 specified — `O_NOFOLLOW | O_NONBLOCK` fixed-input reads,
the 8 MiB bound, output symlink rejection, atomic same-directory rename, and directory
identity revalidation — do not carry forward, because there is no MCP boundary left to enforce
them at. They were properties of the adapter, not of the lifecycle. The remaining entry points
are the `pnpm goal:recover:*` scripts, which a maintainer runs directly in their own checkout;
the residual same-user threat model ADR-0041 declined to defend against is unchanged by this
removal.

Documentation that presented the removed tools as available is corrected to describe the CLI
lifecycle it still has. Dated records are marked rather than rewritten: the 2026-07-14 manual
acceptance evidence, the `docs/logs/blockers.md` resolution entry, and the chronological
decision and dev logs are accurate accounts of what happened on their dates, and a superseding
note is added instead of an edit. The three MCP validation gates that survive
(`pnpm test:mcp-real-client`, `pnpm test:mcp-external-config`, and the manual AI IDE
acceptance runbook) are rewritten around the product tools they now actually exercise.

The `project-structure` test that required the documentation to name the eight removed tools is
replaced by one asserting the current contract: the docs name the product surface, ADR-0041 is
superseded, and no current-state document presents a `blocked_goal` MCP tool as available.

## Consequences

The MCP surface now matches the question the product answers, and a maintainer reading the ADR
trail or the architecture overview sees the surface that exists rather than the one ADR-0041
described six weeks ago.

The cost is a real capability loss for one workflow. Anyone who was consuming recovery evidence
through an AI IDE over MCP must now run the `pnpm goal:recover:*` scripts and read the local
artifacts, which is more shell-specific work — exactly the friction ADR-0041 set out to remove.
That is accepted: the lifecycle governs this repository's own goals, and its only consumer is
its own maintainer, who already has a shell open. If a real external consumer for the lifecycle
ever appears, this decision should be revisited on that evidence rather than reinstated by
default.

A narrower risk is that the CLI path now carries the lifecycle alone. If those scripts break,
nothing else exercises the stage writers end to end over a transport. The eight stage unit test
files and the lifecycle campaign validation remain the coverage that catches this.

This record removes a transport. It does not change any stage artifact schema, remove any
`pnpm goal:recover:*` command, alter the `.hardening` run layout, or weaken the local-first
boundary in ADR-0001. It does not authorize npm publication, a GitHub release, public launch,
production marketing announcement, customer contact, pricing or spend changes, repository
visibility changes, target repository mutation, or any SaaS, Team Cloud, Enterprise, or hosted
availability claim.
