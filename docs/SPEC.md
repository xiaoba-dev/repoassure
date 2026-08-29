# RepoAssure SPEC Gateway

Status: Accepted
Owner: maintainer
Purpose: Solution and implementation boundary source-of-truth gateway

## Solution Boundary

RepoAssure's open core is a local-first artifact generation and repair-evidence system exposed through CLI, MCP Server, and GitHub Action workflows.

Implementation should preserve compatibility paths while continuing the phased monorepo migration toward package-owned modules.

## Current Implementation Surfaces

- CLI and MCP adapters.
- Shared tool wrappers and domain modules.
- `@hardening-mcp/acceptance`
- `@hardening-mcp/shared`
- `@hardening-mcp/security-assurance`
- `@hardening-mcp/browser-explorer`
- `@hardening-mcp/repair-planner`
- Public website app.
- Local-only generated artifacts and acceptance records.
- `playbook:contract` for AI IDE repair evidence consumer contracts.
- `playbook:proposal` for target repo repair goal proposal packages.
- `playbook:authorize` for target repo repair goal authorization receipts.
- `playbook:target-repair-goal` for authorized target repo repair goal task packages.
- `playbook:target-repair-evidence` for target repo repair goal execution evidence intake reports.
- `playbook:target-repair-review` for target repair evidence review decision packages.
- `goal:recover` for blocked goal recovery packages.
- `goal:recover:consume` for blocked goal recovery consumption reports.

## Current Architecture Boundaries

- Local-first execution by default.
- No target repo source upload by default.
- Generated artifacts are evidence and handoff material, not automatic execution authorization.
- Hosted dashboard, Team Cloud, Enterprise governance, and integrations remain roadmap surfaces until separately implemented.

## Parallel Test Runtime Build Isolation v0.1

The standard full-suite contract uses an acceptance build single-flight boundary. `pnpm test` must prebuild package-owned and root runtime outputs before four-worker file-parallel Vitest collection. Every nested `build:acceptance` call computes the same source/configuration/build-implementation fingerprint, coordinates through a complete lease-token lock published by atomic same-filesystem hard link, and reuses only a state written after every expected JavaScript, declaration, and source-map output exists.

Fingerprint changes must rebuild. The coordinator must invalidate prior success before rebuilding; normal failure, partial output, and owner-process exit must not leave reusable success state. Orphan recovery must atomically quarantine the old lock, malformed lock content must fail closed, and only the matching lease token may release a live lock. The cache remains under `node_modules/.cache/repoassure`; it is not a distributable artifact or acceptance evidence.

## Governing Specification Sources

- `docs/architecture/overview.md`
- `docs/architecture/specs/monorepo-structure-spec-v0.1.md`
- `docs/architecture/specs/docs-taxonomy-spec-v0.1.md`
- `docs/architecture/specs/private-github-engineering-baseline-v0.1.md`
- `docs/architecture/specs/security-assurance-lane-spec-v0.1.md`
- `docs/architecture/specs/team-cloud-enterprise-architecture-v0.1.md`
- `docs/architecture/specs/project-intelligence-console-architecture-v0.1.md`
- `docs/product/specs/mvp-spec-v0.3.md`

## Related ADRs

- ADR-0001 through ADR-0008 for local-first, CLI/MCP, artifact, repair-plan, monorepo, package-build, taxonomy, and repository acceptance scope.
- ADR-0013 for Security Assurance Lane.
- ADR-0014 for distribution and repair loop readiness.
- ADR-0024 for Autopilot-compatible documentation architecture.
- ADR-0025 for AI IDE repair evidence bundle consumer contract.
- ADR-0028 for target repo repair goal proposal package.
- ADR-0029 for target repo repair goal authorization receipt.
- ADR-0030 for authorized target repo repair goal task package.
- ADR-0031 for target repo repair goal execution evidence intake.
- ADR-0032 for target repair evidence review decision package.
- ADR-0033 for blocked goal recovery package.
- ADR-0034 for blocked goal recovery consumption contract.
## AI IDE Repair Execution Replay Readiness v0.1

