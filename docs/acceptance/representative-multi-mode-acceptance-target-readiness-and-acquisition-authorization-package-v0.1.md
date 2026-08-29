# RepoAssure Representative Multi-Mode Acceptance Target Readiness and Acquisition Authorization Package v0.1

Status: completed
Date: 2026-07-27
Acquisition authorization status: not_authorized

## Purpose

Prepare reviewable target-readiness material for the deferred Web,
Python/CLI, and MCP/Agent representative acceptance lanes, plus a fail-closed
template for a later acquisition decision.

Readiness evidence is not acquisition or execution authorization.
No acquisition command is authorized by this package.

## Current Authorization State

- Representative lane execution decisions remain: 3/3 defer.
- Acquisition authorization decisions recorded: 0/3.
- Approved acquisitions: 0/3.
- Targets acquired, cloned, installed, started, analyzed, or executed: 0.
- Target repository writes: 0.
- Final product acceptance inferred: no.

Authorization to prepare this package was limited to local documentation and
governance state in the RepoAssure workspace. It was not treated as
authorization to access a remote, acquire a target, install dependencies, or
run an acceptance lane.

## Shared Fail-Closed Rules

Every future `approve_acquisition` decision must name one lane, one intended
source, one immutable revision or digest, the allowed remote boundary, a
disposable destination, a bounded acquisition command envelope, allowed
outputs, expiry, stop conditions, and cleanup. Missing or conflicting fields
keep that lane at `defer`.

Acquisition authorization, if later granted, may only materialize the named
source in the named disposable path. It does not authorize dependency
installation, startup, RepoAssure analysis, tests, MCP traffic, patch
application, target writes, publication, deployment, or launch. Those actions
require later, separately scoped authorization.

## Web Readiness Card

- **Intended source:** `openclaw/openclaw` candidate only; source location,
  owner identity, visibility, and availability remain unverified in this Goal.
- **Ownership review plan:** verify the canonical repository owner and source
  location from maintainer-supplied evidence before any acquisition decision;
  stop on forks, mirrors, redirects, or ownership ambiguity.
- **License review plan:** after a separately authorized acquisition, inspect
  the license file at the pinned revision and record SPDX or equivalent
  evidence; no license conclusion is claimed now.
- **Revision pinning plan:** require an exact immutable commit SHA supplied in
  the future decision record; branches, latest tags, and moving references are
  insufficient.
- **Privacy and secret review plan:** keep credentials disabled; after
  authorized acquisition and before analysis, perform a bounded local review
  for private source, customer data, personal data, and secret-like material;
  stop and quarantine on any hit.
- **Reproducibility prerequisites:** record package manager, lockfile,
  supported runtime, expected start command, local URL, critical route,
  browser prerequisites, timeouts, and Playwright command before execution can
  be considered.
- **Acquisition command envelope draft:** future receipt must allow only
  non-interactive read-only Git remote operations against the exact approved
  source and SHA, with credentials disabled, a 15-minute ceiling, a 2 GiB
  workspace cap, and no hooks, submodules, LFS fetch, installers, or project
  commands.
- **Isolation boundary:** a newly created disposable directory outside the
  original RepoAssure tree and outside any existing target checkout; original
  source remains untouched and read-only.
- **Allowed outputs:** the detached target copy, a redacted acquisition
  receipt, revision proof, byte/file counts, and license/privacy review status
  under the authorized disposable evidence directory only.
- **Stop conditions:** source or SHA mismatch, interactive authentication,
  redirect or ownership ambiguity, size/time cap, submodule or LFS
  requirement, secret/private-data signal, license ambiguity, unexpected
  write outside the disposable path, or any request to install or run.
- **Cleanup plan:** remove only the receipt-named disposable target and
  temporary acquisition artifacts after evidence review; preserve the
  redacted receipt and never delete an unresolved quarantine automatically.

Current readiness: `not_ready`; future acquisition decision: `pending`.

## Python/CLI Readiness Card

- **Intended source:** `Panniantong/Agent-Reach` candidate only; source
  location, owner identity, visibility, and availability remain unverified in
  this Goal.
- **Ownership review plan:** verify the canonical repository owner and source
  location from maintainer-supplied evidence before any acquisition decision;
  stop on forks, mirrors, redirects, or ownership ambiguity.
- **License review plan:** after a separately authorized acquisition, inspect
  the license file at the pinned revision and record SPDX or equivalent
  evidence; no license conclusion is claimed now.
- **Revision pinning plan:** require an exact immutable commit SHA supplied in
  the future decision record; branches, latest tags, and moving references are
  insufficient.
