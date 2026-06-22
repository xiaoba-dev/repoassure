# ADR-0011: Private GitHub Engineering Baseline

- Status: Accepted
- Date: 2026-06-22
- Deciders: hardening-mcp maintainers

## Context

ADR-0009 keeps the repository private until the public release checklist is complete. ADR-0010 selects RepoAssure as the product brand and `repoassure` as the private GitHub repository name.

After the initial private push, the repo needs a collaboration and quality baseline before additional product work proceeds. Local-only gates are not enough once changes are reviewed through GitHub.

## Decision

Adopt a private GitHub engineering baseline for RepoAssure.

This Private GitHub engineering baseline is the minimum collaboration and automation contract for the pre-release private repository.

GitHub Actions CI must run the repository hygiene check, unit tests, typecheck, lint, build, and goal audit on pull requests and pushes to `main`.

Repository hygiene must fail if tracked files include generated artifacts, build outputs, local hardening runs, local test results, env files, private keys, certificates, provisioning files, or local logs.

PRs must use a template that asks for quality gates, repository hygiene, public-release boundary, and manual user acceptance impact. Issues must use structured bug and feature templates.

Manual user acceptance remains outside CI. CI can prove that automated gates and evidence generation still work; it cannot replace the user's product acceptance decision.

## Cascaded Documents

- `.github/workflows/ci.yml` defines the private repository CI gates.
- `.github/pull_request_template.md` defines PR review expectations.
- `.github/ISSUE_TEMPLATE/` defines structured issue intake.
- `scripts/check-repo-hygiene.mjs` implements the tracked-file hygiene gate.
- `docs/architecture/specs/private-github-engineering-baseline-v0.1.md` documents the operating model.
- `README.md` documents local gate commands.
- `docs/product/strategy/private-repo-readiness-v0.1.md` records the pre-push and pre-merge boundary.
- `docs/logs/decision-log.md` records the chronological decision.

## Consequences

### Positive

- Every private PR gets the same automated quality baseline.
- Generated run evidence and local artifacts stay out of source control.
- Manual user acceptance remains explicit instead of being hidden inside CI.
- Future product work can proceed through a repeatable review path.

### Negative

- CI adds maintenance overhead as packages and gates evolve.
- `pnpm goal:audit` still reports manual confirmation when user acceptance is pending; reviewers must understand that this is expected.
- The hygiene gate only checks tracked files, so developers still need `.gitignore` discipline for local noise.

### Follow-up

- Add branch protection after the team confirms the private repo settings.
- Revisit CI when integration/E2E jobs become stable in GitHub-hosted runners.
- Keep the repository private until the public release checklist is complete.
