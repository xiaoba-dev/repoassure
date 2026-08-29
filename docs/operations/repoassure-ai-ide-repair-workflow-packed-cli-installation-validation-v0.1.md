# RepoAssure AI IDE Repair Workflow Packed CLI Installation Validation v0.1

Status: completed

Conclusion: `packed_cli_installed_and_validated_without_publication_or_target_writes`

## Objective

Validate RepoAssure as a locally packed and genuinely installed CLI distribution, rather than as a command executed from the source workspace.

## Distribution Contract

- Tarball: `hardening-mcp-0.1.0.tgz`
- Required CLI entry: `dist/adapters/cli/index.js`
- Installed bin: `node_modules/.bin/hardening`
- Internal workspace runtimes: copied into the tarball and addressed through package-relative imports
- Public third-party dependencies: installed through the consumer package manager
- Development-only surfaces such as `tests/` and `.autopilot/`: excluded
- Source workspace node_modules dependency: no

The source manifest remains private and workspace-oriented. The pnpm `beforePacking` hook removes private workspace dependencies only from the packed manifest. `scripts/prepare-packed-cli.mjs` rewrites built runtime imports after a fresh package/source build, without changing TypeScript runtime ownership.

## TDD Evidence

1. The first RED packed the monorepo development surface, including `tests/` and `.autopilot/`.
2. The second RED showed pnpm isolated linking cannot use `bundledDependencies`.
3. The third RED showed pnpm 10 requires `.pnpmfile.cjs` for `beforePacking`.
4. GREEN uses a constrained `files` manifest, a pnpm 10 packing hook, and package-relative built runtime imports.

`tests/integration/packed-cli-installation.test.ts` now:

- creates the tarball without npm publication;
- inspects required and prohibited packed files;
- confirms the packed manifest contains no `workspace:` dependency;
- installs the tarball in an isolated temporary consumer;
- invokes the installed `hardening repair --help`;
- runs `hardening repair handoff` against the non-private campaign fixture;
- verifies secret-like values are redacted;
- proves target source content, mtime, and directory entries are unchanged.

## Boundaries

- Target repository writes: no
- Automatic patch application: no
- Branch, commit, push, or pull request: no
- npm publication: no
- Deployment or public release: no
- MCP registry expansion: no

## Next Goal

RepoAssure Product Completion Gap Audit Refresh v0.4 will reconcile the now-complete package installation boundary against PRD, Spec, Plan, blocked/manual-gated work, external-input work, and remaining safe automatic work.
