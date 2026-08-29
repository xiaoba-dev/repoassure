# ADR-0043: Repair Workflow CLI and MCP Surface

Status: Accepted
Date: 2026-08-29

## Context

`packages/acceptance` has owned the repair workflow runners for some time — `run-repair-handoff`,
`run-repair-execute`, `run-repair-patch-plan` — and `package.json` exposes them as
`pnpm repair:handoff`, `pnpm repair:execute` and `pnpm repair:patch-plan`. The capability is real
and covered by tests.

It was not reachable the way the product claims to work. RepoAssure's stated audience for repair
material is an AI IDE, and an AI IDE talks to this repository over stdio MCP. Every repair step
required shell knowledge instead: which pnpm script, which flag spelling, which artifact path to
thread into the next command. ADR-0041's governance tools were removed from the MCP surface
because managing goals is not what this product does; the mirror of that argument is that
generating repair evidence *is* what it does, and it was missing from the same surface.

## Decision

Expose the three existing runners through both surfaces, as adapters only.

MCP gains `prepare_repair_handoff`, `preview_repair_execution` and `generate_repair_patch_plan`,
bringing the tool list to eleven, all of them product tools. Each delegates to the same
`@hardening-mcp/acceptance` runner the pnpm script already calls; none reimplements lifecycle
logic. `preview_repair_execution` requires exactly one of a non-empty `taskIds` or `all: true`,
and every tool rejects arguments outside its declared schema.

The CLI gains `hardening repair <handoff|execute|patch-plan>`, dispatching to the same runners.
The subcommand rejects `--apply`, `--write`, `--auto-fix`, `--commit`, `--push` and
`--pull-request` at the boundary rather than ignoring them, so a flag that means "change the
target repository" fails loudly instead of appearing to succeed.

This ADR also closes a redaction gap found while wiring the surface.
`buildRepairHandoffPackage` copied `manifest.artifacts` into the package's `sourceArtifacts`
verbatim, so a secret-shaped value in that map reached `repair-handoff-package.json` unredacted —
the one file built to be handed to an AI IDE. The artifact map now goes through the same
redaction every other quoted value does.

## Consequences

An AI IDE can discover and call the repair chain over `tools/list` and `tools/call`, and a
maintainer can drive the same chain from one CLI, without either learning the pnpm script names.
Neither surface executes a repair, applies a patch, writes target repository files, or creates
branches, commits, issues, pull requests or advisories.

The handoff package's `agentContract.nextCommands` still names the pnpm scripts rather than the
new `hardening repair` subcommands. Those strings live in the runner, not the adapter, and
changing them changes a shipped artifact contract; that belongs with the runner work rather than
with adding an entry point, and the pnpm commands they name remain correct.

`assemble_repair_evidence_package` and its `run-repair-evidence-package` runner are deliberately
not part of this change. They require new fields on all three runners' output — a schema
evolution of three shipped contracts — which is its own decision rather than a side effect of
adding an entry point.

This ADR does not authorize npm publication, GitHub release, public launch, production marketing
announcement, customer contact, pricing/spend, repository visibility change, or
SaaS/Team Cloud/Enterprise/hosted availability claims.
