# RepoAssure AI IDE Repair Patch Plan MCP Tool Implementation v0.1

Status: completed
Date: 2026-07-25
Conclusion: `repair_patch_plan_mcp_tool_implemented_without_command_execution_or_target_repo_writes`

## Objective

Implement only the additive `generate_repair_patch_plan` MCP tool under ADR-0024, reuse the package-owned repair patch-plan runner, and prove schema, bounded output, redaction, installed-consumer, maintainer-review, verification-checklist, no-command, no-patch, and no-target-write boundaries.

## 5A Execution

### Analyze

- Inspected the ten-tool MCP registry, bounded success/error response helpers, and packed import rewrites.
- Inspected `@hardening-mcp/acceptance/run-repair-patch-plan`.
- Confirmed the package runner already owns patch-plan JSON/Markdown generation, maintainer review, verification checklist, redaction, and no-write proof.

### Architect

- Added a thin adapter that forwards only required `reportPath` and optional `outputDir`.
- Whitelisted the result to `planPath`, `markdownPath`, `actionCount`, `autoFixCandidates`, and `status`.
- Declared all four MCP annotations `false`.
- Rejected validation-only, command, apply, and every other unsupported argument before runner invocation.
- Added a packed-package import rewrite so installed consumers use the embedded acceptance runtime.

### Act

- Added `src/tools/generate-repair-patch-plan-tool.ts`.
- Added only `generate_repair_patch_plan` to `src/adapters/mcp/tool-registry.ts`.
- Added unit, in-memory MCP transport, real stdio packed-consumer, fail-closed, text/structured redaction, artifact-boundary, and target-repository no-write tests.
- Preserved the names, schemas, annotations, and behavior of the prior ten tools.

### Assess

- TDD Red failed because the eleventh tool, schema, and call path were absent.
- TDD Green passed exact input/output, annotation, bounded-result, redaction, maintainer-review, verification-checklist, and no-write assertions.
- A command marker embedded in the fixture was not executed, and generated plans report `patchesApplied: false`.
- The packed consumer installed the local tarball, listed eleven tools, called `generate_repair_patch_plan`, and generated review artifacts without source-workspace runtime dependence.

### Advance

The next acceptance-sized Goal is RepoAssure AI IDE Repair Evidence Package MCP Tool Implementation v0.1. It may add only `assemble_repair_evidence_package`. Validation-only execution, resources, prompts, target-repository mutation, and automatic patch application remain unauthorized.

## Contract Summary

- Registry tools: 11
- New tool: `generate_repair_patch_plan`
- Required input: `reportPath`
- Optional input: `outputDir`
- Bounded output: `planPath`, `markdownPath`, `actionCount`, `autoFixCandidates`, `status`
- `readOnlyHint`: false
- `destructiveHint`: false
- `idempotentHint`: false
- `openWorldHint`: false
- Validation commands executed: no
- Target repository writes: no
- Patches applied: no

## Evidence

- Tool adapter: `src/tools/generate-repair-patch-plan-tool.ts`
- MCP registry: `src/adapters/mcp/tool-registry.ts`
- Package-owned runner: `packages/acceptance/src/run-repair-patch-plan.ts`
- Packed import rewrite: `scripts/prepare-packed-cli.mjs`
- Unit contract: `tests/unit/mcp-tool-registry.test.ts`
- MCP transport contract: `tests/integration/mcp-server.test.ts`
- Installed consumer contract: `tests/integration/packed-mcp-server-protocol.test.ts`

## Validation

- `pnpm exec vitest run tests/unit/mcp-tool-registry.test.ts` - passed, 20/20.
- `pnpm exec vitest run tests/integration/mcp-server.test.ts` - passed outside the sandbox, 3/3.
- `pnpm exec vitest run tests/integration/packed-mcp-server-protocol.test.ts` - passed outside the sandbox, 1/1.
- `pnpm exec vitest run tests/unit/project-structure.test.ts` - passed, 112/112.
- `pnpm test` - passed outside the sandbox, 78 files and 758 tests; 1 file and 1 test skipped.
- `pnpm typecheck`, `pnpm lint`, `pnpm repo:hygiene`, and `git diff --check` - passed.
- `pnpm release:check` - automated prerequisites passed; public release remains correctly unauthorized behind manual gates.
- `pnpm goal:audit` - 34/35 passed with only the existing product-level user-confirmation item left manual.
- `pnpm autopilot:progress:check -- --json` - consistent, 8/8 checks passed.

## Non-Authorization Boundary

This Goal does not authorize `assemble_repair_evidence_package` beyond the separately queued next Goal, validation-only MCP exposure, arbitrary command execution, resources, prompts, target repository writes, automatic patch application, runtime detector changes, npm publication, deployment, public release, customer contact, pricing changes, or spend.
