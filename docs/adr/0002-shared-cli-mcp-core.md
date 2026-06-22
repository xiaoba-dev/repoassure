# ADR-0002: Shared Core for CLI and MCP

- Status: Accepted
- Date: 2026-06-20
- Deciders: hardening-mcp maintainers

## Context

The product exposes the same hardening capabilities to command-line users and MCP clients: repo analysis, boot, exploration, test generation, reporting, repair planning, and full run orchestration. Duplicating this behavior separately in CLI and MCP layers would create drift and increase testing cost.

## Decision

Keep CLI and MCP as thin adapters over shared tool wrappers and domain modules. The CLI parses arguments and writes stdout/stderr. The MCP server binds `tools/list` and `tools/call` to the same tool registry. Both call `src/tools/*`, which delegates to `src/domain/*` and `src/shared/*`.

## Consequences

### Positive

- CLI and MCP behavior stay aligned.
- Unit and integration tests can cover core behavior without protocol-specific setup.
- Future app shells, IDE skills, or dashboards can reuse the same tool contracts.

### Negative

- The tool wrapper layer becomes a critical compatibility boundary.
- Adapter-specific UX must be added carefully without leaking business logic into adapters.

### Follow-up

- Preserve adapter thinness during monorepo migration.
- Add package-level public APIs before physically extracting `packages/core`.

