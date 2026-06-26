# Team Cloud & Enterprise Spec v0.1

Status: Draft
Date: 2026-06-25
Source ADR: [ADR-0016](../../adr/0016-team-cloud-enterprise-boundary.md)

## TL;DR

Team Cloud and Enterprise are future commercial editions that turn local RepoAssure artifact bundles into hosted history, collaboration, governance, and enterprise integration workflows. This spec defines the roadmap and acceptance boundary only. No paid cloud implementation in this increment.

## Product Boundary

RepoAssure open core remains the local execution and artifact-generation layer:

- CLI, MCP, GitHub Action, browser acceptance, Python/CLI acceptance, repair plans, repair task packages, repair handoff, repair execution reports, patch plans, and artifact schemas.
- Local-first execution with no default upload of target repo source, logs, screenshots, traces, env values, or private artifacts.
- AI IDE and agent interoperability through `.hardening/latest/manifest.json` and run-scoped bundles.

Team Cloud and Enterprise are commercial packaging layers over those artifacts:

- Team Cloud focuses on hosted dashboards, multi-repo history, collaboration, trend views, and team delivery workflows.
- Enterprise focuses on SSO/RBAC, policy center, audit retention, approvals, advanced governance, private deployment, and enterprise integrations.

## Target Users

| Segment | Need | Commercial value |
| --- | --- | --- |
| AI delivery teams | Repeated client delivery needs evidence and review history | Shared dashboards, comments, assignments, delivery snapshots |
| Small engineering teams | Multiple AI-assisted repos need consistent quality gates | Multi-repo scorecards, trend views, PR gate summaries |
| Enterprise teams | AI coding must satisfy governance, security, retention, and audit controls | SSO/RBAC, policy packs, audit retention, approvals, private deployment |
| Internal portfolio maintainers | Many owned AI projects need comparable readiness evidence | Portfolio dashboard, cross-project backlog, case-study pipeline |

## Capability Map

| Capability | Edition | Priority | Description |
| --- | --- | --- | --- |
| Hosted dashboard | Team Cloud | P0 | Upload or import run manifests and generated artifacts into a hosted report view with repo/run history |
| Team collaboration | Team Cloud | P0 | Comments, owners, statuses, repair assignment, and reviewer decision records around a run |
| Multi-repo history | Team Cloud | P0 | Repo-level and workspace-level history, latest run comparison, regression trend views |
| PR gate summary | Team Cloud | P1 | Pull-request annotation or status summary based on existing local artifacts |
| Enterprise integrations | Enterprise | P1 | GitHub/GitLab, Jira/Linear, Slack/Teams, SIEM/GRC, and enterprise AI platform integration surfaces |
| Advanced governance | Enterprise | P1 | Policy center, approval workflow, evidence retention, exportable compliance report, exception handling |
| Private deployment | Enterprise | P1 | Customer-controlled deployment for regulated teams and private networks |
| Advanced rule packs | Enterprise | P2 | Industry templates for financial, healthcare, government, and high-assurance delivery contexts |

## Roadmap

### Phase 0: Planning Boundary

Status: current increment.

- Accept ADR-0016.
- Define this Team Cloud & Enterprise Spec v0.1.
- Define `docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md`.
- Cascade the decision into commercialization, open-core packaging, architecture, testing, acceptance, and logs.
- Do not implement hosted paid features.

### Phase 1: Team Cloud Prototype

Goal: validate that teams will pay for hosted artifact review and history.

- Import a sanitized run bundle or workspace manifest.
- Display hosted report, findings, repair artifacts, and patch plan.
- Add repo/run history and basic trend views.
- Add comments, ownership, repair status, and reviewer decision.
- Keep upload explicit and artifact-scoped.

### Phase 2: Team Workflow

Goal: turn reports into repeatable delivery workflows.

- Add team workspace, members, repo list, and role basics.
- Add PR summary integration and notification integrations.
- Add run comparison and recurring quality gates.
- Add case-study export for approved internal or public examples.

### Phase 3: Enterprise Governance

Goal: support regulated and large organization adoption.

- Add SSO/RBAC, audit retention, policy center, approvals, exception workflow, and exportable compliance evidence.
- Add private deployment and data residency options.
- Add Enterprise integrations with code hosts, ticketing systems, SIEM/GRC, and enterprise AI platforms.

## Acceptance Criteria

| Area | v0.1 acceptance |
| --- | --- |
| Boundary | ADR-0016 is accepted and linked from ADR index, architecture overview, README, and related strategy docs |
| Product roadmap | Hosted dashboard, Team collaboration, Enterprise integrations, and Advanced governance are explicitly scoped and prioritized |
| Architecture | Commercial control plane is defined as a layer over the Open artifact contract |
| Privacy | Spec states No target repo source upload by default |
| Open core | Spec preserves CLI, MCP, GitHub Action, acceptance modes, and artifact schemas as open-core surfaces |
| Implementation | No paid cloud implementation in this increment |
| Tests | structure-level tests prove the documentation cascade exists |

## Non-Goals

- No hosted paid runtime implementation in v0.1.
- No database schema, SaaS tenancy model, billing system, or cloud deployment code.
- No automatic upload of target repo source, private logs, screenshots, traces, env values, or private artifacts.
- No change to `package.json#private`, repository visibility, npm publication status, or public release authorization.
- No change to the current local-first CLI/MCP/GitHub Action behavior.

## Risks

| Risk | Mitigation |
| --- | --- |
| Cloud work weakens local-first trust | Keep local artifacts and schemas open; make upload explicit and artifact-scoped |
| Commercial edition forks artifact contracts | Add open schema fields first or keep commercial metadata outside artifact payloads |
| Enterprise asks for source upload | Default to no source upload; require separate ADR and explicit customer-controlled deployment model |
| Product scope expands too early | Keep Phase 0 as planning only; require separate implementation goal for Team Cloud prototype |

## Open Questions

- Which artifact subset is enough for a Team Cloud prototype without ingesting screenshots or traces by default?
- Should Team Cloud support a self-hosted lightweight mode before full Enterprise/on-prem packaging?
- Which integration should validate willingness to pay first: GitHub PR summary, Jira/Linear issue export, or Slack/Teams notification?
