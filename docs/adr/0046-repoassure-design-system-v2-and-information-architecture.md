# ADR-0046: RepoAssure Design System v2 and information architecture redesign

Status: Accepted
Date: 2026-07-18
Deciders: hardening-mcp maintainers
Supersedes: [ADR-0019](0019-public-website-enterprise-design-system.md)

## Context

ADR-0019 recorded a design system decision but explicitly did not authorize a visual redesign: "A separate implementation goal must redesign or refactor `apps/website` against the design system with tests, screenshots, and browser QA."

On 2026-07-16 all website design work was deferred (`docs/operations/public-website-design-work-deferred-v0.1.md`, `Status: deferred_design_pending`, `Deferred until: owner_finalizes_claude_design`). That record states it is "a sequencing decision, not a rejection."

The owner has now supplied the finalized design direction: **RepoAssure Design System v2**, a Primer-inspired three-layer token architecture (primitive scales, theme-aware semantic tokens, theme-independent console tokens) with light and dark themes and a 37-component React primitive library. This satisfies the `owner_finalizes_claude_design` condition.

A full scan of product documentation and implementation was performed before this decision. It surfaced four findings that make a token-only refresh insufficient:

1. **The strongest positioning statement in the repository is absent from the website.** [ADR-0013](0013-codex-security-and-security-assurance-lane.md) states RepoAssure answers "is this repository ready to ship, what evidence proves that, what is still blocking acceptance, and what should the next AI IDE / Agent fix first?" The current website is organized by feature name, not by those questions.

2. **The current information architecture conflates sequence with actors.** The `#how-it-works` section contains both the CLI demonstration (a sequence) and four role cards (actors) under an i18n key named `steps`, so neither reads clearly.

3. **The website claims capabilities the shipped code does not implement.** The "signed" and "cryptographically verifiable" claims have no implementation: the only `createHash` calls in product code produce a directory slug (`src/tools/run-hardening-tool.ts:502`) and a fallback finding ID (`packages/security-assurance/src/import-security-evidence.ts:303`). Emitted `manifest.json` files contain no hash, signature, checksum, or digest field. The existing forbidden-claim guard does not cover this claim.

4. **Demonstration data is internally inconsistent.** The hero shows "214 issues" beside "Readiness score 85 · P0: 0 · P1: 1". Recorded runs produce 1–3 findings; the readiness score triplet matches a real benchmark fixture, the volume does not.

The theme architecture also inverts. The current website is dark-first with per-section `theme-dark` / `theme-light` classes. Design System v2 is light-default with dark opt-in via `[data-theme="dark"]` plus a theme-independent always-dark console surface for evidence.

## Decision

Adopt RepoAssure Design System v2 as the design source of truth for both product surfaces, and redesign the information architecture of each surface against verified product capability.

### Design system

1. Vendor Design System v2 into the workspace. Components read only the semantic token layer.
2. Adopt light as the default theme, dark as opt-in via `[data-theme="dark"]`, and the console token surface for evidence blocks.
3. Self-host the brand typefaces. The design system's default `@import` from a font CDN is not adopted: it conflicts with the local-first product claim, and the Project Intelligence Console test suite forbids any `http://` or `https://` reference in generated output.

### Public website information architecture

4. Restructure the public website around the four questions recorded in ADR-0013, and separate the delivery-sequence content from the delivery-role content that currently share one section.
5. Replace trust-boundary copy with independently auditable claims. Local-first is verifiable by inspection: product code contains exactly two network calls, both to the local application under test.

### Project Intelligence Console

6. Reframe the console from exception reporting to state and confidence reporting. In the steady state the current design renders "No findings" above a list of vendored dependency files, so it is least informative when the project is healthiest.
7. Connect the goal audit and release readiness evidence the console specification already requires but which was never wired in.
8. Preserve the console as a local-only, self-contained static artifact. No hosted dashboard, telemetry, cloud sync, or external resource loading.

### Evidence integrity

9. Implement content hashing for emitted artifacts and a verification command that recomputes and compares them.
10. Use precise terminology. Artifacts are **content-hashed** and integrity is **independently verifiable**. Do not describe them as **signed**: signing requires a key system that is not implemented and is not authorized by this decision.

