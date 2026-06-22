# ADR-0012: Branch Protection and Release Boundary

- Status: Accepted
- Date: 2026-06-22
- Deciders: hardening-mcp maintainers

## Context

ADR-0011 established the private GitHub engineering baseline: CI, PR templates, issue templates, and `pnpm repo:hygiene`.

The next governance step is to make `main` require the RepoAssure CI quality gate before changes can be merged. At the same time, ADR-0009 keeps the project private and blocks public release until the release checklist is complete.

GitHub currently returns HTTP 403 for branch protection and repository ruleset APIs on this private repository:

```text
Upgrade to GitHub Pro or make this repository public to enable this feature.
```

Making the repository public would violate the current release boundary.

## Decision

Adopt branch protection and release boundary as a repository operations requirement.

Branch protection and release boundary is the durable governance contract for `main` merge gating and private pre-release constraints.

The desired `main` branch protection state is:

- require the `RepoAssure CI` workflow status check
- require the `Quality Gates` job as the required status check context
- require branches to be up to date before merge
- keep admins subject to the same quality expectation when the plan supports it

Do not make the repository public to unlock branch protection.

Do not add a repository-level `LICENSE`, publish packages, remove `package.json` `"private": true`, or make public announcements until `docs/product/strategy/public-release-checklist-v0.1.md` is complete.

If GitHub plan permissions block branch protection or repository rulesets, record the blocker with the exact API error and manual resolution steps.

## Cascaded Documents

- `docs/operations/branch-protection-release-boundary-v0.1.md` records the target state, current 403 blocker, and manual steps.
- `docs/product/strategy/public-release-checklist-v0.1.md` includes branch protection or equivalent ruleset as a pre-release requirement.
- `docs/product/strategy/private-repo-readiness-v0.1.md` references the branch protection and release boundary.
- `.github/pull_request_template.md` includes release boundary confirmation.
- `docs/logs/blockers.md` records the current GitHub plan limitation.
- `docs/logs/decision-log.md` records the chronological decision.

## Consequences

### Positive

- The project has a clear desired merge gate before more product work lands.
- Public-release-only actions remain blocked and explicit.
- GitHub plan limitations are visible instead of silently weakening the process.

### Negative

- The desired branch protection state cannot be enforced on the current private repo plan.
- Direct pushes to `main` remain technically possible until GitHub plan permissions are upgraded.
- Reviewers must treat the operations blocker as an active governance risk.

### Follow-up

- Upgrade the repository owner account or organization to a GitHub plan that supports branch protection/rulesets on private repos.
- Configure the `main` branch protection target state.
- Re-run verification and update `docs/logs/blockers.md` when the blocker is resolved.
