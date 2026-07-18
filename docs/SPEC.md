# RepoAssure SPEC

Status: canonical_entrypoint
Source: brownfield_inference_with_owner_confirmation
Last updated: 2026-07-16

This is the canonical solution entrypoint. It summarizes current system boundaries and routes implementation details to existing specs.

## System Boundary

RepoAssure currently consists of:

- CLI + MCP Server: local-first hardening runtime under `src/`, `apps/cli`, and `apps/mcp-server`.
- Workspace packages: `packages/acceptance`, `packages/shared`, `packages/security-assurance`, `packages/browser-explorer`, and `packages/repair-planner`.
- Public Website: React + Vite app under `apps/website`.
- Documentation and release governance: ADRs, operations records, acceptance records, testing strategy, and release boundary docs.
- Autopilot runtime state: `.autopilot/` machine-readable progress and goal records, with human source-of-truth remaining in `docs/`.

## Runtime Contracts

- CLI/MCP entrypoints remain local-first and must redact secrets before writing stdout, stderr, reports, MCP content, or structured content.
- Hardening runs write repo-local evidence under `.hardening/` and may optionally write central workspace output when explicitly requested.
- AI IDE repair evidence packages aggregate repair handoff, dry-run report, validation-only report, patch plan, maintainer review boundary, verification checklist, and no-write proof without applying patches or modifying target repositories.
- Project Intelligence snapshots generate local-only `docsGraph`, `codeGraph`, `progressGraph`, and freshness/staleness `findings` artifacts under `artifacts/project-graph/`; the local static viewer renders those ignored artifacts into `project-intelligence-viewer.html` without external resources, hosted dashboard, telemetry, upload, deployment, or target repo writes.
- Project Intelligence ADR cascade backlog generation reads local `missing_cascade` findings and writes a maintainer-reviewable backlog under `artifacts/project-graph/` without automatically editing ADRs, specs, acceptance docs, tests, logs, or source files.
- Project Intelligence ADR cascade decision intake reads the local remediation backlog and writes Markdown/JSON decision intake records with pending approve / defer / accept-risk / repair slots under `artifacts/project-graph/`; the intake is not a maintainer decision and does not authorize automatic ADR repair or document mutation.
- Project Intelligence ADR cascade recommendation draft reads the local decision intake JSON and writes Markdown/JSON advisory recommendation records with recommended decision, rationale, risk, evidence, and rollback / follow-up notes under `artifacts/project-graph/`; the draft writes no final maintainer decisions and does not authorize automatic ADR repair, document mutation, or repair execution.
- Project Intelligence ADR cascade maintainer decision recording reads the local recommendation draft JSON and writes Markdown/JSON final maintainer decision records under `artifacts/project-graph/`; it records owner-authorized decisions only and still does not authorize automatic ADR repair, document mutation, or repair execution.
- Project Intelligence ADR cascade controlled remediation planning reads the local maintainer decision record JSON and writes Markdown/JSON remediation plan artifacts under `artifacts/project-graph/`; it defines item-to-file mapping, execution order, rollback notes, and verification checklist, but still does not authorize automatic ADR repair, document mutation, or repair execution.
- Project Intelligence ADR Cascade Controlled Remediation Execution v0.1 executed 11 owner-authorized ADR documentation cascade repairs by adding explicit `Cascade Evidence` links to the affected ADRs. It remains a documentation governance repair and does not implement hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo writes.
- Public website copy must not claim public release, SaaS, Team Cloud, Enterprise, hosted dashboard, public npm, or default source upload.
- `.autopilot/` may store sanitized goal, ledger, snapshot, and progress state. Runs, cache, and secrets are local-only.

## Current Implementation References

- Architecture overview: `docs/architecture/overview.md`.
- Monorepo structure: `docs/architecture/specs/monorepo-structure-spec-v0.1.md`.
- Security Assurance Lane: `docs/architecture/specs/security-assurance-lane-spec-v0.1.md`.
- Public website: `docs/product/specs/public-website-spec-v0.1.md`.
- Project Intelligence Console planning: `docs/product/specs/project-intelligence-console-spec-v0.1.md`.
- Team Cloud / Enterprise boundary: `docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md`.

## Current Non-Goals

- No public launch from this spec.
- No repository visibility change.
- No npm publication.
- No hosted Team Cloud or Enterprise runtime implementation.
- No automatic target repo writes outside explicit owner-authorized repair execution.

## Latest Controlled Remediation

Project Intelligence ADR Cascade Controlled Remediation Execution v0.1 repaired 11 ADR cascade evidence gaps across `docs/adr/0001`, `0002`, `0003`, `0004`, `0005`, `0006`, `0008`, `0013`, `0018`, `0020`, and `0021`. The repaired ADRs now link to `docs/PRD.md`, `docs/SPEC.md`, `docs/PLAN.md`, `docs/testing/strategy/test-strategy-v0.1.md`, `docs/acceptance/checklists/acceptance-checklist-v0.1.md`, `docs/logs/decision-log.md`, `docs/logs/dev-log.md`, `docs/product/specs/project-intelligence-console-spec-v0.1.md`, and `docs/architecture/specs/project-intelligence-console-architecture-v0.1.md`.
