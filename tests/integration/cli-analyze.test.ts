import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runCli } from '../../src/adapters/cli/run.js';

async function createRepo(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'hardening-cli-'));

  await Promise.all(
    Object.entries(files).map(([path, contents]) => writeFile(join(root, path), contents))
  );

  return root;
}

describe('CLI analyze', () => {
  it('prints the repo profile and writes the artifact', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      }),
      'package-lock.json': '{}'
    });
    let stdout = '';
    let stderr = '';

    const exitCode = await runCli(['analyze', root], {
      writeStdout: (chunk) => {
        stdout += chunk;
      },
      writeStderr: (chunk) => {
        stderr += chunk;
      }
    });

    const output = JSON.parse(stdout) as { profilePath: string; profile: { framework: string } };
    const artifact = JSON.parse(await readFile(output.profilePath, 'utf8')) as unknown;

    expect(exitCode).toBe(0);
    expect(stderr).toBe('');
    expect(output.profile.framework).toBe('vite');
    expect(output.profilePath).toBe(join(root, '.hardening', 'run', 'repo-profile.json'));
    expect(artifact).toEqual(output.profile);
  });
});
