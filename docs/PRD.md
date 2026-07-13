# RepoAssure PRD Gateway

Status: Accepted
Owner: maintainer
Purpose: Product intent source-of-truth gateway

## Product Intent

RepoAssure is a local-first AI code acceptance and delivery assurance layer. It helps maintainers turn AI-generated repositories into reviewable, testable, repairable engineering assets.

RepoAssure is not positioned as another AI IDE, a general-purpose vulnerability scanner, or a default target-repo auto-fix bot.

## Current Product Scope

- Local CLI, MCP Server, and GitHub Action wrapper for repo acceptance, including the bounded blocked-goal recovery MCP lifecycle.
- Browser and Python/CLI acceptance modes.
- Local hardening reports, repair plans, repair task packages, handoff packages, execution evidence, patch plans, validation campaign summaries, AI IDE repair evidence bundles, AI IDE Repair Evidence Bundle Consumer Contract v0.1 outputs, replay readiness outputs, Target Repo Repair Goal Proposal Package v0.1 outputs, Target Repo Repair Goal Authorization Receipt v0.1 outputs, Authorized Target Repo Repair Goal Task Package v0.1 outputs, Target Repo Repair Goal Execution Evidence Intake v0.1 outputs, Target Repair Evidence Review Decision Package v0.1 outputs, Blocked Goal Recovery Package v0.1 outputs, Blocked Goal Recovery Consumption Validation v0.1 outputs, Blocked Goal Recovery Resume Attempt Closure Receipt v0.1 outputs, and full lifecycle recovery campaign summaries.
- Public website and private-preview release readiness surfaces.
- Open-core local artifact contract with Team Cloud and Enterprise as future commercial roadmap surfaces.
- Repeatable standard parallel test evidence for package-owned CLI, MCP, and acceptance runtime consumption.

## Current Non-Goals

- No default target repo mutation.
- No automatic target repo branch, commit, pull request, issue, advisory, or file mutation.
- No target repo source upload by default.
- No npm publication, GitHub release, public launch, customer contact, pricing/spend change, or commercial availability claim without a separate authorization goal.

## Parallel Test Runtime Reliability

RepoAssure must provide repeatable standard parallel test evidence before an installed AI IDE is accepted as a real MCP consumer. A clean checkout must build required runtime outputs before test collection, and parallel playbook/recovery subprocesses must not observe a partially rewritten acceptance package. Local build coordination is engineering evidence only and does not authorize recovery command execution, target repo mutation, release, launch, or hosted/commercial availability.

## Governing Product Sources

- `docs/product/specs/mvp-spec-v0.3.md`
- `docs/product/specs/team-cloud-enterprise-spec-v0.1.md`
- `docs/product/specs/public-website-spec-v0.1.md`
- `docs/product/specs/project-intelligence-console-spec-v0.1.md`
- `docs/product/strategy/commercialization-strategy-v0.1.md`
- `docs/product/strategy/open-core-packaging-spec-v0.1.md`
- `docs/product/research/global-competitive-landscape-2026-07-05.md`
- `docs/product/research/market-sizing-tam-sam-som-2026-07-05.md`

## Related ADRs

- ADR-0009: Commercialization and licensing strategy.
- ADR-0010: RepoAssure brand positioning.
- ADR-0014: Distribution and repair loop readiness.
- ADR-0016: Team Cloud and Enterprise commercial edition boundary.
- ADR-0017: Public website and internal Project Intelligence Console.
- ADR-0024: Autopilot-compatible documentation architecture.
- ADR-0025: AI IDE repair evidence bundle consumer contract.
- ADR-0028: Target repo repair goal proposal package.
- ADR-0029: Target repo repair goal authorization receipt.
- ADR-0030: Authorized target repo repair goal task package.
- ADR-0031: Target repo repair goal execution evidence intake.
- ADR-0032: Target repair evidence review decision package.
- ADR-0033: Blocked goal recovery package.
- ADR-0034: Blocked goal recovery consumption contract.
## AI IDE Repair Execution Replay Readiness v0.1

RepoAssure must let a maintainer or AI IDE replay-check repair evidence before opening a target-repo repair goal. The v0.1 product requirement is a local `playbook:replay` workflow that reads the AI IDE repair evidence consumer contract and emits JSON/Markdown readiness evidence covering artifact replay, verification replay, boundary replay, and the next maintainer review decision.

