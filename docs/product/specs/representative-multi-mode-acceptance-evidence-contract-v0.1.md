# RepoAssure Representative Multi-Mode Acceptance Evidence Contract v0.1

Status: accepted_for_future_authorized_campaign
Date: 2026-07-26
Schema: `repoassure.representative-multi-mode-acceptance-evidence@1`

## Purpose

Define the minimum machine-readable and human-readable evidence needed to
compare Web, Python/CLI, and MCP/Agent representative acceptance lanes without
turning planning artifacts into execution or acceptance authorization.

## Artifact Layout

Future authorized campaigns write only to an ignored local directory:

```text
artifacts/acceptance-campaigns/<campaign-id>/
  campaign-summary.json
  campaign-summary.md
  lanes/
    web/lane-summary.json
    python-cli/lane-summary.json
    mcp-agent/lane-summary.json
```

The lane summary points to existing run-scoped evidence. It does not copy
target source, raw environment values, credentials, or unrestricted logs.

## Required Campaign Fields

| Field | Rule |
| --- | --- |
| `schema` | Exact schema id |
| `campaignId` | Stable local identifier |
| `repoAssureRevision` | Exact tested commit |
| `repoAssurePackageDigest` | Packed package or build digest |
| `generatedAt` | UTC timestamp |
| `status` | `passed`, `blocked`, or `failed` |
| `lanes` | Exactly Web, Python/CLI, and MCP/Agent |
| `falsePositiveReview` | Classification and evidence for every reviewed item |
| `manualDecisionGates` | Detector and campaign decision status |
| `maintainerReview` | Review status, notes, and explicit decision reference |
| `finalAcceptanceEligible` | Boolean derived only from the published rules |
| `boundary` | No-write, no-publication, and non-authorization assertions |

## Required Lane Fields

| Field | Rule |
| --- | --- |
| `laneId` | `web`, `python-cli`, or `mcp-agent` |
| `targetRef` | Redacted target or fixture reference |
| `targetRevision` | Commit SHA or fixture digest |
| `provenance` | Source, license, acquisition, and privacy review |
| `authorizationReceiptRef` | Explicit lane-scoped execution decision record |
| `repoAssureRevision` | Must match the campaign revision |
| `commands` | Bounded commands with exit, timeout, and redacted output refs |
| `evidenceIndex` | Relative paths, hashes, byte counts, and artifact types |
| `result` | `passed`, `blocked`, or `failed` |
| `blockers` | Structured environment, authorization, or product blockers |
| `falsePositiveReview` | Finding classification and decision references |
| `noWriteProof` | Before/after source hashes, mtimes, inventory, allowed outputs |
| `redaction` | Scan status and prohibited-content count |
| `maintainerReview` | `pending`, `approved`, `changes_requested`, or `deferred` |

## AI IDE Read Order

1. `campaign-summary.json`
2. Campaign boundary and final-acceptance eligibility
3. Lane `authorizationReceiptRef` values
4. Lane results and blockers
5. Lane `noWriteProof` and redaction status
6. Lane evidence indexes and run manifests
7. False-positive review and manual-decision gates
8. Maintainer review
9. `campaign-summary.md`

Machine-readable JSON is authoritative. Markdown is a reviewer projection.
Queue order, a lane pass, or generated repair content is never authorization
to execute, patch, publish, or accept.

## Lane Result Rules

### `passed`

- Target revision and RepoAssure revision match the authorization and campaign.
- Every required command and protocol check passed or has an explicitly
  approved not-applicable result.
- Required artifacts exist, parse, and pass content-hash verification.
- Redaction passes with zero prohibited values.
- `noWriteProof` confirms the original target and isolated source files did
  not change outside the allowed artifact boundary.
- No required blocker remains.

### `blocked`

- Required authorization, dependency, runtime, target input, privacy review,
  or maintainer decision is missing.
- The lane stops without being counted as passed or failed.
- No authorization may be inferred from another lane.

### `failed`

- A required product, command, protocol, artifact, integrity, redaction, or
  no-write assertion fails after execution begins.
- The failure retains reproducible evidence and does not trigger automatic
  retries, repairs, detector changes, or acceptance changes.

## Campaign Eligibility Rule

`finalAcceptanceEligible` is true only when:

- all three lane results are `passed`;
- all lane evidence uses the same current RepoAssure revision;
- all P0/P1 product defects are remediated or explicitly accepted as risk;
- all suspected false positives are classified and reviewed;
- both pending detector-calibration decisions are explicitly closed or
  accepted as risk;
- every environment blocker is closed;
- the maintainer approves the campaign summary.

This field permits requesting a new decision. It is not itself an `accepted`
decision.

## Privacy And Redaction

- Store only relative artifact paths or redacted target references.
- Never store tokens, credentials, environment values, authorization headers,
  customer data, private source, or raw long-form provider output.
- Fail closed when redaction cannot be verified.
- Campaign evidence remains local and ignored by Git unless a separate
  sanitized publication decision is recorded.

## Non-Authorization Boundary

This contract does not authorize target selection, dependency installation,
network access, target execution, target writes, command execution, patch
application, detector changes, acceptance-policy changes, publication,
deployment, launch, repository controls, contact, pricing, or spend.
