import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { BrowserInteractionResult, ExploreBrowserDriver } from './explore-app.js';

export interface PlaywrightBrowserLauncher {
  launch: (options: { headless: boolean }) => Promise<PlaywrightBrowserLike>;
}

export type PlaywrightWaitUntil = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';

export class BrowserUnavailableError extends Error {
  readonly installCommand = 'npx playwright install chromium';

  constructor(cause: Error) {
    super(
      'Playwright browser executable is missing, so browser mode cannot start. ' +
        'Run `npx playwright install chromium` (or `npx playwright install chromium-headless-shell`) and retry. ' +
        `Original error: ${cause.message}`
    );
    this.name = 'BrowserUnavailableError';
    this.cause = cause;
  }
}

function isMissingExecutableError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    /executable doesn't exist|download new browsers/iu.test(error.message)
  );
}

export interface CreatePlaywrightBrowserDriverInput {
  launcher?: PlaywrightBrowserLauncher;
  headless?: boolean;
  navigationTimeoutMs?: number;
  waitUntil?: PlaywrightWaitUntil;
  storageStatePath?: string;
  trace?: boolean;
}

interface PlaywrightBrowserLike {
  newPage: () => Promise<PlaywrightPageLike>;
  newContext?: (options: { storageState?: string }) => Promise<PlaywrightBrowserContextLike>;
  close: () => Promise<void>;
}

interface PlaywrightBrowserContextLike {
  newPage: () => Promise<PlaywrightPageLike>;
  tracing?: {
    start: (options: { screenshots: boolean; snapshots: boolean; sources: boolean }) => Promise<void>;
    stop: (options: { path: string }) => Promise<void>;
  };
  close: () => Promise<void>;
}

interface PlaywrightPageLike {
  on: (event: string, handler: (value: unknown) => void) => void;
  goto: (url: string, options: { waitUntil: PlaywrightWaitUntil; timeout: number }) => Promise<PlaywrightResponseLike | null>;
  content: () => Promise<string>;
  locator: (selector: string) => { innerText: () => Promise<string> };
  $$eval: (selector: string, pageFunction: (elements: unknown[]) => unknown) => Promise<unknown>;
  url: () => string;
  fill: (selector: string, value: string, options: { timeout: number }) => Promise<void>;
  click: (selector: string, options: { timeout: number }) => Promise<void>;
  waitForTimeout: (milliseconds: number) => Promise<void>;
  screenshot: (options: { path: string; fullPage: boolean }) => Promise<unknown>;
  close: () => Promise<void>;
}

interface PlaywrightResponseLike {
  status: () => number;
}

interface InteractionCandidate {
  selector: string;
  description: string;
  kind: 'click' | 'form';
  riskText: string;
  href: string | null;
}

interface FillCandidate {
  selector: string;
  value: string;
  riskText: string;
}

interface FormFillResult {
  filled: number;
  skipped: number;
}

const collectAnchorHrefsInBrowser = new Function(
  'anchors',
  `
return anchors.flatMap(function(anchor) {
  if (typeof anchor !== 'object' || anchor === null) {
    return [];
  }

  return typeof anchor.href === 'string' ? [anchor.href] : [];
});
`
) as (elements: unknown[]) => unknown;

const collectElementStatesInBrowser = new Function(
  'elements',
  `
return elements.flatMap(function(element) {
  if (typeof element !== 'object' || element === null) {
    return [];
  }

  var readAttribute = function(name) {
    if (typeof element.getAttribute !== 'function') {
      return '';
    }

    var value = element.getAttribute(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  var className = typeof element.className === 'string' ? element.className : '';
  var textContent = typeof element.textContent === 'string' ? element.textContent.trim() : '';
  var checked = typeof element.checked === 'boolean' ? String(element.checked) : '';
  var value = typeof element.value === 'string' ? element.value : '';

  return [JSON.stringify({
    ariaPressed: readAttribute('aria-pressed'),
    ariaSelected: readAttribute('aria-selected'),
    ariaExpanded: readAttribute('aria-expanded'),
    dataState: readAttribute('data-state'),
    className: className,
    checked: checked,
    value: value,
    textContent: textContent.slice(0, 200)
  })];
});
`
) as (elements: unknown[]) => unknown;

