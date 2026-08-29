# RepoAssure Conditional Dead Control Calibration Bounded Detector Implementation v0.1

Status: completed  
Conclusion:
`conditional_dead_control_bounded_detector_implemented_with_visible_p1_classification_and_fail_closed_prerequisite_evidence`

## Authorization And Scope

- Explicit Goal execution authorization: yes.
- Authorization source: explicit user authorization in the current task.
- Authorized question:
  `conditional_dead_control_should_consider_form_dirty_prerequisites`.
- Excluded question:
  `auth_redirect_route_should_preserve_maintainer_review_boundary` remains
  `request_revision` and was not implemented.
- Architecture Handoff was recorded before detector or behavior-test edits:
  `docs/architecture/conditional-dead-control-bounded-detector-implementation-handoff-v0.1.md`.
- Selected seam: browser runtime + private classifier + existing
  `evidence: string[]`.
- Public finding schema changed: no.

## Bounded Implementation

Detector/test edits remained within the locked three-file allowlist:

1. `packages/browser-explorer/src/playwright-driver.ts`
2. `tests/unit/playwright-driver.test.ts`
3. `tests/unit/project-structure.test.ts` — governance lifecycle assertions
   only

The detector now observes a physically visible, initially disabled submit on
an HTTP(S) loopback page. Candidate collection is bound to the exact observed
page URL. A conditional transition may fill at most one directly observed,
editable, non-sensitive field in the same uniquely observed owner form. The
page URL and owner-form uniqueness are rechecked before the fill, and the field
value, page, form, control selector, and disabled state are directly observed
again afterward. Missing, unsafe, contradictory, unstable, or unobservable
evidence fails closed.

The initially disabled submit is never clicked or submitted. Dangerous
disabled submits remain visible as fail-closed P1 findings even when the
ordinary mutation budget has already been consumed, because that branch is
observation-only.

All branches retain:

- `outcome: dead_control`
- `severity: P1`
- one visible finding
- namespaced prerequisite and classification evidence
- `conditional_dead_control.form_state_inferred=false`

## TDD And Regression Evidence

- RED was recorded before each production correction, including the original
  positive/counter/fail-closed coverage and the later independent-review
  findings for route termination, form/field uniqueness, value transition,
  pre-fill page stability, mutation-budget visibility, and candidate-page
  binding.
- Conditional detector behavior cases passed: 23/23.
- Positive behavior cases passed: 1/1.
- Counter behavior cases passed: 2/2.
- Fail-closed behavior cases passed: 20/20.
- Full Playwright driver unit file: 39/39 passed.
- Driver plus fixture/catalog/calibration companions: 76/76 passed.
- Downstream CLI, MCP, report, test-generation, repair-plan, and hardening
  consumers: 81/81 passed.
- Browser-explorer typecheck: passed.
- Repository typecheck: passed.
- Repository lint: passed.
- Independent final read-only review: no unresolved P1/P2 within this Goal.
- Disabled submit clicks performed: 0.
- Form state inferred: no.

## Immutable Fixture Evidence

Synthetic fixture files modified: 0.

- `tests/fixtures/conditional-dead-control-synthetic/fixture-manifest.json`:
  `ae079507ac0b1ed8822952ff081dd5a0f7ad5dfb1043add76cd1d03c47e994ca`
- `tests/fixtures/conditional-dead-control-synthetic/form-dirty-states.json`:
  `692a7c03cf9fdad1d16fc085db2b04340385706e2127ccc192e5bbb11e30d182`
- `tests/unit/conditional-dead-control-synthetic-fixture.test.ts`:
  `2782756bca4d7e97104d1a5320957bf734a0630ee833cdda0ba1594c1efee9b8`

## Full-Suite Environment Evidence

The final serial suite excluding the two packed-installation tests reached 850
passing tests, one skipped test, and four failures (78 files passed, one file
skipped, three files failed). All four failures came from the sandbox's
local-listen restriction in the boot/MCP integration tests. The three affected
integration files then passed outside that restriction (3 files, 6 tests).

`tests/integration/packed-mcp-server-protocol.test.ts` could not complete in
the isolated consumer because the local pnpm store does not contain
`@modelcontextprotocol/sdk@1.30.0`. A forced-offline rerun confirmed that exact
cache gap. No network escalation or dependency acquisition was authorized or performed,
so this is retained as a completion-audit environment evidence gap rather than
silently filled.

## Protected Boundaries

- Authorization receipts issued: 0.
- Target repositories acquired / analyzed / executed / written: 0 / 0 / 0 / 0.
- Raw source fixtures accessed: 0.
- Network or new dependency acquisition: no.
- Automatic patch application: no.
- Publication / npm publication / GitHub release: no / no / no.
- Deployment / launch: no / no.
- Commit / push / pull request: no / no / no.

## Rollback

The question-only rollback is confined to the detector behavior changes in
`packages/browser-explorer/src/playwright-driver.ts` and their bounded tests.
The approved synthetic fixture remains read-only, the existing public finding
schema remains unchanged, and the excluded auth-redirect question remains
untouched.

## Next Goal

RepoAssure Conditional Dead Control Calibration Bounded Detector Implementation Completion Audit v0.1 is `ready_to_execute` but separately
unauthorized. It may only perform a read-only completion audit of the handoff,
allowlist, regression evidence, immutable hashes, visible P1 classification,
and protected boundaries. It may not change detector, tests, fixtures, public
schema, or auth-redirect behavior; acquire dependencies or targets; publish,
deploy, or launch.
