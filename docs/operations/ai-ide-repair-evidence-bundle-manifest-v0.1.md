# AI IDE Repair Evidence Bundle Manifest v0.1

Status: ai_ide_repair_evidence_bundle_manifest_implemented

## Summary

This operation adds a local AI IDE repair evidence bundle manifest generated from the six existing repair evidence artifacts:

- `ai-ide-repair-playbook.json`
- `ai-ide-playbook-consumption-report.json`
- `ai-ide-repair-decision-package.json`
- `ai-ide-repair-approval-receipt.json`
- `ai-ide-approved-repair-execution-plan.json`
- `ai-ide-repair-execution-evidence-report.json`

The command writes:

- `ai-ide-repair-evidence-bundle-manifest.json`
- `ai-ide-repair-evidence-bundle-manifest.md`

The manifest schema is:

- `repoassure.ai-ide-repair-evidence-bundle-manifest.v1`

The goal is to give an AI IDE one stable local entry point for artifact reading order, schema/version metadata, SHA-256 provenance, current status, next actions, approval boundary, execution evidence boundary, redaction boundary, and non-authorization boundary.

## Runtime Changes

The bundle manifest includes:

- artifact reading order
- artifact inventory
- schema version for each artifact
- SHA-256 hash for each source JSON artifact
- `bundleSummary`
- `nextActions`
- approval boundary
- execution evidence boundary
- redaction boundary
- non-authorization boundary
- inherited blocked actions

The manifest can report `verified_pending_maintainer_review` when the execution evidence report contains verified local evidence with zero boundary violations.

## CLI Smoke

The new local entry point is:

```bash
pnpm playbook:bundle -- --playbook <ai-ide-repair-playbook.json> --consumption-report <ai-ide-playbook-consumption-report.json> --decision-package <ai-ide-repair-decision-package.json> --approval-receipt <ai-ide-repair-approval-receipt.json> --execution-plan <ai-ide-approved-repair-execution-plan.json> --evidence-report <ai-ide-repair-execution-evidence-report.json> --output <dir>
```

Primary smoke test:

- `tests/integration/playbook-bundle.test.ts`

## Verification

TDD and pyramid verification:

- Red: `pnpm vitest run tests/unit/ai-ide-repair-evidence-bundle-manifest.test.ts` failed because `packages/acceptance/src/ai-ide-repair-evidence-bundle-manifest.ts` was missing.
- Green: added repair evidence bundle manifest builder, Markdown renderer, writer, package export, and type-smoke coverage.
- Red: `pnpm vitest run tests/integration/playbook-bundle.test.ts` failed because `pnpm playbook:bundle` did not exist.
- Green: added `scripts/generate-ai-ide-repair-evidence-bundle-manifest.mjs` and `playbook:bundle`.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "repair evidence bundle manifest"` failed because this operation document did not exist.
- Green: this operation packet and cascade docs record the validation boundary.

Required gates:

```bash
pnpm vitest run tests/unit/ai-ide-repair-evidence-bundle-manifest.test.ts
pnpm vitest run tests/integration/playbook-bundle.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "repair evidence bundle manifest"
pnpm build:packages
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test
pnpm repo:hygiene
pnpm release:check
pnpm goal:audit
```

## Non-Authorization Boundary

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, advisory, or file mutation was created.
- No target repo patch was automatically applied.
- No npm publication was executed.
- No GitHub release was executed.
- No public launch or production marketing announcement was executed.
- No customer contact, pricing/spend change, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.
