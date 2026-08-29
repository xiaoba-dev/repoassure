# Blocked Goal Recovery MCP Surface v0.1

Status: Retired on 2026-08-28

> This surface no longer exists. PR #71 (commit `6b78bf9`) removed
> `src/adapters/mcp/blocked-goal-recovery-tools.ts` and the eight recovery entries in the MCP
> tool registry. See [ADR-0044](../adr/0044-blocked-goal-recovery-mcp-surface-removal.md); the
> decision it supersedes is [ADR-0041](../adr/0041-blocked-goal-recovery-mcp-surface.md).
>
> **The blocked-goal recovery lifecycle was not removed.** Only the MCP transport in front of it
> was. Use the CLI entry points below.

## Purpose

The blocked-goal recovery lifecycle turns blocked, incomplete, deferred, or retryable goal
blocker evidence into a reviewable local artifact chain. It is driven from the command line and
writes local evidence only. It does not execute recovery or resume commands.

## Current Entry Points And Read Order

Run each stage from the repository root. Every command reads a local artifact directory and
writes the next stage's JSON and Markdown artifacts into it.

```bash
pnpm --silent goal:recover -- --from-dir <dir>
pnpm --silent goal:recover:consume -- --from-dir <dir>
pnpm --silent goal:recover:decide -- --from-dir <dir>
pnpm --silent goal:recover:prepare-resume -- --from-dir <dir>
pnpm --silent goal:recover:intake-resume-evidence -- --from-dir <dir>
pnpm --silent goal:recover:review-resume-evidence -- --from-dir <dir>
pnpm --silent goal:recover:close-resume-attempt -- --from-dir <dir>
pnpm --silent goal:recover:validate-lifecycle -- --from-dir <dir>
```

The decide, intake, review, and close stages require the documented maintainer decision or a
separately produced evidence input file. No stage invents those decisions or executes the task
package.

Each stage's artifact schema, required inputs, and boundary are specified in its own operations
document and ADR:

| Stage | Operations document | ADR |
| --- | --- | --- |
| Package | [blocked-goal-recovery-package-v0.1.md](blocked-goal-recovery-package-v0.1.md) | [0033](../adr/0033-blocked-goal-recovery-package.md) |
| Consumption | [blocked-goal-recovery-consumption-validation-v0.1.md](blocked-goal-recovery-consumption-validation-v0.1.md) | [0034](../adr/0034-blocked-goal-recovery-consumption-contract.md) |
| Decision receipt | [blocked-goal-recovery-decision-receipt-v0.1.md](blocked-goal-recovery-decision-receipt-v0.1.md) | [0035](../adr/0035-blocked-goal-recovery-decision-receipt.md) |
| Resume task package | [blocked-goal-recovery-resume-attempt-task-package-v0.1.md](blocked-goal-recovery-resume-attempt-task-package-v0.1.md) | [0036](../adr/0036-blocked-goal-recovery-resume-attempt-task-package.md) |
| Resume evidence intake | [blocked-goal-recovery-resume-attempt-execution-evidence-intake-v0.1.md](blocked-goal-recovery-resume-attempt-execution-evidence-intake-v0.1.md) | [0037](../adr/0037-blocked-goal-recovery-resume-attempt-execution-evidence-intake.md) |
| Resume evidence review | [blocked-goal-recovery-resume-attempt-evidence-review-decision-package-v0.1.md](blocked-goal-recovery-resume-attempt-evidence-review-decision-package-v0.1.md) | [0038](../adr/0038-blocked-goal-recovery-resume-attempt-evidence-review-decision-package.md) |
| Closure receipt | [blocked-goal-recovery-resume-attempt-closure-receipt-v0.1.md](blocked-goal-recovery-resume-attempt-closure-receipt-v0.1.md) | [0039](../adr/0039-blocked-goal-recovery-resume-attempt-closure-receipt.md) |
| Lifecycle validation | [blocked-goal-recovery-full-lifecycle-campaign-validation-v0.1.md](blocked-goal-recovery-full-lifecycle-campaign-validation-v0.1.md) | [0040](../adr/0040-blocked-goal-recovery-full-lifecycle-campaign-validation.md) |

## What The Removal Changed

- The eight `blocked_goal` MCP tools are not advertised by `tools/list` and cannot be called.
  The MCP surface is product tools only: `analyze_repo`, `boot_app`, `stop_app`, `explore_app`, `generate_tests`, `generate_repair_plan`, `prepare_repair_handoff`, `preview_repair_execution`, `generate_repair_patch_plan`, `harden_report`, and `run_hardening`.
- The `repoassure.mcp-blocked-goal-recovery-tool-result.v1` envelope is withdrawn with the
  adapter that produced it. Stage artifact schemas written by the CLI are unchanged.
- The MCP-boundary I/O protections ADR-0041 specified — `O_NOFOLLOW | O_NONBLOCK` fixed-input
  reads, the 8 MiB input bound, output symlink rejection, atomic same-directory rename, and
  directory identity revalidation — were properties of that adapter and went with it. They were
  never the lifecycle's own guarantees.
- `packages/acceptance` stage modules, the `pnpm goal:recover:*` scripts, and their unit tests
  are unchanged.

## Boundary

The lifecycle writes local evidence only. It does not execute commands, upload target source,
mutate target repos, create branches, commits, pull requests, issues, or advisories, close
external goals, publish, launch, contact customers, change pricing, spend, or repository
visibility, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.