- **Privacy and secret review plan:** keep credentials disabled; after
  authorized acquisition and before analysis, perform a bounded local review
  for private source, customer data, personal data, and secret-like material;
  stop and quarantine on any hit.
- **Reproducibility prerequisites:** record Python version, packaging tool,
  lockfile or constraints, console entry point, `--help` and smoke behavior,
  and any bounded pytest, ruff, or mypy envelope before execution can be
  considered.
- **Acquisition command envelope draft:** future receipt must allow only
  non-interactive read-only Git remote operations against the exact approved
  source and SHA, with credentials disabled, a 15-minute ceiling, a 2 GiB
  workspace cap, and no hooks, submodules, LFS fetch, virtual environment,
  package installation, or Python command.
- **Isolation boundary:** a newly created disposable directory outside the
  original RepoAssure tree and outside any existing target checkout; original
  source remains untouched and read-only.
- **Allowed outputs:** the detached target copy, a redacted acquisition
  receipt, revision proof, byte/file counts, and license/privacy review status
  under the authorized disposable evidence directory only.
- **Stop conditions:** source or SHA mismatch, interactive authentication,
  redirect or ownership ambiguity, size/time cap, submodule or LFS
  requirement, secret/private-data signal, license ambiguity, unexpected
  write outside the disposable path, or any request to install or run.
- **Cleanup plan:** remove only the receipt-named disposable target and
  temporary acquisition artifacts after evidence review; preserve the
  redacted receipt and never delete an unresolved quarantine automatically.

Current readiness: `not_ready`; future acquisition decision: `pending`.

## MCP/Agent Readiness Card

- **Intended source:** the current packed RepoAssure MCP distribution plus a
  future, separately authorized current-version Web or Python/CLI run bundle;
  no external agent or client is selected.
- **Ownership review plan:** bind the RepoAssure source revision to this
  workspace and require provenance for the source-lane bundle and future
  client; stop if any component is unowned, private, or ambiguous.
- **License review plan:** record RepoAssure package provenance and license at
  the pinned revision, plus license evidence for the selected client and
  source-lane target; no new license conclusion is claimed now.
- **Revision pinning plan:** require the RepoAssure commit, packed artifact
  SHA-256, source-lane run ID and manifest digest, and exact client name and
  version before acquisition or protocol execution can be considered.
- **Privacy and secret review plan:** require redacted source-lane artifacts,
  zero production credentials, zero customer data, and a bounded secret-like
  value scan before an AI IDE or MCP client may read the bundle.
- **Reproducibility prerequisites:** record Node.js and package-manager
  versions, packed artifact path and digest, client version, stdio framing,
  initialization and tool-list sequence, artifact-read request, timeouts,
  shutdown proof, and expected allowed output paths.
- **Acquisition command envelope draft:** no target-repository acquisition is
  eligible until a source-lane bundle exists. A future receipt may allow only
  copying already authorized local packed artifacts and the exact redacted
  bundle into a disposable consumer; network access and installation remain
  separately gated.
- **Isolation boundary:** a disposable MCP consumer that cannot write the
  source-lane target, cannot invoke arbitrary commands, and cannot apply
  patches.
- **Allowed outputs:** redacted protocol transcript, tool-list result,
  artifact-read evidence, shutdown evidence, and consumer-local logs under the
  receipt-named disposable evidence directory.
- **Stop conditions:** missing or mismatched digest, stale source-lane bundle,
  client/version drift, unexpected tool or resource exposure, arbitrary
  command request, patch request, target write attempt, credential prompt,
  network request, protocol timeout, or unclean shutdown.
- **Cleanup plan:** stop the disposable client and MCP process, verify clean
  shutdown, then remove only the receipt-named consumer and temporary copies;
  preserve redacted evidence needed for review.

Current readiness: `blocked_on_source_lane_bundle`; future acquisition
decision: `pending`.

## Future Acquisition Authorization Decision Template

Allowed decision per lane:

`approve_acquisition` | `reject` | `defer`

An `approve_acquisition` record is invalid unless it includes:

- lane and exact intended source;
- immutable commit SHA or artifact digest;
- owner/provenance and license review evidence;
- privacy and secret review plan;
- exact network allowlist and acquisition-only command envelope;
- disposable destination and output allowlist;
- time, byte, and expiry bounds;
- stop and cleanup conditions;
- explicit statement that installation, analysis, execution, target writes,
  publication, deployment, and launch remain unauthorized.

## Handoff

The next Goal may record explicit acquisition decisions against this package.
It must keep all decisions pending unless the maintainer supplies the complete
lane-scoped evidence and must not perform the acquisition while recording the
decision.
