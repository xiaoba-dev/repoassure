# ADR-0019: Public Website Enterprise Design System

- Status: Accepted
- Date: 2026-06-25
- Deciders: hardening-mcp maintainers

## Context

RepoAssure now has a functional public website with responsive layout, English default copy, Simplified Chinese localization, and a code-native Trust Ledger preview. The current surface is clear and testable, but its visual language is closer to a clean developer-tool landing page than a top-tier security company aesthetic.

The product category requires a stronger enterprise security posture. RepoAssure must communicate assurance, evidence, local-first control, governance readiness, and reviewer confidence without claiming unavailable SaaS, Team Cloud, Enterprise, public npm, or public repository capabilities.

Current related documents are not enough:

- `docs/adr/0010-repoassure-brand-positioning.md` defines the product brand and promise.
- `design-qa.md` records implementation QA evidence for the current website.

Neither file defines reusable visual principles, component rules, tokens, graph conventions, copy boundaries, localization rules, or design QA gates.

## Decision

Create `docs/design/design-system-v0.1.md` as the initial RepoAssure design system source of truth.

The design direction is security-grade, evidence-first, local-first, enterprise-calm.

The public website should evolve toward a top-tier security company aesthetic:

- Confident, restrained, high-trust composition.
- More visible security posture and evidence architecture.
- Product-console realism over decorative SaaS illustration.
- Stronger hierarchy, density control, and audit-ready proof surfaces.
- Clear local-first and private-preview boundaries.

This ADR records the design system decision. It does not authorize a visual redesign by itself. A separate implementation goal must redesign or refactor `apps/website` against the design system with tests, screenshots, and browser QA.

## Scope

The design system v0.1 governs:

- Public website visual language.
- Trust Ledger and proof artifact presentation.
- Future Project Intelligence Console visual foundations.
- Status, evidence, risk, policy, and provenance UI language.
- Responsive and multilingual UI rules for public surfaces.

It does not govern:

- Legal claims, availability claims, pricing, or public release authorization.
- Product artifact localization.
- Hosted dashboard, Team Cloud, Enterprise, SSO/RBAC, or advanced governance availability.
- A full package rename from `hardening-mcp` to RepoAssure.

## Consequences

### Positive

- Gives future website and console work a durable design standard.
- Reduces ad hoc CSS and one-off page decisions.
- Makes enterprise-grade visual QA testable and reviewable.
- Keeps public-facing design aligned with the local-first trust boundary.

### Negative

- Adds a required documentation dependency before large UI redesigns.
- Future website work may need token and component refactoring before visible polish.
- Current website will remain below the target aesthetic until a separate redesign goal is executed.

## Follow-up

- Use `docs/design/design-system-v0.1.md` as the source for Public Website v0.2 redesign.
- Add visual QA checks that compare the website against design system principles, not only against the original Product Design option.
- Keep `design-qa.md` as evidence history, not as the design system source of truth.
- Create a separate ADR before introducing customer logos, public claims, or paid product screenshots.
