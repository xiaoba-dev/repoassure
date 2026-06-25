# Public Website Spec v0.1

Status: Draft
Date: 2026-06-25
Source ADR: [ADR-0017](../../adr/0017-public-website-and-project-intelligence-console.md)

## TL;DR

RepoAssure should have a responsive public website, but v0.1 is a positioning and private-preview site only. It should explain the local-first workflow, show safe proof artifacts, and collect demand without claiming public release or SaaS availability.

## Purpose

The website exists to answer four questions for first-time visitors:

1. What is RepoAssure?
2. Why do AI-generated repos need delivery assurance?
3. What does RepoAssure produce?
4. How can I follow, try, or request access?

## Audience

| Audience | Need | Website response |
| --- | --- | --- |
| Individual AI builders | Understand whether this helps make generated repos shippable | Explain CLI/MCP/GitHub Action local-first flow |
| AI delivery teams | Need proof artifacts for client delivery | Show sample reports, repair plans, patch plans, and acceptance evidence |
| Engineering teams | Need a repeatable quality gate | Explain open core and future Team Cloud roadmap |
| Enterprise evaluators | Need governance direction | Explain Enterprise roadmap without claiming availability |

## Positioning

Primary message:

> You used AI to generate the code. Now prove it is ready to ship.

Support copy should stay grounded in current truth:

- Local-first open-core workflow.
- Repo hardening artifacts.
- Repair plans and AI IDE handoff packages.
- GitHub Action wrapper readiness.
- Team Cloud and Enterprise are roadmap surfaces, not currently available SaaS.

The website does not claim SaaS availability, public package availability, or public repository availability while release gates remain blocked.

## Page Structure

| Section | Purpose | Notes |
| --- | --- | --- |
| Hero | State category and promise | Product name first; concise value prop; private preview CTA |
| How it works | Explain repo -> hardening run -> repair artifacts -> acceptance evidence | Use simple responsive visual flow |
| Proof artifacts | Show examples of hardening report, repair plan, task package, patch plan | Only safe reviewed examples |
| Open Core | Explain CLI, MCP, GitHub Action, local artifacts | Link docs when public release permits |
| Roadmap | Explain Team Cloud and Enterprise direction | Clearly mark private preview / planned |
| Trust boundary | Explain local-first, no default upload, public release status | Avoid legal overclaim |
| CTA | Waitlist, GitHub, docs, contact | Waitlist can exist before public repo release |

## Responsive Design Requirements

- Mobile-first layout with readable typography and no horizontal scrolling.
- Desktop layout should keep the product signal visible in the first viewport.
- Navigation must fit small screens without overlapping content.
- Proof artifact previews must degrade to compact cards or tabs on mobile.
- CTAs must remain clear without implying general availability.

## Content Guardrails

- Use "private preview", "coming soon", or "roadmap" where capability is not shipped.
- Do not claim public release until public release gates are complete.
- Do not claim hosted dashboard, Team Cloud, Enterprise, SSO/RBAC, or advanced governance availability.
- Do not publish customer repo names, screenshots, traces, logs, or security findings without explicit review.
- Do not expose private artifact paths or local machine paths.

## Acceptance Criteria

| Area | v0.1 acceptance |
| --- | --- |
| Positioning | Website spec explains RepoAssure as an AI code delivery assurance layer |
| Responsive design | Spec explicitly requires responsive design and mobile-safe layout |
| Release boundary | Spec states private preview and does not claim SaaS availability |
| Proof | Spec defines safe proof artifact sections |
| Commercial roadmap | Spec links Team Cloud and Enterprise as roadmap, not shipped features |
| CTA | Spec includes waitlist/private-preview CTA |

## Non-Goals

- No website implementation in this planning increment.
- No domain purchase, DNS, deployment, analytics, waitlist backend, or marketing automation.
- No public release authorization.
- No public exposure of private repo content or generated artifacts.
