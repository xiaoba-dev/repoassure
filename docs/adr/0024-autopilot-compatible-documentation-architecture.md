# ADR-0024: Autopilot-Compatible Documentation Architecture

Status: Accepted
Date: 2026-07-08

## Context

RepoAssure already has a mature documentation taxonomy under `docs/product/`, `docs/architecture/`, `docs/design/`, `docs/acceptance/`, `docs/operations/`, `docs/goals/`, and `docs/logs/`.

Project Autopilot prefers stable top-level source-of-truth documents:

- `docs/PRD.md`
- `docs/SPEC.md`
- `docs/DESIGN.md`
- `docs/PLAN.md`

Without these gateway documents, agents must infer product intent, solution boundaries, design direction, and execution order from many distributed files. That increases the risk of stale context, next-goal drift, and product-direction conflicts.

## Decision

Add Autopilot-compatible source-of-truth gateway documents while preserving the existing RepoAssure documentation taxonomy.

Each file is a Source-of-truth gateway for the corresponding product, solution, design, or execution surface.

The gateway documents are:

- `docs/PRD.md`: Product intent source-of-truth gateway.
- `docs/SPEC.md`: Solution and implementation boundary source-of-truth gateway.
- `docs/DESIGN.md`: Design source-of-truth gateway.
- `docs/PLAN.md`: Execution order source-of-truth gateway.

Do not move existing detailed documents as part of this decision. Detailed documents remain in their existing canonical directories, including `docs/product/specs/`, `docs/architecture/specs/`, `docs/design/`, `docs/acceptance/`, `docs/operations/`, `docs/goals/`, and `docs/logs/`.

The gateway documents are authoritative indexes and current-state summaries. They do not replace the detailed documents they point to.

## Source-of-Truth Priority

- Product direction conflict: `docs/PRD.md` points to the governing product sources.
- Solution and boundary conflict: `docs/SPEC.md` points to the governing implementation and architecture sources, constrained by `docs/PRD.md`.
- Design direction conflict: `docs/DESIGN.md` points to design system, website, and future console sources, constrained by `docs/PRD.md` and `docs/SPEC.md`.
- Execution order conflict: `docs/PLAN.md` points to current and next execution sources, constrained by `docs/SPEC.md` and `docs/PRD.md`.

## Consequences

- Project Autopilot and other AI IDEs have stable entrypoints before scanning detailed documentation.
- Existing documents and tests do not need broad path migrations.
- Future goals should update the relevant gateway when product intent, solution boundaries, design direction, or execution order changes.
- Generated acceptance outputs remain in their compatibility paths until their owning commands explicitly migrate.
- This decision does not authorize publishing, repository visibility changes, npm publication, GitHub releases, public launch, customer contact, pricing/spend changes, target repo mutations, or commercial availability claims.
