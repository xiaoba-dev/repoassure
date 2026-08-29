# RepoAssure Representative Multi-Mode Acceptance Target Authorization Intake v0.1

Status: completed
Date: 2026-07-26
Decision status: defer

No target is pre-authorized.

## Purpose

Collect a fresh, lane-scoped target selection and execution decision before
any representative repository or fixture is acquired, installed, started, or
processed. Prior repository-testing permission and authorization to execute
this planning Goal do not satisfy this intake.

## Decision Options

- `approve_execution`: approve one named target or fixture, exact revision,
  isolated execution boundary, and command envelope for one lane.
- `reject`: reject the proposed target or execution envelope.
- `defer`: leave the lane unapproved and unexecuted.

`accept_risk` may close a finding after evidence exists, but it does not
authorize target execution and is therefore not an execution option here.

## Lane Decisions

| Lane | Proposed target or fixture | Revision / digest | Provenance and license review | Privacy and secret review | Allowed command envelope | Network / install boundary | Decision | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Web | `openclaw/openclaw` candidate only | pending | pending | pending | none authorized | offline; no acquisition or install authorized | `defer` | No revision-pinned target is ready. |
| Python/CLI | `Panniantong/Agent-Reach` candidate only | pending | pending | pending | none authorized | offline; no acquisition or install authorized | `defer` | No revision-pinned target is ready. |
| MCP/Agent | Current packed RepoAssure MCP plus a future authorized source-lane bundle | pending | RepoAssure source known; source bundle pending | pending | none authorized | offline; no install authorized | `defer` | Current Web/Python run bundle is missing. |

## Prepared Recommendations

These recommendations are fail-closed preparation, not maintainer decisions.

| Lane | Candidate | Recommended interim state | Reason |
| --- | --- | --- | --- |
| Web | `openclaw/openclaw` | `defer` | Historical evidence is stale and no current revision-pinned target worktree is available. |
| Python/CLI | `Panniantong/Agent-Reach` | `defer` | Historical evidence exists, but no current revision-pinned target worktree is available. |
| MCP/Agent | Current packed RepoAssure MCP plus a current authorized Web or Python/CLI run bundle | `defer` | The required current source-lane run bundle does not exist yet. |

Recommended interim state: defer.

Detailed evidence and approval prerequisites are recorded in
`docs/acceptance/representative-multi-mode-acceptance-target-decision-preparation-v0.1.md`.
The maintainer explicitly confirmed all three `defer` decisions. The
recommendation and the maintainer decision remain separately identified.

## Required Evidence Before `approve_execution`

- Public/non-private or explicitly owner-authorized source.
- Repository owner, source URL or fixture origin, and license.
- Exact commit SHA or deterministic fixture digest.
- Product-shape fit for the selected lane.
- Secret, customer-data, private-source, and personal-data review.
- Reproducible runtime and dependency prerequisites.
- Exact commands, timeouts, allowed output paths, and stop conditions.
- Network, dependency-installation, external-service, and credential boundary.
- Disposable workspace path and original-repository read-only proof plan.
- Rollback/cleanup plan for the isolated copy and local artifacts.

## Execution Boundary

Even after `approve_execution`:

- authorization is limited to the named lane, target, revision, commands, and
  time window;
- the original target repository stays read-only;
- source modification and automatic patch application remain prohibited;
- generated output is limited to the isolated `.hardening/` and ignored local
  campaign artifact directories;
- no production credentials, paid services, customer systems, or production
  endpoints may be used;
- a separate execution Goal must consume the recorded decision.

This intake does not authorize target execution or target repository writes.

## Current Result

- Explicit lane decisions recorded: 3/3.
- Approved targets: 0/3.
- Representative repositories executed: 0.
- Target repository writes: 0.
- Final product acceptance inferred: no.

## Next Step

RepoAssure Representative Multi-Mode Acceptance Target Readiness and
Acquisition Authorization Package v0.1 may prepare exact target-readiness and
future acquisition authorization material. It must not acquire, clone,
install, start, analyze, execute, or write any target.
