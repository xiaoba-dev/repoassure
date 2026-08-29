# Public Git History Personal-Identifier Remediation Planning v0.1

Status: completed_pending_maintainer_decision

Date: 2026-07-26

## Purpose

Prepare a redacted maintainer decision packet for historical personal
identifiers that remain recoverable from the public Git history. This record
does not reproduce any identifier value and does not authorize or execute a
repository mutation.

## Evidence Summary

- Affected public-history commits: 6
- Affected unique paths: 16
- Affected date range: 2026-06-27 to 2026-06-28
- Data classification: personal contact data
- Credential exposure evidence: none
- Current-tree identifier matches: 0
- Identifier values reproduced: no
- Repository visibility at review time: PUBLIC
- No Git history rewrite was performed
- No force push, branch deletion, tag rewrite, credential rotation, contact,
  publication, deployment, or repository-setting change was performed

The user previously identified the historical values as owner-controlled
contact addresses that had been supplied for testing. This supports the
personal-contact-data classification; it does not make the values secret
credentials and does not remove their privacy or spam-exposure risk.

## Affected Commit Inventory

The following immutable commit identifiers are safe to retain as remediation
scope evidence:

1. `6457ccadd328345c289e8a2ea4c294bf6fe1a8a9`
2. `df17cb6bae98a566f2a5751fbc9cda44dbf780dc`
3. `c50a86de984ca05c23ea075cef8aa58f7338680c`
4. `19ec00426d8182e3da4cace2dba89d9868f4b92c`
5. `c79b15bf7252733adfb4b8ddf4c8eae8466dc627`
6. `540f212d59b2beb3f7e87074200439b58935a108`

## Affected Path Inventory

The scope contains 15 governance documents and one project-structure test:

- `docs/acceptance/checklists/acceptance-checklist-v0.1.md`
- `docs/logs/blockers.md`
- `docs/logs/dev-log.md`
- `docs/operations/cloudflare-access-preview-preflight-v0.1.md`
- `docs/operations/private-preview-external-reviewer-recruitment-and-dispatch-plan-v0.1.md`
- `docs/operations/private-preview-feedback-triage-backlog-v0.1.md`
- `docs/operations/private-preview-real-reviewer-replacement-v0.1.md`
- `docs/operations/private-preview-reviewer-handoff-dispatch-readiness-v0.1.md`
- `docs/operations/private-preview-reviewer-handoff-package-and-dispatch-execution-v0.1.md`
- `docs/operations/private-preview-reviewer-handoff-v0.1.md`
- `docs/operations/private-preview-reviewer-identity-correction-v0.1.md`
- `docs/operations/private-preview-reviewer-identity-reconciliation-v0.1.md`
- `docs/operations/private-preview-second-reviewer-access-execution-v0.1.md`
- `docs/operations/public-website-release-candidate-handoff-v0.1.md`
- `docs/testing/strategy/test-strategy-v0.1.md`
- `tests/unit/project-structure.test.ts`

No production source path is in the affected set.

## Options

### Option 1: Accept risk

Accept that the values remain recoverable from public history while keeping
the current tree clean and preventing recurrence.

Benefits:

- No clone, fork, pull request, commit-link, or integration disruption.
- Existing commit identifiers and commit signature evidence remain stable.
- The decision can be reversed later if the maintainer's privacy threshold
  changes.

Costs:

- The historical contact data remains recoverable through Git history,
  mirrors, forks, and third-party caches.
- Privacy and spam risk must be explicitly accepted and periodically reviewed.

Required controls:

- Preserve current-tree identifier checks.
- Never reproduce the values in public decision records or test fixtures.
- Reassess if the values become credentials, customer data, or a material
  safety risk.

### Option 2: Rewrite public Git history

Rewrite every affected commit and all descendants, then replace affected
public refs.

Benefits:

- Removes the values from the rewritten canonical branch history.
- Reduces casual discovery from fresh clones of the canonical repository.

Costs and consequences:

