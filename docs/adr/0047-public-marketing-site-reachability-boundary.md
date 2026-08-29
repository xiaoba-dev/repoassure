# ADR-0047: Public marketing site reachability boundary

Status: Accepted
Date: 2026-07-19
Deciders: hardening-mcp maintainers
Amends: [ADR-0020](0020-public-website-private-preview-deployment.md), [ADR-0021](0021-private-preview-hosting-fallback.md)

## Context

[ADR-0020](0020-public-website-private-preview-deployment.md) and [ADR-0021](0021-private-preview-hosting-fallback.md) prohibit binding a public custom domain before the public launch gates are approved:

- ADR-0020: "Do not connect a public custom domain until public launch gates are approved."
- ADR-0021: "The remote preview must not bind a public custom domain."
- ADR-0021 lists "Public custom domain binding" under its Non-Authorization Boundary.

`repoassure.com` and `www.repoassure.com` are bound, serve HTTP/2 200 with no access challenge, and are marked `index,follow` with a sitemap. The public launch gates have not closed: branch protection remains deferred because GitHub returns HTTP 403 for repository rulesets on the current private-repository plan, and `pnpm release:check` reports `public release ready: no`.

The domain is owner-registered. Ownership was never the question — both prohibitions are about *when* a public custom domain may be bound relative to release gates, not about who holds the registration.

Two things have changed since those decisions were written.

**The claim guard now exists and is substantially stronger.** ADR-0020 and ADR-0021 were written when the only protection against a premature public surface was keeping the surface unreachable. The website now carries 25 forbidden-claim patterns enforced in CI against `apps/website/src/i18n.ts` and every serialized locale, plus a test asserting those patterns actually fire on the claims the site previously shipped and do not fire on the replacement copy. Reachability was a proxy control for a claims problem, and the claims problem now has a direct control.

**Leaving the conflict unresolved has its own cost.** Two Accepted ADRs have contradicted observable reality for weeks. The Project Intelligence Console exists to catch exactly this class of drift; leaving it standing teaches that architecture records are decorative.

## Decision

A public marketing website may be publicly reachable and search-indexable before the product's public launch gates close.

The boundary that matters is **what the site claims**, not **who can reach it**. Enforcement moves from reachability to content:

1. All user-visible website copy stays in `apps/website/src/i18n.ts` so the CI-enforced forbidden-claim patterns keep covering it.
2. The site must not claim availability of anything unshipped: SaaS, Team Cloud, Enterprise, hosted dashboard, SSO, RBAC, a published public repository, or a published package.
3. The site must not present customer logos, analyst badges, testimonials, star counts, case studies, or certifications. None are held.
4. The site must not describe artifacts as signed. Content hashing is implemented and verifiable; signing is not.
5. Private-preview framing stays invitation-only.

The custom-domain prohibitions in ADR-0020 and ADR-0021 are superseded. Everything else in both records remains in force, including the separation of merge, deployment, and public launch into independent gates, and the requirement that access control precede sharing any *private* preview URL.

## Non-Authorization Boundary

This decision covers the marketing website's reachability and nothing else. It does not authorize:

- Public launch or production marketing announcement
- Repository visibility change
- npm publication or GitHub release
- Deployment. Shipping code remains a separate gate from shipping pixels, and the site currently serves an older build than the working tree.
- SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims
- Customer contact, pricing changes, or spend
- Restoring Vercel Git integration, which ADR-0021 paused for an unrelated target-mismatch reason

The branch protection gate remains deferred and continues to block public release. [ADR-0012](0012-branch-protection-and-release-boundary.md)'s prohibition stands: do not make the repository public in order to unlock branch protection.

## Consequences

### Positive

- The governance record matches observable reality, so the freshness checks stay meaningful.
- The control is placed where the risk actually is. An unreachable site with false claims was always the worse outcome than a reachable site with true ones.
- The marketing site can do its job during private preview, which is the normal arrangement for a pre-launch product.

### Negative

- The site is publicly readable and indexable, so every copy change is live on deploy and mistakes are visible immediately. The claim guard is a CI check, not a human review, and it only catches the patterns it encodes.
- Removing the reachability control means a future overclaim reaches the public directly. The guard's coverage has to be extended whenever a new claim class appears — as it was for the integrity claim, which shipped publicly for weeks precisely because no pattern covered it.

### Follow-up

- Extend the forbidden-claim patterns whenever a new claim class appears, rather than treating the current 25 as complete.
- Reconcile the live deployment with the working tree under a separate deployment authorization; the site currently serves a pre-redesign build.

## Cascade Evidence

- Product intent: [docs/PRD.md](../PRD.md)
- Capability boundary: [docs/SPEC.md](../SPEC.md)
- Execution plan: [docs/PLAN.md](../PLAN.md)
- Amended: [ADR-0020](0020-public-website-private-preview-deployment.md), [ADR-0021](0021-private-preview-hosting-fallback.md)
- Release boundary retained: [ADR-0012](0012-branch-protection-and-release-boundary.md)
- Design and IA basis: [ADR-0046](0046-repoassure-design-system-v2-and-information-architecture.md)
- Claim guard: `tests/unit/public-website.test.ts`, `scripts/package-website-preview.mjs`
- Deployment record: [docs/operations/public-website-custom-domain-deployment-v0.1.md](../operations/public-website-custom-domain-deployment-v0.1.md)
