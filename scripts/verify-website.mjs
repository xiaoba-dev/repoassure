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
  const desktopP3FoldScreenshot = join(outDir, 'desktop-p3-fold.png');
  await desktop.screenshot({ path: desktopP3FoldScreenshot, fullPage: false });
  await desktop.keyboard.press('Tab');
  const darkFocusVisible = await desktop.evaluate(() => globalThis.document.activeElement?.matches(':focus-visible') ?? false);
  const desktopFocusDarkScreenshot = join(outDir, 'desktop-focus-dark.png');
  await desktop.screenshot({ path: desktopFocusDarkScreenshot, fullPage: false });

  await desktop.click('button[role="tab"]:has-text("Repair plan")');
  const selectedTab = await desktop.locator('button[role="tab"][aria-selected="true"]').innerText();
  const repairDetailVisible = await desktop
    .getByText('1 action, sequenced for AI IDE or maintainer execution.')
    .isVisible();

  await desktop.fill('#preview-email', 'reviewer@example.com');
  await desktop.click('form[data-testid="private-preview-form"] button[type="submit"]');
  const formStatus = await desktop.locator('form[data-testid="private-preview-form"] [role="status"]').innerText();
  const heading = await desktop.locator('h1').innerText();
  /* Scoped to the section, not the graph element: the panel around the graph supplies the
     eyebrow and title, so the vocabulary this asserts on is split across both. */
  const assuranceGraphText = await desktop.locator('[data-testid="assurance-graph-section"]').innerText();
  const normalizedAssuranceGraphText = assuranceGraphText.toLowerCase();
  const assuranceGraphSectionVisible = await desktop.locator('[data-testid="assurance-graph-section"]').isVisible();
  const cliDemoVisible = await desktop.locator('[data-testid="cli-demo"]').isVisible();

  await desktop.selectOption('[data-testid="language-switcher"] select', 'zh-CN');
  const zhLang = await desktop.locator('html').getAttribute('lang');
  const zhHeading = await desktop.locator('h1').innerText();
  const zhAssuranceGraphText = await desktop.locator('[data-testid="assurance-graph-section"]').innerText();
  await desktop.click('button[role="tab"]:has-text("修复计划")');
  const zhSelectedTab = await desktop.locator('button[role="tab"][aria-selected="true"]').innerText();
  const zhRepairDetailVisible = await desktop.getByText('1 个动作，可交给 AI IDE 或维护者执行。').isVisible();
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
  const mobileP3FoldScreenshot = join(outDir, 'mobile-p3-fold.png');
  await mobile.screenshot({ path: mobileP3FoldScreenshot, fullPage: false });
  const horizontalOverflow = await mobile.evaluate(() => {
    const root = globalThis.document.documentElement;
    return Math.max(0, root.scrollWidth - root.clientWidth);
  });
  await mobile.click('button[aria-label="切换导航"]');
  const mobileNavVisible = await mobile.locator('nav.nav-open').isVisible();
  const mobileZhHeading = await mobile.locator('h1').innerText();
  const mobileMenuScreenshot = join(outDir, 'mobile-menu.png');
  await mobile.screenshot({ path: mobileMenuScreenshot, fullPage: false });

  /* The side-by-side against the original concept art is a reviewer convenience, and the
     concept lives outside the repository — a path in someone's home directory that a
     fresh clone, a second machine, or CI will not have. It must not be able to fail the
     run: when it is missing the comparison is skipped and reported as skipped. */
  const sourceData = await readFile(sourceConcept)
    .then((buffer) => `data:image/png;base64,${buffer.toString('base64')}`)
    .catch(() => null);
  let comparisonScreenshot = null;

  if (sourceData) {
  const comparison = await browser.newPage({ viewport: { width: 2200, height: 1400 }, deviceScaleFactor: 1 });
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
  comparisonScreenshot = join(outDir, 'comparison-desktop.png');
  await comparison.screenshot({ path: comparisonScreenshot, fullPage: true });
  } else {
    console.warn(`Source concept not found, skipping side-by-side comparison: ${sourceConcept}`);
  }

  /* Contrast audit against the rendered page.

     This exists because the light-default flip shipped an h1 at a 1:1 contrast ratio —
     white text on a white surface — through 642 unit tests, two typecheck passes, lint,
     build, and goal:audit. Every one of those gates checks claims, structure, or
     boundaries. None of them looks at colour, so the most visible possible defect was
     also the least detectable one. */
  const contrastFailures = await desktop.evaluate(() => {
    /* Two serialisations reach this parser. `rgb()`/`rgba()` carry 0-255 channels, but
       anything Chrome resolves through `color-mix()` comes back as `color(srgb r g b / a)`
       with 0-1 channels. Reading the second as if it were the first turns the sticky
       header's 82%-opaque white into near-black and reports every link on it as failing,
       so the two forms have to be told apart before scaling. */
    const px = (value) => {
      const parts = (value.match(/[\d.]+/g) || []).map(Number);
      if (!/^color\(/.test(value)) return parts;
      return parts.map((part, index) => (index < 3 ? part * 255 : part));
    };
    const luminance = (rgb) => {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    // Composite the ancestor chain honouring alpha: semi-transparent panels are common
    // here, and treating them as opaque scores them against the wrong background.
    const backgroundOf = (element) => {
      const layers = [];
      let node = element;
      while (node) {
        const parsed = px(globalThis.getComputedStyle(node).backgroundColor);
        if (parsed.length && (parsed[3] === undefined || parsed[3] > 0)) layers.push(parsed);
        node = node.parentElement;
      }
      layers.push([255, 255, 255, 1]);
      let out = layers[layers.length - 1].slice(0, 3);
      for (let i = layers.length - 2; i >= 0; i -= 1) {
        const layer = layers[i];
        const alpha = layer[3] === undefined ? 1 : layer[3];
        out = [0, 1, 2].map((k) => Math.round(layer[k] * alpha + out[k] * (1 - alpha)));
      }
      return out;
    };
    const ratio = (a, b) => {
      const x = luminance(a);
      const y = luminance(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };

    const failures = [];
    globalThis.document
      .querySelectorAll('h1,h2,h3,h4,p,a,li,span,strong,em,button,label,dt,dd,code')
      .forEach((element) => {
        const text = (element.textContent || '').trim();
        if (!text || element.children.length > 0) return;
        const styles = globalThis.getComputedStyle(element);
        if (styles.display === 'none' || styles.visibility === 'hidden') return;
        if (parseFloat(styles.opacity) < 0.1) return;
        const foreground = px(styles.color);
        if (foreground.length < 3) return;

        const size = parseFloat(styles.fontSize);
        const bold = parseInt(styles.fontWeight, 10) >= 700;
        const large = size >= 24 || (size >= 18.66 && bold);
        const required = large ? 3 : 4.5;
        const measured = ratio(foreground.slice(0, 3), backgroundOf(element));
        if (measured < required) {
          failures.push({
            text: text.slice(0, 48),
            selector: (element.className || element.tagName).toString().slice(0, 40),
            ratio: Number(measured.toFixed(2)),
            required
          });
        }
      });
    return failures;
  });

  if (contrastFailures.length > 0) {
    const detail = contrastFailures
      .slice(0, 8)
      .map((f) => `  ${f.ratio}:1 (needs ${f.required}) — "${f.text}" [${f.selector}]`)
      .join('\n');
    throw new Error(
      `WCAG AA contrast failures: ${contrastFailures.length}\n${detail}`
    );
  }

  if (heading !== 'Is this AI-generated repo ready to ship?') {
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
  if (metadata.themeColor !== '#ffffff') {
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
  if (!ogImageAsset.ok || !ogImageAsset.text.includes('RepoAssure') || !ogImageAsset.text.includes('Is this AI-generated repo ready to ship?')) {
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
  if (horizontalOverflow > 1) {
    throw new Error(`Mobile layout has horizontal overflow: ${horizontalOverflow}px.`);
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
  if (zhLang !== 'zh-CN') {
    throw new Error(`Unexpected zh-CN html lang: ${zhLang}`);
  }
  if (zhHeading !== '这个 AI 生成的仓库，能交付了吗？' || mobileZhHeading !== zhHeading) {
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

  console.log(
    JSON.stringify(
      {
        baseUrl,
        sourceConcept,
        initialLang,
        zhLang,
        desktopScreenshot,
        desktopP3FoldScreenshot,
        desktopFocusDarkScreenshot,
        desktopFocusLightScreenshot,
        zhScreenshot,
        mobileScreenshot,
        mobileP3FoldScreenshot,
        mobileMenuScreenshot,
        comparisonScreenshot,
        horizontalOverflow,
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
