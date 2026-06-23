# Open-Core Packaging Spec v0.1

Status: Draft
Date: 2026-06-22
Source ADR: [ADR-0009](../../adr/0009-commercialization-and-licensing-strategy.md)

## Purpose

Define the first packaging boundary between open-core infrastructure and future commercial products.

## Open-Core Package Boundary

The open core should contain capabilities required for credible local use:

- CLI and MCP entrypoints.
- Local analysis, boot, exploration, acceptance, validation, and report generation.
- Browser and Python/CLI acceptance modes.
- Run-scoped artifact bundles and workspace manifests.
- Public artifact schemas for reports, findings, repair plans, repair task packages, repair handoff packages, repair execution reports, and patch plans.
- Basic rule packs and examples needed to demonstrate the workflow.
- GitHub Action integration when added.

## Commercial Product Boundary

Commercial surfaces should focus on organization-level value rather than restricting basic local execution:

- Hosted report storage and dashboard.
- Multi-repo history, trend views, and cross-repo quality scoring.
- Organization policy management, approvals, and PR gates.
- SSO/RBAC and audit retention.
- Advanced rule packs and industry templates.
- Managed runners, private deployment packaging, and enterprise integrations.

## Packaging Rules

- Artifact schemas that AI IDEs or agents need for interoperability should stay open core.
- Local-first execution should remain usable without hosted services.
- Commercial features may orchestrate, store, compare, govern, or retain artifacts, but should not silently fork the artifact contract.
- Hosted dashboard work must define a public/private module boundary before implementation.

## Initial Module Map

| Area | Initial classification | Notes |
| --- | --- | --- |
| `apps/cli` | Open core | App shell over local CLI |
| `apps/mcp-server` | Open core | AI IDE integration surface |
| `packages/acceptance` | Open core | Acceptance, handoff, execution report, patch plan runners |
| `packages/core` | Open core target | Future extraction of shared hardening orchestration |
| `packages/browser-explorer` | Open core | Implemented browser and route exploration package |
| `packages/repair-planner` | Open core | Implemented repair plan and executable task package package |
| Security Assurance Lane | Open core interface, provider-specific packaging TBD | Future provider-backed security evidence import boundary |
| Hosted dashboard | Commercial | Future Team Cloud surface |
| Policy center | Commercial | Future enterprise governance surface |

## Follow-up

- Revisit this spec before implementing hosted dashboard or enterprise packaging.
- Add package-level README updates whenever a module changes classification.
- Revisit the Security Assurance Lane provider packaging boundary before implementing provider-specific import adapters.
