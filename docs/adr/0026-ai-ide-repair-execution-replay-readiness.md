# ADR-0026: AI IDE Repair Execution Replay Readiness

Status: Accepted
Date: 2026-07-08

## Context

ADR-0025 added the AI IDE repair evidence consumer contract. That contract tells an AI IDE how to read a repair evidence bundle, but maintainers still need a separate, replayable readiness check before starting a target-repo repair goal.

Without an explicit replay readiness report, an AI IDE or maintainer may have to infer whether artifact read order, verification checklist replay, blocked actions, maintainer review, redaction, and non-authorization boundaries were all preserved.

## Decision

Add an AI IDE repair execution replay readiness report generated from `ai-ide-repair-evidence-consumer-contract.json`.

The replay readiness schema is:

```text
repoassure.ai-ide-repair-execution-replay-readiness.v1
```

The CLI entry is:

```bash
pnpm playbook:replay -- --from-dir <dir>
```

The command writes:

- `ai-ide-repair-execution-replay-readiness.json`
- `ai-ide-repair-execution-replay-readiness.md`

The report must include:

- source consumer contract identity, readiness, artifact count, and SHA-256.
- `artifactReplay` for each required artifact read step.
- `verificationReplay` for checklist replay and blocked action checks.
- `boundaryReplay` for maintainer review, redaction, non-authorization, blocked actions, and unauthorized actions.
- `nextReviewDecision` that tells the maintainer whether the evidence is ready for replay review.
- inherited blocked actions and boundaries.

## Boundaries

This replay readiness report is review evidence only.

It does not authorize target repo mutation, branch creation, commits, pull requests, issues, advisories, file mutation, npm publication, GitHub release, public launch, customer contact, pricing/spend changes, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

## Consequences

- Maintainers can review one replay readiness report before opening any separate target-repo repair goal.
- AI IDEs get a machine-readable gate that confirms read order, verification checklist replay, and boundary enforcement.
- The consumer contract remains the source consumption instruction; replay readiness is the review layer built from it.
- Future target-repo repair automation must still require explicit maintainer authorization and separate evidence.
