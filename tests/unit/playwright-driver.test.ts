import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { exploreApp as packageExploreApp } from '../../packages/browser-explorer/src/explore-app.js';
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

  it('keeps a conditional dead control finding visible when a safe local transition enables the submit control', async () => {
    const expected = await readConditionalDeadControlSnapshot('positive');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        }
      ],
      onFill: () => {
        submitControl.disabled = false;
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const findings = result.findings.filter((finding) => finding.type === 'dead_control');

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      severity: 'P1',
      type: 'dead_control',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        `conditional_dead_control.prerequisite.initial_disabled=${expected.prerequisiteEvidence.initialDisabled}`,
        `conditional_dead_control.prerequisite.safe_dirty_transition_observed=${expected.prerequisiteEvidence.safeDirtyTransitionObserved}`,
        `conditional_dead_control.prerequisite.enabled_after_transition=${expected.prerequisiteEvidence.enabledAfterTransition}`,
        `conditional_dead_control.form_state_inferred=${expected.formStateInferred}`
      ])
    });
    expect(page.filledFields).toEqual([
      {
        selector: '[data-hardening-form-id="hardening-form-0"] [data-testid="display-name"]',
        value: 'Hardening Test'
      }
    ]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('keeps a conditional dead control actionable when it stays disabled after the safe local transition', async () => {
    const expected = await readConditionalDeadControlSnapshot('counter');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        }
      ]
    });

    const result = await exploreConditionalDeadControl(page);
    const findings = result.findings.filter((finding) => finding.type === 'dead_control');

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      severity: 'P1',
      type: 'dead_control',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        `conditional_dead_control.prerequisite.initial_disabled=${expected.prerequisiteEvidence.initialDisabled}`,
        `conditional_dead_control.prerequisite.safe_dirty_transition_observed=${expected.prerequisiteEvidence.safeDirtyTransitionObserved}`,
        `conditional_dead_control.prerequisite.still_disabled_after_transition=${expected.prerequisiteEvidence.stillDisabledAfterTransition}`,
        `conditional_dead_control.form_state_inferred=${expected.formStateInferred}`
      ])
    });
    expect(page.filledFields).toHaveLength(1);
    expect(page.clickedSelectors).toEqual([]);
  });

  it.each([
    { evidenceGap: 'missing', fieldRiskText: null, afterFill: 'unchanged' },
    { evidenceGap: 'unsafe', fieldRiskText: 'password', afterFill: 'unchanged' },
    { evidenceGap: 'unobservable', fieldRiskText: 'text display name', afterFill: 'hidden' },
    { evidenceGap: 'contradictory', fieldRiskText: 'text display name', afterFill: 'duplicate' }
  ] as const)(
    'fails a conditional dead control closed for $evidenceGap prerequisite evidence',
    async ({ fieldRiskText, afterFill }) => {
      const expected = await readConditionalDeadControlSnapshot('failClosed');
      const ownerForm = new FakeForm();
      const submitControl = new FakeElement({
        tagName: 'INPUT',
        type: 'submit',
        testId: 'save-settings',
        disabled: true,
        form: ownerForm
      });
      const rawInteractionElements = [submitControl];
      const page = new FakePage({
        rawInteractionElements,
        fieldCandidates: fieldRiskText === null
          ? []
          : [
              {
                selector: '[data-testid="display-name"]',
                value: 'Hardening Test',
                riskText: fieldRiskText
              }
            ],
        onFill: () => {
          if (afterFill === 'hidden') {
            submitControl.hidden = true;
          }
          if (afterFill === 'duplicate') {
            rawInteractionElements.push(
              new FakeElement({
                tagName: 'INPUT',
                type: 'submit',
                testId: 'save-settings',
                disabled: false,
                form: ownerForm
              })
            );
          }
        }
      });

      const result = await exploreConditionalDeadControl(page);
      const findings = result.findings.filter((finding) => finding.type === 'dead_control');

      expect(findings).toHaveLength(1);
      expect(findings[0]).toMatchObject({
        severity: 'P1',
        type: 'dead_control',
        evidence: expect.arrayContaining([
          `conditional_dead_control.classification=${expected.classification}`,
          `conditional_dead_control.prerequisite.initial_disabled=${expected.prerequisiteEvidence.initialDisabled}`,
          `conditional_dead_control.prerequisite.safe_dirty_transition_observed=${expected.prerequisiteEvidence.safeDirtyTransitionObserved}`,
          `conditional_dead_control.prerequisite.post_transition_state_known=${expected.prerequisiteEvidence.postTransitionStateKnown}`,
          `conditional_dead_control.form_state_inferred=${expected.formStateInferred}`
        ])
      });
      expect(page.clickedSelectors).toEqual([]);
    }
  );

  it('never clicks a conditional submit control after a safe fill changes its selector', async () => {
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        }
      ],
      onFill: () => {
        submitControl.disabled = false;
        submitControl.input.testId = 'save-settings-after-dirty';
      }
    });

    const result = await exploreConditionalDeadControl(page, 2);

    expect(result.findings.filter((finding) => finding.type === 'dead_control')).toHaveLength(1);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed without filling when the page changes during interaction candidate collection', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    let navigationTriggered = false;
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          currentValue: '',
          riskText: 'text display name'
        }
      ],
      onEvaluate: (selector, currentPage) => {
        if (!navigationTriggered && selector === 'button, [role="button"], input[type="submit"], a[href]') {
          navigationTriggered = true;
          currentPage.setUrl('http://localhost:3000/other-settings');
        }
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=candidate_observation_page_changed'
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed before filling when the owner form selector is not unique', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      selectorMatchCounts: {
        '[data-hardening-form-id="hardening-form-0"]': 2
      },
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        }
      ]
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=owner_form_not_unique'
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed after the first safe fill attempt fails without trying a second field', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        },
        {
          selector: '[data-testid="team-name"]',
          value: 'Hardening Test',
          riskText: 'text team name'
        }
      ],
      fillFailures: {
        '[data-testid="display-name"]': 'fill failed after input event'
      },
      onFill: () => {
        submitControl.disabled = false;
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=form_field_fill_failed'
      ])
    });
    expect(page.filledFields).toHaveLength(1);
    expect(page.filledFields[0]?.selector).toContain('[data-testid="display-name"]');
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed when a safe fill navigates away from the original loopback origin', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        }
      ],
      onFill: (_selector, _value, currentPage) => {
        submitControl.disabled = false;
        currentPage.setUrl('https://example.com/settings');
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=post_transition_page_changed'
      ])
    });
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed before filling when the scoped safe field selector is not unique', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const scopedFieldSelector =
      '[data-hardening-form-id="hardening-form-0"] [data-testid="display-name"]';
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      selectorMatchCounts: {
        [scopedFieldSelector]: 2
      },
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        }
      ]
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=form_field_not_uniquely_observable'
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed without filling when the page changes during live field observation', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const scopedFieldSelector =
      '[data-hardening-form-id="hardening-form-0"] [data-testid="display-name"]';
    let navigationTriggered = false;
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          currentValue: '',
          riskText: 'text display name'
        }
      ],
      onEvaluate: (selector, currentPage) => {
        if (!navigationTriggered && selector === scopedFieldSelector) {
          navigationTriggered = true;
          currentPage.setUrl('https://example.com/settings');
        }
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=pre_fill_page_changed'
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed without filling when the owner form becomes non-unique during live field observation', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const formSelector = '[data-hardening-form-id="hardening-form-0"]';
    const scopedFieldSelector = `${formSelector} [data-testid="display-name"]`;
    const selectorMatchCounts: Record<string, number> = {
      [formSelector]: 1
    };
    let duplicateTriggered = false;
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      selectorMatchCounts,
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          currentValue: '',
          riskText: 'text display name'
        }
      ],
      onEvaluate: (selector) => {
        if (!duplicateTriggered && selector === scopedFieldSelector) {
          duplicateTriggered = true;
          selectorMatchCounts[formSelector] = 2;
        }
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=pre_fill_owner_form_not_unique'
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed without filling on a non-http loopback-looking page', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        }
      ]
    });

    const result = await exploreConditionalDeadControl(
      page,
      1,
      'file://127.0.0.1/settings'
    );
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=non_loopback_page'
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed if the origin changes during post-transition observation', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    let fillObserved = false;
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          riskText: 'text display name'
        }
      ],
      onFill: () => {
        fillObserved = true;
        submitControl.disabled = false;
      },
      onEvaluate: (selector, currentPage) => {
        if (fillObserved && selector === 'button, [role="button"], input[type="submit"], a[href]') {
          currentPage.setUrl('https://example.com/settings');
        }
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=post_transition_page_changed'
      ])
    });
    expect(page.clickedSelectors).toEqual([]);
  });

  it('uses a deterministic distinct value when the preferred safe fill value is already present', async () => {
    const expected = await readConditionalDeadControlSnapshot('counter');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          currentValue: 'Hardening Test',
          riskText: 'text display name'
        }
      ]
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.prerequisite.safe_dirty_transition_observed=true'
      ])
    });
    expect(page.filledFields).toEqual([
      expect.objectContaining({ value: 'Hardening Test 2' })
    ]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed when a successful fill does not produce an observed field value change', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const scopedFieldSelector =
      '[data-hardening-form-id="hardening-form-0"] [data-testid="display-name"]';
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          currentValue: 'Original value',
          riskText: 'text display name'
        }
      ],
      preserveFieldValueOnFill: new Set([scopedFieldSelector]),
      onFill: () => {
        submitControl.disabled = false;
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=form_field_value_unchanged'
      ])
    });
    expect(page.filledFields).toHaveLength(1);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed without filling when the selected field becomes sensitive before fill', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const scopedFieldSelector =
      '[data-hardening-form-id="hardening-form-0"] [data-testid="display-name"]';
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          currentValue: '',
          riskText: 'text display name'
        }
      ],
      fieldStateOverrides: {
        [scopedFieldSelector]: {
          riskText: 'password current-password'
        }
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=form_field_became_unsafe'
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed when the owner form selector becomes non-unique after fill', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const formSelector = '[data-hardening-form-id="hardening-form-0"]';
    const selectorMatchCounts: Record<string, number> = {
      [formSelector]: 1
    };
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      selectorMatchCounts,
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          currentValue: '',
          riskText: 'text display name'
        }
      ],
      onFill: () => {
        submitControl.disabled = false;
        selectorMatchCounts[formSelector] = 2;
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=post_transition_owner_form_not_unique'
      ])
    });
    expect(page.clickedSelectors).toEqual([]);
  });

  it('fails closed when fill navigates to a different path on the same origin', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'save-settings',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="display-name"]',
          value: 'Hardening Test',
          currentValue: '',
          riskText: 'text display name'
        }
      ],
      onFill: (_selector, _value, currentPage) => {
        submitControl.disabled = false;
        currentPage.setUrl('http://localhost:3000/other-settings');
      }
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=post_transition_page_changed'
      ])
    });
    expect(page.clickedSelectors).toEqual([]);
  });

  it('does not inject a form marker while collecting an ordinary enabled control', async () => {
    const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-enabled-form-control-'));
    const ownerForm = new FakeForm();
    const enabledControl = new FakeElement({
      tagName: 'BUTTON',
      type: 'button',
      testId: 'open-options',
      disabled: false,
      form: ownerForm
    });
    const page = new FakePage({ rawInteractionElements: [enabledControl] });
    const driver = await packageCreatePlaywrightBrowserDriver({
      launcher: {
        launch: async () => new FakeBrowser(page)
      }
    });

    await driver.snapshot('http://localhost:3000/settings', {
      artifactsDir,
      maxActionsPerRoute: 1
    });
    await driver.close();

    expect(ownerForm.getAttribute('data-hardening-form-id')).toBeNull();
    expect(page.clickedSelectors).toEqual(['[data-testid="open-options"]:visible']);
  });

  it('keeps a dangerous disabled submit visible as a fail-closed P1 finding without filling or clicking', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ownerForm = new FakeForm();
    const submitControl = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'delete-account',
      textContent: 'Delete account',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [submitControl],
      fieldCandidates: [
        {
          selector: '[data-testid="confirmation"]',
          value: 'Hardening Test',
          currentValue: '',
          riskText: 'text confirmation'
        }
      ]
    });

    const result = await exploreConditionalDeadControl(page);
    const finding = result.findings.find((candidate) => candidate.type === 'dead_control');

    expect(finding).toMatchObject({
      severity: 'P1',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`,
        'conditional_dead_control.fail_closed_reason=unsafe_disabled_control'
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual([]);
  });

  it('keeps a dangerous disabled submit visible after the mutation budget is already consumed', async () => {
    const expected = await readConditionalDeadControlSnapshot('failClosed');
    const ordinaryControl = new FakeElement({
      tagName: 'BUTTON',
      type: 'button',
      testId: 'open-options',
      disabled: false
    });
    const ownerForm = new FakeForm();
    const dangerousSubmit = new FakeElement({
      tagName: 'INPUT',
      type: 'submit',
      testId: 'delete-account',
      textContent: 'Delete account',
      disabled: true,
      form: ownerForm
    });
    const page = new FakePage({
      rawInteractionElements: [ordinaryControl, dangerousSubmit],
      fieldCandidates: [
        {
          selector: '[data-testid="confirmation"]',
          value: 'Hardening Test',
          currentValue: '',
          riskText: 'text confirmation'
        }
      ]
    });

    const result = await exploreConditionalDeadControl(page, 1);
    const unsafeFinding = result.findings.find((finding) =>
      finding.evidence.includes('conditional_dead_control.fail_closed_reason=unsafe_disabled_control')
    );

    expect(unsafeFinding).toMatchObject({
      severity: 'P1',
      type: 'dead_control',
      evidence: expect.arrayContaining([
        `conditional_dead_control.classification=${expected.classification}`
      ])
    });
    expect(page.filledFields).toEqual([]);
    expect(page.clickedSelectors).toEqual(['[data-testid="open-options"]:visible']);
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

  private currentUrl = 'http://localhost:3000/settings';

  private readonly handlers = new Map<string, Array<(value: unknown) => void>>();

  constructor(
    private readonly options: {
      interactionCandidates?: Array<{ selector: string; description: string; kind?: string; riskText?: string }>;
      rawInteractionElements?: FakeElement[];
      fieldCandidates?: Array<{
        selector: string;
        value: string;
        currentValue?: string;
        riskText: string;
      }>;
      selectorMatchCounts?: Record<string, number>;
      fieldStateOverrides?: Record<string, {
        count?: number;
        value?: string | null;
        riskText?: string;
        editable?: boolean;
      }>;
      clickFailures?: Record<string, string>;
      fillFailures?: Record<string, string>;
      preserveFieldValueOnFill?: Set<string>;
      downloadSelectors?: Set<string>;
      elementStates?: Record<string, string[]>;
      onFill?: (selector: string, value: string, page: FakePage) => void;
      onEvaluate?: (selector: string, page: FakePage) => void;
    } = {}
  ) {}

  on(event: string, handler: (value: unknown) => void): void {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
  }

  async goto(url?: string, options?: { waitUntil: string; timeout: number }): Promise<{ status: () => number }> {
    if (url) {
      this.currentUrl = url;
    }
    if (options) {
      this.gotoCalls.push(options);
    }
    this.emit('console', {
      type: () => 'error',
      text: () => 'ReferenceError: widget is not defined'
    });
    this.emit('pageerror', new Error('render failed'));
    this.emit('requestfailed', {
      url: () => 'http://localhost:3000/api/user',
      failure: () => ({ errorText: 'net::ERR_FAILED' })
    });

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
    this.options.onEvaluate?.(selector, this);

    if (selector === 'a[href]') {
      return ['http://localhost:3000/settings'];
    }

    if (selector === 'input, textarea' || (selector.includes(' input, ') && selector.endsWith(' textarea'))) {
      return this.options.fieldCandidates ?? [];
    }

    const directFieldCandidate = this.options.fieldCandidates?.find((candidate) => (
      selector === candidate.selector || selector.endsWith(` ${candidate.selector}`)
    ));
    const pageFunctionSource = pageFunction ? String(pageFunction) : '';
    if (directFieldCandidate && pageFunctionSource.includes('editable')) {
      const override = this.options.fieldStateOverrides?.[selector];
      const count = override?.count ?? this.options.selectorMatchCounts?.[selector] ?? 1;
      return {
        count,
        value: override?.value ?? (count === 1 ? directFieldCandidate.currentValue ?? '' : null),
        riskText: override?.riskText ?? directFieldCandidate.riskText,
        editable: override?.editable ?? true
      };
    }

    const configuredMatchCount = this.options.selectorMatchCounts?.[selector];
    if (configuredMatchCount !== undefined) {
      return configuredMatchCount;
    }

    if (selector.startsWith('[data-hardening-form-id=')) {
      return 1;
    }

    if (this.options.fieldCandidates?.some((candidate) => (
      selector === candidate.selector || selector.endsWith(` ${candidate.selector}`)
    ))) {
      return 1;
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
    return this.currentUrl;
  }

  setUrl(url: string): void {
    this.currentUrl = url;
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
    this.options.onFill?.(selector, value, this);
    const directCandidate = this.options.fieldCandidates?.find((candidate) => (
      selector === candidate.selector || selector.endsWith(` ${candidate.selector}`)
    ));
    const directSelector = directCandidate?.selector;
    const failure = this.options.fillFailures?.[selector]
      ?? (directSelector ? this.options.fillFailures?.[directSelector] : undefined);
    if (failure) {
      throw new Error(failure);
    }
    if (directCandidate && !this.options.preserveFieldValueOnFill?.has(selector)) {
      directCandidate.currentValue = value;
    }
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
  disabled: boolean;
  hidden = false;
  readonly form: FakeForm | null;

  constructor(
    readonly input: {
      tagName: string;
      type?: string;
      textContent?: string;
      title?: string;
      ariaLabel?: string;
      id?: string;
      testId?: string;
      disabled?: boolean;
      form?: FakeForm | null;
    }
  ) {
    this.disabled = input.disabled ?? false;
    this.form = input.form ?? null;
  }

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
      case 'type':
        return this.input.type ?? null;
      default:
        return null;
    }
  }

  setAttribute(): void {
    return undefined;
  }
}

class FakeForm {
  private readonly attributes = new Map<string, string>();

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }
}

type ConditionalDeadControlFixtureSnapshot = {
  classification: string;
  prerequisiteEvidence: Record<string, boolean>;
  formStateInferred: false;
};

async function readConditionalDeadControlSnapshot(
  branch: 'positive' | 'counter' | 'failClosed'
): Promise<ConditionalDeadControlFixtureSnapshot> {
  const fixture = JSON.parse(
    await readFile(
      'tests/fixtures/conditional-dead-control-synthetic/form-dirty-states.json',
      'utf8'
    )
  ) as { snapshots: Record<string, ConditionalDeadControlFixtureSnapshot> };
  const snapshot = fixture.snapshots[branch];

  if (!snapshot) {
    throw new Error(`Missing conditional dead control fixture snapshot: ${branch}`);
  }

  return snapshot;
}

async function exploreConditionalDeadControl(
  page: FakePage,
  maxActionsPerRoute = 1,
  url = 'http://localhost:3000/settings'
) {
  const artifactsDir = await mkdtemp(join(tmpdir(), 'hardening-conditional-dead-control-'));
  const driver = await packageCreatePlaywrightBrowserDriver({
    launcher: {
      launch: async () => new FakeBrowser(page)
    }
  });

  return packageExploreApp({
    url,
    criticalPaths: [],
    maxRoutes: 1,
    maxActionsPerRoute,
    artifactsDir,
    browserDriver: driver
  });
}
