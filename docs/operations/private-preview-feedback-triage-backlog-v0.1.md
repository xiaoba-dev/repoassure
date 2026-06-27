# Private Preview Feedback Triage & Website Polish Backlog v0.1

Status: Ready for private preview feedback operations
Date: 2026-06-27

## Purpose

This document defines how RepoAssure private preview feedback is triaged, converted into backlog items, and used to decide whether to expand reviewer access, pause the private preview, or enter public launch preparation.

This is an internal operations gate. It does not send reviewer invitations, create external issues, widen Cloudflare Access policy, or authorize public launch.

## Inputs

Accepted inputs:

- Redacted intake records created from [Private Preview Reviewer Handoff Dispatch & Feedback Intake Readiness v0.1](private-preview-reviewer-handoff-dispatch-readiness-v0.1.md) after real reviewer feedback is received.
- Completed reviewer feedback using `private-preview-reviewer-handoff-v0.1.md`.
- Internal review notes from invited reviewers.
- Browser smoke observations from allowed reviewer sessions.
- Claim-boundary findings from website copy review.

Do not store OTP, cookie, Access token, login query-state, unrelated personal data, raw Cloudflare Access redirect URLs, or reviewer credentials in any backlog item.

## Severity Rules

### P0: Stop private preview sharing

Use P0 when a finding exposes sensitive material, breaks the Access boundary, leaks unsupported public availability claims, or makes the private preview materially misleading.

Required action:

- Pause sharing the private preview URL.
- Record the blocker in `docs/logs/blockers.md` or a tracked private issue.
- Fix before any additional reviewer receives the URL.
- Re-run relevant verification before resuming.

### P1: Fix before expanding reviewer group

Use P1 when a finding does not require immediate shutdown but would damage trust, confuse enterprise/security buyers, break core mobile access, or block reviewer comprehension of RepoAssure's value.

Required action:

- Convert to an implementation task.
- Fix before expanding the reviewer group.
- Re-run targeted website verification and structure tests.

### P2: Fix before public launch preparation

Use P2 for important quality, clarity, responsiveness, copy, accessibility, or information architecture issues that should not block the current invited reviewer group.

Required action:

- Add to the website polish backlog.
- Fix before entering public launch preparation.
- Batch related P2 fixes into focused website polish goals.

### P3: Polish backlog

Use P3 for minor visual refinements, wording improvements, nice-to-have reviewer suggestions, or non-blocking preference feedback.

Required action:

- Add to the website polish backlog.
- Address when bundled with nearby public website polish work.
- Do not block private preview expansion or public launch preparation unless repeated by multiple reviewers.

## Backlog Item Template

```text
ID:
Source:
Reviewer:
Date:
Severity: P0/P1/P2/P3
Area:
Finding:
Expected outcome:
Evidence:
Sensitive material removed: yes/no
Decision impact:
- pause_private_preview
- block_reviewer_expansion
- block_public_launch_preparation
- polish_backlog
Owner:
Target goal:
Verification:
Status:
- new
- accepted
- in_progress
- fixed
- deferred
- rejected
```

## Triage Workflow

1. Copy reviewer feedback into a private tracked note or issue.
2. Remove OTP, cookie, Access token, login query-state, raw Access redirect URLs, and unrelated personal data.
3. Assign severity using the rules above.
4. Convert each accepted finding into a backlog item.
5. Group related items by website area: hero, Assurance Graph, Trust Ledger, localization, mobile, accessibility, trust boundary, private preview form, footer, or claims.
6. Select the next Codex goal based on the highest-severity unresolved item.
7. Update `docs/logs/dev-log.md`, acceptance checklist, and public website handoff when triage changes release readiness.

Do not run a triage execution goal until real reviewer feedback exists. The readiness state remains `waiting_for_reviewer_feedback` when no reviewer response has been received.

## Decision Gates

### Expand Private Preview

The reviewer group may be expanded only when:

- No open P0 findings exist.
- No open P1 findings exist.
- Current `https://repoassure-preview.pages.dev` access boundary remains valid.
- Latest private preview smoke remains acceptable for desktop and mobile.
- Feedback storage contains no OTP, cookie, Access token, login query-state, raw Access redirect URL, or reviewer credential.

Use [Private Preview Reviewer Expansion Readiness v0.1](private-preview-reviewer-expansion-readiness-v0.1.md) before any second-batch reviewer invitation. That checklist records Access boundary, feedback operations, content/UX, and maintainer decision criteria. It does not add reviewers to Cloudflare Access.

### Pause Private Preview

Pause private preview sharing when:

- Any P0 finding is accepted.
- Cloudflare Access boundary is bypassed or uncertain.
- The accepted review URL no longer routes through the intended Access application.
- Website copy makes unsupported SaaS, Team Cloud, Enterprise, hosted dashboard, public launch, npm publication, GitHub release, or public repository claims.
- Reviewer feedback contains sensitive material that cannot be safely redacted.

### Enter Public Launch Preparation

Public launch preparation may start only when:

- No open P0/P1 findings exist.
- P2 findings are either fixed or explicitly accepted as non-launch-blocking.
- The private preview handoff and feedback triage records are current.
- Public release legal, trademark, repository visibility, package publication, and announcement gates remain separately authorized.
- Launch copy still avoids unsupported SaaS, Team Cloud, Enterprise, hosted dashboard, or availability claims.

## Website Polish Backlog Policy

Website polish backlog items should remain local and private until the repository/public release boundary changes.

Backlog items may target:

- Homepage clarity.
- Security-grade visual polish.
- Mobile density.
- Assurance Graph comprehension.
- Trust Ledger comprehension.
- Localization copy.
- Accessibility and focus states.
- Claim-boundary wording.
- Private preview form clarity.

Backlog items must not include:

- Reviewer credentials.
- OTPs.
- Cookies.
- Cloudflare Access tokens.
- Login query-state.
- Raw Cloudflare Access redirect URLs.
- Unrelated personal data.

## Non-Authorization Boundary

This triage and backlog gate does not authorize:

- Sending new reviewer invitations.
- Adding reviewers to Cloudflare Access.
- Sharing deployment subdomains or branch aliases.
- Making the repository public.
- Publishing npm packages.
- Creating a GitHub release.
- Public launch.
- Production marketing announcement.
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.
