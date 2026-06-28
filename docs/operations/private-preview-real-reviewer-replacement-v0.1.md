# Private Preview Real Reviewer Replacement v0.1

Status: superseded_by_identity_correction
Date: 2026-06-27

## Purpose

Private Preview Real Reviewer Replacement v0.1 records the authorized replacement of placeholder reviewer emails with privacy-preserving reviewer slots for the RepoAssure private preview.

This execution is now superseded by [Private Preview Reviewer Identity Correction v0.1](private-preview-reviewer-identity-correction-v0.1.md). The slots are maintainer-owned access smoke test identities, not external reviewers.

## Authorization

The maintainer provided two maintainer-owned test identities for Cloudflare Access/OTP smoke. Git-tracked documentation intentionally records only privacy-preserving reviewer slots:

- `confirmed-reviewer-1`
- `confirmed-reviewer-2`

Reviewer PII is not stored in Git tracked docs.

The maintainer confirmed the Cloudflare save action before the policy was saved.

## Replaced Placeholder Reviewers

The following placeholder reviewer emails were removed from the active Cloudflare Access allow list:

- `reviewer1@example.com`
- `reviewer2@example.com`

Execution result:

```text
removed placeholder reviewer emails
maintainer_test_identity_corrected
```

## Target

- Protected review URL: `https://repoassure-preview.pages.dev`
- Cloudflare Access application: `RepoAssure Private Preview`
- Cloudflare Access policy: `RepoAssure reviewer allow`
- Policy action: `Allow`
- Include rule type: `Emails`

## Execution

Cloudflare Dashboard UI was used because prior Access API attempts returned `Authentication error` for Access application and policy operations.

Execution path:

1. Opened the `RepoAssure reviewer allow` policy edit page.
2. Confirmed existing `confirmed-reviewer-1`.
3. Removed `reviewer1@example.com`.
4. Removed `reviewer2@example.com`.
5. Added `confirmed-reviewer-2`.
6. Saved the policy after explicit maintainer confirmation.
7. Reopened the policy details panel and confirmed the Include `Emails` value was `confirmed-reviewer-1 , confirmed-reviewer-2`.

Confirmed active maintainer-owned access smoke test slots:

- `confirmed-reviewer-1`
- `confirmed-reviewer-2`

## Verification

After the policy update, rerun the automated unauthenticated boundary verifier:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY -u all_proxy pnpm verify:cloudflare-preview
```

Expected result:

- Status: `manual_required`
- The protected review URL redirects unauthenticated users to Cloudflare Access.
- Authenticated reviewer smoke remains manual because Cloudflare Access email/OTP login must not be bypassed, scripted, or stored.

## Current State

```text
Status: maintainer_test_identity_corrected
```

Private Preview Reviewer Identity Correction v0.1 clarifies that the active slots are maintainer-owned access smoke test identities.

No outbound reviewer invitation was sent. No real external reviewer feedback has been received, stored, redacted, or triaged in this replacement record.

## Operating Boundaries

- Do not send reviewer invitations from this goal.
- Do not create external issues from this goal.
- Do not invent reviewer feedback.
- Do not record OTP, cookie, Access token, login query-state, raw Access redirect URL, reviewer credentials, or unrelated personal data.
- No OTP, cookie, Access token, login query-state, raw Access redirect URL, or reviewer credential material was recorded in Git-tracked documentation.
- Do not share deployment subdomains or branch aliases.
- Do not authorize public launch, production marketing announcement, repository visibility changes, npm publication, GitHub release creation, SaaS availability claims, Team Cloud availability claims, Enterprise availability claims, or hosted dashboard availability claims.

## Next Action

Reviewer handoff may proceed only through a separately authorized communication workflow or manual maintainer action after non-maintainer external reviewer identities are selected.

After real external reviewer feedback is received, redact sensitive login material before storing feedback and then run a separate `Private Preview Feedback Triage Execution v0.1` goal.
