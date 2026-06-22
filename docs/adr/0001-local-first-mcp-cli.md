# ADR-0001: Local-First MCP and CLI

- Status: Accepted
- Date: 2026-06-20
- Deciders: hardening-mcp maintainers

## Context

`hardening-mcp` analyzes and runs user repositories, captures browser/runtime evidence, and writes repair artifacts. These workflows may touch source code, logs, screenshots, traces, env key names, and local file paths. The MVP target is AI-generated Web apps where users need fast local feedback without introducing a cloud upload requirement.

## Decision

Build `hardening-mcp` as a local-first tool exposed through both CLI and MCP stdio. By default, code, logs, screenshots, traces, reports, repair plans, and generated tests stay on the user's machine and inside the target repo or local artifact directories.

## Consequences

### Positive

- Users can run hardening on private repos without uploading source code.
- CLI and MCP workflows work in AI IDEs and local terminals.
- Artifact paths remain directly inspectable by humans and agents.
- Privacy boundaries are easier to explain and test.

### Negative

- Local browser execution and local dev server startup depend on machine permissions.
- Cross-machine collaboration and hosted dashboards are not first-class MVP flows.
- The product must handle varied local package managers, ports, shells, and browser availability.

### Follow-up

- Keep redaction on all CLI, MCP, report, acceptance, and fatal-error outputs.
- Document every future cloud or remote-execution feature as a separate ADR before implementation.

