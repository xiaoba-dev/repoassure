# Private Preview Reviewer Handoff & Feedback Intake v0.1

Status: Ready for invited reviewer handoff
Date: 2026-06-27

## Purpose

This handoff gives an invited reviewer a bounded way to inspect the RepoAssure public website private preview and return actionable feedback.

This is not a public launch, product announcement, SaaS availability claim, or production marketing release.

## Review Surface

Accepted private preview URL:

```text
https://repoassure-preview.pages.dev
```

Access is for allowed reviewers only through the Cloudflare Access application `RepoAssure Private Preview` and policy `RepoAssure reviewer allow`.

Do not share deployment subdomains or branch aliases. The accepted review surface is only `https://repoassure-preview.pages.dev`.

## Reviewer Instructions

1. Open `https://repoassure-preview.pages.dev`.
2. Complete the Cloudflare Access email/OTP login flow with the invited reviewer email.
3. Review the website on desktop width.
4. Review the website on mobile width or a mobile device.
5. Submit feedback using the template below.

No OTP, cookie, Access token, or login query-state should be copied into feedback, screenshots, issues, commits, docs, or chat.

## Allowed Review Scope

Reviewers may inspect:

- Website positioning and clarity.
- Homepage structure and visual quality.
- Desktop and mobile responsiveness.
- Language selector behavior.
- Assurance Graph clarity.
- Trust Ledger preview clarity.
- Proof artifact section clarity.
- Trust boundary messaging.
- Private preview form clarity.

## Out of Scope

Reviewers should not treat the preview as evidence of:

- Public launch.
- Production availability.
- SaaS availability.
- Team Cloud availability.
- Enterprise availability.
- Hosted dashboard availability.
- Public repository visibility.
- npm package publication.
- GitHub release publication.
- Product artifact localization beyond the public website copy.

## Acceptance Questions

Use these questions to decide whether the private preview is ready for the next review step:

- Does the first viewport communicate RepoAssure clearly within a few seconds?
- Does the site feel appropriate for an enterprise security / assurance product?
- Are Assurance Graph and Trust Ledger understandable without extra explanation?
- Does the website avoid unsupported availability claims?
- Does mobile width preserve readability, navigation, language selection, and CTA access?
- Is the private preview access boundary clear enough for invited reviewers?
- Are any P0/P1 issues present that should block sharing with more reviewers?

## Feedback Template

```text
Reviewer:
Review date:
Device / viewport:
Browser:
Locale:

Overall decision:
- accepted
- changes_requested
- blocked

Summary:

Findings:
1. Severity: P0/P1/P2/P3
   Area:
   Observation:
   Expected:
   Evidence:
   Suggested action:

Unsupported claims spotted:

Mobile notes:

Security / access notes:

Next recommendation:
```

Severity guidance:

- P0: must stop preview sharing or exposes sensitive material.
- P1: must fix before expanding reviewer group.
- P2: should fix before public launch.
- P3: polish or backlog.

## Feedback Intake Workflow

1. Capture reviewer feedback in a tracked issue, discussion, or local review note.
2. Remove OTP, cookie, Access token, login query-state, and unrelated personal data before storing feedback.
3. Classify each finding as P0, P1, P2, or P3.
4. Convert P0/P1 findings into implementation tasks before expanding the reviewer group.
5. Convert P2/P3 findings into the website polish backlog unless they affect launch claims or trust boundary accuracy.
6. Update the public website handoff, acceptance checklist, testing strategy, and dev log when feedback changes release readiness.

## Rollback and Shutdown

If the private preview must be closed:

- Disable or delete the Cloudflare Access application `RepoAssure Private Preview`.
- Remove or disable the `RepoAssure reviewer allow` policy.
- Remove the Cloudflare Pages deployment or project if the preview should no longer be reachable.
- Re-run `pnpm verify:cloudflare-preview` to confirm unauthenticated access does not expose the website.
- Record shutdown evidence in `docs/logs/dev-log.md`.

## Non-Authorization Boundary

This handoff does not authorize:

- Sharing deployment subdomains or branch aliases.
- Public launch.
- Production marketing announcement.
- Public repository visibility change.
- npm publication.
- GitHub release creation.
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.
- Uploading source code, reviewer credentials, OTPs, cookies, Access tokens, or login query-state to any feedback channel.
