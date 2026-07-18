# RepoAssure PRD

Status: canonical_entrypoint
Source: brownfield_inference_with_owner_confirmation
Last updated: 2026-07-16

This is the canonical product entrypoint for RepoAssure. It summarizes the current product truth and routes details to existing source-of-truth documents. It does not replace the detailed PRD/spec records under `docs/product/`.

## Product Intent

RepoAssure is a local-first AI code delivery assurance layer. It helps owners of AI-generated repositories turn uncertain code into reviewable, repairable, and shippable engineering evidence.

The current implementation still uses `hardening-mcp` as the internal package, CLI, and MCP implementation name while RepoAssure is the public product brand.

## Target Users

- Individual AI builders who need a repeatable local hardening workflow before shipping generated repos.
- Engineering teams that need content-hashed evidence, repair plans, and acceptance decisions.
- AI IDE users who need an actionable repair decision package instead of a generic audit report.
- Future Team Cloud / Enterprise evaluators, with those capabilities explicitly marked as planned rather than available.

## Current Product Shape

RepoAssure is a composite product:

- `command_line`: local CLI hardening workflow.
- `mcp_server`: AI IDE / Agent callable MCP server.
- `web_app`: public website and private-preview surface.
- `sdk_package`: workspace packages and typed contracts.
- `composite_product_shape`: shared release, docs, evidence, and governance boundaries.

## Current Shipped Capabilities

- Local repo analysis, app boot, route exploration, generated tests, hardening reports, repair plans, patch plans, acceptance records, AI IDE handoff packages, end-to-end AI IDE repair evidence packages, local Project Intelligence graph snapshots, local static Project Intelligence viewer, graph freshness/staleness findings, ADR cascade remediation backlog generation, ADR cascade decision intake generation, ADR cascade recommendation draft generation, ADR cascade maintainer decision recording, ADR cascade controlled remediation planning, and Project Intelligence ADR Cascade Controlled Remediation Execution v0.1 for 11 owner-authorized ADR documentation cascade repairs.
- Run-scoped `.hardening/runs/<run-id>/manifest.json` evidence bundles and `.hardening/latest` pointer.
- Browser and CLI acceptance modes for target repositories.
- Public website with English and Simplified Chinese support, local-first positioning, and private-preview boundaries.
- Local Project Intelligence `docsGraph`, `codeGraph`, `progressGraph`, freshness/staleness findings, ADR cascade remediation backlog generation, ADR cascade decision intake generation, ADR cascade recommendation draft generation, maintainer decision recording, controlled remediation planning, and controlled documentation remediation execution plus local-only `project-intelligence-viewer.html` rendering under an ignored artifact boundary.
- Public release readiness materials and manual release gate records.

## Protected Boundaries

RepoAssure must not imply that the following are currently available unless a later accepted record explicitly changes the boundary:

- Public repository release.
- npm publication.
- GitHub release.
- Public launch or production marketing announcement.
- SaaS / Team Cloud / Enterprise / hosted dashboard availability.
- Default source-code upload.
- Automatic target repo modification without explicit owner authorization.

## Supporting Documents

- MVP: `docs/product/specs/mvp-spec-v0.1.md`, `docs/product/specs/mvp-spec-v0.2.md`, `docs/product/specs/mvp-spec-v0.3.md`.
- Website: `docs/product/specs/public-website-spec-v0.1.md`.
- Commercial edition boundary: `docs/product/specs/team-cloud-enterprise-spec-v0.1.md`.
- Release readiness: `docs/product/strategy/public-release-checklist-v0.1.md`.
- Brand and commercialization ADRs: `docs/adr/0010-repoassure-brand-positioning.md`, `docs/adr/0009-commercialization-and-licensing-strategy.md`.

## Latest Controlled Remediation

Project Intelligence ADR Cascade Controlled Remediation Execution v0.1 repaired 11 ADR cascade evidence gaps by adding explicit links from the affected ADRs to `docs/PRD.md`, `docs/SPEC.md`, `docs/PLAN.md`, testing strategy, acceptance checklist, logs, and Project Intelligence spec/architecture documents. This is a documentation governance repair only; it does not authorize deployment, public release, hosted dashboard, cloud sync, telemetry, customer contact, pricing changes, or target repo writes.
