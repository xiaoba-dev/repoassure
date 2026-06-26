# ADR-0020: Public Website Private Preview Deployment Boundary

Status: Accepted
Date: 2026-06-26

## Context

RepoAssure public website code has been merged into `main`, but merge does not equal deployment, public release, repository publication, npm publication, or external launch.

The next product decision is how to expose the website safely for private review without creating accidental public availability claims.

## Decision

Private preview deployment is a separate execution gate.

RepoAssure will distinguish three gates:

1. Private preview deployment: a restricted preview URL for maintainers and invited reviewers.
2. Production deployment: a production hosting target that may exist before public launch, but remains access-controlled until release gates pass.
3. Public launch: external announcement, public traffic, public repository visibility changes, package publication, or public availability claims.

This ADR approves planning only. It does not authorize production deployment, does not authorize public launch, and does not authorize making the repository public.

Any deployment execution requires a separate Codex goal with explicit authorization, environment selection, rollback plan, access-control plan, and post-deployment verification.

## Deployment Principles

- Use private preview first.
- Keep repository visibility private unless a separate public-release authorization changes it.
- Prefer access-controlled hosting for private preview.
- Do not connect a public custom domain until public launch gates are approved.
- Do not publish customer logos, case studies, real target repo evidence, private screenshots, hardening run artifacts, local paths, env values, or secrets.
- Keep website copy aligned with private-preview, local-first, and roadmap boundaries.
- Treat deployment credentials, Vercel/project tokens, environment values, preview URLs, and analytics credentials as sensitive operational data.

## Required Execution Goal Inputs

A future deployment execution goal must decide and record:

- Hosting target, such as Vercel preview or an equivalent access-controlled static host.
- Preview access control, such as password protection, platform authentication, or invite-only URL handling.
- Whether the deployment is preview-only or production-hosted but unlaunched.
- Environment variables and secret handling.
- Build command and output directory.
- Rollback procedure.
- Smoke verification commands.
- Screenshot evidence paths.
- Post-deployment non-authorization boundary.

## Consequences

- Public Website Private Preview Deployment Planning can be reviewed and tested without deploying.
- `main` can contain website code while deployment remains blocked.
- Deployment execution must be its own goal.
- Public launch remains governed by ADR-0015 public release readiness, ADR-0012 branch protection/release boundary, and explicit maintainer authorization.

## Non-Authorization Boundary

This ADR does not authorize:

- Website deployment.
- Production deployment.
- Public launch.
- Public repository visibility.
- npm publication.
- GitHub release creation.
- External announcement.
- SaaS, Team Cloud, or Enterprise availability claims.
- Hosted dashboard availability claims.
- Product artifact localization.
