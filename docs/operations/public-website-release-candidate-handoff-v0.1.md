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

The website release candidate is now part of `main`, but public release remains a separate manual gate.

## Private Preview Deployment Planning

Planned on 2026-06-26:

- Source decision: [ADR-0020: Public Website Private Preview Deployment Boundary](../adr/0020-public-website-private-preview-deployment.md)
- Deployment status: planning only.
- Do not deploy from this planning goal.
- Private preview, production deployment, and public launch are separate gates.
- A future deployment execution goal must choose hosting target, access control, secret handling, rollback, smoke verification, screenshot evidence, and post-deployment boundaries.

## Private Preview Deployment Status

Executed on 2026-06-27 after explicit authorization:

- Hosting target: Cloudflare Pages project `repoassure-preview`.
- Access control: Cloudflare Access application `RepoAssure Private Preview`.
- Access policy: `RepoAssure reviewer allow`.
- Protected review URL: `https://repoassure-preview.pages.dev`.
- Production deployment id: `997feaee-ef39-43c7-ab4d-2c99014df06d`.
- Local browser QA evidence: `/private/tmp/repoassure-website-qa`.

Verification result:

- Local build and browser verification passed before upload.
- Cloudflare preflight passed with status `ready_for_manual_remote_execution`.
- `https://repoassure-preview.pages.dev` returned `302` to Cloudflare Access login with `www-authenticate: Cloudflare-Access`.
- Deployment subdomains and branch aliases returned public `200` responses and must not be shared as private preview URLs.

This remains a private preview only. It does not authorize public launch, production marketing announcement, public repository visibility, npm publication, GitHub release creation, external announcement, SaaS availability claims, Team Cloud claims, Enterprise claims, hosted dashboard availability claims, or product artifact localization.

## Private Preview Reviewer-Side Acceptance

Executed on 2026-06-27:

- Command: `pnpm verify:cloudflare-preview`.
- Evidence directory: `artifacts/public-website-preview/cloudflare-access-acceptance`.
- Protected review URL: `https://repoassure-preview.pages.dev`.
- Automated unauthenticated boundary: passed when the protected URL redirected to Cloudflare Access.
- Protected-resource metadata: passed when the response included `www-authenticate: Cloudflare-Access`.
- Authenticated content smoke: `manual_required`; the allowed reviewer must complete the Cloudflare Access email/OTP login flow and visually confirm the RepoAssure website renders.
- Rollback or shutdown: `manual_required`; disable/delete the Access application or remove the Cloudflare Pages deployment/project if the private preview must be closed.

The accepted private preview URL remains only `https://repoassure-preview.pages.dev`. Deployment subdomains and branch aliases are not accepted review surfaces.

## Private Preview Authenticated Reviewer Acceptance Closure

Closed on 2026-06-27:

- Goal: `RepoAssure Private Preview Authenticated Reviewer Acceptance Closure v0.1`.
- Reviewer identity path: Chrome profile `Web3coderman`, already allowed by the `RepoAssure reviewer allow` Access policy.
- No Access policy widening was performed.
- Desktop authenticated content smoke: passed at `https://repoassure-preview.pages.dev`.
- Mobile-width authenticated responsive smoke: passed after resizing the authenticated Chrome window to a narrow viewport.
- Verified authenticated content included the RepoAssure hero, language selector, private preview CTA, Assurance Graph, Trust Ledger, proof artifact tabs, trust boundary, and private preview form.
- OTP and reviewer credentials were not scripted, exported, persisted, or committed.
- `pnpm verify:cloudflare-preview` remains the automated unauthenticated boundary verifier; authenticated reviewer content smoke remains a human/browser closure step because Cloudflare Access email/OTP login must not be bypassed with stored credentials.
- Rollback or shutdown remains a manual operational action: disable/delete the Access application, remove the allowed reviewer policy, or remove the Cloudflare Pages deployment/project when closing the private preview.

The private preview review surface is accepted for invited reviewer inspection at `https://repoassure-preview.pages.dev`. This still does not authorize public launch, production marketing announcement, public repository visibility, npm publication, GitHub release creation, SaaS availability claims, Team Cloud availability claims, Enterprise availability claims, hosted dashboard availability claims, or sharing any deployment subdomain/branch alias as the review URL.

## Private Preview Reviewer Handoff & Feedback Intake

Prepared on 2026-06-27:

