# Blocked Goal Recovery MCP Real Client Consumption Validation v0.1

Status: implemented

## Purpose

Validate the bounded recovery MCP surface through the official SDK `Client` and `StdioClientTransport`, with the compiled MCP server running as a real child process. This closes the gap between in-memory transport coverage and an AI IDE-shaped stdio consumer.

## Consumer Flow

1. Spawn `dist/adapters/mcp/index.js` through `StdioClientTransport` using the SDK safe default environment.
2. Complete MCP initialization, inspect instructions, and discover all eight recovery tools.
3. Consume package, consumption, decision, task, intake, review, and closure through `tools/call`.
4. Call lifecycle validation through the same process for both a client-readable rejected campaign and a successful eight-outcome near-real campaign.
5. Verify successful text `content` and `structuredContent` contain the same JSON.
6. Close the client and prove deterministic cleanup of the child PID.

The flow imports reviewed fixture evidence but does not execute recovery or resume commands.

## Contract Corrections

Real SDK validation exposed two issues that the in-memory transport did not:

- Error results previously included `{ error }` in `structuredContent`. For tools with a success output schema, the SDK rejected that shape before the AI IDE could read the tool error. Error results now use text `content` plus `isError: true` and omit `structuredContent`.
- Redaction of a secret-like output directory could consume the fixed artifact basename. `jsonPath` and `markdownPath` now redact the directory while preserving the basename required by the output schema.

Missing fixed inputs return `Missing input artifact: <file-name>` without exposing the caller's directory.

## Failure And Cleanup Coverage

- Missing artifacts and unexpected arguments remain client-readable MCP errors.
- Early exit is surfaced through a bounded 64 KiB stderr tail and the harness redacts raw secrets, including nested error metadata.
- Initialization timeout is bounded.
- Failed connection and normal close terminate the observed child PID, with TERM and KILL fallback; cleanup fails if the PID remains alive.
- SDK safe default environment inheritance is verified with a sentinel secret that must remain absent in the child.
- The harness never returns unredacted stderr.

## CI Gate

`pnpm test:mcp-real-client` builds package and source outputs and runs the real-client integration. GitHub `Quality Gates` executes this command after unit tests.

## Boundary

This validation does not execute recovery/resume commands, mutate a target repository, change external state, publish, launch, contact customers, change pricing/spend or repository visibility, or claim commercial/hosted availability.
