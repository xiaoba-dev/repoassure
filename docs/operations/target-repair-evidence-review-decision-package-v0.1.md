# Target Repair Evidence Review Decision Package v0.1

Status: target_repair_evidence_review_decision_package_implemented
Date: 2026-07-09

## Summary

RepoAssure now records maintainer decisions over imported target repair execution evidence:

```bash
pnpm playbook:target-repair-review -- --from-dir <dir>
```

The command reads:

- `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json`
- `target-repair-evidence-review-decisions.json`

It writes:

- `ai-ide-target-repair-evidence-review-decision-package.json`
- `ai-ide-target-repair-evidence-review-decision-package.md`

Schema:

```text
repoassure.ai-ide-target-repair-evidence-review-decision-package.v1
```

## Supported Decisions

- `accept`: maintainer accepts verified target repair evidence for the stated evidence scope.
- `changes_requested`: maintainer asks for additional repair evidence or verification.
- `defer`: maintainer defers review or action.
- `accept_risk`: maintainer records accepted residual risk without turning it into repair authorization.

## Output Contract

The decision package includes:

- source intake report provenance and SHA-256.
- review status and decision summary.
- per-goal review decisions.
- accepted evidence scope.
- change-requested items.
- deferred items.
- risk-accepted items.
- next repair goal recommendations.
- maintainer review boundary.
- redaction boundary.
- non-authorization boundary.
- blocked actions.

## Boundaries

- No target repo material was uploaded.
- No target repo branch, commit, pull request, issue, advisory, or file mutation was created by RepoAssure.
- No npm publication or GitHub release was created.
- No public launch or production marketing announcement was executed.
- No customer contact, pricing/spend change, commercial availability claim, or hosted dashboard availability claim was made.

## Testing

- Unit: `tests/unit/ai-ide-target-repair-evidence-review-decision-package.test.ts`
- Integration: `tests/integration/playbook-target-repair-review.test.ts`
- E2E: `tests/integration/playbook-e2e-repair-evidence.test.ts`
- Type smoke: `tests/type-smoke/acceptance-package-subpaths.ts`
- Structure cascade: `tests/unit/project-structure.test.ts`

## TDD Notes

- Red: added unit coverage for accept / changes_requested / defer / accept_risk decisions; test failed because the module did not exist.
- Green: added package writer, Markdown renderer, CLI script, package exports, type smoke import, and integration coverage.
- E2E: extended the local campaign fixture through `playbook:target-repair-review`.
