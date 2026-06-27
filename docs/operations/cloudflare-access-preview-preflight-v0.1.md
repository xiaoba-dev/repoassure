# Cloudflare Access Remote Preview Preflight v0.1

Status: Implemented
Date: 2026-06-27

## Purpose

Cloudflare Access Remote Preview Preflight v0.1 defines the minimum evidence required before any RepoAssure public website build is uploaded to Cloudflare Pages or an equivalent access-controlled static host.

This is a preflight gate only. No website source or build output is uploaded by this preflight.

## Command

```bash
pnpm preflight:cloudflare-preview
```

The command writes local evidence to:

- `artifacts/public-website-preview/cloudflare-access-preflight/preflight-report.json`
- `artifacts/public-website-preview/cloudflare-access-preflight/review-guide.md`

Generated evidence is ignored by Git and must be treated as local operational evidence.

## Required Inputs

The preflight checks for these environment variables without printing their values:

- `REPOASSURE_CLOUDFLARE_ACCOUNT_ID`
- `REPOASSURE_CLOUDFLARE_PAGES_PROJECT`
- `REPOASSURE_CLOUDFLARE_ACCESS_POLICY`
- `REPOASSURE_REMOTE_PREVIEW_DATA_EXPORT_AUTHORIZED=true`

The data-export flag must only be set after explicit authorization to upload RepoAssure website source and build output to a remote hosting provider.

## Access-Control Requirement

Cloudflare Pages preview deployments are public by default.

Cloudflare Access policy must be enabled before any preview URL is shared. A future remote execution goal must prove that unauthenticated requests are blocked and invited reviewers can authenticate before the URL is used for review.

## Remote Execution Result

Executed on 2026-06-27 after explicit authorization to upload the RepoAssure website build output to Cloudflare Pages:

- Cloudflare Pages project: `repoassure-preview`
- Protected review URL: `https://repoassure-preview.pages.dev`
- Cloudflare Access application: `RepoAssure Private Preview`
- Cloudflare Access policy: `RepoAssure reviewer allow`
- Allowed reviewer rule: `Emails` includes `web3coderman@gmail.com`
- Production deployment id: `997feaee-ef39-43c7-ab4d-2c99014df06d`
- Deployment source commit: `540f212`

Verification:

- `pnpm build:website`: passed.
- `pnpm verify:website`: passed against local `http://127.0.0.1:5174/`; screenshot evidence written to `/private/tmp/repoassure-website-qa`.
- `pnpm package:website-preview`: passed; forbidden availability claims failed count `0`.
- `pnpm preflight:cloudflare-preview`: passed with status `ready_for_manual_remote_execution`.
- `wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch preview`: passed.
- `curl -I https://repoassure-preview.pages.dev`: returned `302` to Cloudflare Access login and `www-authenticate: Cloudflare-Access`.

Do not share deployment subdomains such as `https://997feaee.repoassure-preview.pages.dev`, `https://b29e4023.repoassure-preview.pages.dev`, or branch aliases such as `https://main.repoassure-preview.pages.dev`; they returned public `200` responses during verification. The accepted private preview review surface is only `https://repoassure-preview.pages.dev`.

## Reviewer-Side Acceptance

Run the reviewer-side acceptance verifier after private preview deployment:

```bash
pnpm verify:cloudflare-preview
```

Optional negative-boundary check:

```bash
REPOASSURE_PRIVATE_PREVIEW_PUBLIC_URLS="https://997feaee.repoassure-preview.pages.dev,https://main.repoassure-preview.pages.dev" pnpm verify:cloudflare-preview
```

The verifier writes local evidence to:

- `artifacts/public-website-preview/cloudflare-access-acceptance/acceptance-report.json`
- `artifacts/public-website-preview/cloudflare-access-acceptance/review-guide.md`

The automated gate checks the unauthenticated redirect to Cloudflare Access, the `www-authenticate: Cloudflare-Access` protected-resource metadata, and the exclusion of deployment subdomains from the accepted review surface. Authenticated content smoke remains `manual_required` because the reviewer login uses an email/OTP identity flow that must not be bypassed or automated with stored credentials.

## Execution Boundary

This preflight does not:

- Upload website source or build output.
- Call Cloudflare APIs.
- Create a preview URL.
- Create or mutate a Cloudflare Pages project.
- Bind a public custom domain.
- Restore Vercel Git integration.
- Authorize public launch.
- Authorize production deployment.
- Authorize repository visibility changes, npm publication, GitHub release creation, or external announcements.
- Authorize SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

In short, this preflight does not authorize public launch and does not authorize production deployment.

## Future Remote Execution Evidence

A later Cloudflare Access remote preview execution goal must collect:

- Preview deployment status.
- Access policy verification before URL sharing.
- Unauthenticated-block evidence.
- Invited-reviewer authentication evidence.
- Smoke and content verification.
- Desktop and mobile screenshot evidence.
- Forbidden availability claim scan.
- Rollback or deletion evidence.

Until those artifacts exist, the accepted review surface remains the local static preview package.
