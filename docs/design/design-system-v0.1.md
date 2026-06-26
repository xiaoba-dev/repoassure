# RepoAssure Design System v0.1

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

| Role | Current token | Use |
| --- | --- | --- |
| Background | `#ffffff` | Primary page surface |
| Soft background | `#f7fafc` | Subtle section and control backgrounds |
| Ink | `#111827` | Primary text and strong headings |
| Muted text | `#526071` | Secondary copy |
| Border | `#d8e0ea` | Panels, tables, controls |
| Assurance green | `#008a4c` | Positive evidence, accepted status, primary CTA |
| Assurance green dark | `#006c3e` | CTA hover, strong success text |
| Control blue | `#2563eb` | Navigation emphasis, planned/roadmap notes, secondary focus |
| Footer navy | `#0c1b2a` | Dense footer and future console dark surfaces |

### Semantic Token Layer

Public Website v0.2 now uses a three-layer token model in `apps/website/src/styles.css`:

- Brand tokens: `--brand-navy-950`, `--brand-navy-900`, `--brand-assurance`, `--brand-control-blue`, and related brand primitives.
- Semantic tokens: `--surface-hero`, `--surface-page`, `--surface-panel`, `--text-primary`, `--text-muted`, `--text-on-dark`, `--border-subtle`, `--status-verified`, `--status-generated`, `--status-accepted`, `--focus-ring`, and `--focus-ring-on-dark`.
- Component tokens: `--component-radius-control`, `--component-radius-card`, `--component-radius-panel`, `--component-border-subtle`, `--component-border-on-dark`, and `--component-shadow-panel`.

Dark and light sections must opt into explicit theme classes such as `theme-dark` and `theme-light`; future website surfaces should not rely on long post-hoc cascade overrides to infer text or background color.

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

Public Website v0.2 now implements the selected Assurance Graph direction for the first viewport and is closer to the intended enterprise security aesthetic.

Known gaps:

- No reusable component library for website/product-console surfaces.
- Graph visual language exists in the public website hero, but the internal Project Intelligence Console graph language is not implemented yet.
- Later P3 polish can tune mobile information density, panel proportions, type optical weight, and first-viewport spacing against the selected Product Design source.

These gaps should be addressed through future focused implementation goals, not hidden by this document.
