# Public Website Custom Domain Deployment v0.1

Status: blocked_dns_cname_not_set
Date: 2026-06-30

## Purpose

This record captures the authorized attempt to bind the RepoAssure public website to the Cloudflare-managed custom domains `repoassure.com` and `www.repoassure.com`.

This operation is not a GitHub repository public release, npm publication, GitHub release, SaaS launch, Team Cloud launch, Enterprise launch, hosted dashboard availability claim, or production marketing announcement.

## Deployment Inputs

- Cloudflare account: `Web3coderman`
- Cloudflare zone: `repoassure.com`
- Cloudflare Pages project: `repoassure-preview`
- Pages default domain: `repoassure-preview.pages.dev`
- Build command: `pnpm build:website`
- Deploy command: `wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch main --commit-dirty=true --commit-message "RepoAssure custom domain deployment"`
- Latest deployment URL: `https://9dc5dd8b.repoassure-preview.pages.dev`
- Latest deployment alias: `https://main.repoassure-preview.pages.dev`
- Custom domains requested: `repoassure.com`, `www.repoassure.com`

## Completed Steps

- `pnpm build:website`: passed.
- `wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch main --commit-dirty=true --commit-message "RepoAssure custom domain deployment"`: passed.
- Pages custom domain API accepted both domain bindings:
  - `repoassure.com`
  - `www.repoassure.com`
- Cloudflare zone lookup confirmed `repoassure.com` exists and is active in the same account.

## Current External State

Cloudflare Pages custom domain status remains pending:

- `repoassure.com`: pending.
- `www.repoassure.com`: pending.
- Verification result: `CNAME record not set`.
- Validation method: HTTP.
- Certificate authority: Google.

Current DNS/API blocker:

- DNS API result: `Authentication error`.
- The current `CLOUDFLARE_API_TOKEN` can query Pages custom domains but cannot create or inspect DNS records for the zone.
- HTTPS verification is not complete for `https://repoassure.com` or `https://www.repoassure.com`.
- Forbidden availability claim verification remains pending for the custom domain because the domains do not yet serve the website.

## Required DNS Records

The remaining required DNS records are:

- Required DNS record: CNAME `@` -> `repoassure-preview.pages.dev`
- Required DNS record: CNAME `www` -> `repoassure-preview.pages.dev`

Both records should be proxied through Cloudflare unless a future operations decision changes the boundary.

## Verification Still Required

After DNS is configured and Pages custom domain status becomes active, the continuation must verify:

- `https://repoassure.com` returns the RepoAssure public website over HTTPS.
- `https://www.repoassure.com` returns or redirects to the accepted canonical website over HTTPS.
- The page renders the expected RepoAssure hero copy.
- English default and Simplified Chinese language switching still work.
- Desktop and mobile smoke checks pass.
- No forbidden SaaS, Team Cloud, Enterprise, hosted dashboard, public repository, npm publication, or GitHub release availability claims are present.

## Non-Authorization Boundary

- No repository visibility change was authorized.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public launch or production marketing announcement was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
- No external customer logo or case study use was authorized.

## Next Action

Add the required DNS CNAME records through Cloudflare Dashboard or with a Cloudflare API token that has DNS Edit permission, then rerun the custom domain verification.