## AI IDE Repair Replay Real Campaign Validation v0.1

RepoAssure must validate the complete AI IDE repair evidence chain on a real-campaign-shaped fixture before treating replay readiness as usable product evidence. The validation requirement is bundle -> contract -> replay coverage from the existing campaign fixture, including blocked-action enforcement, redaction boundary handling, and maintainer review readiness.

## Target Repo Repair Goal Proposal Package v0.1

RepoAssure must let a maintainer or AI IDE convert replay readiness into a local target repo repair goal proposal package before any actual target repo repair goal is authorized. The v0.1 product requirement is a local `playbook:proposal` workflow that emits JSON/Markdown evidence with allowed repair scope, prerequisites, artifact read order, repair task breakdown, verification commands, maintainer approval boundary, and non-authorization boundary.

## Target Repo Repair Goal Authorization Receipt v0.1

RepoAssure must let a maintainer record approve / reject / defer / accept risk decisions against a local target repo repair goal proposal package before any separate target repo repair goal starts. The v0.1 product requirement is a local `playbook:authorize` workflow that emits JSON/Markdown evidence with proposal provenance, decision summary, approved scope, rejected/deferred/risk-accepted items, verification requirements, maintainer approval boundary, and non-authorization boundary.

## Authorized Target Repo Repair Goal Task Package v0.1

RepoAssure must let a maintainer or AI IDE consume an authorization receipt as a concrete task package for a later separate target repo repair goal. The v0.1 product requirement is a local `playbook:target-repair-goal` workflow that emits JSON/Markdown evidence with source authorization provenance, approved repair goals, excluded rejected/deferred/risk-accepted items, repair goal instructions, verification checklist, maintainer review boundary, redaction boundary, non-authorization boundary, and blocked actions.

## Target Repo Repair Goal Execution Evidence Intake v0.1

RepoAssure must let a maintainer or AI IDE import execution evidence returned by a separately authorized target repo repair goal. The v0.1 product requirement is a local `playbook:target-repair-evidence` workflow that emits JSON/Markdown evidence with source task package provenance, actual mutation summary, verification results, blocked or failed outcomes, boundary evidence, maintainer review checklist, redaction boundary, non-authorization boundary, and blocked actions.

## Target Repair Evidence Review Decision Package v0.1

RepoAssure must let a maintainer record review decisions over imported target repair evidence before treating the evidence as accepted. The v0.1 product requirement is a local `playbook:target-repair-review` workflow that emits JSON/Markdown evidence with source intake report provenance, per-goal accept / changes_requested / defer / accept_risk decisions, accepted evidence scope, change-requested items, deferred items, risk-accepted items, next repair goal recommendations, maintainer review boundary, redaction boundary, non-authorization boundary, and blocked actions.

## Blocked Goal Recovery Package v0.1

RepoAssure must let a maintainer or AI IDE convert blocked, incomplete, deferred, or retryable goal states into a local recovery package before resuming work. The v0.1 product requirement is a local `goal:recover` workflow that emits JSON/Markdown evidence with source goal, audit, and log provenance; blocker classification; attempted actions; evidence refs; automatic recovery actions; maintainer decision requests; external prerequisites; resume commands; redaction boundary; non-authorization boundary; and blocked actions.

The package is recovery evidence only. It must not upload target repo material, mutate target repo files, create branch/commit/pull request/issue/advisory, publish, launch, contact customers, change pricing/spend, or claim SaaS, Team Cloud, Enterprise, commercial, or hosted dashboard availability.

## Blocked Goal Recovery Consumption Validation v0.1

RepoAssure must let a maintainer or AI IDE consume `blocked-goal-recovery-package.json` without guessing which evidence to read, which recovery actions are automatic retry candidates, which decisions require maintainer input, or which external prerequisites remain unresolved.

The local `goal:recover:consume` workflow emits JSON and Markdown with resume readiness, evidence read order, a recovery action queue, resume checklist, boundary compliance, maintainer review boundary, redaction boundary, non-authorization boundary, and blocked actions. The report does not execute recovery commands and does not authorize target repo mutation, release, launch, customer contact, pricing/spend, or commercial/hosted availability claims.

