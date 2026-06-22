import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { normalizeClientUrl } from '../domain/boot/boot-app.js';
import { exploreApp, type ExploreAppInput, type ExploreAppResult } from '../domain/explore/explore-app.js';

export interface ExploreAppToolInput extends Omit<ExploreAppInput, 'artifactsDir'> {
  root: string;
}

export interface ExploreAppToolResult extends ExploreAppResult {
  findingsPath: string;
}

export async function runExploreAppTool(input: ExploreAppToolInput): Promise<ExploreAppToolResult> {
  const runDir = join(input.root, '.hardening', 'run');
  const artifactsDir = join(input.root, '.hardening', 'artifacts');
  const findingsPath = join(runDir, 'findings.json');
  const result = await exploreApp({
    ...input,
    url: normalizeClientUrl(input.url),
    artifactsDir
  });

  await mkdir(runDir, { recursive: true });
  await mkdir(artifactsDir, { recursive: true });
  await writeFile(findingsPath, `${JSON.stringify({ findings: result.findings }, null, 2)}\n`);

  return {
    ...result,
    findingsPath
  };
}