const collectInteractionCandidatesInBrowser = new Function(
  'elements',
  `
return elements.flatMap(function(element, index) {
  if (typeof element !== 'object' || element === null) {
    return [];
  }

  var readAttribute = function(name) {
    if (typeof element.getAttribute !== 'function') {
      return '';
    }

    var value = element.getAttribute(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  var escapeIdentifier = function(value) {
    return value.replace(/[^a-zA-Z0-9_-]/g, '\\\\$&');
  };
  var escapeAttribute = function(value) {
    return value.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\\\"');
  };
  var tagName = typeof element.tagName === 'string' ? element.tagName.toLowerCase() : 'control';
  var rect = typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null;
  var style = typeof window !== 'undefined' && typeof window.getComputedStyle === 'function'
    ? window.getComputedStyle(element)
    : null;
  var ariaHidden = readAttribute('aria-hidden').toLowerCase() === 'true';
  var disabled = typeof element.disabled === 'boolean' ? element.disabled : false;
  var hidden = typeof element.hidden === 'boolean' ? element.hidden : false;
  var visible = !ariaHidden
    && !disabled
    && !hidden
    && (!rect || (rect.width > 0 && rect.height > 0))
    && (!style || (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'));

  if (!visible) {
    return [];
  }

  var textContent = typeof element.textContent === 'string' ? element.textContent.trim() : '';
  var valueText = typeof element.value === 'string' ? element.value.trim() : '';
  var ariaLabel = readAttribute('aria-label');
  var title = readAttribute('title');
  var name = readAttribute('name');
  var testId = readAttribute('data-testid');
  var id = readAttribute('id');
  var href = readAttribute('href');
  var action = readAttribute('formaction') || readAttribute('action');
  var selected = readAttribute('aria-pressed').toLowerCase() === 'true'
    || readAttribute('aria-selected').toLowerCase() === 'true'
    || readAttribute('aria-current') !== ''
    || ['active', 'selected', 'checked'].indexOf(readAttribute('data-state').toLowerCase()) >= 0;
  var hardeningId = 'hardening-action-' + index;
  var label = ariaLabel || title || textContent || valueText || testId || id || tagName;
  var selector = '';

  if (testId) {
    selector = '[data-testid="' + escapeAttribute(testId) + '"]:visible';
  } else if (id) {
    selector = '#' + escapeIdentifier(id);
  } else if (ariaLabel) {
    selector = '[aria-label="' + escapeAttribute(ariaLabel) + '"]:visible';
  } else if (title) {
    selector = '[title="' + escapeAttribute(title) + '"]:visible';
  } else if (textContent && textContent.length <= 80) {
    selector = tagName + ':visible:text-is("' + escapeAttribute(textContent) + '")';
  } else if (typeof element.setAttribute === 'function') {
    element.setAttribute('data-hardening-id', hardeningId);
    selector = '[data-hardening-id="' + escapeAttribute(hardeningId) + '"]';
  } else {
    selector = tagName + ':nth-of-type(' + (index + 1) + ')';
  }

  var verb = tagName === 'input' ? 'Submit' : 'Click';
  var kind = tagName === 'input' ? 'form' : 'click';

  return [{
    selector: selector,
    description: verb + ' "' + label.slice(0, 80) + '"',
    kind: kind,
    riskText: [label, ariaLabel, title, name, testId, id, href, action, selected ? 'state:selected' : ''].join(' '),
    href: href || null
  }];
});
`
) as (elements: unknown[]) => unknown;

