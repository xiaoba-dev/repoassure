# ADR-0030: Authorized Target Repo Repair Goal Task Package

Status: Accepted
Date: 2026-07-09

## Context

ADR-0029 added a target repo repair goal authorization receipt. That receipt records maintainer decisions, but AI IDEs still need a concrete task package for the next separate target repo repair goal.

The product gap is the handoff from authorization evidence to a bounded repair goal task. Maintainers need approved scope, excluded decisions, verification requirements, and non-authorization boundaries in one local package before a separate target repo repair goal starts.

## Decision

Add an authorized target repo repair goal task package generated from `ai-ide-target-repo-repair-goal-authorization-receipt.json`.

The package schema is:

```text
repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1
```

The CLI command is:

```text
pnpm playbook:target-repair-goal -- --from-dir <dir>
```

It writes:

- `ai-ide-authorized-target-repo-repair-goal-task-package.json`
- `ai-ide-authorized-target-repo-repair-goal-task-package.md`

The package must include source authorization provenance, package readiness, approved repair goals, excluded rejected/deferred/risk-accepted items, repair goal instructions, verification checklist, maintainer review boundary, redaction boundary, non-authorization boundary, and blocked actions.

## Boundaries

This package prepares instructions for a future separate target repo repair goal.

It does not execute target repo file mutation, branch creation, commits, pull requests, issues, advisories, npm publication, GitHub release, public launch, production marketing announcement, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

Rejected, deferred, and risk-accepted authorization items must stay excluded from repair execution.

## Consequences

- AI IDEs get a concrete local task package after maintainer authorization.
- Maintainers get explicit approved scope and excluded scope in one artifact.
- The real-campaign E2E chain now extends through authorized target repo repair goal task package generation.
- Future target repo repair execution goals must still run separately and return evidence for maintainer review.