- Handoff: [Private Preview Reviewer Handoff & Feedback Intake v0.1](private-preview-reviewer-handoff-v0.1.md)
- Accepted review URL: `https://repoassure-preview.pages.dev`.
- Audience: allowed reviewers only.
- The handoff includes reviewer instructions, allowed scope, out-of-scope claims, acceptance questions, feedback template, feedback intake workflow, and rollback/shutdown steps.
- Feedback must not include OTP, cookie, Access token, login query-state, or unrelated personal data.
- The handoff does not authorize public launch, production marketing announcement, repo public, npm publication, GitHub release, SaaS, Team Cloud, Enterprise, hosted dashboard claims, or sharing deployment subdomains/branch aliases.

## Private Preview Feedback Triage & Website Polish Backlog

Prepared on 2026-06-27:

- Triage and backlog: [Private Preview Feedback Triage & Website Polish Backlog v0.1](private-preview-feedback-triage-backlog-v0.1.md)
- Defines P0/P1/P2/P3 severity rules.
- Defines backlog item structure and website polish backlog policy.
- Defines gates to expand private preview, pause private preview, or enter public launch preparation.
- Does not authorize sending new reviewer invitations, widening Cloudflare Access policy, public launch, repo public, npm publication, GitHub release, or SaaS/Team Cloud/Enterprise/hosted dashboard claims.

## Private Preview Reviewer Expansion Readiness

Prepared on 2026-06-27:

- Readiness checklist: [Private Preview Reviewer Expansion Readiness v0.1](private-preview-reviewer-expansion-readiness-v0.1.md)
- Defines Access boundary, feedback operations, content/UX, and maintainer decision checklist items for a possible second reviewer batch.
- Requires no open P0/P1 findings before expansion.
- Requires `pnpm verify:cloudflare-preview` to keep passing before expansion.
- Does not authorize adding reviewers, sending invitations, widening Cloudflare Access policy, public launch, repo public, npm publication, GitHub release, or SaaS/Team Cloud/Enterprise/hosted dashboard claims.

## Private Preview Second Reviewer Access Execution

Executed on 2026-06-27:

- Execution record: [Private Preview Second Reviewer Access Execution v0.1](private-preview-second-reviewer-access-execution-v0.1.md)
- User authorization: add `reviewer1@example.com` and `reviewer2@example.com` to `RepoAssure reviewer allow`.
- Execution path: Cloudflare Dashboard UI, because the available Access API token returned `Authentication error`.
- Confirmed allowed test identities: `maintainer-authenticated-smoke-identity`, `reviewer1@example.com`, `reviewer2@example.com`.
- Verification command: `pnpm verify:cloudflare-preview`.
- Verification status: `manual_required`, which is expected because authenticated reviewer smoke still requires manual email/OTP login.
- Sensitive boundary: No OTP, cookie, Access token, login query-state, raw Access redirect URL, or reviewer credential material is recorded in Git-tracked documentation.

This execution only expands the private preview reviewer allow list to the explicitly authorized emails. It still does not authorize public launch, repo public, npm publication, GitHub release, SaaS/Team Cloud/Enterprise availability claims, hosted dashboard claims, or sharing deployment subdomains/branch aliases.

## Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness

Prepared on 2026-06-27:

- Readiness record: [Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness v0.1](private-preview-reviewer-handoff-dispatch-readiness-v0.1.md)
- Current state: `waiting_for_external_reviewer_identity`.
- Current test scope: `maintainer-test-email-1` and `maintainer-test-email-2`.
- Legacy slot names `confirmed-reviewer-1` and `confirmed-reviewer-2` now map to maintainer-owned access smoke test identities.
- Includes a handoff message template and feedback intake record template.
- Does not send email, create external issues, invent reviewer feedback, or record OTP, cookie, Access token, login query-state, raw Access redirect URL, reviewer credentials, or unrelated personal data.

The next feedback triage execution goal should only start after non-maintainer external reviewer feedback is received and redacted.

## Private Preview Reviewer Identity Reconciliation

Prepared on 2026-06-27:

