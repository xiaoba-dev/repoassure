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
- Blocked Goal Recovery Decision Receipt v0.1.
- Blocked Goal Recovery Resume Attempt Task Package v0.1.
- Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1.
- Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1.
- Blocked Goal Recovery Resume Attempt Closure Receipt v0.1.
- Blocked Goal Recovery Full Lifecycle Real Campaign Validation v0.1.
- Blocked Goal Recovery MCP Surface v0.1.
- Blocked Goal Recovery MCP Real Client Consumption Validation v0.1.
- Blocked Goal Recovery MCP External AI IDE Configuration Validation v0.1.
- Public release and branch protection governance.
- Public website private preview and custom-domain work.

## Next Codex Goal

Public Release Manual Gate Closure v0.2

Plain-language explanation: the MCP manual gate is complete. Before any public release work, reassess the existing legal, trademark, branch-control, exposure, and publication-authorization evidence; do not change repository visibility or publish anything without a separate explicit decision.

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
- ADR-0035: Blocked goal recovery decision receipt.
- ADR-0036: Blocked goal recovery resume attempt task package.
- ADR-0037: Blocked goal recovery resume attempt execution evidence intake.
- ADR-0038: Blocked goal recovery resume attempt evidence review decision package.
- ADR-0039: Blocked goal recovery resume attempt closure receipt.
- ADR-0040: Blocked goal recovery full lifecycle campaign validation.
- ADR-0041: Blocked goal recovery MCP surface.

## Blocked Goal Recovery MCP Surface v0.1

Status: implemented.

- Expose eight explicit recovery lifecycle tools through MCP `tools/list` and `tools/call`.
- Reuse authoritative acceptance writers and emit `repoassure.mcp-blocked-goal-recovery-tool-result.v1`.
- Reject argument expansion and output real-path escape while preserving redaction and non-execution boundaries.

## Blocked Goal Recovery MCP External AI IDE Configuration Validation v0.1

Status: implemented.

- Generate copy-pasteable Cursor, VS Code, and Codex local stdio configurations.
- Point every configuration at the user-facing `apps/mcp-server/index.js` entry with absolute argv-safe paths.
- Consume all three envelopes from an external workspace and path-with-spaces source-checkout alias with SDK-harness environment isolation, eight-tool discovery, and deterministic cleanup; defer actual IDE environment inheritance to manual acceptance.

## Parallel Test Runtime Build Isolation v0.1

Status: completed.

- Build package and root runtime outputs before standard file-parallel Vitest collection.
- Coordinate acceptance builds by source fingerprint and cross-process single-flight state under ignored local cache.
- Recover failed and orphaned build locks without treating partial output as successful.
- Require repeated standard parallel full-suite evidence before real AI IDE manual acceptance.
- Do not write client configuration, publish, execute recovery/resume commands, mutate target repos, or change external state.

PR #56 merged as `92ec9512e1132d4710f7b800e6ae907a720b7be5`; its PR quality gate and merged-main CI completed successfully on 2026-07-13.

## Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1

Status: completed.

- A maintainer used Codex Desktop to discover all eight tools and call only the disposable, non-executing recovery-package fixture.
- The result recorded no command execution, no external state change, no target-repository mutation, and no resume commands.
- The maintainer accepted the evidence and removed the temporary configuration.
- The redacted evidence record is stored under `docs/acceptance/evidence/`.

## Blocked Goal Recovery Full Lifecycle Real Campaign Validation v0.1

Status: implemented.

- Add `repoassure.blocked-goal-recovery-lifecycle-campaign-summary.v1` and `goal:recover:validate-lifecycle`.
- Cover accepted, risk, blocked, failed, incomplete, environment, boundary, and tampered outcomes.
- Preserve local-only, redaction, no-command-execution, and no-external-state-change boundaries.

## Blocked Goal Recovery Resume Attempt Closure Receipt v0.1

Status: implemented.

- Add typed local closure receipt and `pnpm --silent goal:recover:close-resume-attempt`.
- Bind closure to exact review package bytes and require complete accepted-risk acknowledgement.
- Extend campaign validation without executing commands or closing an external goal.

## Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1

Status: implemented.

- Add typed local review decisions and `pnpm --silent goal:recover:review-resume-evidence`.
- Bind decisions to exact intake bytes and preserve maintainer/non-authorization boundaries.
- Extend campaign validation without executing commands or closing goals.

## Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1

Status: implemented.

- Add typed local evidence intake and `pnpm --silent goal:recover:intake-resume-evidence`.
- Bind results to exact task package bytes and derive boundary-first status.
- Extend the near-real campaign without executing commands or accepting evidence.

## Blocked Goal Recovery Resume Attempt Task Package v0.1

Status: implemented.

- Add a typed resume attempt task package and exact receipt provenance under `packages/acceptance`.
- Add `pnpm --silent goal:recover:prepare-resume` CLI.
- Extend the near-real campaign through bounded task package generation.
- Keep all command execution false and preserve target repo, release, launch, customer, pricing/spend, visibility, and commercial/hosted boundaries.

## Blocked Goal Recovery Decision Receipt v0.1

Status: implemented.

- Add stable action keys and a typed decision receipt under `packages/acceptance`.
- Add `pnpm --silent goal:recover:decide` CLI.
- Extend the near-real campaign through decision receipt generation.
- Keep the receipt local-first and non-executing for resume commands, target repo mutation, release, launch, customer contact, pricing/spend, repository visibility, and commercial or hosted claims.
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
