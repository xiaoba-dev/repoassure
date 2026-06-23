# ADR-0013: Codex Security and Security Assurance Lane

- Status: Accepted
- Date: 2026-06-23
- Deciders: hardening-mcp maintainers

## Context

Codex Security introduces a first-party Codex security scan workflow with threat modeling, finding discovery, validation, attack-path analysis, final reports, and finding tracking. This confirms that AI-generated and AI-assisted repositories need automated security assurance, but it also makes generic AI security scanning a fast-moving platform capability.

RepoAssure currently positions itself as a local-first AI code acceptance and delivery assurance layer. Its strongest product surface is not only vulnerability discovery; it is the end-to-end evidence loop across repository analysis, app/CLI acceptance, runtime exploration, generated tests, repair plans, repair task packages, repair handoff, validation evidence, patch planning, normalized artifacts, and AI IDE / Agent handoff.

If RepoAssure competes directly as a standalone security scanner, it will be exposed to platform and enterprise AppSec competitors. If RepoAssure ignores Codex Security, it will miss an important security evidence source that users may expect to appear in delivery assurance workflows.

## Decision

RepoAssure will not position itself as a direct replacement for Codex Security or as a generic deep vulnerability scanner.

RepoAssure will position security as a pluggable `Security Assurance Lane` inside the broader repo readiness and delivery assurance workflow. Codex Security should be treated as a preferred security provider integration, not as the only supported engine or a hard platform dependency.

The product boundary is:

- Codex Security answers: "What security vulnerabilities and attack paths exist in this repository or scope?"
- RepoAssure answers: "Is this repository ready to ship, what evidence proves that, what is still blocking acceptance, and what should the next AI IDE / Agent fix first?"

RepoAssure should normalize imported or generated security evidence into the same artifact and repair workflow used for browser, CLI, architecture, and test findings.

## Target Architecture Direction

Future implementation should introduce a provider interface shaped around security evidence ingestion and normalization:

```text
Security Provider Interface
  codex-security
  codeql
  semgrep
  gitleaks
  osv / dependency advisory scanners
  browser security checks
  manual import
```

The first integration target should be Codex Security scan output import, for example:

```bash
repoassure security import --provider codex-security --scan-dir <scan-dir>
```

The imported evidence should become RepoAssure artifacts and repair planning inputs, not an isolated report format.

## Product Implications

RepoAssure messaging should emphasize:

- repo readiness, not only vulnerability scanning
- acceptance and verification evidence
- normalized local artifacts
- AI IDE / Agent repair task packages
- pluggable security evidence
- local-first privacy boundaries

RepoAssure should avoid claims such as "better than Codex Security" or "complete AppSec replacement" until a dedicated security product line, benchmarks, and validation process exist.

## Consequences

### Positive

- Keeps RepoAssure differentiated from first-party security scan tools and enterprise AppSec scanners.
- Lets RepoAssure benefit from Codex Security output without depending exclusively on it.
- Preserves the current product thesis: assurance orchestration and repair handoff are the core value.
- Gives users a path to combine security findings with runtime acceptance findings, generated tests, repair plans, and patch planning.
- Keeps future enterprise packaging open to multiple security engines and customer-mandated scanners.

### Negative

- Requires an additional evidence normalization layer before security findings can feed repair plans cleanly.
- Codex Security output formats and access models may change, creating integration maintenance cost.
- Users may still compare RepoAssure to security scanners, so positioning must be disciplined.
- RepoAssure will initially depend on external security providers for deep vulnerability discovery instead of owning that capability end to end.

### Follow-up

- Add `Security Assurance Lane` to product and architecture docs as a future provider-backed lane.
- Add a future spec for security evidence import schema and provider interface.
- Include Codex Security in the competitive landscape and watchlist.
- Do not implement a native deep security scanner in the current MVP unless a later ADR explicitly changes this boundary.
- When implemented, goal audit should verify that security imports are local-first, redact sensitive content, and preserve provider provenance.
