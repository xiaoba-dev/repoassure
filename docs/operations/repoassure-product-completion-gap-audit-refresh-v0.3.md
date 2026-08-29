# RepoAssure Product Completion Gap Audit Refresh v0.3

Status: completed
Date: 2026-07-24
Conclusion: `completion_gap_audit_refreshed_with_cli_productization_next`

## Scope

This audit reconciles `docs/PLAN.md`, `docs/SPEC.md`, `docs/PRD.md`, `README.md`,
the installed CLI and MCP entrypoints, package-owned repair runners, tests, and
recent operation records under the Autopilot progress consistency guard.

The goal classifies remaining work by execution boundary and selects one
meaningful local-only next goal. It does not change runtime detector behavior,
write to a target repository, resume the deferred website design-system work,
deploy, publish, contact customers, or change pricing or spend.

## Evidence Reviewed

- `src/adapters/cli/run.ts`: the installed `hardening` CLI command surface.
- `src/adapters/mcp/tool-registry.ts`: the current MCP tool registry.
- `packages/acceptance/package.json`: private package-owned repair runner exports.
- `package.json`: repository-local `pnpm repair:*` operator scripts.
- Unit, integration, structure, package, type-smoke, release-readiness, and
  Project Intelligence evidence.
- Current PRD, SPEC, PLAN, README, acceptance, testing, decision, and development
  records.

## Implemented Product Surfaces

| Surface | Status | Evidence |
| --- | --- | --- |
| Local CLI and MCP hardening core | implemented | Analysis, exploration, generated tests, plans, reports, verification, security checks, and full hardening runs are available through formal product entrypoints. |
| Browser and Python/CLI acceptance | implemented | Acceptance modes, fixtures, unit/integration tests, and operation records exist. |
| Run-scoped evidence and integrity | implemented | Manifests, portable content hashes, verification, redaction, and local artifact indexing are covered. |
| AI IDE repair contracts and private runners | implemented internally | Handoff, dry-run, validation-only, patch-plan, and evidence-package runners and tests exist. |
| Project Intelligence local suite | implemented | Snapshot, viewer, freshness, agent context, watch, handoff, recovery, and playbook workflows are implemented. |
| False-positive catalog and calibration contracts | implemented as evidence contracts | Catalog, real fixtures, consumption validation, and pending maintainer decision records exist without changing detector behavior. |
| Public release readiness automation | implemented as readiness evidence | Hygiene, release checks, goal audit, dependency/license evidence, and manual release boundaries exist. |

## Productization Gap

The AI IDE repair workflow is implemented, but it is not yet exposed as a stable
installed product command. Today, maintainers use private package runners through
repository-local `pnpm repair:*` scripts. The formal `hardening` CLI does not
provide a `hardening repair` command family.

This means the repair engine and evidence contracts exist, while installed CLI
consumption still requires repository knowledge. Productizing the existing
runners is a smaller and more defensible next step than adding new repair logic.

## Blocked or Manual-Gated Work

| Gap | Status | Why |
| --- | --- | --- |
| False-positive detector runtime calibration | blocked | Two calibration decisions still require explicit maintainer approval, rejection, deferral, or risk acceptance. |
| Public source release | manual-gated | Legal/name review, branch protection or equivalent ruleset, and final publication authorization remain human gates. |
| npm publication | manual-gated | No public package publication is authorized. |
| GitHub release | manual-gated | No GitHub release creation is authorized. |
| Team Cloud / Enterprise | product-decision-gated | Hosted product scope, commercial boundaries, data model, and availability claims require a separate accepted decision. |
| Final user acceptance | manual-gated | Automated evidence does not replace the maintainer's final acceptance decision. |

## External-Input-Gated Work

| Gap | Status | Why |
| --- | --- | --- |
| Private preview feedback triage | external-input-gated | Real reviewer feedback must exist before it can be triaged; feedback must not be fabricated. |

## Deferred Work

| Gap | Status | Why |
| --- | --- | --- |
| Website design-system follow-up | deferred | The owner explicitly paused this work while an external design direction is being finalized. |

## Safe Auto-Executable Gaps

| Candidate | Status | Reason |
| --- | --- | --- |
| RepoAssure AI IDE Repair Workflow CLI Productization v0.1 | selected | It exposes already-tested local repair runners through a stable CLI without changing detector behavior or writing target repositories. |

## Selected Next Goal

RepoAssure AI IDE Repair Workflow CLI Productization v0.1

The next goal should add bounded `hardening repair` subcommands for handoff,
dry-run or validation-only execution, patch-plan generation, and evidence-package
generation. Existing `pnpm repair:*` scripts remain compatible. MCP convergence is
not part of this goal and can be evaluated separately after CLI acceptance.

## Boundary

| Boundary | Allowed |
| --- | --- |
| Local CLI adapters around existing repair runners | yes |
| Unit, integration, package, and CLI smoke tests | yes |
| Runtime detector behavior change | no |
| Finding suppression or automatic severity downgrade | no |
| Detector confidence or acceptance policy change | no |
| Target repo writes or automatic patch application | no |
| Website design-system rewrite | no |
| Deployment, public release, npm publish, or GitHub release | no |
| Customer contact | no |
| Pricing or spend change | no |

## Decision

RepoAssure has broad local-first implementation coverage. The most useful
non-blocked gap is now product entrypoint convergence: expose the existing AI IDE
repair workflow through a stable installed CLI while preserving no-write,
redaction, and maintainer-review boundaries.

Conclusion: `completion_gap_audit_refreshed_with_cli_productization_next`

## Verification

- TDD Red: focused structure test failed because the v0.3 operation record did
  not yet exist.
- TDD Green: `pnpm exec vitest run tests/unit/project-structure.test.ts` passed
  102/102 tests.
- `pnpm autopilot:progress:check -- --json` passed 8/8 checks with status
  `consistent`.
- `pnpm typecheck`, `pnpm lint`, and `pnpm repo:hygiene` passed.
- `pnpm release:check` passed automated prerequisites and correctly retained
  `public release ready: no`.
- `pnpm goal:audit` passed automated checks and retained one manual user
  acceptance item.
- `pnpm test` passed outside the restricted localhost sandbox: 74 files passed,
  724 tests passed, and 1 test was skipped. The sandbox-only attempt failed four
  local-server listening cases and is recorded as an environment limitation, not
  a product test failure.
