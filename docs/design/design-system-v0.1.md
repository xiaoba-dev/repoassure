# RepoAssure Design System v0.1

Status: superseded
Superseded by: RepoAssure Design System v2, adopted in [ADR-0022](../adr/0022-repoassure-design-system-v2-and-information-architecture.md)
Superseded on: 2026-07-19

> Retained as the point-in-time record of the v0.1 design system. The vendored system now lives at `packages/design-system/`; its two deliberate deviations (self-hosted Latin faces, system CJK) are recorded in that package's README.

Source ADR: [ADR-0019](../adr/0019-public-website-enterprise-design-system.md)

## Purpose

RepoAssure's design system defines how public and internal product surfaces should look, feel, and behave as the product moves from private preview toward public release readiness.

The system exists to make RepoAssure feel like a serious security and assurance product, not a generic SaaS landing page.

## Design Principles

### Security-grade

Every screen should feel controlled, precise, and audit-ready.

- Prefer structured evidence surfaces over decorative marketing sections.
- Use restrained motion and strong information hierarchy.
- Make risk, policy, provenance, and verification visible.
- Avoid visual noise that weakens trust.

### Evidence-first

RepoAssure sells proof, not generic productivity.

- Lead with artifact bundles, Trust Ledger, findings, repair plans, patch plans, acceptance decisions, hashes, policy versions, and local run IDs.
- Show concrete state labels: Generated, Accepted, Pending, Blocked, Needs review.
- Pair claims with visible evidence or clear roadmap boundaries.

### Local-first

The visual language must reinforce that user code stays under user control.

- Show local run context, local artifact storage, signed evidence, and no default source upload.
- Avoid cloud-first dashboard imagery unless a separate Team Cloud / Enterprise ADR authorizes it.
- Do not imply hosted storage or collaboration is available.

### Enterprise-calm

RepoAssure should feel mature, not loud.

- Use quiet surfaces, strong spacing, compact labels, precise tables, and muted status color.
- Use depth sparingly for real interface layers.
- Avoid oversized decorative cards, generic gradient hero art, and playful illustration.

## Brand Voice

The voice is direct, technical, and trust-focused.

| Do | Avoid |
| --- | --- |
| "Generate signed local evidence." | "Ship 10x faster with AI." |
| "Review hardening reports, repair plans, and acceptance decisions." | "Magically fix your code." |
| "Private preview. Local-first. No source upload by default." | "Enterprise-ready SaaS available now." |
| "Evidence generated locally." | "Cloud dashboard included." |

## Visual Foundations

### Color Roles

| Role | Token / value | Use |
| --- | --- | --- |
| Page surface | `--surface-page` (`#ffffff`) | Primary light sections |
| Hero / dark surface | `--surface-hero` (`#04111f`) | Header, hero, graph dark bands |
| Soft background | `--surface-page-soft` (`#f7fafc`) | Breathing bands, subtle fills |
| Primary text | `--text-primary` (`#111827`) | Headings and body on light |
| Muted text | `--text-muted` (`#526071`) | Secondary copy |
| Border | `--border-subtle` (`#d8e0ea`) | Panels, tables, controls |
| Accent (brand green) | `--accent` (`#009d5c`) | CTA, section labels, brand emphasis |
| Accent emphasis | `--accent-emphasis` (`#36e58b`) | Dark-surface highlights, focus on dark |
| Success (evidence state) | `--status-success` (`#22d876`) | Verified / generated / accepted markers |
| Control blue | `--brand-control-blue` (`#4f86ff`) | Navigation emphasis, planned notes |
| Footer navy | `--surface-footer` (`#020914`) | Compact footer |

**Accent vs success:** accent drives brand and interactive emphasis; success drives operational evidence state (graph nodes, ledger status, local-complete badges). Do not reintroduce separate `--status-verified` / `--status-generated` / `--status-accepted` tokens on the public website — they were converged in the P1 token cleanup.

