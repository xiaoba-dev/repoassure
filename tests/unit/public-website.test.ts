import { readFile } from 'node:fs/promises';

const forbiddenClaimPatterns = [
  /\bSaaS is available\b/i,
  /\bTeam Cloud is available\b/i,
  /\bEnterprise is available\b/i,
  /\bpublic npm package\b/i,
  /\bpublic repository is already published\b/i,
  /\bsource code is uploaded by default\b/i,
  /SaaS\s*已(经)?(上线|可用|开放)/,
  /Team Cloud\s*已(经)?(上线|可用|开放)/,
  /Enterprise\s*已(经)?(上线|可用|开放)/,
  /公开\s*npm\s*包\s*已(经)?(发布|可用)/,
  /公开仓库\s*已(经)?发布/,
  /默认上传源代码/
];

describe('public website app', () => {
  it('ships a private-preview website package with guarded public copy', async () => {
    const [packageJson, appSource, assuranceGraphSource, trustLedgerPreviewSource, i18nSource, styles, verifyWebsite] =
      await Promise.all([
      readFile('apps/website/package.json', 'utf8'),
      readFile('apps/website/src/App.tsx', 'utf8'),
      readFile('apps/website/src/AssuranceGraph.tsx', 'utf8'),
      readFile('apps/website/src/TrustLedgerPreview.tsx', 'utf8'),
      readFile('apps/website/src/i18n.ts', 'utf8'),
      readFile('apps/website/src/styles.css', 'utf8'),
      readFile('scripts/verify-website.mjs', 'utf8')
    ]);

    expect(packageJson).toContain('"name": "@repoassure/website"');
    expect(packageJson).toContain('"dev": "vite');
    expect(packageJson).toContain('"build": "vite build');
    expect(packageJson).toContain('"preview": "vite preview');

    expect(appSource).toContain('RepoAssure');
    expect(appSource).toContain('useWebsiteLocale');
    expect(appSource).toContain('AssuranceGraph');
    expect(appSource).toContain('TrustLedgerPreview');
    expect(appSource).not.toContain('/assets/trust-ledger.png');
    expect(appSource).toContain('data-testid="language-switcher"');
    expect(appSource).toContain('data-testid="artifact-preview-tabs"');
    expect(appSource).toContain('data-testid="private-preview-form"');
    expect(appSource).toContain('data-testid="assurance-pipeline"');

    expect(assuranceGraphSource).toContain('data-testid="assurance-graph"');
    expect(assuranceGraphSource).toContain('centerLabel');
    expect(assuranceGraphSource).not.toContain('<img');

    expect(trustLedgerPreviewSource).toContain('data-testid="trust-ledger-preview"');
    expect(trustLedgerPreviewSource).not.toContain('<img');
    expect(trustLedgerPreviewSource).not.toContain('trust-ledger.png');

    expect(i18nSource).toContain('defaultLocale =');
    expect(i18nSource).not.toContain('navigator.languages');
    expect(i18nSource).toContain("'en'");
    expect(i18nSource).toContain("'zh-CN'");
    expect(i18nSource).toContain('supportedLocales');
    expect(i18nSource).toContain('roadmapLocales');
    expect(i18nSource).toContain("'ja'");
    expect(i18nSource).toContain("'ko'");
    expect(i18nSource).toContain('Assure every AI-generated repo before it ships');
    expect(i18nSource).toContain('在交付前保障每个 AI 生成仓库');
    expect(i18nSource).toContain('加入私密预览');
    expect(i18nSource).toContain('assuranceGraph');
    expect(i18nSource).toContain('Assurance Graph');
    expect(i18nSource).toContain('View evidence model');
    expect(i18nSource).toContain('Evidence never leaves your machine.');
    expect(i18nSource).toContain('100% LOCAL');
    expect(i18nSource).toContain('trustLedgerPreview');
    expect(i18nSource).toContain('Evidence generated locally');
    expect(i18nSource).toContain('本地生成的证据');
    expect(i18nSource).toContain('All artifacts are signed and stored locally.');
    expect(i18nSource).toContain('所有证据物料都会在本地签名并存储。');

    for (const pattern of forbiddenClaimPatterns) {
      expect(i18nSource).not.toMatch(pattern);
    }

    expect(styles).toContain('/* Brand tokens */');
    expect(styles).toContain('/* Semantic tokens */');
    expect(styles).toContain('/* Component tokens */');
    expect(styles).toContain('--brand-assurance: #009d5c');
    expect(styles).toContain('--surface-hero: #04111f');
    expect(styles).toContain('--surface-page: #ffffff');
    expect(styles).toContain('--surface-panel: rgba(9, 24, 40, 0.84)');
    expect(styles).toContain('--text-primary: #111827');
    expect(styles).toContain('--text-muted: #526071');
    expect(styles).toContain('--text-on-dark: #f8fafc');
    expect(styles).toContain('--border-subtle: #d8e0ea');
    expect(styles).toContain('--status-verified: #24d979');
    expect(styles).toContain('--status-generated: #22d876');
    expect(styles).toContain('--status-accepted: #22d876');
    expect(styles).toContain('--focus-ring: #8bb5ff');
    expect(styles).toContain('--focus-ring-on-dark: #36e58b');
    expect(styles).toContain('--component-radius-control: 10px');
    expect(styles).toContain('.theme-dark');
    expect(styles).toContain('.theme-light');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('a:focus-visible');
    expect(styles).toContain('button:focus-visible');
    expect(styles).toContain('select:focus-visible');
    expect(styles).toContain('input:focus-visible');
    expect(styles).toContain('[role="tab"]:focus-visible');
    expect(styles).toContain('.language-switcher');
    expect(styles).toContain('.assurance-graph');
    expect(styles).toContain('.assurance-pipeline');
    expect(styles).toContain('.trust-ledger-preview');
    expect(styles).toContain('@media (max-width: 760px)');
    expect(styles).toContain('prefers-reduced-motion');

    expect(verifyWebsite).toContain('ig_04fa6cbaaebee9cb016a3d1d4ad8088191a53375bdf20065a8.png');
    expect(verifyWebsite).toContain('Assure every AI-generated repo before it ships');
    expect(verifyWebsite).toContain('assurance-graph');
    expect(verifyWebsite).toContain('desktop-focus-dark.png');
    expect(verifyWebsite).toContain('desktop-focus-light.png');
    expect(verifyWebsite).toContain(':focus-visible');
  });

  it('keeps shipped website locales complete and guarded against forbidden claims', async () => {
    const { defaultLocale, locales, roadmapLocales, supportedLocales } = await import('../../apps/website/src/i18n.js');

    expect(defaultLocale).toBe('en');
    expect(supportedLocales).toEqual(['en', 'zh-CN']);
    expect(roadmapLocales).toEqual(['ja', 'ko']);
    expect(Object.keys(locales)).toEqual(['en', 'zh-CN']);

    const englishSerialized = JSON.stringify(locales.en);
    const chineseSerialized = JSON.stringify(locales['zh-CN']);

    expect(englishSerialized).toContain('Assure every AI-generated repo before it ships');
    expect(englishSerialized).toContain('View evidence model');
    expect(englishSerialized).toContain('Evidence never leaves your machine.');
    expect(englishSerialized).toContain('Trust Ledger');
    expect(englishSerialized).toContain('Evidence generated locally');
    expect(chineseSerialized).toContain('在交付前保障每个 AI 生成仓库');
    expect(chineseSerialized).toContain('查看证据模型');
    expect(chineseSerialized).toContain('证据永远不会离开你的机器。');
    expect(chineseSerialized).toContain('信任账本');
    expect(chineseSerialized).toContain('本地生成的证据');
    expect(chineseSerialized).toContain('加入私密预览');
    expect(chineseSerialized).toContain('计划中');

    for (const locale of supportedLocales) {
      const serialized = JSON.stringify(locales[locale]);
      for (const pattern of forbiddenClaimPatterns) {
        expect(serialized).not.toMatch(pattern);
      }
    }
  });
});
