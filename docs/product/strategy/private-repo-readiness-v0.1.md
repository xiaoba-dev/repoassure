# Private Repo Readiness v0.1

Status: Draft
Date: 2026-06-22
Source ADR: [ADR-0009](../../adr/0009-commercialization-and-licensing-strategy.md)

## Purpose

Define the minimum safety gate for pushing this workspace to a private GitHub repository.

This document is not a public release checklist. Public release is governed by [public-release-checklist-v0.1.md](public-release-checklist-v0.1.md).

Brand decision: ADR-0010 selects RepoAssure as the product brand and `repoassure` as the preferred private GitHub repository name if available.

## Decision

The project is suitable for a private GitHub repository after local guardrails and quality gates pass.

Do not publish publicly, announce externally, add a repository-level open-source `LICENSE`, publish packages, or remove `package.json` `"private": true` until the public release checklist is complete.

## Initial Commit Surface

Include:

- Source code under `src/`, `packages/*/src`, `apps/`, `scripts/`, `tests/`, and `fixtures/`.
- Stable authored documentation under `docs/`.
- Curated examples and package/app README files.
- Package manifests and lockfiles.

Exclude:

- `node_modules/`, `.pnpm-store/`, root `dist/`, and `packages/*/dist/`.
- `.hardening/` target-run output.
- `artifacts/acceptance/`, `artifacts/benchmark-runs/`, `artifacts/orphaned-runs/`, and `artifacts/test-results/`.
- `.env`, `.env.*`, private keys, certificates, provisioning profiles, and local logs.

## Current Local Audit

- At the initial readiness audit, the current directory was not yet a git repository; git initialization is allowed only after the private remote boundary is confirmed.
- `.gitignore` excludes generated build outputs, local package stores, hardening runs, benchmark/test artifacts, orphaned run artifacts, generated acceptance artifacts, env files, private keys, and local logs.
- `artifacts/acceptance/` contains generated acceptance summaries with local paths and target repo evidence; it must stay outside the initial GitHub commit.
- Source-level secret scan contains expected test fixtures and redaction test strings, not confirmed live credentials.

## Required Pre-Push Gate

Run before the first private push:

```bash
pnpm test:unit
pnpm typecheck
pnpm lint
pnpm build
```

Optional but recommended:

```bash
pnpm goal:audit
```

## Push Boundary

Allowed:

- Create a private GitHub repository.
- Prefer the private GitHub repository name `repoassure` if available.
- Push the initial workspace after quality gates pass.
- Use GitHub issues and private PRs for implementation tracking.

Blocked:

- Public repository visibility.
- npm package publication.
- Public announcement.
- Open-source license grant.
- External case-study publication using real target repo evidence.

## Follow-up

- Initialize git and create the first commit only after confirming the GitHub remote.
- Re-run the public release checklist before changing repository visibility to public.