const collectFillCandidatesInBrowser = new Function(
  'elements',
  `
return elements.flatMap(function(element, index) {
  if (typeof element !== 'object' || element === null) {
    return [];
  }

  var readAttribute = function(name) {
    if (typeof element.getAttribute !== 'function') {
      return '';
    }

    var value = element.getAttribute(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  var escapeIdentifier = function(value) {
    return value.replace(/[^a-zA-Z0-9_-]/g, '\\\\$&');
  };
  var escapeAttribute = function(value) {
    return value.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\\\"');
  };
  var tagName = typeof element.tagName === 'string' ? element.tagName.toLowerCase() : 'input';
  var type = readAttribute('type').toLowerCase() || (tagName === 'textarea' ? 'textarea' : 'text');
  var disabled = typeof element.disabled === 'boolean' ? element.disabled : false;
  var readOnly = typeof element.readOnly === 'boolean' ? element.readOnly : false;

  if (disabled || readOnly || type === 'hidden' || type === 'file' || type === 'submit' || type === 'button' || type === 'checkbox' || type === 'radio') {
    return [];
  }

  var name = readAttribute('name');
  var autocomplete = readAttribute('autocomplete');
  var placeholder = readAttribute('placeholder');
  var ariaLabel = readAttribute('aria-label');
  var testId = readAttribute('data-testid');
  var id = readAttribute('id');
  var hardeningId = 'hardening-fill-' + index;
  var selector = '';

  if (testId) {
    selector = '[data-testid="' + escapeAttribute(testId) + '"]';
  } else if (id) {
    selector = '#' + escapeIdentifier(id);
  } else if (typeof element.setAttribute === 'function') {
    element.setAttribute('data-hardening-fill-id', hardeningId);
    selector = '[data-hardening-fill-id="' + escapeAttribute(hardeningId) + '"]';
  } else {
    selector = tagName + ':nth-of-type(' + (index + 1) + ')';
  }

  var value = 'Hardening Test';

  if (type === 'email' || /email/i.test(name + ' ' + placeholder + ' ' + ariaLabel + ' ' + autocomplete)) {
    value = 'test@example.com';
  } else if (type === 'tel') {
    value = '15555550123';
  } else if (type === 'url') {
    value = 'https://example.com';
  } else if (type === 'number') {
    value = '1';
  } else if (type === 'search') {
    value = 'hardening test';
  }

  return [{
    selector: selector,
    value: value,
    riskText: [type, name, autocomplete, placeholder, ariaLabel, testId, id].join(' ')
  }];
});
`
) as (elements: unknown[]) => unknown;

export async function createPlaywrightBrowserDriver(input: CreatePlaywrightBrowserDriverInput = {}): Promise<ExploreBrowserDriver> {
  const launcher = input.launcher ?? (await loadDefaultLauncher());
  let browser: PlaywrightBrowserLike;

  try {
    browser = await launcher.launch({ headless: input.headless ?? true });
  } catch (error) {
    if (isMissingExecutableError(error)) {
      throw new BrowserUnavailableError(error);
    }

    throw error;
  }
  const navigationTimeoutMs = input.navigationTimeoutMs ?? 15_000;
  /* 'load' instead of 'networkidle': dev servers with HMR sockets never reach network
     idle, so 'networkidle' turns every healthy local app into a navigation timeout. */
  const waitUntil = input.waitUntil ?? 'load';

  return {
    snapshot: async (url, options) => {
      const traceEnabled = input.trace === true;
      const { page, context, closeContext } = await newPageForSnapshot(browser, input.storageStatePath, traceEnabled);
      const consoleErrors: ConsoleErrorRecord[] = [];
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];
      const failedResponses: FailedResponseRecord[] = [];
      const artifactPath = artifactPathForUrl(options.artifactsDir, url);
      const tracePath = traceEnabled ? tracePathForUrl(options.artifactsDir, url) : null;
      let traceStarted = false;

      page.on('console', (message) => {
        const consoleError = getConsoleError(message);
        if (consoleError) {
          consoleErrors.push(consoleError);
        }
      });
      page.on('pageerror', (error) => {
        pageErrors.push(formatUnknownError(error));
      });
      page.on('requestfailed', (request) => {
        failedRequests.push(formatFailedRequest(request));
      });
      /* requestfailed does not fire for HTTP 4xx/5xx — those are successful
         responses as far as the browser is concerned — so a 404 subresource would
         otherwise leave only Chrome's console text, which deliberately omits the
         URL. Watching responses is what turns it into an actionable finding. */
      page.on('response', (response) => {
        const failedResponse = getFailedResponse(response, readPageUrl(page));
        if (failedResponse) {
          failedResponses.push(failedResponse);
        }
      });

      try {
        await mkdir(options.artifactsDir, { recursive: true });
        if (tracePath && context?.tracing) {
          await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
          traceStarted = true;
        }

        const response = await page.goto(url, {
          waitUntil,
          timeout: navigationTimeoutMs
        });
        const html = await page.content();
        const bodyText = await readBodyText(page);
        const links = await readLinks(page);
        const artifactFiles = [artifactPath];

        await page.screenshot({ path: artifactPath, fullPage: true });
        const interactions = await collectInteractions(page, options.maxActionsPerRoute);

        if (tracePath && traceStarted && context?.tracing) {
          await context.tracing.stop({ path: tracePath });
          traceStarted = false;
          artifactFiles.push(tracePath);
        }

        return {
          url,
          status: response?.status() ?? 0,
          html,
          bodyText,
          links,
          consoleErrors: buildConsoleErrorEvidence(consoleErrors, failedResponses),
          pageErrors,
          failedRequests: dedupe([
            ...failedRequests,
            ...failedResponses.map((failedResponse) => formatFailedResponse(failedResponse, url))
          ]),
          artifactFiles,
          interactions
        };
      } finally {
        if (traceStarted && tracePath && context?.tracing) {
          await context.tracing.stop({ path: tracePath });
        }
        await page.close();
        await closeContext();
      }
    },
    close: async () => {
      await browser.close();
    }
  };
}

