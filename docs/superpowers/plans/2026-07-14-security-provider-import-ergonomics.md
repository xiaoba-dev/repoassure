# Security Assurance Lane Provider Import Ergonomics v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make local security-provider evidence import discoverable, safely diagnosable, and directly consumable by repair planning through both CLI and MCP.

**Architecture:** Add one package-owned provider catalog and typed preflight error contract. Reuse them in the existing tool layer, CLI adapter, and MCP registry; keep all writes inside the caller-supplied RepoAssure run directory and expose a non-mutating repair-planning handoff.

**Tech Stack:** TypeScript 6, Node.js 22, MCP SDK, Vitest, pnpm monorepo.

## Global Constraints

- Use only local normalized `scan.json` fixtures; do not run or contact provider services.
- Preserve existing CLI import arguments and package exports.
- Do not expose secrets, provider report content, or raw source paths in failure messages.
- Do not modify target repository source or authorize external/public/commercial actions.

---

### Task 1: Shared Provider Contract And Preflight Errors

**Files:**
- Create: `packages/security-assurance/src/security-provider-contracts.ts`
- Modify: `packages/security-assurance/src/import-security-evidence.ts`
- Modify: `packages/security-assurance/src/index.ts`
- Modify: `packages/security-assurance/src/compatibility.ts`
- Test: `tests/unit/security-assurance.test.ts`
- Test: `tests/type-smoke/security-assurance-package-subpaths.ts`

**Interfaces:**
- Produces: `SecurityProviderDescriptor`, `listSecurityProviderDescriptors()`, `parseSecurityProvider()`, `SecurityImportError`, and `formatSecurityImportError()`.
- Preserves: `importSecurityEvidence(input): Promise<ImportSecurityEvidenceResult>`.

- [ ] Add failing tests for catalog disclosure, missing scan file, malformed JSON, non-object root, provider mismatch, invalid findings, redacted guidance, and no output directory on failure.
- [ ] Run `pnpm exec vitest run tests/unit/security-assurance.test.ts` and confirm the new cases fail for missing contracts.
- [ ] Implement the provider contract and preflight validation with stable error codes and safe guidance.
- [ ] Export the new package subpath and extend type-smoke/compatibility contracts.
- [ ] Run `pnpm exec vitest run tests/unit/security-assurance.test.ts tests/unit/project-structure.test.ts` and confirm green.

### Task 2: Tool And CLI Ergonomics

**Files:**
- Modify: `src/tools/security-import-tool.ts`
- Modify: `src/adapters/cli/run.ts`
- Test: `tests/unit/cli-options.test.ts`
- Test: `tests/integration/cli-generated-artifacts.test.ts`

**Interfaces:**
- Consumes: shared provider catalog and formatted import errors.
- Produces: `repairPlanningHandoff`, `hardening security providers`, and guided import failures.

- [ ] Add failing tests for the machine-readable handoff, provider listing, complete help, missing-option names, unsupported provider guidance, and stable import error output.
- [ ] Run the focused CLI/unit tests and confirm RED.
- [ ] Implement the handoff and CLI providers/import behavior without changing existing successful import arguments.
- [ ] Run focused unit and compiled CLI integration tests and confirm GREEN.

### Task 3: MCP Discovery And Import

**Files:**
- Modify: `src/adapters/mcp/tool-registry.ts`
- Test: `tests/unit/mcp-tool-registry.test.ts`
- Test: `tests/integration/mcp-server.test.ts`
- Test: `tests/integration/mcp-real-client.test.ts`

**Interfaces:**
- Produces: `list_security_providers` and `import_security_evidence` MCP tools.
- Reuses: `runSecurityImportTool()` and `formatSecurityImportError()`; errors keep `isError: true` and omit structured content.

- [ ] Add failing registry tests for names, schemas, annotations, routing, result boundary, and safe error guidance.
- [ ] Add failing real-transport smoke for list and import against a temporary run directory.
- [ ] Run focused MCP tests and confirm RED.
- [ ] Implement registry definitions and routing with the shared contracts.
- [ ] Run focused MCP unit/integration tests and confirm GREEN.

### Task 4: Documentation Cascade And Closure

**Files:**
- Create: `docs/operations/security-assurance-lane-provider-import-ergonomics-v0.1.md`
- Create: `docs/goals/completed/2026-07-14-security-assurance-lane-provider-import-ergonomics-v0.1.md`
- Modify: `docs/architecture/specs/security-assurance-lane-spec-v0.1.md`
- Modify: `docs/PLAN.md`
- Modify: `README.md`
- Modify: `packages/security-assurance/README.md`
- Modify: `docs/testing/strategy/test-strategy-v0.1.md`
- Modify: `docs/acceptance/checklists/acceptance-checklist-v0.1.md`
- Modify: `docs/logs/decision-log.md`
- Modify: `docs/logs/dev-log.md`
- Test: `tests/unit/project-structure.test.ts`

**Interfaces:**
- Records: implemented behavior, exact commands/tools, evidence, limitations, and next goal.

- [ ] Add a failing structure contract for the implementation and documentation cascade.
- [ ] Update the governing spec from draft Phase 1 wording to the implemented ergonomics contract without changing ADR-0013.
- [ ] Add operations, acceptance, testing, decision, development, and completed-goal evidence.
- [ ] Run focused structure tests and link checks.

### Task 5: Testing Pyramid And Independent Review

**Files:**
- Modify only files required by verified findings.

- [ ] Run `pnpm typecheck` and `pnpm lint`.
- [ ] Run `pnpm test:unit`.
- [ ] Run `pnpm test` in an environment that permits loopback listeners.
- [ ] Run `pnpm repo:hygiene`, `pnpm release:check`, and `pnpm goal:audit`.
- [ ] Run `git diff --check` and verify no unrelated or target-repository changes.
- [ ] Complete independent review, remediate P0-P2 findings through TDD, and repeat affected gates.
