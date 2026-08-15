import { readFile } from 'node:fs/promises';

const forbiddenClaimPatterns = [
  /\bSaaS is available\b/i,
  /\bTeam Cloud is available\b/i,
  /\bEnterprise is available\b/i,
  /\bpublic npm package\b/i,
  /\bpublic repository is already published\b/i,
  /\bsource code is uploaded by default\b/i,
  // Integrity claims must match implementation. Content hashing exists; signing does not,
  // and to a security reviewer "signed" means something specific and stronger. This class
  // of claim shipped publicly for weeks because no pattern covered it.
  /\bartifacts are signed\b/i,
  /\bcryptographically signed\b/i,
  /\bdigitally signed\b/i,
  /\bsigned\s+(local\s+)?evidence\b/i,
  /\bsigned\s+artifacts?\b/i,
  /\bsigned\s+(artifact\s+)?bundle\b/i,
  /(证据|物料|产出)[^。]{0,12}签名/,
  /已签名的/,
  /SaaS\s*已(经)?(上线|可用|开放)/,
  /Team Cloud\s*已(经)?(上线|可用|开放)/,
  /Enterprise\s*已(经)?(上线|可用|开放)/,
  /公开\s*npm\s*包\s*已(经)?(发布|可用)/,
  /公开仓库\s*已(经)?发布/,
  /默认上传源代码/
];

describe('forbidden claim patterns', () => {
  // A guard that never fires is not a guard. These are the exact strings the website
  // shipped publicly before the integrity claim was implemented; each must now be caught.
  const previouslyShippedClaims = [
    'Artifacts are signed. Integrity can be verified independent of RepoAssure.',
    'All artifacts are signed and stored locally.',
    'Signed local evidence, repair plans, and acceptance decisions',
    '证据物料会被签名，完整性可独立于 RepoAssure 进行验证。',
    '所有证据物料都会在本地签名并存储。',
    '为 AI 生成仓库提供已签名的本地证据、修复计划和验收决策。'
  ];

  it('catches every integrity claim the site used to make', () => {
    for (const claim of previouslyShippedClaims) {
      const matched = forbiddenClaimPatterns.some((pattern) => pattern.test(claim));
      expect(matched, `no pattern caught: ${claim}`).toBe(true);
    }
  });

  it('does not catch the accurate replacement copy', () => {
    const accurateClaims = [
      'Every artifact is content-hashed and stored locally.',
      'Every artifact records a content fingerprint. Recompute it on another machine and confirm nothing changed — without trusting RepoAssure.',
      'Content-hashed local evidence, repair plans, and acceptance decisions for AI-generated repositories.',
      '每份证据物料都会在本地生成内容指纹并存储。',
      '每份产出都记录了内容指纹。换一台机器重算一遍，就能确认它没被改过——不需要相信 RepoAssure。'
    ];

    for (const claim of accurateClaims) {
      const matched = forbiddenClaimPatterns.filter((pattern) => pattern.test(claim));
      expect(matched, `over-matched: ${claim} by ${matched}`).toEqual([]);
    }
  });
});

