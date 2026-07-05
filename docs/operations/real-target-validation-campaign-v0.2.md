# Real Target Validation Campaign v0.2

## Status

`campaign_executed_product_gap_closed`

Status: campaign_executed_product_gap_closed

Source goal: Real Target Validation Campaign v0.2.

Implementation status: `real_target_followup_validated_and_environment_gap_closed`.

Launch authorization status: `not_authorized`.

## Decision

Re-run the real target campaign after Real Target Campaign Follow-up Hardening v0.2, validate whether the highest-value v0.1 product gaps were closed, and convert any new product gap into a TDD fix before recording the campaign.

This campaign keeps all real target evidence local. The committed repository records only abstract validation results, product/runtime changes, tests, and this operation summary.

## Targets

| Target | Mode | v0.2 result | Product signal |
| --- | --- | --- | --- |
| `agent-reach` | Python/CLI | blocked | Correctly classified as `environment` with `document_target_stack`; repair plan records `Python/CLI environment prerequisites` for missing entrypoint, `pytest`, `ruff`, and `mypy` |
| `odinsight` | browser | passed | Browser acceptance, generated Playwright validation, screenshot evidence, target feedback, AI IDE handoff, and user validation evidence loop were produced |
| `openclaw-ui` | browser | blocked | Analyzer now infers `pnpm dev` from nested Vite UI package and parent pnpm workspace context; failure moved to target environment setup because `vite` is not installed |

Campaign summary result:

- Total targets: `3`
- Passed targets: `1`
- Blocked targets: `2`
- Failed targets: `0`
- Missing evidence targets: `0`
- Product follow-up actions: `document_target_stack`

v0.1 had 1 passed / 2 failed; v0.2 has 1 passed / 2 blocked / 0 failed.

## v0.1 to v0.2 Change

The campaign did not make every target pass. It made failure diagnosis more industrial:

- `agent-reach` remains blocked until the target Python/CLI environment is prepared, but the material now tells the maintainer and AI IDE to install the project and dev tools before filing a product bug.
- `openclaw-ui` no longer fails because RepoAssure cannot infer a start command. RepoAssure infers `pnpm dev`, attempts boot, and records the concrete target prerequisite failure: `vite: command not found`.
- `odinsight` remains the positive browser control and passes with generated tests validated.

## Product Gap Closed During v0.2

The v0.2 campaign exposed one new product gap:

- Browser/Node environment failures were classified as `environment`, but `maintainerTriageGuidance` reused Python/CLI wording.
- Browser boot failures with no findings produced no executable repair task, leaving the AI IDE without a first action.

TDD fix:

- `target-repo-feedback-summary` now emits Node/Web app environment prerequisite guidance for browser boot failures, including dependency installation from the correct workspace root and local tooling such as `vite`.
- `repair-planner` now creates a P1 `Prepare target app environment` task when browser boot fails before findings are available because local dev tooling is missing.
- The generated repair task package tells the AI IDE to install target repo dependencies, confirm dev tooling, and rerun browser acceptance before touching business code.

## Local Evidence

Local campaign summary was generated with:

```text
pnpm campaign:summarize -- --output artifacts/validation-campaign-v02/summary --target <id>|<repoRoot>|<acceptanceRecordPath>
```

The local summary writes:

- `campaign-summary.json`
- `campaign-summary.md`

The schema remains `repoassure.validation-campaign-summary.v1`.

The local evidence includes target repo `.hardening/runs/<run-id>/target-repo-feedback-summary.json`, `ai-ide-handoff-package.json`, `user-validation-evidence-loop.json`, repair plans, repair task packages, and acceptance records. These local artifacts are readiness evidence only.

## Evidence Boundary

No target repo material was uploaded.

No raw target repo artifacts, screenshots, traces, reviewer feedback, customer data, secrets, cookies, OTP, Access tokens, login query-state, reviewer credentials, raw private source, env values, or private repo content were committed.

Real target evidence remains local under `artifacts/validation-campaign-v02/` and target repo `.hardening/` directories.

The committed repository records only product code changes, tests, summarized conclusions, and this operation record.

## Verification

TDD and pyramid verification used:

```text
pnpm vitest run tests/unit/target-repo-feedback-summary.test.ts tests/unit/repair-plan.test.ts
pnpm build
pnpm user:accept -- --repo <agent-reach> --mode cli --decision pending
pnpm user:accept -- --repo <odinsight> --browser --validate-generated-tests --start-command "npm run dev -- --host 127.0.0.1" --decision pending
pnpm user:accept -- --repo <openclaw-ui> --browser --decision pending
pnpm campaign:summarize -- --output artifacts/validation-campaign-v02/summary --target <id>|<repoRoot>|<acceptanceRecordPath>
pnpm vitest run tests/unit/project-structure.test.ts -t "real target validation campaign v0.2"
```

The `openclaw-ui` browser acceptance remains blocked because the target repo dependencies were intentionally not installed during the startup inference validation pass. That blocker is a target environment prerequisite, not a RepoAssure startup detector failure.

## Non-Authorization Boundary

No Action Authorization Receipt was produced.

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.

No customer contact was executed.

No pricing change or spend was executed.

No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.
