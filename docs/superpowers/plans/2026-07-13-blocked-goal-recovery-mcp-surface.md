# Blocked Goal Recovery MCP Surface v0.1 Implementation Plan

> **Describes a surface that has since been removed.** The blocked-goal recovery MCP tools
> planned here were removed on 2026-08-28 by PR #71 (commit `6b78bf9`); see
> [ADR-0044](../../adr/0044-blocked-goal-recovery-mcp-surface-removal.md). This is a dated record
> of the 2026-07-13 design and is left unedited below. The recovery lifecycle itself was not
> removed — only its MCP transport.


**Goal:** Add a bounded, discoverable MCP adapter for the complete blocked-goal recovery evidence lifecycle.

### Task 1: TDD contracts

- [x] Add failing registry tests for eight explicit tools, strict schemas, common output, redaction, and argument rejection.
- [x] Implement the dedicated recovery MCP registry and recursive output redaction.

### Task 2: Integration and governance

- [x] Exercise package through closure over real MCP transport.
- [x] Route the near-real lifecycle campaign validator through the MCP adapter.
- [x] Add ADR-0041, operations guidance, and documentation cascade.
- [ ] Complete independent review, full pyramid, PR CI, merge, and main CI.

