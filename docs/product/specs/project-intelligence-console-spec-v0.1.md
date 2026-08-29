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

## Implementation Status

Graph snapshot generation is implemented as `pnpm project:intelligence`. It writes local-only JSON and Markdown snapshots under `artifacts/project-graph/`.

The local static viewer is implemented as `pnpm project:intelligence:view`. It reads `project-intelligence-snapshot.json` and writes local-only `project-intelligence-viewer.html` under the same ignored artifact boundary.

Freshness and staleness findings are implemented in the local snapshot and viewer. Current checks cover ADR cascade gaps, app ownership documentation gaps, package test-link gaps, and progress active-goal mismatches.

Project Intelligence Detection Rule Calibration v0.1 is implemented for app/package ownership documentation. `findOrphanCode` now requires an exact app/package root `README.md` and no longer treats nested README files as satisfying ownership documentation.

RepoAssure Product Completion Gap Audit v0.1 selected Agent context export as the next safe automatic Project Intelligence goal. This keeps the product local-only while making graph state easier for Codex / AI IDE agents to consume before proposing or executing future goals.

Project Intelligence Agent Context Export v0.1 is implemented as `pnpm project:intelligence:agent-context`. It reads the existing `project-intelligence-snapshot.json` and `.autopilot` state, then writes `project-intelligence-agent-context.json` and `.md` under `artifacts/project-graph/`. The context includes agent read order, current goal, recommended next goal, product surfaces, blocker/manual gate summary, evidence paths, redaction, and explicit non-authorization boundaries.

Project Intelligence Watch Mode Planning v0.1 is completed as a planning record.

Project Intelligence Watch Mode Implementation v0.1 is implemented as `pnpm project:intelligence:watch`. It runs as a local-only foreground process, observes bounded docs/code/autopilot file changes through bounded polling, ignores generated artifacts and dependency paths, debounces events for 1500 ms by default, refreshes Project Intelligence snapshots before agent context exports, records sanitized status in `project-intelligence-watch-status.json`, supports `--once` smoke validation, and stops cleanly with `Ctrl+C`.

Project Intelligence Watch Mode Local Smoke Validation v0.1 is completed. It validates real local file changes in an isolated fixture, proves ignored generated/dependency/cache/secret paths do not trigger refresh, confirms debounce coalescing, verifies snapshot -> agent-context -> watch-status freshness order, and confirms foreground abort/manual stop behavior.

Project Intelligence Watch Mode AI IDE Consumption Handoff v0.1 is implemented as `pnpm project:intelligence:watch-handoff`. It reads `project-intelligence-watch-status.json` and `project-intelligence-agent-context.json`, then writes `project-intelligence-watch-handoff.json` and `.md` under `artifacts/project-graph/`. The handoff includes AI IDE read order, commands, artifact paths, freshness checks, stop instructions, maintainer review boundary, redaction, and explicit non-authorization boundaries.

Project Intelligence Watch Mode End-to-End Local Fixture Validation v0.1 is completed. It validates the complete local fixture loop across snapshot generation, agent context export, watch `--once` status output, and AI IDE watch handoff generation. The validation also requires generated snapshot and agent-context Markdown artifacts to be marked `available` in the handoff when present.

Project Intelligence Watch Mode Operator Playbook v0.1 is completed. It documents the local command sequence, AI IDE read order, freshness diagnosis, malformed/stale artifact recovery, foreground `Ctrl+C` stop boundary, and prohibited hosted/cloud/telemetry/deployment/target-repo-write actions for maintainers, Codex, and AI IDEs.

Project Intelligence Watch Mode Operator Playbook Consumption Validation v0.1 is completed. `tests/unit/project-intelligence-watch-operator-playbook.test.ts` validates that the playbook and generated handoff align on command sequence, AI IDE read order, freshness failure blocking, maintainer review boundary, and no target repo write boundary.

Project Intelligence Watch Mode Recovery Command UX v0.1 is completed. Generated watch handoff JSON now includes `recoveryPlan`, and Markdown handoff includes `Recovery Plan` guidance with local-only regeneration / inspection commands, failed freshness check IDs, redaction, and no manual generated-artifact edit / target repo write boundaries.

Project Intelligence Watch Mode Recovery UX Real Workspace Smoke v0.1 is completed. `tests/integration/project-intelligence-watch-recovery-ux-smoke.test.ts` validates that real RepoAssure workspace watch handoff artifacts produce `recoveryPlan.status=not_needed`, while a simulated failing watch status fixture produces `recoveryPlan.status=required` with local regeneration / inspection commands. The smoke also verifies redaction and preserves no hosted dashboard, no cloud sync, no telemetry, no manual generated-artifact edit, and no target repo write boundaries.

Project Intelligence Watch Mode Completion Audit v0.1 is completed. The current local-only watch-mode slice is closed as `complete_for_current_local_only_slice`; the audited evidence includes runtime, generated artifacts, operator playbook, recovery UX, tests, docs, 6/6 freshness checks passed, and `recoveryPlan.status=not_needed`.

