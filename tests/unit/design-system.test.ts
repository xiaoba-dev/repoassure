import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readDesignSystemCss } from '@repoassure/design-system/css';

const packageRoot = join(process.cwd(), 'packages/design-system');

const componentGroups = ['core', 'layout', 'navigation', 'forms', 'data', 'feedback'];

async function listComponents(): Promise<Array<{ group: string; name: string }>> {
  const entries: Array<{ group: string; name: string }> = [];
  for (const group of componentGroups) {
    const files = await readdir(join(packageRoot, 'components', group));
    for (const file of files) {
      if (file.endsWith('.jsx')) {
        entries.push({ group, name: file.slice(0, -4) });
      }
    }
  }
  return entries;
}

describe('design system package', () => {
  it('vendors every component with a matching declaration file', async () => {
    const components = await listComponents();
    expect(components.length).toBe(37);

    for (const { group, name } of components) {
      const declaration = await readFile(
        join(packageRoot, 'components', group, `${name}.d.ts`),
        'utf8'
      );
      // The design system shipped props interfaces but never declared the components
      // themselves, so importing one would resolve to a missing export. The vendoring
      // step appends the declaration; this guards against that step being skipped.
      expect(declaration).toContain(`export interface ${name}Props`);
      expect(declaration).toContain(`export declare function ${name}(props: ${name}Props): ReactElement`);
    }
  });

  it('exports every vendored component from the barrel', async () => {
    const components = await listComponents();
    const [barrelJs, barrelTypes] = await Promise.all([
      readFile(join(packageRoot, 'index.js'), 'utf8'),
      readFile(join(packageRoot, 'index.d.ts'), 'utf8')
    ]);

    for (const { group, name } of components) {
      expect(barrelJs).toContain(`export { ${name} } from './components/${group}/${name}.jsx';`);
      expect(barrelTypes).toContain(
        `export { ${name}, type ${name}Props } from './components/${group}/${name}';`
      );
    }
  });

  it('returns a flattened token layer with no unresolved imports', () => {
    const css = readDesignSystemCss();

    expect(css).toContain('--fg-default');
    expect(css).toContain('--accent-fg');
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('--console-bg');
    // Standalone HTML surfaces have no bundler to resolve @import.
    expect(css).not.toContain('@import');
  });

  it('keeps the token layer free of external references', () => {
    // The Project Intelligence Console inlines this string and its output is asserted
    // to contain no http:// or https://, so the token layer must carry none — including
    // inside comments, which a substring check cannot distinguish from a real reference.
    expect(readDesignSystemCss()).not.toMatch(/https?:\/\//);
  });

  it('loads fonts from a separate opt-in stylesheet, not the token layer', async () => {
    const [tokenEntry, fonts] = await Promise.all([
      readFile(join(packageRoot, 'styles/index.css'), 'utf8'),
      readFile(join(packageRoot, 'styles/fonts.css'), 'utf8')
    ]);

    // Must not @import fonts. Checking for the bare substring would also match the
    // comment in index.css that points readers at the opt-in stylesheet.
    const tokenEntryImports = [...tokenEntry.matchAll(/@import\s+'([^']+)'/g)].map(
      (match) => match[1]
    );
    expect(tokenEntryImports).not.toContain('./fonts.css');
    expect(tokenEntryImports).toEqual([
      './tokens/colors.css',
      './tokens/typography.css',
      './tokens/spacing.css',
      './tokens/effects.css',
      './base.css'
    ]);

    expect(fonts).toContain('@fontsource/space-grotesk');
    expect(fonts).toContain('@fontsource/hanken-grotesk');
    expect(fonts).toContain('@fontsource/jetbrains-mono');
  });

  it('self-hosts the brand faces instead of fetching them from a font CDN', async () => {
    const fonts = await readFile(join(packageRoot, 'styles/fonts.css'), 'utf8');

    // Upstream shipped a single @import against a third-party font CDN. Reintroducing
    // any external font reference would contradict the product's local-first claim.
    expect(fonts).not.toMatch(/https?:\/\//);
    expect(fonts).not.toContain('fonts.googleapis');
    expect(fonts).not.toContain('fonts.gstatic');
  });

  it('resolves CJK through system faces rather than shipping a webfont', async () => {
    const typography = await readFile(join(packageRoot, 'styles/tokens/typography.css'), 'utf8');

    // @fontsource/noto-sans-sc is 71.6 MB because it covers the full Han repertoire.
    expect(typography).toContain('PingFang SC');
    expect(typography).toContain('Microsoft YaHei');
    expect(typography).toContain('Noto Sans CJK SC');

    const fonts = await readFile(join(packageRoot, 'styles/fonts.css'), 'utf8');
    expect(fonts).not.toContain('noto-sans-sc');
  });
});
