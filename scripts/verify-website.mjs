import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';

import { chromium } from 'playwright';

const baseUrl = process.env.REPOASSURE_WEBSITE_URL ?? 'http://127.0.0.1:5174/';
const outDir = process.env.REPOASSURE_WEBSITE_QA_DIR ?? '/private/tmp/repoassure-website-qa';
const sourceConcept =
  process.env.REPOASSURE_WEBSITE_SOURCE_CONCEPT ??
  '/Users/ycn/.codex/generated_images/019ed932-7b49-71b0-845c-684c2fc10f32/ig_04fa6cbaaebee9cb016a3d1d4ad8088191a53375bdf20065a8.png';

await mkdir(outDir, { recursive: true });

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    console.warn(`Bundled Chromium unavailable, using system Chrome: ${String(error).split('\n')[0]}`);
    return chromium.launch({ headless: true, executablePath: chromePath });
  }
}

async function fetchTextWithRetry(request, url, attempts = 3) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await request.get(url);
      return {
        ok: response.ok(),
        status: response.status(),
        text: await response.text()
      };
    } catch (error) {
      lastError = error;
      await delay(500);
    }
  }

  throw lastError;
}

async function delay(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const browser = await launchBrowser();

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await desktop.goto(baseUrl, { waitUntil: 'networkidle' });
  const metadata = await desktop.evaluate(() => {
    const meta = (selector) => globalThis.document.querySelector(selector)?.getAttribute('content') ?? null;
    const link = (selector) => globalThis.document.querySelector(selector)?.getAttribute('href') ?? null;

    return {
      canonical: link('link[rel="canonical"]'),
      description: meta('meta[name="description"]'),
      robots: meta('meta[name="robots"]'),
      themeColor: meta('meta[name="theme-color"]'),
      favicon: link('link[rel="icon"]'),
      manifest: link('link[rel="manifest"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogType: meta('meta[property="og:type"]'),
      ogUrl: meta('meta[property="og:url"]'),
      ogImage: meta('meta[property="og:image"]'),
      twitterCard: meta('meta[name="twitter:card"]'),
      twitterTitle: meta('meta[name="twitter:title"]'),
      twitterDescription: meta('meta[name="twitter:description"]'),
      twitterImage: meta('meta[name="twitter:image"]')
    };
  });
  const robotsUrl = new URL('/robots.txt', baseUrl).toString();
  const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString();
  const manifestUrl = new URL('/site.webmanifest', baseUrl).toString();
  const faviconUrl = new URL('/favicon.svg', baseUrl).toString();
  const ogImageUrl = new URL('/og-image.svg', baseUrl).toString();
  const [robotsAsset, sitemapAsset, manifestAsset, faviconAsset, ogImageAsset] = await Promise.all([
    fetchTextWithRetry(desktop.request, robotsUrl),
    fetchTextWithRetry(desktop.request, sitemapUrl),
    fetchTextWithRetry(desktop.request, manifestUrl),
    fetchTextWithRetry(desktop.request, faviconUrl),
    fetchTextWithRetry(desktop.request, ogImageUrl)
  ]);
  const initialLang = await desktop.locator('html').getAttribute('lang');
  const desktopScreenshot = join(outDir, 'desktop-full.png');
  await desktop.screenshot({ path: desktopScreenshot, fullPage: true });
  await desktop.keyboard.press('Tab');
  const darkFocusVisible = await desktop.evaluate(() => globalThis.document.activeElement?.matches(':focus-visible') ?? false);
  const desktopFocusDarkScreenshot = join(outDir, 'desktop-focus-dark.png');
  await desktop.screenshot({ path: desktopFocusDarkScreenshot, fullPage: false });

  await desktop.click('button[role="tab"]:has-text("Repair plan")');
  const selectedTab = await desktop.locator('button[role="tab"][aria-selected="true"]').innerText();
  const repairDetailVisible = await desktop
    .getByText('38 actions, sequenced for AI IDE or maintainer execution.')
    .isVisible();

  await desktop.fill('#preview-email', 'reviewer@example.com');
  await desktop.click('form[data-testid="private-preview-form"] button[type="submit"]');
  const formStatus = await desktop.locator('form[data-testid="private-preview-form"] [role="status"]').innerText();
  const heading = await desktop.locator('h1').innerText();
  const assuranceGraphText = await desktop.locator('[data-testid="assurance-graph"]').innerText();
  const normalizedAssuranceGraphText = assuranceGraphText.toLowerCase();
  const assuranceGraphSectionVisible = await desktop.locator('[data-testid="assurance-graph-section"]').isVisible();
  const cliDemoVisible = await desktop.locator('[data-testid="cli-demo"]').isVisible();
  const trustLedgerPreviewVisible = await desktop.locator('[data-testid="trust-ledger-preview"]').isVisible();
  const trustLedgerPreviewText = await desktop.locator('[data-testid="trust-ledger-preview"]').innerText();

  await desktop.selectOption('[data-testid="language-switcher"] select', 'zh-CN');
  const zhLang = await desktop.locator('html').getAttribute('lang');
  const zhHeading = await desktop.locator('h1').innerText();
  const zhAssuranceGraphText = await desktop.locator('[data-testid="assurance-graph"]').innerText();
  await desktop.click('button[role="tab"]:has-text("修复计划")');
  const zhSelectedTab = await desktop.locator('button[role="tab"][aria-selected="true"]').innerText();
  const zhRepairDetailVisible = await desktop.getByText('38 个动作，可交给 AI IDE 或维护者执行。').isVisible();
  const zhTrustLedgerPreviewText = await desktop.locator('[data-testid="trust-ledger-preview"]').innerText();
  const zhScreenshot = join(outDir, 'desktop-zh-full.png');
  await desktop.screenshot({ path: zhScreenshot, fullPage: true });
  await desktop.locator('#preview-email').scrollIntoViewIfNeeded();
  await desktop.locator('#preview-email').focus();
  const lightFocusVisible = await desktop.evaluate(() => globalThis.document.activeElement?.matches(':focus-visible') ?? false);
  const desktopFocusLightScreenshot = join(outDir, 'desktop-focus-light.png');
  await desktop.screenshot({ path: desktopFocusLightScreenshot, fullPage: false });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 1200 }, deviceScaleFactor: 2, isMobile: true });
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' });
  await mobile.selectOption('[data-testid="language-switcher"] select', 'zh-CN');
  const mobileScreenshot = join(outDir, 'mobile-full.png');
  await mobile.screenshot({ path: mobileScreenshot, fullPage: true });
  await mobile.click('button[aria-label="切换导航"]');
  const mobileNavVisible = await mobile.locator('nav.nav-open').isVisible();
  const mobileZhHeading = await mobile.locator('h1').innerText();
  const mobileMenuScreenshot = join(outDir, 'mobile-menu.png');
  await mobile.screenshot({ path: mobileMenuScreenshot, fullPage: false });

  const comparison = await browser.newPage({ viewport: { width: 2200, height: 1400 }, deviceScaleFactor: 1 });
  const sourceData = `data:image/png;base64,${(await readFile(sourceConcept)).toString('base64')}`;
  const desktopData = `data:image/png;base64,${(await readFile(desktopScreenshot)).toString('base64')}`;
  await comparison.setContent(
    `<!doctype html><html><head><style>
      body{margin:0;background:#f3f6fa;font-family:Arial,sans-serif}
      .wrap{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px}
      .panel{background:white;border:1px solid #cfd8e3}
      .label{font:700 18px Arial;padding:14px 18px;border-bottom:1px solid #cfd8e3}
      .frame{height:1280px;overflow:hidden}.frame img{width:100%;display:block}
    </style></head><body><div class="wrap">
      <div class="panel"><div class="label">Source concept</div><div class="frame"><img src="${sourceData}"></div></div>
      <div class="panel"><div class="label">Implementation</div><div class="frame"><img src="${desktopData}"></div></div>
    </div></body></html>`,
    { waitUntil: 'load' }
  );
  const comparisonScreenshot = join(outDir, 'comparison-desktop.png');
  await comparison.screenshot({ path: comparisonScreenshot, fullPage: true });

  if (heading !== 'Assure every AI-generated repo before it ships') {
    throw new Error(`Unexpected hero heading: ${heading}`);
  }
  if (metadata.canonical !== 'https://repoassure.com/') {
    throw new Error(`Unexpected canonical URL: ${metadata.canonical}`);
  }
  if (metadata.description !== 'RepoAssure proves AI-generated repositories are ready to ship with local-first assurance artifacts.') {
    throw new Error(`Unexpected description metadata: ${metadata.description}`);
  }
  if (metadata.robots !== 'index,follow') {
    throw new Error(`Unexpected robots metadata: ${metadata.robots}`);
  }
  if (metadata.themeColor !== '#04111f') {
    throw new Error(`Unexpected theme color: ${metadata.themeColor}`);
  }
  if (metadata.favicon !== '/favicon.svg' || metadata.manifest !== '/site.webmanifest') {
    throw new Error(`Unexpected icon manifest metadata: ${JSON.stringify({ favicon: metadata.favicon, manifest: metadata.manifest })}`);
  }
  if (
    metadata.ogTitle !== 'RepoAssure' ||
    metadata.ogDescription !== 'Local-first assurance artifacts for AI-generated repositories.' ||
    metadata.ogType !== 'website' ||
    metadata.ogUrl !== 'https://repoassure.com/' ||
    metadata.ogImage !== 'https://repoassure.com/og-image.svg'
  ) {
    throw new Error(`Unexpected Open Graph metadata: ${JSON.stringify(metadata)}`);
  }
  if (
    metadata.twitterCard !== 'summary_large_image' ||
    metadata.twitterTitle !== 'RepoAssure' ||
    metadata.twitterDescription !== 'Local-first assurance artifacts for AI-generated repositories.' ||
    metadata.twitterImage !== 'https://repoassure.com/og-image.svg'
  ) {
    throw new Error(`Unexpected Twitter metadata: ${JSON.stringify(metadata)}`);
  }
  if (!robotsAsset.ok || !robotsAsset.text.includes('Allow: /') || !robotsAsset.text.includes('Sitemap: https://repoassure.com/sitemap.xml')) {
    throw new Error(`Unexpected robots.txt response: ${robotsAsset.status} ${robotsAsset.text}`);
  }
  if (!sitemapAsset.ok || !sitemapAsset.text.includes('<loc>https://repoassure.com/</loc>') || !sitemapAsset.text.includes('<lastmod>2026-07-01</lastmod>')) {
    throw new Error(`Unexpected sitemap.xml response: ${sitemapAsset.status} ${sitemapAsset.text}`);
  }
  if (!manifestAsset.ok || !manifestAsset.text.includes('"name": "RepoAssure"') || !manifestAsset.text.includes('/favicon.svg')) {
    throw new Error(`Unexpected web manifest response: ${manifestAsset.status} ${manifestAsset.text}`);
  }
  if (!faviconAsset.ok || !faviconAsset.text.includes('RepoAssure') || !faviconAsset.text.includes('<svg')) {
    throw new Error(`Unexpected favicon response: ${faviconAsset.status} ${faviconAsset.text.slice(0, 120)}`);
  }
  if (!ogImageAsset.ok || !ogImageAsset.text.includes('RepoAssure') || !ogImageAsset.text.includes('Assure every AI-generated repo before it ships')) {
    throw new Error(`Unexpected og-image response: ${ogImageAsset.status} ${ogImageAsset.text.slice(0, 120)}`);
  }
  if (initialLang !== 'en') {
    throw new Error(`Unexpected initial html lang: ${initialLang}`);
  }
  if (!darkFocusVisible || !lightFocusVisible) {
    throw new Error('Expected dark and light focus targets to match :focus-visible.');
  }
  if (selectedTab !== 'Repair plan' || !repairDetailVisible) {
    throw new Error('Artifact tabs did not expose the Repair plan detail.');
  }
  if (!formStatus.includes('Request noted locally')) {
    throw new Error(`Unexpected private preview form status: ${formStatus}`);
  }
  if (!mobileNavVisible) {
    throw new Error('Mobile navigation did not open.');
  }
  if (
    !assuranceGraphSectionVisible ||
    !cliDemoVisible ||
    !normalizedAssuranceGraphText.includes('assurance graph') ||
    !assuranceGraphText.includes('All checks verified') ||
    !assuranceGraphText.includes('Repair Plan') ||
    !assuranceGraphText.includes('Acceptance')
  ) {
    throw new Error('English Assurance Graph did not render expected v0.2 text.');
  }
  if (
    !trustLedgerPreviewVisible ||
    !trustLedgerPreviewText.includes('Trust Ledger') ||
    !trustLedgerPreviewText.includes('Evidence generated locally') ||
    !trustLedgerPreviewText.includes('Hardening report') ||
    !trustLedgerPreviewText.includes('All artifacts are signed and stored locally.')
  ) {
    throw new Error('English Trust Ledger preview did not render expected localized text.');
  }
  if (zhLang !== 'zh-CN') {
    throw new Error(`Unexpected zh-CN html lang: ${zhLang}`);
  }
  if (zhHeading !== '在交付前保障每个 AI 生成仓库' || mobileZhHeading !== zhHeading) {
    throw new Error(`Unexpected zh-CN hero heading: ${zhHeading} / ${mobileZhHeading}`);
  }
  if (
    !zhAssuranceGraphText.includes('保障图谱') ||
    !zhAssuranceGraphText.includes('所有检查已验证') ||
    !zhAssuranceGraphText.includes('修复计划') ||
    !zhAssuranceGraphText.includes('验收决策')
  ) {
    throw new Error('zh-CN Assurance Graph did not render expected v0.2 text.');
  }
  if (zhSelectedTab !== '修复计划' || !zhRepairDetailVisible) {
    throw new Error('zh-CN artifact tabs did not expose the Repair plan detail.');
  }
  if (
    !zhTrustLedgerPreviewText.includes('信任账本') ||
    !zhTrustLedgerPreviewText.includes('本地生成的证据') ||
    !zhTrustLedgerPreviewText.includes('硬化报告') ||
    !zhTrustLedgerPreviewText.includes('所有证据物料都会在本地签名并存储。')
  ) {
    throw new Error('zh-CN Trust Ledger preview did not render expected localized text.');
  }

  console.log(
    JSON.stringify(
      {
        baseUrl,
        sourceConcept,
        initialLang,
        zhLang,
        desktopScreenshot,
        desktopFocusDarkScreenshot,
        desktopFocusLightScreenshot,
        zhScreenshot,
        mobileScreenshot,
        mobileMenuScreenshot,
        comparisonScreenshot,
        heading,
        zhHeading,
        selectedTab,
        zhSelectedTab,
        assuranceGraphSectionVisible,
        cliDemoVisible,
        repairDetailVisible,
        zhRepairDetailVisible,
        formStatus,
        mobileNavVisible,
        mobileZhHeading,
        trustLedgerPreviewVisible,
        metadata,
        robotsUrl,
        sitemapUrl,
        manifestUrl,
        faviconUrl,
        ogImageUrl
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
