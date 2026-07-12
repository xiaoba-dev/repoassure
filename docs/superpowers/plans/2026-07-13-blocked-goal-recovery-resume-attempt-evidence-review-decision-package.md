# Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1 Implementation Plan

**Goal:** Record exact-byte-bound maintainer decisions over imported resume-attempt evidence without executing commands.

### Task 1: Domain and CLI

- [ ] Add failing unit tests for accepted, risk, changes, defer, missing, boundary, stale-SHA, unknown/duplicate decisions, redaction, and no-execution behavior.
- [ ] Implement typed builder/writer/Markdown, strict intake validation, decision state machine, and `goal:recover:review-resume-evidence` CLI.

### Task 2: Contracts and governance

- [ ] Add package export, type-smoke, campaign E2E, ADR-0038, operations guide, and documentation cascade.
- [ ] Run full testing pyramid, independent review, PR/CI/merge, and main CI before the 07:15 large-goal freeze.
