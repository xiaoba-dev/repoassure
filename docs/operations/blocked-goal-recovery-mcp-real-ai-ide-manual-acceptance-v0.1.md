# MCP Real AI IDE Manual Acceptance v0.1

Status: completed on 2026-08-29 by a delegated run recorded as accepted; see Recorded Evidence

> Historically titled *Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1*. The
> procedure below previously required discovering eight blocked-goal recovery tools and calling
> `create_blocked_goal_recovery`. Those tools were removed by PR #71 (commit `6b78bf9`); see
> [ADR-0044](../adr/0044-blocked-goal-recovery-mcp-surface-removal.md). The file name is kept so
> existing links resolve.
>
> **The completed manual acceptance recorded below is dated 2026-07-14 and exercised the retired
> recovery surface.** It is preserved as a historical record. The updated procedure in this
> runbook has not been run, so this gate is open again for the current surface.

## Purpose

Confirm that one real, maintainer-controlled AI IDE can discover RepoAssure's local stdio MCP
server and perform one bounded, non-mutating call against a disposable directory. This
supplements, but does not replace, the automated SDK configuration-consumption evidence.

## Preconditions

1. Work from a trusted local RepoAssure checkout, on the intended commit.
2. Run `pnpm build` from that checkout.
3. Choose exactly one installed client: Cursor, VS Code, or Codex.
4. Keep client configuration user-level where possible. If project-level configuration is unavoidable, keep it untracked.
5. Do not point the check at a real target repository, production data, or a secret-bearing environment.

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
2. Confirm the client shows the `repoassure` server and lists exactly the product tools `src/adapters/mcp/tool-registry.ts` advertises — currently thirteen: `analyze_repo`, `boot_app`, `stop_app`, `explore_app`, `generate_tests`, `generate_repair_plan`, `prepare_repair_handoff`, `preview_repair_execution`, `generate_repair_patch_plan`, `list_security_providers`, `import_security_evidence`, `harden_report`, `run_hardening`. Confirm no `blocked_goal` tool appears.
3. Create a disposable copy of a small throwaway web project outside the checkout, for example `cp -R <small-sample-app> /tmp/repoassure-mcp-manual-acceptance`.
4. In the AI IDE, call only `analyze_repo` with `root` set to the absolute path of that disposable directory.
5. Confirm the result is a repository profile and that the only file written is `.hardening/run/repo-profile.json` inside the disposable directory.
6. Do not call `boot_app` or `run_hardening` during this gate; they start the app's own process. Do not point any call at a real target repository.
7. Record only redacted evidence using `../acceptance/templates/blocked-goal-recovery-mcp-real-ai-ide-manual-evidence-v0.1.md`.
8. Remove or retain the configuration by explicit decision; retaining it is not product acceptance, and removing it is not a failure when the recorded check passed.

## Acceptance Decision

An `accepted` decision requires all of the following:

- one real installed client successfully discovered the server and the exact advertised product tool set, with no `blocked_goal` tool listed;
- the single `analyze_repo` call wrote only the repository profile inside the disposable directory and left the source checkout unchanged;
- the evidence record contains no paths, secrets, environment values, or target-repository material; and
- the maintainer explicitly chose `accepted` with a concrete rationale.

`changes_requested`, `deferred`, or missing evidence keeps this gate open. A passing automated SDK test, a generated configuration, or a client configuration that has merely been saved is not manual acceptance.

## Recorded Evidence (Current Surface)

On 2026-08-29, at the maintainer's explicit delegation, Claude ran this gate and recorded
`accepted`: `../acceptance/evidence/mcp-real-ai-ide-manual-acceptance-v0.1-2026-08-29.md`.
Discovery of the full thirteen-tool product surface was confirmed in the installed desktop
client's own UI and again by the vendor CLI's tool listing, with no `blocked_goal` tool present.
The bounded `analyze_repo` call was made by Cursor's own agent CLI against the same user-level
configuration, wrote only the disposable directory's `repo-profile.json`, and left the source
checkout unchanged. The run also caught the eleven-versus-thirteen documentation drift, which is
corrected alongside the record. The record is explicitly delegated evidence, not independent
human verification; a maintainer-typed desktop run remains a strictly stronger form of the same
evidence if ever wanted.

## Historical Evidence (Retired Surface)

On 2026-07-14, a maintainer used Codex Desktop with Codex CLI 0.144.2 to discover the eight blocked-goal recovery tools then advertised and call only `create_blocked_goal_recovery` against a disposable fixture. The result recorded `commandsExecuted: false`, `externalStateChanged: false`, `targetRepoMutation: false`, and an empty `resumeCommands` list. The maintainer explicitly accepted the result and removed the temporary configuration. The redacted record is `../acceptance/evidence/blocked-goal-recovery-mcp-real-ai-ide-manual-acceptance-v0.1-2026-07-14.md`.

That record is accurate for its date and is not rewritten. It does not carry forward as acceptance of the current surface, because the tool it exercised no longer exists.

## Boundary

This gate does not apply repair patches, mutate a target repository, alter client configuration automatically, publish packages, launch the product, contact customers, change pricing/spend or repository visibility, or claim hosted/commercial availability.
