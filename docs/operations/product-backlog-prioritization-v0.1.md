# Product Backlog Prioritization v0.1

Status: product_backlog_prioritized_launch_deferred

Date: 2026-07-02

Repository: `xiaoba-dev/repoassure`

Source backlog: `Product / Website / User Validation Backlog Planning v0.1`

Launch authorization status: `not_authorized`

Prioritization decision: `prioritize_product_validation_before_launch`

## Scope

This record converts the deferred launch follow-up backlog into a product-first execution order.

The goal is to validate whether RepoAssure can produce useful local-first evidence, handoff materials, and repair guidance from real target repos before reopening any public launch discussion.

This record does not reopen the public launch gate and does not create an Action Authorization Receipt.

## Prioritized product tasks

### Priority 1: Target repo acceptance feedback loop

Goal: make real target repo runs easier to execute, inspect, and summarize after `pnpm user:accept` or equivalent acceptance entrypoints.

TDD slice:

- Add a failing contract test for a normalized acceptance feedback summary generated from target repo runs.
- Implement the smallest local artifact summary that records run status, target repo metadata class, acceptance result, blocker category, and next recommended product action without storing secrets or raw private repo content.
- Verify the summary is stable enough for maintainer review and later backlog triage.

Evidence:

- Unit tests for summary shape and redaction boundary.
- Structure tests proving the generated feedback material is discoverable from the run output folder.
- One dry-run fixture or synthetic run that does not require customer data.

### Priority 2: AI IDE handoff material quality

Goal: make RepoAssure outputs easier for Codex, Cursor, Claude Code, and other AI IDE or agent workflows to consume.

TDD slice:

- Add a failing contract test for a concise AI IDE handoff package index.
- Ensure the index points to hardening report, repair plan, patch plan, acceptance report, environment/provenance evidence, and prioritized next actions.
- Keep the package local-first and repo-scoped; do not upload or transmit target repo materials.

Evidence:

- Unit tests for handoff package schema and required links.
- Acceptance fixture proving missing artifacts are reported as actionable gaps instead of silent omissions.
- Documentation that tells the target AI IDE which materials to read first.

### Priority 3: Repair task actionability

Goal: improve repair task packages so downstream agents can distinguish urgent, safe, blocked, and research-needed actions.

TDD slice:

- Add a failing test for repair task priority, evidence references, acceptance checks, owner surface, and blocked-reason fields.
- Extend the repair planner output contract without breaking existing consumers.
- Add compatibility tests for legacy repair package readers.

Evidence:

- Unit tests for new repair task fields.
- Snapshot or fixture coverage for high, medium, and blocked repair actions.
- Documentation mapping each repair action to expected verification evidence.

### Priority 4: User validation evidence loop

Goal: separate maintainer-owned smoke tests, external reviewer feedback, and product backlog input so private preview evidence does not get misread as public launch authorization.

TDD slice:

- Add a failing structure test for user validation intake records and feedback triage status.
- Define a lightweight local feedback evidence template with severity, source class, product area, decision, and follow-up owner.
- Ensure reviewer identities remain anonymized in Git-tracked materials.

Evidence:

- Structure tests for user validation docs.
- Sensitive-material scan coverage for reviewer emails and private feedback identifiers.
- Maintainer review checklist that distinguishes feedback received, feedback triaged, and launch authorization.

### Priority 5: Release readiness hygiene automation

Goal: keep release hygiene current while product validation proceeds, without turning hygiene evidence into launch permission.

TDD slice:

- Add a failing test or script check for stale readiness references after new product backlog records land.
- Ensure `release:check`, `repo:hygiene`, sensitive-material scans, and goal audit remain easy to rerun and inspect.
- Keep `package.json` publication-disabled until a future explicit package publication decision exists.

Evidence:

- Existing pyramid gates continue to pass.
- Structure tests cover cascade docs and non-authorization boundary.
- Any generated audit snapshot is treated as reviewed evidence, not automatic launch authorization.

## TDD execution order

1. Priority 1: Target repo acceptance feedback loop
2. Priority 2: AI IDE handoff material quality
3. Priority 3: Repair task actionability
4. Priority 4: User validation evidence loop
5. Priority 5: Release readiness hygiene automation

## Public launch boundary

Do not reopen public launch gate.

Future public launch may only be reconsidered after a new complete launch authorization packet exists and is explicitly accepted by the maintainer as an Action Authorization Receipt.

No Action Authorization Receipt was produced.

No npm publication was executed.

No GitHub release was executed.

No public launch or production marketing announcement was executed.

No customer contact was executed.

No pricing change or spend was executed.

No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was executed.

No customer logo, case study, production customer claim, or external endorsement claim was executed.
