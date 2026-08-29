# RepoAssure AI IDE Repair Workflow Installed CLI Real Campaign Validation v0.1

Status: completed
Date: 2026-07-24
Conclusion: `installed_cli_real_campaign_validated_without_target_repo_writes`

## Objective

Validate the built `hardening repair` CLI as an external process against a near-real, non-private campaign fixture, without changing repair semantics or writing the target repository.

## Validation Fixture

- campaign-summary fixture: non-private
- Manifest: `fixtures/campaigns/ai-ide-repair-decision-package/manifest.json`
- Source code included in fixture: no
- Secrets included in fixture: no; secret-like strings exist only to test redaction
- Temporary target source: a generated local sentinel file outside the fixture

## External Process Workflow

The integration acceptance starts `node dist/adapters/cli/index.js` as a separate process for every stage:

1. `hardening repair handoff`
2. `hardening repair execute --dry-run`
3. `hardening repair execute --validation-only`
4. `hardening repair patch-plan`
5. `hardening repair evidence-package`

All five external process exit codes: 0.

The validation-only report intentionally contains one passed command, one failed command, and two skipped manual or environment checks. A generated failed report is valid evidence for repair planning and does not change the CLI process exit code to failure.

## Artifact Contract Evidence

| Artifact | Contract evidence |
| --- | --- |
| Repair handoff JSON / Markdown / verification plan | `repoassure.repair-handoff.v1`, repair action queue, AI IDE read order, maintainer decisions, verification commands |
| Dry-run and validation-only reports | `repoassure.repair-execution-report.v1`, deterministic task status, redacted command summaries, no-write proof |
| Patch plan JSON / Markdown | `repoassure.patch-plan.v1`, manual-review-only apply policy, recommended changes, verification checklist |
| End-to-end evidence package JSON / Markdown | `repoassure.repair-evidence-package.v1`, artifact index, repair flow, task matrix, maintainer review boundary, verification checklist |

The test also verifies that stdout is structured JSON and that every returned JSON/Markdown path is readable.

## Redaction And No-write Evidence

- `ghp_real_secret_token`, `sessionid=private`, and `TOKEN=secret` do not appear in consumed output artifacts.
- Only the expected `pnpm test -- --runInBand` and `pnpm lint` validation commands execute.
- Target source content, modification time, and target directory entries are identical before and after the workflow.
- Target repository writes: no
- Automatic patch application: no
- Branch, commit, push, pull request, or external issue creation: no
- Production code changes: no

## TDD And Test Pyramid

- Characterization RED exposed the real installed-CLI stdout contract: the root CLI returns JSON, while package-level standalone runners use Markdown summaries.
- The acceptance test was corrected to validate the actual JSON stdout contract and generated Markdown files; no production behavior change was required.
- Structure-level RED then required this operation record, completed Goal metadata, canonical cascade, and next Goal contract.
- Integration acceptance: `tests/integration/installed-cli-repair-real-campaign.test.ts`.
- Existing unit, contract, integration, package compatibility, and repository gates remain part of final verification.

## Preserved Compatibility

- `pnpm repair:*` remains available as a repository-local compatibility surface.
- Repair schemas and AI IDE read order remain unchanged.
- The MCP tool registry is unchanged.
- Runtime detector behavior, finding suppression, severity, confidence thresholds, and acceptance policy are unchanged.

## Final Verification

- External-process integration acceptance: 1/1 passed.
- Repair workflow focused suite: 6 files / 17 tests passed.
- Structure governance: 104/104 tests passed.
- `pnpm typecheck`: passed across packages, root source, and website.
- `pnpm lint`: passed.
- `pnpm repo:hygiene`: passed.
- `pnpm release:check`: automated prerequisites passed; public release correctly remains `no` because manual gates are not closed.
- `pnpm test`: the restricted sandbox produced the known four local-listener environment failures; the same command with local-listener permission passed 76 files with 1 skipped, 738 tests with 1 skipped.
- `pnpm goal:audit`: 34/35 automated checks passed; the remaining long-term MVP user-acceptance item is manual.
- `pnpm autopilot:progress:check -- --json`: 8/8 checks passed with status `consistent`.

## Next Goal

RepoAssure AI IDE Repair Workflow Packed CLI Installation Validation v0.1 will create a local package tarball, install it in an isolated temporary consumer, and validate the `hardening` bin without publishing npm or modifying a target repository.
