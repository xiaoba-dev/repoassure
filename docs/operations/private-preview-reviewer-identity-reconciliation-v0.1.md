# Private Preview Reviewer Identity Reconciliation v0.1

Status: maintainer_test_identity_corrected
Date: 2026-06-27

## Purpose

Private Preview Reviewer Identity Reconciliation v0.1 clarifies who is acting as maintainer, who has already performed authenticated reviewer smoke, and which second-batch reviewer emails are placeholders.

This reconciliation prevents placeholder email addresses and maintainer-owned test identities from being mistaken for external reviewer identities or external reviewer feedback.

## Role Map

### Maintainer / user

The maintainer / user owns product decisions, authorization, reviewer selection, and acceptance of follow-up goals.

The maintainer may also perform reviewer smoke checks, but maintainer review and external reviewer feedback are separate evidence classes.

### Authenticated reviewer identity

`maintainer-authenticated-smoke-identity` is the authenticated reviewer identity path already used for Cloudflare Access browser smoke.

This identity proves that the private preview can be reached through the accepted Access policy and renders for an allowed identity. It does not automatically represent external reviewer feedback.

### Maintainer-owned access smoke test identities

Private Preview Reviewer Identity Correction v0.1 supersedes the previous interpretation of `confirmed-reviewer-1` and `confirmed-reviewer-2`.

Correct current meaning:

- `confirmed-reviewer-1` maps to `maintainer-test-email-1`.
- `confirmed-reviewer-2` maps to `maintainer-test-email-2`.

These are maintainer-owned access smoke test identities, not external reviewers.

### Placeholder second-batch reviewer emails

The following emails are placeholder only:

- `reviewer1@example.com`
- `reviewer2@example.com`

They must be replaced with non-maintainer reviewer emails before the project treats second-batch reviewer feedback as external feedback.

Do not treat placeholder emails as real reviewer feedback.

## Current State

```text
Status: maintainer_test_identity_corrected
```

Historical status before Private Preview Real Reviewer Replacement:

```text
waiting_for_real_reviewer_identity
```

Private Preview Real Reviewer Replacement v0.1 completed after the maintainer provided email identities and explicitly confirmed the Cloudflare Access policy save.

Corrected maintainer-owned test identities:

- `maintainer-test-email-1`
- `maintainer-test-email-2`

Execution result:

```text
maintainer_test_identity_corrected
```

The placeholder reviewer emails `reviewer1@example.com` and `reviewer2@example.com` have been removed from the active Cloudflare Access allow list and replaced by maintainer-owned access smoke test identities.

No real external reviewer feedback has been received, stored, redacted, or triaged in this reconciliation record.

## Operating Rules

- Keep maintainer/user decisions separate from external reviewer feedback.
- Keep authenticated smoke evidence separate from reviewer feedback.
- Treat `reviewer1@example.com` and `reviewer2@example.com` as historical placeholders only; they are no longer active reviewer identities after Private Preview Real Reviewer Replacement.
- Treat `confirmed-reviewer-1` and `confirmed-reviewer-2` as legacy slot names that now map to maintainer-owned access smoke test identities.
- Do not treat maintainer-owned test identities as external reviewers.
- Do not run `Private Preview Feedback Triage Execution v0.1` until real reviewer feedback exists.
- Do not send handoff messages from this reconciliation goal.
- Do not create external issues from this reconciliation goal.
- Do not invent reviewer feedback.
- No Cloudflare Access policy change is authorized by this reconciliation.
- No OTP, cookie, Access token, login query-state, raw Access redirect URL, reviewer credentials, or unrelated personal data may be recorded.

## Required Next Action Before External Feedback Triage

Before any external feedback triage goal:

1. Non-maintainer external reviewers are recruited or identified.
2. Reviewer handoff is sent manually or through an explicitly authorized communication workflow.
3. Real external reviewer feedback is received.
4. Feedback is redacted before storage.
5. Only then can findings be classified using `Private Preview Feedback Triage & Website Polish Backlog v0.1`.

## Non-Authorization Boundary

This reconciliation does not authorize:

- Changing Cloudflare Access policy.
- Adding, removing, or replacing reviewer emails.
- Sending reviewer invitations.
- Creating external issues.
- Inventing or simulating reviewer feedback.
- Treating placeholder emails as accepted external reviewer identities.
- Treating maintainer-owned test identities as accepted external reviewer identities.
- Public launch.
- Production marketing announcement.
- Repository visibility changes.
- npm publication.
- GitHub release creation.
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.
