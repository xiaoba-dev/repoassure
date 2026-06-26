# Local Static Preview Package v0.1

Status: Implemented
Date: 2026-06-27

## Purpose

Local Static Preview Package v0.1 provides a reviewable public website package without remote hosting.

This is the immediate fallback after ADR-0021. It lets maintainers inspect the current public website build locally while the Vercel preview target mismatch remains unresolved and before any Cloudflare Pages + Access execution goal is authorized.

## Commands

```bash
pnpm build:website
pnpm package:website-preview
```

## Output

The package is generated under:

```text
artifacts/public-website-preview/local-static-preview
```

Expected files:

- `dist/`: static website build output copied from `apps/website/dist`.
- `manifest.json`: file hashes, package metadata, source commands, and review boundary.
- `forbidden-claims.json`: static forbidden-claim scan results.
- `review-guide.md`: local review instructions and non-authorization boundary.

The output directory is intentionally ignored by git through `.gitignore`.

## Review Scope

Reviewers can inspect:

- Website HTML, CSS, JS, and assets from the built `dist/` directory.
- Local rendering by opening `dist/index.html` or serving `dist/` with a local-only static server.
- Forbidden-claim scan results for release-boundary terms.
- Manifest hashes for copied build files.

## Boundary

No remote hosting provider is used.

This package does not authorize public launch and does not authorize production deployment. It also does not authorize:

- Cloudflare upload.
- Vercel deployment.
- Restoring Vercel Git integration.
- Public custom domain binding.
- Repository visibility changes.
- npm publication.
- GitHub release creation.
- External announcement.
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

## Next Step

After local review, the next execution goal may either:

1. Keep using local static review only.
2. Execute Cloudflare Pages preview deployments with Cloudflare Access, with explicit data-export authorization and access-control verification.
3. Re-enter Vercel only after the target mismatch is fixed and verified.
