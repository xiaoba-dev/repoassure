# Branch Protection and Release Boundary v0.1

Status: Current control active
Date: 2026-06-22
Source ADR: [ADR-0012](../adr/0012-branch-protection-and-release-boundary.md)

## Purpose

Define the operational target state and evidence history for protecting `main`
while keeping source visibility separate from package, release, launch, and
commercial availability boundaries.

## 2026-07-26 Current Status

- Repository visibility: `PUBLIC`
- Default branch: `main`
- Required status check: `Quality Gates`
- Require branches to be up to date: enabled
- Administrator enforcement: enabled
- Linear history: enabled
- Conversation resolution: enabled
- Force pushes: disabled
- Branch deletion: disabled
- Latest five observed `RepoAssure CI` runs on `main`: successful

The earlier private-repository HTTP 403 state below is historical evidence.
The current native branch protection gate is passed. Source repository
visibility does not authorize npm publication, GitHub Release, public launch,
deployment, marketing, or hosted/commercial availability claims.

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

## Historical Status

GitHub API returned HTTP 403 for both branch protection and repository rulesets on the private repository.

Observed error:

```text
Upgrade to GitHub Pro or make this repository public to enable this feature.
```

The repository must remain private. Do not make the repository public to unlock branch protection.

## 2026-07-01 Recheck

Public Release Manual Gate Closure v0.2 rechecked the repository state with read-only GitHub API calls:

- `gh repo view xiaoba-dev/repoassure --json nameWithOwner,visibility,isPrivate,defaultBranchRef,url`: repository remains `PRIVATE`, default branch `main`.
- `gh api repos/xiaoba-dev/repoassure/branches/main/protection`: still returns `HTTP 403`.
- `gh api repos/xiaoba-dev/repoassure/rulesets`: still returns `HTTP 403`.
- Latest `RepoAssure CI` run on `main` was successful, but CI success does not replace branch protection or an equivalent release control.

This recheck does not close the branch protection gate and does not authorize making the repository public to bypass the private-repo plan limitation.

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

## Historical Blocker

See `docs/logs/blockers.md`: GitHub branch protection and repository rulesets are unavailable for the private repo under the current plan.

This blocker is no longer current. It was superseded after the source
repository became public and native `main` protection was enabled.
