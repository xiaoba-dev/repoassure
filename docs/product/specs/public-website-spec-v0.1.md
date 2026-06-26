# Public Website Spec v0.1

Status: Implemented
Date: 2026-06-25
Source ADRs: [ADR-0017](../../adr/0017-public-website-and-project-intelligence-console.md), [ADR-0018](../../adr/0018-public-website-localization-strategy.md), [ADR-0019](../../adr/0019-public-website-enterprise-design-system.md), [ADR-0020](../../adr/0020-public-website-private-preview-deployment.md)

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

## Implementation

The v0.1 website is implemented as the `@repoassure/website` workspace app under `apps/website`.

Public Website v0.2 redesign is implemented against Product Design direction 2, Assurance Graph. It upgrades the first viewport to a dark enterprise security surface while preserving the private-preview and local-first boundaries.

| Surface | Implementation |
| --- | --- |
| Framework | React + Vite app in `apps/website` |
| Primary route | Single responsive public website surface |
| Visual target | Product Design option 1, Trust Ledger direction |
| Design system | `docs/design/design-system-v0.1.md`; v0.2 redesign implements the selected enterprise security direction |
| v0.2 visual target | Product Design direction 2, Assurance Graph |
| Hero preview | Code-native `TrustLedgerPreview` React component with locale-driven visible text |
| Assurance Graph | Code-native `AssuranceGraph` React component with locale-driven visible text |
| Interactions | Mobile navigation, artifact preview tabs, local-only private preview form state |
| Localization | Typed locale dictionaries for English and Simplified Chinese; visible language switcher; Japanese and Korean remain roadmap-only |
| Root scripts | `pnpm dev:website`, `pnpm build:website`, `pnpm typecheck:website`, `pnpm verify:website` |
| QA report | `design-qa.md` |

The private-preview form is frontend state only. It does not write to a database, send email, call an API, or create a waitlist backend.

## Private Preview Deployment Planning

ADR-0020 defines the website deployment boundary.

- Private preview deployment planning is complete before deployment execution.
- Private preview deployment, production deployment, and public launch are separate gates.
- This spec does not authorize website deployment by itself.
- The 2026-06-26 Vercel deployment execution attempt is blocked: the project returned `target production` or an unverifiable `UNKNOWN` preview, all unintended production deployments and aliases were removed, and no accepted active preview URL exists.
- A future deployment execution retry must record hosting target, access control, secret handling, rollback, smoke verification, screenshot evidence, and post-deployment boundaries.
- Public launch still requires explicit maintainer authorization and public-release gates.

## Responsive Design Requirements

- Mobile-first layout with readable typography and no horizontal scrolling.
- Desktop layout should keep the product signal visible in the first viewport.
- Navigation must fit small screens without overlapping content.
- Proof artifact previews must degrade to compact cards or tabs on mobile.
- CTAs must remain clear without implying general availability.

## Enterprise Design System

ADR-0019 defines the public website enterprise design system.

- The target visual language is security-grade, evidence-first, local-first, enterprise-calm.
- The design source of truth is `docs/design/design-system-v0.1.md`.
- Public Website v0.1 was acceptable for private-preview functionality, localization, and evidence boundary checks.
- Public Website v0.2 implements the selected Assurance Graph direction against the design system with Product Design QA evidence, desktop/mobile screenshots, localized layout checks, and browser verification.
- Public Website v0.2 now includes a semantic token layer in `apps/website/src/styles.css` with brand, semantic, and component token groups.
- Public Website v0.2 uses explicit `theme-dark` and `theme-light` section classes so dark hero/header/footer surfaces and white content surfaces do not depend on implicit cascade-only color correction.
- Public Website v0.2 includes a `focus-visible` gate for links, buttons, selects, inputs, and artifact tabs, with browser screenshots for dark and light focus states.
- This design system does not authorize customer logos, analyst badges, public release claims, SaaS availability, Team Cloud availability, Enterprise availability, or product artifact localization.

## Content Guardrails

- Use "private preview", "coming soon", or "roadmap" where capability is not shipped.
- Do not claim public release until public release gates are complete.
- Do not claim hosted dashboard, Team Cloud, Enterprise, SSO/RBAC, or advanced governance availability.
- Do not publish customer repo names, screenshots, traces, logs, or security findings without explicit review.
- Do not expose private artifact paths or local machine paths.

## Localization Strategy

ADR-0018 defines the public website localization strategy.

- English remains the default website locale.
- English + Simplified Chinese first is implemented in `apps/website/src/i18n.ts`.
- Japanese and Korean are planned roadmap locales after English and Simplified Chinese positioning stabilizes.
- Locale copy lives in typed dictionaries.
- Trust Ledger hero preview text is code-native DOM copy sourced from the same locale dictionaries, not embedded raster-image text.
- Every supported locale passes localized forbidden-claim checks.
- Website localization does not authorize product artifact localization for hardening reports, repair plans, acceptance packages, generated tests, CLI output, or AI IDE handoff materials.

Localized forbidden-claim checks must prevent translated copy from implying SaaS availability, Team Cloud availability, Enterprise availability, public npm package availability, public repository publication, or source upload by default.

## Acceptance Criteria

| Area | v0.1 acceptance |
| --- | --- |
| Positioning | Website spec explains RepoAssure as an AI code delivery assurance layer |
| Responsive design | Spec explicitly requires responsive design and mobile-safe layout |
| Enterprise design system | Spec references ADR-0019 and `docs/design/design-system-v0.1.md` as the redesign standard |
| Release boundary | Spec states private preview and does not claim SaaS availability |
| Proof | Spec defines safe proof artifact sections |
| Commercial roadmap | Spec links Team Cloud and Enterprise as roadmap, not shipped features |
| CTA | Spec includes waitlist/private-preview CTA |
| Implementation | `apps/website` builds and passes browser verification through `pnpm verify:website` |
| v0.2 redesign | Hero uses code-native Assurance Graph + Trust Ledger dual panel and passes `design-qa.md` with `final result: passed` |
| UI/UX gate | Website CSS includes semantic token layer, explicit dark/light themes, and `focus-visible` coverage; `pnpm verify:website` captures dark and light focus-state screenshots |
| Localization | `apps/website` implements English + Simplified Chinese first, localizes code-native Trust Ledger preview copy, keeps Japanese and Korean as planned roadmap locales, and passes localized forbidden-claim checks |

## Non-Goals

- No domain purchase, DNS, deployment, analytics, waitlist backend, or marketing automation.
- No public release authorization.
- No public exposure of private repo content or generated artifacts.
- No product artifact localization without a separate ADR.
