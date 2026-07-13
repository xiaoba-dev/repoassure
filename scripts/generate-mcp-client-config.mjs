#!/usr/bin/env node

const buildRequiredMessage =
  'RepoAssure MCP config generation failed: runtime unavailable; run pnpm build first\n';

await main();

async function main() {
  let config;
  let redactSensitiveText;
  try {
    config = await import('../dist/adapters/mcp/client-config.js');
    ({ redactSensitiveText } = await import('@hardening-mcp/shared'));
  } catch {
    process.stderr.write(buildRequiredMessage);
    process.exitCode = 1;
    return;
  }

  try {
    const options = config.parseMcpClientConfigArgs(process.argv.slice(2), {
      defaultRepoRoot: config.defaultMcpRepoRoot(),
      nodePath: process.execPath
    });
    await config.assertMcpRuntimeReady(options.repoRoot);
    process.stdout.write(config.createMcpClientConfig(options));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `RepoAssure MCP config generation failed: ${redactSensitiveText(message)}\n`
    );
    process.exitCode = 1;
  }
}
