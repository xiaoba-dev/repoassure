# RepoAssure PRD Gateway

Status: Accepted
Owner: maintainer
Purpose: Product intent source-of-truth gateway

## Product Intent

RepoAssure is a local-first AI code acceptance and delivery assurance layer. It helps maintainers turn AI-generated repositories into reviewable, testable, repairable engineering assets.

RepoAssure is not positioned as another AI IDE, a general-purpose vulnerability scanner, or a default target-repo auto-fix bot.

## Current Product Scope

- Local CLI, MCP Server, and GitHub Action wrapper for repo acceptance.
- Browser and Python/CLI acceptance modes.
- Local hardening reports, repair plans, repair task packages, handoff packages, execution evidence, patch plans, validation campaign summaries, and AI IDE repair evidence bundles.
- Public website and private-preview release readiness surfaces.
- Open-core local artifact contract with Team Cloud and Enterprise as future commercial roadmap surfaces.

## Current Non-Goals

- No default target repo mutation.
- No automatic target repo branch, commit, pull request, issue, advisory, or file mutation.
- No target repo source upload by default.
- No npm publication, GitHub release, public launch, customer contact, pricing/spend change, or commercial availability claim without a separate authorization goal.

## Governing Product Sources

- `docs/product/specs/mvp-spec-v0.3.md`
- `docs/product/specs/team-cloud-enterprise-spec-v0.1.md`
- `docs/product/specs/public-website-spec-v0.1.md`
- `docs/product/specs/project-intelligence-console-spec-v0.1.md`
- `docs/product/strategy/commercialization-strategy-v0.1.md`
- `docs/product/strategy/open-core-packaging-spec-v0.1.md`
- `docs/product/research/global-competitive-landscape-2026-07-05.md`
- `docs/product/research/market-sizing-tam-sam-som-2026-07-05.md`

## Related ADRs

- ADR-0009: Commercialization and licensing strategy.
- ADR-0010: RepoAssure brand positioning.
- ADR-0014: Distribution and repair loop readiness.
- ADR-0016: Team Cloud and Enterprise commercial edition boundary.
- ADR-0017: Public website and internal Project Intelligence Console.
- ADR-0024: Autopilot-compatible documentation architecture.