### Semantic Token Layer

Public Website v0.2 uses a three-layer token model in `apps/website/src/styles/tokens.css` (imported via `styles.css`):

- **Brand tokens:** `--brand-navy-950`, `--brand-navy-900`, `--brand-assurance`, `--brand-control-blue`, and related primitives.
- **Semantic tokens:** `--surface-hero`, `--surface-page`, `--surface-panel`, `--text-primary`, `--text-muted`, `--text-on-dark`, `--border-subtle`, `--accent*`, `--status-success*`, `--focus-ring`, `--focus-ring-on-dark`.
- **Component tokens:** `--component-radius-control`, `--component-radius-card`, `--component-radius-panel`, `--component-border-subtle`, `--component-border-on-dark`, `--component-shadow-panel`.

Evidence-specific visuals live in `apps/website/src/styles/evidence-system.css`. Responsive breakpoints live in `apps/website/src/styles/responsive.css`.

Dark and light sections must opt into explicit theme classes such as `theme-dark` and `theme-light`; future website surfaces should not rely on long post-hoc cascade overrides to infer text or background color.

UI implementation guardrails and completed sprint scope are recorded in [`website-uiux-roadmap-v0.2.md`](website-uiux-roadmap-v0.2.md).

Future product surfaces can extend this model with:

- `--status-blocked`
- `--risk-high`
- `--risk-medium`
- `--risk-low`
- `--evidence-hash`
- `--policy-boundary`

### Typography

- Use a sober sans-serif stack first. Avoid display fonts that feel consumer or playful.
- Keep letter spacing at `0` except for compact uppercase labels.
- Use large hero type only for the page headline.
- Use smaller, tighter headings inside previews, tables, sidebars, and panels.
- Multilingual layouts must not rely on narrow English word lengths.

### Shape And Depth

- Default card radius: `8px` to `12px`.
- Large product panels may use up to `14px`.
- Shadows should imply interface layering, not decoration.
- Avoid nested cards unless the inner card is a real repeated object, chip, table row, or modal.

### Layout Density

Public marketing sections may breathe, but proof surfaces should be dense and scannable.

- Keep hero product UI visible in the first viewport on desktop.
- Avoid long empty sections before showing product evidence.
- Use tables, ledgers, timelines, and graph surfaces where they clarify proof.
- Mobile layouts must convert dense tables into readable stacked rows.

## Core Components

### Trust Ledger

Trust Ledger is the primary product signal.

Required elements:

- RepoAssure brand lockup.
- Title and subtitle.
- Local run ID.
- Artifact rows.
- Status markers.
- Summary and risk details.
- Evidence hash chips.
- Signed/local footer.

Rules:

- All visible labels must come from locale dictionaries on public website surfaces.
- Do not use raster images for text-heavy product previews.
- Do not imply cloud storage or team collaboration unless explicitly marked planned.

### Proof Cards

Use for the four core artifact types:

- Hardening report.
- Repair plan.
- Patch plan.
- Acceptance decision.

Each card should include:

- Icon.
- Artifact name.
- One clear description.
- Evidence or review implication when space allows.

### Status Badges

Status labels should be short and operational.

| Status | Meaning |
| --- | --- |
| Generated | Artifact exists for review |
| Accepted | Reviewer or policy accepted the run |
| Pending | Awaiting execution or review |
| Blocked | External condition prevents completion |
| Planned | Roadmap only, not shipped |

### Evidence Chips

Evidence chips represent verifiable material.

- Use monospace text.
- Prefer `sha256: xxxx...yyyy`.
- Include a copy affordance when interactive.
- Never expose private local paths on public pages.

### Risk And Policy Panels

Future product surfaces should show:

- Risk rating.
- Policy name and version.
- Finding counts.
- Validation command.
- Source boundary: local, imported evidence, or generated output.

### Graph Surfaces

