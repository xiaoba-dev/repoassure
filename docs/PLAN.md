# RepoAssure PLAN

Status: canonical_entrypoint
Source: brownfield_inference_with_owner_confirmation
Last updated: 2026-07-16

This is the canonical planning entrypoint. It summarizes current execution order and links to detailed evidence.

## Current Stage

The design queue is released. Public Website Design Work Deferred v0.1 held it at `deferred_design_pending` from 2026-07-16 until the owner supplied RepoAssure Design System v2, which satisfied `owner_finalizes_claude_design`. See [ADR-0022](adr/0022-repoassure-design-system-v2-and-information-architecture.md) and [the unfreeze record](operations/repoassure-design-system-v2-unfreeze-v0.1.md).

Current stage: the ADR-0022 design sequence is complete, and the ADR cascade remediation closure confirmed the original 11 `missing_cascade` findings are cleared. There is no active goal; the next one is the owner's to select.

The current boundary is valid when the following are true:

- Design and implementation work proceeds; deployment does not.
- Local-first and private-preview claims remain preserved.
- Website copy stays in `apps/website/src/i18n.ts` so the forbidden-claim guard keeps covering it.
- No deployment, public launch, repository visibility change, npm publish, GitHub release, public custom domain decision, pricing, spend, or customer contact action is performed.

Unresolved and deliberately not addressed by ADR-0022: the live `repoassure.com` binding conflicts with [ADR-0020](adr/0020-public-website-private-preview-deployment.md) and [ADR-0021](adr/0021-private-preview-hosting-fallback.md), both of which remain Accepted with no amendment. That needs a separate recorded owner decision.

## Active / Next Codex Goal

Next Codex Goal: none selected — the design sequence and ADR cascade closure are complete

Plain-language explanation: ADR-0022 的四步设计序列已全部完成——设计系统落地、证据内容哈希、官网信息架构重建、Console 重构——随后的 ADR cascade 闭环确认原始 11 个 findings 清零，并解决了 1 条此前被 vendor 噪音掩盖的残留 finding。当前无 active goal，下一个目标由 owner 选择。

Goal sequence:

1. RepoAssure Design System v2 Adoption v0.1 — completed
2. RepoAssure Evidence Integrity Hashing v0.1 — completed
3. Public Website Claude Design Integration & QA v0.1 — completed
4. Project Intelligence Console Redesign v0.1 — completed
5. Project Intelligence ADR Cascade Remediation Closure v0.1 — completed

## Acceptance Criteria

- Record Public Website Design Work Deferred v0.1 as the current design boundary.
- Keep website visual polish, design-system rewrite, and Claude Design integration goals deferred until `owner_finalizes_claude_design`.
- Record RepoAssure Product Core Execution Resume v0.1 as completed with selected next goal.
- Record AI IDE Repair Decision Package Contract Hardening v0.1 as completed with deterministic contract evidence.
- Record AI IDE Repair Decision Package Real Campaign Validation v0.1 as completed with fixture consumption evidence.
- Record AI IDE Repair Execution Dry-Run Real Campaign Validation v0.1 as completed with executionPlan, patchPreview, maintainerReview, verificationChecklist, noWriteProof, and no-write evidence.
- Record AI IDE Repair Patch Plan Real Campaign Validation v0.1 as completed with patchPlanInputs, maintainerReview, verificationChecklist, noWriteProof, redaction, and no-write evidence.
- Record AI IDE Repair Validation-Only Real Campaign Validation v0.1 as completed with passed / failed / skipped evidence, redaction, and no-write evidence.
- Record AI IDE Repair End-to-End Evidence Package Validation v0.1 as completed with artifactIndex, repairFlow, taskMatrix, maintainerReview, verificationChecklist, noWriteProof, redaction, and no-write evidence.
- Record Project Intelligence Console Graph Snapshot Generator v0.1 as completed with docsGraph, codeGraph, progressGraph, sourceCoverage, redaction, ignored artifact boundary, and local-only evidence.
- Record Project Intelligence Console Local Static Viewer v0.1 as completed with `project-intelligence-viewer.html`, local-only HTML rendering, redaction boundary, ignored artifact boundary, and no hosted dashboard evidence.
- Record Project Intelligence Console Graph Freshness and Staleness Checks v0.1 as completed with snapshot findings, viewer findings, missing_cascade / orphan_code / missing_test_link / progress_state_mismatch test coverage, and real workspace findings evidence.
- Record Project Intelligence ADR Cascade Remediation Backlog v0.1 as completed with 11 local backlog items and no automatic document rewrite.
- Record Project Intelligence ADR Cascade Remediation Decision Intake v0.1 as completed with 11 pending decision slots, JSON/Markdown intake outputs, and no automatic repair execution.
- Record Project Intelligence ADR Cascade Remediation Recommendation Draft v0.1 as completed with 11 advisory recommended repair decisions, JSON/Markdown draft outputs, and 0 final maintainer decisions written.
- Record Project Intelligence ADR Cascade Maintainer Decision Recording v0.1 as completed with 11 maintainer decision=repair records, JSON/Markdown outputs, and no repair execution.
- Record Project Intelligence ADR Cascade Controlled Remediation Plan v0.1 as completed with 11 plan items, file-level scope, rollback notes, verification checklist, and no repair execution.
- Record Project Intelligence ADR Cascade Controlled Remediation Execution v0.1 as completed with 11 ADR cascade evidence sections, operation record, canonical doc cascade, TDD guard, rollback boundary, and no deployment/cloud/target-repo-write action.
- Record RepoAssure Design System v2 Unfreeze v0.1 as completed with ADR-0022, unfreeze operation record, released design queue, four-goal sequence, canonical doc cascade, governance test re-baseline, and no deployment/public-launch/custom-domain action.
- Record RepoAssure Design System v2 Adoption v0.1 as completed with the `@repoassure/design-system` workspace package, 37 vendored components and declarations, self-hosted Latin faces, system CJK fallback, a console-safe flattened CSS export, dual-path typecheck evidence, and an unchanged website bundle hash.
- Record RepoAssure Evidence Integrity Hashing v0.1 as completed with a manifest integrity block, a portable `hardening verify` command, end-to-end tamper-detection evidence, accurate integrity terminology across website and PRD, real benchmark demonstration figures, and eight new forbidden-claim patterns with a guard-fires test.
- Select Project Intelligence ADR Cascade Remediation Closure v0.1 as the next freshness and residual-finding closure goal.
- Preserve local-first and private-preview claims.
- Do not execute public release, deployment, repository visibility change, npm publish, GitHub release, public launch, customer contact, pricing, or spend changes.
- Record evidence in docs and `.autopilot/progress`.

## Planning Order

The ADR-0022 sequence is complete. Two items are recorded and outstanding, neither of which Autopilot may select on its own:

1. **Resolve the ADR-0020 / ADR-0021 custom domain conflict** under a separate owner decision. `repoassure.com` is bound and indexable while both ADRs forbid exactly that, and both remain Accepted with no amendment. This blocks any deployment.
2. **Tighten `findOrphanCode`** to require a README at the app root rather than at any depth. Recorded during closure and deliberately not actioned there, because changing a detection rule inside a closure run makes the closure evidence unreadable.

Beyond those, the next goal is the owner's to select.
