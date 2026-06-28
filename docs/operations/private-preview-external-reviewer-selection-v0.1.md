# Private Preview External Reviewer Selection v0.1

Status: ready_for_access_update_decision
Date: 2026-06-28

## Purpose

Private Preview External Reviewer Selection v0.1 selects the first privacy-preserving external reviewer slots for RepoAssure private preview.

This record selects reviewer archetypes and operational gates only. It does not record real reviewer email addresses, send invitations, add Cloudflare Access reviewers, create external issues, or invent reviewer feedback.

## Selected Reviewer Slots

Selected external reviewer slots:

```text
external-reviewer-1
external-reviewer-2
```

Minimum reviewer count is satisfied at the slot level, pending real reviewer identity confirmation outside Git tracked docs.

## Slot Criteria

### external-reviewer-1

Archetype:

```text
developer builder
```

Required criteria:

- not maintainer-owned.
- Uses or evaluates AI coding tools.
- Can judge whether RepoAssure's delivery-assurance positioning is understandable.
- Can review desktop and mobile private preview surfaces.

### external-reviewer-2

Archetype:

```text
engineering lead
```

Required criteria:

- not maintainer-owned.
- Owns or influences delivery quality, release readiness, or engineering process decisions.
- Can judge whether RepoAssure evidence artifacts are credible for team adoption.
- Can review trust boundary and unsupported availability claims.

Optional third slot for later:

```text
external-reviewer-3 -> security-minded reviewer
```

Do not count maintainer-owned access smoke test identities toward these slots.

## Dispatch Channel Selection

Selected first-batch dispatch channel:

```text
manual maintainer email
```

Reason:

- Reviewer count is small.
- The maintainer can control exact recipients without storing real emails in Git.
- It avoids introducing Resend API keys, verified-domain setup, third-party email logs, unsubscribe handling, and additional data-processing boundaries before repeatable reviewer operations exist.

Resend remains deferred until a separate Resend channel decision is created.

## Access Update Decision

```text
Access update decision: required_before_dispatch
```

Rationale:

- The current allowed identities are maintainer-owned access smoke test identities.
- External reviewers need their own allowed identities before they can complete the Cloudflare Access email/OTP flow.
- This selection record intentionally does not add reviewers to Cloudflare Access.

Required next gate:

```text
Private Preview External Reviewer Access Update v0.1
```

That future goal must update Cloudflare Access only after the maintainer provides the real external reviewer emails through a non-Git channel and explicitly authorizes the Access policy change.

## Dispatch Readiness

The selected slots are not yet ready to receive invitations.

Before dispatch:

1. Confirm real identities for `external-reviewer-1` and `external-reviewer-2` outside Git tracked docs.
2. Update Cloudflare Access allow list through a separate authorized goal.
3. Re-run `pnpm verify:cloudflare-preview`.
4. Confirm the manual maintainer email channel.
5. Send only after Access is ready.

No invitation was sent.

No Cloudflare Access reviewer was added.

## Privacy Boundary

- Do not record real reviewer email addresses in Git tracked docs.
- Do not record OTP, cookie, Access token, login query-state, raw Access redirect URL, reviewer credentials, or unrelated personal data.
- Do not create external issues from this goal.
- Do not invent reviewer feedback.
- Do not treat maintainer-owned access smoke test identities as external reviewers.
- Do not share deployment subdomains or branch aliases.
- Do not authorize public launch, production marketing announcement, repository visibility changes, npm publication, GitHub release creation, SaaS availability claims, Team Cloud availability claims, Enterprise availability claims, or hosted dashboard availability claims.

## Next Action

Private Preview External Reviewer Access Update v0.1 completed the Cloudflare Access allow-list update for `external-reviewer-1` and `external-reviewer-2` through the Cloudflare Dashboard UI.

Current state:

```text
waiting_for_external_reviewer_dispatch
```

Run `Private Preview External Reviewer Manual Dispatch v0.1` when the maintainer is ready to send the approved handoff package through manual maintainer email. Continue to record only slot-level metadata in Git tracked docs.
