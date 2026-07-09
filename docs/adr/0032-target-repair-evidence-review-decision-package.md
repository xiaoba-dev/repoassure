# ADR-0032: Target Repair Evidence Review Decision Package

Status: Accepted
Date: 2026-07-09

## Context

ADR-0031 added target repo repair goal execution evidence intake. That report imports local evidence returned by a separately authorized target repo repair goal, but it still leaves the final maintainer review decision outside the evidence chain.

The product gap is the step after intake: maintainers need a durable local artifact that records whether each target repair evidence item is accepted, requires changes, is deferred, or is accepted as risk. That artifact must preserve provenance and boundaries without becoming an automatic target repo mutation, merge, release, launch, customer contact, or commercial availability authorization.

## Decision

Add a target repair evidence review decision package generated from `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json` and `target-repair-evidence-review-decisions.json`.

The local command is:

```bash
pnpm playbook:target-repair-review -- --from-dir <dir>
```

It writes:

- `ai-ide-target-repair-evidence-review-decision-package.json`
- `ai-ide-target-repair-evidence-review-decision-package.md`

The schema is:

```text
repoassure.ai-ide-target-repair-evidence-review-decision-package.v1
```

The package supports `accept`, `changes_requested`, `defer`, and `accept_risk` decisions. It records source intake report provenance, per-goal review decisions, accepted evidence scope, change-requested items, deferred items, risk-accepted items, next repair goal recommendations, maintainer review boundary, redaction boundary, non-authorization boundary, and blocked actions.

## Boundaries

This package records maintainer review decisions only. It does not modify target repo files, create target repo branch, commit, pull request, issue, advisory, npm publication, GitHub release, public launch, customer contact, pricing/spend change, or SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability claim.

Accepted evidence is not final merge, release, launch, customer, or commercial authorization. Follow-up target repo repair goals still require a separate authorization path.

## Consequences

- The AI IDE repair evidence chain now extends through target repair evidence review decisions.
- Maintainers can preserve accept / changes_requested / defer / accept_risk decisions as local JSON and Markdown evidence.
- The near-real E2E campaign chain now validates `playbook:target-repair-review`.
- Future automation may consume the decision package for reporting, but must not convert it into target repo mutation or public/commercial release action without a separate authorization goal.
