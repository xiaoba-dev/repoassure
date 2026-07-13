import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  calculateAcceptanceBuildOutputs,
  calculateAcceptanceBuildFingerprint,
  ensureAcceptanceBuild
} from './lib/acceptance-build-coordinator.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fingerprint = await calculateAcceptanceBuildFingerprint(repoRoot);
const requiredOutputs = await calculateAcceptanceBuildOutputs(repoRoot);

await ensureAcceptanceBuild({
  cacheDir: join(repoRoot, 'node_modules', '.cache', 'repoassure'),
  fingerprint,
  requiredOutputs,
  build: () => runTypeScriptBuild(repoRoot)
});

async function runTypeScriptBuild(cwd: string): Promise<void> {
  const tscPath = join(cwd, 'node_modules', 'typescript', 'bin', 'tsc');

  await new Promise<void>((resolveBuild, rejectBuild) => {
    const child = spawn(
      process.execPath,
      [tscPath, '-p', 'packages/acceptance/tsconfig.build.json'],
      { cwd, stdio: 'inherit' }
    );

    child.once('error', rejectBuild);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolveBuild();
        return;
      }

      rejectBuild(new Error(
        signal
          ? `Acceptance TypeScript build terminated by ${signal}`
          : `Acceptance TypeScript build failed with exit code ${String(code)}`
      ));
    });
  });
}
