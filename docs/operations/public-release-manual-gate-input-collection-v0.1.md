# Public Release Manual Gate Input Collection v0.1

Status: collecting_manual_gate_inputs
Date: 2026-06-29

## Purpose

This packet collects the explicit maintainer inputs required before RepoAssure can close public release manual gates.

It follows Public Release Candidate Final Review v0.1 and the maintainer-facing public release materials audit. It does not close any gate, publish any package, change repository visibility, create a GitHub release, launch the website publicly, or authorize commercial availability claims.

Current release boundary: public release remains no-go until manual gates are explicitly closed.

Control rule: Do not record a gate as passed without explicit maintainer evidence.

## Required Maintainer Inputs

| Gate | Current status | Required maintainer input | Evidence to attach or cite |
| --- | --- | --- | --- |
| Legal review | not_provided | pass / fail / defer | Reviewer, date, reviewed files, notes |
| Trademark/name review | not_provided | pass / fail / defer | RepoAssure name and package naming review evidence |
| Branch protection or equivalent repository ruleset | not_provided | enabled / not enabled / equivalent accepted / defer | GitHub ruleset screenshot, API evidence, or explicit maintainer risk acceptance |
| Final maintainer publication authorization | not_provided | authorize / do not authorize / defer | Exact authorized scope and date |
| Private preview reviewer feedback decision | not_provided | wait / do not wait / defer | Feedback triage record or maintainer decision to proceed without feedback |
| Dependency/license risk confirmation | not_provided | acceptable / not acceptable / defer | Dependency license audit, lockfile review, and risk notes |
| Secret/customer data exposure confirmation | not_provided | confirmed clear / not clear / defer | Secret scan evidence and manual confirmation that no customer data or private target repo artifacts are committed |

## Maintainer Review Checklist

- [ ] Apache-2.0 license and contribution policy are acceptable.
- [ ] RepoAssure name and package name risk is acceptable.
- [ ] `main` branch protection or equivalent repository ruleset exists, or maintainer explicitly accepts an equivalent release control.
- [ ] No secrets, customer data, or private target repo artifacts are committed.
- [ ] Public release notes do not overpromise unavailable commercial, hosted, SaaS, Team Cloud, Enterprise, or dashboard features.
- [ ] Maintainer has decided whether to wait for private preview reviewer feedback.
- [ ] Maintainer has authorized, rejected, or deferred the next public release execution step.

## Non-Authorization Boundary

- No repository visibility change was authorized.
- No npm publication was authorized.
- No GitHub release was authorized.
- No public launch or production marketing announcement was authorized.
- No SaaS, Team Cloud, Enterprise, or hosted dashboard availability claim was authorized.
- No public custom domain binding was authorized.
- No external customer logo or case study use was authorized.

## Next Decision Options

1. Public Release Manual Gate Closure v0.1: use only after explicit maintainer inputs exist for the required manual gates.
2. Private Preview Feedback Triage Execution v0.1: use only if real reviewer feedback arrives and the maintainer wants reviewer feedback to gate release.
3. Public Source Release Execution v0.1: use only after all manual gates close and explicit final maintainer publication authorization exists.

## Audit Note

This document is readiness evidence and input collection material only. It is not legal advice, trademark clearance, branch protection proof, reviewer feedback, or release authorization.
