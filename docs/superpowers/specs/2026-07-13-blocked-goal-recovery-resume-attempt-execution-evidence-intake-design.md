# Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1 Design

## Goal

Import sanitized evidence from a separately executed recovery resume attempt and verify it against the exact bounded task package without executing commands or accepting the evidence on behalf of a maintainer.

## Inputs

- `blocked-goal-recovery-resume-attempt-task-package.json`
- `blocked-goal-recovery-resume-attempt-execution-evidence-input.json`
- The evidence input binds to the exact task package bytes with `sourceTaskPackageSha256`.

## Contract

The output schema is `repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1`.

It records source provenance, intake status, action results, resume command results, verification results, boundary evidence, review checklist, redaction boundary, non-authorization boundary, and blocked actions.

Every task ID must be known, unique, and covered exactly once. A boundary violation takes precedence over completion. A complete status requires all action, command, and verification results to pass. Failed or blocked results remain unresolved. Non-ready source task packages cannot produce complete evidence.

## Boundaries

- The intake never executes action or resume commands.
- Evidence completeness is not maintainer acceptance.
- No target repo mutation, release, launch, customer contact, pricing/spend, repository visibility change, or commercial/hosted availability claim is authorized.
- The source SHA is local integrity evidence, not a digital signature or identity proof.

## Next Boundary

Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1 may later record explicit maintainer acceptance, changes requested, deferral, or risk acceptance.
