# MCP Real Client Consumption Validation v0.1

Status: implemented

> Historically titled *Blocked Goal Recovery MCP Real Client Consumption Validation v0.1*, when
> this gate consumed the blocked-goal recovery lifecycle over MCP. Those tools were removed by
> PR #71 (commit `6b78bf9`); see
> [ADR-0044](../adr/0044-blocked-goal-recovery-mcp-surface-removal.md). The file name is kept so
> existing links resolve. The recovery lifecycle itself still runs from the CLI — see
> [blocked-goal-recovery-mcp-surface-v0.1.md](blocked-goal-recovery-mcp-surface-v0.1.md).

## Purpose

Validate that the compiled MCP server behaves correctly as a real stdio child process driven by
the official SDK `Client` and `StdioClientTransport`. This closes the gap between in-memory
transport coverage and an AI IDE-shaped stdio consumer.

## What This Gate Covers Now

`tests/integration/mcp-real-client.test.ts` validates the transport contract that is independent
of any particular tool:

- A non-responsive stdio child fails the bounded initialization timeout rather than hanging.
- The observed child PID is terminated deterministically after a failed connect, with TERM and
  KILL fallback; the check fails if the PID remains alive.
- The SDK safe default environment is honoured: a sentinel secret present in the parent process
  environment must not reach the child.

Tool discovery and per-tool call behaviour are covered by
`tests/integration/mcp-external-ai-ide-config.test.ts`, which starts the server through each
generated client configuration and asserts the exact advertised tool set, and by
`tests/unit/mcp-tool-registry.test.ts` and `tests/integration/mcp-server.test.ts` for the product
tools themselves.

## Contract Corrections Retained From The Recovery Surface

Real SDK validation against the recovery tools exposed two issues that the in-memory transport
did not. Both fixes live in shared code and still apply:

- Error results previously included `{ error }` in `structuredContent`. For a tool with a success
  output schema, the SDK rejected that shape before the client could read the tool error. Error
  results use text `content` plus `isError: true` and omit `structuredContent`.
- Redaction of a secret-like output directory could consume a fixed artifact basename. Path
  redaction preserves the basename required by an output schema while redacting the directory.

## Failure And Cleanup Coverage

- Unexpected arguments remain client-readable MCP errors.
- Early exit is surfaced through a bounded 64 KiB stderr tail, and the harness redacts raw
  secrets, including nested error metadata.
- Initialization timeout is bounded.
- Failed connection and normal close terminate the observed child PID.
- The harness never returns unredacted stderr.

## CI Gate

`pnpm test:mcp-real-client` builds package and source outputs and runs the real-client
integration alongside `tests/integration/playbook-e2e-repair-evidence.test.ts`. GitHub
`Quality Gates` executes this command after unit tests.

## Boundary

This validation does not mutate a target repository, change external state, publish, launch,
contact customers, change pricing, spend, or repository visibility, or claim commercial or hosted
availability.
