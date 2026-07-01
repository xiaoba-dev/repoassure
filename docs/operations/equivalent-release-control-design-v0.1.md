# Equivalent Release Control Design v0.1

Status: designed_not_executed
Date: 2026-07-01
Source ADR: [ADR-0022](../adr/0022-equivalent-release-control.md)

## Purpose

Define an equivalent release control candidate for the branch protection or repository ruleset gate while the GitHub private repo plan blocks native enforcement.

This design does not execute or close the control. public release remains no-go until a future closure goal executes the evidence package and records explicit maintainer approval.

## Control Summary

The equivalent release control is a manual release gate for a specific commit. It can only be used when GitHub branch protection or repository rulesets remain unavailable for the private repository.

Do not make the repository public only to unlock branch protection.

## Required evidence package

- Exact release commit SHA.
- Repository visibility state showing the repo remains private before release execution.
- RepoAssure CI / Quality Gates success for the exact SHA.
- local full test evidence, including elevated localhost integration tests when required.
- `pnpm build` evidence.
- `pnpm lint` evidence.
- `pnpm typecheck` evidence.
- `pnpm test` evidence.
- `pnpm repo:hygiene` evidence.
- `pnpm release:check` evidence.
- Secret/customer-data exposure scan evidence for tracked release materials.
- Diff review evidence proving no generated artifacts, private target repo evidence, reviewer PII, env files, private keys, or local logs are committed.
- Maintainer approval for equivalent control closure, including scope and residual risk acceptance.

## Closure Rules

Equivalent Release Control Closure v0.1 must be a separate goal.

That closure goal must:

1. Pin the exact release commit SHA.
2. Re-run or verify RepoAssure CI / Quality Gates for that exact SHA.
3. Re-run local quality gates and record command evidence.
4. Re-run release hygiene and sensitive-material scans.
5. Record maintainer approval for equivalent control closure.
6. Preserve the non-authorization boundary for any action not explicitly approved.

## Current Status

This control is designed but not executed.

Current blocking manual gate remains branch protection or equivalent repository ruleset.

Public Source Release Execution v0.1 remains blocked.

## Non-Authorization Boundary

- No repository visibility change was authorized.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public launch or production marketing announcement was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
- No external customer logo or case study use was authorized.

## Next Step

The next actionable goal is Equivalent Release Control Closure v0.1 if the maintainer chooses this fallback. Otherwise, keep the branch protection gate deferred until GitHub branch protection or repository rulesets can be enabled for the private repository.
