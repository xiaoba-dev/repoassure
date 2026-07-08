# ADR-0028: Target Repo Repair Goal Proposal Package

Status: Accepted
Date: 2026-07-08

## Context

ADR-0025 added the AI IDE repair evidence consumer contract. ADR-0026 added replay readiness. ADR-0027 proved the real-campaign-shaped chain can reach a maintainer-review-ready replay report.

The next product gap is the handoff between replay readiness and any future target repo repair work. Maintainers and AI IDEs need a local proposal package that turns replay readiness into a separate repair goal draft without treating evidence as execution authorization.

## Decision

Add a target repo repair goal proposal package generated from `ai-ide-repair-execution-replay-readiness.json`.

The package schema is:

```text
repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1
```

The CLI command is:

```text
pnpm playbook:proposal -- --from-dir <dir>
```

It writes:

- `ai-ide-target-repo-repair-goal-proposal-package.json`
- `ai-ide-target-repo-repair-goal-proposal-package.md`

The package must include proposal readiness, source replay readiness provenance, prerequisites, artifact read order, allowed repair scope, repair task breakdown, verification commands, maintainer approval boundary, redaction boundary, non-authorization boundary, and blocked actions.

## Boundaries

This package is a proposal for a future separately authorized target repo repair goal.

It does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, file mutation, npm publication, GitHub release, public launch, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

## Consequences

- Maintainers get a concrete repair goal proposal package after replay readiness.
- AI IDEs can read a bounded task breakdown and verification command placeholder before any target repo work.
- The real-campaign E2E chain now extends through proposal package generation.
- Future target repo repair execution goals must consume this package only after explicit maintainer authorization.
