import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runGenerateTestsTool } from '../../src/tools/generate-tests-tool.js';

describe('runGenerateTestsTool', () => {
  it('writes test-generation.json and generated specs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-generate-tool-'));
    const runDir = join(root, '.hardening', 'run');
    const findingsPath = join(runDir, 'findings.json');
    const outputDir = join(root, 'tests', 'hardening');

    await mkdir(runDir, { recursive: true });
    await writeFile(
      findingsPath,
      JSON.stringify({
        findings: [
          {
            severity: 'P0',
            type: 'white_screen',
            title: 'Home page is blank',
            reproSteps: ['Go to /'],
            evidence: ['http://localhost:3000/']
          }
        ]
      })
    );

    const result = await runGenerateTestsTool({ findingsPath, outputDir });
    const artifact = JSON.parse(await readFile(result.resultPath, 'utf8')) as Record<string, unknown>;

    expect(result.createdFiles).toHaveLength(1);
    expect(result.resultPath).toBe(join(runDir, 'test-generation.json'));
    expect(artifact.createdFiles).toEqual(result.createdFiles);
  });
});
