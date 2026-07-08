# ADR-0031: Target Repo Repair Goal Execution Evidence Intake

Status: Accepted
Date: 2026-07-09

## Context

ADR-0030 added an authorized target repo repair goal task package. That package gives an AI IDE the approved repair goal input, but RepoAssure still needs a durable local artifact for the evidence returned after the separate target repo repair goal runs.

The gap is not target repo automation. The gap is evidence intake: after a separately authorized repair goal, the maintainer needs a normalized local report with mutation summary, verification results, blocked outcomes, boundary evidence, and review checklist.

## Decision

Add target repo repair goal execution evidence intake generated from `ai-ide-authorized-target-repo-repair-goal-task-package.json` and a maintainer/AI IDE supplied `target-repo-repair-goal-execution-evidence-input.json`.

The report schema is:

```text
repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1
```

The CLI command is:

```text
pnpm playbook:target-repair-evidence -- --from-dir <dir>
```

It writes:

- `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json`
- `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.md`

The report must include source task package provenance, intake status, approved repair goal execution reports, actual mutation summary, verification results, boundary report, maintainer review boundary, redaction boundary, non-authorization boundary, and blocked actions.

## Boundaries

This intake report records execution evidence from a separate target repo repair goal.

It does not create target repo branch, commit, pull request, issue, advisory, file mutation, npm publication, GitHub release, public launch, production marketing announcement, customer contact, pricing/spend change, SaaS, Team Cloud, Enterprise, or hosted dashboard availability claims.

RepoAssure does not upload target repo material or private source by default. Evidence inputs must remain sanitized local summaries.

## Consequences

- Maintainers get a normalized local report after a target repo repair goal.
- AI IDEs get a stable handoff for verification results and maintainer review.
- Boundary violations are reported as evidence and do not authorize acceptance.
- Future repair loops can consume the intake report before opening another repair goal.
