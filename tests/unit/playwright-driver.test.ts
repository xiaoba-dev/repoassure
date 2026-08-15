import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createPlaywrightBrowserDriver as packageCreatePlaywrightBrowserDriver } from '../../packages/browser-explorer/src/playwright-driver.js';
import { createPlaywrightBrowserDriver as legacyCreatePlaywrightBrowserDriver } from '../../src/domain/explore/playwright-driver.js';

describe('createPlaywrightBrowserDriver', () => {
  it('keeps package-owned and legacy Playwright browser drivers aligned', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-parity-'));
    const legacyPage = new FakePage();
    const packagePage = new FakePage();
    const legacyBrowser = new FakeBrowser(legacyPage);
    const packageBrowser = new FakeBrowser(packagePage);
    const legacyDriver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => legacyBrowser
      }
    });
    const packageDriver = await packageCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => packageBrowser
      }
    });

    const legacySnapshot = await legacyDriver.snapshot('http://localhost:3000/', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    const packageSnapshot = await packageDriver.snapshot('http://localhost:3000/', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await legacyDriver.close();
    await packageDriver.close();

    expect(packageSnapshot).toEqual(legacySnapshot);
    expect(legacyPage.closed).toBe(true);
    expect(packagePage.closed).toBe(true);
    expect(legacyBrowser.closed).toBe(true);
    expect(packageBrowser.closed).toBe(true);
  });

  it('navigates with the load wait strategy by default so HMR dev servers do not time out', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-wait-until-default-'));
    const page = new FakePage();
    const browser = new FakeBrowser(page);
    const driver = await packageCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => browser
      }
    });

    await driver.snapshot('http://localhost:3000/', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await driver.close();

    expect(page.gotoCalls).toEqual([{ waitUntil: 'load', timeout: 15_000 }]);
  });

  it('honors an explicit waitUntil override for navigation', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-wait-until-override-'));
    const page = new FakePage();
    const browser = new FakeBrowser(page);
    const driver = await packageCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => browser
      },
      waitUntil: 'domcontentloaded',
      navigationTimeoutMs: 5_000
    });

    await driver.snapshot('http://localhost:3000/', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await driver.close();

    expect(page.gotoCalls).toEqual([{ waitUntil: 'domcontentloaded', timeout: 5_000 }]);
  });

  it('surfaces an actionable BrowserUnavailableError when the browser executable is missing', async () => {
    await expect(
      packageCreatePlaywrightBrowserDriver({
        launcher: {
          launch: async () => {
            throw new Error(
              "browserType.launch: Executable doesn't exist at /caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell"
            );
          }
        }
      })
    ).rejects.toMatchObject({
      name: 'BrowserUnavailableError',
      message: expect.stringContaining('npx playwright install chromium')
    });
  });

  it('rethrows launch failures that are not about a missing browser executable', async () => {
    const createDriver = (): Promise<unknown> =>
      packageCreatePlaywrightBrowserDriver({
        launcher: {
          launch: async () => {
            throw new Error('browserType.launch: unexpected crash');
          }
        }
      });

    await expect(createDriver()).rejects.toThrow('browserType.launch: unexpected crash');
    await expect(createDriver()).rejects.toMatchObject({ name: 'Error' });
  });

  it('captures page runtime signals and screenshot artifacts', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-artifacts-'));
    const page = new FakePage();
    const browser = new FakeBrowser(page);
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => browser
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await driver.close();

    expect(snapshot).toMatchObject({
      url: 'http://localhost:3000/',
      status: 200,
      html: '<html><body><a href="/settings">Settings</a><main>Home</main></body></html>',
      bodyText: 'Home',
      links: ['http://localhost:3000/settings'],
      consoleErrors: ['ReferenceError: widget is not defined'],
      pageErrors: ['Error: render failed'],
      failedRequests: ['http://localhost:3000/api/user :: net::ERR_FAILED'],
      interactions: []
    });
    expect(snapshot.artifactFiles).toHaveLength(1);
    expect(snapshot.artifactFiles[0]).toContain(artifactsDir);
    expect(snapshot.artifactFiles[0]).toContain('localhost-3000');
    expect(page.closed).toBe(true);
    expect(browser.closed).toBe(true);
  });

  it('uses a browser context with storage state when provided', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-storage-state-'));
    const page = new FakePage();
    const browser = new FakeBrowser(page);
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => browser
      },
      storageStatePath: '.auth/user.json'
    });

    await driver.snapshot('http://localhost:3000/account', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await driver.close();

    expect(browser.contextOptions).toEqual([{ storageState: '.auth/user.json' }]);
    expect(browser.contexts).toHaveLength(1);
    expect(browser.contexts[0]?.closed).toBe(true);
    expect(page.closed).toBe(true);
  });

  it('records trace artifacts when tracing is enabled', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-trace-'));
    const page = new FakePage();
    const browser = new FakeBrowser(page);
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => browser
      },
      trace: true
    });

    const snapshot = await driver.snapshot('http://localhost:3000/account', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await driver.close();

    expect(browser.contexts).toHaveLength(1);
    expect(browser.contexts[0]?.traceStarts).toEqual([
      {
        screenshots: true,
        snapshots: true,
        sources: false
      }
    ]);
    expect(browser.contexts[0]?.traceStops).toHaveLength(1);
    expect(browser.contexts[0]?.traceStops[0]?.path).toContain(artifactsDir);
    expect(browser.contexts[0]?.traceStops[0]?.path).toContain('.zip');
    expect(snapshot.artifactFiles).toContain(browser.contexts[0]?.traceStops[0]?.path);
  });

  it('records which resource failed instead of an anonymous console string', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-network-context-'));
    const page = new FakePage({
      consoleErrors: [
        {
          text: 'Failed to load resource: the server responded with a status of 404 ()',
          locationUrl: 'http://localhost:3000/api/stats'
        }
      ],
      responses: [
        { url: 'http://localhost:3000/api/stats', status: 404, method: 'GET', resourceType: 'fetch' }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await driver.close();

    expect(snapshot.failedRequests).toContain('GET http://localhost:3000/api/stats :: 404 (fetch)');
    // The console line carries no URL, so the network line replaces it rather than
    // reporting the same failure twice.
    expect(snapshot.consoleErrors.join('\n')).not.toContain('Failed to load resource');
  });

  it('keeps the resource url on a console error that has no matching response event', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-console-location-'));
    const page = new FakePage({
      consoleErrors: [
        {
          text: 'Failed to load resource: the server responded with a status of 404 ()',
          locationUrl: 'http://localhost:3000/api/orphan'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await driver.close();

    expect(snapshot.consoleErrors).toContain(
      'Failed to load resource: the server responded with a status of 404 () :: http://localhost:3000/api/orphan'
    );
  });

  it('collapses repeated failures of the same resource into one evidence line', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-network-dedup-'));
    const page = new FakePage({
      responses: [
        { url: 'http://localhost:3000/api/stats', status: 404, method: 'GET', resourceType: 'fetch' },
        { url: 'http://localhost:3000/api/stats', status: 404, method: 'GET', resourceType: 'fetch' },
        { url: 'http://localhost:3000/api/feed', status: 500, method: 'POST', resourceType: 'xhr' },
        { url: 'http://localhost:3000/ok.png', status: 200, method: 'GET', resourceType: 'image' }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/', {
      artifactsDir,
      maxActionsPerRoute: 0
    });
    await driver.close();

    expect(snapshot.failedRequests).toEqual([
      'http://localhost:3000/api/user :: net::ERR_FAILED',
      'GET http://localhost:3000/api/stats :: 404 (fetch)',
      'POST http://localhost:3000/api/feed :: 500 (xhr)'
    ]);
  });

  it('records dead controls when clicks do not change url or body text', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: 'button:nth-of-type(1)',
          description: 'Click "Save"'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "Save"',
        outcome: 'dead_control',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true']
      }
    ]);
    expect(page.clickedSelectors).toEqual(['button:nth-of-type(1)']);
  });

  it('does not report a link pointing at the current page as a dead control', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-self-link-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: 'a:nth-of-type(1)',
          description: 'Click "rotifer.ai"',
          href: 'http://localhost:3000/settings'
        },
        {
          selector: 'a:nth-of-type(2)',
          description: 'Click "Top"',
          href: '#'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 2
    });
    await driver.close();

    expect(snapshot.interactions.map((interaction) => interaction.outcome)).toEqual([
      'no_op_self_target',
      'no_op_self_target'
    ]);
    expect(snapshot.interactions[0]?.evidence).toContain('self_target=true');
  });

  it('still reports a fragment link as observable when clicking it changes the page', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-fragment-control-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: '[data-testid="menu"]',
          description: 'Click "Menu"',
          href: '#'
        }
      ],
      elementStates: {
        '[data-testid="menu"]': ['aria-expanded=false', 'aria-expanded=true']
      }
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions[0]?.outcome).toBe('ok');
  });

  it('skips invisible interaction targets instead of reporting dead controls', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-hidden-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: 'button:nth-of-type(1)',
          description: 'Click "Hidden mobile duplicate"'
        },
        {
          selector: '[data-testid="save"]',
          description: 'Click "Save changes"'
        }
      ],
      clickFailures: {
        'button:nth-of-type(1)': 'TimeoutError: page.click: element is not visible'
      }
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 2
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "Hidden mobile duplicate"',
        outcome: 'skipped_unsafe',
        evidence: ['reason=not_visible']
      },
      {
        description: 'Click "Save changes"',
        outcome: 'dead_control',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true']
      }
    ]);
    expect(page.clickedSelectors).toEqual(['button:nth-of-type(1)', '[data-testid="save"]']);
  });

  it('treats element state changes as observable interaction results', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-stateful-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: '[data-testid="btc-unit"]',
          description: 'Click "BTC"'
        }
      ],
      elementStates: {
        '[data-testid="btc-unit"]': ['aria-pressed=false', 'aria-pressed=true']
      }
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "BTC"',
        outcome: 'ok',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true', 'element_state_changed=true', 'download_observed=false']
      }
    ]);
  });

  it('treats downloads as observable interaction results', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-download-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: '[data-testid="export"]',
          description: 'Click "Export CSV"'
        }
      ],
      downloadSelectors: new Set(['[data-testid="export"]'])
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "Export CSV"',
        outcome: 'ok',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true', 'element_state_changed=false', 'download_observed=true']
      }
    ]);
  });

  it('skips controls that are already selected', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-selected-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: '[data-testid="btc-unit"]',
          description: 'Click "BTC"',
          riskText: 'BTC state:selected'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "BTC"',
        outcome: 'skipped_unsafe',
        evidence: ['reason=already_selected']
      }
    ]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('uses stable selectors from titles before injected ids', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-title-actions-'));
    const page = new FakePage({
      rawInteractionElements: [
        new FakeElement({
          tagName: 'BUTTON',
          textContent: '',
          title: 'Copy address'
        })
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(page.clickedSelectors).toEqual(['[title="Copy address"]:visible']);
    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "Copy address"',
        outcome: 'dead_control',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true']
      }
    ]);
  });

  it('records unchanged submit controls as form failures', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-form-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: 'input:nth-of-type(1)',
          description: 'Submit "Email"',
          kind: 'form'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/signup', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Submit "Email"',
        outcome: 'form_failure',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true']
      }
    ]);
  });

  it('fills safe form fields and skips sensitive fields before submit interactions', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-form-fill-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: 'button:nth-of-type(1)',
          description: 'Click "Create account"',
          kind: 'form'
        }
      ],
      fieldCandidates: [
        {
          selector: 'input:nth-of-type(1)',
          value: 'test@example.com',
          riskText: 'email'
        },
        {
          selector: 'input:nth-of-type(2)',
          value: 'Hardening Test',
          riskText: 'display name'
        },
        {
          selector: 'input:nth-of-type(3)',
          value: 'do-not-fill',
          riskText: 'password'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/signup', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(page.filledFields).toEqual([
      { selector: 'input:nth-of-type(1)', value: 'test@example.com' },
      { selector: 'input:nth-of-type(2)', value: 'Hardening Test' }
    ]);
    expect(page.clickedSelectors).toEqual(['button:nth-of-type(1)']);
    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "Create account"',
        outcome: 'form_failure',
        evidence: ['fields_filled=2', 'fields_skipped=1', 'url_unchanged=true', 'body_text_unchanged=true']
      }
    ]);
  });

  it('skips unsafe interactions without counting them against the action limit', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-safe-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: '[data-testid="delete-account"]',
          description: 'Click "Delete account"',
          riskText: 'Delete account'
        },
        {
          selector: '[data-testid="save"]',
          description: 'Click "Save changes"'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "Delete account"',
        outcome: 'skipped_unsafe',
        evidence: ['reason=destructive_or_sensitive_action']
      },
      {
        description: 'Click "Save changes"',
        outcome: 'dead_control',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true']
      }
    ]);
    expect(page.clickedSelectors).toEqual(['[data-testid="save"]']);
  });

  it('skips non-http navigation interactions without counting them against the action limit', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-non-http-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: 'a:nth-of-type(1)',
          description: 'Click "Email support"',
          riskText: 'Email support mailto:support@example.com'
        },
        {
          selector: 'a:nth-of-type(2)',
          description: 'Click "Call support"',
          riskText: 'Call support tel:+15555550123'
        },
        {
          selector: 'a:nth-of-type(3)',
          description: 'Click "Open menu"',
          riskText: 'Open menu javascript:void(0)'
        },
        {
          selector: '[data-testid="save"]',
          description: 'Click "Save changes"'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "Email support"',
        outcome: 'skipped_unsafe',
        evidence: ['reason=non_http_navigation']
      },
      {
        description: 'Click "Call support"',
        outcome: 'skipped_unsafe',
        evidence: ['reason=non_http_navigation']
      },
      {
        description: 'Click "Open menu"',
        outcome: 'skipped_unsafe',
        evidence: ['reason=non_http_navigation']
      },
      {
        description: 'Click "Save changes"',
        outcome: 'dead_control',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true']
      }
    ]);
    expect(page.clickedSelectors).toEqual(['[data-testid="save"]']);
  });

  it('skips external http navigation interactions without counting them against the action limit', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-browser-external-actions-'));
    const page = new FakePage({
      interactionCandidates: [
        {
          selector: 'a:nth-of-type(1)',
          description: 'Click "Docs"',
          riskText: 'Docs https://docs.example.com/guide'
        },
        {
          selector: '[data-testid="save"]',
          description: 'Click "Save changes"'
        }
      ]
    });
    const driver = await legacyCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    const snapshot = await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(snapshot.interactions).toEqual([
      {
        description: 'Click "Docs"',
        outcome: 'skipped_unsafe',
        evidence: ['reason=external_navigation']
      },
      {
        description: 'Click "Save changes"',
        outcome: 'dead_control',
        evidence: ['url_unchanged=true', 'body_text_unchanged=true']
      }
    ]);
    expect(page.clickedSelectors).toEqual(['[data-testid="save"]']);
  });
});

