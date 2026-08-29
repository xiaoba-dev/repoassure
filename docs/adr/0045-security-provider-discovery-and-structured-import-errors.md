# ADR-0045: Security Provider Discovery and Structured Import Errors

Status: Accepted
Date: 2026-08-29

## Context

`hardening security import` already accepts all six providers — `codex-security`, `codeql`,
`semgrep`, `gitleaks`, `osv`, `manual-import` — but nothing tells a caller that. The provider
list lived in two hand-maintained places (a local `parseSecurityProvider` in the CLI and the
importer's own validation), there was no way to ask which ids are valid, and a wrong id produced
`Unsupported security provider: <id>` with no indication of what to do next.

The MCP surface had the same gap in a sharper form: zero security tools. ADR-0043 exposed the
repair chain over MCP on the grounds that an AI IDE is the stated consumer and reaches this
repository over stdio. Security evidence import is in exactly the same position.

This ADR lands the reviewed work from PR #62, which had gone stale on a pre-ADR-0041 base and
would have restored the goal-recovery MCP tools that ADR-0041's successor removed.

## Decision

Add `packages/security-assurance/security-provider-contracts` as the single source of truth for
provider ids: typed descriptors carrying `supportStatus`, `nativeFormatSupport` and the input
contract, plus `SecurityImportError` with a machine-readable `code` and human `guidance`. The
CLI's private provider list is deleted and both surfaces parse through the package.

Two MCP tools follow, taking the surface to thirteen: `list_security_providers` (read-only, no
arguments) and `import_security_evidence`. Both use a strict input schema — an unexpected key is
a caller bug worth surfacing, not something to ignore. `hardening security providers` prints the
same catalog.

Import errors now carry their code and next step on both surfaces, so
`Unsupported security provider: native-sarif` becomes
`[provider_unsupported] ... Run hardening security providers and provide a normalized scan.json.`

The repair planner gains a `P3` severity tier and a `trustBoundary` field, because security
findings can be informational and because provider-controlled text must be marked as untrusted
before it reaches a repair task an agent will read.

## Consequences

A caller can discover what this build accepts before constructing an import, and a rejected
import says which rule it broke and what to do. One list of providers means the CLI, the MCP
tools and the importer cannot drift apart.

Import still never runs a scanner, contacts a provider, uploads target repository material,
creates issues, pull requests or advisories, or modifies target source. Output artifacts stay
create-only and never overwrite prior evidence. Native provider formats remain unaccepted:
every provider requires `repoassure.normalized-security-scan.v1`.

PR #62's real-stdio-client integration case is not included; it depends on four test helpers that
were removed as dead code when the goal-recovery tools left the registry. The MCP path is covered
at the transport level by the new case in `tests/integration/mcp-server.test.ts`, which lists both
tools, calls them, and inspects the written artifacts.

This ADR does not authorize npm publication, GitHub release, public launch, production marketing
announcement, customer contact, pricing/spend, repository visibility change, or
SaaS/Team Cloud/Enterprise/hosted availability claims.
