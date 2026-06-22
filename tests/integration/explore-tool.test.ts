import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runExploreAppTool } from '../../src/tools/explore-app-tool.js';

describe('runExploreAppTool', () => {
  it('writes findings.json for an explored page', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-explore-tool-'));
    const result = await runExploreAppTool({
      root,
      url: 'data:text/html,<html><body>ok</body></html>',
      criticalPaths: [],
      maxRoutes: 1,
      maxActionsPerRoute: 0
    });
    const artifact = JSON.parse(await readFile(result.findingsPath, 'utf8')) as Record<string, unknown>;

    expect(result.findingsPath).toBe(join(root, '.hardening', 'run', 'findings.json'));
    expect(result.artifactsDir).toBe(join(root, '.hardening', 'artifacts'));
    expect(artifact.findings).toEqual([]);
  });

  it('normalizes 0.0.0.0 input urls before exploration', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-explore-tool-normalized-url-'));
    const visitedUrls: string[] = [];

    const result = await runExploreAppTool({
      root,
      url: 'http://0.0.0.0:5173/',
      criticalPaths: [],
      maxRoutes: 1,
      maxActionsPerRoute: 0,
      fetchPage: async (url) => {
        visitedUrls.push(url);
        return { status: 200, body: '<html><body>ok</body></html>' };
      }
    });

    expect(visitedUrls).toEqual(['http://127.0.0.1:5173']);
    expect(result.visitedRoutes).toEqual(['http://127.0.0.1:5173']);
  });

  it('normalizes IPv6 unspecified input urls before exploration', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-explore-tool-ipv6-url-'));
    const visitedUrls: string[] = [];

    const result = await runExploreAppTool({
      root,
      url: 'http://[::]:5173/',
      criticalPaths: [],
      maxRoutes: 1,
      maxActionsPerRoute: 0,
      fetchPage: async (url) => {
        visitedUrls.push(url);
        return { status: 200, body: '<html><body>ok</body></html>' };
      }
    });

    expect(visitedUrls).toEqual(['http://127.0.0.1:5173']);
    expect(result.visitedRoutes).toEqual(['http://127.0.0.1:5173']);
  });
});
