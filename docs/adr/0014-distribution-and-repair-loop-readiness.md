# ADR-0014: Distribution and Repair Loop Readiness

- Status: Accepted
- Date: 2026-06-25
- Deciders: hardening-mcp maintainers

## Context

RepoAssure MVP v0.2 has completed the real-project user acceptance boundary. The product now has a working local-first CLI/MCP hardening flow, run-scoped artifacts, repair plans, repair task packages, repair handoff packages, validation-only execution reports, patch plans, Python/CLI acceptance mode, and Security Assurance Lane Phase 1 provider evidence import.

The next product step is no longer another isolated diagnostic feature. It is distribution and repair loop readiness: users and AI IDEs need a repeatable way to run RepoAssure from local tools, MCP clients, and future GitHub Actions, then consume the resulting artifacts to repair and re-verify repositories.

ADR-0009 already positions GitHub Action integration as an open-core distribution channel. ADR-0004 already defines repair plan and executable task package artifacts. ADR-0011 and ADR-0012 define private repository CI and release boundaries. This ADR connects those decisions into a v0.3 implementation boundary.

## Decision

RepoAssure v0.3 will focus on distribution and repair loop readiness.

The open-core product surface should prioritize:

- A stable GitHub Action wrapper over the existing local CLI flow.
- Stable MCP and CLI handoff examples for AI IDEs and coding agents.
- Stronger repair loop artifacts: repair task packages, verification plans, validation-only execution reports, and patch plans should become easier for agents to consume without guessing.
- Public-release preparation artifacts, including executable release checks, safe examples, dependency-license review hooks, and documentation that explains local-first behavior.
- Continued monorepo extraction only where it reduces distribution or repair-loop risk.

The following boundaries are mandatory:

- GitHub Action execution must run the local CLI in the checked-out repository. It must not upload target repo source, logs, screenshots, traces, env values, or private artifacts to a hosted RepoAssure service.
- Any uploaded CI artifact must be explicit, documented, and limited to user-approved reports or summaries.
- v0.3 must not introduce default automatic source modification in target repositories.
- v0.3 must not create commits, branches, GitHub issues, pull requests, advisories, or formatter writes by default.
- Patch plans remain reviewable plans until a separate ADR approves an auto-modification mode.
- Hosted dashboard, Team Cloud, and enterprise governance remain future commercial surfaces and must not be implemented without a separate public/private module-boundary decision.
- Security tools remain provider evidence sources through the Security Assurance Lane; v0.3 must not reposition RepoAssure as a generic deep vulnerability scanner.

## Consequences

### Positive

- Creates a concrete post-MVP direction without diluting local-first architecture.
- Makes GitHub Action, MCP, and CLI distribution consistent with the same artifact contract.
- Keeps AI IDE interoperability in the open core, which supports adoption and case-study generation.
- Preserves a clear safety boundary: RepoAssure can guide and verify repairs before it is allowed to modify code.
- Aligns v0.3 implementation with commercialization and public-release readiness work already accepted in ADR-0009.

### Negative

- Users may expect auto-fix behavior sooner than the product will provide by default.
- A GitHub Action wrapper adds CI environment variance that must be tested separately from local CLI behavior.
- Public-release readiness work may feel less visible than new product features, but it is required before credible distribution.
- Hosted dashboard work remains blocked until another decision defines the public/private module boundary.

### Follow-up

- Add `docs/product/specs/mvp-spec-v0.3.md` to define v0.3 scope, non-goals, and acceptance criteria.
- Add a v0.3 Codex goal that follows TDD and the testing pyramid.
- Update README, architecture, testing, acceptance, and strategy docs as v0.3 implementation lands.
- Convert public-release checklist items into executable checks where practical.
- Revisit this ADR before adding any default auto-modification, PR creation, hosted dashboard, or remote artifact storage behavior.
