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

The schema is `repoassure.blocked-goal-recovery-decision-receipt.v1`. Required sections are `decisionStatus`, `resumeAttemptReadiness`, `sourceConsumptionReport`, `decisionSummary`, `decisionItems`, approved/rejected/deferred/risk-accepted action sets, `resumeCommandDecisionItems`, `boundaryCompliance`, `maintainerReviewBoundary`, `redactionBoundary`, `nonAuthorizationBoundary`, and `blockedActions`. Source SHA-256 hashes raw file bytes and the builder verifies those bytes match the consumed object. Duplicate, malformed, or unknown action/command IDs are invalid; missing decisions remain unreviewed. Allowed decisions are preserved structurally, external approval requires explicit completion evidence, rejection takes precedence over missing decisions, and every resume command requires command-level review. The receipt does not execute resume commands.
