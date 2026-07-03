# Real Target Repo Validation & Product Hardening Campaign v0.1

## Status

`campaign_executed_product_hardened`

Status: campaign_executed_product_hardened

Source goal: Real Target Repo Validation & Product Hardening Campaign v0.1.

Implementation status: `implemented_minimal_campaign_summary_runtime`.

Launch authorization status: `not_authorized`.

## Decision

Execute a local-first validation campaign against three real public target repos, convert high-value product gaps into TDD fixes, and add a reusable local campaign summary runtime.

The campaign did not upload target repo material, private artifacts, reviewer feedback, customer data, secrets, or raw private repo content.

## Targets

| Target | Mode | Result | Product signal |
| --- | --- | --- | --- |
| `agent-reach` | Python/CLI | failed | CLI environment setup and repair-plan guidance need clearer triage |
| `odinsight` | browser | passed | Browser evidence, handoff package, repair package, screenshot, and generated test were produced |
| `openclaw-ui` | browser | failed | Complex monorepo sub-app had no inferred URL/start command, and browser artifact failure needed clearer diagnostics |

Campaign summary result:

- Total targets: `3`
- Passed targets: `1`
- Failed targets: `2`
- Missing evidence targets: `0`
- Product follow-up actions: `improve_repair_plan`, `improve_detector`

## Runtime Added

The campaign adds a local summary runtime:

```text
pnpm campaign:summarize -- --output artifacts/campaign --target <id>|<repoRoot>|<acceptanceRecordPath>
```

The runtime writes:

- `campaign-summary.json`
- `campaign-summary.md`

The summary schema is `repoassure.validation-campaign-summary.v1`.

The runtime implementation is:

- `packages/acceptance/src/campaign-summary.ts`
- `scripts/summarize-validation-campaign.mjs`
- `pnpm campaign:summarize`

## Product Hardening

Browser artifact diagnostics were hardened.

Before this campaign, a browser acceptance run with no screenshots or traces could report:

```text
browser mode not requested or no artifacts
```

After the fix, browser mode failures include boot context when available:

```text
browser requested but no browser artifacts were generated; boot-result.json status=failed; details=No URL or start command is available
```

This keeps the run failed, but makes the next action clear to a maintainer or AI IDE.

## Evidence Boundary

Generated campaign evidence remains local under `artifacts/campaign/` and target repo `.hardening/` directories.

Do not commit:

- target repo source snapshots
- raw target repo artifacts
- screenshots or traces from private targets
- reviewer feedback
- customer data
- secrets, cookies, OTP, access tokens, login query-state, reviewer credentials, raw private source, or env values

The committed repository records only this campaign summary and product/runtime changes.

## Verification

TDD and pyramid verification used:

```text
pnpm exec vitest run tests/unit/campaign-summary.test.ts
pnpm exec vitest run tests/unit/user-acceptance.test.ts -t "explains missing browser artifacts"
pnpm exec vitest run tests/unit/project-structure.test.ts -t "real target validation campaign"
pnpm build:acceptance
pnpm campaign:summarize -- --output artifacts/campaign --target <id>|<repoRoot>|<acceptanceRecordPath>
```

Real target validation evidence was generated locally for the three targets listed above. The evidence is readiness material, not release authorization.

## Non-Authorization Boundary

No target repo material was uploaded.

No private artifacts, reviewer feedback, customer data, secrets, or raw private repo content were uploaded.

No Action Authorization Receipt was produced.

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.

No customer contact was executed.

No pricing change or spend was executed.

No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.
