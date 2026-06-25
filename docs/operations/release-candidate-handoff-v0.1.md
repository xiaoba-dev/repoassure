# Release Candidate Handoff v0.1

Status: Ready for local review
Date: 2026-06-25
Review branch: `codex/release-candidate-packaging-v0.1`

## Purpose

Turn the completed v0.3 distribution work and public-release readiness work into a reviewable release candidate without publishing the project.

This handoff is for code review, local verification, and future PR preparation. It is not a public release authorization.

## Scope

Included:

- v0.3 local-first GitHub Action wrapper and safe workflow example.
- Repair handoff, repair execution, and patch plan agent contracts.
- Public-release readiness checker, Apache-2.0 source license metadata, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, dependency license audit, and release notes draft.
- Goal audit, user handoff, acceptance, docs, and tests needed to prove the release candidate is internally reviewable.

Excluded:

- Do not publish npm packages.
- Do not make the repository public.
- Do not create a GitHub release.
- Do not remove `package.json` `"private": true`.
- Do not push the branch or open a PR unless explicitly authorized after local packaging passes.

## Commit Packaging Plan

Use small reviewable commits in this order:

1. `feat: add v0.3 distribution repair loop readiness`
   - GitHub Action wrapper and safe workflow example.
   - Repair agent contracts in repair handoff, execution report, and patch plan artifacts.
   - v0.3 goal audit item and related tests.

2. `docs: prepare public release readiness boundary`
   - ADR-0015, Apache-2.0 `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`.
   - Dependency license audit, release notes draft, release checklist cascade, and `pnpm release:check` public-release readiness checks.
   - Public release readiness goal audit item and related tests.

3. `docs: add release candidate handoff`
   - This handoff document.
   - README/checklist/dev-log cascade for review branch, verification gates, and no-publication boundary.

If a file contains changes from more than one logical area, keep the staged hunk with the commit whose behavior it verifies.

## Current Commit Package

- `72f3228 feat: package release candidate readiness` packages the v0.3 distribution/repair loop work, public-release readiness boundary, release candidate handoff, refreshed acceptance evidence, and tests into one locally verified review commit.
- This follow-up documentation update records the package contents only. It does not push, publish, open a PR, create a GitHub release, or change repository visibility.

## Private Draft PR Status

- PR: [#1 `[codex] Package release candidate readiness`](https://github.com/xiaoba-dev/repoassure/pull/1)
- Repository visibility at PR creation: `PRIVATE`
- Base branch: `main`
- Head branch: `codex/release-candidate-packaging-v0.1`
- PR state: `OPEN`
- PR review mode: `Draft`
- CI status at PR creation: `RepoAssure CI / Quality Gates` in progress

This PR is a private review surface only. It still does not authorize public release, npm publication, GitHub release creation, public repository visibility, or public announcements.

## Final Verification Gates

Run these gates before asking for review:

```bash
pnpm repo:hygiene
pnpm release:check
pnpm test:unit
pnpm typecheck
pnpm lint
pnpm build
pnpm acceptance -- --full --browser
pnpm goal:audit
pnpm user:handoff
git diff --check
```

Expected release check result:

```text
public release ready: no
```

That result is correct for this release candidate because manual publication gates are still open.

## Manual Gates Still Blocking Public Release

- Legal review confirms Apache-2.0 license text, contribution policy, and security disclosure policy.
- Trademark/name review confirms RepoAssure and package naming risk is acceptable.
- Branch protection or an equivalent repository ruleset is enabled for `main`.
- Final maintainer publication authorization exists.
- A separate explicit decision authorizes any repository visibility change, npm publication, GitHub release, external announcement, or public case study.

## Review Checklist

- The branch contains no generated artifacts, local hardening runs, env files, private keys, local logs, or target repo private evidence.
- `package.json` keeps `"private": true`.
- `pnpm release:check` passes automated prerequisites while reporting `public release ready: no`.
- `docs/acceptance/goal-completion-audit.md` reports 35/35 automatic evidence.
- `docs/acceptance/user-acceptance-handoff.md` reports automatic evidence passed and no missing evidence.
- The commit history is readable enough to review v0.3 behavior separately from public-release readiness policy.

## Final Verification Result

Completed on 2026-06-25:

- `pnpm repo:hygiene`: passed.
- `pnpm release:check`: passed automated prerequisites and reported `public release ready: no`.
- `pnpm test:unit`: passed, 35 files and 534 tests.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm build`: passed through acceptance and audit preflight.
- `pnpm acceptance -- --full --browser`: passed, 17/17 checks.
- `pnpm goal:audit`: passed, 35/35.
- `pnpm user:handoff`: passed, automatic evidence 35, missing 0, manual confirmation 0.
- `git diff --check`: passed.