Future Project Intelligence Console surfaces should use:

- Nodes for docs, code packages, tests, ADRs, goals, and artifacts.
- Edges for ownership, dependency, decision cascade, and verification.
- Compact legends.
- Local-only data boundary labels.
- No customer or private repo content unless explicitly authorized.

## Public Website Requirements

The public website must:

- Present RepoAssure as an AI code delivery assurance layer.
- Make the local-first trust boundary visible above the fold.
- Show concrete proof artifacts before broad roadmap claims.
- Keep Team Cloud and Enterprise clearly marked as planned.
- Include English default and Simplified Chinese support.
- Keep Japanese and Korean roadmap-only until a separate implementation goal.
- Pass localized forbidden-claim checks.

The public website should not:

- Claim SaaS, Team Cloud, Enterprise, SSO/RBAC, hosted dashboard, public npm, or public repository availability before those are true.
- Use fake customer logos or analyst badges.
- Use generic cybersecurity stock imagery.
- Hide the product behind abstract gradients.

## Accessibility And Responsiveness

Minimum standard:

- Keyboard-accessible navigation and controls.
- Visible focus states for `a`, `button`, `select`, `input`, and `[role="tab"]`.
- Meaningful labels for icon-only controls.
- Sufficient text contrast for all primary and secondary copy.
- No text overlap at desktop, tablet, or mobile widths.
- No horizontal scrolling on mobile public pages.
- Locale switching must preserve layout readability.

### Focus Visibility Gate

Public Website v0.2 includes a shared `:focus-visible` system:

- `--focus-ring` is used on light surfaces.
- `--focus-ring-on-dark` is used on dark hero, header, and footer surfaces.
- Browser verification captures `desktop-focus-dark.png` and `desktop-focus-light.png` to prove focus states render in both major surface themes.
- `outline: none` is allowed only when an equivalent visible `:focus-visible` state exists.

Screenshots are not sufficient for full WCAG certification. Browser-level and keyboard-level checks remain required before public release.

## Localization Rules

- English remains the default public locale.
- Simplified Chinese is the first non-English shipped locale.
- Japanese and Korean are roadmap locales.
- Product artifact localization is out of scope unless a separate ADR approves it.
- Text-heavy visuals must be code-native when they appear on localized public website surfaces.

## Forbidden Patterns

Do not use:

- One-note green-only or blue-only palettes.
- Decorative gradient blobs, bokeh, or abstract hero-only visuals.
- Over-rounded, toy-like security UI.
- Fake terminal walls that do not explain proof.
- Huge marketing cards where a dense table or ledger would communicate more trust.
- Claims that imply availability beyond private preview.
- Raster images containing translatable public website text.

## Design QA Gates

Future website redesign work should pass:

- Product Design audit against this design system.
- Desktop and mobile browser screenshots.
- Dark and light focus-state screenshots.
- English and Simplified Chinese layout checks.
- Trust Ledger text localization checks.
- Public-release forbidden-claim checks.
- `pnpm verify:website`.
- `pnpm lint`.
- `pnpm typecheck`.
- `pnpm test:unit`.
- `pnpm goal:audit` when the goal changes acceptance evidence.

## Current Gaps

Public Website v0.2 implements the selected Assurance Graph direction, HeroConsole, ArtifactPreview tabs, CliDemo, OpenCoreDiagram, and the P0–P2 UI/UX roadmap captured in [`website-uiux-roadmap-v0.2.md`](website-uiux-roadmap-v0.2.md).

Known gaps:

- No reusable component library shared between website and future product-console surfaces.
- Graph visual language exists on the public website, but the internal Project Intelligence Console graph language is not implemented yet.
- P3 polish (mobile information density, panel proportions, type optical weight, first-viewport spacing) remains a separate optional goal.
- ja / ko public locales remain roadmap-only.

These gaps should be addressed through future focused implementation goals, not hidden by this document.
