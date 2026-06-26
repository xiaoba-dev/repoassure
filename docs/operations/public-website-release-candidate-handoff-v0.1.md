# Public Website Release Candidate Handoff v0.1

Status: Ready for local review
Date: 2026-06-25
Review branch: `codex/public-website-v0.1`

## Purpose

Package the RepoAssure public website work into a reviewable local release candidate without deploying, publishing, opening a public release, or changing repository visibility.

This handoff is for local review, future PR preparation, and maintainer decision support. It is not a public release authorization.

## Website Change Scope

Included:

- `apps/website` React + Vite public website workspace.
- English default and Simplified Chinese runtime localization.
- Japanese and Korean recorded as roadmap locales only.
- Code-native Assurance Graph hero surface.
- Code-native localized Trust Ledger preview.
- Assurance pipeline, proof artifact cards, open-core section, roadmap section, trust boundary, private preview form, and footer.
- Public Website Enterprise Design System v0.1.
- Public Website UI/UX Gate with semantic token layer, explicit `theme-dark` / `theme-light`, and shared `:focus-visible` coverage.
- Browser verification through `pnpm verify:website`.
- `design-qa.md` final result: passed.

Excluded:

- Do not deploy the website.
- Do not publish npm packages.
- Do not make the repository public.
- Do not create a GitHub release.
- Do not claim SaaS availability.
- Do not claim Team Cloud or Enterprise availability.
- Do not claim hosted dashboard, SSO/RBAC, advanced governance, or commercial cloud runtime availability.
- Do not add customer logos, analyst badges, public case studies, or public repository claims.
- Do not localize product artifacts such as hardening reports, repair plans, acceptance packages, generated tests, CLI output, or AI IDE handoff materials.

## Review Package

Review the website as one coherent package:

1. Public website app:
   - `apps/website/src/App.tsx`
   - `apps/website/src/AssuranceGraph.tsx`
   - `apps/website/src/TrustLedgerPreview.tsx`
   - `apps/website/src/i18n.ts`
   - `apps/website/src/styles.css`

2. Website verification:
   - `scripts/verify-website.mjs`
   - `tests/unit/public-website.test.ts`

3. Product and design documentation:
   - `docs/product/specs/public-website-spec-v0.1.md`
   - `docs/design/design-system-v0.1.md`
   - `design-qa.md`
   - `docs/testing/strategy/test-strategy-v0.1.md`
   - `docs/acceptance/checklists/acceptance-checklist-v0.1.md`
   - `docs/logs/dev-log.md`

4. Decision records:
   - `docs/adr/0017-public-website-and-project-intelligence-console.md`
   - `docs/adr/0018-public-website-localization-strategy.md`
   - `docs/adr/0019-public-website-enterprise-design-system.md`

## Screenshot Evidence

The latest `pnpm verify:website` run writes evidence to `/private/tmp/repoassure-website-qa`:

- `desktop-full.png`
- `desktop-zh-full.png`
- `mobile-full.png`
- `mobile-menu.png`
- `comparison-desktop.png`
- `desktop-focus-dark.png`
- `desktop-focus-light.png`

These screenshots prove the current website renders the selected Assurance Graph direction, English and Simplified Chinese states, mobile navigation, and dark/light focus states.

## Final Verification Gates

Run these gates before asking for maintainer review:

```bash
pnpm vitest run tests/unit/public-website.test.ts tests/unit/project-structure.test.ts
pnpm --filter @repoassure/website typecheck
pnpm --filter @repoassure/website build
pnpm verify:website
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm build
pnpm repo:hygiene
pnpm goal:audit
git diff --check
```

Expected release boundary:

```text
public release ready: no
```

That result is still correct until manual publication gates are complete.

## Final Verification Result

Completed on 2026-06-25:

- `pnpm vitest run tests/unit/project-structure.test.ts --testNamePattern "public website release candidate closure"`: passed.
- `pnpm vitest run tests/unit/public-website.test.ts tests/unit/project-structure.test.ts`: passed, 2 files and 67 tests.
- `pnpm --filter @repoassure/website typecheck`: passed.
- `pnpm --filter @repoassure/website build`: passed.
- `pnpm verify:website`: passed, including desktop, Simplified Chinese desktop, mobile, mobile menu, comparison, `desktop-focus-dark.png`, and `desktop-focus-light.png`.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test:unit`: passed, 36 files and 541 tests.
- `pnpm build`: passed.
- `pnpm repo:hygiene`: passed.
- `pnpm goal:audit`: passed, 35/35.
- `git diff --check`: passed.

## Private Draft PR Status

Created on 2026-06-26:

- PR: [#2 `[codex] Add public website release candidate`](https://github.com/xiaoba-dev/repoassure/pull/2)
- Repository visibility at PR creation: `PRIVATE`
- Base branch: `main`
- Head branch: `codex/public-website-v0.1`
- Initial review commit: `0c8a6618a12a87080c51a1f9771ac4e092850415`
- Latest head commit: verify with `gh pr view 2 --json headRefOid` before merge because documentation-only follow-up commits may update the branch.
- PR state: `OPEN`
- PR review mode: `Draft`
- CI: `RepoAssure CI / Quality Gates` passed
- Merge boundary: do not merge without explicit maintainer review and authorization

This PR is a private review surface only. It still does not authorize website deployment, public release, npm publication, GitHub release creation, public repository visibility, Team Cloud, Enterprise, SaaS availability, hosted dashboard claims, or public announcements.

## PR Review Closure Status

Closed on 2026-06-26:

- Review closure goal: `Public Website PR #2 Review Closure v0.1`
- GitHub PR comments: No GitHub PR comments.
- GitHub PR reviews: No GitHub PR reviews.
- CI: `RepoAssure CI / Quality Gates` passed.
- Merge state before ready transition: `CLEAN`.
- PR review mode: Ready for Review.
- Merge boundary: Do not merge without explicit merge authorization.
- Release boundary: Do not deploy the website, publish npm packages, create a GitHub release, make the repository public, or announce public availability from this goal.

