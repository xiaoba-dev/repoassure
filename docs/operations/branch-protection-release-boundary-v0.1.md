# Branch Protection and Release Boundary v0.1

Status: Blocked by GitHub plan permissions
Date: 2026-06-22
Source ADR: [ADR-0012](../adr/0012-branch-protection-and-release-boundary.md)

## Purpose

Define the operational target state for protecting `main` and preserving the private pre-release boundary.

## Desired Branch Protection

`main` should require the RepoAssure CI quality gate before merge.

Required status check:

- Workflow: `RepoAssure CI`
- Job/context: `Quality Gates`
- Type: required status check

Recommended settings:

- Require status checks before merging.
- Require branches to be up to date before merging.
- Require the `Quality Gates` status check.
- Do not allow bypass for normal development.

## Current Status

GitHub API returned HTTP 403 for both branch protection and repository rulesets on the private repository.

Observed error:

```text
Upgrade to GitHub Pro or make this repository public to enable this feature.
```

The repository must remain private. Do not make the repository public to unlock branch protection.

## Release Boundary

Until `docs/product/strategy/public-release-checklist-v0.1.md` is complete:

- keep the GitHub repository private
- keep `package.json` `"private": true`
- do not publish npm packages
- do not publish external announcements or case studies using non-public target repo evidence

ADR-0015 allows a repository-level Apache-2.0 `LICENSE` as public-release readiness material. LICENSE presence does not authorize changing repository visibility, publishing packages, or announcing the project publicly.

## Manual Resolution

When GitHub plan permissions are available:

1. Keep the repository private.
2. Enable branch protection or a repository ruleset for `main`.
3. Require the `RepoAssure CI` / `Quality Gates` status check.
4. Require branches to be up to date before merging.
5. Verify with:

```bash
gh api repos/xiaoba-dev/repoassure/branches/main/protection
gh run list --repo xiaoba-dev/repoassure --limit 1
gh repo view xiaoba-dev/repoassure --json visibility
```

6. Mark the blocker in `docs/logs/blockers.md` as resolved.

## Current Blocker

See `docs/logs/blockers.md`: GitHub branch protection and repository rulesets are unavailable for the private repo under the current plan.