async function newPageForSnapshot(
  browser: PlaywrightBrowserLike,
  storageStatePath: string | undefined,
  forceContext: boolean
): Promise<{ page: PlaywrightPageLike; context?: PlaywrightBrowserContextLike; closeContext: () => Promise<void> }> {
  if (!storageStatePath && !forceContext) {
    return {
      page: await browser.newPage(),
      closeContext: async () => undefined
    };
  }

  if (!browser.newContext) {
    throw new Error('Playwright browser context storage state is not available');
  }

  const context = await browser.newContext({
    ...(storageStatePath ? { storageState: storageStatePath } : {})
  });

  return {
    page: await context.newPage(),
    context,
    closeContext: async () => {
      await context.close();
    }
  };
}

async function loadDefaultLauncher(): Promise<PlaywrightBrowserLauncher> {
  const moduleName = 'playwright';
  const playwright = (await import(moduleName)) as { chromium?: PlaywrightBrowserLauncher };

  if (!playwright.chromium) {
    throw new Error('Playwright chromium launcher is not available');
  }

  return playwright.chromium;
}

async function readBodyText(page: PlaywrightPageLike): Promise<string> {
  try {
    return await page.locator('body').innerText();
  } catch {
    return '';
  }
}

async function readLinks(page: PlaywrightPageLike): Promise<string[]> {
  const value = await page.$$eval('a[href]', collectAnchorHrefsInBrowser);

  return parseStringArray(value);
}

