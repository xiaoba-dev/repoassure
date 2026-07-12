# Blocked Goal Recovery Decision Receipt v0.1 Implementation Plan

> **For agentic workers:** Use TDD and complete each checkbox with current evidence.

**Goal:** Record explicit maintainer decisions over every consumed blocked-goal recovery action before any separate resume attempt.

## Constraints

- Work in the isolated worktree based on merge commit `21c3d71`.
- Apply Red-Green-Refactor to each behavior change.
- Preserve local-first output, canonical non-authorization boundaries, raw-byte provenance, and redaction.
- Do not execute recovery commands or mutate target repos.

### Task 1: Add stable action identity

- [ ] Add failing unit assertions for deterministic `actionKey` values across automatic, maintainer, and external actions.
- [ ] Implement minimal stable action identity in the consumption report.
- [ ] Verify existing consumption JSON, Markdown, CLI, and E2E behavior remains compatible.

### Task 2: Implement the decision receipt domain

- [ ] Add failing unit tests for approve, reject, defer, accept-risk, missing, duplicate, unknown, and redacted decisions.
- [ ] Implement typed receipt builder, raw-byte provenance, runtime validation, Markdown renderer, and local writer.
- [ ] Verify decision status and separate-resume readiness are derived from evidence rather than trusted flags.

### Task 3: Add CLI and campaign integration

- [ ] Add failing integration, package export, type-smoke, structure, and near-real E2E assertions.
- [ ] Add `pnpm --silent goal:recover:decide`, CLI adapter, package subpath, compatibility entry, and artifact inventory.
- [ ] Verify JSON/Markdown readability, error redaction, and no command execution.

### Task 4: Cascade governance and close delivery

- [ ] Add ADR-0035 and operations guide; cascade README, PRD, SPEC, PLAN, architecture, testing, acceptance, decision log, dev log, and blocker log where applicable.
- [ ] Run build, typecheck, lint, unit, integration, E2E, full test, repo:hygiene, release:check, and goal:audit.
- [ ] Complete independent review, commit, PR, CI, merge, main CI, checkpoint, and return to Autopilot.