`pnpm playbook:replay -- --from-dir <dir>` reads `ai-ide-repair-evidence-consumer-contract.json` and writes `ai-ide-repair-execution-replay-readiness.json` / `.md`.

The schema is `repoassure.ai-ide-repair-execution-replay-readiness.v1`. Required sections are `sourceConsumerContract`, `artifactReplay`, `verificationReplay`, `boundaryReplay`, `nextReviewDecision`, `blockedActions`, and inherited review/redaction/non-authorization boundaries.

## AI IDE Repair Replay Real Campaign Validation v0.1

The E2E fixture validates `campaign-summary -> playbook -> consume -> decide -> approve -> plan-approved -> evidence -> bundle -> contract -> replay`.

The real campaign validation must assert bundle -> contract -> replay artifact generation, `ready_for_maintainer_replay_review`, blocked action enforcement, Markdown readability, redaction of secret-like path material, and non-authorization boundaries.

## Target Repo Repair Goal Proposal Package v0.1

`pnpm playbook:proposal -- --from-dir <dir>` reads `ai-ide-repair-execution-replay-readiness.json` and writes `ai-ide-target-repo-repair-goal-proposal-package.json` / `.md`.

The schema is `repoassure.ai-ide-target-repo-repair-goal-proposal-package.v1`. Required sections are `proposalReadiness`, `sourceReplayReadiness`, `prerequisites`, `artifactReadOrder`, `allowedRepairScope`, `repairTaskBreakdown`, `verificationCommands`, `maintainerApprovalBoundary`, `nonAuthorizationBoundary`, `redactionBoundary`, and `blockedActions`.

## Target Repo Repair Goal Authorization Receipt v0.1

`pnpm playbook:authorize -- --from-dir <dir> --decisions <authorization-decisions.json>` reads `ai-ide-target-repo-repair-goal-proposal-package.json` and maintainer decision input, then writes `ai-ide-target-repo-repair-goal-authorization-receipt.json` / `.md`.

The schema is `repoassure.ai-ide-target-repo-repair-goal-authorization-receipt.v1`. Required sections are `authorizationStatus`, `sourceProposalPackage`, `decisionSummary`, `authorizationItems`, `approvedScope`, `rejectedItems`, `deferredItems`, `riskAcceptedItems`, `verificationRequirements`, `maintainerApprovalBoundary`, `nonAuthorizationBoundary`, `redactionBoundary`, and `blockedActions`.

## Authorized Target Repo Repair Goal Task Package v0.1

`pnpm playbook:target-repair-goal -- --from-dir <dir>` reads `ai-ide-target-repo-repair-goal-authorization-receipt.json` and writes `ai-ide-authorized-target-repo-repair-goal-task-package.json` / `.md`.

The schema is `repoassure.ai-ide-authorized-target-repo-repair-goal-task-package.v1`. Required sections are `taskPackageStatus`, `sourceAuthorizationReceipt`, `approvedRepairGoals`, `excludedAuthorizationItems`, `verificationChecklist`, `maintainerReviewBoundary`, `nonAuthorizationBoundary`, `redactionBoundary`, and `blockedActions`.

## Target Repo Repair Goal Execution Evidence Intake v0.1

`pnpm playbook:target-repair-evidence -- --from-dir <dir>` reads `ai-ide-authorized-target-repo-repair-goal-task-package.json` and `target-repo-repair-goal-execution-evidence-input.json`, then writes `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json` / `.md`.

The schema is `repoassure.ai-ide-target-repo-repair-goal-execution-evidence-intake-report.v1`. Required sections are `intakeStatus`, `sourceTaskPackage`, `executionSummary`, `goalReports`, `boundaryReport`, `reviewChecklist`, `maintainerReviewBoundary`, `nonAuthorizationBoundary`, `redactionBoundary`, and `blockedActions`.

