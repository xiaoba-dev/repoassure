# Public Release Post-Merge Hygiene v0.1

Status: hygiene_verified

Date: 2026-07-01

Repository: `xiaoba-dev/repoassure`

## Scope

This record verifies the post-merge public release hygiene state after Public Source Release Execution v0.1, native branch protection, Solo Maintainer Branch Protection Adjustment v0.1, protected PR workflow closure, and PR #4 merge.

This record is a hygiene and boundary verification packet. It does not authorize npm publication, GitHub release creation, public launch, production marketing announcement, or commercial availability claims.

## Repository state

Repository visibility: `PUBLIC`

Default branch: `main`

Branch protection profile: `solo_maintainer`

Required status check: `Quality Gates`

Main CI run: `28511247860`

| Check | Result |
| --- | --- |
| Repository visibility | `PUBLIC` |
| Default branch | `main` |
| Branch protection profile | `solo_maintainer` |
| Required status check | `Quality Gates` |
| Strict status checks | `true` |
| Admin enforcement | `true` |
| Conversation resolution | `true` |
| Linear history | `true` |
| Force pushes | disabled |
| Branch deletion | disabled |
| Required approving reviews | disabled for solo maintainer mode |

Evidence:

- `gh repo view xiaoba-dev/repoassure --json nameWithOwner,visibility,isPrivate,defaultBranchRef,url`
- `gh api repos/xiaoba-dev/repoassure/branches/main/protection`
- Main CI run: `28511247860`
- Main head after PR #4: `477cca98160bf47d407baa180154bb6c368ace8f`

## Publication boundary

Package publication boundary: `package.json` keeps `private: true`

| Boundary | Result |
| --- | --- |
| npm registry package `hardening-mcp` | not found |
| Remote git tags | none found |
| GitHub releases | none found |
| npm publication | not executed |
| GitHub release | not executed |
| Public launch | not executed |
| Production marketing announcement | not executed |
| SaaS / Team Cloud / Enterprise availability claim | not executed |
| Hosted dashboard availability claim | not executed |

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.

## Website and domain hygiene

Website custom domains: `repoassure.com`, `www.repoassure.com`

Verified state:

- `https://repoassure.com` returned HTTPS 200.
- `https://www.repoassure.com` returned HTTPS 200.
- `REPOASSURE_WEBSITE_URL=https://repoassure.com pnpm verify:website` passed.
- `REPOASSURE_WEBSITE_URL=https://www.repoassure.com pnpm verify:website` passed.
- Website verification covered English default content, Simplified Chinese locale switching, desktop/mobile smoke, Trust Ledger, Assurance Graph, artifact tabs, private preview form, forbidden-claim boundary, canonical URL, robots meta, sitemap, web manifest, favicon, Open Graph metadata, and Twitter metadata.

The website being reachable on custom domains does not equal public launch authorization.

## Sensitive material and artifact hygiene

Secret/customer data exposure scan: passed

Verified state:

- Real reviewer emails and maintainer-owned account identifiers were not present in tracked public docs, tests, scripts, package metadata, README, or website source.
- Broad sensitive-token matches were limited to test fixtures that intentionally validate redaction behavior.
- `pnpm repo:hygiene` passed and continued to block generated artifacts, build outputs, local hardening runs, env files, private keys, and local logs from tracked commits.
- `pnpm release:check` passed and reported public release readiness materials are complete.

## Quality gates executed

| Command | Result |
| --- | --- |
| `pnpm release:check` | passed |
| `pnpm repo:hygiene` | passed |
| `REPOASSURE_WEBSITE_URL=https://repoassure.com pnpm verify:website` | passed |
| `REPOASSURE_WEBSITE_URL=https://www.repoassure.com pnpm verify:website` | passed |

Additional local structure and regression tests for this record are executed in the protected PR workflow.

## Maintainer boundary

This record confirms that the public repository, protected PR workflow, package boundary, website custom domains, and sensitive-material hygiene have been verified after the latest protected merge.

It does not authorize:

- npm publication.
- GitHub release creation.
- Public launch.
- Production marketing announcement.
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.
- External customer logo, case study, or production customer claim.

## Recommended next step

The next decision should be a separate Public Launch Boundary Decision goal: decide whether RepoAssure should remain in source-public / website-live mode, or move toward a controlled public announcement package with explicit release notes, launch copy, support boundaries, and maintainer approval.
