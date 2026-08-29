import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { calculateAcceptanceBuildFingerprint } from '../../scripts/lib/acceptance-build-coordinator.js';

describe('acceptance build runtime contract', () => {
  it('invalidates the real fingerprint for source and build coordinator changes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-acceptance-fingerprint-'));

    try {
      await mkdir(join(root, 'packages', 'acceptance', 'src'), { recursive: true });
      await mkdir(join(root, 'scripts', 'lib'), { recursive: true });
      await writeFile(join(root, 'package.json'), '{}\n');
      await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
      await writeFile(join(root, 'tsconfig.json'), '{}\n');
      await writeFile(join(root, 'packages', 'acceptance', 'package.json'), '{}\n');
      await writeFile(join(root, 'packages', 'acceptance', 'tsconfig.json'), '{}\n');
      await writeFile(join(root, 'packages', 'acceptance', 'tsconfig.build.json'), '{}\n');
      await writeFile(join(root, 'packages', 'acceptance', 'src', 'index.ts'), 'export const value = 1;\n');
      await writeFile(join(root, 'scripts', 'build-acceptance.ts'), 'build v1\n');
      await writeFile(join(root, 'scripts', 'lib', 'acceptance-build-coordinator.ts'), 'lock v1\n');

      const initial = await calculateAcceptanceBuildFingerprint(root);
      await writeFile(join(root, 'packages', 'acceptance', 'src', 'index.ts'), 'export const value = 2;\n');
      const sourceChanged = await calculateAcceptanceBuildFingerprint(root);
      await writeFile(join(root, 'scripts', 'build-acceptance.ts'), 'build v2\n');
      const buildChanged = await calculateAcceptanceBuildFingerprint(root);
      await writeFile(join(root, 'scripts', 'lib', 'acceptance-build-coordinator.ts'), 'lock v2\n');
      const coordinatorChanged = await calculateAcceptanceBuildFingerprint(root);

      expect(new Set([initial, sourceChanged, buildChanged, coordinatorChanged])).toHaveLength(4);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('invalidates the fingerprint when a package the acceptance sources import changes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'repoassure-acceptance-dependency-'));

    try {
      await mkdir(join(root, 'packages', 'acceptance', 'src'), { recursive: true });
      await mkdir(join(root, 'packages', 'security-assurance', 'src'), { recursive: true });
      await mkdir(join(root, 'scripts', 'lib'), { recursive: true });
      await writeFile(join(root, 'package.json'), '{}\n');
      await writeFile(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
      await writeFile(join(root, 'tsconfig.json'), '{}\n');
      await writeFile(join(root, 'packages', 'acceptance', 'package.json'), '{}\n');
      await writeFile(join(root, 'packages', 'acceptance', 'tsconfig.json'), '{}\n');
      await writeFile(join(root, 'packages', 'acceptance', 'tsconfig.build.json'), '{}\n');
      await writeFile(
        join(root, 'packages', 'acceptance', 'src', 'index.ts'),
        "export { evidence } from '@hardening-mcp/security-assurance';\n"
      );
      await writeFile(join(root, 'packages', 'security-assurance', 'package.json'), '{"version":"0.1.0"}\n');
      await writeFile(
        join(root, 'packages', 'security-assurance', 'src', 'index.ts'),
        'export const evidence: string = "v1";\n'
      );
      await writeFile(join(root, 'scripts', 'build-acceptance.ts'), 'build v1\n');
      await writeFile(join(root, 'scripts', 'lib', 'acceptance-build-coordinator.ts'), 'lock v1\n');

      const initial = await calculateAcceptanceBuildFingerprint(root);
      /* The acceptance sources import this package, so its types reach the
         emitted .d.ts. A change here must not be reusable under the old state. */
      await writeFile(
        join(root, 'packages', 'security-assurance', 'src', 'index.ts'),
        'export const evidence: number = 2;\n'
      );
      const dependencySourceChanged = await calculateAcceptanceBuildFingerprint(root);
      await writeFile(join(root, 'packages', 'security-assurance', 'package.json'), '{"version":"0.2.0"}\n');
      const dependencyManifestChanged = await calculateAcceptanceBuildFingerprint(root);

      expect(new Set([initial, dependencySourceChanged, dependencyManifestChanged])).toHaveLength(3);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('prebuilds package and root runtime outputs before the parallel Vitest suite', async () => {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts.test).toBe(
      'pnpm build:packages && pnpm build:src && vitest run'
    );

    const vitestConfig = await readFile('vitest.config.ts', 'utf8');
    expect(vitestConfig).toContain('fileParallelism: true');
    expect(vitestConfig).toContain('maxWorkers: 4');
  });

  it('never runs a compiled entry point without a build in front of it', async () => {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };
    const scripts = packageJson.scripts;
    const runsCompiledEntry = /\bnode\s+(?:packages\/[^\s]*\/dist\/|dist\/)/u;
    const builds = /\bpnpm\s+build/u;

    const unguarded = Object.entries(scripts)
      .filter(([name]) => !name.startsWith('pre') && !name.startsWith('post'))
      .filter(([, command]) => runsCompiledEntry.test(command))
      .filter(([name, command]) => !builds.test(command) && !builds.test(scripts[`pre${name}`] ?? ''))
      .map(([name]) => name);

    expect(unguarded).toEqual([]);
  });

  it('pins the pnpm setting that decides whether those pre hooks run', async () => {
    /* The guards above are mostly `pre*` hooks. pnpm runs them only when
       enable-pre-post-scripts is on, and that default has differed across pnpm
       majors, so a contributor on another version would silently run every
       compiled entry point against whatever dist happened to be there. The
       repository pins the setting instead of inheriting it. */
    const npmrc = await readFile('.npmrc', 'utf8');

    expect(npmrc).toMatch(/^enable-pre-post-scripts=true$/mu);
  });

  it('routes acceptance builds through the cross-process coordinator', async () => {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts['build:acceptance']).toBe(
      'node --import tsx scripts/build-acceptance.ts'
    );
  });

  it('cascades the resolved runtime boundary and next manual gate through project documentation', async () => {
    const [operation, plan, spec, prd, architecture, strategy, acceptance, readme, blockers] =
      await Promise.all([
        readFile('docs/operations/parallel-test-runtime-build-isolation-v0.1.md', 'utf8'),
        readFile('docs/PLAN.md', 'utf8'),
        readFile('docs/SPEC.md', 'utf8'),
        readFile('docs/PRD.md', 'utf8'),
        readFile('docs/architecture/overview.md', 'utf8'),
        readFile('docs/testing/strategy/test-strategy-v0.1.md', 'utf8'),
        readFile('docs/acceptance/checklists/acceptance-checklist-v0.1.md', 'utf8'),
        readFile('README.md', 'utf8'),
        readFile('docs/logs/blockers.md', 'utf8')
      ]);

    expect(operation).toContain('Status: completed');
    expect(operation).toContain('node_modules/.cache/repoassure');
    expect(operation).toContain('three consecutive');
    expect(plan).toMatch(
      /## Next Codex Goal\n\nSecurity Assurance Lane Provider Import Ergonomics v0\.1/u
    );
    expect(plan).toMatch(
      /## Blocked Goal Recovery MCP Surface v0\.1\n\nStatus: retired on 2026-08-28 by ADR-0044\./u
    );
    expect(plan).toMatch(
      /## Parallel Test Runtime Build Isolation v0\.1\n\nStatus: completed\./u
    );
    expect(spec).toContain('acceptance build single-flight');
    expect(prd).toContain('repeatable standard parallel test evidence');
    expect(architecture).toContain('Acceptance Build Runtime Isolation');
    expect(strategy).toContain('Parallel Test Runtime Build Isolation v0.1');
    expect(acceptance).toContain('Parallel Test Runtime Build Isolation v0.1');
    expect(readme).toContain('pnpm test');
    expect(blockers).toContain('Resolution status: resolved');
  });
});
