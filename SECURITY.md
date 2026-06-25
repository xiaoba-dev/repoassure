# Security Policy

## Supported Versions

RepoAssure is pre-1.0 software. Security fixes target the current `main` branch unless a later release process defines supported versions.

## Report a Vulnerability

Report a vulnerability privately to the maintainers before opening a public issue. Do not include secrets, private target repository source, logs, screenshots, traces, env values, tokens, cookies, customer data, or exploit details in public channels.

Until a public security contact is finalized, use a private maintainer channel or a private GitHub security advisory once the repository visibility and GitHub plan support it.

## Security Boundaries

RepoAssure is local-first by default:

- It must not upload target repository source or private artifacts by default.
- It must redact sensitive values before writing reports, handoff packages, logs, or command output.
- It must not create issues, pull requests, advisories, branches, commits, or source edits in target repositories by default.
- Security scanners are treated as provider-backed evidence sources through the Security Assurance Lane.

Public security disclosure terms must be reviewed again before the first public repository release.