- Every descendant commit identifier changes.
- Existing clone and fork histories diverge and require coordinated recovery.
- Open or historical pull request references and external commit links may
  become stale.
- Affected commit signature verification can be invalidated or lost.
- Current branch protection may require a narrowly authorized temporary bypass.
- Existing mirrors, forks, caches, and local clones can retain the original
  objects even after the canonical rewrite.

This option requires separate action authorization. Planning approval alone
must never be treated as permission to rewrite or force push.

### Option 3: Replace repository

Create a clean repository baseline and migrate only approved current content.

Benefits:

- The replacement repository starts with a clean canonical history.
- Migration can avoid carrying the affected objects into the new repository.

Costs and consequences:

- Repository continuity, clone URL, pull requests, issues, stars, forks, and
  existing links can be lost or require explicit migration.
- The original public repository and external caches can still preserve the
  affected history.
- This is the highest-disruption option and is not proportionate to the
  current evidence.

## Recommendation

Recommended option: accept risk

For the current solo-maintainer context, accept risk is proportionate because
the values are owner-controlled personal contact data, the current tree is
clean, there is no credential-exposure evidence, and a public history rewrite
would impose materially larger continuity and collaboration costs. If
continued public recoverability is unacceptable to the maintainer, use Option
2 only after a separate rewrite execution plan and explicit authorization.

Repository replacement is not recommended.

## Execution Requirements If Rewrite Is Later Authorized

### Rollback requirements

- Create a private, access-controlled backup of all original refs before any
  rewrite.
- Record a redacted old-to-new commit map outside the public repository.
- Define an abort point before replacing any public ref.
- Keep a tested restoration procedure until all verification gates pass.

### Notification requirements

- Identify affected clone and fork owners without placing contact values in
  the repository.
- Prepare coordinated instructions for re-clone or hard realignment.
- Identify pull request and external-link owners that need migration notice.
- Require a separate maintainer authorization before sending any notice.

### Verification requirements

- Scan all rewritten branches and tags for the prohibited values without
  logging those values.
- Validate a fresh clone contains no affected object reachable from canonical
  refs.
- Confirm branch protection and required checks are restored.
- Confirm release automation, contribution flow, and open pull request handling
  still work.
- Record whether commit signature evidence changed.
- Confirm current-tree identifier checks remain at zero.

## Maintainer Decision Contract

The next decision must be exactly one of:

- `accept_risk`
- `authorize_rewrite_planning`
- `replace_repository_planning`
- `defer`

An authorization to plan is not authorization to execute. Any rewrite,
force-push, repository replacement, external notification, credential action,
publication, launch, or deployment requires a separate bounded Goal and
explicit approval.

## ADR Decision

No ADR is added. This packet supports a maintainer risk choice about historical
repository data; it does not establish a durable product or architecture
decision.

## Verification

- TDD Red: 3 expected structure-test failures for missing status migration,
  operation record, and next Goal.
- Structure Green: 123/123 tests passed.
- Focused structure and Autopilot consistency: 3 files, 131/131 tests passed.
- Autopilot progress consistency: 8/8 checks passed.
- Full suite outside the sandbox with one worker: 82 files and 796 tests
  passed; 1 file and 1 test skipped.
- `pnpm typecheck`, `pnpm lint`, `pnpm build:src`, `pnpm repo:hygiene`,
  `pnpm goal:audit`, and `git diff --check`: passed.
- `pnpm release:check`: automated prerequisites passed and additional
  publication actions remain not authorized, so `public release ready: no` is
  expected.
- The sandbox run had 6 environment failures involving local port binding and
  isolated package installation.
- The default parallel outside-sandbox run had one packed-test race while two
  package tests shared generated `dist` output. The affected packed MCP test
  passed alone, and the complete serial suite passed. This test-infrastructure
  race is recorded separately and does not alter product runtime behavior.

## Next Goal

**Public Git History Personal-Identifier Remediation Maintainer Decision Recording v0.1**

The next Goal records the maintainer's explicit choice and evidence. It does
not execute recovery, rewrite history, replace the repository, contact anyone,
or change release state.
