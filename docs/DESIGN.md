# RepoAssure DESIGN Gateway

Status: Accepted
Owner: maintainer
Purpose: Design source-of-truth gateway

## Design Direction

RepoAssure should feel like an enterprise security and delivery assurance product: evidence-first, local-first, calm, precise, and review-oriented.

Public-facing surfaces must avoid overclaiming availability of SaaS, Team Cloud, Enterprise, hosted dashboard, public launch, npm package, or public release actions unless separately authorized.

## Current Design Surfaces

- Public website.
- Trust Ledger and proof artifact previews.
- Open-core / commercial roadmap communication.
- Future Project Intelligence Console for local docs graph, code graph, and project progress graph.

## Governing Design Sources

- `docs/design/design-system-v0.1.md`
- `docs/design/website-uiux-roadmap-v0.2.md`
- `design-qa.md`
- `docs/product/specs/public-website-spec-v0.1.md`
- `docs/product/specs/project-intelligence-console-spec-v0.1.md`
- `docs/architecture/specs/project-intelligence-console-architecture-v0.1.md`

## Design Boundaries

- Public website localization is currently English + Simplified Chinese; Japanese and Korean remain roadmap locales.
- Product artifact localization is not authorized by the website localization decision.
- Internal Project Intelligence Console remains local-only until separately implemented.
- Hosted commercial dashboard design does not imply hosted runtime availability.

## Related ADRs

- ADR-0017: Public website and internal Project Intelligence Console.
- ADR-0018: Public website localization strategy.
- ADR-0019: Public website enterprise design system.
- ADR-0024: Autopilot-compatible documentation architecture.
