# RepoAssure AI IDE Repair Handoff MCP Tool Implementation v0.1

Status: completed
Date: 2026-07-25
Conclusion: `repair_handoff_mcp_tool_implemented_without_target_repo_writes`

## Objective

Implement only the additive `prepare_repair_handoff` MCP tool under ADR-0024, reuse the package-owned repair handoff runner, and prove schema, redaction, installed-consumer, maintainer-review, verification-plan, and no-target-write boundaries.

## 5A Execution

### Analyze

- Inspected the eight-tool MCP registry and its bounded success/error response helpers.
- Inspected `@hardening-mcp/acceptance/run-repair-handoff`.
- Confirmed the package runner already owns handoff generation, review boundaries, verification plans, redaction, and target-repository no-write behavior.

### Architect

- Added a thin tool adapter instead of duplicating handoff domain logic.
- Kept the result bounded to generated paths, task count, highest priority, and status.
- Declared all four annotations `false` as required by `repoassure.mcp-repair-convergence-contract@1`.
- Added a packed-package import rewrite so the installed tarball uses its embedded acceptance runtime.

### Act

- Added `src/tools/prepare-repair-handoff-tool.ts`.
- Added only `prepare_repair_handoff` to `src/adapters/mcp/tool-registry.ts`.
- Added unit, in-memory MCP transport, real stdio packed-consumer, redaction, fail-closed, and no-write tests.
- Preserved the names, schemas, annotations, and behavior of the prior eight tools.

### Assess

- TDD Red failed because the ninth tool and its call path were absent.
- TDD Green passed the exact schema, annotation, bounded output, redaction, artifact, and no-write assertions.
- The packed consumer installed the local tarball, listed nine tools, called `prepare_repair_handoff`, and generated all three artifacts without source-workspace runtime dependence.

### Advance

The next acceptance-sized Goal is RepoAssure AI IDE Repair Execution Preview MCP Tool Implementation v0.1. It may add only `preview_repair_execution` in dry-run mode. Validation-only execution and the final two candidates remain unauthorized.

## Contract Summary

- Registry tools: 9
- New tool: `prepare_repair_handoff`
- Required input: `runDir`
- Optional input: `outputDir`
- Bounded output: `packagePath`, `markdownPath`, `verificationPlanPath`, `taskCount`, `highestPriority`, `status`
- `readOnlyHint`: false
- `destructiveHint`: false
- `idempotentHint`: false
- `openWorldHint`: false
- Validation commands executed: no
- Target repository writes: no
- Automatic patch application: no

## Evidence

- Tool adapter: `src/tools/prepare-repair-handoff-tool.ts`
- MCP registry: `src/adapters/mcp/tool-registry.ts`
- Package-owned runner: `packages/acceptance/src/run-repair-handoff.ts`
- Packed import rewrite: `scripts/prepare-packed-cli.mjs`
- Unit contract: `tests/unit/mcp-tool-registry.test.ts`
- MCP transport contract: `tests/integration/mcp-server.test.ts`
- Installed consumer contract: `tests/integration/packed-mcp-server-protocol.test.ts`

## Validation

- `pnpm exec vitest run tests/unit/mcp-tool-registry.test.ts` — passed, 14/14.
- `pnpm exec vitest run tests/integration/mcp-server.test.ts -t "prepares a repair handoff"` — passed.
- `pnpm exec vitest run tests/integration/packed-mcp-server-protocol.test.ts --maxWorkers=1` — passed outside the sandbox, 1/1.
- Focused MCP and structure suite — passed, 4 files and 128/128 tests.
- Full Vitest suite — passed, 78 files and 750 tests; 1 file and 1 test skipped.
- `pnpm build:acceptance` — passed.
- `pnpm build:src` — passed.
- `pnpm typecheck`, `pnpm lint`, `pnpm repo:hygiene`, and `git diff --check` — passed.
- `pnpm release:check` — automated prerequisites passed; public release remains correctly unauthorized behind manual gates.
- `pnpm goal:audit` — 34/35 passed with only the existing product-level user-confirmation item left manual.
- `pnpm autopilot:progress:check -- --json` — consistent, 8/8 checks passed.

## Non-Authorization Boundary

This Goal does not authorize `preview_repair_execution` beyond the separately queued next Goal, validation-only MCP exposure, arbitrary command execution, `generate_repair_patch_plan`, `assemble_repair_evidence_package`, resources, prompts, target repository writes, automatic patch application, runtime detector changes, npm publication, deployment, public release, customer contact, pricing changes, or spend.
