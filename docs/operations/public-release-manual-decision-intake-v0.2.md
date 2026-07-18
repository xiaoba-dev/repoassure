# Public Release Manual Decision Intake v0.2

Status: decisions_recorded_release_execution_blocked
Date: 2026-07-01

## Purpose

This record captures explicit maintainer decisions for the public release manual gates after Public Release Manual Decision Input Completion v0.1.

The maintainer supplied decisions for all seven gates in conversation. This record preserves those decisions, the evidence used for interpretation, and the release boundary. Public release remains no-go because the branch protection or equivalent repository ruleset gate is deferred.

## Decision Summary

| Gate | Decision value | Evidence | Decision date | Notes | Scope |
| --- | --- | --- | --- | --- | --- |
| Legal review | approve | Maintainer response: "允许". Existing readiness materials: `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `README.md`, public release notes draft, and `pnpm release:check`. | 2026-07-01 | Maintainer allows the legal-review gate for current readiness materials. This is a maintainer decision record, not external legal advice. | Current public source readiness materials only; does not cover future SaaS, Team Cloud, Enterprise, hosted dashboard, customer logos, case studies, or trademark filing. |
| Trademark/name review | accept risk | Maintainer response: "接受". Existing brand materials: ADR-0010, competitive landscape, `repoassure.com`, README, and website copy. | 2026-07-01 | Maintainer accepts current RepoAssure naming risk. This is not professional trademark clearance. | RepoAssure project/repository/domain naming risk for the current release-readiness phase only. |
| Branch protection or equivalent repository ruleset | defer | Maintainer response: "批准；若是批准前提不成立，回退到暂缓". Current evidence: repository remains `PRIVATE`; Branch protection API: `HTTP 403`; Repository rulesets API: `HTTP 403`. | 2026-07-01 | Decision interpreted as conditional approve fallback defer. The approve condition is not satisfied because GitHub private repo branch protection/rulesets remain unavailable under the active plan. | Defer until GitHub plan allows branch protection/rulesets, or until maintainer explicitly approves an equivalent release control with scope and risk acceptance. |
| Final maintainer publication authorization | approve | Maintainer response: "授权". | 2026-07-01 | Final maintainer publication authorization is recorded, but release execution is blocked by the deferred branch protection gate. This approval does not override unresolved/deferred gates. | Future public source release execution only after all blocking gates are closed or explicitly risk-accepted; does not authorize npm publish, SaaS/Team Cloud/Enterprise availability claims, hosted dashboard claims, customer logos, or case studies. |
| Private preview reviewer feedback decision | accept risk | Maintainer response: "接受“暂不等待反馈”继续推进". | 2026-07-01 | Maintainer accepts proceeding without waiting for external private preview feedback. | Current public source readiness path only; future feedback should still be triaged when received. |
| Dependency/license risk confirmation | accept risk | Maintainer response: "接受". Evidence: dependency license audit, `LICENSE`, package license metadata, and `pnpm release:check`. | 2026-07-01 | Maintainer accepts current dependency/license risk based on readiness evidence. | Current dependency graph and release-readiness materials; future dependency changes require recheck. |
| Secret/customer data exposure confirmation | approve | Maintainer requested verification. Evidence: `pnpm repo:hygiene` passed; `pnpm release:check` passed; scoped sensitive account scan found no matching real reviewer/maintainer email or QQ patterns in tracked release materials. | 2026-07-01 | Approved based on automated verification of tracked/release materials. Current local uncommitted website changes are not treated as released materials and require recheck before inclusion. | Tracked repository materials at the time of this intake; future commits, generated artifacts, target repo evidence, or uncommitted website changes require recheck. |

## Branch Protection Decision Interpretation

The branch protection decision is recorded as conditional approve fallback defer:

- Conditional approval was provided by the maintainer.
- The approval condition is not satisfied.
- Current repository visibility: `PRIVATE`.
- Branch protection API: `HTTP 403`.
- Repository rulesets API: `HTTP 403`.
- GitHub response: `Upgrade to GitHub Pro or make this repository public to enable this feature.`

The repository must not be made public only to unlock branch protection. Therefore this gate is `defer`.

## Current Verification Evidence

- `gh repo view xiaoba-dev/repoassure --json nameWithOwner,visibility,isPrivate,defaultBranchRef,url`: repository remains `PRIVATE`.
- `gh api repos/xiaoba-dev/repoassure/branches/main/protection`: `HTTP 403`.
- `gh api repos/xiaoba-dev/repoassure/rulesets`: `HTTP 403`.
- Latest CI run: `28487805085` / `RepoAssure CI` / `success`.
- `pnpm repo:hygiene`: passed.
- `pnpm release:check`: passed automated readiness checks and reported `public release ready: no`.
- Scoped sensitive account scan for previously supplied real reviewer/maintainer email and QQ patterns: no matches in tracked release materials.

## Release Boundary

Current release boundary: public release remains no-go.

Public Source Release Execution v0.1 remains blocked because branch protection or equivalent repository ruleset is deferred.

Final maintainer publication authorization is recorded, but it does not override the deferred branch protection gate.

## Non-Authorization Boundary

- No repository visibility change was authorized.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public launch or production marketing announcement was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
- No external customer logo or case study use was authorized.

## Next Step

The next actionable goal is Public Release Manual Decision Input Review v0.2. That review should validate these decisions, confirm the deferred branch protection gate remains blocking, and determine whether the maintainer wants to keep deferring or define an explicit equivalent release control.
