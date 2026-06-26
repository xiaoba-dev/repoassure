# Project Intelligence Console Spec v0.1

Status: Draft
Date: 2026-06-25
Source ADR: [ADR-0017](../../adr/0017-public-website-and-project-intelligence-console.md)

## TL;DR

Project Intelligence Console is an internal independent site for living Docs Graph, Code Graph, and Project Progress Graph views. v0.1 should be local-only, generated from repository files, and used to help maintainers and AI agents see product state without creating a hosted service dependency.

## Purpose

RepoAssure already uses ADRs, product specs, architecture specs, acceptance docs, logs, tests, and goal records. The volume is now large enough that maintainers need a graph view of how decisions, code, tests, and progress relate.

The console should answer:

- Which ADRs cascade into which specs, docs, tests, and logs?
- Which packages, apps, and source modules own each product capability?
- Which tests protect each product/architecture decision?
- Which goals are completed, blocked, or likely stale?
- Which next development direction is implied by current docs and code?

## Users

| User | Need |
| --- | --- |
| Maintainer | Understand product and engineering state quickly |
| Codex / AI agent | Read graph context before proposing next goals or edits |
| Product reviewer | Inspect roadmap, spec status, acceptance status, and release boundary |
| Engineering reviewer | Inspect module ownership, test coverage, and risk areas |

## Graphs

### Docs Graph

Docs Graph should show relationships among:

- ADRs.
- Product specs.
- Architecture specs.
- Strategy docs.
- Acceptance docs.
- Testing strategy.
- Decision/dev/blocker logs.

Example edges:

- ADR -> product spec.
- ADR -> architecture spec.
- Spec -> acceptance checklist.
- Spec -> test file.
- Decision log -> ADR.

### Code Graph

Code Graph should show:

- apps, packages, src adapters, tools, domain modules, shared packages, tests, scripts.
- Compatibility wrappers and package ownership.
- Test files related to runtime modules or documentation boundaries.
- Generated artifact directories excluded from source ownership.

### Project Progress Graph

Project Progress Graph should show:

- Active/completed goals.
- Acceptance status.
- Full acceptance evidence.
- Public release readiness status.
- Known blockers.
- Next recommended goal candidates.

## Data Sources

| Source | Use |
| --- | --- |
| `docs/adr/` | Decision nodes and decision status |
| `docs/product/` | Product roadmap and specs |
| `docs/architecture/` | Architecture nodes and implementation boundaries |
| `docs/acceptance/` | Acceptance status and proof records |
| `docs/logs/` | Decision/dev/blocker chronology |
| `apps/`, `packages/`, `src/`, `tests/`, `scripts/` | Code graph and ownership graph |
| Git metadata | Branch, changed files, recent commits when available |

## Functional Requirements

| Requirement | Priority | Description |
| --- | --- | --- |
| Graph snapshot generation | P0 | Generate JSON graph snapshots from local repo files |
| Internal static site | P0 | Render graph snapshots in a local-only internal independent site |
| Docs Graph | P0 | Show ADR/spec/doc/test/log relationships |
| Code Graph | P0 | Show module ownership and test relationships |
| Project Progress Graph | P0 | Show goals, acceptance, blockers, and next-step hints |
| Watch mode | P1 | Rebuild graph snapshots when docs/code change |
| Staleness detection | P1 | Flag ADRs/specs not cascaded into expected docs/tests |
| Agent context export | P1 | Export concise graph summary for Codex goals |

## Data Boundary

- local-only by default.
- No hosted service dependency.
- No upload of repository source, private logs, screenshots, traces, env values, secrets, or generated graph data by default.
- Generated graph snapshots should live under `artifacts/project-graph/` or another ignored artifact directory.
- Any future shared/exported graph must go through explicit review.

## Acceptance Criteria

| Area | v0.1 acceptance |
| --- | --- |
| Scope | Spec defines Docs Graph, Code Graph, and Project Progress Graph |
| Boundary | Spec states local-only and no hosted service dependency |
| Data | Spec defines local source files and generated graph snapshot path |
| Implementation | No internal site runtime is implemented in this planning increment |
| Testing | Future graph builder must start with executable tests before runtime code |

## Non-Goals

- No graph builder runtime implementation in this planning increment.
- No UI implementation in this planning increment.
- No hosted dashboard or Team Cloud dependency.
- No source upload, cloud sync, analytics, or telemetry.
- No replacement for ADRs, specs, acceptance docs, or logs; the console reads them rather than becoming the source of truth.
