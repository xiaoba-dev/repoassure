# ADR-0018: Public Website Localization Strategy

- Status: Accepted
- Date: 2026-06-25
- Deciders: hardening-mcp maintainers

## Implementation Status

Public Website i18n v0.1 is implemented for the website app under `apps/website`.

- English remains the default locale.
- Simplified Chinese (`zh-CN`) is the first non-English locale.
- Japanese (`ja`) and Korean (`ko`) remain roadmap-only locales with no runtime copy in this increment.
- Website copy is stored in typed locale dictionaries.
- The website includes a visible language switcher.
- The Trust Ledger hero preview is code-native and uses the same locale dictionaries for every visible label, row, status, and footer string.
- Localized forbidden-claim checks cover every shipped locale.
- Browser verification covers English default rendering, Simplified Chinese switching, desktop and mobile screenshots, localized Trust Ledger preview text, artifact tabs, private-preview form state, and mobile navigation.

Product artifact localization remains out of scope.

## Context

RepoAssure's public website targets an international AI developer and engineering audience. English should remain the default public surface, but Chinese, Japanese, and Korean developer communities are strategically relevant for AI coding adoption.

The website copy is still changing while the product is in private preview. Translating every language immediately would create high maintenance cost and increase the risk of inaccurate claims about public release, SaaS availability, Team Cloud, Enterprise, or package publication.

Localization also has two different scopes that must not be confused:

- Public website localization: localized marketing, positioning, trust, roadmap, and private-preview copy.
- Product artifact localization: localized hardening reports, repair plans, acceptance packages, generated tests, CLI output, and AI IDE handoff materials.

The second scope changes product behavior and should not be authorized by a website localization decision.

## Decision

Adopt a phased public website localization strategy.

Default to English and add Simplified Chinese first. Japanese and Korean are roadmap locales after English and Simplified Chinese positioning stabilize.

Implementation should start with i18n architecture, not broad translation volume:

- Extract public website copy into locale dictionaries before adding multiple languages.
- Keep English as the default locale.
- Add `zh-CN` as the first non-English locale.
- Treat `ja` and `ko` as planned roadmap locales, not v0.1 scope.
- Add localized forbidden-claim checks before shipping localized copy.
- Keep public website screenshots and interface previews code-native when they contain user-visible translatable text.
- Use professional localization for release-boundary terms such as private preview, planned, local-first, open core, no source upload by default, Team Cloud, and Enterprise.
- Do not treat website localization as product artifact localization.

Localized forbidden-claim checks must prevent every locale from implying:

- SaaS is available.
- Team Cloud is available.
- Enterprise is available.
- A public npm package is available.
- The public repository is already published.
- Source code is uploaded by default.

## Consequences

### Positive

- Gives RepoAssure a credible path toward global developer adoption.
- Keeps the first implementation small and maintainable.
- Reduces translation drift while product positioning is still evolving.
- Makes release-boundary copy testable across languages before public exposure.

### Negative

- Japanese and Korean audiences remain roadmap rather than immediate scope.
- Locale dictionaries add maintenance overhead even before full i18n routing exists.
- English and Simplified Chinese must stay synchronized when release posture changes.

### Follow-up

- Keep English and Simplified Chinese locale dictionaries synchronized when release posture changes.
- Keep localized forbidden-claim tests current for every supported locale.
- Defer `/en/`, `/zh-CN/`, `/ja/`, and `/ko/` SEO route strategy until the routing and deployment plan is accepted.
- Create a separate ADR before localizing hardening reports, repair plans, acceptance packages, generated tests, CLI output, or AI IDE handoff materials.
