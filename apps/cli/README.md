# CLI App

App shell for the `hardening` command-line app.

Current compatibility model:

- `apps/cli/index.js` invokes the built compatibility entrypoint at `dist/adapters/cli/index.js`.
- `package.json#bin.hardening` intentionally still points to `dist/adapters/cli/index.js`.
- Runtime implementation remains in `src/adapters/cli` until package boundaries are split.

Run after `pnpm build`:

```bash
node apps/cli/index.js --help
pnpm app:cli -- --help
```
