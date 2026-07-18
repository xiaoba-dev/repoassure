# RepoAssure PLAN

Status: canonical_entrypoint
Source: brownfield_inference_with_owner_confirmation
Last updated: 2026-07-16

This is the canonical planning entrypoint. It summarizes current execution order and links to detailed evidence.

## Current Stage

The design queue is released. Public Website Design Work Deferred v0.1 held it at `deferred_design_pending` from 2026-07-16 until the owner supplied RepoAssure Design System v2, which satisfied `owner_finalizes_claude_design`. See [ADR-0022](adr/0022-repoassure-design-system-v2-and-information-architecture.md) and [the unfreeze record](operations/repoassure-design-system-v2-unfreeze-v0.1.md).

Current stage: RepoAssure Evidence Integrity Hashing v0.1 completed. Emitted manifests now carry a content hash per artifact, `hardening verify` recomputes them, and every surface that described artifacts as signed has been corrected. Website information architecture is the next bounded goal.

The current boundary is valid when the following are true:

- Design and implementation work proceeds; deployment does not.
- Local-first and private-preview claims remain preserved.
- Website copy stays in `apps/website/src/i18n.ts` so the forbidden-claim guard keeps covering it.
- No deployment, public launch, repository visibility change, npm publish, GitHub release, public custom domain decision, pricing, spend, or customer contact action is performed.

Unresolved and deliberately not addressed by ADR-0022: the live `repoassure.com` binding conflicts with [ADR-0020](adr/0020-public-website-private-preview-deployment.md) and [ADR-0021](adr/0021-private-preview-hosting-fallback.md), both of which remain Accepted with no amendment. That needs a separate recorded owner decision.

## Active / Next Codex Goal

Next Codex Goal: Public Website Claude Design Integration & QA v0.1

Plain-language explanation: owner 已提供定稿的 RepoAssure Design System v2，`owner_finalizes_claude_design` 条件满足，设计队列解冻（见 [ADR-0022](adr/0022-repoassure-design-system-v2-and-information-architecture.md)）。接下来按四步执行：先把设计系统以 workspace 包落地并自托管字体（不改视觉），再补齐 artifact 内容哈希与校验命令并修正 signed 措辞，然后重构官网信息架构，最后重构 Project Intelligence Console。Project Intelligence ADR Cascade Remediation Closure v0.1 未启动，重新排入队列，在 console 重构之后执行。

Goal sequence:

1. RepoAssure Design System v2 Adoption v0.1 — completed
2. RepoAssure Evidence Integrity Hashing v0.1 — completed
3. Public Website Claude Design Integration & QA v0.1 — active
4. Project Intelligence Console Redesign v0.1 — queued
5. Project Intelligence ADR Cascade Remediation Closure v0.1 — re-queued

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

1. RepoAssure Evidence Integrity Hashing v0.1, to make the integrity claim true before any surface repeats it.
2. Public Website Claude Design Integration & QA v0.1, to restructure the information architecture around the four questions recorded in ADR-0013.
3. Project Intelligence Console Redesign v0.1, to reframe the console from exception reporting to state reporting.
4. Project Intelligence ADR Cascade Remediation Closure v0.1, to rerun freshness/backlog checks and record whether the 11 repaired ADR cascade findings are closed. This goal was active and not started when the design queue was released; it is re-queued, not cancelled.
5. Resolve the ADR-0020 / ADR-0021 custom domain conflict under a separate owner decision before any deployment.
