# AI IDE Repair Evidence Bundle Consumer Contract v0.1

Status: ai_ide_repair_evidence_consumer_contract_implemented
Date: 2026-07-08

## Summary

RepoAssure now generates a local AI IDE consumer contract from the repair evidence bundle manifest.

The new command is:

```bash
pnpm playbook:contract -- --from-dir <dir>
```

It writes:

- `ai-ide-repair-evidence-consumer-contract.json`
- `ai-ide-repair-evidence-consumer-contract.md`

The JSON schema is:

```text
repoassure.ai-ide-repair-evidence-consumer-contract.v1
```

## Contract Fields

- `sourceManifest`: bundle manifest identity, status, artifact counts, path, and SHA-256.
- `artifactReadSequence`: direct AI IDE reading order for playbook, consumption report, decision package, approval receipt, approved execution plan, and execution evidence report.
- `verificationChecklist`: checks an AI IDE must complete before proposing any target repo repair action.
- `maintainerReviewBoundary`: explicit reminder that maintainer review is still required.
- `redactionBoundary`: inherited local evidence redaction boundary.
- `nonAuthorizationBoundary`: inherited publication, launch, target-repo mutation, and commercial-claim boundary.
- `blockedActions`: inherited forbidden actions.

## Verification

- Unit contract: `tests/unit/ai-ide-repair-evidence-consumer-contract.test.ts`
- CLI smoke: `tests/integration/playbook-contract.test.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Record

- Red: added unit tests for `repoassure.ai-ide-repair-evidence-consumer-contract.v1`; test failed because the module did not exist.
- Green: implemented `packages/acceptance/src/ai-ide-repair-evidence-consumer-contract.ts`, Markdown rendering, file writer, and directory discovery.
- Red: added CLI smoke for `pnpm playbook:contract`; test failed because the script and package command did not exist.
- Green: added `scripts/generate-ai-ide-repair-evidence-consumer-contract.mjs` and `playbook:contract`.
- Red: added structure cascade test; test failed because ADR-0025 and operation docs did not exist.
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
