# Browser Explorer Package

Phase 2e browser-explorer package extraction is implemented with compatibility wrappers.

This package owns browser and route exploration implementation modules for:

- `explore-app`
- `playwright-driver`

The package exports typed root, `compatibility`, `explore-app`, and `playwright-driver` subpaths. It depends on `@hardening-mcp/shared` for redaction and on Playwright for browser-driver runtime loading.

Compatibility boundary:

- `src/domain/explore/*` compatibility wrappers keep legacy source imports working.
- `dist/domain/explore/*` remains the generated compatibility output surface.
- `packages/browser-explorer/src` is the implementation owner; root `src/domain/explore/*` paths must not regain duplicate browser or route exploration implementation logic.