This closure means the private review package is ready for maintainer review. It does not mean the website is released, deployed, or merged.

## PR Merge Closure Status

Merged on 2026-06-26:

- Merge closure goal: `Public Website PR #2 Merge Closure v0.1`
- PR: [#2 `[codex] Add public website release candidate`](https://github.com/xiaoba-dev/repoassure/pull/2)
- PR state: `MERGED`
- Merge commit: `b2de16afb42e3afcaa586c8f6edda43c8b64c442`
- Main branch verification: local `main` fast-forwarded to `origin/main` and contains the public website workspace, tests, design QA, ADRs, specs, and handoff documentation.
- PR CI before merge: `RepoAssure CI / Quality Gates` passed.
- Merge method: squash merge.
- Release boundary: this merge does not deploy the website, publish npm packages, create a GitHub release, make the repository public, or announce public availability.

The website release candidate is now part of `main`, but public release and deployment remain separate manual gates.

## Private Preview Deployment Planning

Planned on 2026-06-26:

- Source decision: [ADR-0020: Public Website Private Preview Deployment Boundary](../adr/0020-public-website-private-preview-deployment.md)
- Deployment status: planning only.
- Do not deploy from this planning goal.
- Private preview, production deployment, and public launch are separate gates.
- A future deployment execution goal must choose hosting target, access control, secret handling, rollback, smoke verification, screenshot evidence, and post-deployment boundaries.
- This handoff still does not authorize website deployment, public repo visibility, npm publication, GitHub release creation, external announcement, SaaS availability, Team Cloud availability, Enterprise availability, hosted dashboard claims, or product artifact localization.

## Private Preview Deployment Execution Attempt

Attempted on 2026-06-26:

- User authorization: explicit Vercel data-export approval was provided for uploading RepoAssure website code and build output to Vercel for private preview deployment.
- Hosting target: Vercel project `repoassure` under the authenticated `web3coderman-dev` account.
- Deployment configuration: `vercel.json` now points to `pnpm build:website`, `pnpm install --frozen-lockfile`, and `apps/website/dist`.
- Upload boundary: `.vercelignore` excludes `node_modules`, local build output, local artifacts, `.git`, env files, and key material.
- Result: Vercel repeatedly returned `target production` for CLI deployment attempts, including explicit preview-target commands and a temporary non-main branch deployment.
- Cleanup: all unintended production aliases and deployments were removed.
- Verification: `vercel ls repoassure` returned `No deployments found`.
- Current status: No accepted preview URL is active.

This execution attempt does not satisfy the private preview deployment gate because it did not produce a `Ready`, access-controlled, non-production preview URL with smoke/content/screenshot/forbidden-claim verification evidence.

## Remaining P3 Backlog

These are non-blocking polish items:

- Tune mobile first-viewport density if user testing shows the graph and ledger feel too heavy.
- Refine Assurance Graph line geometry and node spacing for higher visual craft.
- Tune hero product panel proportions against the selected Product Design source.
- Consider locale route and SEO strategy after the website content and repository publication plan stabilize.

## Non-Authorization Boundary

This handoff does not authorize:

- Website deployment.
- Repository visibility change.
- npm publication.
- GitHub release creation.
- External launch announcement.
- SaaS availability claims.
- Team Cloud or Enterprise availability claims.
- Hosted dashboard claims.
- Product artifact localization.

Manual public-release gates remain governed by the public release checklist, branch protection / repository ruleset requirements, legal review, trademark/name review, and explicit maintainer publication authorization.

## Review Checklist

- The website explains RepoAssure as an AI code delivery assurance layer.
- The first viewport shows local-first proof, Assurance Graph, Trust Ledger, and assurance pipeline.
- English is the default public locale.
- Simplified Chinese is implemented.
- Japanese and Korean remain roadmap locales.
- No translated copy implies SaaS, Team Cloud, Enterprise, public npm, public repository, or source upload availability.
- `design-qa.md` reports `final result: passed`.
- UI/UX gate evidence includes semantic tokens and `:focus-visible` browser screenshots.
- The review package contains no generated artifacts, local hardening runs, env files, private keys, or target repo private evidence.
