# RepoAssure Product Completion Gap Audit Refresh v0.4

Status: completed
Date: 2026-07-24
Conclusion: `completion_gap_audit_refreshed_with_packed_mcp_protocol_validation_next`

## Scope

This audit reconciles `docs/PLAN.md`, `docs/SPEC.md`, `docs/PRD.md`, the
installed CLI and MCP entrypoints, package distribution boundaries, tests,
operation records, manual gates, and external-input state after the packed CLI
installation validation.

It classifies remaining work and selects exactly one bounded, local-only next
Goal. It does not change detector behavior, expand the MCP tool registry, write
to a target repository, publish, deploy, contact customers, or change pricing
or spend.

## Evidence Reviewed

- `package.json`: the package exposes both `hardening` and `hardening-mcp` bins.
- `src/adapters/cli/run.ts`: installed CLI command and repair surfaces.
- `src/adapters/mcp/index.ts`: stdio MCP server entrypoint.
- `src/adapters/mcp/tool-registry.ts`: the existing eight-tool MCP registry.
- `tests/integration/packed-cli-installation.test.ts`: isolated packed CLI
  installation evidence.
- Current PRD, SPEC, PLAN, README, testing, acceptance, decision, development,
  release-readiness, and Autopilot records.

## Distribution Evidence

- Packed CLI installed entrypoint: `node_modules/.bin/hardening`
- Packed MCP installed entrypoint declared by the package:
  `node_modules/.bin/hardening-mcp`
- MCP registry tools: 8
- Installed packed MCP protocol validation: not yet completed

The packed CLI test proves the tarball and CLI runtime boundary. It does not
prove that an isolated consumer can start the installed MCP bin, complete the
MCP `initialize` exchange, return `tools/list`, or complete a bounded
`tools/call`.

## Implemented Product Surfaces

| Surface | Status | Evidence |
| --- | --- | --- |
| Local CLI and MCP hardening core | implemented | Analysis, app boot/stop, exploration, generated tests, plans, reports, and hardening orchestration have formal source entrypoints. |
| Browser and Python/CLI acceptance | implemented | Acceptance modes, fixtures, unit/integration tests, and operation records exist. |
| Run-scoped evidence, integrity, and redaction | implemented | Manifests, portable content hashes, verification, local artifact indexing, and redaction boundaries are covered. |
| AI IDE repair workflow | implemented for installed CLI | Handoff, execute, validation-only, patch-plan, and evidence-package commands are available through `hardening repair`. |
| Isolated packed CLI installation | implemented | A local tarball installs into an isolated consumer and `node_modules/.bin/hardening` passes help and no-write repair smoke. |
| Project Intelligence local suite | implemented | Snapshot, viewer, freshness, context, watch, handoff, recovery, and playbook workflows are present. |
| False-positive catalog and calibration evidence | implemented as contracts | Catalog, near-real fixtures, consumption validation, and pending decision records exist without detector behavior changes. |
| Public release readiness automation | implemented as readiness evidence | Hygiene, release checks, goal audit, dependency/license evidence, and manual release boundaries exist. |

## Blocked or Manual-Gated Work

| Gap | Status | Why |
| --- | --- | --- |
| False-positive detector runtime calibration | blocked | Two calibration decisions still need explicit maintainer approve, reject, defer, or accept-risk decisions. |
| Public source release | manual-gated | Legal/name review, branch protection or equivalent ruleset, and final maintainer publication authorization remain human gates. |
| npm publication | manual-gated | No package publication is authorized. |
| GitHub release | manual-gated | No GitHub release creation is authorized. |
| Team Cloud / Enterprise | product-decision-gated | Hosted scope, commercial boundaries, data model, and availability claims require separate accepted decisions. |
| Final user acceptance | manual-gated | Automated evidence does not replace the maintainer's final acceptance decision. |

## External-Input-Gated Work

| Gap | Status | Why |
| --- | --- | --- |
| Private preview feedback triage | external-input-gated | Real reviewer feedback must exist before it can be triaged; it must not be fabricated. |

## Deferred Work

| Gap | Status | Why |
| --- | --- | --- |
| Website design-system external follow-up | deferred | The owner asked to keep design-system work outside the current product-core execution queue while external design work is considered. |

## Safe Auto-Executable Gaps

| Candidate | Status | Reason |
| --- | --- | --- |
| RepoAssure Packed MCP Server Installation and Protocol Validation v0.1 | selected | It validates the package's existing second bin and current eight-tool registry without adding tools or changing behavior. |
| Repair workflow MCP convergence | not selected | Repair MCP expansion should wait until the installed MCP transport and package boundary are proven. |

## Selected Next Goal

RepoAssure Packed MCP Server Installation and Protocol Validation v0.1

The next Goal will create a local tarball, install it in an isolated consumer,
start `node_modules/.bin/hardening-mcp`, and validate the real MCP protocol
sequence: `initialize`, `tools/list`, and one bounded, read-only `tools/call`.
It must verify schema/readability, stderr/stdout framing, redaction, process
shutdown, source-workspace independence, and no target repository writes.

## Boundary

| Boundary | Allowed |
| --- | --- |
| Local pack and isolated consumer installation | yes |
| Existing installed `hardening-mcp` stdio protocol validation | yes |
| Unit, integration, package, and protocol smoke tests | yes |
| MCP tool registry expansion | no |
| Repair MCP productization | no |
| Runtime detector behavior change | no |
| Finding suppression or automatic severity downgrade | no |
| Target repo writes or automatic patch application | no |
| npm publication | no |
| Deployment, public release, or GitHub release | no |
| Customer contact, pricing, or spend change | no |

Target repository writes: no

npm publication: no

## Decision

The packed CLI distribution is proven, but the package's MCP distribution is
not. Validating the installed `hardening-mcp` protocol before expanding its
surface is the smallest product-critical next step and establishes whether the
second formal product entrypoint is independently consumable.

Conclusion:
`completion_gap_audit_refreshed_with_packed_mcp_protocol_validation_next`

## Verification

- TDD Red: the focused structure test failed because this operation record,
  completed goal metadata, and next-goal contract did not yet exist.
- TDD Green: `pnpm exec vitest run tests/unit/project-structure.test.ts` passed
  106/106 tests.
- `pnpm typecheck`, `pnpm lint`, `pnpm repo:hygiene`, and `git diff --check`
  passed.
- `pnpm release:check` passed automated prerequisites and correctly retained
  `public release ready: no`.
- `pnpm goal:audit` passed 34/35 automated checks and retained one manual user
  acceptance item.
- `pnpm autopilot:progress:check -- --json` passed 8/8 consistency checks.
- `pnpm test` passed outside the restricted localhost sandbox: 77 test files
  passed, 741 tests passed, and 1 test file / 1 test was skipped.
