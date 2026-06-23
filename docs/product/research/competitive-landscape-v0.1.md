# Competitive Landscape v0.1

Status: Draft
Date: 2026-06-22
Decision ADR: [ADR-0010](../../adr/0010-repoassure-brand-positioning.md)

## Purpose

Record the competitive and naming landscape discovered while evaluating brand names for RepoAssure.

This document is a product reference for positioning, messaging, roadmap tradeoffs, naming collision checks, and future go-to-market work. It is not legal trademark advice.

## Executive Summary

The adjacent market is already forming around four clusters:

1. Vibe-coded app security scanners.
2. AI agent observability and trust platforms.
3. Enterprise AppSec and autonomous remediation platforms.
4. Solo-developer launch checklist tools.
5. First-party AI security scan plugins and platform-native security workflows.

The strongest naming risk is around `VibeProof`, `AgentProof`, `CodeGate`, `AgentGate`, `CodeAsure`, and `VibeCheck`. These names or close variants are already in active use.

RepoAssure remains the preferred brand because it avoids direct collision with the active `Proof`, `Gate`, and `VibeCheck` clusters while matching the product's durable positioning: repo-level acceptance, repair evidence, and delivery assurance for AI-generated software.

## Positioning Map

| Cluster | Representative products | Core promise | RepoAssure differentiation |
| --- | --- | --- | --- |
| Vibe app security scanning | Vibeproof | Find security issues before launch | RepoAssure covers acceptance evidence, repair handoff, and patch planning, not only security findings |
| Agent runtime trust | AgentProof | Monitor agent behavior, drift, cost, and compliance | RepoAssure validates generated repositories and repair evidence rather than monitoring deployed agents |
| Enterprise AI AppSec | CodeGate | Local zero-day hunting, sandbox verification, autonomous patch delivery | RepoAssure starts with local-first acceptance artifacts and AI IDE task contracts before enterprise AppSec automation |
| Platform-native security scan | Codex Security | Threat modeling, vulnerability discovery, validation, attack-path analysis, reports, and finding tracking inside Codex | RepoAssure treats Codex Security as a provider for a future Security Assurance Lane and keeps its core value in repo readiness, acceptance evidence, repair handoff, and agent-ready improvement packages |
| Agent API control | AgentGate | Human approval gateway for agent API writes | RepoAssure governs repository delivery quality, not live API access control |
| Launch checklist | VibeCheck.software | Structured local checklist for vibe-coded launches | RepoAssure produces machine-readable artifacts and verification plans, not only manual checklists |
| Commit-message tooling | rshdhere/vibecheck | AI-generated git commit messages | Not functionally competitive, but creates search and naming collision risk around `vibecheck` |

## Competitor Notes

### Vibeproof

Source: `https://vibeproof.sh/`

Observed positioning:

- Security scanner for AI-built apps.
- Messaging centers on whether a vibe-coded app is safe to ship.
- Scans live URLs or public GitHub repos.
- Claims read-only checks, no signup for free scans, live key verification, and copy-paste AI fix prompts.
- Coverage includes exposed secrets, open Supabase/Firebase databases, leaked files, vulnerable libraries, security headers, GDPR/privacy checks, repo secret/dependency scans, admin panels, auth form protections, DNS/email issues, and agentic AI security review.
- Deep scan is priced at `$39 / scan` and mentions Nuclei, testssl.sh, Nikto, and AI review.

Implication:

- Do not use `VibeProof`.
- Avoid positioning RepoAssure as only a security scanner.
- Keep the distinction that RepoAssure produces acceptance and repair evidence across repo workflows, not only vulnerability findings.

### Vibeproof.dev

Source: `https://vibeproof.dev/`

Observed positioning:

- Page title indicates: `VibeProof | Find What AI Missed | Security, SEO & UX Scanner`.
- Detailed content was not available through the current scraper.

Implication:

- Confirms additional naming collision around `VibeProof`.
- Treat `VibeProof` as unavailable even if product details remain unclear.

### AgentProof.ai

Source: `https://agentproof.ai/`

Observed positioning:

- AI agent observability and trust platform.
- Messaging focuses on real-time monitoring for autonomous tools.
- Claims behavioral monitoring, security pattern analysis, performance metrics, cost analytics, access pattern discovery, and drift detection.
- Pricing shown includes `$299` one-time stability scan, `$99/mo` monitoring/certification, and `$299/mo` enterprise monitoring/audit.
- Compliance messaging includes SOC2, ITAR, insurance resilience, regulatory governance, and audit trails.

Implication:

- Do not use `AgentProof`.
- RepoAssure should not claim to be an agent observability platform unless a future product line intentionally enters that category.

### AgentProof.org

Source: `https://agentproof.org/`

Observed positioning:

- Page title indicates: `AgentProof.org — The Universal Standard for Agentic Trust`.
- Detailed content was not available through the current scraper.

Implication:

- Confirms additional naming collision around `AgentProof`.
- Avoid `AgentProof` and close variants.

### CodeGate

Source: `https://codegate.app/`

Observed positioning:

- Autonomous enterprise AI security and zero-day threat hunting.
- Messaging emphasizes local execution, data sovereignty, IDE proxies, security ROI, threat-informed hunting, exploit verification, cost control, model update staging, and one-click patch delivery.
- Integrations listed include VS Code, JetBrains, Cursor, GitHub Copilot, Continue.dev, Cline, Aider, GitHub Issues, Jira, SSO, local/private LLM engines, logging, vector store, PostgreSQL, and Redis.
- Lifecycle includes local ingest, credential scrub, smart token batching, local threat context retrieval, automated sandbox verification, and patch delivery preview.