async function collectInteractions(page: PlaywrightPageLike, maxActionsPerRoute: number): Promise<BrowserInteractionResult[]> {
  if (maxActionsPerRoute <= 0) {
    return [];
  }

  let candidates = await readInteractionCandidates(page);
  const interactions: BrowserInteractionResult[] = [];
  const seenSelectors = new Set<string>();
  let attemptedActions = 0;
  let candidateIndex = 0;
  let downloadCount = 0;

  page.on('download', () => {
    downloadCount += 1;
  });

  while (candidateIndex < candidates.length) {
    const candidate = candidates[candidateIndex];
    candidateIndex += 1;

    if (!candidate) {
      break;
    }

    if (seenSelectors.has(candidate.selector)) {
      continue;
    }
    seenSelectors.add(candidate.selector);

    const unsafeReason = unsafeInteractionReason(candidate, page.url());

    if (unsafeReason) {
      interactions.push({
        description: candidate.description,
        outcome: 'skipped_unsafe',
        evidence: [`reason=${unsafeReason}`]
      });
      continue;
    }

    if (attemptedActions >= maxActionsPerRoute) {
      break;
    }

    attemptedActions += 1;
    const formFill = candidate.kind === 'form' ? await fillSafeFormFields(page) : { filled: 0, skipped: 0 };
    const beforeUrl = page.url();
    const beforeBodyText = await readBodyText(page);
    const beforeElementState = await readElementState(page, candidate.selector);
    const beforeDownloadCount = downloadCount;

    try {
      await page.click(candidate.selector, { timeout: 1_000 });
      await page.waitForTimeout(250);
    } catch (error) {
      const clickError = formatUnknownError(error);
      if (isInvisibleClickError(clickError)) {
        interactions.push({
          description: candidate.description,
          outcome: 'skipped_unsafe',
          evidence: ['reason=not_visible']
        });
        continue;
      }

      if (isDisabledClickError(clickError)) {
        interactions.push({
          description: candidate.description,
          outcome: 'skipped_unsafe',
          evidence: ['reason=not_enabled']
        });
        continue;
      }

      if (isStaleSelectorClickError(clickError)) {
        interactions.push({
          description: candidate.description,
          outcome: 'skipped_unsafe',
          evidence: ['reason=stale_selector']
        });
        continue;
      }

      interactions.push({
        description: candidate.description,
        outcome: candidate.kind === 'form' ? 'form_failure' : 'dead_control',
        evidence: [`click_error=${clickError}`]
      });
      continue;
    }

    const afterUrl = page.url();
    const afterBodyText = await readBodyText(page);
    const afterElementState = await readElementState(page, candidate.selector);
    const urlUnchanged = afterUrl === beforeUrl;
    const bodyTextUnchanged = afterBodyText === beforeBodyText;
    const elementStateChanged = afterElementState !== beforeElementState;
    const downloadObserved = downloadCount > beforeDownloadCount;
    const observableResult = !urlUnchanged || !bodyTextUnchanged || elementStateChanged || downloadObserved;

    /* Judged only when nothing observable happened: a self-targeting control that
       does react (a `#` anchor driving a menu) has already been proven alive above,
       so the click is never skipped up front and JS-driven controls keep coverage. */
    const selfTarget = targetsCurrentPage(candidate.href, beforeUrl);
    const failedOutcome = candidate.kind === 'form' ? 'form_failure' : 'dead_control';
    const formFillEvidence =
      formFill.filled > 0 || formFill.skipped > 0 ? [`fields_filled=${formFill.filled}`, `fields_skipped=${formFill.skipped}`] : [];
    const observableEvidence =
      observableResult && urlUnchanged && bodyTextUnchanged
        ? [`element_state_changed=${elementStateChanged}`, `download_observed=${downloadObserved}`]
        : [];
    const selfTargetEvidence = !observableResult && selfTarget ? ['self_target=true', `href=${candidate.href ?? ''}`] : [];

    interactions.push({
      description: candidate.description,
      outcome: observableResult ? 'ok' : selfTarget ? 'no_op_self_target' : failedOutcome,
      evidence: [
        ...formFillEvidence,
        `url_unchanged=${urlUnchanged}`,
        `body_text_unchanged=${bodyTextUnchanged}`,
        ...observableEvidence,
        ...selfTargetEvidence
      ]
    });

    candidates = await readInteractionCandidates(page);
    candidateIndex = 0;
  }

  return interactions;
}

/* A brand link on the page it points at, `href="#"`, `href=""`, and an in-page
   anchor already scrolled into view all produce no observable change by design.
   Reporting them as dead controls fires on nearly every site, so compare the
   resolved target with the page it was clicked on, ignoring the fragment. */
function targetsCurrentPage(href: string | null, currentUrl: string): boolean {
  if (href === null) {
    return false;
  }

  const trimmedHref = href.trim();

  if (trimmedHref === '' || trimmedHref === '#') {
    return true;
  }

  if (/^(?:javascript|mailto|tel):/iu.test(trimmedHref)) {
    return false;
  }

  let target: URL;
  let current: URL;

  try {
    current = new URL(currentUrl);
    target = new URL(trimmedHref, current);
  } catch {
    return false;
  }

  return target.origin === current.origin
    && stripTrailingSlash(target.pathname) === stripTrailingSlash(current.pathname)
    && target.search === current.search;
}

function stripTrailingSlash(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/$/u, '') : pathname;
}

async function fillSafeFormFields(page: PlaywrightPageLike): Promise<FormFillResult> {
  const fields = await readFillCandidates(page);
  let filled = 0;
  let skipped = 0;

  for (const field of fields) {
    if (unsafeFieldReason(field)) {
      skipped += 1;
      continue;
    }

    try {
      await page.fill(field.selector, field.value, { timeout: 1_000 });
      filled += 1;
    } catch {
      skipped += 1;
    }
  }

  return { filled, skipped };
}