Product False-Positive Regression Catalog Planning v0.1 is completed. It defines a local-only catalog plan for browser hardening findings, Project Intelligence findings, security assurance findings, and repair planner consumption. The plan specifies fixture categories, expected finding snapshots, severity/rationale review fields, maintainer review boundary, redaction, and no target repo write / no runtime detection behavior change boundaries. It is not a suppression mechanism and does not change detection rules.

Product False-Positive Regression Catalog Contract Implementation v0.1 is completed. `packages/acceptance/src/false-positive-catalog.ts` now implements the package-owned local catalog contract, root/subpath exports, default non-private expected finding snapshots, validator, redaction check, maintainer decision boundary, and no target repo write / no runtime detection behavior change boundary. The next product step is local JSON/Markdown artifact generation for maintainer and AI IDE consumption, not detector behavior changes.

Product False-Positive Regression Catalog Artifact Generation v0.1 is completed. `packages/acceptance/src/run-false-positive-catalog.ts` and `pnpm false-positive:catalog` now generate local-only `artifacts/project-graph/false-positive-regression-catalog.json` and `.md`. The generated artifacts include fixture categories, expected finding snapshots, severity/rationale review fields, maintainer decision fields, redaction metadata, AI IDE read order, and maintainer review boundary. They are evidence artifacts only: they do not change detector behavior, suppress findings, downgrade severities automatically, write target repos, or imply hosted dashboard availability.

Product False-Positive Regression Catalog Consumption Validation v0.1 is completed. `packages/acceptance/src/run-false-positive-catalog-consumption.ts` and `pnpm false-positive:catalog:validate` validate that maintainers and AI IDE workflows can consume the generated catalog JSON/Markdown in the intended read order. The validation produces local-only `artifacts/project-graph/false-positive-regression-catalog-consumption-validation.json` and `.md`, checks maintainer review boundary, fixture categories, expected snapshots, review fields, verification checklist, redaction, no target repo writes, no suppression, no automatic severity downgrade, and no runtime detection behavior change. The next product step is Product False-Positive Regression Catalog Completion Audit v0.1.

Product False-Positive Regression Catalog Completion Audit v0.1 is completed. The audit closes planning, contract implementation, artifact generation, and consumption validation as `complete_for_current_local_only_catalog_slice`. It confirms the catalog artifacts and consumption validation artifacts remain local, ignored, AI IDE readable, redacted, and bounded by no target repo writes, no runtime detection behavior change, no finding suppression, no automatic severity downgrade, no hosted dashboard, no cloud sync, no telemetry, no deployment, and no public release. The next product step is Product False-Positive Regression Catalog Real Fixture Expansion v0.1.

Product False-Positive Regression Catalog Real Fixture Expansion v0.1 is completed. The catalog now includes `real_world_fixture_regressions`, 2 near-real public fixture candidates, `fixtureOrigin`, and privacy metadata proving each catalog entry is non-private, source-free, and secret-free. Generated catalog artifacts expose fixture origin and non-private status for AI IDE / maintainer review, and consumption validation requires the new real-world fixture category. This is catalog evidence only; it does not change detector behavior, suppress findings, downgrade severities automatically, write target repos, or imply hosted dashboard availability.

Product False-Positive Regression Catalog Detector Calibration Planning v0.1 is completed. The planning record maps expanded near-real fixtures to detector calibration questions, manual review gates, and future implementation authorization boundary. It keeps detector calibration as a reviewed product decision path rather than a runtime configuration path. The next product step is Product False-Positive Regression Catalog Detector Calibration Contract v0.1.

Product False-Positive Regression Catalog Detector Calibration Contract v0.1 is completed. `packages/acceptance/src/run-false-positive-detector-calibration-contract.ts` and `pnpm false-positive:calibration-contract` now generate local-only `artifacts/project-graph/false-positive-detector-calibration-contract.json` and `.md`. The contract records AI IDE read order, 2 calibration questions, manual gates, future implementation authorization requirements, redaction metadata, and no target repo write / no runtime detection behavior change boundaries. The next product step is Product False-Positive Regression Catalog Detector Calibration Contract Consumption Validation v0.1.

Product False-Positive Regression Catalog Detector Calibration Contract Consumption Validation v0.1 is completed. `packages/acceptance/src/run-false-positive-detector-calibration-contract-consumption.ts` and `pnpm false-positive:calibration-contract:validate` validate that AI IDE and maintainer workflows can consume the generated detector calibration contract JSON/Markdown in order. The validation produces local-only `artifacts/project-graph/false-positive-detector-calibration-contract-consumption-validation.json` and `.md`, checks 13 consumption and boundary rules, and fails closed for runtime detector behavior change, finding suppression, automatic severity downgrade, target repo writes, or secret-like content. The next product step is Product False-Positive Regression Catalog Detector Calibration Completion Audit v0.1.

