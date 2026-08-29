# RepoAssure Product Completion Gap Audit Refresh v0.6

Status: completed
Date: 2026-07-25
Conclusion: `completion_gap_audit_refreshed_with_multi_repo_workspace_repair_summary_planning_next`

## Scope

This audit reconciles `docs/PLAN.md`, `docs/SPEC.md`, `docs/PRD.md`,
`README.md`, current code and tests, package and distribution evidence, manual
gates, external-input state, and deferred work after closing the ADR-0024 MCP
convergence slice.

It classifies remaining material work and selects exactly one bounded,
local-only next Goal. It does not change runtime behavior, add an MCP tool,
execute a command, apply a patch, write a target repository, publish, deploy,
contact customers, or change pricing or spend.

## Evidence Reviewed

- `src/adapters/mcp/tool-registry.ts`: the current twelve-tool MCP registry.
- `src/tools/run-hardening-tool.ts`: optional `workspaceOutputDir` support,
  per-repository bundles, and workspace manifest updates.
- `packages/acceptance/src/run-repair-*.ts`: package-owned repair artifact
  runners and their no-write, redaction, maintainer-review, and verification
  contracts.
- `tests/integration/run-hardening-tool.test.ts`: multi-repository workspace
  manifest coverage.
- `tests/integration/packed-cli-installation.test.ts` and
  `tests/integration/packed-mcp-server-protocol.test.ts`: isolated installed
  consumer evidence.
- Current PRD, SPEC, PLAN, README, testing, acceptance, release-readiness,
  decision, development, and Autopilot records.

## Distribution Evidence

- Installed CLI entrypoint: implemented and packed-consumer validated
- Installed MCP entrypoint: implemented and packed-consumer validated
- MCP registry tools: 12
- Artifact-only repair workflow MCP convergence: closed
- Multi-repo workspace manifest: implemented
- Cross-repo repair summary: not implemented

The existing workspace manifest aggregates repository identity and latest run
pointers. It does not yet provide cross-repository repair prioritization, AI
IDE read order, stale or missing repository handling, identity-collision
policy, or a portfolio-level repair queue.

## Implemented Product Surfaces

| Surface | Status | Evidence |
| --- | --- | --- |
| Local CLI and MCP hardening core | implemented | Analysis, app boot/stop, exploration, generated tests, repair-plan generation, reporting, and hardening orchestration have formal entrypoints. |
| Browser and Python/CLI acceptance | implemented | Acceptance modes, fixtures, unit/integration tests, and operation records exist. |
| Run-scoped evidence, integrity, and redaction | implemented | Portable manifests, content hashes, verification, artifact indexes, and redaction boundaries are covered. |
| AI IDE repair workflow | implemented for installed CLI | Handoff, preview/execute, validation-only, patch-plan, and evidence-package flows are installed and packed-consumer validated. |
| Artifact-only repair workflow MCP convergence | implemented | Four additive artifact-only tools form an audited workflow in the compatible twelve-tool registry. |
| Isolated packed CLI and MCP distribution | implemented | Both installed bins pass isolated consumer validation. |
| Project Intelligence local suite | implemented | Snapshot, viewer, freshness, context, watch, handoff, recovery, and operator workflows are present. |
| False-positive catalog and calibration evidence | implemented as contracts | Catalog, near-real fixtures, consumption validation, and pending decision records exist without detector behavior changes. |
| Multi-repo workspace manifest | implemented | Optional local workspace output records repository bundles and latest run pointers. |
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
| Additional security provider onboarding | external-input-gated | Provider selection, representative non-private fixtures, and reviewed evidence mapping are required before schema expansion. |

## Deferred Work

| Gap | Status | Why |
| --- | --- | --- |
| Website design-system external follow-up | deferred | The owner paused further design work while an external redesign direction is being finalized. |
| `packages/core` extraction | deferred | No current distribution or repair-loop failure demonstrates that moving orchestration ownership would reduce risk. |
| Benchmark package ownership cleanup | deferred | It is a monorepo maturity improvement, not a current product blocker. |
| Hosted artifact history and dashboard runtime | deferred/manual-gated | It belongs to the Team Cloud / Enterprise decision boundary. |

## Safe Auto-Executable Gaps

| Candidate | Status | Reason |
| --- | --- | --- |
| Multi-repo workspace repair summary planning | selected | The local workspace manifest exists, while cross-repository repair consumption and prioritization remain undefined. A planning-only contract is bounded and does not require runtime permissions. |
| `packages/core` extraction planning | not selected | It is architectural cleanup without current user-facing failure evidence. |
| Multi-repo repair summary implementation | not selected | Implementation should follow an accepted artifact, prioritization, collision, redaction, and no-write contract. |

## Selected Next Goal

RepoAssure Multi-Repo Workspace Repair Summary Planning v0.1

The next Goal will define the local-only cross-repository summary inputs,
proposed JSON and Markdown artifacts, AI IDE read order, cross-repository
prioritization, stale or missing repository handling, repository identity
collision policy, redaction, maintainer review, and no-write evidence.

It must distinguish a local workspace repair summary from Team Cloud history,
collaboration, hosted dashboards, or commercial availability. It is
planning-only and does not change production code.

## Boundary

| Boundary | Allowed |
| --- | --- |
| Local evidence audit and planning contract authoring | yes |
| Existing workspace manifest and per-repo artifact mapping | yes |
| Proposed JSON/Markdown schema and test matrix | yes |
| Cross-repo summary production implementation | no |
| Team Cloud runtime or hosted dashboard | no |
| Runtime detector or acceptance behavior change | no |
| MCP registry change or validation-only exposure | no |
| Command execution, patch application, or target repo write | no |
| npm publication | no |
| Deployment, public release, or GitHub release | no |
| Customer contact, pricing, or spend change | no |

Target repository writes: no

npm publication: no

## Decision

The MCP convergence slice is closed and the twelve-tool registry remains
bounded. The strongest evidence-backed product gap is now the missing local
cross-repository repair consumption layer above the already implemented
workspace manifest.

Selecting planning before implementation keeps repository identity,
prioritization, redaction, stale-state, maintainer-review, and no-write
semantics explicit. It also prevents local multi-repo support from being
misrepresented as Team Cloud or hosted availability.

Conclusion:
`completion_gap_audit_refreshed_with_multi_repo_workspace_repair_summary_planning_next`

## Verification

- TDD Red: the focused structure test passed 114 existing checks and failed
  the new contract because this operation record did not yet exist.
- TDD Green: `tests/unit/project-structure.test.ts` passed 115/115.
- Typecheck, lint, acceptance build, source build, repository hygiene, and
  `git diff --check`: passed.
- Full test pyramid in the authorized local-listener environment: 78 test
  files passed, 1 skipped; 764 tests passed, 1 skipped.
- The first full-suite run had one existing external-process integration test
  reach its 5-second timeout while 763 tests passed. The focused test then
  passed in 904 ms, and the complete rerun passed, distinguishing transient
  load from a product regression.
- Public release readiness automation: passed; `public release ready: no`
  remains correct because manual legal, trademark, branch-protection or
  equivalent, and final publication authorization gates remain.
- Goal audit: 34/35 checks passed with 0 missing and 1 manual user-acceptance
  gate.
- Autopilot progress consistency: 8/8 checks passed.
