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
  disabled: boolean | null;
  formSelector: string | null;
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

interface ConditionalFormFillResult extends FormFillResult {
  failClosedReason?: string;
}

interface ObservedFillFieldState {
  count: number;
  value: string | null;
  riskText: string;
  editable: boolean;
}

type ConditionalDeadControlClassification =
  | 'false_positive_candidate'
  | 'actionable_conditional_dead_control'
  | 'needs_maintainer_review';

interface ConditionalDeadControlAssessment {
  classification: ConditionalDeadControlClassification;
  safeDirtyTransitionObserved: boolean;
  postTransitionEvidence:
    | 'enabled_after_transition'
    | 'still_disabled_after_transition'
    | 'post_transition_state_known';
  postTransitionValue: boolean;
  failClosedReason?: string;
}

const conditionalDeadControlQuestionId =
  'conditional_dead_control_should_consider_form_dirty_prerequisites';

const countSelectorMatchesInBrowser = new Function(
  'elements',
  'return elements.length;'
) as (elements: unknown[]) => unknown;

const inspectFillFieldInBrowser = new Function(
  'elements',
  `
var count = elements.length;
if (count !== 1) {
  return { count: count, value: null, riskText: '', editable: false };
}

var element = elements[0];
if (typeof element !== 'object' || element === null) {
  return { count: count, value: null, riskText: '', editable: false };
}

var readAttribute = function(name) {
  if (typeof element.getAttribute !== 'function') {
    return '';
  }

  var value = element.getAttribute(name);
  return typeof value === 'string' ? value.trim() : '';
};
var tagName = typeof element.tagName === 'string' ? element.tagName.toLowerCase() : 'input';
var type = readAttribute('type').toLowerCase() || (tagName === 'textarea' ? 'textarea' : 'text');
var disabled = typeof element.disabled === 'boolean' ? element.disabled : false;
var readOnly = typeof element.readOnly === 'boolean' ? element.readOnly : false;
var editable = !disabled
  && !readOnly
  && type !== 'hidden'
  && type !== 'file'
  && type !== 'submit'
  && type !== 'button'
  && type !== 'checkbox'
  && type !== 'radio';
var currentValue = typeof element.value === 'string' ? element.value : null;

return {
  count: count,
  value: currentValue,
  riskText: [
    type,
    readAttribute('name'),
    readAttribute('autocomplete'),
    readAttribute('placeholder'),
    readAttribute('aria-label'),
    readAttribute('data-testid'),
    readAttribute('id')
  ].join(' '),
  editable: editable
};
`
) as (elements: unknown[]) => unknown;

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
  var type = readAttribute('type').toLowerCase();
  var ownerForm = typeof element.form === 'object' && element.form !== null ? element.form : null;
  var rect = typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null;
  var style = typeof window !== 'undefined' && typeof window.getComputedStyle === 'function'
    ? window.getComputedStyle(element)
    : null;
  var ariaHidden = readAttribute('aria-hidden').toLowerCase() === 'true';
  var disabled = typeof element.disabled === 'boolean' ? element.disabled : false;
  var hidden = typeof element.hidden === 'boolean' ? element.hidden : false;
  var isSubmitControl = (tagName === 'input' && type === 'submit')
    || (tagName === 'button' && (type === '' || type === 'submit'));
  var conditionalDisabledSubmit = disabled && isSubmitControl;
  var visible = !ariaHidden
    && (!disabled || conditionalDisabledSubmit)
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
  var formSelector = null;

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

  if (ownerForm && typeof ownerForm.getAttribute === 'function') {
    var formTestIdValue = ownerForm.getAttribute('data-testid');
    var formTestId = typeof formTestIdValue === 'string' ? formTestIdValue.trim() : '';
    var formIdValue = ownerForm.getAttribute('id');
    var formId = typeof formIdValue === 'string' ? formIdValue.trim() : '';
    var hardeningFormIdValue = ownerForm.getAttribute('data-hardening-form-id');
    var hardeningFormId = typeof hardeningFormIdValue === 'string' ? hardeningFormIdValue.trim() : '';

    if (formTestId) {
      formSelector = '[data-testid="' + escapeAttribute(formTestId) + '"]';
    } else if (formId) {
      formSelector = '#' + escapeIdentifier(formId);
    } else if (hardeningFormId) {
      formSelector = '[data-hardening-form-id="' + escapeAttribute(hardeningFormId) + '"]';
    } else if (conditionalDisabledSubmit && typeof ownerForm.setAttribute === 'function') {
      hardeningFormId = 'hardening-form-' + index;
      ownerForm.setAttribute('data-hardening-form-id', hardeningFormId);
      formSelector = '[data-hardening-form-id="' + escapeAttribute(hardeningFormId) + '"]';
    }
  }

  var kind = tagName === 'input' || conditionalDisabledSubmit ? 'form' : 'click';
  var verb = kind === 'form' ? 'Submit' : 'Click';

  return [{
    selector: selector,
    description: verb + ' "' + label.slice(0, 80) + '"',
    kind: kind,
    riskText: [label, ariaLabel, title, name, testId, id, href, action, selected ? 'state:selected' : ''].join(' '),
    disabled: disabled,
    formSelector: formSelector
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
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];
      const artifactPath = artifactPathForUrl(options.artifactsDir, url);
      const tracePath = traceEnabled ? tracePathForUrl(options.artifactsDir, url) : null;
      let traceStarted = false;

      page.on('console', (message) => {
        const text = getConsoleErrorText(message);
        if (text) {
          consoleErrors.push(text);
        }
      });
      page.on('pageerror', (error) => {
        pageErrors.push(formatUnknownError(error));
      });
      page.on('requestfailed', (request) => {
        failedRequests.push(formatFailedRequest(request));
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
          consoleErrors,
          pageErrors,
          failedRequests,
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

  let candidateObservationUrl = page.url();
  let candidates = await readInteractionCandidates(page);
  let candidateObservationPageStable = hasExactPageHref(candidateObservationUrl, page.url());
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

    if (!candidateObservationPageStable) {
      if (candidate.disabled === true) {
        const matchingInitialCandidates = candidates.filter(
          (entry) => entry.selector === candidate.selector && entry.formSelector === candidate.formSelector
        );
        interactions.push(
          await observeConditionalDeadControl(
            page,
            candidate,
            matchingInitialCandidates.length,
            candidateObservationUrl,
            null
          )
        );
        break;
      }
      continue;
    }

    const unsafeReason = unsafeInteractionReason(candidate, page.url());

    if (candidate.disabled !== true && unsafeReason) {
      interactions.push({
        description: candidate.description,
        outcome: 'skipped_unsafe',
        evidence: [`reason=${unsafeReason}`]
      });
      continue;
    }

    if (candidate.disabled === true && unsafeReason) {
      const matchingInitialCandidates = candidates.filter(
        (entry) => entry.selector === candidate.selector && entry.formSelector === candidate.formSelector
      );
      interactions.push(
        await observeConditionalDeadControl(
          page,
          candidate,
          matchingInitialCandidates.length,
          candidateObservationUrl,
          unsafeReason
        )
      );
      break;
    }

    if (attemptedActions >= maxActionsPerRoute) {
      break;
    }

    attemptedActions += 1;
    if (candidate.disabled === true) {
      const matchingInitialCandidates = candidates.filter(
        (entry) => entry.selector === candidate.selector && entry.formSelector === candidate.formSelector
      );
      interactions.push(
        await observeConditionalDeadControl(
          page,
          candidate,
          matchingInitialCandidates.length,
          candidateObservationUrl,
          unsafeReason
        )
      );
      break;
    }

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

    const failedOutcome = candidate.kind === 'form' ? 'form_failure' : 'dead_control';
    const formFillEvidence =
      formFill.filled > 0 || formFill.skipped > 0 ? [`fields_filled=${formFill.filled}`, `fields_skipped=${formFill.skipped}`] : [];
    const observableEvidence =
      observableResult && urlUnchanged && bodyTextUnchanged
        ? [`element_state_changed=${elementStateChanged}`, `download_observed=${downloadObserved}`]
        : [];

    interactions.push({
      description: candidate.description,
      outcome: observableResult ? 'ok' : failedOutcome,
      evidence: [
        ...formFillEvidence,
        `url_unchanged=${urlUnchanged}`,
        `body_text_unchanged=${bodyTextUnchanged}`,
        ...observableEvidence
      ]
    });

    candidateObservationUrl = page.url();
    candidates = await readInteractionCandidates(page);
    candidateObservationPageStable = hasExactPageHref(candidateObservationUrl, page.url());
    candidateIndex = 0;
  }

  return interactions;
}

async function observeConditionalDeadControl(
  page: PlaywrightPageLike,
  candidate: InteractionCandidate,
  matchingInitialCandidateCount: number,
  initialUrl: string,
  unsafeReason: string | null
): Promise<BrowserInteractionResult> {
  let formFill: FormFillResult = { filled: 0, skipped: 0 };
  let postTransitionDisabled: boolean | null = null;
  let failClosedReason: string | undefined;
  if (!hasExactPageHref(initialUrl, page.url())) {
    failClosedReason = 'candidate_observation_page_changed';
  } else if (candidate.kind !== 'form') {
    failClosedReason = 'candidate_not_form_submit';
  } else if (unsafeReason) {
    failClosedReason = 'unsafe_disabled_control';
  } else if (!candidate.formSelector) {
    failClosedReason = 'owner_form_not_observable';
  } else if (!isLoopbackUrl(page.url())) {
    failClosedReason = 'non_loopback_page';
  } else if (matchingInitialCandidateCount !== 1) {
    failClosedReason = 'initial_control_not_uniquely_observable';
  } else {
    let ownerFormMatchCount: number | null = null;
    try {
      ownerFormMatchCount = await readSelectorMatchCount(page, candidate.formSelector);
    } catch {
      failClosedReason = 'owner_form_not_observable';
    }

    if (!failClosedReason && ownerFormMatchCount !== 1) {
      failClosedReason = 'owner_form_not_unique';
    }

    if (!failClosedReason) {
      try {
        const conditionalFill = await fillOneSafeFormField(
          page,
          candidate.formSelector,
          initialUrl
        );
        formFill = conditionalFill;
        failClosedReason = conditionalFill.failClosedReason;
      } catch {
        failClosedReason = 'form_field_observation_failed';
      }
    }

    if (!failClosedReason && formFill.filled === 0) {
      failClosedReason = formFill.skipped > 0
        ? 'no_safe_form_field'
        : 'form_field_transition_unavailable';
    } else if (!failClosedReason && !hasSamePageUrl(initialUrl, page.url())) {
      failClosedReason = 'post_transition_page_changed';
    } else if (!failClosedReason) {
      let matchingCandidates: InteractionCandidate[] = [];
      try {
        const refreshedCandidates = await readInteractionCandidates(page);
        matchingCandidates = refreshedCandidates.filter(
          (entry) => entry.selector === candidate.selector && entry.formSelector === candidate.formSelector
        );
      } catch {
        failClosedReason = 'post_transition_observation_failed';
      }

      if (!failClosedReason && !hasSamePageUrl(initialUrl, page.url())) {
        failClosedReason = 'post_transition_page_changed';
      }

      let postTransitionOwnerFormCount: number | null = null;
      if (!failClosedReason) {
        try {
          postTransitionOwnerFormCount = await readSelectorMatchCount(
            page,
            candidate.formSelector
          );
        } catch {
          failClosedReason = 'post_transition_owner_form_unobservable';
        }
      }

      if (!failClosedReason && !hasSamePageUrl(initialUrl, page.url())) {
        failClosedReason = 'post_transition_page_changed';
      } else if (!failClosedReason && postTransitionOwnerFormCount !== 1) {
        failClosedReason = 'post_transition_owner_form_not_unique';
      } else if (!failClosedReason && matchingCandidates.length !== 1) {
        failClosedReason = matchingCandidates.length === 0
          ? 'post_transition_control_unobservable'
          : 'post_transition_control_contradictory';
      } else if (!failClosedReason) {
        postTransitionDisabled = matchingCandidates[0]?.disabled ?? null;
        if (postTransitionDisabled === null) {
          failClosedReason = 'post_transition_disabled_state_unknown';
        }
      }
    }
  }

  const assessment = classifyConditionalDeadControl({
    safeTransitionEligible: !failClosedReason,
    postTransitionDisabled,
    ...(failClosedReason ? { failClosedReason } : {})
  });

  return {
    description: candidate.description,
    outcome: 'dead_control',
    evidence: [
      'conditional_dead_control_observation=initially_disabled_submit',
      `fields_filled=${formFill.filled}`,
      `fields_skipped=${formFill.skipped}`,
      `conditional_dead_control.question_id=${conditionalDeadControlQuestionId}`,
      `conditional_dead_control.classification=${assessment.classification}`,
      'conditional_dead_control.prerequisite.initial_disabled=true',
      `conditional_dead_control.prerequisite.safe_dirty_transition_observed=${assessment.safeDirtyTransitionObserved}`,
      `conditional_dead_control.prerequisite.${assessment.postTransitionEvidence}=${assessment.postTransitionValue}`,
      'conditional_dead_control.form_state_inferred=false',
      ...(unsafeReason
        ? [`conditional_dead_control.unsafe_reason=${unsafeReason}`]
        : []),
      ...(assessment.failClosedReason
        ? [`conditional_dead_control.fail_closed_reason=${assessment.failClosedReason}`]
        : [])
    ]
  };
}

async function fillOneSafeFormField(
  page: PlaywrightPageLike,
  formSelector: string,
  initialUrl: string
): Promise<ConditionalFormFillResult> {
  const fields = await readFillCandidates(page, formSelector);
  let skipped = 0;

  for (const field of fields) {
    if (unsafeFieldReason(field)) {
      skipped += 1;
      continue;
    }

    const scopedSelector = `${formSelector} ${field.selector}`;
    let beforeState: ObservedFillFieldState;
    try {
      beforeState = await readFillFieldState(page, scopedSelector);
    } catch {
      return {
        filled: 0,
        skipped,
        failClosedReason: 'form_field_not_uniquely_observable'
      };
    }

    if (beforeState.count !== 1) {
      return {
        filled: 0,
        skipped,
        failClosedReason: 'form_field_not_uniquely_observable'
      };
    }

    if (!beforeState.editable || beforeState.value === null) {
      return {
        filled: 0,
        skipped,
        failClosedReason: 'form_field_not_safely_observable'
      };
    }

    if (unsafeFieldReason({ ...field, riskText: beforeState.riskText })) {
      return {
        filled: 0,
        skipped: skipped + 1,
        failClosedReason: 'form_field_became_unsafe'
      };
    }

    if (!hasSamePageUrl(initialUrl, page.url())) {
      return {
        filled: 0,
        skipped,
        failClosedReason: 'pre_fill_page_changed'
      };
    }

    let preFillOwnerFormCount: number;
    try {
      preFillOwnerFormCount = await readSelectorMatchCount(page, formSelector);
    } catch {
      return {
        filled: 0,
        skipped,
        failClosedReason: 'pre_fill_owner_form_unobservable'
      };
    }

    if (!hasSamePageUrl(initialUrl, page.url())) {
      return {
        filled: 0,
        skipped,
        failClosedReason: 'pre_fill_page_changed'
      };
    }

    if (preFillOwnerFormCount !== 1) {
      return {
        filled: 0,
        skipped,
        failClosedReason: 'pre_fill_owner_form_not_unique'
      };
    }

    const fillValue = distinctSafeFillValue(field.value, beforeState.value);

    try {
      await page.fill(scopedSelector, fillValue, { timeout: 1_000 });
    } catch {
      return {
        filled: 0,
        skipped: skipped + 1,
        failClosedReason: 'form_field_fill_failed'
      };
    }

    if (!hasSamePageUrl(initialUrl, page.url())) {
      return {
        filled: 1,
        skipped,
        failClosedReason: 'post_transition_page_changed'
      };
    }

    let afterState: ObservedFillFieldState;
    try {
      afterState = await readFillFieldState(page, scopedSelector);
    } catch {
      return {
        filled: 1,
        skipped,
        failClosedReason: 'form_field_value_unobservable'
      };
    }

    if (!hasSamePageUrl(initialUrl, page.url())) {
      return {
        filled: 1,
        skipped,
        failClosedReason: 'post_transition_page_changed'
      };
    }

    if (afterState.count !== 1 || afterState.value === null) {
      return {
        filled: 1,
        skipped,
        failClosedReason: afterState.count === 1
          ? 'form_field_value_unobservable'
          : 'form_field_not_uniquely_observable'
      };
    }

    if (afterState.value === beforeState.value) {
      return {
        filled: 1,
        skipped,
        failClosedReason: 'form_field_value_unchanged'
      };
    }

    return { filled: 1, skipped };
  }

  return { filled: 0, skipped };
}

function classifyConditionalDeadControl(input: {
  safeTransitionEligible: boolean;
  postTransitionDisabled: boolean | null;
  failClosedReason?: string;
}): ConditionalDeadControlAssessment {
  if (!input.safeTransitionEligible || input.postTransitionDisabled === null) {
    return {
      classification: 'needs_maintainer_review',
      safeDirtyTransitionObserved: false,
      postTransitionEvidence: 'post_transition_state_known',
      postTransitionValue: false,
      failClosedReason: input.failClosedReason ?? 'post_transition_state_unknown'
    };
  }

  if (input.postTransitionDisabled) {
    return {
      classification: 'actionable_conditional_dead_control',
      safeDirtyTransitionObserved: true,
      postTransitionEvidence: 'still_disabled_after_transition',
      postTransitionValue: true
    };
  }

  return {
    classification: 'false_positive_candidate',
    safeDirtyTransitionObserved: true,
    postTransitionEvidence: 'enabled_after_transition',
    postTransitionValue: true
  };
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
        disabled: typeof candidate.disabled === 'boolean' ? candidate.disabled : null,
        formSelector:
          typeof candidate.formSelector === 'string' && candidate.formSelector.trim()
            ? candidate.formSelector
            : null
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

async function readSelectorMatchCount(
  page: PlaywrightPageLike,
  selector: string
): Promise<number> {
  const value = await page.$$eval(selector, countSelectorMatchesInBrowser);

  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('Selector match count is not observable');
  }

  return value;
}

async function readFillFieldState(
  page: PlaywrightPageLike,
  selector: string
): Promise<ObservedFillFieldState> {
  const value = await page.$$eval(selector, inspectFillFieldInBrowser);

  if (!isRecord(value)
    || typeof value.count !== 'number'
    || !Number.isSafeInteger(value.count)
    || value.count < 0
    || (typeof value.value !== 'string' && value.value !== null)
    || typeof value.riskText !== 'string'
    || typeof value.editable !== 'boolean') {
    throw new Error('Fill field state is not observable');
  }

  return {
    count: value.count,
    value: value.value,
    riskText: value.riskText,
    editable: value.editable
  };
}

async function readFillCandidates(
  page: PlaywrightPageLike,
  formSelector?: string
): Promise<FillCandidate[]> {
  const fieldSelector = formSelector
    ? `${formSelector} input, ${formSelector} textarea`
    : 'input, textarea';
  const value = await page.$$eval(fieldSelector, collectFillCandidatesInBrowser);

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

function isLoopbackUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return (url.protocol === 'http:' || url.protocol === 'https:')
      && url.origin !== 'null'
      && (hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname === '0.0.0.0'
      || hostname === '::1'
      || hostname === '[::1]');
  } catch {
    return false;
  }
}

function hasSamePageUrl(before: string, after: string): boolean {
  try {
    const beforeUrl = new URL(before);
    const afterUrl = new URL(after);
    return beforeUrl.origin !== 'null'
      && afterUrl.origin !== 'null'
      && beforeUrl.href === afterUrl.href;
  } catch {
    return false;
  }
}

function hasExactPageHref(before: string, after: string): boolean {
  try {
    return new URL(before).href === new URL(after).href;
  } catch {
    return false;
  }
}

function distinctSafeFillValue(preferredValue: string, currentValue: string): string {
  if (preferredValue !== currentValue) {
    return preferredValue;
  }

  switch (preferredValue) {
    case 'test@example.com':
      return 'hardening@example.com';
    case '15555550123':
      return '15555550124';
    case 'https://example.com':
      return 'https://example.com/hardening';
    case '1':
      return '2';
    case 'hardening test':
      return 'hardening test 2';
    default:
      return `${preferredValue} 2`;
  }
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

function getConsoleErrorText(message: unknown): string | null {
  const type = callStringMethod(message, 'type');

  if (type !== 'error') {
    return null;
  }

  return callStringMethod(message, 'text') ?? 'Unknown console error';
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
