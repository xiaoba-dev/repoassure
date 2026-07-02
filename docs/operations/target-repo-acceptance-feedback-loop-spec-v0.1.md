# Target Repo Acceptance Feedback Loop Spec v0.1

Status: target_repo_feedback_loop_specified_not_implemented

Date: 2026-07-02

Repository: `xiaoba-dev/repoassure`

Source priority: `Product Backlog Prioritization v0.1 / Priority 1`

Launch authorization status: `not_authorized`

Implementation authorization: `spec_only`

## Scope

This specification defines the first product implementation slice after Product Backlog Prioritization v0.1.

The goal is to make a real target repo run produce a local, repo-scoped, maintainer-reviewable feedback summary that can be read by an AI IDE or agent before proposing follow-up work.

This record specifies the contract and TDD order only. It does not implement runtime behavior and does not authorize public launch actions.

## Acceptance feedback summary contract

The future feedback summary SHOULD be generated inside the run-scoped artifact directory for a target repo acceptance run.

Minimum fields:

- `runStatus`: one of `passed`, `failed`, `blocked`, or `partial`.
- `targetRepoMetadataClass`: one of `synthetic_fixture`, `public_repo`, `private_repo_redacted`, or `unknown`.
- `acceptanceResult`: the normalized acceptance outcome, including whether generated tests ran, whether report generation completed, and whether repair artifacts were produced.
- `blockerCategory`: one of `none`, `environment`, `dependency_install`, `build_or_typecheck`, `runtime_boot`, `browser_exploration`, `generated_test_validation`, `security_boundary`, `user_input_required`, or `unknown`.
- `nextRecommendedProductAction`: one maintainer-facing recommendation such as `inspect_artifacts`, `improve_detector`, `improve_generated_tests`, `improve_repair_plan`, `document_target_stack`, `request_user_input`, or `no_action`.
- `artifactLinks`: relative links to the hardening report, acceptance report, repair plan, patch plan, manifest, screenshots, traces, logs, and any missing-artifact notes.
- `redactionBoundary`: explicit statement that secrets, raw environment values, raw private repo content, reviewer credentials, OTPs, cookies, Access tokens, and login query-state are not stored.
- `maintainerTriageGuidance`: concise guidance for deciding whether the run creates a product bug, docs task, target-repo issue, user-input request, or no follow-up action.

## AI IDE consumption order

AI IDEs and coding agents SHOULD read the future feedback package in this order:

1. Feedback summary.
2. Run manifest.
3. Acceptance report.
4. Hardening report.
5. Repair plan and repair task package.
6. Patch plan when present.
7. Logs, screenshots, traces, and missing-artifact notes only when the summary points to them.

The summary SHOULD prefer stable relative artifact links over absolute local paths so it can be moved with the run folder without leaking workstation-specific details.

## TDD implementation order

1. Add a failing unit test for the feedback summary schema, enum values, redaction boundary, and relative artifact link requirements.
2. Add a failing fixture test for a synthetic target repo run that produces `runStatus`, `acceptanceResult`, `blockerCategory`, and `nextRecommendedProductAction`.
3. Implement the smallest local summary writer behind the acceptance package boundary.
4. Add integration coverage that proves the summary is written into the run-scoped artifact directory and linked from the manifest or handoff material.
5. Add a sensitive-material scan fixture proving secrets, raw private repo content, OTPs, cookies, Access tokens, and login query-state are excluded.
6. Update user-facing acceptance docs only after the generated summary contract is implemented.

## Out of scope

- No runtime implementation was executed.
- No target repo material was uploaded.
- No remote service, hosted dashboard, SaaS runtime, or customer workspace was created.
- No customer contact or reviewer outreach was executed.
- No pricing, spend, package publication, GitHub release, production marketing announcement, or public launch action was executed.

## Privacy and local-first boundary

No secrets or raw private repo content may be stored.

The future summary must only contain derived metadata, normalized statuses, redacted paths, relative artifact links, and maintainer-facing next actions.

Private target repo contents remain local to the user's machine. Generated artifacts remain local unless a future explicit data export authorization exists.

## Non-authorization boundary

No Action Authorization Receipt was produced.

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.

No customer contact was executed.

No pricing change or spend was executed.

No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.

No customer logo, case study, production customer claim, or external endorsement claim was executed.
