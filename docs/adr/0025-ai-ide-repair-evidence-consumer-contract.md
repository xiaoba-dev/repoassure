# ADR-0025: AI IDE Repair Evidence Bundle Consumer Contract

Status: Accepted
Date: 2026-07-08

## Context

RepoAssure can already generate an AI IDE repair evidence bundle manifest from the local repair evidence chain:

- `ai-ide-repair-playbook.json`
- `ai-ide-playbook-consumption-report.json`
- `ai-ide-repair-decision-package.json`
- `ai-ide-repair-approval-receipt.json`
- `ai-ide-approved-repair-execution-plan.json`
- `ai-ide-repair-execution-evidence-report.json`

The bundle manifest is the single entry point, but an AI IDE still benefits from an explicit consumption contract that says how to read the bundle, which artifacts are required, what each artifact is for, which checks must be completed, and which actions remain forbidden.

## Decision

Add an AI IDE repair evidence consumer contract after bundle manifest generation.

The contract schema is `repoassure.ai-ide-repair-evidence-consumer-contract.v1`.

The CLI entry is:

```bash
pnpm playbook:contract -- --from-dir <dir>
```

The command writes:

- `ai-ide-repair-evidence-consumer-contract.json`
- `ai-ide-repair-evidence-consumer-contract.md`

The contract must include:

- source bundle manifest identity and status.
- `artifactReadSequence` for all six repair evidence artifacts.
- artifact roles and direct read dependencies.
- `verificationChecklist` for AI IDE consumption.
- `maintainerReviewBoundary`.
- redaction and non-authorization boundaries.
- inherited blocked actions.

## Boundaries

This consumer contract is guidance and verification material only.

It does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, file mutation, npm publication, GitHub release, public launch, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

## Consequences

- AI IDEs can consume a single generated contract instead of inferring read order and review boundaries from chat context.
- Maintainers can review a Markdown contract before allowing any separate target-repo repair goal.
- The existing bundle manifest remains the source artifact index; the consumer contract is the consumption layer built from it.
- Future target-repo repair automation must continue to require explicit maintainer authorization and separate evidence.