- Reconciliation record: [Private Preview Reviewer Identity Reconciliation v0.1](private-preview-reviewer-identity-reconciliation-v0.1.md)
- Current state: `maintainer_test_identity_corrected`.
- Maintainer / user owns reviewer selection and product decisions.
- Authenticated reviewer identity `maintainer-authenticated-smoke-identity` proves allowed Access smoke, not external reviewer feedback.
- `reviewer1@example.com` and `reviewer2@example.com` are historical placeholders only after Private Preview Real Reviewer Replacement.
- Private Preview Reviewer Identity Correction clarifies that the legacy confirmed reviewer slots are maintainer-owned access smoke test identities, not external reviewers.
- No Cloudflare Access policy change is authorized by this reconciliation.
- No OTP, cookie, Access token, login query-state, raw Access redirect URL, reviewer credentials, or unrelated personal data is recorded.

## Private Preview Reviewer Identity Correction

Prepared on 2026-06-28:

- Correction record: [Private Preview Reviewer Identity Correction v0.1](private-preview-reviewer-identity-correction-v0.1.md)
- Current state: `maintainer_test_identity_corrected`.
- Corrected identity scope: `maintainer-test-email-1` and `maintainer-test-email-2`.
- The legacy `confirmed-reviewer-1` and `confirmed-reviewer-2` slots are maintainer-owned access smoke test identities.
- These identities verify Cloudflare Access/OTP smoke and protected website rendering only.
- They are not external reviewers and do not count as external reviewer feedback.
- No outbound reviewer invitation was sent.

## Private Preview External Reviewer Recruitment and Dispatch Plan

Prepared on 2026-06-28:

- Plan record: [Private Preview External Reviewer Recruitment and Dispatch Plan v0.1](private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md)
- Current state: `ready_for_external_reviewer_selection`.
- Minimum reviewer count: 2.
- External reviewers must be not maintainer-owned and not maintainer test mailboxes.
- Recommended reviewer mix: developer builder, engineering lead, and optional security-minded reviewer.
- Preferred first-batch channel: manual maintainer email.
- Resend remains an option only after a separate channel decision records API key handling, verified domain, sender address, data sharing, and unsubscribe/compliance boundaries.
- No invitation was sent.
- No Cloudflare Access reviewer was added.
- No real reviewer email address is recorded in Git tracked docs.

## Private Preview External Reviewer Selection

Prepared on 2026-06-28:

- Selection record: [Private Preview External Reviewer Selection v0.1](private-preview-external-reviewer-selection-v0.1.md)
- Current state: `ready_for_access_update_decision`.
- Selected slots: `external-reviewer-1`, `external-reviewer-2`.
- Selected archetypes: developer builder and engineering lead.
- Selected first-batch channel: manual maintainer email.
- Access update decision: required_before_dispatch.
- No invitation was sent.
- No Cloudflare Access reviewer was added.
- No real reviewer email address is recorded in Git tracked docs.

## Private Preview Real Reviewer Replacement

Executed on 2026-06-27:

- Replacement record: [Private Preview Real Reviewer Replacement v0.1](private-preview-real-reviewer-replacement-v0.1.md)
- Cloudflare Access policy: `RepoAssure reviewer allow`.
- Removed placeholder reviewer emails: `reviewer1@example.com`, `reviewer2@example.com`.
- Superseded interpretation: `confirmed-reviewer-1`, `confirmed-reviewer-2` are no longer treated as external reviewers.
- Corrected interpretation: `maintainer-test-email-1`, `maintainer-test-email-2`.
- Execution path: Cloudflare Dashboard UI, because prior Access API operations returned `Authentication error`.
- Verification command: `pnpm verify:cloudflare-preview`.
- Expected verification status: `manual_required`, because authenticated reviewer smoke still requires manual email/OTP login.
- Current feedback state: `waiting_for_external_reviewer_identity`.

This replacement does not send reviewer invitations, create external issues, invent reviewer feedback, record OTP/cookie/Access token/login query-state/raw Access redirect URL/reviewer credentials, authorize public launch, make the repo public, publish npm packages, create a GitHub release, or make SaaS/Team Cloud/Enterprise/hosted dashboard availability claims.

## Private Preview External Reviewer Access Update

- Execution record: [Private Preview External Reviewer Access Update v0.1](private-preview-external-reviewer-access-update-v0.1.md)
- Cloudflare Access application: `RepoAssure Private Preview`.
- Cloudflare Access policy: `RepoAssure reviewer allow`.
- Execution path: Cloudflare Dashboard UI.
- Updated slots: `external-reviewer-1`, `external-reviewer-2`.
- Current state: `waiting_for_external_reviewer_dispatch`.
- No invitation was sent.
- No real reviewer email address is recorded in Git tracked docs.
- `pnpm verify:cloudflare-preview` remains the automated unauthenticated boundary verifier; authenticated external reviewer content smoke still requires the reviewer to complete Cloudflare Access email/OTP login.

