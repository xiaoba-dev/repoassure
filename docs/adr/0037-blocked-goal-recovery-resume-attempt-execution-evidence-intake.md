# ADR-0037: Blocked Goal Recovery Resume Attempt Execution Evidence Intake

Status: Accepted
Date: 2026-07-13

## Context

ADR-0036 creates a bounded task package but does not prove that a separate resume attempt ran or succeeded. Maintainers need local, structured evidence tied to the exact task package before making an acceptance decision.

## Decision

Adopt Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1.

- `pnpm --silent goal:recover:intake-resume-evidence -- --from-dir <dir>` imports external action, command, verification, and boundary evidence.
- Evidence binds to the exact task package bytes with SHA-256.
- Unknown or duplicate task IDs and unsafe evidence fail validation; missing tasks remain incomplete.
- Boundary violation takes precedence over failed, incomplete, or complete evidence.
- `complete_for_maintainer_review` means evidence is complete, not accepted.
- The intake does not execute any action or resume command.

## Consequences

Recovery attempts gain an auditable result boundary. Explicit maintainer acceptance remains a separate Evidence Review Decision Package v0.1.

No target repo mutation, publication, launch, customer contact, pricing/spend, visibility change, or commercial/hosted claim is authorized.
