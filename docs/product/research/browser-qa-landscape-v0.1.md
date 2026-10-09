# Browser QA Landscape v0.1

Status: Draft
Date: 2026-10-09
Extends: [Competitive Landscape v0.1](competitive-landscape-v0.1.md)
Decision ADR: none. This document records observations only; it does not change RepoAssure positioning, scope, or any ADR.

## Purpose

`competitive-landscape-v0.1.md` (2026-06-22) maps security scanning, agent observability, enterprise AppSec, agent API gateways, and launch checklists. It has no cluster for hosted AI browser QA: products where an AI agent drives a real browser through the app, writes or maintains end-to-end tests, and reports on pull requests or deploys.

Several such products appeared or became visible between 2026-08 and 2026-10. Their flow overlaps RepoAssure's explore → generate regression tests → CI → AI IDE handoff loop, so this addendum records them for positioning, messaging, and roadmap tradeoffs.

All observations are read-only checks made on 2026-10-09 (public pages, public GitHub metadata and READMEs) plus a teardown written on 2026-10-08. No waitlist, signup, login, or form submission was used.

## Cluster: Hosted AI browser QA

| Product | Observed promise | Reads source code? | Where it runs | Stage / signal |
| --- | --- | --- | --- | --- |
| rehearsal.dev (Gruvi Software Inc.) | "Describe the flows your users rely on"; tests them on web, mobile, and desktop "from local development to CI"; an agent explores the app, writes tests, verifies them, and checks PRs and Vercel-style preview deploys; coding agents (Claude Code, Codex, Cursor, Gemini CLI, OpenCode) can call its CLI, which answers in JSON with a suggested next step | No: site copy says it never reads source code, and its privacy policy says the GitHub App only reads deploy events and posts checks | Hosted service; a CLI tunnel reaches local dev servers; open-source runner `rehearsal-labs/retest` (Apache-2.0) | Waitlist; domain registered 2026-09-15; runner repo created 2026-09-30, 5 stars |
| rehearsal.run | Uses the product "in a real browser, like a customer would" and returns a video walkthrough, screenshots, and an independent verdict; a pull request is the first trigger | Not stated | Hosted | Marketing site with a contact call to action |
| rehearsal.ai | Docs: "AI that writes Playwright tests for you", with a GitHub PR integration. Homepage on 2026-10-09: "The AI copilot for your product" (in-app guidance and answers) | Not stated | Hosted | Live product with login; the homepage and docs now describe different products, so its direction is unclear |
| Autonoma (`Autonoma-AI/autonoma`) | Agentic E2E platform: per-PR preview environment, an agent drives a real browser, self-heals, and opens a PR review with expected vs actual, screenshot, video, and the suspected code | **Yes**: "reads your codebase" to generate natural-language tests | Hosted product (getautonoma.com) plus source-available repo with a local setup | 242 stars; README license badge BUSL-1.1 |
| agent-qa (`vostride/agent-qa`) | Open-source, self-improving QA agent: natural-language tests for web and mobile, learns from every run, adapts to UI changes | Not stated | Self-run harness | 903 stars; GitHub license field NOASSERTION |

Related, already recorded in the unmerged 2026-07-05 global landscape research: QA Wolf (agentic E2E and managed coverage) and Checkly (Playwright checks and monitoring for developers and agents). Those two are named here for completeness and were not re-checked.

Source note: `gitwillsky/autonoma`, which some external notes cite, is a fork of `Autonoma-AI/autonoma` (0 stars). Cite the upstream repository.

## Trust-Boundary Difference

The main difference is where the evidence comes from and who holds it, more than the feature list:

| | RepoAssure | Hosted browser QA cluster |
| --- | --- | --- |
| Input | A local checkout of the repository; boots the app itself | Mostly a deployed or tunneled URL. Autonoma is the exception and reads the codebase |
| Execution location | Developer machine or the user's own CI (local-first composite action) | The vendor's infrastructure, except the self-run agent-qa and the open-source runners |
| Artifacts | `.hardening/` bundle inside the target repo: report, findings, regression test drafts, repair plan, AI IDE handoff, patch plan | Vendor dashboard, PR comment, video, and verdict |
| Writes to target repo | Never: no branch, commit, or PR; `--apply`-style flags are rejected | PR comments and checks; some generate test code |
| Repair | Repair plan, task package, handoff, and patch plan for an AI IDE | Failure report; repair is left to the developer or their coding agent |

## Implications (observations, not decisions)

- **Overlap is real but partial.** These products overlap RepoAssure's browser exploration and regression test generation. They do not produce a repo-local, machine-readable repair contract.
- **Messaging risk.** "AI explores your app and writes tests" is no longer distinctive. Messaging that leads with exploration alone will read as one of this cluster. The durable differences are local-first execution, never writing to the target repo, and repair artifacts for AI IDEs.
- **"Machine-readable output for AI IDEs" is no longer unique.** rehearsal.dev already exposes a JSON CLI that coding agents call directly. What stays distinct is the content of the handoff (repair plan, task package, patch plan bound to repo evidence), not the fact that an agent can consume it.
- **Do not overclaim the boundary.** Autonoma reads source code and has a local setup, and rehearsal.dev tunnels to local dev servers. "Competitors only see a URL" is not true across the whole cluster.
- **Naming.** Three unrelated products use "Rehearsal" in this exact space. This affects any future RepoAssure feature naming such as "rehearsal" or "dress run".
- Any change to positioning, scope, or roadmap that follows from this addendum needs the maintainer's approval and an ADR. This document authorizes none.

## Watchlist

- rehearsal.dev: whether it leaves the waitlist, and whether its runner or agent starts producing repair plans or handoff packages for coding agents.
- Autonoma: license terms and whether its code-reading test generation moves toward repair planning.
- rehearsal.ai: whether the homepage pivot to an in-app copilot is permanent.
- agent-qa: license clarification and adoption trend.

## Sources

- `https://rehearsal.dev/` (title and meta description, 2026-10-09)
- `https://github.com/rehearsal-labs/retest` (GitHub metadata, 2026-10-09)
- `https://www.rehearsal.run/` (title and meta description, 2026-10-09)
- `https://rehearsal.ai/` and `https://docs.rehearsal.ai/` (titles and meta descriptions, 2026-10-09)
- `https://github.com/Autonoma-AI/autonoma` (GitHub metadata and README, 2026-10-09)
- `https://github.com/vostride/agent-qa` (GitHub metadata and README, 2026-10-09)
- rehearsal.dev teardown from the maintainer's separate Rehearsal project, 2026-10-08 (read-only, based on public site copy; no login and no observed failure replay)
