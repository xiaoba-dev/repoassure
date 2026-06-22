# MCP Server App

App shell for the `hardening-mcp` stdio MCP server app.

Current compatibility model:

- `apps/mcp-server/index.js` invokes the built compatibility entrypoint at `dist/adapters/mcp/index.js`.
- `package.json#bin.hardening-mcp` intentionally still points to `dist/adapters/mcp/index.js`.
- Runtime implementation remains in `src/adapters/mcp` until package boundaries are split.

Run after `pnpm build`:

```bash
node apps/mcp-server/index.js
pnpm app:mcp
```
