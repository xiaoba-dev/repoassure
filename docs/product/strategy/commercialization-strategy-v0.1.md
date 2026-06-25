# Commercialization Strategy v0.1

Status: Draft
Date: 2026-06-22
Source ADR: [ADR-0009](../../adr/0009-commercialization-and-licensing-strategy.md)

## Purpose

Define the first commercialization path for RepoAssure without changing the current local-first product architecture or publishing posture.

## Positioning

RepoAssure is the AI code quality and delivery assurance layer between AI IDEs, coding agents, and production delivery.

Implementation note: `hardening-mcp` remains the current internal package and CLI/MCP implementation name until a separate rename migration is accepted.

Security positioning note: ADR-0013 defines Codex Security and similar scanners as future security evidence providers for RepoAssure, not as products RepoAssure should directly imitate. RepoAssure should commercialize the broader repo readiness, evidence, and repair workflow.

Primary message:

> You used AI to generate the code. Now prove it is ready to ship.

The product should integrate with Cursor, Codex, Claude Code, GitHub Copilot, and other AI coding surfaces instead of competing with them as another AI IDE.

## Target Segments

| Segment | Primary pain | Initial offer |
| --- | --- | --- |
| Individual AI builders | AI-generated repos are fast to create but hard to trust | Open-core CLI, MCP, local reports, repair plans, patch plans |
| AI delivery teams | Client delivery needs objective acceptance evidence | Standardized reports, repair handoff packages, verification plans |
| Small engineering teams | Multiple AI-assisted repos need repeatable quality gates | Hosted report history, collaboration, PR gate integration |
| Enterprise and regulated teams | AI coding needs governance, retention, policy, security evidence, and auditability | Private deployment, SSO/RBAC, audit retention, policy center, pluggable security provider imports |

## Commercial Stages

| Stage | Product surface | Success signal |
| --- | --- | --- |
| Open core adoption | CLI, MCP, GitHub Action, artifact schemas | Developers run the tool on real repos and share reports |
| Team Cloud validation | Hosted dashboard, multi-repo history, collaboration | Teams pay to store, compare, and act on hardening evidence |
| Enterprise packaging | On-prem, SSO/RBAC, audit retention, policy center | Regulated teams accept the artifact contract as an AI coding control |

Team Cloud and Enterprise planning is now governed by [ADR-0016](../../adr/0016-team-cloud-enterprise-boundary.md) and `docs/product/specs/team-cloud-enterprise-spec-v0.1.md`. The commercial edition roadmap covers hosted dashboard, team collaboration, enterprise integrations, and advanced governance, but the current increment is planning-only and includes no paid cloud runtime.

Public website planning is governed by [ADR-0017](../../adr/0017-public-website-and-project-intelligence-console.md) and `docs/product/specs/public-website-spec-v0.1.md`. The website should support brand trust, proof artifacts, docs entry, GitHub entry, and waitlist/private-preview conversion without claiming public release or SaaS availability before those gates are complete.

## Growth Motions

- Publish concrete hardening reports, repair plans, and patch plans as proof artifacts.
- Use maintainers' own AI project portfolio as repeatable case-study material when safe.
- Package MCP and GitHub Action entrypoints as the first distribution channels after CLI stability.
- Treat ADR-0014 v0.3 distribution and repair loop readiness as the bridge from accepted MVP to open-core adoption: GitHub Action, MCP, CLI examples, and repair loop artifacts should prove repeatable local-first usage before Team Cloud work begins.
- Build public examples around before/after repair evidence rather than abstract AI testing claims.
- Keep competitor positioning anchored by `docs/product/research/competitive-landscape-v0.1.md`, especially around Vibeproof, AgentProof, CodeGate, AgentGate, CodeAsure, and VibeCheck.
- Treat Codex Security as an ecosystem tailwind: show how RepoAssure can ingest security findings into acceptance evidence, repair plans, and agent handoff rather than competing as another isolated scanner.

## Non-Goals

- Do not position the product as an AI IDE replacement.
- Do not position the product as a direct Codex Security replacement or generic deep vulnerability scanner.
- Do not move open-core execution to cloud-only workflows.
- Do not publish the repository or package until the public release checklist is complete.

## Follow-up

- Validate pricing assumptions after at least three real team workflows.
- Convert proven case studies into public examples.
- Revisit license and packaging only if adoption or abuse signals change the assumptions in ADR-0009.
- Use `team-cloud-enterprise-spec-v0.1.md` as the roadmap source before starting hosted dashboard, team collaboration, enterprise integrations, or advanced governance implementation.
- Use `public-website-spec-v0.1.md` before implementing or deploying an external website, and keep copy aligned with public release readiness.
