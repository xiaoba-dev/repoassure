# AI IDE Playbook Real Campaign Consumption Validation v0.1

Status: ai_ide_playbook_real_campaign_consumption_validated

## Summary

This operation validates that the AI IDE repair execution playbook can consume a real-campaign-shaped `campaign-summary.json` without requiring target repo source, private artifacts, or automatic target repo mutation.

The validation covers:

- passed / blocked / failed target statuses
- environment blocker targets
- repair-plan action queue entries such as `P0-improve-repair-plan`
- target-stack action queue entries such as `P1-document-target-stack`
- generated `ai-ide-repair-playbook.json`
- generated `ai-ide-repair-playbook.md`

The goal is to ensure an AI IDE or maintainer can read one playbook and understand:

1. which target repos passed, failed, or were blocked;
2. which action queue item to inspect first;
3. which local artifacts to read before opening `repair-task-package.json`;
4. which verification checklist to run after maintainer-approved changes;
5. where the maintainer review boundary stops automation.

## Runtime Changes

The playbook now includes:

- `campaignContext.targetStatusMatrix`
- `executionPlan[].targetContexts`
- `aiIdeConsumptionChecklist`

These fields preserve the full campaign status context instead of only listing action queue rows.

## Script Smoke

The script-level smoke test writes a synthetic, no-source campaign summary and runs:

```bash
pnpm playbook:generate -- --campaign-summary <campaign-summary.json> --output <dir>
```

The smoke verifies:

- schema `repoassure.ai-ide-repair-execution-playbook.v1`
- JSON output path `ai-ide-repair-playbook.json`
- Markdown output path `ai-ide-repair-playbook.md`
- readable `Campaign Target Matrix`
- readable `AI IDE consumption checklist`
- maintainer review boundary
- sensitive path segment redaction

Primary test:

- `tests/integration/playbook-generate.test.ts`

## Verification

TDD and pyramid verification:

- Red: `pnpm vitest run tests/unit/ai-ide-repair-playbook.test.ts` failed because `campaignContext` was missing.
- Green: added `campaignContext.targetStatusMatrix`, `targetContexts`, `aiIdeConsumptionChecklist`, and Markdown sections.
- Smoke: `pnpm vitest run tests/integration/playbook-generate.test.ts` generates JSON and Markdown through `pnpm playbook:generate`.
- Red: `pnpm vitest run tests/unit/project-structure.test.ts -t "real campaign consumption"` failed because this operation document did not exist.
- Green: this operation packet and cascade docs record the validation boundary.

Required gates:

```bash
pnpm vitest run tests/unit/ai-ide-repair-playbook.test.ts
pnpm vitest run tests/integration/playbook-generate.test.ts
pnpm vitest run tests/unit/project-structure.test.ts -t "real campaign consumption"
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
- No target repo branch, commit, pull request, issue, or advisory was created.
- No target repo patch was automatically applied.
- No npm publication was executed.
- No GitHub release was executed.
- No public launch or production marketing announcement was executed.
- No customer contact, pricing/spend change, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.
