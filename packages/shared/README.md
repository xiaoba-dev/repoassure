# Shared Package

Phase 2c shared package extraction is implemented here.

This package owns shared utility implementation modules with no product-domain dependencies:

- `privacy-redaction`
- `shell-quote`
- `shell-words`
- `compatibility`

`src/shared/*` compatibility wrappers preserve the old source import surface for root runtime modules. Generated `dist/shared/*` files preserve the old build output surface by re-exporting `packages/shared/dist/*`.

The package root and `./compatibility` subpath export the shared compatibility contract:

- `sharedPackageExportEntries`
- `sharedPackageDistOutputEntries`
- `sharedPackageSourceEntries`
- `legacySharedDistOutputEntries`
- `legacySharedWrapperSourceEntries`
- `sharedPackageSubpathSpecifiers`

Build and typecheck order remains package-first. Root scripts compile `@hardening-mcp/shared` before acceptance and root `src`, so legacy wrappers can depend on package declarations without broadening the migration to core, browser explorer, or repair planner packages.
