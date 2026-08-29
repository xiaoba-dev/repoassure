# RepoAssure Product Applicability Boundary v0.1

Status: documented
Date: 2026-07-24
Conclusion: `product_applicability_boundary_documented`

This strategy record defines where RepoAssure should be positioned. It is a product applicability boundary, not a runtime detector change, release authorization, pricing decision, customer commitment, or promise that RepoAssure fits every possible product.

## Product Principle

RepoAssure is for AI-generated software projects where useful assurance evidence can be produced from code, commands, tests, browser or CLI acceptance flows, logs, and local evidence packages.

In plain language: RepoAssure is strongest when the product can be checked by running software and reading generated evidence. It is weaker when the main quality question is physical behavior, pure visual taste, pure writing quality, or offline business operations.

## Core

Core product types are the first-class fit for current RepoAssure positioning and near-term product development.

| Type | Fit | Why |
| --- | --- | --- |
| Web App | Strong | Browser exploration, route checks, Playwright evidence, UI behavior findings, and repair packages already match this shape. |
| CLI | Strong | Command execution, stdout/stderr, exit codes, generated tests, and local acceptance records are evidence-friendly. |
| AI IDE repair loop | Strong | RepoAssure already produces AI IDE readable repair plans, decision packages, patch plans, and verification checklists. |
| MCP / Agent tooling | Strong | MCP server, agent handoff, local evidence contracts, and no-write boundaries match agent workflow needs. |

## Extended

Extended product types are appropriate when RepoAssure has clear commands, tests, or adapters, but they may need additional fixtures or plugin coverage.

| Type | Fit | Boundary |
| --- | --- | --- |
| Backend API | Good | Needs API route discovery, contract tests, auth-aware fixtures, or service-level smoke commands. |
| SDK / Library | Good | Needs package tests, type-smoke checks, example consumption, and version/package boundaries. |
| Browser Extension | Medium | Needs extension-specific browser harnesses and permission review. |
| Desktop App | Medium | Needs platform-specific launch, UI automation, packaging, and sandbox handling. |

## Partner / Plugin

Partner / Plugin product types are not excluded, but RepoAssure should avoid claiming first-class coverage until dedicated adapters, fixtures, or partner integrations exist.

| Type | Fit | Required support |
| --- | --- | --- |
| Mobile App | Possible | Needs simulator/device automation, mobile build pipelines, screenshots, and platform-specific acceptance. |
| AI Model Evaluation | Possible | Needs eval datasets, scoring contracts, drift reports, and statistical review. |
| Data Pipeline | Possible | Needs sample data, lineage checks, schema checks, replay, and freshness validation. |
| Security integrations | Possible | Needs provider evidence import, provenance, normalized findings, and security-review boundaries. |

## Out of Scope

These product types should not be marketed as direct RepoAssure fits unless a later accepted spec changes the boundary.

| Type | Reason |
| --- | --- |
| Hardware | Physical-world behavior cannot be validated through repo-local code evidence alone. |
| Pure Design | Taste, brand, and visual direction need human design review and screenshots, not only automated code hardening. |
| Pure Docs | Writing quality can be reviewed, but it is not the same as software delivery assurance. |
| Offline Business Process | Manual operational quality cannot be proven by local repo runs without a software execution surface. |

## Prohibited Claims

- Do not claim RepoAssure applies to every product.
- Do not claim full-stack universal automatic acceptance.
- Do not claim RepoAssure replaces human acceptance.
- Do not claim RepoAssure automatically fixes every AI code issue.

## Commercial Packaging Implication

- Open core / local CLI: best for Web App, CLI, MCP / Agent tooling, and AI IDE repair loop evidence.
- Pro: best for richer AI IDE repair packages, Project Intelligence, false-positive governance, and local campaign validation.
- Team Cloud: future team collaboration, shared evidence storage, centralized policy, and reviewer workflow.
- Enterprise: future audit/compliance exports, private deployment, SSO/RBAC, security provider integrations, and governance controls.

These commercial directions are positioning guidance only. They do not claim Team Cloud, Enterprise, hosted dashboard, or SaaS availability.

## Non-Authorization Boundary

This record does not authorize:

- Runtime detector behavior change.
- Finding suppression.
- Automatic severity downgrade.
- Target repo writes.
- Hosted dashboard, cloud sync, or telemetry.
- Deployment, public launch, repository visibility change, npm publication, GitHub release, customer contact, pricing, or spend changes.

## Cascade

RepoAssure Product Applicability Boundary Documentation Cascade v0.1 records this boundary across PRD, SPEC, PLAN, README, testing strategy, acceptance checklist, decision log, dev log, and Autopilot progress with conclusion `product_applicability_boundary_documented`.

At the time this cascade completed, the next Codex goal was Product False-Positive Regression Catalog Detector Calibration Maintainer Decision Recording v0.1. That goal and its follow-up are now historical completed records; the current executable goal must be read from `docs/PLAN.md` and the Autopilot Progress Snapshot.
