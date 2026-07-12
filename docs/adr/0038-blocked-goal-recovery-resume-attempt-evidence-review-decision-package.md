# ADR-0038: Blocked Goal Recovery Resume Attempt Evidence Review Decision Package

Status: Accepted
Date: 2026-07-13

## Context

ADR-0037 imports execution evidence but intentionally does not accept it. A maintainer needs an exact-byte-bound, auditable decision for every action, command, and verification result.

## Decision

Adopt Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1.

- Stable evidence keys identify action, command, and verification results.
- Decisions are `accept`, `changes_requested`, `defer`, and `accept_risk`; missing decisions remain unreviewed.
- Plain acceptance requires passed evidence. Boundary-violating evidence cannot be accepted or risk-accepted.
- Changes requested and deferral veto acceptance; boundary violation has highest priority.
- The package records review decisions only and does not execute commands or close the source goal.

## Consequences

Maintainer acceptance is explicit and locally auditable. Any future closure receipt remains a separate goal.

No target repo mutation, publication, launch, customer contact, pricing/spend, visibility change, or commercial/hosted claim is authorized.
