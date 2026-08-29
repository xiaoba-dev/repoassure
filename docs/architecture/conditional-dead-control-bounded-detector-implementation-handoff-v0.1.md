# Conditional Dead Control Bounded Detector Implementation Architecture Handoff v0.1

Status: `ready_for_build`

Goal: `repoassure-conditional-dead-control-calibration-bounded-detector-implementation-v0.1`

Recorded at: `2026-08-02T23:39:47+08:00`

## Authorization And Document Basis

- Goal execution authorization: explicit user authorization in the current task.
- Product basis: `docs/PRD.md` limits the current work to the local-first
  conditional-dead-control calibration slice.
- Solution basis: `docs/SPEC.md` keeps
  `auth_redirect_route_should_preserve_maintainer_review_boundary` excluded and
  prohibits suppression, automatic severity downgrade, confidence-threshold
  change, or acceptance-policy change.
- Execution basis: `docs/PLAN.md` requires this Architecture Handoff before any
  detector or detector-behavior test edit.
- Direction basis:
  `docs/product/strategy/conditional-dead-control-calibration-bounded-detector-implementation-authorization-maintainer-decision-record-v0.1.md`.
- Approved read-only evidence:
  `tests/fixtures/conditional-dead-control-synthetic/fixture-manifest.json`,
  `tests/fixtures/conditional-dead-control-synthetic/form-dirty-states.json`,
  and `tests/unit/conditional-dead-control-synthetic-fixture.test.ts`.

## Selected Seam

Select the `browser-runtime seam`.

The Playwright driver is the only existing layer that can directly observe an
initially disabled submit control, apply a bounded local prerequisite
transition, and observe the same control again. An acceptance-layer classifier
cannot make disabled controls observable and would create a second,
unconnected classification truth. The acceptance catalog remains a read-only
regression and review reference.

No public finding schema is expanded. The existing browser runtime already
projects every `dead_control` interaction to one visible P1 `dead_control`
finding and copies its `evidence` array. The new private classifier therefore
keeps `BrowserInteractionResult`, `HardeningFinding`, `FindingsFile`, CLI, MCP,
and `findings.json` shapes unchanged and writes problem-specific classification
and prerequisite data into stable, namespaced evidence strings.

## System Slices

- Candidate discovery: admit only physically visible, initially disabled
  submit controls into the conditional path; ordinary enabled controls retain
  existing behavior.
- Safe prerequisite observer: bind the submit control to its owner form, fill
  only eligible non-sensitive fields in that same form, never submit or click,
  then re-read the same uniquely identified control.
- Private classifier: map direct before/after observations to positive,
  counter, or fail-closed evidence without inferring form dirty state.
- Existing finding projection: keep outcome `dead_control`; the existing
  browser snapshot classifier keeps the finding visible at P1.
- Acceptance reference: synthetic fixture, catalog, calibration contract, and
  contract-consumption artifacts remain read-only companion regressions.

## Interfaces

### Browser DOM -> private interaction candidate

The private candidate may add only:

- `disabled: boolean | null`
- `formSelector: string | null`

`null` means the state or owner form was not explicitly observable. It must
never be interpreted as enabled or safe.

### Private observation -> existing interaction result

The result retains the existing shape and `outcome: dead_control`. Raw
observation evidence is written first, followed by these namespaced fields:

- `conditional_dead_control.question_id=conditional_dead_control_should_consider_form_dirty_prerequisites`
- `conditional_dead_control.classification=false_positive_candidate | actionable_conditional_dead_control | needs_maintainer_review`
- `conditional_dead_control.prerequisite.initial_disabled=true`
- `conditional_dead_control.prerequisite.safe_dirty_transition_observed=true | false`
- exactly one applicable post-state field:
  `enabled_after_transition=true`, `still_disabled_after_transition=true`, or
  `post_transition_state_known=false`
- `conditional_dead_control.form_state_inferred=false`

The evidence also retains safe fill/skip counts. Selectors, input values,
field contents, and form contents are not persisted.

### Existing interaction result -> hardening finding

`packages/browser-explorer/src/explore-app.ts` remains unchanged. Its current
`dead_control` projection must continue to produce:

- `severity: P1`
- `type: dead_control`
- one visible finding
- the complete evidence array after privacy redaction

## P2 Catalog And P1 Runtime Reconciliation

P2 and P1 describe different dimensions and are not converted:

- P2 is the review priority recorded by the near-real catalog reference.
- P1 is the current browser runtime severity for a visible dead-control
  finding.
- Classification is a third, orthogonal review axis.

Positive therefore remains a visible P1 finding with
`false_positive_candidate`; counter remains a visible P1 finding with
`actionable_conditional_dead_control`; fail-closed remains a visible P1 finding
with `needs_maintainer_review`. No branch suppresses or downgrades a finding.

## Data Boundaries And Safe Observation

The safe sequence is fixed:

1. Directly observe a physically visible submit control as disabled.
2. Require a unique, same-origin owner form and a loopback/local page.
3. Discover fields only inside that owner form.
4. Reuse the current denylist and skip password, token, payment, identity, and
   other sensitive fields.
5. Fill eligible fields once with existing deterministic local test values.
6. Never click or submit the initially disabled control, including after it
   becomes enabled.
