import { readFile } from 'node:fs/promises';

import { buildConsoleTokensModule } from '../../scripts/generate-console-tokens.mjs';

const generatedPath = 'packages/acceptance/src/generated/design-system-tokens.ts';

describe('console design tokens', () => {
  it('matches the design system it is generated from', async () => {
    const [onDisk, regenerated] = await Promise.all([
      readFile(generatedPath, 'utf8'),
      buildConsoleTokensModule()
    ]);

    // A baked copy is only safe while it cannot drift. Editing a design system token
    // without regenerating should fail here rather than ship a console that disagrees
    // with the website about what the brand looks like.
    expect(onDisk, `stale — run: node scripts/generate-console-tokens.mjs`).toBe(regenerated);
  });

  it('carries no runtime dependency on the design system package', async () => {
    const [viewerSource, rootManifest, acceptanceManifest] = await Promise.all([
      readFile('packages/acceptance/src/run-project-intelligence-viewer.ts', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('packages/acceptance/package.json', 'utf8')
    ]);

    /* The published tarball's `files` list does not carry packages/design-system, and
       `workspace:*` cannot resolve from a registry. A runtime import therefore works in
       this repository and throws ERR_MODULE_NOT_FOUND on every installed copy — which is
       how the packed-CLI integration test found it. */
    expect(viewerSource).not.toContain("from '@repoassure/design-system");
    expect(viewerSource).toContain("from './generated/design-system-tokens.js'");

    const root = JSON.parse(rootManifest) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      files?: string[];
    };
    const acceptance = JSON.parse(acceptanceManifest) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(root.dependencies?.['@repoassure/design-system']).toBeUndefined();
    expect(root.devDependencies?.['@repoassure/design-system']).toBeDefined();
    expect(acceptance.dependencies?.['@repoassure/design-system']).toBeUndefined();
    // If the design system ever does ship, this is the line that has to change first.
    expect(root.files ?? []).not.toContain('packages/design-system');
  });

  it('emits a self-contained token layer', async () => {
    const generated = await buildConsoleTokensModule();

    expect(generated).toContain('--console-bg');
    expect(generated).toContain('--console-surface');
    expect(generated).toContain('--console-fg');
    expect(generated).toContain('--font-mono');
    // The console must reference nothing it cannot read from disk.
    expect(generated).not.toMatch(/@import/);
    expect(generated).not.toMatch(/url\(/);
    expect(generated).not.toMatch(/https?:/);
  });
});
