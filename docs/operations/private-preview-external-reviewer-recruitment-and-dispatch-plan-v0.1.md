# Private Preview External Reviewer Recruitment and Dispatch Plan v0.1

Status: ready_for_external_reviewer_selection
Date: 2026-06-28

## Purpose

Private Preview External Reviewer Recruitment and Dispatch Plan v0.1 defines who qualifies as a real external reviewer and how RepoAssure should invite them into the private preview.

This plan does not send invitations, add reviewers to Cloudflare Access, create external issues, or record real reviewer email addresses in Git tracked docs.

## External Reviewer Definition

An external reviewer must be:

- not maintainer-owned.
- Not a maintainer test mailbox.
- Able to review RepoAssure from the perspective of a real prospective user, buyer, or technical evaluator.
- Able to access the private preview through their own email identity.
- Willing to provide feedback that can be stored after sensitive material is removed.

The following do not qualify as external reviewers:

- `maintainer-test-email-1`
- `maintainer-test-email-2`
- `maintainer-authenticated-smoke-identity`
- `reviewer1@example.com`
- `reviewer2@example.com`
- Any placeholder identity.
- Any mailbox owned or controlled only by the maintainer for smoke testing.

## Minimum Reviewer Mix

Target minimum reviewer count: 2

Recommended reviewer mix:

1. developer builder
   - Understands AI-generated repos, AI IDE usage, and shipping friction.
   - Reviews whether RepoAssure's promise is clear and credible.

2. engineering lead
   - Understands delivery risk, acceptance evidence, and team adoption.
   - Reviews whether RepoAssure looks useful for real project readiness.

3. security-minded reviewer
   - Optional but preferred for early private preview.
   - Reviews trust boundary, local-first claims, Access flow, and unsupported availability claims.

For the first external batch, pick at least two people across these archetypes. Do not count maintainer-owned access smoke test identities toward the minimum reviewer count.

## Dispatch Channel Options

Allowed future dispatch channels:

- manual maintainer email.
- Private maintainer-managed chat or community DM.
- Resend, only after a separate Resend channel decision records API key handling, verified domain, sender address, data sharing, and unsubscribe/compliance boundaries.

Current recommended channel:

```text
manual maintainer email
```

Manual maintainer email is preferred for the first external batch because the reviewer count is small and avoids introducing a third-party email API before there is repeatable reviewer operations volume.

## Planned Dispatch Records

Use one privacy-preserving slot per selected external reviewer:

```text
external-reviewer-1
external-reviewer-2
external-reviewer-3
```

Record only:

- Reviewer slot.
- Reviewer archetype.
- Dispatch channel.
- Dispatch status.
- Sent timestamp after sending.
- Message template version.
- Feedback status.

Do not record:

- Real reviewer email address.
- OTP.
- Cookie.
- Access token.
- Login query-state.
- Raw Access redirect URL.
- Reviewer credentials.
- Unrelated personal data.

## Dispatch Gate

Before any invitation is sent:

1. Select at least two non-maintainer external reviewers.
2. Confirm the dispatch channel.
3. Confirm whether the reviewer emails are already allowed by Cloudflare Access.
4. If Access allow-list changes are needed, run a separate authorized Access update goal.
5. Use the existing private preview handoff message template.
6. Record only slot-level metadata in Git tracked docs.

No invitation was sent from this plan.

## Feedback Intake Gate

Do not start `Private Preview Feedback Triage Execution v0.1` until:

1. At least one external reviewer receives the invitation.
2. The reviewer completes or attempts the Cloudflare Access flow.
3. Feedback is returned.
4. OTP, cookie, Access token, login query-state, raw Access redirect URL, reviewer credentials, and unrelated personal data are removed.

After Private Preview External Reviewer Access Update v0.1, the current state is:

```text
waiting_for_reviewer_feedback
```

The first two external reviewer slots have Access allow-list coverage. Private Preview External Reviewer Manual Dispatch v0.1 sent the approved handoff package through manual maintainer email using slot-level records only.

## Non-Authorization Boundary

- Invitation was sent through manual maintainer email in Private Preview External Reviewer Manual Dispatch v0.1.
- Do not add reviewers to Cloudflare Access from this goal.
- Do not record real reviewer email addresses in Git tracked docs.
- Do not create external issues from this goal.
- Do not invent reviewer feedback.
- Do not treat maintainer-owned access smoke test identities as external reviewers.
- Do not treat maintainer-owned smoke results as external reviewer feedback.
- Do not share deployment subdomains or branch aliases.
- Do not authorize public launch, production marketing announcement, repository visibility changes, npm publication, GitHub release creation, SaaS availability claims, Team Cloud availability claims, Enterprise availability claims, or hosted dashboard availability claims.

## Next Action

Private Preview External Reviewer Selection v0.1 has selected `external-reviewer-1` and `external-reviewer-2` as first-batch slots and records `Access update decision: required_before_dispatch`.

Private Preview External Reviewer Access Update v0.1 completed the required Cloudflare Access allow-list update without recording real reviewer email addresses in Git tracked docs.

Private Preview External Reviewer Manual Dispatch v0.1 completed manual maintainer email dispatch without recording real reviewer email addresses in Git tracked docs.

Run `Private Preview External Reviewer Feedback Intake v0.1` next only after real reviewer feedback exists.