async function readInteractionCandidates(page: PlaywrightPageLike): Promise<InteractionCandidate[]> {
  const value = await page.$$eval('button, [role="button"], input[type="submit"], a[href]', collectInteractionCandidatesInBrowser);

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((candidate) => {
    if (!isRecord(candidate) || typeof candidate.selector !== 'string' || typeof candidate.description !== 'string') {
      return [];
    }

    const kind = candidate.kind === 'form' ? 'form' : 'click';
    const riskText = typeof candidate.riskText === 'string' ? candidate.riskText : candidate.description;

    return [
      {
        selector: candidate.selector,
        description: candidate.description,
        kind,
        riskText,
        href: typeof candidate.href === 'string' && candidate.href ? candidate.href : null
      }
    ];
  });
}

async function readElementState(page: PlaywrightPageLike, selector: string): Promise<string> {
  try {
    const value = await page.$$eval(selector, collectElementStatesInBrowser);
    return parseStringArray(value)[0] ?? '';
  } catch {
    return '';
  }
}

async function readFillCandidates(page: PlaywrightPageLike): Promise<FillCandidate[]> {
  const value = await page.$$eval('input, textarea', collectFillCandidatesInBrowser);

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((candidate) => {
    if (!isRecord(candidate) || typeof candidate.selector !== 'string' || typeof candidate.value !== 'string') {
      return [];
    }

    return [
      {
        selector: candidate.selector,
        value: candidate.value,
        riskText: typeof candidate.riskText === 'string' ? candidate.riskText : ''
      }
    ];
  });
}

function unsafeInteractionReason(candidate: InteractionCandidate, currentUrl?: string): string | null {
  const rawText = `${candidate.description} ${candidate.riskText}`;
  const text = normalizeRiskText(rawText);

  if (!text) {
    return null;
  }

  const nonHttpNavigationPattern = /\b(?:mailto|tel|javascript|data):|(?:^|\s)#[^\s]+/iu;
  if (nonHttpNavigationPattern.test(text)) {
    return 'non_http_navigation';
  }

  if (hasExternalHttpNavigation(rawText, currentUrl)) {
    return 'external_navigation';
  }

  if (/\bstate:selected\b/iu.test(rawText)) {
    return 'already_selected';
  }

  const destructiveOrSensitivePattern =
    /\b(delete|remove|destroy|archive|deactivate|disable|reset|clear|logout|log out|sign out|pay|purchase|checkout|subscribe|refund|transfer|withdraw)\b|删除|移除|销毁|归档|停用|禁用|重置|清空|注销|退出登录|登出|支付|付款|购买|结账|订阅|退款|转账|提现/iu;

  return destructiveOrSensitivePattern.test(text) ? 'destructive_or_sensitive_action' : null;
}

function isInvisibleClickError(message: string): boolean {
  return /element is not visible|not visible|element is hidden|not stable|outside of the viewport/iu.test(message);
}

function isDisabledClickError(message: string): boolean {
  return /element is not enabled|not enabled|element is disabled/iu.test(message);
}

function isStaleSelectorClickError(message: string): boolean {
  return /waiting for locator\('[^']+'\)/iu.test(message) && !/attempting click action/iu.test(message);
}

