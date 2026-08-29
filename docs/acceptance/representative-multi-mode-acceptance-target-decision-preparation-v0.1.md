# RepoAssure Representative Multi-Mode Acceptance Target Decision Preparation v0.1

Status: reviewed
Date: 2026-07-26
Decision status: explicit_maintainer_defer_recorded

## Purpose

Prepare a fail-closed decision card for the Web, Python/CLI, and MCP/Agent
representative acceptance lanes. This document records candidate evidence,
missing approval prerequisites, and recommendations. It does not record or
infer a maintainer decision.

No recommendation is a maintainer decision or execution authorization.

## Recorded Maintainer Decision

The maintainer explicitly confirmed:

```text
Web=defer
Python/CLI=defer
MCP/Agent=defer
```

The decision matches the recommendation but is recorded separately from it.
No lane received `approve_execution`.

## Decision Summary

| Lane | Candidate | Current evidence | Missing approval prerequisites | Recommendation |
| --- | --- | --- | --- | --- |
| Web | `openclaw/openclaw` | Historical browser acceptance exists, but it predates the current RepoAssure closure state. The only current `/private/tmp/openclaw` content is a log file and is not a Git worktree. | Current source worktree, exact commit SHA, license review at that revision, privacy/secret review, reproducible start command, isolated workspace, and cleanup plan. | `defer` |
| Python/CLI | `Panniantong/Agent-Reach` | Historical Python/CLI acceptance evidence exists. The target is not present in the current workspace. | Current source worktree, exact commit SHA, license review at that revision, privacy/secret review, exact CLI/static/test command envelope, isolated workspace, and cleanup plan. | `defer` |
| MCP/Agent | Current packed RepoAssure MCP consumed by an isolated AI IDE or MCP client | Packed MCP protocol and deterministic campaign fixtures exist locally. | An authorized current-version run bundle produced by the Web or Python/CLI lane, its digest, the exact client and protocol command envelope, isolated workspace, shutdown proof, and cleanup plan. | `defer` |

Recommended interim state: defer.
Recommendation: defer.

The recommendation applies independently to all three lanes because each
lane currently lacks at least one required approval prerequisite.

## Why Local Fixtures Do Not Close The Gap

The following local inputs are useful contract evidence:

- `fixtures/python-cli-basic`, including a deterministic `pyproject.toml` and
  console-script entry point;
- `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json`, SHA-256
  `b75989af45f1560d0681faeea339977df098117a1cf81b6f6e47f91225ba80b5`;
- benchmark Web fixtures under `fixtures/benchmark/`.

The local deterministic fixtures are contract evidence, not substitutes for current representative real-project acceptance.

They remain suitable for unit, integration, protocol, redaction, and failure
mode coverage. Reusing them as the representative campaign would not satisfy
the maintainer's stated requirement for fresh, multi-shape real acceptance.

## Lane-Specific Approval Requirements

### Web

Before `approve_execution`, record:

- a public or owner-authorized Web repository and exact commit SHA;
- repository URL, owner, and license evidence for that SHA;
- a privacy, secret, customer-data, and personal-data review;
- package manager, dependency state, start command, local URL, required route,
  interaction, timeout, and Playwright command;
- offline/network and installation boundaries;
- a disposable worktree or copy, original-repository read-only proof,
  `.hardening/` output boundary, stop conditions, and cleanup commands.

Historical OpenClaw acceptance does not satisfy these current-version fields.

### Python/CLI

Before `approve_execution`, record:

- a public or owner-authorized Python/CLI repository and exact commit SHA;
- repository URL, owner, and license evidence for that SHA;
- a privacy, secret, customer-data, and personal-data review;
- Python version, package/dependency state, console entry point, `--help` and
  smoke commands, and bounded pytest/ruff/mypy commands;
- offline/network and installation boundaries;
- a disposable worktree or copy, original-repository read-only proof,
  `.hardening/` output boundary, stop conditions, and cleanup commands.

Historical Agent-Reach evidence does not satisfy these current-version fields.

### MCP/Agent

A current Web or Python/CLI run bundle is required before the MCP/Agent lane can be approved.

Before `approve_execution`, record:

- the current RepoAssure revision and packed artifact digest;
- the authorized source lane bundle, run ID, manifest path, and digest;
- the isolated AI IDE or MCP client identity and version;
- exact stdio initialization, tool-list, artifact-read, repair-tool,
  redaction-check, and shutdown commands;
- zero target-repository write, zero arbitrary command execution, and zero
  patch-application boundaries;
- offline/network and installation boundaries;
- isolated workspace, allowed output paths, timeout/stop conditions, and
  cleanup commands.

## Explicit Maintainer Input Required

The maintainer must choose one value for each lane:

```text
Web=approve_execution | reject | defer
Python/CLI=approve_execution | reject | defer
MCP/Agent=approve_execution | reject | defer
```

Recommended response at the current evidence state:

```text
Web=defer
Python/CLI=defer
MCP/Agent=defer
```

The recommended response was not preselected. The maintainer later confirmed
all three `defer` values explicitly. Goal execution authorization, historical
target-testing permission, and prior acceptance evidence were not treated as
lane execution decisions.

## Preserved Boundary

- Target repositories acquired: 0.
- Target repositories installed or started: 0.
- Target repositories analyzed or executed: 0.
- Target repository writes: 0.
- Representative lane execution authorized: 0/3.
- Publication, deployment, launch, repository-control change, contact,
  pricing, or spend change: 0.
- Final product acceptance inferred: no.
