# Brownfield Autopilot Intake v0.1

Status: initialized_owner_confirmed
Date: 2026-07-16

## Purpose

This record initializes RepoAssure as a brownfield Autopilot-managed project without replacing existing human source-of-truth documents.

Owner confirmation: recorded. The owner proposed initialization and authorized execution in the current Codex thread.

## Brownfield Evidence

RepoAssure is an existing repository with:

- `package.json`, `pnpm-workspace.yaml`, TypeScript source, tests, and CI configuration.
- CLI and MCP implementation surfaces.
- Public website implementation under `apps/website`.
- Existing ADRs, operations records, acceptance checklists, release boundaries, design docs, and testing strategy.

## Shape Matrix

- `command_line`
- `mcp_server`
- `web_app`
- `sdk_package`
- `composite_product_shape`

## Canonical Entrypoints

The following thin entrypoints now route to detailed documents:

- `docs/PRD.md`
- `docs/SPEC.md`
- `docs/DESIGN.md`
- `docs/PLAN.md`

These entrypoints summarize current truth and preserve detailed docs under `docs/product/`, `docs/architecture/`, `docs/design/`, `docs/testing/`, `docs/acceptance/`, `docs/operations/`, and `docs/adr/`.

## Autopilot Runtime State

Sanitized runtime state is stored under `.autopilot/`:

- `.autopilot/goals/`
- `.autopilot/ledger/`
- `.autopilot/snapshots/`
- `.autopilot/progress/`

Local-only runtime state is excluded from Git:

- `.autopilot/runs/`
- `.autopilot/cache/`
- `.autopilot/secrets/`

## Next Goal

The active next goal is `Public Website P3 Pixel QA & Mobile Responsive Polish v0.1`.

## Non-Authorization Boundary

No repository visibility change was authorized.
No npm publication was authorized.
No GitHub release was authorized.
No public launch was authorized.
No production marketing announcement was authorized.
No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
No deployment or hosting-provider write was authorized by this initialization.

