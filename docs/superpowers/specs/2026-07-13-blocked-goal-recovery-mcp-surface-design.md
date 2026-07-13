# Blocked Goal Recovery MCP Surface v0.1 Design

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

