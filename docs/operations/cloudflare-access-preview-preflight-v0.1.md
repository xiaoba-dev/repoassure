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
