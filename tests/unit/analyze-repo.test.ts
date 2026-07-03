import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { analyzeRepo } from '../../src/domain/analyze/analyze-repo.js';

async function createRepo(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'hardening-analyze-'));

  await Promise.all(
    Object.entries(files).map(async ([path, contents]) => {
      const targetPath = join(root, path);
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, contents);
    })
  );

  return root;
}

describe('analyzeRepo', () => {
  it('detects a Next.js pnpm repo and recommends pnpm dev', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'next dev', build: 'next build', test: 'vitest run' },
        dependencies: { next: '16.0.0', react: '20.0.0' }
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('nextjs');
    expect(profile.packageManager).toBe('pnpm');
    expect(profile.scripts).toEqual({
      dev: 'next dev',
      build: 'next build',
      test: 'vitest run',
      start: null,
      preview: null
    });
    expect(profile.recommendedStartCommand).toBe('pnpm dev');
    expect(profile.confidence).toBe('high');
  });

  it('detects a Next.js repo from next.config when package dependencies are hoisted', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'next dev' }
      }),
      'next.config.mjs': 'export default {}',
      'pnpm-lock.yaml': 'lockfileVersion: 9.0'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('nextjs');
    expect(profile.packageManager).toBe('pnpm');
    expect(profile.recommendedStartCommand).toBe('pnpm dev');
    expect(profile.confidence).toBe('high');
  });

  it('detects a Next.js repo from package scripts when dependencies are hoisted', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'next dev --hostname 127.0.0.1' }
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('nextjs');
    expect(profile.packageManager).toBe('pnpm');
    expect(profile.recommendedStartCommand).toBe('pnpm dev');
    expect(profile.confidence).toBe('high');
  });

  it('detects a Vite npm repo', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' },
        dependencies: { react: '20.0.0' }
      }),
      'package-lock.json': '{}'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.packageManager).toBe('npm');
    expect(profile.recommendedStartCommand).toBe('npm run dev');
  });

  it('falls back to npm start when no dev script exists', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { start: 'next start', build: 'next build' },
        dependencies: { next: '16.0.0', react: '20.0.0' }
      }),
      'package-lock.json': '{}'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.scripts).toMatchObject({
      dev: null,
      start: 'next start',
      preview: null
    });
    expect(profile.recommendedStartCommand).toBe('npm run start');
    expect(profile.confidence).toBe('high');
  });

  it('falls back to package-manager preview when dev and start scripts are missing', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { preview: 'vite preview --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.scripts).toMatchObject({
      dev: null,
      start: null,
      preview: 'vite preview --host 127.0.0.1'
    });
    expect(profile.recommendedStartCommand).toBe('pnpm preview');
    expect(profile.confidence).toBe('high');
  });

  it('falls back to common app dev scripts when standard start scripts are missing', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { 'web:dev': 'pnpm --filter web dev', build: 'turbo build' },
        devDependencies: { vite: '8.0.0' }
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.scripts).toMatchObject({
      dev: null,
      start: null,
      preview: null
    });
    expect(profile.recommendedStartCommand).toBe('pnpm web:dev');
    expect(profile.confidence).toBe('high');
  });

  it('prefers standard dev scripts over common app dev script fallbacks', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'vite', 'web:dev': 'pnpm --filter web dev' },
        devDependencies: { vite: '8.0.0' }
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.recommendedStartCommand).toBe('pnpm dev');
    expect(profile.confidence).toBe('high');
  });

  it('recommends a package workspace dev command when the root has no start scripts', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        workspaces: ['apps/*'],
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.recommendedStartCommand).toBe('pnpm --filter web dev');
    expect(profile.appDirectories).toContain('apps/web');
    expect(profile.confidence).toBe('high');
  });

  it('recommends a pnpm workspace dev command from pnpm-workspace.yaml packages', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.recommendedStartCommand).toBe('pnpm --filter web dev');
    expect(profile.appDirectories).toContain('apps/web');
    expect(profile.confidence).toBe('high');
  });

  it('recommends a pnpm workspace dev command from inline pnpm-workspace.yaml packages', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': 'packages: ["packages/*", "apps/*"]\n',
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'packages/ui/package.json': JSON.stringify({
        name: 'ui',
        scripts: { dev: 'tsup --watch' },
        devDependencies: { tsup: '8.0.0' }
      }),
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.recommendedStartCommand).toBe('pnpm --filter web dev');
    expect(profile.appDirectories).toContain('apps/web');
    expect(profile.confidence).toBe('high');
  });

  it('prefers web app workspace packages over library packages with dev scripts', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "packages/*"', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'packages/ui/package.json': JSON.stringify({
        name: 'ui',
        scripts: { dev: 'tsup --watch' },
        devDependencies: { tsup: '8.0.0' }
      }),
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.recommendedStartCommand).toBe('pnpm --filter web dev');
    expect(profile.appDirectories).toContain('apps/web');
  });

  it('excludes library workspace packages from app directories when a web app package is detected', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "packages/*"', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'packages/ui/package.json': JSON.stringify({
        name: 'ui',
        scripts: { dev: 'tsup --watch' },
        devDependencies: { tsup: '8.0.0' }
      }),
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.appDirectories).toContain('apps/web');
    expect(profile.appDirectories).not.toContain('packages/ui');
  });

  it('excludes root src from app directories when only workspace packages are detected as web apps', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'src/tooling.ts': 'export const rootTooling = true;',
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.appDirectories).toEqual(['apps/web']);
  });

  it('prefers workspace packages detected by Vite config over library packages with dev scripts', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "packages/*"', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'packages/ui/package.json': JSON.stringify({
        name: 'ui',
        scripts: { dev: 'tsup --watch' },
        devDependencies: { tsup: '8.0.0' }
      }),
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' }
      }),
      'apps/web/vite.config.ts': 'export default {}'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.recommendedStartCommand).toBe('pnpm --filter web dev');
    expect(profile.appDirectories).toContain('apps/web');
  });

  it('prefers workspace packages detected by Next config over library packages with dev scripts', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "packages/*"', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'packages/ui/package.json': JSON.stringify({
        name: 'ui',
        scripts: { dev: 'tsup --watch' },
        devDependencies: { tsup: '8.0.0' }
      }),
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'next dev' }
      }),
      'apps/web/next.config.ts': 'export default {}'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('nextjs');
    expect(profile.recommendedStartCommand).toBe('pnpm --filter web dev');
    expect(profile.appDirectories).toContain('apps/web');
  });

  it('prefers workspace packages detected by framework scripts over library packages with dev scripts', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "packages/*"', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'packages/ui/package.json': JSON.stringify({
        name: 'ui',
        scripts: { dev: 'tsup --watch' },
        devDependencies: { tsup: '8.0.0' }
      }),
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'next dev --hostname 127.0.0.1' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('nextjs');
    expect(profile.recommendedStartCommand).toBe('pnpm --filter web dev');
    expect(profile.appDirectories).toContain('apps/web');
  });

  it('prefers a detected workspace app over generic root orchestration dev scripts', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1',
        scripts: { dev: 'turbo dev' },
        devDependencies: { turbo: '3.0.0' }
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "packages/*"', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'packages/ui/package.json': JSON.stringify({
        name: 'ui',
        scripts: { dev: 'tsup --watch' },
        devDependencies: { tsup: '8.0.0' }
      }),
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.recommendedStartCommand).toBe('pnpm --filter web dev');
    expect(profile.appDirectories).toContain('apps/web');
  });

  it('does not report high confidence for workspaces without a runnable start script', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        workspaces: ['apps/*'],
        packageManager: 'pnpm@10.12.1'
      }),
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.recommendedStartCommand).toBeNull();
    expect(profile.confidence).toBe('medium');
  });

  it('does not recommend TypeScript watch scripts as Web App start commands', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: {
          dev: 'tsc --watch',
          start: 'node dist/index.js',
          build: 'tsc',
          test: 'vitest run'
        },
        dependencies: { commander: '15.0.0' },
        devDependencies: { typescript: '6.0.0', vitest: '4.0.0' }
      }),
      'package-lock.json': '{}',
      'src/index.ts': 'export const cli = true;'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('unknown');
    expect(profile.recommendedStartCommand).toBeNull();
    expect(profile.blockers).toContain('No Web App start script detected');
    expect(profile.confidence).toBe('low');
  });

  it('detects a plain React yarn repo', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'react-scripts start' },
        dependencies: { react: '20.0.0', 'react-dom': '20.0.0' }
      }),
      'yarn.lock': ''
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('react');
    expect(profile.packageManager).toBe('yarn');
    expect(profile.recommendedStartCommand).toBe('yarn dev');
  });

  it('detects a Bun Vite repo from bun.lock and recommends bun run dev', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      }),
      'bun.lock': ''
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.packageManager).toBe('bun');
    expect(profile.recommendedStartCommand).toBe('bun run dev');
    expect(profile.confidence).toBe('high');
  });

  it('detects Bun from package.json packageManager when no lockfile exists', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'bun@1.3.0',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.packageManager).toBe('bun');
    expect(profile.recommendedStartCommand).toBe('bun run dev');
  });

  it('recommends a Bun workspace dev command when the root has no start scripts', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        workspaces: ['apps/*'],
        packageManager: 'bun@1.3.0'
      }),
      'bun.lockb': '',
      'apps/web/package.json': JSON.stringify({
        name: 'web',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('vite');
    expect(profile.packageManager).toBe('bun');
    expect(profile.recommendedStartCommand).toBe('bun --filter web dev');
    expect(profile.confidence).toBe('high');
  });

  it('detects package manager from package.json when no lockfile exists', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1',
        scripts: { dev: 'vite --host 127.0.0.1' },
        devDependencies: { vite: '8.0.0' }
      })
    });

    const profile = await analyzeRepo({ root });

    expect(profile.packageManager).toBe('pnpm');
    expect(profile.recommendedStartCommand).toBe('pnpm dev');
    expect(profile.confidence).toBe('high');
  });

  it('uses parent pnpm workspace context when analyzing a nested web app package directly', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1'
      }),
      'pnpm-workspace.yaml': ['packages:', '  - "apps/*"'].join('\n'),
      'pnpm-lock.yaml': 'lockfileVersion: 9.0',
      'apps/openclaw-ui/package.json': JSON.stringify({
        name: 'openclaw-ui',
        scripts: { dev: 'vite --host 127.0.0.1' }
      }),
      'apps/openclaw-ui/vite.config.ts': 'export default {}'
    });

    const profile = await analyzeRepo({ root: join(root, 'apps/openclaw-ui') });

    expect(profile.framework).toBe('vite');
    expect(profile.packageManager).toBe('pnpm');
    expect(profile.recommendedStartCommand).toBe('pnpm dev');
    expect(profile.confidence).toBe('high');
  });

  it('prefers lockfile package manager over package.json metadata', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@10.12.1',
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      }),
      'yarn.lock': ''
    });

    const profile = await analyzeRepo({ root });

    expect(profile.packageManager).toBe('yarn');
    expect(profile.recommendedStartCommand).toBe('yarn dev');
  });

  it('reports missing package.json as a blocker', async () => {
    const root = await createRepo({});

    const profile = await analyzeRepo({ root });

    expect(profile.framework).toBe('unknown');
    expect(profile.packageManager).toBe('unknown');
    expect(profile.recommendedStartCommand).toBeNull();
    expect(profile.blockers).toContain('Missing package.json');
    expect(profile.confidence).toBe('low');
  });

  it('extracts env key hints without leaking values', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      }),
      '.env.example': 'OPENAI_API_KEY=replace-me\nPUBLIC_URL=http://localhost:3000\n'
    });

    const profile = await analyzeRepo({ root });

    expect(profile.envHints).toEqual(['OPENAI_API_KEY', 'PUBLIC_URL']);
    expect(JSON.stringify(profile)).not.toContain('replace-me');
    expect(JSON.stringify(profile)).not.toContain('http://localhost:3000');
  });

  it('extracts export-prefixed env key hints without leaking values', async () => {
    const root = await createRepo({
      'package.json': JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: { vite: '8.0.0' }
      }),
      '.env.local': [
        'export OPENAI_API_KEY=sk-live-secret',
        'export NEXT_PUBLIC_APP_URL="https://example.test"',
        'lower_case=value'
      ].join('\n')
    });

    const profile = await analyzeRepo({ root });

    expect(profile.envHints).toEqual(['NEXT_PUBLIC_APP_URL', 'OPENAI_API_KEY']);
    expect(JSON.stringify(profile)).not.toContain('sk-live-secret');
    expect(JSON.stringify(profile)).not.toContain('https://example.test');
  });
});
