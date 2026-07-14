# @hardening-mcp/security-assurance

Security Assurance Lane Phase 1 package for local-first provider evidence import.

Implemented exports:

- `compatibility`
- `import-security-evidence`
- `security-provider-contracts`

The package imports local normalized provider scan directories, normalizes findings into redacted RepoAssure security artifacts, preserves provider provenance, and does not run scanners, upload target repo data, create remote records, or modify target repo source. Native provider formats are not accepted; all provider ids currently consume `repoassure.normalized-security-scan.v1` from `scan.json`.

Use `listSecurityProviderDescriptors()` to discover provider ids and input contracts. `SecurityImportError` and `formatSecurityImportError()` expose stable, path-safe preflight guidance.