## Blocked Goal Recovery Decision Receipt v0.1

RepoAssure must let a maintainer record `approve`, `reject`, `defer`, or `accept_risk` decisions for every stable recovery `actionKey` and stable resume `commandId` before any separate resume attempt. The decisions envelope must bind to the exact source report SHA-256. The local `goal:recover:decide` workflow emits JSON/Markdown with raw consumption-report provenance, decision summary, reviewed and unreviewed action/command items, external prerequisite completion evidence, separate-resume readiness, redaction boundary, non-authorization boundary, and blocked actions.

The receipt does not execute recovery commands and does not authorize target repo mutation, release, launch, customer contact, pricing/spend, repository visibility changes, or commercial/hosted availability claims.

## Blocked Goal Recovery Resume Attempt Task Package v0.1

RepoAssure must convert a ready recovery decision receipt into a bounded local task package that an AI IDE can consume without guessing scope. The package must bind to the exact receipt bytes, include only approved or explicitly risk-accepted actions and resume commands, preserve source evidence and order, and expose prerequisites plus a verification checklist.

Non-ready or boundary-invalid receipts must produce no executable scope. The package does not execute recovery commands and does not authorize target repo mutation, release, launch, customer contact, pricing/spend, repository visibility changes, or commercial/hosted availability claims. Execution evidence is deferred to Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1.

## Blocked Goal Recovery Resume Attempt Execution Evidence Intake v0.1

RepoAssure must import sanitized evidence from a separately executed resume attempt, bind it to the exact task package, and distinguish complete, failed/blocked, incomplete, boundary-violating, and source-not-ready outcomes. Complete evidence is only ready for maintainer review; it is not accepted automatically. The intake does not execute commands or authorize external actions.

## Blocked Goal Recovery Resume Attempt Evidence Review Decision Package v0.1

RepoAssure must let a maintainer explicitly accept, request changes, defer, or accept risk for each imported action, command, and verification result. Decisions bind to exact intake bytes. Boundary-violating evidence cannot be accepted. The package does not execute commands, close the source goal, or authorize external actions.

## Blocked Goal Recovery Resume Attempt Closure Receipt v0.1

RepoAssure must convert only an accepted or accepted-with-risk evidence review package into an exact-source-bound local closure receipt. Accepted risks must remain explicit and be acknowledged by evidence key. The receipt does not execute commands, close an external goal, or authorize external actions.

## Blocked Goal Recovery Full Lifecycle Real Campaign Validation v0.1

RepoAssure must validate accepted, accepted-risk, blocked, failed, incomplete, environment-blocked, boundary-violating, and tampered recovery chains from local artifacts. The summary must derive outcomes from schemas, hashes, and boundary evidence rather than trusting self-reported pass flags. It does not execute commands or authorize external actions.

## Blocked Goal Recovery MCP Surface v0.1

RepoAssure must let AI IDE clients discover and call every blocked-goal recovery evidence stage over MCP without shell-specific orchestration. The product requirement is eight explicit tools with strict directory-only inputs, typed `repoassure.mcp-blocked-goal-recovery-tool-result.v1` responses, contained local outputs, client-readable redacted errors, and explicit proof that no commands, external state changes, or target repo mutations were performed by RepoAssure.

## Blocked Goal Recovery MCP Real Client Consumption Validation v0.1

The official SDK `Client` and `StdioClientTransport` must discover and consume the recovery surface through a compiled child process. Success content must satisfy the advertised schema; tool failures must remain readable without invalid `structuredContent`; startup failure, timeout, stderr redaction, and child cleanup must be deterministic. The validation does not execute recovery commands or authorize target repo or external-state changes.

## Blocked Goal Recovery MCP External AI IDE Configuration Validation v0.1

RepoAssure must generate copy-pasteable Cursor, VS Code, and Codex local stdio configurations that point to the user-facing `apps/mcp-server/index.js` entry with absolute argv-safe paths. Automated acceptance must consume every generated envelope from a repository-external workspace, discover all eight recovery tools, prove the SDK harness does not serialize or forward an unrelated test secret, enforce deterministic cleanup, and remain non-writing and non-executing for client settings, recovery commands, target repositories, and external state. Actual IDE environment inheritance is a manual acceptance item, not an automated claim.
