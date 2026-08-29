# RepoAssure AI IDE Repair Evidence Package MCP Tool Implementation v0.1

Status: completed
Conclusion: `repair_evidence_package_mcp_tool_implemented_without_command_execution_or_target_repo_writes`
Date: 2026-07-25

## Source

- Decision: [ADR-0024](../adr/0024-ai-ide-repair-workflow-mcp-convergence.md)
- Contract: [AI IDE repair workflow MCP convergence contract v0.1](../product/specs/ai-ide-repair-workflow-mcp-convergence-contract-v0.1.md)

## Delivery Contract

- New tool: `assemble_repair_evidence_package`
- Registry tools: 12
- Existing tools changed: no
- Package-owned runner reused: yes
- Required inputs: `handoffPackagePath`, `dryRunReportPath`, `validationReportPath`, `patchPlanPath`
- Optional input: `outputDir`
- Bounded outputs: `packagePath`, `markdownPath`, `taskCount`, `status`
- `readOnlyHint`: false
- `destructiveHint`: false
- `idempotentHint`: false
- `openWorldHint`: false
- Validation-only exposed through MCP: no
- Validation commands executed: no
- Target repository writes: no
- Patches applied: no

## TDD And 5A Evidence

### Arrange And Assert

The initial unit contract required an exact twelve-tool registry, the strict evidence-package input schema, four false annotations, bounded output, fail-closed unsupported arguments, shared text and structured redaction, and generated maintainer-review, verification-checklist, and no-write evidence.

### Red

The focused registry suite first produced six expected failures because `assemble_repair_evidence_package`, its schema, call path, and fail-closed behavior did not exist.

### Act And Green

A thin adapter now reuses `runRepairEvidencePackage`. The MCP registry forwards only the four required artifact paths and optional `outputDir`. The packed CLI preparation step rewrites that package import to the embedded acceptance runtime. Focused unit coverage passed 23 of 23 tests.

### Assess

- Real in-memory MCP `tools/list` and `tools/call` passed for the complete artifact workflow.
- The isolated packed consumer installed the tarball and called the new tool over stdio successfully.
- The output package contains maintainer review, verification checklist, and explicit no-write proof.
- A command marker embedded in existing evidence was not executed.
- Target source content, modification time, and directory entries remained unchanged.
- Unsupported `validationOnly`, `command`, and `apply` inputs fail closed, with both response channels redacted.

### Advance

The four additive artifact-only tools authorized by ADR-0024 are now implemented. The next Goal is RepoAssure AI IDE Repair Workflow MCP Convergence Completion Audit v0.1, which audits them together without adding tools or widening permissions.

## Test Pyramid

1. Unit: exact registry, schema, annotations, bounded result, runner mapping, fail-closed input, and redaction.
2. Integration: real in-memory MCP transport and full handoff-to-evidence artifact flow.
3. Package smoke: isolated tarball installation and stdio `tools/list` / `tools/call`.
4. Boundary regression: no validation execution, no automatic patching, no target-repository write, and all prior tool contracts preserved.

## Boundaries

- No validation-only MCP exposure.
- No arbitrary command execution.
- No MCP resources or prompts.
- No target repository write or automatic patch application.
- No runtime detector or acceptance-policy change.
- No npm publication, deployment, public release, customer contact, pricing change, or spend.

## Final Verification

- Focused pyramid: 4 files and 140 tests passed.
- Full repository: 78 files and 762 tests passed; 1 file and 1 test intentionally skipped.
- `pnpm typecheck`, `pnpm lint`, `pnpm build:acceptance`, and `pnpm build:src`: passed.
- `pnpm repo:hygiene`: passed.
- `pnpm release:check`: automated prerequisites passed; public release remains `no` behind manual gates.
- `pnpm goal:audit`: 34 of 35 checks passed; the existing product-level user acceptance item remains manual.
- `pnpm autopilot:progress:check -- --json`: consistent, 8 of 8 checks passed.

## Next Goal

RepoAssure AI IDE Repair Workflow MCP Convergence Completion Audit v0.1
