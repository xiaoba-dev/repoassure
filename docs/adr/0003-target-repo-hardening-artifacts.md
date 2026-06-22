# ADR-0003: Target Repo Hardening Artifacts

- Status: Accepted
- Date: 2026-06-20
- Deciders: hardening-mcp maintainers

## Context

Hardening runs produce reports, findings, screenshots, generated Playwright tests, repair plans, task packages, patch diffs, and manifests. AI IDEs need a stable entrypoint, while humans need simple paths to inspect results. Multi-repo experiments also need a way to summarize runs without mixing target repo outputs into this product repo.

## Decision

Write canonical hardening artifacts into the target repo under `.hardening/runs/<run-id>/`, with `.hardening/latest` pointing to the latest run. Keep compatibility paths such as `.hardening/run/*`, root `hardening-report.md`, and `tests/hardening/*.spec.ts`. AI IDEs should start from `.hardening/latest/manifest.json`.

## Consequences

### Positive

- Each target repo owns its own evidence and generated tests.
- AI IDEs have one stable manifest entrypoint.
- Human users can still open familiar root-level report and test files.
- Multi-repo workspace output can remain an index or copy, not the source of truth.

### Negative

- Target repos become dirty after hardening runs.
- Compatibility paths must stay in sync with run-scoped bundle paths.
- Generated artifacts must be ignored or curated carefully by target repo owners.

### Follow-up

- Improve cleanup and artifact retention policy.
- Add workspace-level index support without moving canonical target artifacts out of target repos.

