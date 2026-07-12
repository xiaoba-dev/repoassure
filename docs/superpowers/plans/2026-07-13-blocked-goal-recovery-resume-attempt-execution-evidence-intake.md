# Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1 Implementation Plan

**Goal:** Import and validate evidence from a separate recovery resume attempt without executing commands or accepting evidence automatically.

### Task 1: Domain contract

- [x] Add failing unit tests for complete, failed, blocked, incomplete, boundary-violating, stale-SHA, duplicate/unknown/missing task, redaction, and command non-execution cases.
- [x] Implement typed builder, complete runtime validation, exact-byte provenance, Markdown, and local writer.

### Task 2: CLI and package integration

- [x] Add failing CLI, package export, type-smoke, structure, and campaign E2E tests.
- [x] Add `goal:recover:intake-resume-evidence`, CLI adapter, package contracts, and artifact inventory.

### Task 3: Governance and delivery

- [x] Add ADR-0037 and operations guide; cascade README, PRD, SPEC, PLAN, architecture, testing, acceptance, decision log, and dev log.
- [x] Run build, typecheck, lint, unit, integration, E2E, full test, hygiene, release check, and goal audit.
- [ ] Complete independent review, PR, branch CI, merge, main CI, and checkpoint before the 07:15 large-goal freeze.
