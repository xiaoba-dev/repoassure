# Blocked Goal Recovery Resume Attempt Closure Receipt v0.1 Implementation Plan

**Goal:** Produce an exact-source-bound local closure receipt for accepted resume-attempt evidence review packages.

### Task 1: TDD domain contract

- [x] Add failing tests for accepted, accepted-risk, stale SHA, risk acknowledgement, malformed source, non-accepted state, redaction, and no-execution behavior.
- [x] Implement strict review-package validation and typed closure receipt builder/writer/Markdown.

### Task 2: CLI and package contracts

- [x] Add `goal:recover:close-resume-attempt`, package exports, compatibility/type-smoke, integration smoke, and near-real campaign coverage.

### Task 3: Governance and acceptance

- [x] Add ADR-0039, operations guide, and cascade updates.
- [x] Run independent review, full testing pyramid, and initial PR CI.
- [ ] Merge after final PR CI and verify main CI.
