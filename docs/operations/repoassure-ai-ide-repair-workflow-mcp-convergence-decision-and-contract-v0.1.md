# RepoAssure AI IDE Repair Workflow MCP Convergence Decision and Contract v0.1

Status: completed
Date: 2026-07-25
Conclusion: `repair_workflow_mcp_convergence_contract_accepted_without_registry_expansion`

## Objective

Decide whether and how the installed CLI repair workflow should converge with MCP, then publish an implementation-ready contract without changing the existing registry.

## 5A Execution

### Analyze

- Inspected the installed CLI handoff, execute, patch-plan, and evidence-package runners.
- Inspected the existing eight-tool MCP registry and `generate_repair_plan`.
- Identified `validation-only` command execution as the primary MCP safety boundary.

### Architect

- Accepted four additive artifact-only candidate tools.
- Kept `validation-only` CLI-only.
- Deferred MCP resources and prompts.
- Preserved existing tool compatibility and package-owned runner reuse.

### Act

- Added ADR-0024.
- Added `repoassure.mcp-repair-convergence-contract@1`.
- Added no production code and made no registry changes.

### Assess

- TDD Red failed only because the new decision materials were absent.
- Structure assertions cover candidate names, exact schema fields, annotations, compatibility, errors, redaction, review, verification, and no-write boundaries.
- Full repository gates are recorded below.

### Advance

The next acceptance-sized Goal is RepoAssure AI IDE Repair Handoff MCP Tool Implementation v0.1. It implements only `prepare_repair_handoff`; the other three candidates and validation-only MCP exposure remain unauthorized.

## Decision Summary

- Decision: `artifact_only_additive_mcp_convergence_accepted`
- Existing MCP registry tools: 8
- Candidate artifact-only tools: 4
- MCP resources/prompts: deferred
- Validation-only MCP exposure: no
- Production code changed: no
- Target repository writes: no
- Automatic patch application: no

## Evidence

- ADR: `docs/adr/0024-ai-ide-repair-workflow-mcp-convergence.md`
- Contract: `docs/product/specs/ai-ide-repair-workflow-mcp-convergence-contract-v0.1.md`
- Registry: `src/adapters/mcp/tool-registry.ts`
- CLI runners: `packages/acceptance/src/run-repair-handoff.ts`, `run-repair-execute.ts`, `run-repair-patch-plan.ts`, and `run-repair-evidence-package.ts`
- Contract test: `tests/unit/project-structure.test.ts`

## Validation

- `pnpm vitest run tests/unit/project-structure.test.ts` — passed, 109/109.
- `pnpm autopilot:progress:check -- --json` — consistent, 8/8 checks passed.
- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm repo:hygiene` — passed.
- `pnpm release:check` — automated prerequisites passed; `public release ready: no` remains enforced.
- `pnpm goal:audit` — 34 automated checks passed, 1 existing user-confirmation item remains manual.
- `pnpm exec vitest run --maxWorkers=1` — 78 files passed, 1 skipped; 745 tests passed, 1 skipped.

The initial sandboxed full run reported local-listener failures and parallel packed-install timeouts. The listener-dependent group passed 5/5 outside the network sandbox; the packed CLI and MCP tests each passed individually; the final single-worker full suite then passed. No production-code repair was required.

## Non-Authorization Boundary

This completed decision Goal does not authorize MCP registry expansion, validation command execution through MCP, target repository writes, patch application, runtime detector behavior changes, npm publication, deployment, public release, hosted availability claims, customer contact, pricing changes, or spend.
