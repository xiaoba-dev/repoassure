# RepoAssure PRD Gateway

Status: Accepted
Owner: maintainer
Purpose: Product intent source-of-truth gateway

## Product Intent

RepoAssure is a local-first AI code acceptance and delivery assurance layer. It helps maintainers turn AI-generated repositories into reviewable, testable, repairable engineering assets.

RepoAssure is not positioned as another AI IDE, a general-purpose vulnerability scanner, or a default target-repo auto-fix bot.

## Current Product Scope

- Local CLI, MCP Server, and GitHub Action wrapper for repo acceptance.
- Browser and Python/CLI acceptance modes.
- Local hardening reports, repair plans, repair task packages, handoff packages, execution evidence, patch plans, validation campaign summaries, AI IDE repair evidence bundles, AI IDE Repair Evidence Bundle Consumer Contract v0.1 outputs, replay readiness outputs, Target Repo Repair Goal Proposal Package v0.1 outputs, Target Repo Repair Goal Authorization Receipt v0.1 outputs, Authorized Target Repo Repair Goal Task Package v0.1 outputs, Target Repo Repair Goal Execution Evidence Intake v0.1 outputs, and Target Repair Evidence Review Decision Package v0.1 outputs.
- Public website and private-preview release readiness surfaces.
- Open-core local artifact contract with Team Cloud and Enterprise as future commercial roadmap surfaces.

## Current Non-Goals

- No default target repo mutation.
- No automatic target repo branch, commit, pull request, issue, advisory, or file mutation.
- No target repo source upload by default.
- No npm publication, GitHub release, public launch, customer contact, pricing/spend change, or commercial availability claim without a separate authorization goal.

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
