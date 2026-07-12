# ADR-0033: Blocked Goal Recovery Package

Status: Accepted
Date: 2026-07-12

## Context

RepoAssure's goal workflow can now produce many local evidence packages, but a blocked goal still needs a durable handoff artifact. Chat history is not enough: maintainers and AI IDEs need a structured record of why the goal stopped, what was tried, which blockers are retryable, which decisions require maintainer input, and what conditions must change before resuming.

The product gap is a local recovery package that turns blocked / incomplete / deferred / retryable work into a reviewable JSON and Markdown artifact without treating recovery guidance as authorization to mutate a target repo or execute release actions.

## Decision

Add a blocked goal recovery package generated from `blocked-goal-recovery-input.json`.

The local command is:

```bash
pnpm goal:recover -- --from-dir <dir>
```

It writes:

- `blocked-goal-recovery-package.json`
- `blocked-goal-recovery-package.md`

The schema is:

```text
repoassure.blocked-goal-recovery-package.v1
```

The package supports blocker categories `environment`, `external_service`, `authorization_required`, `maintainer_decision_required`, `technical_unknown`, `test_instability`, `security_or_compliance`, and `product_scope`. It supports blocker statuses `blocked`, `incomplete`, `deferred`, and `retryable`.

## Boundaries

This package records recovery evidence and resume guidance only. It does not modify target repo files, create target repo branch, commit, pull request, issue, advisory, npm publication, GitHub release, public launch, customer contact, pricing/spend change, or SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability claim.

Automatic recovery actions are recommendations for a future authorized run. Maintainer decision requests still require explicit maintainer input before resuming or changing scope.

## Consequences

- Blocked goals now have a structured local recovery artifact.
- Maintainers can distinguish retryable work from authorization, external service, product scope, security, compliance, and test instability blockers.
- AI IDEs can consume resume commands and recovery actions without guessing from chat context.
- Future automation may consume the recovery package, but must not convert it into target repo mutation or public/commercial release action without separate authorization.
