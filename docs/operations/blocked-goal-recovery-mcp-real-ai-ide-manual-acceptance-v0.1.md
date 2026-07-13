# Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1

Status: awaiting maintainer evidence

## Purpose

Confirm that one real, maintainer-controlled AI IDE can discover RepoAssure's local stdio MCP server and perform one non-executing fixture call. This supplements, but does not replace, the existing automated SDK configuration-consumption evidence.

## Preconditions

1. Work from a trusted local RepoAssure checkout, on the intended commit.
2. Run `pnpm build` from that checkout.
3. Choose exactly one installed client: Cursor, VS Code, or Codex.
4. Keep client configuration user-level where possible. If project-level configuration is unavoidable, keep it untracked.
5. Do not use a target repository, production data, secret-bearing environment, or a recovery package that contains real resume commands.

## Configuration

Generate only the envelope for the selected client:

```bash
pnpm --silent mcp:config -- --client cursor
pnpm --silent mcp:config -- --client vscode
pnpm --silent mcp:config -- --client codex
```

Copy only the generated `repoassure` entry into the selected client's documented MCP configuration surface. For an existing client configuration, merge that entry without replacing unrelated servers, inputs, sandbox settings, or client preferences. Resolve an existing `repoassure` entry explicitly before saving. Generated configuration is workstation-specific and must not be committed or sent to CI logs.

## Manual Check

1. Restart or reload the selected AI IDE only as required by that client.
2. Confirm the client shows the `repoassure` server and lists all eight blocked-goal recovery tools.
3. Create a disposable fixture copy outside the checkout, for example: `cp -R examples/mcp-manual-acceptance /tmp/repoassure-mcp-manual-acceptance`. Its `includeDefaultResumeCommand: false` setting prevents the recovery package from carrying the legacy default resume command.
4. In the AI IDE, call only `create_blocked_goal_recovery` with `inputDir` set to the absolute path of that disposable directory.
5. Confirm the result reports `commandsExecuted: false`, `externalStateChanged: false`, and `targetRepoMutation: false`.
6. Do not execute recovery or resume commands. Do not call later lifecycle tools during this gate.
7. Record only redacted evidence using `docs/acceptance/templates/blocked-goal-recovery-mcp-real-ai-ide-manual-evidence-v0.1.md`.
8. Remove or retain the configuration by explicit decision; retaining it is not product acceptance, and removing it is not a failure when the recorded check passed.

## Acceptance Decision

An `accepted` decision requires all of the following:

- one real installed client successfully discovered the server and all eight tools;
- the disposable fixture call returned the explicit non-execution boundary flags;
- the evidence record contains no paths, secrets, environment values, or target-repository material; and
- the maintainer explicitly chose `accepted` with a concrete rationale.

`changes_requested`, `deferred`, or missing evidence keeps this goal open. A passing automated SDK test, a generated configuration, or a client configuration that has merely been saved is not manual acceptance.

## Boundary

This gate does not execute recovery or resume commands, mutate a target repository, alter client configuration automatically, publish packages, launch the product, contact customers, change pricing/spend or repository visibility, or claim hosted/commercial availability.
