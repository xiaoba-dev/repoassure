# Blocked Goal Recovery MCP Surface v0.1 Design

> **Describes a surface that has since been removed.** The blocked-goal recovery MCP tools
> planned here were removed on 2026-08-28 by PR #71 (commit `6b78bf9`); see
> [ADR-0044](../../adr/0044-blocked-goal-recovery-mcp-surface-removal.md). This is a dated record
> of the 2026-07-13 design and is left unedited below. The recovery lifecycle itself was not
> removed — only its MCP transport.


## Goal

Expose the validated local recovery lifecycle to AI IDE clients through discoverable MCP tools without adding execution authority.

## Design

- Keep lifecycle business rules in `@hardening-mcp/acceptance`.
- Keep MCP names, schemas, routing, directory containment, and common responses in `src/adapters/mcp/blocked-goal-recovery-tools.ts`.
- Publish one tool per lifecycle stage.
- Accept directory references rather than raw target source or command payloads.
- Return typed stage output plus explicit non-execution evidence.
- Apply recursive value redaction while preserving governance boundary fields.

## Verification

- Unit: registry, schemas, strict arguments, output contract, redaction, and symlink escape.
- Integration: MCP transport calls through recovery package to closure receipt.
- Near-real campaign: lifecycle validation enters through the MCP adapter.
- Full testing pyramid and CI close the goal.

