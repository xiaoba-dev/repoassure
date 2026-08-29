# RepoAssure AI IDE Repair Execution Preview MCP Tool Implementation v0.1

Status: completed
Date: 2026-07-25
Conclusion: `repair_execution_preview_mcp_tool_implemented_without_command_execution_or_target_repo_writes`

## Objective

Implement only the additive dry-run `preview_repair_execution` MCP tool under ADR-0024, reuse the package-owned repair execution runner, and prove strict task selection, schema, redaction, installed-consumer, maintainer-review, verification-checklist, and no-target-write boundaries.

## 5A Execution

### Analyze

- Inspected the nine-tool MCP registry and its bounded success/error response helpers.
- Inspected `@hardening-mcp/acceptance/run-repair-execute`.
- Confirmed the package runner already owns dry-run report generation, maintainer review, verification checklists, redaction, and target-repository no-write evidence.

### Architect

- Added a thin adapter that fixes `dryRun: true` and `validationOnly: false`.
- Enforced exactly one selection mode: a non-empty `taskIds` array or `all: true`.
- Kept the result bounded to report paths, task count, and status.
- Declared all four MCP annotations `false`.
- Added a packed-package import rewrite so installed consumers use the embedded acceptance runtime.

### Act

- Added `src/tools/preview-repair-execution-tool.ts`.
- Added only `preview_repair_execution` to `src/adapters/mcp/tool-registry.ts`.
- Added unit, in-memory MCP transport, real stdio packed-consumer, fail-closed, redaction, and target-repository no-write tests.
- Preserved the names, schemas, annotations, and behavior of the prior nine tools.

### Assess

- TDD Red failed because the tenth tool and its call path were absent.
- TDD Green passed exact schema, annotation, strict-selection, bounded-output, dry-run, redaction, artifact, and no-write assertions.
- A command marker embedded in the fixture was not executed.
- The packed consumer installed the local tarball, listed ten tools, called `preview_repair_execution`, and generated dry-run artifacts without source-workspace runtime dependence.

### Advance

The next acceptance-sized Goal is RepoAssure AI IDE Repair Patch Plan MCP Tool Implementation v0.1. It may add only `generate_repair_patch_plan`. Validation-only execution, evidence-package MCP exposure, resources, prompts, and target-repository mutation remain unauthorized.

## Contract Summary

- Registry tools: 10
- New tool: `preview_repair_execution`
- Required input: `packagePath`
- Conditional input: exactly one of non-empty `taskIds` or `all: true`
- Optional input: `outputDir`
- Bounded output: `reportPath`, `markdownPath`, `taskCount`, `status`
- `readOnlyHint`: false
- `destructiveHint`: false
- `idempotentHint`: false
- `openWorldHint`: false
- Validation commands executed: no
- Target repository writes: no
- Automatic patch application: no

## Evidence

- Tool adapter: `src/tools/preview-repair-execution-tool.ts`
- MCP registry: `src/adapters/mcp/tool-registry.ts`
- Package-owned runner: `packages/acceptance/src/run-repair-execute.ts`
- Packed import rewrite: `scripts/prepare-packed-cli.mjs`
- Unit contract: `tests/unit/mcp-tool-registry.test.ts`
- MCP transport contract: `tests/integration/mcp-server.test.ts`
- Installed consumer contract: `tests/integration/packed-mcp-server-protocol.test.ts`

## Validation

- `pnpm exec vitest run tests/unit/mcp-tool-registry.test.ts` - passed, 17/17.
- `pnpm exec vitest run tests/integration/mcp-server.test.ts -t "prepares a repair handoff and previews execution" --maxWorkers=1` - passed.
- `pnpm exec vitest run tests/integration/packed-mcp-server-protocol.test.ts --maxWorkers=1` - passed outside the sandbox, 1/1.
- `pnpm build:acceptance` - passed.
- `pnpm build:src` - passed.
- `pnpm exec vitest run tests/unit/project-structure.test.ts` - passed, 111/111.
- `pnpm test` - passed outside the sandbox, 78 files and 754 tests; 1 file and 1 test skipped.
- `pnpm typecheck`, `pnpm lint`, `pnpm repo:hygiene`, and `git diff --check` - passed.
- `pnpm release:check` - automated prerequisites passed; public release remains correctly unauthorized behind manual gates.
- `pnpm goal:audit` - 34/35 passed with only the existing product-level user-confirmation item left manual.
- `pnpm autopilot:progress:check -- --json` - consistent, 8/8 checks passed.

## Non-Authorization Boundary

This Goal does not authorize `generate_repair_patch_plan` beyond the separately queued next Goal, `assemble_repair_evidence_package`, validation-only MCP exposure, arbitrary command execution, resources, prompts, target repository writes, automatic patch application, runtime detector changes, npm publication, deployment, public release, customer contact, pricing changes, or spend.