## Target Repair Evidence Review Decision Package v0.1

`pnpm playbook:target-repair-review -- --from-dir <dir>` reads `ai-ide-target-repo-repair-goal-execution-evidence-intake-report.json` and `target-repair-evidence-review-decisions.json`, then writes `ai-ide-target-repair-evidence-review-decision-package.json` / `.md`.

The schema is `repoassure.ai-ide-target-repair-evidence-review-decision-package.v1`. Required sections are `reviewStatus`, `sourceIntakeReport`, `decisionSummary`, `reviewItems`, `acceptedEvidenceScope`, `changeRequestedItems`, `deferredItems`, `riskAcceptedItems`, `nextRepairGoalRecommendations`, `maintainerReviewBoundary`, `nonAuthorizationBoundary`, `redactionBoundary`, and `blockedActions`.

## Blocked Goal Recovery Package v0.1

`pnpm goal:recover -- --from-dir <dir>` reads `blocked-goal-recovery-input.json`, then writes `blocked-goal-recovery-package.json` / `.md`.

The schema is `repoassure.blocked-goal-recovery-package.v1`. Required sections are `recoveryStatus`, `sourceProvenance`, `blockerSummary`, `blockers`, `automaticRecoveryActions`, `maintainerDecisionRequests`, `externalPrerequisites`, `resumeCommands`, `maintainerReviewBoundary`, `nonAuthorizationBoundary`, `redactionBoundary`, and `blockedActions`.

The package supports blocker categories `environment`, `external_service`, `authorization_required`, `maintainer_decision_required`, `technical_unknown`, `test_instability`, `security_or_compliance`, and `product_scope`; blocker statuses `blocked`, `incomplete`, `deferred`, and `retryable`; and recovery statuses `ready_to_resume`, `retryable_with_automatic_actions`, and `requires_maintainer_or_external_action`.

## Blocked Goal Recovery Consumption Validation v0.1

`pnpm --silent goal:recover:consume -- --from-dir <dir>` reads `blocked-goal-recovery-package.json` and writes `blocked-goal-recovery-consumption-report.json` / `.md`. Silent package-manager output prevents the lifecycle runner from echoing sensitive argv before the CLI applies redaction.

The schema is `repoassure.blocked-goal-recovery-consumption-report.v1`. Required sections are `sourceRecoveryPackage`, `resumeReadiness`, `evidenceReadOrder`, `actionQueue`, `resumeChecklist`, `resumeCommands`, `boundaryCompliance`, `maintainerReviewBoundary`, `redactionBoundary`, `nonAuthorizationBoundary`, and `blockedActions`. `sourceRecoveryPackage.sha256` hashes the raw source file bytes.

The action queue classifies `automatic_retry_candidate`, `maintainer_decision_required`, and `external_prerequisite_required` items. Resume readiness is derived from normalized blocker evidence rather than trusted from a status flag, and `blockedActionsPreserved` requires the complete recovery-package non-authorization set. The report records `recoveryCommandsExecuted: false`; it does not execute recovery commands or authorize external actions.

## Blocked Goal Recovery Decision Receipt v0.1

`pnpm --silent goal:recover:decide -- --from-dir <dir>` reads `blocked-goal-recovery-consumption-report.json` and `blocked-goal-recovery-decisions.json`, then writes `blocked-goal-recovery-decision-receipt.json` / `.md`.

The schema is `repoassure.blocked-goal-recovery-decision-receipt.v1`. Required sections are `decisionStatus`, `resumeAttemptReadiness`, `sourceConsumptionReport`, `decisionSummary`, `decisionItems`, approved/rejected/deferred/risk-accepted action sets, `resumeCommandDecisionItems`, `boundaryCompliance`, `maintainerReviewBoundary`, `redactionBoundary`, `nonAuthorizationBoundary`, and `blockedActions`. Decision input must declare `sourceConsumptionReportSha256`, binding it to the exact raw report bytes; the builder also verifies those bytes match the consumed object. Duplicate, malformed, or unknown action/command IDs are invalid; missing decisions remain unreviewed. Allowed decisions are preserved structurally and validated by action type, external approval requires explicit completion evidence, rejection takes precedence over missing commands or decisions, and every resume command requires command-level review. The receipt does not execute resume commands.

