# AI IDE Repair Execution Replay Readiness v0.1

Status: ai_ide_repair_execution_replay_readiness_implemented
Date: 2026-07-08

## Summary

RepoAssure now generates a local replay readiness report from the AI IDE repair evidence consumer contract.

The new command is:

```bash
pnpm playbook:replay -- --from-dir <dir>
```

It writes:

- `ai-ide-repair-execution-replay-readiness.json`
- `ai-ide-repair-execution-replay-readiness.md`

The JSON schema is:

```text
repoassure.ai-ide-repair-execution-replay-readiness.v1
```

## Contract Fields

- `sourceConsumerContract`: source consumer contract identity, readiness, artifact count, path, and SHA-256.
- `artifactReplay`: replay status for every artifact in the consumer contract read sequence.
- `verificationReplay`: replayed checklist items and blocked action checks.
- `boundaryReplay`: maintainer review, redaction, non-authorization, blocked action, and unauthorized action status.
- `nextReviewDecision`: maintainer-facing next review decision before any target repo repair goal.
- `blockedActions`: inherited forbidden actions.

## Verification

- Unit contract: `tests/unit/ai-ide-repair-execution-replay-readiness.test.ts`
- CLI smoke: `tests/integration/playbook-replay.test.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Record

- Red: added unit tests for `repoassure.ai-ide-repair-execution-replay-readiness.v1`; test failed because the module did not exist.
- Green: implemented `packages/acceptance/src/ai-ide-repair-execution-replay-readiness.ts`, Markdown rendering, file writer, and directory discovery.
- Red: added CLI smoke for `pnpm playbook:replay`; test failed because the script and package command did not exist.
- Green: added `scripts/generate-ai-ide-repair-execution-replay-readiness.mjs` and `playbook:replay`.
- Red: added structure cascade test; test failed because ADR-0026 and operation docs did not exist.
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
