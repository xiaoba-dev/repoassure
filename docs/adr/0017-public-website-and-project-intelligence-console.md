# ADR-0017: Public Website and Internal Project Intelligence Console

- Status: Accepted
- Date: 2026-06-25
- Deciders: hardening-mcp maintainers

## Context

RepoAssure now has enough product definition to need two different visibility surfaces:

- An external, responsive public website that explains the product, earns trust, and collects early demand.
- An internal, living graph console that helps maintainers understand documentation, code, and project progress while the product is still evolving quickly.

These needs are related but should not share the same product surface. The website is a public-facing brand and conversion surface. The Project Intelligence Console is a local-only internal observability surface for maintainers and AI agents.

The repository remains private and public release remains gated by manual authorization. A website specification must not imply that SaaS, public repository access, npm publication, or a commercial hosted product is available before those gates are separately accepted.

Public website and internal project intelligence console planning does not authorize public release.

## Decision

Create two separate product surfaces:

- Public Website: a responsive design website for external positioning, product explanation, proof artifacts, docs entry, GitHub entry, and waitlist/private-preview conversion.
- Project Intelligence Console: a local-only internal observability surface that builds live Docs Graph, Code Graph, and Project Progress Graph views from repository files and generated graph snapshots.

The public website may present RepoAssure's current open-core workflow and commercial roadmap, but it must:

- Clearly use private preview / coming soon language until public release is authorized.
- Link to proof artifacts and docs only when safe to expose.
- Avoid claiming SaaS availability, public package availability, enterprise availability, or repository public release before those are true.
- Treat Team Cloud and Enterprise as roadmap surfaces governed by ADR-0016.

The Project Intelligence Console may scan local repository files and generated artifacts, but it must:

- Remain local-only by default.
- Avoid hosted service dependency.
- Read repo documentation, source structure, tests, git metadata, acceptance records, and logs to generate graph data.
- Write generated graph snapshots under `artifacts/project-graph/` or another ignored artifact directory.
- Never upload repository source, private logs, secrets, screenshots, traces, or graph data by default.

## Consequences

### Positive

- Separates external product storytelling from internal engineering observability.
- Gives RepoAssure a future public entry point without prematurely changing release posture.
- Creates an internal system that can reveal stale docs, missing ADR cascades, code ownership gaps, testing gaps, and goal progress.
- Provides a future source of safe public proof material after manual review.

### Negative

- Adds two new surfaces to govern before implementation begins.
- The public website can create expectation risk if copy is not tightly aligned with release status.
- The internal console needs graph extraction rules and data hygiene before it can be trusted by agents.

### Follow-up

- Use `docs/product/specs/public-website-spec-v0.1.md` before implementing the external website.
- Use `docs/product/specs/project-intelligence-console-spec-v0.1.md` and `docs/architecture/specs/project-intelligence-console-architecture-v0.1.md` before implementing the internal graph console.
- Add executable graph-builder tests before writing any runtime graph extraction code.
- Revisit public release, privacy, and artifact exposure boundaries before deploying any externally reachable website.
