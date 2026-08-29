# ADR-0024: AI IDE repair workflow MCP convergence

Status: Accepted
Date: 2026-07-25
Deciders: hardening-mcp maintainers

## Context

RepoAssure exposes two installed entrypoints:

- `hardening repair handoff|execute|patch-plan|evidence-package` provides the complete AI IDE repair workflow through the CLI.
- `hardening-mcp` exposes eight stable MCP tools, including the narrower `generate_repair_plan`.

The CLI workflow is package-installed and campaign-validated, but MCP clients cannot yet prepare a repair handoff, preview selected tasks, generate a patch plan, or assemble an evidence package. Directly exposing every CLI mode would create a safety problem: `repair execute --validation-only` runs verification commands from the handoff package in the target repository. MCP currently has no command allowlist, execution approval, side-effect declaration, or per-command policy that would make that behavior an acceptable low-risk agent tool.

The product therefore needs a convergence decision before changing the registry.

## Decision

Decision identifier: `artifact_only_additive_mcp_convergence_accepted`.

RepoAssure will converge the repair workflow through four additive, artifact-only MCP tools:

1. `prepare_repair_handoff`
2. `preview_repair_execution`
3. `generate_repair_patch_plan`
4. `assemble_repair_evidence_package`

Each tool must reuse the package-owned repair runner rather than duplicate domain logic. The existing eight tools, their names, schemas, outputs, and behavior remain backward compatible.

`preview_repair_execution` is dry-run only. The phrase **validation-only remains CLI-only** is a normative boundary: MCP must not expose validation-only command execution until a later ADR defines command allowlisting, explicit approval, side-effect policy, timeout policy, and audit evidence.

MCP resources and prompts are deferred. Artifact paths and bounded structured results are sufficient for the first convergence slice; introducing stable resource URIs or advisory prompts now would add lifecycle surface without enforcing the repair safety contract.

All four candidates are local artifact writers with these annotations:

- `readOnlyHint: false`
- `destructiveHint: false`
- `idempotentHint: false`
- `openWorldHint: false`

They may create or replace RepoAssure evidence artifacts in an explicit output directory. They must not modify target repository source files, apply patches, access the network, or execute verification commands.

## Compatibility

- Keep `generate_repair_plan` unchanged.
- Add candidates one at a time under separately accepted implementation Goals.
- Reject missing or invalid inputs before writing artifacts.
- Return redacted MCP errors using `isError: true` and `structuredContent.error`.
- Return generated paths and bounded summaries, not unbounded artifact payloads.
- Preserve CLI commands and repository-local `pnpm repair:*` compatibility.

## Non-Authorization Boundary

This ADR does not authorize:

- MCP registry expansion by itself
- Validation-only MCP exposure
- Target repository writes or automatic patch application
- Arbitrary command execution, shell access, or network access
- Runtime detector changes, finding suppression, or severity downgrade
- npm publication, deployment, public release, or hosted product claims

Each registry addition requires a separate TDD implementation Goal and contract tests.

## Consequences

### Positive

- AI IDEs gain a clear path to the complete repair evidence chain without collapsing maintainer review into automatic mutation.
- Existing MCP clients remain compatible.
- The highest-risk execution mode stays behind the installed CLI and an explicit human-controlled command boundary.
- Small implementation slices keep failures attributable to one new tool at a time.

### Negative

- MCP clients cannot run real verification commands in the first convergence phase.
- Evidence assembly may consume a validation report produced through the CLI, so the complete workflow temporarily spans two entrypoints.
- Four separate tools add more registry surface than a single action-based tool.

### Follow-up

- `prepare_repair_handoff` was implemented and accepted by RepoAssure AI IDE Repair Handoff MCP Tool Implementation v0.1.
- `preview_repair_execution` was implemented and accepted by RepoAssure AI IDE Repair Execution Preview MCP Tool Implementation v0.1.
- `generate_repair_patch_plan` was implemented and accepted by RepoAssure AI IDE Repair Patch Plan MCP Tool Implementation v0.1.
- `assemble_repair_evidence_package` was implemented and accepted by RepoAssure AI IDE Repair Evidence Package MCP Tool Implementation v0.1.
- Audit the complete four-tool convergence slice before selecting any further MCP expansion.
- Consider validation-only MCP exposure only through a separate ADR and explicit maintainer authorization.

## Implementation Status

- Implemented candidates: 4 of 4
- Current registry tools: 12
- Convergence slice status: closed
- Implemented tools: `prepare_repair_handoff`, `preview_repair_execution`, `generate_repair_patch_plan`, `assemble_repair_evidence_package`
- Completion audit: RepoAssure AI IDE Repair Workflow MCP Convergence Completion Audit v0.1 accepted
- Next Goal: RepoAssure Product Completion Gap Audit Refresh v0.6
- Validation-only MCP exposure: not authorized
- Target repository writes: not authorized
- Automatic patch application: not authorized

## Cascade Evidence

- Product intent: [docs/PRD.md](../PRD.md)
- Capability contract: [AI IDE repair workflow MCP convergence contract v0.1](../product/specs/ai-ide-repair-workflow-mcp-convergence-contract-v0.1.md)
- Architecture overview: [docs/architecture/overview.md](../architecture/overview.md)
- Execution plan: [docs/PLAN.md](../PLAN.md)
- Testing strategy: [docs/testing/strategy/test-strategy-v0.1.md](../testing/strategy/test-strategy-v0.1.md)
- Acceptance checklist: [docs/acceptance/checklists/acceptance-checklist-v0.1.md](../acceptance/checklists/acceptance-checklist-v0.1.md)
- Operation record: [MCP convergence decision and contract v0.1](../operations/repoassure-ai-ide-repair-workflow-mcp-convergence-decision-and-contract-v0.1.md)
- First implementation record: [AI IDE repair handoff MCP tool implementation v0.1](../operations/repoassure-ai-ide-repair-handoff-mcp-tool-implementation-v0.1.md)
- Second implementation record: [AI IDE repair execution preview MCP tool implementation v0.1](../operations/repoassure-ai-ide-repair-execution-preview-mcp-tool-implementation-v0.1.md)
- Third implementation record: [AI IDE repair patch-plan MCP tool implementation v0.1](../operations/repoassure-ai-ide-repair-patch-plan-mcp-tool-implementation-v0.1.md)
- Fourth implementation record: [AI IDE repair evidence-package MCP tool implementation v0.1](../operations/repoassure-ai-ide-repair-evidence-package-mcp-tool-implementation-v0.1.md)
- Completion audit: [AI IDE repair workflow MCP convergence completion audit v0.1](../operations/repoassure-ai-ide-repair-workflow-mcp-convergence-completion-audit-v0.1.md)
