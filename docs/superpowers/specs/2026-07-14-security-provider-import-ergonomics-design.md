# Security Assurance Lane Provider Import Ergonomics v0.1 Design

- Status: Accepted for execution
- Date: 2026-07-14
- Sources: `docs/PLAN.md`, ADR-0013, Security Assurance Lane Spec v0.1, Product / Website / User Validation Backlog Execution v0.1

## Goal

Make the existing local provider-evidence import understandable and safely actionable for maintainers and AI IDE clients without invoking a provider service, adding a scanner, uploading source, or modifying a target repository.

## Options Considered

1. CLI copy only: improve help and error strings while leaving provider knowledge duplicated and MCP undiscoverable. Low effort, but it does not satisfy the accepted CLI/MCP goal.
2. Shared provider contract with CLI and MCP adapters: define one provider catalog, preflight error contract, and repair-planning handoff consumed by both interfaces. This is the selected option because it closes the usability gap without changing the security architecture.
3. Native SARIF and provider-specific adapters: add CodeQL, Semgrep, Gitleaks, and OSV output parsers. This is deferred because the current goal is Phase 1 ergonomics and the accepted boundary requires fixture/local normalized input only.

## Architecture

### Shared provider contract

`packages/security-assurance/src/security-provider-contracts.ts` owns:

- the stable provider ids already accepted by Phase 1;
- a deterministic catalog describing the normalized `scan.json` envelope;
- explicit disclosure that native provider output is not yet supported;
- runtime provider lookup used by CLI, MCP, and the importer.

Every listed provider consumes the same RepoAssure normalized scan-directory envelope in v0.1. Listing a provider does not claim native parser support or scanner execution.

### Preflight and errors

The package importer validates the complete input before creating output directories:

- provider id is supported;
- `<sourcePath>/scan.json` exists and is readable;
- JSON parses successfully and has an object root;
- optional `provider` in the envelope matches the requested provider;
- `findings` is present and is an array.

Failures use `SecurityImportError` with a stable code, safe message, and concrete guidance. Error text must not include provider report content, secret values, or the full source path. CLI and MCP serialize the same safe error contract.

### Repair-planning handoff

`runSecurityImportTool` augments the package result with a machine-readable handoff:

- status `ready`;
- the imported `security-findings.json` path;
- a CLI command plus argv list for `hardening plan`;
- MCP tool name and arguments for `generate_repair_plan`;
- an explicit boundary stating that import and handoff do not apply repairs or mutate target source.

### CLI surface

- `hardening security providers` prints the provider catalog as redacted JSON.
- `hardening security import` keeps its existing arguments and compatibility.
- Help names every provider id, the required `scan.json` envelope, and the no-native-parser boundary.
- Missing/unsupported input reports the exact error code and next action.

### MCP surface

- `list_security_providers` is read-only and returns the shared catalog.
- `import_security_evidence` writes only local RepoAssure run artifacts and returns the same import result and repair-planning handoff as CLI.
- MCP annotations remain closed-world and non-destructive with respect to target source; the import tool is not read-only because it writes run artifacts.
- MCP errors remain text-only with `isError: true`, consistent with the existing protocol contract, but carry the stable code and guidance.

## Testing

- Unit: provider catalog, all preflight codes, no-output-on-failure, redaction, repair-planning handoff, CLI parsing/help/providers/error guidance, MCP schemas and routing.
- Integration: compiled CLI import and real MCP transport list/import calls against synthetic fixtures.
- Existing repair-plan test: imported security findings remain consumable by repair planning and task packaging.
- Repository gates: typecheck, lint, unit/full tests, repo hygiene, release check, and goal audit.

## Boundaries

- No provider runtime, network call, remote provider-state fetch, SARIF parser, or native provider adapter.
- No target source mutation, patch application, branch, commit, PR, issue, advisory, or external tracker record.
- No publication, launch, customer contact, pricing/spend change, repository visibility change, or hosted/commercial availability claim.
- No new ADR: this implements ADR-0013 and the accepted Security Assurance Lane boundary without changing durable architecture.