This update only grants Access allow-list coverage to the selected anonymous external reviewer slots. It does not send reviewer invitations, create external issues, invent reviewer feedback, record OTP/cookie/Access token/login query-state/raw Access redirect URL/reviewer credentials, authorize public launch, make the repo public, publish npm packages, create a GitHub release, or make SaaS/Team Cloud/Enterprise/hosted dashboard availability claims.

## Private Preview External Reviewer Manual Dispatch

- Execution record: [Private Preview External Reviewer Manual Dispatch v0.1](private-preview-external-reviewer-manual-dispatch-v0.1.md)
- Dispatch channel: manual maintainer email.
- Sent from maintainer email account.
- Message template version: `private-preview-reviewer-handoff-package-v0.1`.
- Updated slots: `external-reviewer-1`, `external-reviewer-2`.
- Dispatch status: sent.
- Current state: `waiting_for_reviewer_feedback`.
- No real reviewer email address is recorded in Git tracked docs.
- No external issue was created.
- No reviewer feedback was invented.

This dispatch only sends the private preview handoff package to the selected anonymous external reviewer slots. It does not record OTP/cookie/Access token/login query-state/raw Access redirect URL/reviewer credentials, authorize public launch, make the repo public, publish npm packages, create a GitHub release, or make SaaS/Team Cloud/Enterprise/hosted dashboard availability claims.

## Private Preview Reviewer Handoff Package and Dispatch Execution

Prepared on 2026-06-27:

- Package and dispatch record: [Private Preview Reviewer Handoff Package and Dispatch Execution v0.1](private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md)
- Stage 1: Handoff package generated.
- Stage 2: Dispatch execution pending channel confirmation.
- Current status: `pending_channel_confirmation`.
- Reviewer slots: `confirmed-reviewer-1`, `confirmed-reviewer-2`.
- Corrected slot meaning: maintainer-owned access smoke test identities, not external reviewers.
- Accepted review URL: `https://repoassure-preview.pages.dev`.
- No outbound message was sent.
- Reviewer PII is not stored in Git tracked docs.
- No OTP, cookie, Access token, login query-state, raw Access redirect URL, reviewer credential, or unrelated personal data is recorded.

This package-and-dispatch record does not create external issues, invent reviewer feedback, authorize public launch, make the repo public, publish npm packages, create a GitHub release, or make SaaS/Team Cloud/Enterprise/hosted dashboard availability claims.

## Private Preview Deployment Execution Attempt

Attempted on 2026-06-26:

- User authorization: explicit Vercel data-export approval was provided for uploading RepoAssure website code and build output to Vercel for private preview deployment.
- Hosting target: Vercel project `repoassure` under the authenticated `web3coderman-dev` account.
- Deployment configuration: `vercel.json` now points to `pnpm build:website`, `pnpm install --frozen-lockfile`, and `apps/website/dist`.
- Upload boundary: `.vercelignore` excludes `node_modules`, local build output, local artifacts, `.git`, env files, and key material.
- Result: Vercel repeatedly returned `target production` for CLI deployment attempts, including explicit preview-target commands and a temporary non-main branch deployment.
- Git integration result: pushing `main` also triggered a Vercel production deployment and main alias through Vercel Git integration.
- Git integration mitigation: Vercel Git integration was disconnected with `vercel git disconnect --yes`.
- Cleanup: all unintended production aliases and deployments were removed.
- Verification: `vercel ls repoassure` returned `No deployments found`.
- Current status: No accepted preview URL is active.

This execution attempt does not satisfy the private preview deployment gate because it did not produce a `Ready`, access-controlled, non-production preview URL with smoke/content/screenshot/forbidden-claim verification evidence.

Before any retry, keep the Vercel Git integration disconnected unless the deployment boundary is redesigned and explicitly approved.

## Preview Deployment Retry Status

Retried on 2026-06-26 under Resolve Vercel Preview Target Blocker v0.1:

