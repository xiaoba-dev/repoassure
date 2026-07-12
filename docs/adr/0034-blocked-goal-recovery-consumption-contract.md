# ADR-0034: Blocked Goal Recovery Consumption Contract

Status: Accepted
Date: 2026-07-13

## Context

ADR-0033 gives blocked goals a structured recovery package, but a maintainer or AI IDE still has to interpret source evidence, retry candidates, maintainer decisions, external prerequisites, resume commands, and blocked actions. Reading these fields without a stable consumption contract risks resuming too early or treating recovery guidance as execution authorization.

## Decision

Add a local blocked-goal recovery consumption report generated from `blocked-goal-recovery-package.json`.

```bash
pnpm goal:recover:consume -- --from-dir <dir>
```

It writes `blocked-goal-recovery-consumption-report.json` and `blocked-goal-recovery-consumption-report.md` using schema `repoassure.blocked-goal-recovery-consumption-report.v1`.

The report defines resume readiness, evidence read order, a normalized recovery action queue, a resume checklist, boundary compliance, and inherited maintainer, redaction, non-authorization, and blocked-action boundaries.

## Boundaries

The consumption report does not execute recovery commands. Automatic retry actions remain candidates for a reviewed future run. Maintainer decisions and external prerequisites must be completed before a resume command is used.

The report does not modify target repo files, create a target repo branch, commit, pull request, issue, or advisory, publish npm, create a GitHub release, launch publicly, contact customers, change pricing or spend, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.

## Consequences

- AI IDEs receive deterministic recovery evidence read order and next-action classification.
- Maintainers can distinguish automatic retry candidates from decisions and external prerequisites.
- A recovery package can be validated in a real campaign chain without executing recovery.
- A future resume authorization receipt may record explicit decisions, but must remain a separate goal and contract.