7. Re-read candidates and require exactly one same-selector, same-form control
   with an explicit boolean disabled state.
8. Classify from those direct observations only.

No form dirty flag is read, claimed, or inferred. Missing owner form, no safe
field, all fields skipped, non-loopback URL, failed fill, disappeared control,
multiple matches, changed owner form, missing boolean state, or contradictory
matches all produce `needs_maintainer_review`, keep the finding visible, and
perform no click.

The approved evidence files are immutable for this Goal. Their pre-edit
SHA-256 values are:

- `ae079507ac0b1ed8822952ff081dd5a0f7ad5dfb1043add76cd1d03c47e994ca`
  — fixture manifest
- `692a7c03cf9fdad1d16fc085db2b04340385706e2127ccc192e5bbb11e30d182`
  — form dirty states
- `2782756bca4d7e97104d1a5320957bf734a0630ee833cdda0ba1594c1efee9b8`
  — fixture contract test

## Exact Detector And Test Edit Allowlist

Only these detector/test files may be edited:

1. `packages/browser-explorer/src/playwright-driver.ts`
2. `tests/unit/playwright-driver.test.ts`
3. `tests/unit/project-structure.test.ts` — governance lifecycle assertions
   only; it must not simulate or implement detector behavior.

`packages/browser-explorer/src/explore-app.ts` and
`tests/unit/explore-app.test.ts` are read-only companion surfaces because the
current P1 visible-finding projection already satisfies the required contract.
No new module, dependency, package export, CLI/MCP entrypoint, catalog type,
threshold, or acceptance policy is allowed.

Documentation and Goal Ledger cascade files are outside the detector/test
allowlist and may change only to record this authorized Goal, its evidence,
completion state, and the separately gated next Goal.

## Risks

- Wrong-form fill could create a false classification. Mitigation: require the
  owner form and query only its fields.
- Input handlers can have side effects. Mitigation: local/loopback only, one
  non-sensitive fill pass, no submit/click, and no target execution in this
  Goal.
- DOM rerender can change identity. Mitigation: stable selector plus owner-form
  match, exactly one post-transition candidate, otherwise fail closed.
- Evidence strings could displace diagnostic evidence. Mitigation: keep raw
  observation and fill counts first; append namespaced calibration evidence.
- Public schema expansion could silently half-migrate CLI/MCP/report consumers.
  Mitigation: no public schema change in this Goal.

## Test Seams And Pass Criteria

TDD must record RED before production edits.

- Positive: disabled submit + one safe same-form fill + explicitly enabled
  post-state -> one visible P1 `dead_control`,
  `false_positive_candidate`, no click, no form-state inference.
- Counter: the same safe transition + explicitly still disabled -> one visible
  P1 `dead_control`, `actionable_conditional_dead_control`, no click, no
  severity change.
- Fail closed: missing, unsafe, unobservable, and contradictory evidence ->
  one visible P1 `dead_control`, `needs_maintainer_review`, no click, no
  inferred state.

The focused runtime tests must use the real package driver plus the real
`exploreApp` projection in process, with only test-local fakes for the browser
page. Companion tests must prove the approved fixture and existing catalog,
contract, and consumption behavior remain unchanged.

Required commands:

```text
pnpm exec vitest run tests/unit/playwright-driver.test.ts -t "conditional dead control"
pnpm exec vitest run tests/unit/playwright-driver.test.ts tests/unit/explore-app.test.ts tests/unit/conditional-dead-control-synthetic-fixture.test.ts
pnpm exec vitest run tests/unit/false-positive-catalog.test.ts tests/unit/false-positive-catalog-consumption.test.ts tests/unit/false-positive-detector-calibration-contract.test.ts tests/unit/false-positive-detector-calibration-contract-consumption.test.ts
pnpm typecheck:browser-explorer
pnpm typecheck
pnpm lint
pnpm exec vitest run --maxWorkers=1 --minWorkers=1
```

Completion additionally requires unchanged fixture hashes, a diff confined to
the allowlist plus governance/docs cascade, and no auth-redirect change.

## Builder Routes

- Browser runtime builder: one package-owned Playwright driver file.
- QA/TDD: one runtime test file plus the governance-only structure contract.
- Documentation Steward / Project Autopilot: handoff, Goal state, operation
  record, canonical doc cascade, and verification evidence.
- No frontend, data, migration, release, deployment, or external route.

## Open Questions

None. The seam, evidence contract, safe observation boundary, edit allowlist,
and pass criteria are locked.

## Rollback

Rollback is question-only: remove the conditional path from the allowlisted
driver and runtime tests, restore the pre-calibration disabled-control
behavior, and rerun the focused plus catalog/contract/consumption regressions.
The approved fixture files, auth-redirect question, target repositories, and
external state must not change. This handoff issues no authorization receipt.

## Return To Project Autopilot

Return only with the authorization and this handoff recorded, RED and GREEN
outputs, allowlist diff, unchanged fixture hashes, positive/counter/fail-closed
P1 visible-finding evidence, companion regressions, typecheck/lint/full-suite
results, and confirmation of zero target/network/dependency/receipt/publish/
deploy/launch actions.
