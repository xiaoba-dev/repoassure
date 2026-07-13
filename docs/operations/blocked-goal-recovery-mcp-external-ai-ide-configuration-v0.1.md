# Blocked Goal Recovery MCP External AI IDE Configuration Validation v0.1

Status: implemented

## Purpose

Generate copy-pasteable local stdio configuration for Cursor, VS Code, and Codex, then prove that each configuration starts the user-facing `apps/mcp-server/index.js` entry from a repository-external consumer workspace.

## Generate Configuration

Build the local checkout once, then choose the receiving client:

```bash
pnpm build
pnpm --silent mcp:config -- --client cursor
pnpm --silent mcp:config -- --client vscode
pnpm --silent mcp:config -- --client codex
```

The command writes only the selected configuration to stdout. It uses the current absolute Node.js executable and the absolute RepoAssure app entry, so paths containing spaces remain separate argv values. Cursor receives an `mcpServers` JSON object, VS Code receives a `servers` JSON object with `type: "stdio"`, and Codex receives an `[mcp_servers.repoassure]` TOML table. The full output is suitable for a new empty config; for an existing config, merge only the `repoassure` entry and reject or resolve a same-name entry before saving. Do not replace unrelated servers, inputs, sandbox settings, or an existing Codex table. The output is workstation-specific: prefer a user-level client config and never commit, share, or print it in CI logs. If a project-level config is unavoidable, keep it untracked.

The generated output follows the public client envelopes documented by [Cursor](https://docs.cursor.com/context/model-context-protocol), [VS Code](https://code.visualstudio.com/docs/agents/reference/mcp-configuration), and the OpenAI Codex `mcp_servers` configuration surface. The automated contract validates syntax and process consumption; vendor UI behavior remains a separate manual acceptance gate.

## Automated Consumption

`pnpm test:mcp-external-config`:

1. Builds package and root runtime outputs.
2. Creates a temporary external consumer workspace and a path-with-spaces alias to the built source checkout.
3. Generates Cursor, VS Code, and Codex configurations from that external cwd.
4. Parses each client envelope into a command plus argv array.
5. Starts `apps/mcp-server/index.js` through the official SDK `StdioClientTransport`.
6. Discovers all eight blocked-goal recovery tools, checks non-execution instructions, captures no stderr, and proves deterministic child cleanup.
7. Uses the SDK harness safe default environment so an unrelated test-process secret is not forwarded to the server.

GitHub Quality Gates run this command independently after the existing real-client gate.

## Failure Contract

- Unsupported clients and unexpected arguments fail closed.
- `--repo-root` must be absolute.
- The generator refuses to emit configuration when the app entry or compiled MCP entry is missing.
- If the compiled config module or shared redactor cannot load, the script emits only a fixed `run pnpm build first` error and does not expose the loader path.
- Readiness errors name the missing component without echoing the caller's absolute path.
- No `env` field is generated and no caller environment value is serialized.

## Boundary

The generator does not write client configuration, alter Cursor, VS Code, Codex, or user profile files, and does not publish a package. Automated safe-environment evidence belongs to the SDK test harness; actual IDE environment inheritance and optional client sandbox settings remain a manual acceptance check. Validation does not execute recovery or resume commands, mutate a target repository, change external state, launch the product, contact customers, change pricing/spend or repository visibility, or claim commercial/hosted availability.

## Manual Follow-up

The next engineering gate is Parallel Test Runtime Build Isolation v0.1, which must remove the shared acceptance-dist rebuild race observed during parallel full-suite execution. Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1 follows that reliability gate: a maintainer selects one installed client, merges the generated entry, confirms tool discovery and one non-executing fixture call, records redacted evidence, and removes or retains the configuration by explicit decision.
