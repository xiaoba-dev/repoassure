# RepoAssure AI IDE Repair Workflow CLI Productization v0.1

Status: completed
Date: 2026-07-24
Conclusion: `repair_workflow_cli_productized_without_target_repo_writes`

## Objective

Expose the existing package-owned AI IDE repair workflow through a stable installed `hardening repair` command family without changing repair semantics, detector behavior, evidence schemas, or target repositories.

## Implemented CLI Surface

| Installed command | Existing runner delegated to | Behavior |
| --- | --- | --- |
| `hardening repair handoff` | repair handoff runner | Builds the handoff package and verification plan from an existing run bundle. |
| `hardening repair execute` | repair execution runner | Supports `--dry-run` and `--validation-only`; it does not apply patches. |
| `hardening repair patch-plan` | patch-plan runner | Converts execution evidence into a maintainer-reviewable patch plan. |
| `hardening repair evidence-package` | evidence-package runner | Aggregates handoff, dry-run, validation-only, patch-plan, review, verification, and no-write evidence. |

All four commands use the existing CLI JSON formatter and redacted error path. Unsupported mutation options such as `--apply`, `--write`, `--auto-fix`, `--commit`, `--push`, and `--pull-request` fail closed before artifact access.

## Compatibility And Agent Consumption

- Existing `pnpm repair:*` scripts remain supported as script compatibility entrypoints.
- Runner `--help` output lists the installed CLI first and the repository-local scripts as compatibility commands.
- Generated AI IDE `nextCommands` now use the installed `hardening repair` command family, so an AI IDE does not need repository-internal package knowledge.
- Existing schemas, errors, redaction, artifact read order, verification checklist, maintainer review boundary, and no-write proof remain unchanged.

## TDD And Test Pyramid Evidence

- Red: CLI option and integration tests initially failed because the `repair` namespace did not exist.
- Green: the CLI adapter delegated to the four existing package runners and rejected write-capable flags before reading artifacts.
- Contract convergence: tests first rejected repository-local `pnpm repair:*` values in generated AI IDE `nextCommands`; package runners were then updated to emit installed CLI commands.
- Focused unit, contract, and integration suite: 6 files / 60 tests passed.
- Installed CLI smoke: `node dist/adapters/cli/index.js repair --help` and `node dist/adapters/cli/index.js repair patch-plan --help` passed after building source and acceptance packages.
- The integration chain covers handoff -> dry-run -> validation-only -> patch-plan -> evidence-package, verifies redaction and maintainer review fields, and proves a sentinel target source file is unchanged.

## Final Verification

- `pnpm exec vitest run` for the focused repair and structure set: 7 files / 163 tests passed.
- `pnpm exec vitest run tests/unit/acceptance-package.test.ts`: 36 tests passed.
- `pnpm typecheck`: passed across packages, root source, and website.
- `pnpm lint`: passed.
- `pnpm repo:hygiene`: passed.
- `pnpm release:check`: automated prerequisites passed; public release correctly remains `no` because manual gates are not closed.
- `pnpm test`: the restricted sandbox produced the known four local-listener environment failures; the same command with local-listener permission passed 75 files / 736 tests, with 1 skipped.
- `pnpm goal:audit`: 34/34 automated checks passed; the separate long-term MVP user-acceptance item remains manual.
- `pnpm autopilot:progress:check -- --json`: 8/8 checks passed with status `consistent`.

## Preserved Boundaries

- Target repository writes: no
- Automatic patch application: no
- Runtime detector behavior changes: no
- Finding suppression or automatic severity downgrade: no
- MCP tool registry expansion: no
- Deployment, publication, public launch, customer contact, pricing, or spend change: no

## Next Goal

RepoAssure AI IDE Repair Workflow Installed CLI Real Campaign Validation v0.1 will exercise the built installed CLI as an external process against a near-real, non-private campaign fixture. It must validate exit codes, artifacts, schemas, Markdown readability, redaction, maintainer review, and no-write evidence without applying patches or changing a target repository.
