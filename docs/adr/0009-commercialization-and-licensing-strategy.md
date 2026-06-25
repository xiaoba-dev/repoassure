# ADR-0009: Commercialization and Licensing Strategy

- Status: Accepted
- Date: 2026-06-22
- Deciders: hardening-mcp maintainers

## Context

`hardening-mcp` has moved beyond a browser-only diagnostic prototype. It now produces run-scoped hardening artifacts, repair plans, repair task packages, repair handoff packages, repair execution reports, and patch plans for AI IDEs and coding agents.

This creates a product boundary decision. The project can either compete directly with AI IDEs, remain a local-only developer utility, or become the quality and acceptance layer that sits between AI-generated code and production delivery.

The commercialization strategy also affects architecture. License choice, open-core boundaries, hosted services, enterprise controls, and internal usage across multiple AI-owned projects will determine which modules should remain protocol-like public infrastructure and which modules should become commercial product surfaces.

At decision time, the repository was private in `package.json` and had no repository-level `LICENSE` file. This ADR records the intended strategy before a public release; it does not by itself publish the project or create a legal license grant. ADR-0015 later allows adding Apache-2.0 readiness materials while keeping public publication blocked until manual authorization.

## Decision

Position `hardening-mcp` as an AI code quality and delivery assurance layer, not as another AI IDE.

The product promise is:

> Turn AI-generated repositories into reviewable, repairable, and deliverable engineering assets.

Adopt an open-core commercialization model:

- Release the developer-facing core under Apache-2.0 before public distribution.
- Keep CLI, MCP integration, artifact schemas, acceptance modes, basic repair plan generation, and local-first run bundles in the open core.
- Keep hosted dashboards, multi-repo history, organization policy management, SSO/RBAC, audit retention, advanced rule packs, industry templates, cloud orchestration, and managed enterprise deployment as commercial product surfaces.
- Maintain local-first execution as a default architecture principle for the open core.
- Treat Team Cloud and Enterprise/on-prem deployments as later packaging layers over the same artifact contracts instead of replacing local artifacts with a cloud-only workflow.

Use Apache-2.0 as the primary open-source license target for the open core because it maximizes adoption while providing an explicit patent grant that is friendly to enterprise users.

Do not use AGPL, BSL, FSL, SSPL, or Elastic License for the initial public release. Those licenses can be reconsidered only if there is clear commercial abuse or cloud-provider replication risk that outweighs adoption and ecosystem integration.

Position the project internally as the quality infrastructure for the maintainers' own AI project portfolio:

- Every owned AI project should be able to run acceptance and hardening flows before delivery.
- The resulting artifacts should become internal quality evidence, repair backlogs, and case-study material.
- Internal usage should feed product roadmap decisions before adding broad enterprise features.

## Commercialization Model

| Layer | Audience | License or packaging | Primary value |
| --- | --- | --- | --- |
| Open core | Individual developers, open-source projects, AI builders | Apache-2.0 target | CLI, MCP, artifact contracts, local acceptance, repair plans, patch plans |
| Team Cloud | Small teams, AI agencies, delivery teams | Commercial SaaS | Hosted reports, multi-repo history, trend views, collaboration, PR gates |
| Enterprise / on-prem | Regulated teams and larger organizations | Commercial license | Private deployment, SSO/RBAC, audit retention, policy center, compliance-ready reports |
| Internal portfolio | Maintainers' own AI projects | Internal platform usage | Quality gate, delivery evidence, feedback source for agents and coding workflows |

## Open-Core Boundary

Open core:

- CLI and MCP entrypoints.
- Local analysis, boot, exploration, acceptance, and validation flows.
- Browser and Python/CLI acceptance modes.
- Run-scoped artifact bundles and workspace manifests.
- Public JSON schemas for reports, repair plans, task packages, handoff packages, execution reports, and patch plans.
- Basic rule packs needed for credible local usage.
- Documentation, examples, and GitHub Action integration when added.

Commercial surfaces:

- Hosted report storage and dashboards.
- Organization and workspace-level history.
- Cross-repo quality scoring and trends.
- Policy management, approvals, SSO/RBAC, audit retention, and enterprise governance.
- Advanced rule packs for regulated domains.
- Industry templates for financial, healthcare, government, and high-assurance software delivery.
- Managed runners, cloud execution, and private deployment packaging.
- Premium integrations with issue trackers, code hosts, and enterprise AI platforms.

## Go-To-Market Strategy

The initial growth model should be developer-led:

- Publish the open core only after adding the actual `LICENSE` file and public release checklist.
- Lead with concrete artifact examples instead of generic AI testing claims.
- Promote real repo hardening reports, repair plans, and patch plans as the main proof.
- Package GitHub Action and MCP usage paths as the first distribution channels after CLI stability.
- Use the maintainers' own AI project portfolio as public and private case-study material when safe.

Primary message:

> You used AI to generate the code. Now prove it is ready to ship.

Avoid positioning the product as a replacement for Cursor, Codex, Claude Code, GitHub Copilot, or other AI IDEs. The product should integrate with them as the acceptance and repair-evidence layer.

## Consequences

### Positive

- Keeps the core adoption-friendly for AI IDEs, developers, and open-source users.
- Creates a clear commercial boundary without weakening local-first architecture.
- Gives enterprise buyers a reason to pay for governance, retention, and organization workflows instead of basic local execution.
- Lets artifact contracts become a de facto integration standard for AI-generated repo acceptance.
- Turns the maintainers' own AI project portfolio into a product validation engine.

### Negative

- Apache-2.0 allows competitors to reuse the open core, including commercial competitors.
- Commercial value must come from hosted workflow, enterprise controls, rule quality, brand trust, and execution speed rather than source-code exclusivity.
- Open-core boundaries require discipline; features that belong in the public artifact contract should not be held back only because they are useful.
- The project needs legal review before public release, especially around license text, contributor terms, trademarks, and dependency compatibility.

### Follow-up

- Add a repository-level `LICENSE` file before any public open-source release.
- Decide whether package publishing requires changing `package.json` from `"private": true`.
- Add a contribution policy and evaluate whether a CLA or Developer Certificate of Origin is needed.
- Define a public/private module boundary before implementing hosted dashboard or enterprise features.
- Create a commercial packaging spec for Team Cloud and Enterprise/on-prem.
- Add a public release checklist that includes license review, dependency license scan, security review, and trademark naming review.
- Write a go-to-market plan based on real repo case studies, GitHub Action distribution, MCP integration, and AI IDE workflow examples.

### Follow-up Documents - 2026-06-22

- `docs/product/strategy/commercialization-strategy-v0.1.md` records the go-to-market, target customers, monetization stages, and positioning narrative.
- `docs/product/strategy/public-release-checklist-v0.1.md` records the public-release gate before adding `LICENSE`, changing `"private": true`, publishing packages, or announcing the open core.
- `docs/product/strategy/open-core-packaging-spec-v0.1.md` records the initial open-core versus commercial module boundary for future Team Cloud and Enterprise/on-prem work.
