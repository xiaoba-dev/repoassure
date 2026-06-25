# Dependency License Audit v0.1

Status: Prepared for public-release readiness
Date: 2026-06-25
Source ADR: [ADR-0009](../../adr/0009-commercialization-and-licensing-strategy.md)

## Scope

This audit covers the current root package dependencies and devDependencies used by the private pre-release workspace. It does not publish packages and does not replace legal review before public release.

## Summary

No known incompatible dependency licenses were found in the current dependency set.

| Dependency | Current role | Observed license |
| --- | --- | --- |
| `@modelcontextprotocol/sdk` | Runtime dependency | MIT |
| `playwright` | Runtime dependency | Apache-2.0 |
| `@eslint/js` | Development dependency | MIT |
| `@playwright/test` | Development dependency | Apache-2.0 |
| `@types/node` | Development dependency | MIT |
| `eslint` | Development dependency | MIT |
| `tsx` | Development dependency | MIT |
| `typescript` | Development dependency | Apache-2.0 |
| `typescript-eslint` | Development dependency | MIT |
| `vitest` | Development dependency | MIT |

Workspace packages are private internal packages and inherit the repository-level Apache-2.0 release target when source distribution is authorized:

- `@hardening-mcp/acceptance`
- `@hardening-mcp/browser-explorer`
- `@hardening-mcp/repair-planner`
- `@hardening-mcp/security-assurance`
- `@hardening-mcp/shared`

## Release Gate

Before a first public package publication, re-run this audit against the exact lockfile and package set that will be released. Any AGPL, BSL, FSL, SSPL, Elastic License, unknown, custom, or missing third-party license must be reviewed before publication.
