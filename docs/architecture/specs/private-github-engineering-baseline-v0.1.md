# Private GitHub Engineering Baseline v0.1

Status: Accepted
Date: 2026-06-22
Source ADR: [ADR-0011](../../adr/0011-private-github-engineering-baseline.md)

## Purpose

Define the minimum GitHub collaboration and automation baseline for the private RepoAssure repository.

This spec governs private development only. It does not grant an open-source license, publish packages, or change the public release boundary.

## CI Gates

GitHub Actions runs on pull requests and pushes to `main`.

Required automated gates:

```bash
pnpm install --frozen-lockfile
pnpm repo:hygiene
pnpm test:unit
pnpm typecheck
pnpm lint
pnpm build
pnpm goal:audit
```

`pnpm goal:audit` is expected to preserve the manual user acceptance boundary when no accepted user record exists. Manual user acceptance remains outside CI. A passing CI run means the automatic evidence is current; it does not mean a user has accepted the product.

## Repository Hygiene

`pnpm repo:hygiene` checks tracked files only. It blocks committed:

- generated `.hardening/` runs
- generated `artifacts/acceptance/`, `artifacts/benchmark-runs/`, `artifacts/orphaned-runs/`, and `artifacts/test-results/`
- legacy `benchmark-runs/` and `test-results/`
- root `dist/`, `packages/*/dist/`, and `coverage/`
- `.env`, `.env.*` except `.env.example`
- private key, certificate, provisioning, and local log files

The check complements `.gitignore`; it does not scan ignored local files.

## PR Workflow

Every PR should include:

- concise summary and change type
- local or CI evidence for the quality gates
- confirmation that generated artifacts and secrets are not committed
- manual user acceptance impact when relevant

PR titles should follow Conventional Commits.

## Issue Intake

Use structured issue templates:

- bug reports require reproduction, impact, and evidence
- feature requests require problem, proposal, scope, and acceptance criteria
- blank issues are disabled to keep private pre-release backlog entries actionable

## Merge Boundary

Before merge:

- CI must pass.
- Generated artifacts, build outputs, local hardening runs, env files, and secrets must remain untracked.
- Public-release-only changes remain blocked unless the public release checklist is complete.
- Manual user acceptance is required only when the change claims product acceptance or changes the acceptance boundary.
