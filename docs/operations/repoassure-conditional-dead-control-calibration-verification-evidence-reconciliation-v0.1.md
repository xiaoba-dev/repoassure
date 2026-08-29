# RepoAssure Conditional Dead Control Calibration Verification Evidence Reconciliation v0.1

Status: `completed`

Conclusion:
`conditional_dead_control_verification_evidence_reconciled_with_durable_errata_without_product_or_historical_record_changes`

Effective from: `2026-08-03T08:15:58+08:00`

## Authorization And Scope

- This exact local evidence-reconciliation Goal received explicit user
  authorization in the current task on 2026-08-03.
- This record is a durable errata/addendum for future replay. It does not
  replace or silently edit the historical Architecture Handoff or detector
  implementation operation record.
- Evidence source: the separately authorized completion audit and its retained
  local command results from 2026-08-03.
- `replayed_by_reconciliation_goal=false`: this Goal did not rerun detector or
  behavior-test suites.

## Authoritative Verification Map

| Evidence set | Authoritative command or membership | Retained result | Replayed here |
| --- | --- | --- | --- |
| Bounded cases | `pnpm exec vitest run tests/unit/playwright-driver.test.ts -t "(conditional\|fails closed\|uses a deterministic distinct value\|keeps a dangerous disabled submit)"` | 23 passed, 16 skipped, 39 discovered | no |
| Full driver | `pnpm exec vitest run tests/unit/playwright-driver.test.ts --reporter=verbose` | 39/39 passed | no |
| Companion aggregate | `playwright-driver`, `explore-app`, synthetic fixture, catalog, catalog consumption, calibration contract, and contract consumption; 7 files | 76/76 passed | no |
| Downstream aggregate | `mcp-tool-registry`, `harden-report`, `generate-tests`, `repair-plan`, `cli-generated-artifacts`, `explore-tool`, `generate-tests-tool`, `harden-report-tool`, and `run-hardening-tool`; 9 files | 81/81 passed | no |
| Serial driver | `pnpm exec vitest run tests/unit/playwright-driver.test.ts --maxWorkers=1 --no-file-parallelism` | 39/39 passed | no |

Copy/paste commands for a future separately authorized replay:

```text
pnpm exec vitest run tests/unit/playwright-driver.test.ts -t "(conditional|fails closed|uses a deterministic distinct value|keeps a dangerous disabled submit)"
pnpm exec vitest run tests/unit/playwright-driver.test.ts --reporter=verbose
pnpm exec vitest run tests/unit/playwright-driver.test.ts tests/unit/explore-app.test.ts tests/unit/conditional-dead-control-synthetic-fixture.test.ts tests/unit/false-positive-catalog.test.ts tests/unit/false-positive-catalog-consumption.test.ts tests/unit/false-positive-detector-calibration-contract.test.ts tests/unit/false-positive-detector-calibration-contract-consumption.test.ts
pnpm exec vitest run tests/unit/mcp-tool-registry.test.ts tests/unit/harden-report.test.ts tests/unit/generate-tests.test.ts tests/unit/repair-plan.test.ts tests/integration/cli-generated-artifacts.test.ts tests/integration/explore-tool.test.ts tests/integration/generate-tests-tool.test.ts tests/integration/harden-report-tool.test.ts tests/integration/run-hardening-tool.test.ts
pnpm exec vitest run tests/unit/playwright-driver.test.ts --maxWorkers=1 --no-file-parallelism
```

These commands are evidence coordinates, not execution authorization.

The only supported set relationship is:

```text
23 ⊂ 39 ⊂ 76
81 = independent downstream aggregate
```

The 23 cases are a title-filtered subset of the 39-test driver file. The
39-test driver file is included in the 76-test companion aggregate. The 81-test
downstream aggregate is separate; it is not a fourth subset level and the four
counts are not added into a unique-test total.

## Command Errata

- Historical focused command:
  `pnpm exec vitest run tests/unit/playwright-driver.test.ts -t "conditional dead control"`.
  It currently selects 6 tests, not the authoritative 23-case bounded set.
- Supported Vitest `4.1.9` serial flags:
  `--maxWorkers=1 --no-file-parallelism`.
- Historical `--minWorkers=1` is rejected by Vitest 4.1.9 as an unknown option
  and remains only as historical command drift.
- The historical documents remain unchanged so their original instructions
  stay auditable; future replay should follow this addendum.

## SDK And Environment Reconciliation

| Layer | Value | Evidence status |
| --- | --- | --- |
| Manifest declaration | `@modelcontextprotocol/sdk: ^1.29.0` | current local fact |
| Lockfile and installed workspace | current workspace resolution: `1.29.0` | current local fact |
| Historical lockless packed consumer | claimed `1.30.0` | `unverified_historical_diagnostic` |
| Retained historical stderr / receipt / replay | none | not independently replayable |

