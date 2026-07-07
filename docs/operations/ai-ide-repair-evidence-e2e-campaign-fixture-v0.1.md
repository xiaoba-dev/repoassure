# AI IDE Repair Evidence End-to-End Campaign Fixture v0.1

Status: ai_ide_repair_evidence_e2e_campaign_fixture_validated

## Summary

This operation adds a local, no-private-source campaign fixture that validates the full AI IDE repair evidence chain:

```text
campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence
```

The fixture lives at:

- `fixtures/ai-ide-repair-evidence-campaign/campaign-summary.json`

The integration contract lives at:

- `tests/integration/playbook-e2e-repair-evidence.test.ts`

The goal is to prove that every JSON and Markdown artifact produced by one stage can be consumed by the next stage, while preserving read order, approval boundary, execution evidence boundary, redaction boundary, and non-authorization boundary.

## Fixture Scope

The fixture contains two synthetic targets:

- `agent-reach`: failed CLI target with action `P1-fix-target-regression`, owned by `maintainer_or_target_repo`, expected to become a `manual_repair_candidate`.
- `odinsight`: passed browser target with no repair action required.

The fixture uses `__FIXTURE_ROOT__` placeholders instead of real target repo paths. The integration test rewrites those placeholders to a temporary path containing a secret-like segment and verifies the generated artifacts do not expose that segment.

## End-to-End Flow

The integration test executes the existing local CLI chain:

```bash
pnpm playbook:generate -- --campaign-summary <campaign-summary.json> --output <dir>
pnpm playbook:consume -- --playbook <ai-ide-repair-playbook.json> --output <dir>
pnpm playbook:decide -- --consumption-report <ai-ide-playbook-consumption-report.json> --output <dir>
pnpm playbook:approve -- --decision-package <ai-ide-repair-decision-package.json> --approvals <approval-decisions.json> --output <dir>
pnpm playbook:plan-approved -- --approval-receipt <ai-ide-repair-approval-receipt.json> --output <dir>
pnpm playbook:evidence -- --execution-plan <ai-ide-approved-repair-execution-plan.json> --evidence <repair-execution-evidence-input.json> --output <dir>
```

The expected output artifacts are:

- `ai-ide-repair-playbook.json`
- `ai-ide-repair-playbook.md`
- `ai-ide-playbook-consumption-report.json`
- `ai-ide-playbook-consumption-report.md`
- `ai-ide-repair-decision-package.json`
- `ai-ide-repair-decision-package.md`
- `ai-ide-repair-approval-receipt.json`
- `ai-ide-repair-approval-receipt.md`
- `ai-ide-approved-repair-execution-plan.json`
- `ai-ide-approved-repair-execution-plan.md`
- `ai-ide-repair-execution-evidence-report.json`
- `ai-ide-repair-execution-evidence-report.md`

## Contract Assertions

The integration test verifies:

- schema versions for all six generated JSON artifact families;
- `P1-fix-target-regression` becomes one `manual_repair_candidate`;
- approval receipt records one approved manual repair candidate;
- approved execution plan contains one approved execution item;
- evidence report records one verified item and zero boundary violations;
- read order compliance is `complete`;
- `nonAuthorizationBoundaryMaintained` is `true`;
- dry-run blocked actions include `target_repo_file_mutation`;
- final Markdown contains the repair execution evidence title, boundary report, and no target repo mutation statement;
- generated JSON and Markdown do not contain the secret-like fixture path segment.

## Verification

TDD and pyramid verification:

- Red: `pnpm vitest run tests/integration/playbook-e2e-repair-evidence.test.ts` failed because `fixtures/ai-ide-repair-evidence-campaign/campaign-summary.json` was missing.
- Green: added the local campaign fixture and reran the integration test successfully.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "repair evidence end-to-end"` failed because this operation document did not exist.
- Green: this operation packet and cascade docs record the validation boundary.

Required gates:

```bash
pnpm vitest run tests/integration/playbook-e2e-repair-evidence.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "repair evidence end-to-end"
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
