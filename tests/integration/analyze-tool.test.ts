import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runAnalyzeRepoTool } from '../../src/tools/analyze-repo-tool.js';

async function createRepo(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'hardening-tool-'));

  await Promise.all(
    Object.entries(files).map(([path, contents]) => writeFile(join(root, path), contents))
  );

  return root;
}

describe('runAnalyzeRepoTool', () => {
  it('writes repo-profile.json under .hardening/run', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'next dev' },
        dependencies: { next: '16.0.0', react: '20.0.0' }
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0'
    });

    const result = await runAnalyzeRepoTool({ root });
    const written = JSON.parse(await readFile(result.profilePath, 'utf8')) as unknown;

    expect(result.profile.framework).toBe('nextjs');
    expect(result.profilePath).toBe(join(root, '.hardening', 'run', 'repo-profile.json'));
    expect(written).toEqual(result.profile);
  });
});
