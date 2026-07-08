# Documentation Taxonomy Spec v0.1

Status: Accepted
Date: 2026-06-20
ADR: [ADR-0007](../../adr/0007-documentation-taxonomy-and-naming.md)

## Purpose

Define a stable `docs/` taxonomy so humans, Codex, AI IDEs, and automation can quickly identify document purpose, lifecycle, and compatibility requirements from the path.

## Principles

- Directory names define document class.
- Filenames define subject, version, date, or record state.
- Stable evolving documents use versions.
- Historical records and completed goals use date-prefixed names.
- Generated command outputs keep compatibility paths until the owning command can safely migrate.
- `README.md` files are indexes, not primary long-form specs.

## Canonical Topology

```text
docs/
  PRD.md
  SPEC.md
  DESIGN.md
  PLAN.md
  adr/
  architecture/
    overview.md
    specs/
    spikes/
  product/
    specs/
    research/
    strategy/
  acceptance/
    guides/
    checklists/
    records/
      <repo-slug>/
  testing/
    strategy/
    samples/
  operations/
  goals/
    codex-goal.md
    active/
    completed/
  logs/
```

## Naming Rules

| Document class | Directory | Pattern | Example |
| --- | --- | --- | --- |
| Autopilot-compatible source-of-truth gateways | `docs/` | `PRD.md`, `SPEC.md`, `DESIGN.md`, `PLAN.md` | `docs/PRD.md` |
| ADR | `docs/adr/` | `NNNN-short-title.md` | `0007-documentation-taxonomy-and-naming.md` |
| Architecture overview | `docs/architecture/` | `overview.md` | `overview.md` |
| Architecture spec | `docs/architecture/specs/` | `<subject>-spec-vX.Y.md` | `monorepo-structure-spec-v0.1.md` |
| Technical spike | `docs/architecture/spikes/` | `<subject>-vX.Y.md` | `technical-spike-plan-v0.1.md` |
| Product spec | `docs/product/specs/` | `<subject>-spec-vX.Y.md` | `mvp-spec-v0.2.md` |
| Product research | `docs/product/research/` | `<subject>-vX.Y.md` | `user-interview-script-v0.1.md` |
| Product strategy | `docs/product/strategy/` | `<subject>-vX.Y.md` | `commercialization-strategy-v0.1.md` |
| Acceptance guide | `docs/acceptance/guides/` | `<subject>-guide.md` | `user-acceptance-guide.md` |
| Acceptance checklist | `docs/acceptance/checklists/` | `<subject>-vX.Y.md` | `acceptance-checklist-v0.1.md` |
| Acceptance record | `docs/acceptance/records/<repo-slug>/` | `YYYY-MM-DD-<state>.md` | `2026-06-20-after-repair.md` |
| Testing strategy | `docs/testing/strategy/` | `<subject>-vX.Y.md` | `test-strategy-v0.1.md` |
| Testing sample | `docs/testing/samples/` | `<subject>.md` | `sample-hardening-report.md` |
| Operations guide | `docs/operations/` | `<subject>-vX.Y.md` | `branch-protection-release-boundary-v0.1.md` |
| Long-running goal | `docs/goals/` | `<subject>.md` | `codex-goal.md` |
| Active scoped goal | `docs/goals/active/` | `YYYY-MM-DD-<subject>.md` | `2026-06-25-v0.3-distribution-repair-loop-readiness.md` |
| Completed goal | `docs/goals/completed/` | `YYYY-MM-DD-<subject>.md` | `2026-06-20-structure-refactor.md` |
| Log | `docs/logs/` | `<subject>-log.md` or `<subject>.md` | `dev-log.md` |

## Migration Map

| Previous path | Canonical path | Status |
| --- | --- | --- |
| `docs/architecture/architecture.md` | `docs/architecture/overview.md` | Migrated |
| `docs/architecture/monorepo-structure-v0.1.md` | `docs/architecture/specs/monorepo-structure-spec-v0.1.md` | Migrated |
| `docs/architecture/technical-spike-plan.md` | `docs/architecture/spikes/technical-spike-plan-v0.1.md` | Migrated |
| `docs/product/mvp-spec-v0.1.md` | `docs/product/specs/mvp-spec-v0.1.md` | Migrated |
| `docs/product/mvp-spec-v0.2.md` | `docs/product/specs/mvp-spec-v0.2.md` | Migrated |
| `docs/product/user-interview-script.md` | `docs/product/research/user-interview-script-v0.1.md` | Migrated |
| `docs/acceptance/user-acceptance-guide.md` | `docs/acceptance/guides/user-acceptance-guide.md` | Migrated |
| `docs/acceptance/acceptance-checklist.md` | `docs/acceptance/checklists/acceptance-checklist-v0.1.md` | Migrated |
| `docs/acceptance/user-acceptance-record.odinsight.md` | `docs/acceptance/records/odinsight/2026-06-20-initial.md` | Migrated |
| `docs/acceptance/user-acceptance-record.odinsight-after-repair.md` | `docs/acceptance/records/odinsight/2026-06-20-after-repair.md` | Migrated |
| `docs/acceptance/user-acceptance-record.rotifer-alpha.md` | `docs/acceptance/records/rotifer-alpha/2026-06-18-initial.md` | Migrated |
| `docs/testing/test-strategy.md` | `docs/testing/strategy/test-strategy-v0.1.md` | Migrated |
| `docs/testing/sample-hardening-report.md` | `docs/testing/samples/sample-hardening-report.md` | Migrated |
| `docs/goals/codex-goal-structure-refactor.md` | `docs/goals/completed/2026-06-20-structure-refactor.md` | Migrated |
| `docs/goals/codex-goal-repair-plan-v0.2.md` | `docs/goals/completed/2026-06-20-repair-plan-v0.2.md` | Migrated |

## Compatibility Exceptions

`docs/PRD.md`, `docs/SPEC.md`, `docs/DESIGN.md`, and `docs/PLAN.md` are source-of-truth gateway documents. They provide Autopilot-compatible entrypoints and current-state summaries. Detailed documents remain in their existing canonical directories and should not be moved merely to satisfy gateway discovery.

Do not move generated acceptance outputs until the owning commands support compatibility paths:

- `docs/acceptance/acceptance-run.md`
- `docs/acceptance/goal-completion-audit.md`
- `docs/acceptance/user-acceptance-handoff.md`
- `docs/acceptance/user-acceptance-record.md`

These files are command outputs and current acceptance evidence, not stable authored documentation. Their target taxonomy can be revisited during the `packages/acceptance` migration.

## Acceptance Criteria

- ADR-0007 is listed in the ADR index.
- README links to this spec.
- Project structure tests guard canonical paths.
- Runtime references to moved stable documents are updated.
- Generated acceptance output paths remain compatible.
