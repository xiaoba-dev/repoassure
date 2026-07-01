# ADR-0023: Solo Maintainer Branch Protection

Status: Accepted
Date: 2026-07-01

## Context

RepoAssure is currently maintained by an independent developer. ADR-0022 and the native branch protection work established that `main` must remain protected, but the first native configuration required one approving review before merge.

That team-style review gate blocks a solo maintainer workflow because GitHub does not allow a pull request author to approve their own pull request. PR #3 verified this behavior: the required `Quality Gates` check passed, but the merge remained blocked with `REVIEW_REQUIRED`.

## Decision

Use a solo maintainer branch protection profile until there is a second active maintainer.

The solo maintainer profile is:

- Required approving reviews: `0`.
- Required status check: `Quality Gates`.
- Strict status checks: `true`.
- Enforce admins: `true`.
- Require conversation resolution: `true`.
- Require linear history: `true`.
- Keep force pushes disabled.
- Keep branch deletion disabled.

Do not weaken CI gate. The required `Quality Gates` check remains the non-negotiable merge gate for `main`.

## Consequences

- A solo maintainer can merge a PR after `Quality Gates` passes without needing a second GitHub identity.
- Bad changes are still blocked by CI and branch protection.
- Human review by a second maintainer should be restored when a real second maintainer joins the project.
- This decision does not authorize direct pushes to `main`, npm publication, GitHub releases, public launch, production marketing announcements, or commercial availability claims.