## Blocked Goal Recovery Resume Attempt Task Package v0.1

`pnpm --silent goal:recover:prepare-resume -- --from-dir <dir>` reads `blocked-goal-recovery-decision-receipt.json` and writes `blocked-goal-recovery-resume-attempt-task-package.json` / `.md`.

The schema is `repoassure.blocked-goal-recovery-resume-attempt-task-package.v1`. Required sections are `taskPackageStatus`, `sourceDecisionReceipt`, `blockedReasons`, `actionTasks`, `resumeCommandTasks`, `prerequisites`, `verificationChecklist`, `excludedItems`, `boundaryCompliance`, `maintainerReviewBoundary`, `redactionBoundary`, `nonAuthorizationBoundary`, and `blockedActions`. The source receipt is fully runtime-validated and bound by a SHA-256 of its exact bytes; `blocked-goal-recovery-resume-attempt-task-input.json` must independently declare the same reviewed SHA before directory-mode generation. Only approve/accept-risk scope is emitted; any non-ready outcome emits empty task arrays. Commands remain `executed: false`, and the generator does not execute them.

## Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1

`pnpm --silent goal:recover:intake-resume-evidence -- --from-dir <dir>` reads the task package and execution evidence input, then writes `blocked-goal-recovery-resume-attempt-execution-evidence-intake.json` / `.md`. Schema `repoassure.blocked-goal-recovery-resume-attempt-execution-evidence-intake.v1` requires exact source SHA, attempt metadata, action/command/verification results, unresolved task IDs, boundary compliance, review checklist, maintainer review boundary, redaction boundary, non-authorization boundary, and blocked actions. The intake validates IDs and evidence but does not execute commands or accept results.

## Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1

`pnpm --silent goal:recover:review-resume-evidence -- --from-dir <dir>` reads the original resume-attempt task package, execution evidence intake, and review decisions, then writes JSON/Markdown schema `repoassure.blocked-goal-recovery-resume-attempt-evidence-review-decision-package.v1`. It revalidates the exact task package SHA-256 and complete typed action/command/verification inventory before applying exact-intake-bound decisions. It requires stable evidence keys, per-item decisions, decision summary, accepted/unresolved scope, boundary compliance, review and non-authorization boundaries, and blocked actions. It does not execute commands or close a goal.

## Blocked Goal Recovery Resume Attempt Closure Receipt v0.1

`pnpm --silent goal:recover:close-resume-attempt -- --from-dir <dir>` reads the exact task package, execution evidence intake, evidence review decision package, and `blocked-goal-recovery-resume-attempt-closure-input.json`, then writes `blocked-goal-recovery-resume-attempt-closure-receipt.json` / `.md`. It revalidates task-to-intake SHA/inventory binding and intake-to-review SHA/evidence-field binding before closure. Schema `repoassure.blocked-goal-recovery-resume-attempt-closure-receipt.v1` requires raw-byte source SHA, accepted closure status, closed evidence scope, exact accepted-risk acknowledgement, residual risks, verification summary, boundary compliance, review/redaction/non-authorization boundaries, and blocked actions. It does not execute commands or close an external goal.

## Blocked Goal Recovery Full Lifecycle Real Campaign Validation v0.1

`pnpm --silent goal:recover:validate-lifecycle -- --from-dir <campaign-dir>` reads `blocked-goal-recovery-lifecycle-campaign-input.json` plus local relative artifact directories and writes `blocked-goal-recovery-lifecycle-campaign-summary.json` / `.md`. Schema `repoassure.blocked-goal-recovery-lifecycle-campaign-summary.v1` records outcome coverage, per-scenario expected/actual outcome, terminal stage, trust-chain status, boundary/redaction status, non-execution flags, and artifact-name/SHA evidence. Normal malformed scenarios fail; `rejected_tampered` passes only when tampering is rejected.

