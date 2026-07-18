# RepoAssure DESIGN

Status: canonical_entrypoint
Source: brownfield_inference_with_owner_confirmation
Last updated: 2026-07-16

This is the canonical design entrypoint. Detailed design decisions remain in `docs/design/`.

## Design Positioning

RepoAssure should feel like a serious security and delivery assurance product: security-grade, evidence-first, local-first, and enterprise-calm.

The public website should show concrete evidence surfaces instead of generic SaaS decoration. Product UI should prioritize proof artifacts, trust ledgers, repair decisions, run manifests, and acceptance boundaries.

## Design Sources

- Design system: `docs/design/design-system-v0.1.md`.
- Public website UI/UX roadmap: `docs/design/website-uiux-roadmap-v0.2.md`.
- Public website spec: `docs/product/specs/public-website-spec-v0.1.md`.
- Enterprise design ADR: `docs/adr/0019-public-website-enterprise-design-system.md`.

## Current Design Status

Public Website v0.2 has been implemented and verified as reviewable. Public Website P3 Pixel QA & Mobile Responsive Polish v0.1 has completed a first implementation pass for owner-reported screenshots:

- mobile Hero single-column override and zh-CN headline wrapping;
- Assurance Graph mobile fallback density;
- Artifact Preview and EvidenceHash overflow protection;
- Trust Ledger responsive row structure;
- private preview CTA and footer proportions.

Remaining design confidence should come from owner visual review of the running page because local screenshot automation was limited by Chrome headless/CDP failures in this environment.

Current design queue status: design_queue_released.

The queue was previously held at `deferred_design_pending` until the owner finalized a new design direction. The owner has now supplied **RepoAssure Design System v2**, so the `owner_finalizes_claude_design` condition is satisfied and the queue is released. See [ADR-0022](adr/0022-repoassure-design-system-v2-and-information-architecture.md) and [the unfreeze record](operations/repoassure-design-system-v2-unfreeze-v0.1.md).

## Design Source of Truth

RepoAssure Design System v2 supersedes `docs/design/design-system-v0.1.md`. It is a three-layer token architecture — primitive scales, theme-aware semantic tokens, and theme-independent console tokens — with a React primitive library.

Two decisions differ from the design system as supplied:

- **Light is the default theme**, dark is opt-in via `[data-theme="dark"]`, and evidence blocks use the always-dark console surface. This inverts the current dark-first website.
- **Brand typefaces are self-hosted.** The design system's font CDN import is not adopted. It conflicts with the local-first product claim, and generated Project Intelligence Console output is forbidden from referencing any external URL.

## Next Design Goal

Active design execution goal: `RepoAssure Design System v2 Adoption v0.1`.

The queued sequence is design system adoption, evidence integrity hashing, `Public Website Claude Design Integration & QA v0.1`, then `Project Intelligence Console Redesign v0.1`.

Design and implementation are authorized. Deployment is not. Website copy must continue to avoid public release claims, fake customer proof, Team Cloud availability, Enterprise availability, and hosted dashboard availability.