- Preflight: `main` was clean, latest `RepoAssure CI` passed, Vercel project settings matched `vercel.json`, Git integration was disconnected, and `vercel ls repoassure` returned `No deployments found`.
- Retry 1: `vercel deploy --yes --force --logs` on `main` returned `Production` / `target production`; aliases and deployment `dpl_6qQkuqRBRtGtS3Y1zvJK8AwGyiLG` were removed.
- Retry 2: `vercel deploy --yes --target preview --skip-domain --force --logs` on `main` returned `Production` / `target production`; aliases and deployment `dpl_5n9tj9sHgRQLvRLHvWEnNopDBDbc` were removed.
- Retry 3: `vercel deploy --yes --force --logs` on temporary non-main branch `codex/vercel-preview-target-retry` returned `Production` / `target production`; aliases and deployment `dpl_3DrDKRnDrjH8yUpBuXDZn718eAyM` were removed.
- Cleanup: `vercel ls repoassure` returned `No deployments found`.
- Current status: No accepted preview URL is active.

The blocker remains unresolved. Do not restore Vercel Git integration, do not use `repoassure.vercel.app`, and do not treat any production deployment URL as the private preview. The next retry should either fix the Vercel project/CLI target mismatch in the Vercel dashboard/API or switch to an equivalent access-controlled static host.

## Private Preview Hosting Fallback Decision

Decided on 2026-06-27:

- Source decision: [ADR-0021: Private Preview Hosting Fallback Decision](../adr/0021-private-preview-hosting-fallback.md)
- Interim review surface: Local static preview bundle remains the safe fallback while no remote private preview host is ready.
- Preferred remote fallback candidate: Cloudflare Pages preview deployments with Cloudflare Access, or an equivalent access-controlled static host.
- Required control: Cloudflare Pages preview deployments are public by default, so Cloudflare Access or equivalent access policy must be enabled before sharing any remote preview URL.
- Vercel boundary: Do not restore Vercel Git integration and do not retry the existing Vercel project until the target mismatch is fixed and verified.
- Non-authorization: This decision does not authorize public launch, production deployment, public custom domain binding, repository visibility changes, npm publication, GitHub release creation, SaaS/Team Cloud/Enterprise availability claims, hosted dashboard claims, or upload to a new hosting provider without explicit execution authorization.

The next execution goal should either produce a local static review package or deploy to an access-controlled remote preview host with smoke/content/screenshot/forbidden-claim/access-control/rollback evidence.

## Local Static Preview Package

Implemented on 2026-06-27:

- Handoff: [Local Static Preview Package v0.1](local-static-preview-package-v0.1.md)
- Commands: `pnpm build:website` and `pnpm package:website-preview`
- Output: `artifacts/public-website-preview/local-static-preview`
- Contents: static `dist/`, `manifest.json`, `forbidden-claims.json`, and `review-guide.md`.
- Boundary: No remote hosting provider is used, no preview URL is created, no production deployment is authorized, and this package does not authorize public launch.

This local package is the current review surface until a separate remote private preview execution goal is authorized and access control is verified.

## Cloudflare Access Remote Preview Preflight

Implemented on 2026-06-27:

- Handoff: [Cloudflare Access Remote Preview Preflight v0.1](cloudflare-access-preview-preflight-v0.1.md)
- Command: `pnpm preflight:cloudflare-preview`
- Output: `artifacts/public-website-preview/cloudflare-access-preflight`
- Required inputs: Cloudflare account ID, Pages project, Cloudflare Access policy, and explicit remote preview data-export authorization.
- Boundary: No website source or build output is uploaded by this preflight, no hosting provider is mutated, no preview URL is created, and no production deployment or public launch is authorized.

Cloudflare Pages preview deployments are public by default. Cloudflare Access policy must be enabled before any preview URL is shared.

## Cloudflare Pages + Access Private Preview Execution Blocked

Attempted on 2026-06-27:

- User authorization: explicit authorization was provided to create/use Cloudflare Pages, upload RepoAssure website build output, and protect reviewer access with Cloudflare Access.
- Pages project: `repoassure-preview`.
- Pages domain: `repoassure-preview.pages.dev`.
- Result: an empty Pages project was created, but Access configuration failed before deployment because the Access API returned `Authentication error`.
- Safety check: `wrangler pages deployment list --project-name repoassure-preview` returned no deployments.
- Current status: No deployment exists for `repoassure-preview`; no website source or build output was uploaded; no accepted preview URL is active.

Before any deploy, configure Cloudflare Access for `repoassure-preview.pages.dev` and verify unauthenticated requests are blocked.

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
