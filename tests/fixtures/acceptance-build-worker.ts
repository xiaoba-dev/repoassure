import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ensureAcceptanceBuild } from '../../scripts/lib/acceptance-build-coordinator.js';

const [fixtureRoot, fingerprint, mode = 'success'] = process.argv.slice(2);

if (!fixtureRoot || !fingerprint) {
  throw new Error('fixture root and fingerprint are required');
}

const outputPath = join(fixtureRoot, 'dist', 'index.js');

await ensureAcceptanceBuild({
  cacheDir: join(fixtureRoot, 'cache'),
  fingerprint,
  requiredOutputs: [outputPath],
  lockTimeoutMs: 5_000,
  pollIntervalMs: 10,
  build: async () => {
    await mkdir(join(fixtureRoot, 'dist'), { recursive: true });
    await appendFile(join(fixtureRoot, 'build-count.log'), `${process.pid}\n`);
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (mode === 'crash') {
      process.exit(23);
    }

    if (mode === 'fail') {
      throw new Error('fixture build failed');
    }

    if (mode === 'fail-partial') {
      await writeFile(outputPath, 'partial output\n');
      throw new Error('fixture build failed after writing partial output');
    }

    await writeFile(outputPath, `export const fingerprint = ${JSON.stringify(fingerprint)};\n`);
  }
});