### Demonstration data

11. Source website demonstration figures from recorded benchmark output rather than composed values.

### Verification

12. Re-baseline the website guardrail tests. Claim guards, bilingual parity, accessibility, and mobile overflow assertions are preserved and extended. Assertions that pin superseded class names, token values, and file layout are rewritten against rendered structure.
13. Keep all user-visible website copy in `apps/website/src/i18n.ts`. The CI-enforced forbidden-claim guard scans that file and the serialized locale objects; copy moved into components would silently bypass it.

## Non-Authorization Boundary

This decision authorizes design and implementation work only. It does not authorize:

- Deployment or any publication of the redesigned surfaces
- Public launch or production marketing announcement
- Repository visibility change, npm publication, or GitHub release
- Public custom domain decisions
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims
- Customer logos, analyst badges, case studies, or certification claims
- Locale expansion beyond `en` and `zh-CN`
- Product artifact localization
- Target repository writes
- Pricing changes or customer contact

Shipping code remains a separate gate from shipping pixels. The public website is currently live on a public custom domain while [ADR-0020](0020-public-website-private-preview-deployment.md) and [ADR-0021](0021-private-preview-hosting-fallback.md) forbid that binding. **This ADR does not resolve, ratify, or supersede that conflict.** It requires a separate recorded owner decision.

## Consequences

### Positive

- The website states the product's strongest and most defensible claim, which is currently unpublished.
- Claims align with implementation. The one materially false claim on a trust-branded product is removed or made true.
- Both surfaces share one token system, ending the drift between the website's dark navy and the console's dark green.
- The console becomes informative in the healthy state, which is its normal state.
- Guardrail tests stop pinning source text, so future design iteration is no longer blocked by string assertions.

### Negative

- The website's visual identity changes substantially under the light-default flip. Brand assets, `theme-color`, and the web manifest all encode the current dark navy and must change together.
- Adopting the new design system supersedes `docs/design/design-system-v0.1.md` and requires the v0.2 website roadmap to be reissued.
- The navigation structure change departs from a frozen decision in `docs/design/website-uiux-roadmap-v0.2.md` §3, which this ADR explicitly authorizes.
- Content hashing adds a verification surface that must stay correct, and a stale or mismatched hash becomes a visible failure.

### Follow-up

- Reissue `docs/design/design-system-v0.1.md` against Design System v2.
- Reissue `docs/design/website-uiux-roadmap-v0.2.md` as v0.3 with the new frozen decisions.
- Extend the forbidden-claim patterns to cover unimplemented integrity claims, so this class of drift is caught automatically.
- Correct the repair-plan evidence hash that disagrees between the artifacts tab and the ledger rows.
- Resolve the ADR-0020 / ADR-0021 custom domain conflict under a separate decision.
- Record whether the internally named `hardening-mcp` package, the `hardening` binary, and the `.hardening/` artifact directory should be reconciled with the RepoAssure product name.

## Cascade Evidence

- Product intent: [docs/PRD.md](../PRD.md)
- Capability boundary: [docs/SPEC.md](../SPEC.md)
- Design direction: [docs/DESIGN.md](../DESIGN.md)
- Execution plan: [docs/PLAN.md](../PLAN.md)
- Positioning basis: [ADR-0013](0013-codex-security-and-security-assurance-lane.md)
- Surface separation basis: [ADR-0017](0017-public-website-and-project-intelligence-console.md)
- Localization basis: [ADR-0018](0018-public-website-localization-strategy.md)
- Superseded design system decision: [ADR-0019](0019-public-website-enterprise-design-system.md)
- Deferral released: `docs/operations/public-website-design-work-deferred-v0.1.md` — carried by the unmerged `design-system-v2` branch, not present in this tree; see [unmerged branch inventory](../operations/unmerged-branch-inventory-v0.1.md)
- Unfreeze record: `docs/operations/repoassure-design-system-v2-unfreeze-v0.1.md` — same branch, same inventory
