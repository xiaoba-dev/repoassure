# Blocked Goal Recovery Resume Attempt Task Package v0.1 Implementation Plan

**Goal:** Convert a reviewed recovery decision receipt into a bounded task package for a later separate resume attempt without executing commands.

### Task 1: Domain contract

- [x] Add failing unit tests for ready, risk-accepted, rejected, deferred, incomplete, boundary-violating, raw-SHA, redaction, and command non-execution behavior.
- [x] Implement typed builder, complete runtime validation, raw-byte provenance, Markdown, and local writer.

### Task 2: CLI and package integration

- [x] Add failing CLI, package export, type-smoke, structure, and campaign E2E tests.
- [x] Add `goal:recover:prepare-resume`, CLI adapter, package contracts, and artifact inventory.

### Task 3: Governance and delivery

- [x] Add ADR-0036 and operations guide; cascade README, PRD, SPEC, PLAN, architecture, testing, acceptance, decision log, and dev log.
- [ ] Run build, typecheck, lint, unit, integration, E2E, full test, hygiene, release check, and goal audit.
- [ ] Complete independent review, PR, branch CI, merge, main CI, checkpoint, and Campaign return before the 07:15 large-goal freeze.
