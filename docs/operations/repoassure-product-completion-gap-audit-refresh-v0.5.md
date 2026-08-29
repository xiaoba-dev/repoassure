# RepoAssure Product Completion Gap Audit Refresh v0.5

Status: completed
Date: 2026-07-25
Conclusion: `completion_gap_audit_refreshed_with_repair_workflow_mcp_convergence_decision_next`

## Scope

This audit reconciles `docs/PLAN.md`, `docs/SPEC.md`, `docs/PRD.md`,
`README.md`, code, tests, package distribution boundaries, the packed CLI and
packed MCP evidence, manual gates, external-input state, and deferred work.

It classifies remaining material work and selects exactly one bounded,
local-only next Goal. It does not expand the MCP registry, productize repair
MCP tools, change detector or acceptance behavior, write a target repository,
apply a patch, publish, deploy, contact customers, or change pricing or spend.

## Evidence Reviewed

- `src/adapters/cli/run.ts`: the installed `hardening repair` command family.
- `src/adapters/mcp/tool-registry.ts`: the current eight-tool MCP registry.
- `packages/acceptance/src/run-repair-*.ts`: package-owned repair runners and
  their no-write, redaction, maintainer-review, and verification contracts.
- `tests/integration/packed-cli-installation.test.ts`: isolated packed CLI
  installation evidence.
- `tests/integration/packed-mcp-server-protocol.test.ts`: isolated installed
  MCP protocol evidence.
- Current PRD, SPEC, PLAN, README, testing, acceptance, release-readiness,
  decision, development, and Autopilot records.

## Distribution Evidence

- Packed CLI installed entrypoint: `node_modules/.bin/hardening`
- Packed MCP installed entrypoint: `node_modules/.bin/hardening-mcp`
- MCP registry tools: 8
- Installed packed MCP protocol validation: completed
- Existing MCP repair surface: `generate_repair_plan`
- Installed CLI repair surface: `handoff`, `execute`, `patch-plan`,
  `evidence-package`

The packed MCP Goal proves transport, framing, schemas, redaction, shutdown,
and package independence for the existing registry. It does not decide whether
the four installed CLI repair workflows should become one MCP tool, four MCP
tools, resources, prompts, or remain CLI-only.

## Implemented Product Surfaces

| Surface | Status | Evidence |
| --- | --- | --- |
| Local CLI and MCP hardening core | implemented | Analysis, app boot/stop, exploration, generated tests, repair-plan generation, reporting, and full hardening orchestration have formal entrypoints. |
| Browser and Python/CLI acceptance | implemented | Acceptance modes, fixtures, unit/integration tests, and operation records exist. |
| Run-scoped evidence, integrity, and redaction | implemented | Portable manifests, content hashes, verification, artifact indexes, and redaction boundaries are covered. |
| AI IDE repair workflow | implemented for installed CLI | Handoff, execute, validation-only, patch-plan, and evidence-package flows are installed and packed-consumer validated. |
| Isolated packed CLI installation | implemented | The tarball-installed `hardening` bin passes help and no-write repair workflow validation. |
| Isolated packed MCP protocol validation | implemented | The tarball-installed `hardening-mcp` bin passes `initialize`, existing eight-tool `tools/list`, bounded `tools/call`, redaction, and clean shutdown. |
| Project Intelligence local suite | implemented | Snapshot, viewer, freshness, context, watch, handoff, recovery, and operator playbook workflows are present. |
| False-positive catalog and calibration evidence | implemented as contracts | Catalog, near-real fixtures, consumption validation, and pending decision records exist without detector behavior changes. |
| Public release readiness automation | implemented as readiness evidence | Hygiene, release checks, goal audit, dependency/license evidence, and manual release boundaries exist. |

## Blocked or Manual-Gated Work

| Gap | Status | Why |
| --- | --- | --- |
| False-positive detector runtime calibration | blocked | Two calibration decisions still require explicit maintainer approve, reject, defer, or accept-risk decisions. |
| Public source release | manual-gated | Legal/name review, branch protection or equivalent ruleset, and final publication authorization remain human gates. |
| npm publication | manual-gated | No package publication is authorized. |
| GitHub release | manual-gated | No GitHub release creation is authorized. |
| Team Cloud / Enterprise | product-decision-gated | Hosted scope, data model, commercial boundaries, and availability claims require separate accepted decisions. |
| Final user acceptance | manual-gated | Automated evidence does not replace the maintainer's final acceptance decision. |