## MCP Product Tool Surface v0.1

`src/adapters/mcp/tool-registry.ts` advertises exactly eleven product tools: `analyze_repo`, `boot_app`, `stop_app`, `explore_app`, `generate_tests`, `generate_repair_plan`, `prepare_repair_handoff`, `preview_repair_execution`, `generate_repair_patch_plan`, `harden_report`, and `run_hardening`. The server's `instructions` string describes that surface and states that the tools do not modify target repository source or apply repair patches.

The blocked-goal recovery lifecycle is not exposed over MCP. Its eight stage tools and the `repoassure.mcp-blocked-goal-recovery-tool-result.v1` envelope were removed with `src/adapters/mcp/blocked-goal-recovery-tools.ts` by [ADR-0044](adr/0044-blocked-goal-recovery-mcp-surface-removal.md), which supersedes ADR-0041. The lifecycle stages remain in `packages/acceptance` and are driven by the `pnpm goal:recover:*` scripts documented in `docs/operations/blocked-goal-recovery-mcp-surface-v0.1.md`; their artifact schemas are unchanged.

## Blocked Goal Recovery MCP Real Client Consumption Validation v0.1

`tests/support/real-mcp-client.ts` starts the compiled server through the official SDK `StdioClientTransport`, captures a redacted bounded stderr tail, applies bounded initialization requests, and deterministically terminates the observed child PID on normal close or failed connect. `tests/integration/mcp-real-client.test.ts` verifies the tool-independent transport contract: bounded initialization timeout, deterministic termination of the observed child PID, and SDK safe default environment inheritance. Tool discovery is asserted against the exact product tool set in `tests/integration/mcp-external-ai-ide-config.test.ts`. MCP errors omit `structuredContent` so success-only output schemas do not hide client-readable failures.

## Blocked Goal Recovery MCP External AI IDE Configuration Validation v0.1

`src/adapters/mcp/client-config.ts` owns strict Cursor JSON, VS Code JSON, and Codex TOML rendering. `scripts/generate-mcp-client-config.mjs` accepts only `--client` and optional absolute `--repo-root`, dynamically loads built modules inside a fixed pre-build error boundary, checks both the app shell and compiled server entry, and writes only configuration to stdout. Every configuration uses the current absolute Node.js executable and `apps/mcp-server/index.js` as a separate argv value. `tests/integration/mcp-external-ai-ide-config.test.ts` generates and consumes all three envelopes from an external cwd and a path-with-spaces source-checkout alias through the official SDK client. The SDK harness uses its safe default environment, while actual IDE inheritance remains a manual gate. The generator does not write client configuration, and validation does not execute recovery or resume commands or change external state.

## Blocked Goal Recovery MCP Real AI IDE Manual Acceptance v0.1

`docs/operations/blocked-goal-recovery-mcp-real-ai-ide-manual-acceptance-v0.1.md` defines a maintainer-only acceptance gate for one installed Cursor, VS Code, or Codex client. The client must list exactly the product tools advertised by the registry with no `blocked_goal` tool present, and call only `analyze_repo` against a disposable throwaway directory. The call must write only `.hardening/run/repo-profile.json` inside that directory and leave the source checkout unchanged; the resulting evidence record is redacted and requires an explicit maintainer decision. This gate neither writes client settings nor applies a repair patch. The dated 2026-07-14 acceptance exercised the retired recovery MCP surface and is preserved as history rather than as acceptance of the current surface.

## Public release state reconciliation

RepoAssure's source repository may be public while npm publication, GitHub releases, public launch, customer outreach, and commercial or hosted availability claims remain independently unauthorized. Release-state documents must distinguish historical gate snapshots from current read-only repository evidence, and must not treat a documentation reconciliation as an external release action.
