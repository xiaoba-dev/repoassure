# ADR-0029: Target Repo Repair Goal Authorization Receipt

Status: Accepted
Date: 2026-07-08

## Context

ADR-0028 added a target repo repair goal proposal package. That package gives maintainers and AI IDEs a concrete repair-goal draft, but it intentionally stops before authorization.

The next gap is recording maintainer decisions against that proposal package. RepoAssure needs a durable local receipt that captures approve, reject, defer, and accept risk decisions before any separately authorized target repo repair goal is opened.

## Decision

Add a target repo repair goal authorization receipt generated from `ai-ide-target-repo-repair-goal-proposal-package.json` plus maintainer decision input.

The receipt schema is:

```text
repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1
```

The CLI command is:

```text
pnpm playbook:authorize -- --from-dir <dir> --decisions <authorization-decisions.json>
```

It writes:

- `ai-ide-target-repo-repair-goal-authorization-receipt.json`
- `ai-ide-target-repo-repair-goal-authorization-receipt.md`

The receipt must include source proposal provenance, decision summary, authorization items, approved scope, rejected items, deferred items, risk accepted items, verification requirements, maintainer approval boundary, redaction boundary, non-authorization boundary, and blocked actions.

## Boundaries

This receipt can authorize only a separate target repo repair goal for explicitly approved scope.

It does not execute target repo file mutation, branch creation, commits, pull requests, issues, advisories, npm publication, GitHub release, public launch, production marketing announcement, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

Reject, defer, and accept risk decisions must not be treated as target repo repair authorization.

## Consequences

- Maintainers get a local audit trail between proposal package and any future target repo repair goal.
- AI IDEs can consume one receipt to understand approved scope, rejected/deferred/risk-accepted scope, and verification requirements.
- The real-campaign E2E chain now extends through authorization receipt generation.
- Future target repo repair execution goals must consume this receipt and still run in a separate authorized workflow.