describe('information architecture', () => {
  it('states the four questions ADR-0013 records, which the site never carried before', async () => {
    const [appSource, i18nSource] = await Promise.all([
      readFile('apps/website/src/App.tsx', 'utf8'),
      readFile('apps/website/src/i18n.ts', 'utf8')
    ]);

    expect(appSource).toContain('data-testid="answers-section"');
    expect(appSource).toContain('id="answers"');

    for (const question of [
      'Is this repo ready to ship?',
      'What evidence proves it?',
      'What is still blocking acceptance?',
      'What should the AI IDE fix first?'
    ]) {
      expect(i18nSource).toContain(question);
    }
    for (const question of [
      '这个仓库能交付吗？',
      '凭什么证据？',
      '还有什么卡着验收？',
      '下一个 AI IDE 该先修什么？'
    ]) {
      expect(i18nSource).toContain(question);
    }
  });

  it('keeps delivery sequence and delivery roles in separate sections', async () => {
    const appSource = await readFile('apps/website/src/App.tsx', 'utf8');

    // The role cards used to live inside #how-it-works under an i18n key named `steps`,
    // so the section read as neither a sequence nor a cast.
    expect(appSource).toContain('data-testid="roles-section"');
    expect(appSource).toContain('id="roles"');

    const howItWorks = appSource.indexOf('id="how-it-works"');
    const roles = appSource.indexOf('id="roles"');
    // The role cards are whatever renders `steps.items`; asserting on the data they read
    // rather than on a CSS class survives the cards being restyled.
    const roleCards = appSource.indexOf('copy.steps.items.map');
    expect(howItWorks).toBeGreaterThan(-1);
    expect(roles).toBeGreaterThan(howItWorks);
    expect(roleCards).toBeGreaterThan(roles);
  });

  it('marks which assurance graph nodes the distributed CLI can actually reach', async () => {
    const [i18nSource, graphSource] = await Promise.all([
      readFile('apps/website/src/i18n.ts', 'utf8'),
      readFile('apps/website/src/AssuranceGraph.tsx', 'utf8')
    ]);

    // Patch plan and acceptance are pnpm scripts inside this repository. Showing them
    // unqualified implied a chain the shipped CLI does not provide.
    expect(graphSource).toContain('data-reachability={node.reachability}');
    expect(graphSource).toContain('copy.reachabilityLabels.internal');
    expect(i18nSource).toContain("reachabilityLabels: { cli: 'In the CLI', internal: 'Internal tooling' }");
    expect(i18nSource).toContain("reachabilityLabels: { cli: 'CLI 可达', internal: '内部工具' }");

    const internalNodes = i18nSource.match(/reachability: 'internal'/g) ?? [];
    expect(internalNodes.length).toBe(4);
  });

  it('keeps primary navigation at five items', async () => {
    const appSource = await readFile('apps/website/src/App.tsx', 'utf8');
    // Header and footer render the same list, so the list itself is the thing to pin.
    const start = appSource.indexOf('const navLinks = [');
    expect(start).toBeGreaterThan(-1);
    const nav = appSource.slice(start, appSource.indexOf('];', start));

    const links = nav.match(/href: '#/g) ?? [];
    expect(links.length).toBe(5);
    expect(nav).toContain('#answers');
    expect(nav).toContain('#how-it-works');
    expect(nav).toContain('#artifacts');
    expect(nav).toContain('#open-core');
    expect(nav).toContain('#trust');
    expect(appSource).toContain('aria-label="Primary navigation"');
    expect(appSource).toContain('navLinks.map(');
  });

  it('states trust boundary claims a reader can verify rather than adjectives', async () => {
    const i18nSource = await readFile('apps/website/src/i18n.ts', 'utf8');

    // Every one of these is checkable against the source by someone who does not
    // trust the claim. That is the point.
    expect(i18nSource).toContain('Two network calls, both to localhost');
    expect(i18nSource).toContain('targetRepoWriteAuthorized: false');
    expect(i18nSource).toContain('网络调用只有两处，都打本地');
  });
});

describe('public website app', () => {
  it('ships a private-preview website package with guarded public copy', async () => {
    const [
      packageJson,
      indexHtml,
      appSource,
      mainSource,
      artifactPreviewSource,
      openCoreDiagramSource,
      assuranceGraphSource,
      i18nSource,
      styles,
      verifyWebsite,
      robots,
      sitemap,
      manifest,
      favicon,
      ogImage
    ] = await Promise.all([
      readFile('apps/website/package.json', 'utf8'),
      readFile('apps/website/index.html', 'utf8'),
      readFile('apps/website/src/App.tsx', 'utf8'),
      readFile('apps/website/src/main.tsx', 'utf8'),
      readFile('apps/website/src/ArtifactPreview.tsx', 'utf8'),
      readFile('apps/website/src/OpenCoreDiagram.tsx', 'utf8'),
      readFile('apps/website/src/AssuranceGraph.tsx', 'utf8'),
      readFile('apps/website/src/i18n.ts', 'utf8'),
      readFile('apps/website/src/styles.css', 'utf8'),
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
    expect(packageJson).toContain('"@repoassure/design-system": "workspace:*"');

    expect(indexHtml).toContain('<link rel="canonical" href="https://repoassure.com/" />');
    expect(indexHtml).toContain('<meta name="robots" content="index,follow" />');
    expect(indexHtml).toContain('<meta property="og:title" content="RepoAssure" />');
    expect(indexHtml).toContain('<meta property="og:type" content="website" />');
    expect(indexHtml).toContain('<meta property="og:url" content="https://repoassure.com/" />');
    expect(indexHtml).toContain('<meta property="og:image" content="https://repoassure.com/og-image.svg" />');
    expect(indexHtml).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(indexHtml).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
    expect(indexHtml).toContain('<link rel="manifest" href="/site.webmanifest" />');
    expect(indexHtml).toContain('<meta name="theme-color" content="#ffffff" />');
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
    expect(ogImage).toContain('Is this AI-generated repo ready to ship?');

    expect(appSource).toContain('RepoAssure');
    expect(appSource).toContain('useWebsiteLocale');
    expect(appSource).toContain('AssuranceGraph');
    expect(appSource).toContain('ArtifactPreview');
    expect(appSource).not.toContain('TrustLedgerPreview');
    expect(appSource).not.toContain('/assets/trust-ledger.png');
    expect(appSource).toContain('data-testid="hero-console"');
    expect(appSource).toContain('data-testid="language-switcher"');
    expect(appSource).toContain('data-testid="private-preview-form"');
    expect(appSource).toContain('data-testid="assurance-graph-section"');
    expect(appSource).toContain('data-testid="cli-demo"');
    expect(appSource).not.toContain('data-testid="assurance-pipeline"');
    expect(artifactPreviewSource).toContain('data-testid="artifact-preview-tabs"');
    expect(assuranceGraphSource).toContain('data-testid="assurance-graph"');
    expect(assuranceGraphSource).toContain('data-testid="assurance-graph-fallback"');
    expect(assuranceGraphSource).toContain('graph-svg');
    expect(assuranceGraphSource).toContain('buildGraphEdgePath');
    expect(assuranceGraphSource).toContain('centerLabel');
    expect(assuranceGraphSource).not.toContain('<img');
    expect(openCoreDiagramSource).toContain('data-testid="open-core-diagram"');
    expect(openCoreDiagramSource).toContain('open-core-diagram-list');

    /* The design system has to be consumed, not imitated.

       It was vendored, typed, and wired at the token layer while every component on the
       page stayed hand-written: 37 primitives shipped, zero rendered, and 3,543 lines of
       CSS reproducing what the package already provided. Nothing failed, because no gate
       asked whether the package was actually used. These assertions ask. */
    expect(mainSource).toContain("import '@repoassure/design-system/styles'");
    expect(mainSource).toContain("import '@repoassure/design-system/styles/fonts'");
    expect(appSource).toContain("from '@repoassure/design-system'");
    expect(artifactPreviewSource).toContain("from '@repoassure/design-system'");

    for (const component of ['Panel', 'Terminal', 'ScoreGauge', 'StatusChip', 'Button', 'TrustCard', 'StepCard']) {
      expect(appSource, `App.tsx should render the design system ${component}`).toContain(component);
    }
    for (const component of ['TabList', 'SeverityChip', 'KeyValueList']) {
      expect(artifactPreviewSource, `ArtifactPreview should render ${component}`).toContain(component);
    }

    // Component styling belongs to the package. Page CSS carries geometry only, so a
    // local restyling of a shipped primitive should not reappear here.
    for (const shadowed of [
      '.status-chip',
      '.severity-chip',
      '.evidence-hash',
      '.trust-ledger',
      '.step-card',
      '.hero-console'
    ]) {
      expect(styles, `${shadowed} re-implements a design system component`).not.toContain(shadowed);
    }

    // Page geometry, taken from the design system's own reference site.
    expect(styles).toContain('var(--container-max)');
    expect(styles).toContain('var(--section-pad-y)');
    expect(styles).toContain('var(--font-display)');
    expect(styles).toContain('.console-scope');
    expect(styles).toContain('.assurance-graph');
    expect(styles).toContain('.graph-svg');
    expect(styles).toContain('aspect-ratio: 640 / 480');
    expect(styles).toContain('.open-core-diagram');
    expect(styles).toContain('.language-switcher');
    expect(styles).toContain('.graph-chain-fallback');
    expect(styles).toContain('@media (max-width: 760px)');
    expect(styles).toContain('prefers-reduced-motion');
    expect(styles).toContain('a:focus-visible');
    expect(styles).toContain('button:focus-visible');
    expect(styles).toContain('select:focus-visible');
    expect(styles).toContain('input:focus-visible');
    expect(styles).toContain("[role='tab']:focus-visible");
    expect(styles).not.toContain('.assurance-pipeline');

    expect(i18nSource).toContain('defaultLocale =');
    expect(i18nSource).not.toContain('navigator.languages');
    expect(i18nSource).toContain("'en'");
    expect(i18nSource).toContain("'zh-CN'");
    expect(i18nSource).toContain('supportedLocales');
    expect(i18nSource).toContain('roadmapLocales');
    expect(i18nSource).toContain("'ja'");
    expect(i18nSource).toContain("'ko'");
    expect(i18nSource).toContain('Is this AI-generated repo ready to ship?');
    expect(i18nSource).toContain('这个 AI 生成的仓库，能交付了吗？');
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
    expect(i18nSource).toContain('Every artifact is content-hashed and stored locally.');
    expect(i18nSource).toContain('每份证据物料都会在本地生成内容指纹并存储。');

    for (const pattern of forbiddenClaimPatterns) {
      expect(i18nSource).not.toMatch(pattern);
    }

    expect(verifyWebsite).toContain('Is this AI-generated repo ready to ship?');
    expect(verifyWebsite).toContain('assurance-graph');
    expect(verifyWebsite).toContain('desktop-focus-dark.png');
    expect(verifyWebsite).toContain('desktop-focus-light.png');
    expect(verifyWebsite).toContain(':focus-visible');
    expect(verifyWebsite).toContain('https://repoassure.com/');
    expect(verifyWebsite).toContain('og:image');
    expect(verifyWebsite).toContain('robots.txt');
    expect(verifyWebsite).toContain('sitemap.xml');
    // The contrast audit is the gate that caught a 1:1 hero heading. It must survive.
    expect(verifyWebsite).toContain('WCAG AA contrast failures');
    expect(verifyWebsite).toContain('backgroundOf');
  });

  it('keeps shipped website locales complete and guarded against forbidden claims', async () => {
    const { defaultLocale, locales, roadmapLocales, supportedLocales } = await import('../../apps/website/src/i18n.js');

    expect(defaultLocale).toBe('en');
    expect(supportedLocales).toEqual(['en', 'zh-CN']);
    expect(roadmapLocales).toEqual(['ja', 'ko']);
    expect(Object.keys(locales)).toEqual(['en', 'zh-CN']);

    const englishSerialized = JSON.stringify(locales.en);
    const chineseSerialized = JSON.stringify(locales['zh-CN']);

    expect(englishSerialized).toContain('Is this AI-generated repo ready to ship?');
    expect(englishSerialized).toContain('View assurance graph');
    expect(englishSerialized).toContain('Evidence model · Team Cloud planned');
    expect(englishSerialized).toContain('Trust Ledger');
    expect(englishSerialized).toContain('Evidence generated locally');
    expect(chineseSerialized).toContain('这个 AI 生成的仓库，能交付了吗？');
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

  it('keeps the responsive surface intact after the design system swap', async () => {
    const [styles, verifyWebsite] = await Promise.all([
      readFile('apps/website/src/styles.css', 'utf8'),
      readFile('scripts/verify-website.mjs', 'utf8')
    ]);

    /* The responsive rules used to live in their own stylesheet alongside class-by-class
       polish for hand-written components. Those components are now design system
       primitives that carry their own styling, so what is left to guard is the behaviour
       the page still owns: the breakpoints, the two surfaces that swap to a linear
       fallback on narrow screens, and the wrapping that long hashes and CJK need. */
    expect(styles).toContain('@media (max-width: 960px)');
    expect(styles).toContain('@media (max-width: 760px)');
    expect(styles).toContain('overflow-wrap: anywhere');
    expect(styles).toContain('text-wrap: balance');
    expect(styles).toContain('prefers-reduced-motion');

    // Below 760px the force-placed graph and the open-core diagram are unreadable, so
    // each swaps to the list that carries the same data.
    const narrow = styles.slice(styles.indexOf('@media (max-width: 760px)'));
    expect(narrow).toContain('.graph-canvas');
    expect(narrow).toContain('.graph-chain-fallback');
    expect(narrow).toContain('.open-core-diagram-svg');
    expect(narrow).toContain('.open-core-diagram-list');
    // The CTA folds away on a phone; the locale switcher must not.
    expect(narrow).toContain('.header-cta');
    expect(narrow).not.toContain('.header-actions {\n    display: none;');

    expect(verifyWebsite).toContain('desktop-p3-fold.png');
    expect(verifyWebsite).toContain('mobile-p3-fold.png');
    expect(verifyWebsite).toContain('horizontalOverflow');
  });
});