Implication:

- Do not use `CodeGate`.
- CodeGate is the closest enterprise AppSec future-state competitor.
- RepoAssure should emphasize acceptance artifacts and AI IDE repair contracts before moving into autonomous security remediation.

### Codex Security

Source: Codex Security plugin capabilities observed in the local Codex environment; public reporting around OpenAI's Codex Security / Aardvark security scanner.

Observed positioning:

- First-party Codex security workflow.
- Repository-wide or scoped security scans.
- Phase model includes threat model, finding discovery, validation, attack-path analysis, final report, and finding tracking.
- Deep scan mode repeats discovery with multiple workers and then centralizes validation and attack-path analysis.
- Tracking workflow can create or reuse Linear, Jira, GitHub issues, or GitHub security advisories after preview and approval.

Implication:

- Codex Security validates that security assurance for AI-generated code is a real platform category.
- RepoAssure should not position itself as a generic deep vulnerability scanner or "better Codex Security".
- RepoAssure should define Security Assurance Lane as a provider-backed evidence lane, with Codex Security as a preferred provider integration rather than the only supported engine.
- Security findings should become normalized RepoAssure artifacts and repair planning inputs alongside browser, CLI, architecture, and test evidence.

### AgentGate

Source: `https://agentgate.org/`

Observed positioning:

- Human-in-the-loop API gateway for AI agents.
- GET/read requests pass through, write requests queue for approval.
- Credentials stay on the server; agents receive their own tokens.
- Supports MCP, OpenClaw, webhooks, messaging, durable memory, web search, access control, and connected services such as GitHub and calendars.
- Open source and self-hosted.

Implication:

- Do not use `AgentGate`.
- RepoAssure should stay away from gateway naming unless it later builds a distinct policy gateway product.

### CodeAsure

Source: `https://codeasure.com/`

Observed positioning:

- Site presents CodeAsure as a proprietary service plan provider backed by insurance coverage.
- Page includes certification, pilot, pricing, privacy, and terms links.

Implication:

- Avoid `CodeAssure`, `CodeAsure`, and close spellings.
- RepoAssure is acceptable because it anchors on repo-level delivery assurance, but future trademark/legal review is still required.

### VibeCheck.software

Source: `https://vibecheck.software/`

Observed positioning:

- Self-audit tool for vibe coding.
- Helps prepare builds before launch using structured checklists.
- Local/private, solo-dev oriented, supports Lovable, Bolt, Cursor + Supabase, GPT + Supabase, and custom setups.
- Pricing shown as `$79` one-time.
- Mac-only at the observed time, with Windows planned.

Implication:

- Do not use `VibeCheck`.
- RepoAssure should distinguish itself from manual checklist tools by highlighting machine-readable evidence, validation commands, and repair task contracts.

### rshdhere/vibecheck

Source: `https://github.com/rshdhere/vibecheck`

Observed positioning:

- Public GitHub repo for a cross-platform CLI that generates git commit messages from code changes.
- GitHub page shows 188 stars, 13 forks, MIT license, and 49 releases at observation time.
- Supports multiple LLM providers and stores configuration globally.

Implication:

- Not functionally competitive with RepoAssure.
- Strong naming collision means `vibecheck` should be considered unavailable for developer-tool branding.

## Naming Decision Impact

Rejected names:

- `VibeProof`: direct active competitor in AI-built app security scanning.
- `AgentProof`: active agent observability/trust products.
- `CodeGate`: active enterprise AppSec/security platform.
- `AgentGate`: active AI agent API gateway.
- `CodeAssure` / `CodeAsure`: close active insurance/certification naming.
- `VibeCheck`: active website and open-source CLI.

Accepted brand:

- `RepoAssure`

Rationale:

- Connects directly to repository-level acceptance and assurance.
- Avoids the most crowded `Vibe`, `Proof`, `Gate`, and `Check` clusters.
- Works for developer, team, and enterprise messaging.
- Leaves room for Web, Python/CLI, Agent capability, and future enterprise governance modes.

## RepoAssure Differentiation

RepoAssure should be described as:

> RepoAssure turns AI-generated repositories into testable, repairable, shippable software.

Core differentiation:

- Repo-level acceptance rather than only URL security scanning.
- Local-first artifact contracts rather than hosted-only scans.
- Machine-readable outputs for AI IDEs and agents.
- Repair plan, repair task package, repair handoff package, execution report, and patch plan.
- Browser and Python/CLI acceptance modes.
- Provider-backed Security Assurance Lane rather than direct competition with Codex Security or enterprise AppSec scanners.
- Future compatibility with Team Cloud and Enterprise/on-prem packaging without weakening local execution.

## Watchlist

- Monitor Vibeproof for movement from security scanner into repo acceptance or repair task packaging.
- Monitor CodeGate for open-core or developer-tool releases that overlap with local-first enterprise hardening.
- Monitor AgentProof for movement from runtime observability into pre-deployment repo certification.
- Monitor Codex Security for output format, provider access, finding tracking, and security scan artifact contracts that should feed RepoAssure's Security Assurance Lane.
- Re-check `RepoAssure` availability before public release, domain purchase, package publication, or trademark filing.

## Sources

- `https://vibeproof.sh/`
- `https://vibeproof.dev/`
- `https://agentproof.ai/`
- `https://agentproof.org/`
- `https://codegate.app/`
- `https://agentgate.org/`
- `https://codeasure.com/`
- `https://vibecheck.software/`
- `https://github.com/rshdhere/vibecheck`
- Codex Security plugin capability notes from the local Codex environment