function hasExternalHttpNavigation(rawText: string, currentUrl: string | undefined): boolean {
  if (!currentUrl) {
    return false;
  }

  try {
    const currentOrigin = new URL(currentUrl).origin;

    for (const match of rawText.matchAll(/https?:\/\/[^\s"'<>]+/giu)) {
      const rawUrl = match[0]?.replace(/[),.;]+$/u, '') ?? '';

      if (rawUrl && new URL(rawUrl).origin !== currentOrigin) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

function unsafeFieldReason(candidate: FillCandidate): string | null {
  const text = normalizeRiskText(candidate.riskText);

  if (!text) {
    return null;
  }

  const sensitiveFieldPattern =
    /\b(password|passcode|secret|token|api key|apikey|otp|2fa|mfa|verification code|credit card|card number|cc number|cvv|cvc|ssn|social security|bank account|routing number)\b|密码|口令|密钥|令牌|验证码|信用卡|银行卡|卡号|安全码|身份证|银行账户/iu;

  return sensitiveFieldPattern.test(text) ? 'sensitive_field' : null;
}

function normalizeRiskText(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function artifactPathForUrl(artifactsDir: string, url: string): string {
  const parsed = new URL(url);
  const host = parsed.port ? `${parsed.hostname}-${parsed.port}` : parsed.hostname;
  const path = parsed.pathname === '/' ? 'root' : parsed.pathname;
  const rawName = `${host}-${path}`;
  const fileName = rawName.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'page';

  return join(artifactsDir, `${fileName}.png`);
}

function tracePathForUrl(artifactsDir: string, url: string): string {
  return artifactPathForUrl(artifactsDir, url).replace(/\.png$/u, '.trace.zip');
}

interface ConsoleErrorRecord {
  text: string;
  url: string | null;
}

interface FailedResponseRecord {
  url: string;
  status: number;
  method: string;
  resourceType: string;
  document: string | null;
}

function getConsoleError(message: unknown): ConsoleErrorRecord | null {
  const type = callStringMethod(message, 'type');

  if (type !== 'error') {
    return null;
  }

  return {
    text: callStringMethod(message, 'text') ?? 'Unknown console error',
    /* Chrome leaves the failing URL out of the console text but keeps it on the
       message location, so this recovers it even without the response event. */
    url: readConsoleLocationUrl(message)
  };
}

function readConsoleLocationUrl(message: unknown): string | null {
  const location = callUnknownMethod(message, 'location');

  if (!isRecord(location) || typeof location.url !== 'string' || !location.url) {
    return null;
  }

  return location.url;
}

function getFailedResponse(response: unknown, document: string | null): FailedResponseRecord | null {
  const status = callUnknownMethod(response, 'status');
  const url = callStringMethod(response, 'url');

  if (typeof status !== 'number' || status < 400 || !url) {
    return null;
  }

  const request = callUnknownMethod(response, 'request');

  return {
    url,
    status,
    method: callStringMethod(request, 'method') ?? 'GET',
    resourceType: callStringMethod(request, 'resourceType') ?? 'other',
    document
  };
}

/* Interactions can navigate mid-snapshot, so a request is not always attributable
   to the route the finding names. Recording the document it actually fired on
   keeps the evidence true when they differ. */
function formatFailedResponse(response: FailedResponseRecord, routeUrl: string): string {
  const context =
    response.document && !sameDocument(response.document, routeUrl)
      ? `${response.resourceType}, on ${response.document}`
      : response.resourceType;

  return `${response.method} ${response.url} :: ${response.status} (${context})`;
}

function sameDocument(left: string, right: string): boolean {
  try {
    return new URL(left).toString() === new URL(right).toString();
  } catch {
    return left === right;
  }
}

function readPageUrl(page: PlaywrightPageLike): string | null {
  try {
    return page.url();
  } catch {
    return null;
  }
}

/* A resource-load console line whose URL is already reported as a failed response
   would say strictly less than that response, so it is dropped instead of listed
   beside it — that duplication is what turned four broken endpoints into seven
   identical, unactionable rows. */
function buildConsoleErrorEvidence(
  consoleErrors: ConsoleErrorRecord[],
  failedResponses: FailedResponseRecord[]
): string[] {
  const reportedUrls = new Set(failedResponses.map((response) => response.url));

  return dedupe(
    consoleErrors.flatMap((consoleError) => {
      if (consoleError.url && reportedUrls.has(consoleError.url) && isResourceLoadFailure(consoleError.text)) {
        return [];
      }

      return [consoleError.url ? `${consoleError.text} :: ${consoleError.url}` : consoleError.text];
    })
  );
}

function isResourceLoadFailure(text: string): boolean {
  return /failed to load resource/iu.test(text);
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return String(error);
  }

  const message = isRecord(error) && typeof error.message === 'string' ? error.message : null;
  return message ?? String(error);
}

function formatFailedRequest(request: unknown): string {
  const url = callStringMethod(request, 'url') ?? 'unknown request';
  const failure = callUnknownMethod(request, 'failure');
  const errorText = isRecord(failure) && typeof failure.errorText === 'string' ? failure.errorText : 'unknown failure';

  return `${url} :: ${errorText}`;
}

function callStringMethod(value: unknown, method: string): string | null {
  const result = callUnknownMethod(value, method);
  return typeof result === 'string' ? result : null;
}

function callUnknownMethod(value: unknown, method: string): unknown {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[method];

  if (typeof candidate !== 'function') {
    return null;
  }

  return candidate.call(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => (typeof item === 'string' ? [item] : []));
}
