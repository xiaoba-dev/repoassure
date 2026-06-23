# @hardening-mcp/security-assurance

Security Assurance Lane Phase 1 package for local-first provider evidence import.

Implemented exports:

- `compatibility`
- `import-security-evidence`

The package imports local provider scan directories such as Codex Security fixtures, normalizes findings into redacted RepoAssure security artifacts, preserves provider provenance, and does not run scanners, upload target repo data, create remote records, or modify target repo source.
