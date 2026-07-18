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
    const [
      packageJson,
      indexHtml,
      appSource,
      artifactPreviewSource,
      cliDemoSource,
      heroConsoleSource,
      openCoreDiagramSource,
      assuranceGraphSource,
      trustLedgerPreviewSource,
      i18nSource,
      styles,
      designTokens,
      evidenceSystem,
      responsiveStyles,
      statusChipSource,
      evidenceHashSource,
      verifyWebsite,
      robots,
      sitemap,
      manifest,
      favicon,
      ogImage
    ] =
      await Promise.all([
      readFile('apps/website/package.json', 'utf8'),
      readFile('apps/website/index.html', 'utf8'),
      readFile('apps/website/src/App.tsx', 'utf8'),
      readFile('apps/website/src/ArtifactPreview.tsx', 'utf8'),
      readFile('apps/website/src/CliDemo.tsx', 'utf8'),
      readFile('apps/website/src/HeroConsole.tsx', 'utf8'),
      readFile('apps/website/src/OpenCoreDiagram.tsx', 'utf8'),
      readFile('apps/website/src/AssuranceGraph.tsx', 'utf8'),
      readFile('apps/website/src/TrustLedgerPreview.tsx', 'utf8'),
      readFile('apps/website/src/i18n.ts', 'utf8'),
      readFile('apps/website/src/styles.css', 'utf8'),
      readFile('apps/website/src/styles/tokens.css', 'utf8'),
      readFile('apps/website/src/styles/evidence-system.css', 'utf8'),
      readFile('apps/website/src/styles/responsive.css', 'utf8'),
      readFile('apps/website/src/components/ui/StatusChip.tsx', 'utf8'),
      readFile('apps/website/src/components/ui/EvidenceHash.tsx', 'utf8'),
      readFile('scripts/verify-website.mjs', 'utf8'),
      readFile('apps/website/public/robots.txt', 'utf8'),
      readFile('apps/website/public/sitemap.xml', 'utf8'),
      readFile('apps/website/public/site.webmanifest', 'utf8'),
      readFile('apps/website/public/favicon.svg', 'utf8'),
      readFile('apps/website/public/og-image.svg', 'utf8')
    ]);

    expect(packageJson).toContain('"name": "@repoassure/website"');
    expect(packageJson).toContain('"dev": "vite');
    expect(packageJson).toContain('"build": "vite build');
    expect(packageJson).toContain('"preview": "vite preview');

    expect(indexHtml).toContain('<link rel="canonical" href="https://repoassure.com/" />');
    expect(indexHtml).toContain('<meta name="robots" content="index,follow" />');
    expect(indexHtml).toContain('<meta property="og:title" content="RepoAssure" />');
    expect(indexHtml).toContain('<meta property="og:type" content="website" />');
    expect(indexHtml).toContain('<meta property="og:url" content="https://repoassure.com/" />');
    expect(indexHtml).toContain('<meta property="og:image" content="https://repoassure.com/og-image.svg" />');
    expect(indexHtml).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(indexHtml).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
    expect(indexHtml).toContain('<link rel="manifest" href="/site.webmanifest" />');
    expect(indexHtml).toContain('<meta name="theme-color" content="#04111f" />');
    expect(indexHtml).not.toContain('SaaS is available');
    expect(indexHtml).not.toContain('Team Cloud is available');
    expect(indexHtml).not.toContain('Enterprise is available');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://repoassure.com/sitemap.xml');
    expect(sitemap).toContain('<loc>https://repoassure.com/</loc>');
    expect(sitemap).toContain('<lastmod>2026-07-01</lastmod>');
    expect(manifest).toContain('"name": "RepoAssure"');
    expect(manifest).toContain('"start_url": "/"');
    expect(manifest).toContain('"icons"');
    expect(manifest).toContain('/favicon.svg');
    expect(favicon).toContain('<svg');
    expect(favicon).toContain('RepoAssure');
    expect(ogImage).toContain('<svg');
    expect(ogImage).toContain('RepoAssure');
    expect(ogImage).toContain('Assure every AI-generated repo before it ships');

    expect(appSource).toContain('RepoAssure');
    expect(appSource).toContain('useWebsiteLocale');
    expect(appSource).toContain('AssuranceGraph');
    expect(appSource).not.toContain('TrustLedgerPreview');
    expect(appSource).toContain('HeroConsole');
    expect(appSource).toContain('hero-media');
    expect(appSource).not.toContain('/assets/trust-ledger.png');
    expect(appSource).toContain('data-testid="language-switcher"');
    expect(appSource).toContain('ArtifactPreview');
    expect(appSource).toContain('site-footer-compact');
    expect(appSource).toContain('footer-links');
    expect(artifactPreviewSource).toContain('data-testid="artifact-preview-tabs"');
    expect(appSource).toContain('data-testid="private-preview-form"');
    expect(appSource).toContain('data-testid="assurance-graph-section"');
    expect(cliDemoSource).toContain('data-testid="cli-demo"');
    expect(heroConsoleSource).toContain('data-testid="hero-console"');
    expect(heroConsoleSource).toContain('hero-console-summary');
    expect(heroConsoleSource).not.toContain('cli-terminal-body');
    expect(assuranceGraphSource).toContain('data-testid="assurance-graph-fallback"');
    expect(appSource).not.toContain('data-testid="assurance-pipeline"');

    expect(assuranceGraphSource).toContain('data-testid="assurance-graph"');
    expect(assuranceGraphSource).toContain('graph-svg');
    expect(assuranceGraphSource).toContain('buildGraphEdgePath');
    expect(assuranceGraphSource).toContain('centerLabel');
    expect(assuranceGraphSource).not.toContain('<img');

    expect(trustLedgerPreviewSource).toContain('data-testid="trust-ledger-preview"');
    expect(trustLedgerPreviewSource).toContain('EvidenceHash');
    expect(trustLedgerPreviewSource).toContain('trust-ledger-sidebar');
    expect(trustLedgerPreviewSource).not.toContain('variant');
    expect(trustLedgerPreviewSource).not.toContain('<img');
    expect(trustLedgerPreviewSource).not.toContain('trust-ledger.png');

    expect(appSource).toContain('hero-graph-breath');
    expect(appSource).toContain('hero-highlight');
    expect(appSource).toContain('hero-secondary-link');
    expect(appSource).toContain('OpenCoreDiagram');
    expect(openCoreDiagramSource).toContain('data-testid="open-core-diagram"');
    expect(openCoreDiagramSource).toContain('open-core-diagram-list');
    expect(appSource).toContain('design-partner-note');
    expect(artifactPreviewSource).toContain('artifact-preview-panel-leading');
    expect(artifactPreviewSource).toContain('SeverityChip');
    expect(statusChipSource).toContain("'accent' | 'success'");
    expect(evidenceHashSource).toContain('evidence-hash');

    const stylesheetBundle = [styles, designTokens, evidenceSystem, responsiveStyles].join('\n');

    expect(styles).toContain("@import './styles/tokens.css'");
    expect(styles).toContain("@import './styles/evidence-system.css'");
    expect(styles).toContain("@import './styles/responsive.css'");

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
    expect(i18nSource).toContain('heroRunSummary');
    expect(appSource).not.toContain('#roadmap">{copy.nav');
    expect(i18nSource).toContain('assuranceGraph');
    expect(i18nSource).toContain('assuranceGraphSection');
    expect(i18nSource).toContain('Proof artifacts');
    expect(i18nSource).toContain('证据物料');
    expect(i18nSource).toContain('cliDemo');
    expect(i18nSource).toContain('View assurance graph');
    expect(i18nSource).toContain('highlight:');
    expect(i18nSource).toContain('查看保障图谱');
    expect(i18nSource).toContain('证据模型 · Team Cloud 计划中');
    expect(i18nSource).toContain('100% LOCAL');
    expect(i18nSource).toContain('trustLedgerPreview');
    expect(i18nSource).toContain('Evidence generated locally');
    expect(i18nSource).toContain('本地生成的证据');
    expect(i18nSource).toContain('designPartnerNote');
    expect(i18nSource).toContain('Local-first open core flow');
    expect(i18nSource).toContain('All artifacts are signed and stored locally.');
    expect(i18nSource).toContain('所有证据物料都会在本地签名并存储。');

    for (const pattern of forbiddenClaimPatterns) {
      expect(i18nSource).not.toMatch(pattern);
    }

    expect(designTokens).toContain('/* Brand tokens */');
    expect(designTokens).toContain('/* Semantic tokens */');
    expect(designTokens).toContain('/* Component tokens */');
    expect(stylesheetBundle).toContain('--brand-assurance: #009d5c');
    expect(stylesheetBundle).toContain('--surface-hero: #04111f');
    expect(stylesheetBundle).toContain('--surface-page: #ffffff');
    expect(stylesheetBundle).toContain('--surface-panel: rgba(9, 24, 40, 0.84)');
    expect(stylesheetBundle).toContain('--text-primary: #111827');
    expect(stylesheetBundle).toContain('--text-muted: #526071');
    expect(stylesheetBundle).toContain('--text-on-dark: #f8fafc');
    expect(stylesheetBundle).toContain('--border-subtle: #d8e0ea');
    expect(designTokens).toContain('/* Status — 2 success + 1 accent */');
    expect(stylesheetBundle).toContain('--accent: #009d5c');
    expect(stylesheetBundle).toContain('--accent-emphasis: #36e58b');
    expect(stylesheetBundle).toContain('--status-success: #22d876');
    expect(stylesheetBundle).toContain('--status-success-muted:');
    expect(stylesheetBundle).toContain('--status-success-surface:');
    expect(designTokens).not.toContain('--status-verified:');
    expect(designTokens).not.toContain('--status-generated:');
    expect(stylesheetBundle).toContain('--focus-ring: #8bb5ff');
    expect(stylesheetBundle).toContain('--focus-ring-on-dark: var(--accent-emphasis)');
    expect(stylesheetBundle).toContain('--component-radius-control: 10px');
    expect(styles).toContain('.open-core-diagram');
    expect(styles).toContain('.design-partner-note');
    expect(styles).not.toContain('.assurance-pipeline');
    expect(styles).not.toContain('.artifact-card');
    expect(styles).not.toContain('.hero-assurance-surface');
    expect(styles).not.toContain('.trust-ledger-preview-hero');
    expect(evidenceSystem).toContain('.evidence-hash');
    expect(evidenceSystem).toContain('.severity-chip');
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
    expect(styles).toContain('.graph-svg');
    expect(styles).toContain('aspect-ratio: 640 / 480');
    expect(styles).toContain('.assurance-graph-section');
    expect(styles).toContain('.cli-demo');
    expect(styles).toContain('.artifact-preview-panel');
    expect(styles).toContain('.hero-console');
    expect(styles).toContain('.trust-ledger-preview');
    expect(styles).toContain('@media (max-width: 760px)');
    expect(responsiveStyles).toContain('prefers-reduced-motion');
    expect(responsiveStyles).toContain('.graph-chain-fallback');

    expect(verifyWebsite).toContain('ig_04fa6cbaaebee9cb016a3d1d4ad8088191a53375bdf20065a8.png');
    expect(verifyWebsite).toContain('Assure every AI-generated repo before it ships');
    expect(verifyWebsite).toContain('assurance-graph');
    expect(verifyWebsite).toContain('desktop-focus-dark.png');
    expect(verifyWebsite).toContain('desktop-focus-light.png');
    expect(verifyWebsite).toContain(':focus-visible');
    expect(verifyWebsite).toContain('https://repoassure.com/');
    expect(verifyWebsite).toContain('og:image');
    expect(verifyWebsite).toContain('robots.txt');
    expect(verifyWebsite).toContain('sitemap.xml');
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
    expect(englishSerialized).toContain('View assurance graph');
    expect(englishSerialized).toContain('Evidence model · Team Cloud planned');
    expect(englishSerialized).toContain('Trust Ledger');
    expect(englishSerialized).toContain('Evidence generated locally');
    expect(chineseSerialized).toContain('在交付前保障每个 AI 生成仓库');
    expect(chineseSerialized).toContain('查看保障图谱');
    expect(chineseSerialized).toContain('证据模型 · Team Cloud 计划中');
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

  it('guards P3 pixel polish for responsive public website surfaces', async () => {
    const [styles, responsiveStyles, verifyWebsite] = await Promise.all([
      readFile('apps/website/src/styles.css', 'utf8'),
      readFile('apps/website/src/styles/responsive.css', 'utf8'),
      readFile('scripts/verify-website.mjs', 'utf8')
    ]);
    const stylesheetBundle = [styles, responsiveStyles].join('\n');

    expect(responsiveStyles).toContain('/* P3 pixel polish');
    expect(responsiveStyles).toContain('@media (max-width: 760px)');
    expect(responsiveStyles).toContain('.trust-ledger-table-head');
    expect(responsiveStyles).toContain('.trust-ledger-row');
    expect(responsiveStyles).toContain('grid-template-columns: minmax(0, 1fr)');
    expect(responsiveStyles).toContain('.trust-ledger-evidence .evidence-hash');
    expect(responsiveStyles).toContain('.artifact-detail-meta-inline');
    expect(responsiveStyles).toContain('.artifact-code');
    expect(responsiveStyles).toContain('.graph-chain-fallback');
    expect(responsiveStyles).toContain('.preview-form');
    expect(responsiveStyles).toContain('.site-footer-compact');
    expect(responsiveStyles).toContain('@media (max-width: 430px)');
    expect(stylesheetBundle).toContain('overflow-wrap: anywhere');
    expect(stylesheetBundle).toContain('text-wrap: balance');
    expect(verifyWebsite).toContain('desktop-p3-fold.png');
    expect(verifyWebsite).toContain('mobile-p3-fold.png');
    expect(verifyWebsite).toContain('horizontalOverflow');
  });
});
