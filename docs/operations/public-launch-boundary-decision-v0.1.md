# Public Launch Boundary Decision v0.1

Status: launch_not_authorized

Date: 2026-07-01

Repository: `xiaoba-dev/repoassure`

Current mode: `source_public_website_live`

Decision: `do_not_launch_yet`

Required next gate: `public_launch_authorization`

## Scope

This decision records the boundary between public source availability, custom-domain website availability, package or release publication, and an actual public launch.

RepoAssure is currently source-public and website-live. That state is intentionally not the same as a public launch, public marketing announcement, npm package publication, GitHub release, customer outreach, pricing change, or commercial availability claim.

## Current verified state

Public source repository: `PUBLIC`

Website custom domains: `repoassure.com`, `www.repoassure.com`

Package publication boundary: `package.json` keeps `private: true`

Evidence basis:

- Public Source Release Execution v0.1: `docs/operations/public-source-release-execution-v0.1.md`
- Native Branch Protection Enablement v0.1: `docs/operations/native-branch-protection-enablement-v0.1.md`
- Solo Maintainer Branch Protection Adjustment v0.1: `docs/operations/solo-maintainer-branch-protection-adjustment-v0.1.md`
- Public Website Custom Domain Deployment v0.1: `docs/operations/public-website-custom-domain-deployment-v0.1.md`
- Public Website Post-Domain Polish & Launch Boundary Review v0.1: `docs/operations/public-website-post-domain-polish-v0.1.md`
- Public Release Post-Merge Hygiene v0.1: `docs/operations/public-release-post-merge-hygiene-v0.1.md`

## Decision

RepoAssure should remain in `source_public_website_live` mode until a separate public launch authorization gate is opened and explicitly approved.

The next launch-oriented work should prepare, not execute, a launch authorization packet. That packet should define launch scope, launch copy, support boundaries, risk acceptance, commercial-claim boundaries, rollback or correction plan, and explicit maintainer approval.

## Non-actions

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.

No customer contact was executed.

No pricing change or spend was executed.

No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.

No customer logo, case study, production customer claim, or external endorsement claim was executed.

## Required gates before launch execution

Before any public launch execution, the project must have:

- explicit public launch authorization,
- approved launch copy and release notes,
- support and issue-response boundary,
- legal/trademark/claim-risk confirmation or accepted-risk record,
- commercial availability wording review,
- rollback or announcement-correction plan,
- final maintainer approval for the exact launch action.

Any actual launch execution must be a separate goal. That future goal must not reuse this decision record as launch authorization.

## Recommended next step

Prepare Public Launch Authorization Packet v0.1 as a docs-only gate. It should collect launch copy, release notes, support boundaries, claim review, risk acceptance, and maintainer approval fields, while still avoiding publication or announcement execution.