The current empty pnpm-store observation neither proves nor disproves the
historical store state. No network request, install, packed validation, or
dependency mutation was used to fill the missing receipt.

## Provenance Boundary

- HEAD observed during reconciliation:
  `58ed41d267d2a69aff6955ac63c3f4c1edc5a14c`.
- The repository had a dirty/untracked worktree with 288 porcelain entries at
  observation time.
- Current hashes and scoped diffs can prove present content and bounded
  before/after equality. They cannot prove clean-commit authorship or assign
  all unrelated dirty changes to this Goal.
- Untracked fixture hashes prove current byte equality only.
- Historical records silently rewritten: no.

Historical-record baselines retained by this Goal:

- Architecture Handoff SHA-256:
  `8617e2f794569eea2dd43cf9b993e87bff2731a7ff560a178112c38040c58f3a`.
- Detector implementation operation record SHA-256:
  `14ff274dc42e95a5df218d44b893ba0775124e8b47deb99c0bf681803a864da7`.

Protected product/test/dependency baselines retained and rechecked:

- `packages/browser-explorer/src/playwright-driver.ts`:
  `b339128d00e067c52a25e5dd238b5b5bb07954570a1fcd54dff228b68d2dc316`.
- `tests/unit/playwright-driver.test.ts`:
  `6a6c716dd2ba6d340c8e3d3ad2bd6b4a10da0362314141f832cfd1c093615df2`.
- `tests/fixtures/conditional-dead-control-synthetic/fixture-manifest.json`:
  `ae079507ac0b1ed8822952ff081dd5a0f7ad5dfb1043add76cd1d03c47e994ca`.
- `tests/fixtures/conditional-dead-control-synthetic/form-dirty-states.json`:
  `692a7c03cf9fdad1d16fc085db2b04340385706e2127ccc192e5bbb11e30d182`.
- `tests/unit/conditional-dead-control-synthetic-fixture.test.ts`:
  `2782756bca4d7e97104d1a5320957bf734a0630ee833cdda0ba1594c1efee9b8`.
- `packages/browser-explorer/src/explore-app.ts`:
  `bc5f4bf4e716912870d4a88c01488444e638b7d2221ac99d98b3ec48e1aa48c4`.
- `src/types/findings.ts`:
  `ec4036b92a112014cfd9e984a1145e1003b350c8d0fd432fb54fe6c157314b27`.
- `tests/unit/explore-app.test.ts`:
  `0ef38e5005c7306f25f91381703473b15ed3cc95fbe1c7b576110f4b214f32de`.
- `package.json`:
  `bce342ba69c79743a587cb5500512422ab45733f4161f0fdb3e6ebab23308e52`.
- `pnpm-lock.yaml`:
  `3fdd3b48e63388c36970f860f3392f07fac3f24ca92d8421d163807cd3a7a540`.

## Protected Boundary Result

- Detector or behavior-test files modified: 0.
- Fixture, public schema, auth redirect, form-state inference, suppression,
  severity, threshold, or acceptance-policy changes: 0.
- Manifest, lockfile, dependency installation, packed validation, or network
  acquisition actions: 0.
- Raw fixture or target repository acquisition, analysis, execution, or writes:
  0.
- Receipts, automatic patches, publication, npm publication, GitHub Release,
  deployment, launch, permission, contact, pricing, or spend actions: 0.
- Commit, push, pull request, history rewrite, or force-push actions: 0.

## Next Governance Step

RepoAssure Product Completion Gap Audit Refresh v0.10 is created as the single
next Goal with status `ready_to_execute` and `execution_authorization: null`.
It is not executed by this reconciliation and requires separate authorization.

## Verification Evidence

- TDD RED: 120 governance assertions passed and 36 lifecycle assertions failed
  as expected before the addendum and state cascade existed.
- GREEN: `tests/unit/project-structure.test.ts` passed 156/156.
- Autopilot progress consistency: 8/8 checks passed; its unit suite passed 6/6.
- Current/next JSON parse, exactly-one-ready Goal, null next-Goal authorization,
  and full blocked-action projection passed.
- Repository lint and `git diff --check` passed.
- Ten protected product/test/dependency hashes plus both historical-record
  hashes matched their pre-Goal baselines.
- Detector or behavior-test suites executed by this reconciliation Goal: 0.

## Docs Maintainer Return

- Document basis: PLAN, SPEC, PRD, the qualified detector completion audit,
  the historical Handoff and implementation record, and the active Goal.
- Output: this durable errata/addendum plus canonical lifecycle cascade.
- Historical source records modified: 0.
- Product or external actions: 0.
- Return to Project Autopilot: true.
