# RepoAssure Representative Multi-Mode Acceptance Campaign Planning v0.1

Status: completed
Date: 2026-07-26
Conclusion: `representative_multi_mode_acceptance_campaign_planned_without_target_execution`

## Purpose

Convert the maintainer's explicit final-acceptance `defer` conditions into one
bounded, reviewable campaign plan covering current-version Web, Python/CLI,
and MCP/Agent product surfaces.

## Outputs

- Campaign plan:
  `docs/acceptance/representative-multi-mode-acceptance-campaign-plan-v0.1.md`
- Evidence contract:
  `docs/product/specs/representative-multi-mode-acceptance-evidence-contract-v0.1.md`
- Target and execution authorization intake:
  `docs/acceptance/representative-multi-mode-acceptance-target-authorization-intake-v0.1.md`

## Planning Result

- Representative lanes defined: 3/3.
- Common target eligibility and reproducibility requirements defined.
- Current-version and pinned-revision requirements defined.
- JSON-first AI IDE read order and lane result rules defined.
- False-positive and maintainer-decision closure requirements defined.
- Separate lane-scoped execution authorization intake created with 0/3
  decisions prefilled.
- Original target repository no-write boundary preserved.

## Acceptance Boundary

A future campaign may request a new final acceptance decision only after all
three lanes pass against the same current RepoAssure revision, all key
false-positive and detector decisions are closed or explicitly accepted as
risk, environment blockers are closed, and the maintainer approves the
campaign summary.

Planning completion is not target authorization and does not change the
current final product acceptance status from `defer`.

## TDD

- Red: the focused structure contract failed because the operation record and
  three planning artifacts did not exist.
- Green: the operation record, campaign plan, evidence contract,
  authorization intake, completed Goal metadata, and next decision-recording
  Goal were added.
- Verify:
  - focused planning contract: 1/1 passed;
  - governance structure: 128/128 passed;
  - Autopilot progress consistency: 8/8 passed;
  - JSON parsing and `git diff --check`: passed;
  - repo hygiene, release check, typecheck, lint, and build: passed;
  - goal audit: 34 passed, 1 manual;
  - outside-sandbox single-worker full suite: 82 files passed, 1 skipped;
    801 tests passed, 1 skipped.
- Release check preserved `public release ready: no`.

## Boundaries Preserved

- Target selected: no.
- Target repository executed: no.
- Target repository writes: no.
- Commands executed against representative targets: no.
- Detector or acceptance behavior changed: no.
- Final acceptance inferred: no.
- Publication, deployment, launch, repository-control change, contact,
  pricing, spend, Git history rewrite, or force push: no.

## Selected Next Goal

RepoAssure Representative Multi-Mode Acceptance Target and Execution Authorization Decision Recording v0.1

The next Goal records explicit target and execution choices for all three
lanes. It cannot infer approval from this Goal authorization or from
historical repository-testing permission, and it does not execute targets.
