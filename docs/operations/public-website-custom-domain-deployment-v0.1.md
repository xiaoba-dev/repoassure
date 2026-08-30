# Public Website Custom Domain Deployment v0.1

Status: verified_custom_domain_active
Date: 2026-06-30
Verified: 2026-07-01

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
- Cloudflare DNS now contains proxied CNAME records for both custom domains:
  - CNAME `@` -> `repoassure-preview.pages.dev`
  - CNAME `www` -> `repoassure-preview.pages.dev`
- Cloudflare Pages custom domain verification is active for both custom domains.
- HTTPS verification passed for both custom domains.
- Desktop, mobile, English, and Simplified Chinese browser smoke verification passed for both custom domains.
- Forbidden availability claim verification passed for the custom domain surface.

## Current External State

Cloudflare Pages custom domain status is active:

- `repoassure.com`: active.
- `www.repoassure.com`: active.
- Verification result: `active`.
- Validation method: HTTP.
- Certificate authority: Google.

Current DNS state:

- `repoassure.com` resolves through Cloudflare to `28.0.0.56`.
- `www.repoassure.com` resolves through Cloudflare to `28.0.0.57`.
- `https://repoassure.com`: HTTP/2 200 over HTTPS.
- `https://www.repoassure.com`: HTTP/2 200 over HTTPS.
- Redirect policy verification: both custom domains currently serve the accepted website directly with HTTP/2 200; no apex/www canonical redirect is configured in this increment.

Historical DNS/API blocker:

- Before manual DNS completion, Pages verification returned `CNAME record not set`.
- Before manual DNS completion, the available API token returned DNS API result `Authentication error`.
- The blocker is resolved by Cloudflare Dashboard DNS records, not by expanding stored API credentials.

## Required DNS Records

The verified DNS records are:

- Required DNS record: CNAME `@` -> `repoassure-preview.pages.dev`
- Required DNS record: CNAME `www` -> `repoassure-preview.pages.dev`

Both records are proxied through Cloudflare.

## Verification Evidence

- Cloudflare Pages custom domains API returned `active` for `repoassure.com` and `www.repoassure.com`.
- `curl -I -L --max-time 30 https://repoassure.com`: HTTP/2 200.
- `curl -I -L --max-time 30 https://www.repoassure.com`: HTTP/2 200.
- Redirect policy verification confirmed direct serving for both custom domains, with no unexpected redirect chain.
- `REPOASSURE_WEBSITE_URL=https://repoassure.com REPOASSURE_WEBSITE_QA_DIR=/private/tmp/repoassure-custom-domain-qa pnpm verify:website`: passed.
- `REPOASSURE_WEBSITE_URL=https://www.repoassure.com REPOASSURE_WEBSITE_QA_DIR=/private/tmp/repoassure-custom-domain-www-qa pnpm verify:website`: passed.
- Verified English hero: `Assure every AI-generated repo before it ships`.
- Verified Simplified Chinese hero: `在交付前保障每个 AI 生成仓库`.
- Verified Trust Ledger preview, Assurance Graph, artifact tabs, private preview form, desktop layout, mobile layout, and mobile navigation.
- Forbidden availability claim verification passed: the custom domain surface does not claim SaaS, Team Cloud, Enterprise, hosted dashboard, public repository, npm publication, GitHub release, public launch, or production marketing availability.

## Non-Authorization Boundary

- No repository visibility change was authorized.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public launch or production marketing announcement was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
- No external customer logo or case study use was authorized.

## Next Action

Keep monitoring custom domain availability and continue public release gates separately. This verified custom domain deployment does not close legal, trademark, branch protection / equivalent ruleset, final maintainer publication authorization, npm publication, GitHub release, SaaS, Team Cloud, Enterprise, hosted dashboard, or public launch gates.

## 2026-08-30 - production branch correction, and the redesign deployment

The `wrangler pages deploy` command documented above used `--branch main`, and that matched the working tree's default branch at the time. It does not match the Cloudflare Pages project's actual production branch. `wrangler pages deployment list --project-name repoassure-preview` shows every deployment with `--branch preview` reported as `Environment: Production`, and every deployment with `--branch main` reported as `Environment: Preview` — the reverse of what the branch names suggest. Deploying with `--branch main`, as this record's own command does, produces an unlisted `*.repoassure-preview.pages.dev` preview deployment and leaves the custom domain untouched. The corrected command:

```
wrangler pages deploy apps/website/dist --project-name repoassure-preview --branch preview --commit-dirty=true --commit-message "<what changed>"
```

This same day, that corrected command shipped the design-system-v2 redesign to `repoassure.com`, replacing the pre-redesign build this record originally verified (hero: "Assure every AI-generated repo before it ships"; a false "signed" claim on stored artifacts; a stale "38 actions" repair-plan count). Deployment id `24706cf2-b181-46a5-a207-df632cc19b8c`, `Environment: Production`, `Branch: preview`.

Verified against the live domain after deploy, not against a local build:

- `wrangler pages deployment list --project-name repoassure-preview` lists the new deployment as `Production` / `preview`.
- Fetching `https://repoassure.com` returns the redesigned hero ("Is this AI-generated repo ready to ship?"), the "Content-hashed" badge, and no occurrence of "signed".
- `REPOASSURE_WEBSITE_URL=https://repoassure.com pnpm verify:website` exits `0` against the live domain: `robots: index,follow` intact, both locale headings present, zero horizontal overflow, all metadata URLs resolve.

This closes the reconciliation ADR-0047 called for in its own Follow-up section ("the site currently serves a pre-redesign build") and corrects this record's deploy command for whoever runs it next. It does not authorize npm publication, GitHub release, public launch, customer contact, or commercial/hosted availability claims — the Non-Authorization Boundary above still applies in full.