class FakeBrowser {
  closed = false;
  contextOptions: Array<{ storageState?: string }> = [];
  contexts: FakeBrowserContext[] = [];

  constructor(private readonly page: FakePage) {}

  async newPage(): Promise<FakePage> {
    return this.page;
  }

  async newContext(options: { storageState?: string }): Promise<FakeBrowserContext> {
    this.contextOptions.push(options);
    const context = new FakeBrowserContext(this.page);
    this.contexts.push(context);
    return context;
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

class FakeBrowserContext {
  closed = false;
  traceStarts: Array<{ screenshots: boolean; snapshots: boolean; sources: boolean }> = [];
  traceStops: Array<{ path: string }> = [];
  tracing = {
    start: async (options: { screenshots: boolean; snapshots: boolean; sources: boolean }) => {
      this.traceStarts.push(options);
    },
    stop: async (options: { path: string }) => {
      this.traceStops.push(options);
    }
  };

  constructor(private readonly page: FakePage) {}

  async newPage(): Promise<FakePage> {
    return this.page;
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

class FakePage {
  closed = false;
  clickedSelectors: string[] = [];
  filledFields: Array<{ selector: string; value: string }> = [];
  gotoCalls: Array<{ waitUntil: string; timeout: number }> = [];

  private readonly handlers = new Map<string, Array<(value: unknown) => void>>();

  constructor(
    private readonly options: {
      interactionCandidates?: Array<{ selector: string; description: string; kind?: string; riskText?: string; href?: string }>;
      rawInteractionElements?: FakeElement[];
      fieldCandidates?: Array<{ selector: string; value: string; riskText: string }>;
      clickFailures?: Record<string, string>;
      downloadSelectors?: Set<string>;
      elementStates?: Record<string, string[]>;
      consoleErrors?: Array<{ text: string; locationUrl?: string }>;
      responses?: Array<{ url: string; status: number; method?: string; resourceType?: string }>;
    } = {}
  ) {}

  on(event: string, handler: (value: unknown) => void): void {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
  }

  async goto(_url?: string, options?: { waitUntil: string; timeout: number }): Promise<{ status: () => number }> {
    if (options) {
      this.gotoCalls.push(options);
    }
    this.emit('console', {
      type: () => 'error',
      text: () => 'ReferenceError: widget is not defined'
    });
    for (const consoleError of this.options.consoleErrors ?? []) {
      this.emit('console', {
        type: () => 'error',
        text: () => consoleError.text,
        ...(consoleError.locationUrl
          ? { location: () => ({ url: consoleError.locationUrl, lineNumber: 0, columnNumber: 0 }) }
          : {})
      });
    }
    this.emit('pageerror', new Error('render failed'));
    this.emit('requestfailed', {
      url: () => 'http://localhost:3000/api/user',
      failure: () => ({ errorText: 'net::ERR_FAILED' })
    });
    for (const response of this.options.responses ?? []) {
      this.emit('response', {
        url: () => response.url,
        status: () => response.status,
        request: () => ({
          method: () => response.method ?? 'GET',
          resourceType: () => response.resourceType ?? 'fetch'
        })
      });
    }

    return { status: () => 200 };
  }

  async content(): Promise<string> {
    return '<html><body><a href="/settings">Settings</a><main>Home</main></body></html>';
  }

  locator(): { innerText: () => Promise<string> } {
    return {
      innerText: async () => 'Home'
    };
  }

  async $$eval(selector: string, pageFunction?: (elements: unknown[]) => unknown): Promise<unknown> {
    if (selector === 'a[href]') {
      return ['http://localhost:3000/settings'];
    }

    if (selector === 'input, textarea') {
      return this.options.fieldCandidates ?? [];
    }

    const elementStates = this.options.elementStates?.[selector];
    if (elementStates) {
      const state = elementStates[Math.min(this.clickedSelectors.filter((clicked) => clicked === selector).length, elementStates.length - 1)];
      return [state];
    }

    if (selector === 'button, [role="button"], input[type="submit"], a[href]' && this.options.rawInteractionElements && pageFunction) {
      return pageFunction(this.options.rawInteractionElements);
    }

    return this.options.interactionCandidates ?? [];
  }

  url(): string {
    return 'http://localhost:3000/settings';
  }

  async click(selector: string): Promise<void> {
    this.clickedSelectors.push(selector);
    const failure = this.options.clickFailures?.[selector];
    if (failure) {
      throw new Error(failure);
    }
    if (this.options.downloadSelectors?.has(selector)) {
      this.emit('download', { suggestedFilename: () => 'export.csv' });
    }
  }

  async fill(selector: string, value: string): Promise<void> {
    this.filledFields.push({ selector, value });
  }

  async waitForTimeout(): Promise<void> {
    return undefined;
  }

  async screenshot(): Promise<void> {
    return undefined;
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  private emit(event: string, value: unknown): void {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(value);
    }
  }
}

class FakeElement {
  disabled = false;
  hidden = false;

  constructor(
    readonly input: {
      tagName: string;
      textContent?: string;
      title?: string;
      ariaLabel?: string;
      id?: string;
      testId?: string;
    }
  ) {}

  get tagName(): string {
    return this.input.tagName;
  }

  get textContent(): string {
    return this.input.textContent ?? '';
  }

  getBoundingClientRect(): { width: number; height: number } {
    return { width: 24, height: 24 };
  }

  getAttribute(name: string): string | null {
    switch (name) {
      case 'title':
        return this.input.title ?? null;
      case 'aria-label':
        return this.input.ariaLabel ?? null;
      case 'id':
        return this.input.id ?? null;
      case 'data-testid':
        return this.input.testId ?? null;
      default:
        return null;
    }
  }

  setAttribute(): void {
    return undefined;
  }
}
