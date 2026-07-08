# AI IDE Repair Evidence Bundle E2E Automation v0.1

Status: ai_ide_repair_evidence_bundle_e2e_automation_implemented

## Purpose

This operation upgrades the AI IDE repair evidence bundle manifest from a manually wired six-path command into a directory-discovery entry point that can be appended to the existing repair evidence campaign flow.

The intended local evidence chain is:

`campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle manifest`

## Outputs

- `ai-ide-repair-evidence-bundle-manifest.json`
- `ai-ide-repair-evidence-bundle-manifest.md`

Both outputs keep schema `repoassure.ai-ide-repair-evidence-bundle-manifest.v1` and are generated locally.

## CLI

```text
pnpm playbook:bundle -- --from-dir <dir>
pnpm playbook:bundle -- --from-dir <dir> --output <dir>
```

The legacy explicit-path mode remains supported:

```text
pnpm playbook:bundle -- --playbook <ai-ide-repair-playbook.json> --consumption-report <ai-ide-playbook-consumption-report.json> --decision-package <ai-ide-repair-decision-package.json> --approval-receipt <ai-ide-repair-approval-receipt.json> --execution-plan <ai-ide-approved-repair-execution-plan.json> --evidence-report <ai-ide-repair-execution-evidence-report.json> --output <dir>
```

## Artifact Discovery Contract

`--from-dir <dir>` reads these local files from the same directory:

1. `ai-ide-repair-playbook.json`
2. `ai-ide-playbook-consumption-report.json`
3. `ai-ide-repair-decision-package.json`
4. `ai-ide-repair-approval-receipt.json`
5. `ai-ide-approved-repair-execution-plan.json`
6. `ai-ide-repair-execution-evidence-report.json`

The manifest records artifact reading order, schema/version, SHA-256 provenance, current status, next actions, approval boundary, execution evidence boundary, redaction boundary, non-authorization boundary, and inherited blocked actions.

## Tests

- `tests/unit/ai-ide-repair-evidence-bundle-manifest.test.ts`
- `tests/integration/playbook-bundle.test.ts`
- `tests/integration/playbook-e2e-repair-evidence.test.ts`
- `tests/unit/project-structure.test.ts`

## TDD Notes

- Red: `pnpm vitest run tests/unit/ai-ide-repair-evidence-bundle-manifest.test.ts -t "discovers the repair evidence artifact chain"` failed because `writeAiIdeRepairEvidenceBundleManifestFromDirectory` was missing.
- Green: added the directory discovery writer that resolves the six canonical artifact names from `inputDir`.
- Red: `pnpm vitest run tests/integration/playbook-bundle.test.ts -t "from one directory"` failed because `--from-dir` was unknown.
- Green: added `--from-dir <dir>` support while preserving the explicit six-path CLI mode.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "bundle E2E automation"` failed because this operation document was missing.
- Green: added this operation packet and cascaded the decision into README, testing strategy, acceptance checklist, decision log, and dev log.

## Boundaries

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, advisory, or file mutation was created.
- No target repo patch was automatically applied.
- No npm publication was executed.
- No GitHub release was executed.
- No public launch or production marketing announcement was executed.
- No customer contact was executed.
- No pricing or spend change was executed.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was made.
