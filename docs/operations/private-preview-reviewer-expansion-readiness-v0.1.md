# Private Preview Reviewer Expansion Readiness v0.1

Status: Ready for maintainer review
Date: 2026-06-27

## Purpose

This checklist decides whether RepoAssure can safely invite a second reviewer batch to the private preview.

This is a readiness gate only. It does not add reviewers to Cloudflare Access, send invitations, change policy rules, publish the site, or authorize public launch.

## Current Review Surface

Accepted private preview URL:

```text
https://repoassure-preview.pages.dev
```

Accepted Access application:

```text
RepoAssure Private Preview
```

Accepted Access policy:

```text
RepoAssure reviewer allow
```

Do not add reviewers to Cloudflare Access from this checklist. Reviewer additions require a separate authorization and execution goal.

## Readiness Checklist

All items must be true before the reviewer group is expanded.

### Access Boundary Checklist

- [ ] Accepted URL is still `https://repoassure-preview.pages.dev`.
- [ ] Unauthenticated access still routes through Cloudflare Access.
- [ ] `pnpm verify:cloudflare-preview` passes its automated unauthenticated boundary checks.
- [ ] Deployment subdomains and branch aliases are not shared as review URLs.
- [ ] Current Access application is still `RepoAssure Private Preview`.
- [ ] Current Access policy is still `RepoAssure reviewer allow`.
- [ ] No OTP, cookie, Access token, login query-state, raw Access redirect URL, or reviewer credential is stored in docs, backlog items, screenshots, issues, commits, or chat.

### Feedback Operations Checklist

- [ ] Private preview reviewer handoff is current.
- [ ] Private preview feedback triage/backlog document is current.
- [ ] No open P0 findings.
- [ ] No open P1 findings.
- [ ] Any P2 findings are accepted as non-expansion-blocking or assigned to a follow-up goal.
- [ ] Feedback has been redacted before storage.
- [ ] The next-reviewer invitation message uses the approved review URL only.

### Content and UX Checklist

- [ ] Desktop authenticated smoke remains acceptable.
- [ ] Mobile-width authenticated smoke remains acceptable.
- [ ] Homepage first viewport communicates RepoAssure clearly.
- [ ] Assurance Graph is understandable enough for reviewer evaluation.
- [ ] Trust Ledger preview is understandable enough for reviewer evaluation.
- [ ] Language selector remains visible and usable.
- [ ] Private preview CTA and form remain understandable.
- [ ] Website copy does not claim SaaS, Team Cloud, Enterprise, hosted dashboard, public launch, npm publication, GitHub release, or public repository availability.

### Maintainer Decision Checklist

- [ ] Maintainer confirms the intended second reviewer group.
- [ ] Maintainer confirms allowed reviewer emails in a separate authorization.
- [ ] Maintainer confirms whether any P2/P3 backlog items should be fixed before expansion.
- [ ] Maintainer confirms whether screenshots or review notes can be shared with the second reviewer group.

## Expansion Decision

Use this decision after completing the checklist:

```text
Decision:
- ready_to_expand
- hold_for_fixes
- pause_private_preview

Reason:

Open blockers:

Authorized next action:
```

Decision rules:

- `ready_to_expand`: all Access, feedback, content/UX, and maintainer checklist items pass.
- `hold_for_fixes`: no P0/P1 exists, but P2/P3 or maintainer concerns should be resolved first.
- `pause_private_preview`: any P0 exists, Access boundary is uncertain, or unsupported launch/availability claims are present.

## Required Next Goal If Ready

If the decision is `ready_to_expand`, create a separate execution goal that:

- Takes explicit allowed reviewer email authorization.
- Updates Cloudflare Access policy only after authorization.
- Re-runs unauthenticated Access boundary verification.
- Documents the exact reviewer group and non-public-launch boundary.
- Does not share deployment subdomains or branch aliases.

## Non-Authorization Boundary

This readiness checklist does not authorize:

- Adding reviewers to Cloudflare Access.
- Sending reviewer invitations.
- Sharing deployment subdomains or branch aliases.
- Changing Cloudflare Pages or Access configuration.
- Publishing a public launch announcement.
- Making the repository public.
- Publishing npm packages.
- Creating a GitHub release.
- Claiming SaaS, Team Cloud, Enterprise, or hosted dashboard availability.
