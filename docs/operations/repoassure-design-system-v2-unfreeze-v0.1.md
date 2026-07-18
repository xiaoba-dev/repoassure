# RepoAssure Design System v2 Unfreeze v0.1

Status: design_queue_released
Date: 2026-07-18
Owner decision: confirmed
Supersedes: [public-website-design-work-deferred-v0.1.md](public-website-design-work-deferred-v0.1.md)

## Summary

The public website design queue was deferred on 2026-07-16 until the owner finalized the new Claude Design direction. The owner has now supplied **RepoAssure Design System v2** and authorized a frontend redesign of both product surfaces.

The deferral condition `owner_finalizes_claude_design` is satisfied. The design queue is released.

## Decision

Release `deferred_design_pending`. Authorize `website_visual_redesign` as a permitted action for the goals listed below.

Design and implementation work may proceed. Deployment may not.

## Released Goals

The two goal IDs previously held in `.autopilot/goals/index.json` `deferred_goal_ids` are released:

- `public-website-owner-visual-acceptance-p3-follow-up-triage-v0.1` — superseded. The P3 follow-up triage items are absorbed into the redesign rather than executed against the superseded design.
- `public-website-claude-design-integration-and-qa-v0.1` — retained, and sequenced after design system adoption.

## Goal Sequence

Design System v2 adoption is split into four goals so that each lands with its own verification evidence.

| Order | Goal | Scope |
| --- | --- | --- |
| 1 | `repoassure-design-system-v2-adoption-v0.1` | Vendor the design system, self-host typefaces, no visual change |
| 2 | `repoassure-evidence-integrity-hashing-v0.1` | Content hashing, verification command, precise terminology, real demonstration data |
| 3 | `public-website-claude-design-integration-and-qa-v0.1` | Website information architecture redesign and guardrail re-baseline |
| 4 | `project-intelligence-console-redesign-v0.1` | Console reframe from exception reporting to state reporting |

Goal 1 is set active. Goals 2 through 4 are registered as queued.

`project-intelligence-adr-cascade-remediation-closure-v0.1` was active and `ready_to_execute` when this decision was recorded. It was not started, is not cancelled, and returns to the queue after goal 4.

## Basis

- Design direction: RepoAssure Design System v2, supplied by the owner
- Architecture decision: [ADR-0022](../adr/0022-repoassure-design-system-v2-and-information-architecture.md)
- Positioning basis: [ADR-0013](../adr/0013-codex-security-and-security-assurance-lane.md)
- Surface separation: [ADR-0017](../adr/0017-public-website-and-project-intelligence-console.md)

## Scan Findings That Shaped the Scope

A full documentation and implementation scan preceded this decision. Four findings extended the scope beyond a token refresh.

1. **Absent positioning.** ADR-0013's four-question framing — is this repository ready to ship, what evidence proves that, what is still blocking acceptance, what should the next AI IDE fix first — appears nowhere on the website.
2. **Unimplemented integrity claim.** "Signed" and "cryptographically verifiable" have no implementation. Emitted manifests carry no hash, signature, checksum, or digest field. The forbidden-claim guard does not cover this claim class.
3. **Inconsistent demonstration data.** The hero shows "214 issues" beside a readiness score triplet that corresponds to a real benchmark fixture. Recorded runs produce 1–3 findings.
4. **Console inversion.** The Project Intelligence Console reports exceptions, so it is least informative when the project is healthy. Its code graph is 85.9% vendored dependency files (2149 of 2502 nodes), which fills the 80-item display window and hides all 357 test-relationship edges.

## Boundary

- No deployment was authorized.
- No public launch was authorized.
- No production marketing announcement was authorized.
- No repository visibility change was authorized.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public custom domain decision was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
- No customer logo, analyst badge, case study, or certification claim was authorized.
- No locale expansion beyond `en` and `zh-CN` was authorized.
- No product artifact localization was authorized.
- No target repository writes were authorized.
- No pricing or spend change was authorized.
- No customer contact was authorized.

## Open Items Not Resolved Here

- The public website is live on `repoassure.com` while [ADR-0020](../adr/0020-public-website-private-preview-deployment.md) and [ADR-0021](../adr/0021-private-preview-hosting-fallback.md) forbid binding a public custom domain. Both remain Accepted with no amendment. This requires a separate recorded owner decision.
- The working tree carries a large volume of uncommitted changes, including website source files that `tests/unit/public-website.test.ts` reads. A fresh clone would fail unit tests. This should be resolved before the redesign adds further untracked files.
- The live site serves an older build than the working tree. Design changes are not visible externally until a separately authorized deployment.

## Evidence

- Owner supplied RepoAssure Design System v2 as the finalized design direction.
- Owner authorized a full frontend redesign of the product, covering both the public website and the Project Intelligence Console.
- Owner approved implementing content hashing with corrected terminology rather than removing the integrity claim.
- Owner approved replacing composed demonstration figures with recorded benchmark data.
- Owner approved triaging the guardrail test suite: preserve claim, bilingual, accessibility, and overflow guarantees; rewrite superseded source-text assertions.
