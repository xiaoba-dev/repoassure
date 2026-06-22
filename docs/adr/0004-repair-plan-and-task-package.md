# ADR-0004: Repair Plan and Executable Task Package

- Status: Accepted
- Date: 2026-06-20
- Deciders: hardening-mcp maintainers

## Context

Initial hardening reports were useful for humans but too broad for AI IDEs to consume deterministically. Agents need structured repair intent, scope, evidence, acceptance criteria, and handoff prompts. They also need a human-readable companion artifact for review.

## Decision

Generate both repair plans and executable repair task packages for each hardening run:

- `repair-plan.json`
- `repair-plan.md`
- `repair-task-package.json`
- `repair-task-package.md`

The task package turns findings into scoped repair tasks with objective, context, recommended fix, expected outcome, change scope, implementation steps, acceptance criteria, and handoff prompt.

## Consequences

### Positive

- AI IDEs receive a more actionable repair contract than raw findings.
- Human reviewers can inspect Markdown artifacts.
- User acceptance can verify that task packages are generated and available.

### Negative

- Duplicate or noisy findings can create duplicate repair tasks if classification is weak.
- The task package generator must stay synchronized with finding schema and report generation.

### Follow-up

- Add same-root-cause grouping for repeated findings.
- Include product-level false-positive classification in future task packages.

