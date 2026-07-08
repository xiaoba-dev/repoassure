# AI IDE Repair Replay Real Campaign Validation v0.1

Status: ai_ide_repair_replay_real_campaign_validation_implemented
Date: 2026-07-08

## Summary

RepoAssure now validates the full near-real AI IDE repair evidence chain:

```text
campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay
```

The validation starts from `fixtures/ai-ide-repair-evidence-campaign/campaign-summary.json` and proves the final local output includes:

- `ai-ide-repair-evidence-bundle-manifest.json`
- `ai-ide-repair-evidence-consumer-contract.json`
- `ai-ide-repair-execution-replay-readiness.json`

The replay readiness output reaches `ready_for_maintainer_replay_review` and `nextReviewDecision.decision = maintainer_review_ready` when the fixture evidence is complete, verified, and pending maintainer review.

## Implementation Notes

- `tests/integration/playbook-e2e-repair-evidence.test.ts` now runs `playbook:contract` and `playbook:replay` after `playbook:bundle`.
- `packages/acceptance/src/ai-ide-repair-execution-replay-readiness.ts` now treats real campaign sanitized-boundary wording as a maintained redaction boundary.
- `tests/unit/ai-ide-repair-execution-replay-readiness.test.ts` covers `sanitized summaries only; never store secrets` wording.

## Verification

- Unit: `tests/unit/ai-ide-repair-execution-replay-readiness.test.ts`
- Integration: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Record

- Red: extended the E2E campaign fixture to require consumer contract and replay readiness artifacts; test failed because the chain stopped after bundle manifest generation.
- Green: added `playbook:contract` and `playbook:replay` to the E2E chain.
- Red: E2E then failed because real campaign redaction wording used `sanitized summaries only; never store secrets` rather than the literal word `redact`.
- Red: added unit coverage for sanitized-summary wording; test failed because the boundary checker was too narrow.
- Green: updated replay readiness redaction boundary detection to accept equivalent sanitized / never-store sensitive data wording while still requiring a sensitive subject.
- Red: added structure cascade test; test failed because ADR-0027 and operation docs did not exist.
- Green: added ADR, operation packet, and documentation cascade.

## Boundaries

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, advisory, or file mutation was created.
- No target repo patch was automatically applied.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public launch or production marketing announcement was executed.
- No customer contact was authorized.
- No pricing change or spend was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
