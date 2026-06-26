# ADR-0021: Private Preview Hosting Fallback Decision

Status: Accepted
Date: 2026-06-27

## Context

ADR-0020 separates private preview deployment, production deployment, and public launch into independent gates.

The Vercel execution attempt did not satisfy the private preview gate. Vercel CLI repeatedly produced `target production` deployments for the linked `repoassure` project, including default deploy, explicit `--target preview --skip-domain`, and a temporary non-main branch retry. Vercel Git integration also created a production deployment on `main` push before it was disconnected. All unintended Vercel deployments and aliases were removed.

The product still needs a private review surface for the public website, but continuing to retry the same Vercel project without a configuration fix risks creating accidental public production deployments.

## Decision

Adopt a two-step private preview hosting fallback.

1. Local static preview bundle remains the interim review surface.
2. Remote private preview fallback should use Cloudflare Pages preview deployments with Cloudflare Access, or an equivalent static host where access control is configured before the preview URL is shared.

Vercel remains paused for private preview execution until the project / CLI target mismatch is fixed and verified. Do not restore Vercel Git integration unless a future ADR or explicit operations decision changes the deployment boundary.

## Fallback Requirements

- Build output must continue to come from `pnpm build:website`.
- Remote hosting must use a preview environment, not a production deployment.
- Access control must be configured before sharing any remote preview URL.
- Enable access policy before sharing any remote preview URL.
- The remote preview must not bind a public custom domain.
- The remote preview must not imply public launch, production availability, SaaS availability, Team Cloud availability, Enterprise availability, or hosted dashboard availability.
- Preview URL, hosting account IDs, API tokens, access policies, screenshots, and verification evidence remain sensitive operational data.
- Rollback must be explicit: disable access, remove the preview deployment, or delete the project if needed.
- Vercel Git integration must remain disconnected while the current target mismatch is unresolved.

## Cloudflare Pages Notes

Cloudflare Pages preview deployments are public by default. They only satisfy this ADR when protected by Cloudflare Access or an equivalent access policy before the URL is shared.

The future deployment execution goal must verify:

- Preview deployment status is ready.
- Access policy blocks unauthenticated requests.
- Invited reviewers can authenticate.
- `RepoAssure` public website content renders correctly.
- Forbidden availability claims are absent.
- Desktop and mobile screenshots are captured.
- Rollback or deletion has been tested or documented.

## Vercel Re-Entry Conditions

Vercel can be reconsidered only after one of the following is true:

- Vercel dashboard or API configuration is corrected so CLI preview deployment inspect output shows a non-production preview target.
- A new Vercel project is created specifically for private preview and verified to avoid production aliases.
- Vercel deployment protection is confirmed before sharing any preview URL.

Any Vercel retry must keep Git integration disconnected until the preview target behavior is proven safe.

## Consequences

- The next execution goal should not keep retrying the existing Vercel project blindly.
- Local static review remains acceptable when no access-controlled remote host is ready.
- Cloudflare Pages with Cloudflare Access becomes the preferred remote fallback candidate.
- This decision may require Cloudflare credentials, a Cloudflare account, and explicit data-export authorization before remote execution.
- Deployment execution still requires smoke, content, screenshot, forbidden-claim, access-control, and rollback evidence.

## Non-Authorization Boundary

This ADR does not authorize:

- Public launch.
- Production deployment.
- Public custom domain binding.
- Repository visibility changes.
- npm publication.
- GitHub release creation.
- External announcement.
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.
- Restoring Vercel Git integration.
- Uploading website code or build output to a new hosting provider without explicit execution authorization.

In short, this ADR does not authorize public launch and does not authorize production deployment.
