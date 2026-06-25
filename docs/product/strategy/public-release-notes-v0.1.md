# Public Release Notes v0.1

Status: Draft
Date: 2026-06-25
Source ADR: [ADR-0009](../../adr/0009-commercialization-and-licensing-strategy.md)

## Release Positioning

RepoAssure is a local-first AI code acceptance and delivery assurance layer. It turns AI-generated repositories into reviewable, repairable, and deliverable engineering assets.

## What Is Included

- Local CLI and MCP server hardening flow.
- Browser and Python/CLI acceptance modes.
- Run-scoped `.hardening/runs/<run-id>` artifacts and `.hardening/latest/manifest.json`.
- Hardening reports, generated Playwright test drafts, repair plans, repair task packages, repair handoff packages, repair execution reports, and patch plans.
- Security Assurance Lane Phase 1 local provider evidence import.
- Local-first GitHub Action wrapper with explicit artifact upload opt-in.
- Public release readiness checks for license, contribution, security, dependency-license, release notes, artifact hygiene, and manual publication authorization status.

## Local-First Boundaries

- RepoAssure does not upload target repository source, logs, screenshots, traces, env values, tokens, cookies, or private artifacts by default.
- RepoAssure does not create commits, branches, pull requests, issues, advisories, or source edits in target repositories by default.
- Hosted dashboards, Team Cloud, SSO/RBAC, managed runners, and enterprise policy controls remain future commercial surfaces.

## Current Non-Goals

- No default auto-fix.
- No hosted artifact storage.
- No npm package publication until explicitly authorized.
- No public release until legal, trademark, branch protection or equivalent ruleset, and final maintainer approval are complete.
