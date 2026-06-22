# Commercialization Strategy v0.1

Status: Draft
Date: 2026-06-22
Source ADR: [ADR-0009](../../adr/0009-commercialization-and-licensing-strategy.md)

## Purpose

Define the first commercialization path for RepoAssure without changing the current local-first product architecture or publishing posture.

## Positioning

RepoAssure is the AI code quality and delivery assurance layer between AI IDEs, coding agents, and production delivery.

Implementation note: `hardening-mcp` remains the current internal package and CLI/MCP implementation name until a separate rename migration is accepted.

Primary message:

> You used AI to generate the code. Now prove it is ready to ship.

The product should integrate with Cursor, Codex, Claude Code, GitHub Copilot, and other AI coding surfaces instead of competing with them as another AI IDE.

## Target Segments

| Segment | Primary pain | Initial offer |
| --- | --- | --- |
| Individual AI builders | AI-generated repos are fast to create but hard to trust | Open-core CLI, MCP, local reports, repair plans, patch plans |
| AI delivery teams | Client delivery needs objective acceptance evidence | Standardized reports, repair handoff packages, verification plans |
| Small engineering teams | Multiple AI-assisted repos need repeatable quality gates | Hosted report history, collaboration, PR gate integration |
| Enterprise and regulated teams | AI coding needs governance, retention, policy, and auditability | Private deployment, SSO/RBAC, audit retention, policy center |

## Commercial Stages

| Stage | Product surface | Success signal |
| --- | --- | --- |
| Open core adoption | CLI, MCP, GitHub Action, artifact schemas | Developers run the tool on real repos and share reports |
| Team Cloud validation | Hosted dashboard, multi-repo history, collaboration | Teams pay to store, compare, and act on hardening evidence |
| Enterprise packaging | On-prem, SSO/RBAC, audit retention, policy center | Regulated teams accept the artifact contract as an AI coding control |

## Growth Motions

- Publish concrete hardening reports, repair plans, and patch plans as proof artifacts.
- Use maintainers' own AI project portfolio as repeatable case-study material when safe.
- Package MCP and GitHub Action entrypoints as the first distribution channels after CLI stability.
- Build public examples around before/after repair evidence rather than abstract AI testing claims.
- Keep competitor positioning anchored by `docs/product/research/competitive-landscape-v0.1.md`, especially around Vibeproof, AgentProof, CodeGate, AgentGate, CodeAsure, and VibeCheck.

## Non-Goals

- Do not position the product as an AI IDE replacement.
- Do not move open-core execution to cloud-only workflows.
- Do not publish the repository or package until the public release checklist is complete.

## Follow-up

- Validate pricing assumptions after at least three real team workflows.
- Convert proven case studies into public examples.
- Revisit license and packaging only if adoption or abuse signals change the assumptions in ADR-0009.
