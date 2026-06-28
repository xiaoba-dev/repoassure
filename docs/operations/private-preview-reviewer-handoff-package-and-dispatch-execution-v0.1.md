# Private Preview Reviewer Handoff Package and Dispatch Execution v0.1

Status: pending_channel_confirmation
Date: 2026-06-27

## Purpose

Private Preview Reviewer Handoff Package and Dispatch Execution v0.1 combines two stages:

1. Generate a reusable reviewer handoff package.
2. Prepare dispatch execution for privacy-preserving reviewer slots without claiming that external communication has happened.

This record is intentionally privacy-preserving. Reviewer PII is not stored in Git tracked docs.

## Reviewer Slots

Legacy reviewer slots:

- `confirmed-reviewer-1`
- `confirmed-reviewer-2`

Private Preview Reviewer Identity Correction v0.1 supersedes the earlier external reviewer interpretation. These slots now map to maintainer-owned access smoke test identities:

- `confirmed-reviewer-1` -> `maintainer-test-email-1`
- `confirmed-reviewer-2` -> `maintainer-test-email-2`

They are maintainer-owned access smoke test identities, not external reviewers.

## Stage 1: Handoff Package Generated

```text
Stage 1: Handoff package generated
```

The standard reviewer handoff package is ready to send.

Review URL:

```text
https://repoassure-preview.pages.dev
```

Subject:

```text
RepoAssure private preview review
```

Message body:

```text
Hi <reviewer>,

You have been added to the RepoAssure private preview allow list.

Review URL:
https://repoassure-preview.pages.dev

Please open the URL, complete the Cloudflare Access email/OTP login flow with your reviewer email, and review the website on desktop and mobile width.

Please focus on:
- Whether the first viewport explains RepoAssure clearly.
- Whether the site feels appropriate for an enterprise security / assurance product.
- Whether Assurance Graph and Trust Ledger are understandable.
- Whether mobile layout, language switching, and CTA access remain clear.
- Whether any unsupported availability claim appears.

Please do not include OTPs, cookies, Cloudflare Access tokens, login query-state, raw Access redirect URLs, credentials, or unrelated personal data in feedback.

Feedback template:
Reviewer:
Review date:
Device / viewport:
Browser:
Locale:
Overall decision: accepted / changes_requested / blocked
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

## Stage 2: Dispatch Execution Pending Channel Confirmation

```text
Stage 2: Dispatch execution pending channel confirmation
Dispatch status: pending_channel_confirmation
```

No outbound message was sent.

Dispatch is pending because the execution channel has not been confirmed in this goal. Acceptable future channels include maintainer-managed email, a private team communication channel, or another explicitly authorized delivery path.

Before any outbound dispatch, record:

- Dispatch channel.
- Reviewer slot: `confirmed-reviewer-1` or `confirmed-reviewer-2`.
- Dispatch timestamp.
- Dispatch operator.
- Whether the exact Stage 1 message body was used.
- Confirmation that reviewer PII is not stored in Git tracked docs.

## Dispatch Record Template

Use one record per reviewer slot after an explicit dispatch channel is confirmed:

```text
Reviewer slot:
Dispatch channel:
Sent at:
Sent by:
Message body version:
Delivery status:
- sent
- failed
- skipped
- pending_channel_confirmation

Sensitive material recorded:
- OTP: no
- Cookie: no
- Access token: no
- Login query-state: no
- Raw Access redirect URL: no
- Reviewer credential: no
- Unrelated personal data: no
```

## Current State

```text
Status: pending_channel_confirmation
```

The handoff package is ready as a reusable template, but dispatch execution is pending a channel confirmation and a non-maintainer reviewer identity. This record does not claim reviewer feedback was requested, sent, received, redacted, or triaged.

## Operating Boundaries

- Do not record real reviewer email addresses in Git tracked docs.
- Do not record OTP, cookie, Access token, login query-state, raw Access redirect URL, reviewer credentials, or unrelated personal data.
- Do not create external issues from this goal.
- Do not invent reviewer feedback.
- Do not treat maintainer-owned access smoke test identities as external reviewers.
- Do not claim a message was sent until a real dispatch channel and dispatch evidence exist.
- Do not share deployment subdomains or branch aliases.
- Do not authorize public launch, production marketing announcement, repository visibility changes, npm publication, GitHub release creation, SaaS availability claims, Team Cloud availability claims, Enterprise availability claims, or hosted dashboard availability claims.

## Next Action

Confirm the dispatch channel and non-maintainer external reviewer identities before executing outbound communication.

Use [Private Preview External Reviewer Recruitment and Dispatch Plan v0.1](private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md) before selecting external reviewer slots or sending any invitation.

Use [Private Preview External Reviewer Selection v0.1](private-preview-external-reviewer-selection-v0.1.md) for the first-batch anonymous slots, selected archetypes, manual maintainer email channel, and `Access update decision: required_before_dispatch`.

If the maintainer chooses manual sending, use the Stage 1 message body and record only privacy-preserving slot-level dispatch metadata.