## External-Input-Gated Work

| Gap | Status | Why |
| --- | --- | --- |
| Private preview feedback triage | external-input-gated | Real reviewer feedback must exist before it can be triaged; feedback must not be fabricated. |
| Additional security provider onboarding | external-input-gated | Provider selection, representative non-private fixtures, and a reviewed evidence mapping are required before schema expansion. |

## Deferred Work

| Gap | Status | Why |
| --- | --- | --- |
| Website design-system external follow-up | deferred | The completed Design System v2 work remains implemented; any separate external redesign follow-up stays outside the product-core queue until the owner supplies a final direction. |
| `packages/core` extraction | deferred | No current distribution or repair-loop failure demonstrates that moving orchestration ownership would reduce risk. |
| Benchmark package ownership cleanup | deferred | It is a monorepo maturity improvement, not a current product blocker. |
| Hosted artifact history and dashboard runtime | deferred/manual-gated | It belongs to the Team Cloud / Enterprise decision boundary. |

## Safe Auto-Executable Gaps

| Candidate | Status | Reason |
| --- | --- | --- |
| RepoAssure AI IDE Repair Workflow MCP Convergence Decision and Contract v0.1 | selected | CLI and MCP distribution are both proven, but repair workflow parity lacks an explicit architecture decision and implementation contract. |
| Multi-repo workspace repair summary planning | not selected | The current workspace manifest already aggregates latest run pointers; MCP convergence is the more direct product-entrypoint gap. |

## Selected Next Goal

RepoAssure AI IDE Repair Workflow MCP Convergence Decision and Contract v0.1

The next Goal will decide, through an ADR and implementation-ready contract,
whether and how the installed CLI repair workflows converge with MCP. It must
define capability mapping, tool/resource/prompt granularity, input and output
schemas, MCP annotations, error and redaction behavior, compatibility,
maintainer review, verification, and no-write boundaries.

The decision Goal does not add or rename tools. Any registry implementation
requires a later separately authorized Goal after the decision is accepted.

## Boundary

| Boundary | Allowed |
| --- | --- |
| Local evidence audit and ADR/contract authoring | yes |
| Existing CLI/MCP capability mapping | yes |
| Proposed schemas, annotations, compatibility, and test matrix | yes |
| MCP tool registry expansion or rename | no |
| Repair MCP productization | no |
| Runtime detector or acceptance behavior change | no |
| Finding suppression or automatic severity downgrade | no |
| Target repo writes or automatic patch application | no |
| npm publication | no |
| Deployment, public release, or GitHub release | no |
| Customer contact, pricing, or spend change | no |

Target repository writes: no

npm publication: no

## Decision

RepoAssure now has independently validated installed CLI and MCP entrypoints.
The most direct non-blocked gap is no longer transport or package installation;
it is the undocumented product decision between a richer installed CLI repair
surface and the narrower MCP repair surface.

Directly adding tools would mix product design, compatibility, security
annotations, and implementation. A bounded decision-and-contract Goal is the
smallest defensible next step.

Conclusion:
`completion_gap_audit_refreshed_with_repair_workflow_mcp_convergence_decision_next`

## Verification

- TDD Red: the focused structure test failed because this operation record,
  completed Goal metadata, and next-Goal contract did not yet exist: 107/108
  tests passed and the new contract failed as expected.
- TDD Green: `tests/unit/project-structure.test.ts` passed 108/108.
- Autopilot progress consistency: 8/8 checks passed.
- Typecheck, lint, and repository hygiene: passed.
- Public release readiness automation: passed; `public release ready: no`
  remains correct because manual publication authorization is still required.
- Goal audit: 34/35 checks passed with 0 missing and 1 manual user-acceptance
  gate.
- Full test pyramid in the authorized local-listener environment: 78 test
  files passed, 1 skipped; 744 tests passed, 1 skipped.
- The default sandbox run failed 6 integration tests because local listeners
  and isolated package installation were restricted; the authorized rerun
  distinguished that environment limitation from a product regression.
