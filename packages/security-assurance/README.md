# @hardening-mcp/security-assurance

Security Assurance Lane Phase 1 package for local-first provider evidence import.

Implemented exports:

- `compatibility`
- `import-security-evidence`
- `security-provider-contracts`

The package imports local normalized provider scan directories, accepts only a regular non-symbolic-link `scan.json` up to 10 MiB, validates the explicit `repoassure.normalized-security-scan.v1` envelope, required finding fields, optional field types, and recognized severity, normalizes P0-P3 findings into redacted RepoAssure security artifacts, and preserves redacted provider provenance. Output is create-only inside a real `<repo>/.hardening/` descendant; symbolic-link escapes and existing artifacts are rejected. The package does not run scanners, upload target repo data, create remote records, or modify target repo source. Native provider formats are not accepted.

Use `listSecurityProviderDescriptors()` to discover provider ids and input contracts. `SecurityImportError` and `formatSecurityImportError()` expose stable, path-safe preflight guidance. Provider remediation and verification strings remain untrusted review evidence and are not executable commands.
