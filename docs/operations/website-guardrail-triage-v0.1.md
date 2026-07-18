# Website Guardrail Triage v0.1

Status: completed
Date: 2026-07-19
Basis: [ADR-0022](../adr/0022-repoassure-design-system-v2-and-information-architecture.md) decisions 12 and 13

## Purpose

The design sequence changed the website's information architecture, its copy in two locales, its theme, and the Project Intelligence Console's output. Every one of those changes touched assertions.

That is the point in a redesign where test suites quietly degrade. The cheapest way to make a failing assertion pass is to delete it, and six quality gates stay green either way. This record exists so the direction of change is checkable rather than asserted.

## Rule applied

Assertions were re-baselined, never removed to obtain green.

Concretely:

- **Boundary assertions were preserved verbatim.** Nothing about blocked actions, local-only output, no-write proofs, locale scope, focus-visible, or horizontal overflow was touched.
- **State-snapshot assertions were rewritten**, because the state legitimately changed by owner decision. Where a literal forced an edit on every goal completion, it was replaced with the relational invariant it was standing in for.
- **New behaviour got new assertions** rather than relying on existing coverage.

## Evidence

Measured from `22f65f3`, the commit where the design sequence began with the repository fully under version control, to the end of the console redesign.

| File | Before | After | Change |
| --- | --- | --- | --- |
| `design-system.test.ts` | 0 | 23 | +23 |
| `evidence-integrity.test.ts` | 0 | 25 | +25 |
| `project-intelligence-ignore.test.ts` | 0 | 14 | +14 |
| `project-intelligence-viewer.test.ts` | 25 | 37 | +12 |
| `public-website.test.ts` | 201 | 226 | +25 |
| `project-structure.test.ts` | 2196 | 2199 | +3 |
| **Total** | **4318** | **4420** | **+102** |

No file's assertion count decreased.

Forbidden-claim patterns went from 12 to 25, and the suite now contains a test asserting the patterns actually fire on every integrity claim the site previously shipped, and do not fire on the replacement copy. That test found two holes in the first pass of the new patterns.

## Assertions deliberately changed, with reasons

**Governance state literals.** `index.active_goal_id` and `progress.current_stage` were pinned to exact strings. Both change on every goal completion, so pinning them produced churn rather than protection. They now assert the real invariants: that the two progress files agree with each other, and that the active goal is a registered member of the ADR-0022 sequence with a valid status.

**Superseded copy strings.** Assertions on `Assure every AI-generated repo before it ships`, `All artifacts are signed and stored locally.`, `#04111f`, and `--surface-hero: #04111f` were updated to the replacement values. The claim, bilingual-parity, and structural guarantees around them were kept.

**Design queue state.** `deferred_design_pending` assertions were updated to the released state, and the superseded operation record now asserts its own supersession rather than the state it used to describe.

## Boundaries preserved

Verified present after the sequence:

- Generated console output contains no `http://` or `https://`
- `data-local-only="true"` on the console body
- "No hosted dashboard" boundary text
- `targetRepoWriteAuthorized: false` no-write proof
- Locale set is exactly `['en', 'zh-CN']`
- `:focus-visible` coverage in both themes
- Horizontal overflow bound

## Boundary

- No assertion was deleted to make a failing test pass.
- No quality gate was disabled, skipped, or narrowed.
- One pre-existing flake was found and recorded rather than silenced: `writes a Python CLI acceptance record without running web hardening` in `tests/unit/user-acceptance.test.ts` fails intermittently under parallel execution and passes in isolation. It shells out to real Python tooling. It was not touched as part of this work.
- No deployment, public launch, repository visibility change, npm publication, GitHub release, or public custom domain decision was performed.