Product False-Positive Regression Catalog Detector Calibration Completion Audit v0.1 is completed. The audit closes detector calibration planning, contract generation, and contract consumption validation as `complete_for_current_local_only_detector_calibration_slice`. It confirms calibration contract and consumption validation artifacts remain local-only, ignored, AI IDE readable, redaction-aware, and bounded by no runtime detector behavior change, no finding suppression, no automatic severity downgrade, no detector confidence threshold change, no acceptance policy change, and no target repo writes. The next product step is Product False-Positive Regression Catalog Detector Calibration Authorization Intake v0.1.

Product False-Positive Regression Catalog Detector Calibration Authorization Intake v0.1 is completed with conclusion `authorization_intake_created_pending_maintainer_decisions`. The intake creates pending approve / reject / defer / accept-risk decision slots for the two detector calibration questions and keeps all decisions unresolved until the maintainer gives explicit values. The next product step is Product False-Positive Regression Catalog Detector Calibration Maintainer Decision Recording v0.1. This remains local product governance only and does not implement runtime detector behavior change, finding suppression, automatic severity downgrade, detector confidence threshold change, acceptance policy change, hosted dashboard behavior, or target repo writes.

ADR cascade remediation backlog generation is implemented as a local review artifact. It turns `missing_cascade` findings into maintainer decision items but does not automatically edit ADRs or downstream docs.

ADR cascade remediation decision intake is implemented as a local review artifact. It turns backlog items into Markdown/JSON pending decision slots for approve / defer / accept-risk / repair and does not automatically repair ADRs or mutate downstream docs.

ADR cascade remediation recommendation draft generation is implemented as a local review artifact. It turns decision intake items into Markdown/JSON advisory recommendations with suggested decision, rationale, risk, evidence, and rollback / follow-up notes while keeping final maintainer decisions pending.

ADR cascade maintainer decision recording is implemented as a local decision artifact. It records owner-authorized maintainer decisions from the recommendation draft into Markdown/JSON outputs while keeping repair execution and document mutation unauthorized.

ADR cascade controlled remediation planning is implemented as a local planning artifact. It records item-to-file mapping, proposed execution order, rollback notes, and verification checklist from the maintainer decision record while keeping repair execution and document mutation unauthorized.

Project Intelligence ADR Cascade Controlled Remediation Execution v0.1 is implemented as a controlled documentation governance repair for 11 owner-authorized ADR cascade items. It adds `Cascade Evidence` links to the affected ADRs and cascades the execution status into canonical docs, testing strategy, acceptance checklist, logs, and autopilot state. It does not implement hosted dashboard, cloud sync, telemetry, deployment, public release, or target repo writes.

Automated remediation execution and any hosted/internal live console remain planned or pending explicit maintainer confirmation.

## Acceptance Criteria

| Area | v0.1 acceptance |
| --- | --- |
| Scope | Spec defines Docs Graph, Code Graph, and Project Progress Graph |
| Boundary | Spec states local-only and no hosted service dependency |
| Data | Spec defines local source files and generated graph snapshot path |
| Implementation | Graph snapshot generator, local static viewer, freshness/staleness findings, ADR cascade backlog generation, ADR cascade decision intake, recommendation draft generation, maintainer decision recording, controlled remediation planning, Project Intelligence ADR Cascade Controlled Remediation Execution v0.1 for 11 ADR documentation cascade repairs, root README-only ownership detection, agent context export, watch mode planning, watch mode implementation, local smoke validation, AI IDE watch handoff, end-to-end local fixture validation, operator playbook, operator playbook consumption validation, recovery command UX, recovery UX real workspace smoke, watch mode completion audit, false-positive regression catalog planning, false-positive regression catalog contract implementation, false-positive regression catalog artifact generation, false-positive regression catalog consumption validation, false-positive regression catalog completion audit, false-positive real fixture expansion, detector calibration planning, detector calibration contract, detector calibration contract consumption validation, detector calibration completion audit, and detector calibration authorization intake completed |
| Testing | Graph builder, static viewer, findings, backlog generation, decision intake, recommendation draft generation, maintainer decision recording, controlled remediation planning, controlled remediation execution, nested README ownership regression, agent context export, watch mode planning/implementation, local smoke validation, watch handoff, E2E fixture validation, operator playbook doc cascade, playbook consumption contract, recoveryPlan contract, real-workspace recovery UX smoke, completion audit cascade, false-positive catalog planning cascade, false-positive catalog contract/package tests, artifact generation tests, consumption validation tests, and completion audit structure tests covered by executable unit / integration / structure tests before runtime completion |

## Non-Goals

- No hosted graph dashboard implementation in this planning increment.
- No live internal console server implementation in this planning increment.
- No hosted dashboard or Team Cloud dependency.
- No source upload, cloud sync, analytics, or telemetry.
- No replacement for ADRs, specs, acceptance docs, or logs; the console reads them rather than becoming the source of truth.
