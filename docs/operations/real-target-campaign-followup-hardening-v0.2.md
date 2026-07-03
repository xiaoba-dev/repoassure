# Real Target Campaign Follow-up Hardening v0.2

## Status

`followup_hardening_implemented`

Status: followup_hardening_implemented

Source goal: Real Target Campaign Follow-up Hardening v0.2.

Implementation status: `implemented_targeted_followup_runtime_hardening`.

Launch authorization status: `not_authorized`.

## Decision

Close the two highest-value product follow-up signals from Real Target Repo Validation Campaign v0.1:

- `agent-reach` Python/CLI runs need clearer environment prerequisite diagnosis and repair-plan guidance when console entrypoints, `pytest`, `ruff`, or `mypy` are missing from PATH.
- `openclaw-ui` browser runs need better complex monorepo / sub-app start command inference when the target path is a nested UI package and the parent repo owns the pnpm workspace context.

This follow-up is product hardening only. It does not rerun or commit raw target repo evidence.

## Runtime Changes

Python/CLI acceptance artifacts now add local repair guidance for missing commands:

- `repair-plan.json` includes `environmentPrerequisites` for missing CLI tools.
- `repair-task-package.json` includes the same machine-readable prerequisites.
- `repair-task-package.md` includes a `Python/CLI environment prerequisites` section.
- Missing command evidence such as `ENOENT`, `command not found`, `not found:` or `no such file or directory` is classified as an environment blocker.
- The recommended product action for these cases is `document_target_stack`, so a maintainer or AI IDE first fixes local setup rather than treating the target repo as a code failure.

Browser analyzer hardening now uses parent pnpm workspace context when analyzing a nested web app package directly:

- If a nested package has no local lockfile or package manager metadata, analyzer searches ancestor directories for workspace context.
- Ancestor context is accepted only when a parent has `pnpm-workspace.yaml` or `package.json#workspaces`.
- For a nested Vite package like `openclaw-ui`, the analyzer can infer `packageManager: pnpm` and recommend `pnpm dev` from the child package cwd.

## Product Impact

The follow-up reduces two false-unknown outcomes:

| Signal | Before | After |
| --- | --- | --- |
| Missing Python/CLI entrypoint or tool | Could be grouped as build/typecheck or generic artifact failure | Classified as environment blocker with repair-plan setup guidance |
| Nested UI package in pnpm monorepo | Could produce no URL/start command when parent owns workspace context | Infers parent pnpm workspace context and recommends a child-cwd runnable command |

This keeps the local-first boundary intact while making the next action clearer for a maintainer, AI IDE, or agent.

## Evidence Boundary

No target repo material was uploaded.

No raw target repo artifacts, screenshots, traces, reviewer feedback, customer data, secrets, cookies, OTP, Access tokens, login query-state, reviewer credentials, raw private source, or env values were committed.

Real target evidence remains local under target repo `.hardening/` directories or local campaign artifact directories.

The committed repository records only product/runtime changes, tests, and this follow-up summary.

## Verification

TDD and pyramid verification used:

```text
pnpm vitest run tests/unit/target-repo-feedback-summary.test.ts
pnpm vitest run tests/unit/python-cli-artifacts.test.ts
pnpm vitest run tests/unit/analyze-repo.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "real target campaign follow-up hardening"
```

These tests cover unit-level classification, repair-plan artifact output, analyzer package-manager inference, and documentation cascade.

## Non-Authorization Boundary

No Action Authorization Receipt was produced.

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.

No customer contact was executed.

No pricing change or spend was executed.

No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.
