import { expandCriticalPathInput, exploreApp, extractLinks } from '../../src/domain/explore/explore-app.js';

describe('extractLinks', () => {
  it('extracts same-origin links and ignores external links', () => {
    const links = extractLinks(
      `
      <a href="/settings">Settings</a>
      <a href="http://localhost:3000/dashboard">Dashboard</a>
      <a href="https://example.com/">External</a>
      <a href="#section">Hash</a>
      `,
      'http://localhost:3000/'
    );

    expect(links).toEqual(['http://localhost:3000/settings', 'http://localhost:3000/dashboard']);
  });
});

describe('exploreApp', () => {
  it('visits routes and records broken route findings', async () => {
    const pages = new Map([
      [
        'http://localhost:3000/',
        {
          status: 200,
          body: '<html><body><a href="/missing">Missing</a></body></html>'
        }
      ],
      ['http://localhost:3000/missing', { status: 404, body: 'not found' }]
    ]);

    const result = await exploreApp({
      url: 'http://localhost:3000/',
      criticalPaths: [],
      maxRoutes: 5,
      maxActionsPerRoute: 0,
      fetchPage: async (url) => pages.get(url) ?? { status: 500, body: '' }
    });

    expect(result.visitedRoutes).toEqual(['http://localhost:3000/', 'http://localhost:3000/missing']);
    expect(result.findings).toEqual([
      {
        severity: 'P1',
        type: 'broken_route',
        title: 'Route returned HTTP 404',
        reproSteps: ['Go to http://localhost:3000/missing'],
        evidence: ['status=404']
      }
    ]);
  });

  it('records blank pages as white screen findings', async () => {
    const result = await exploreApp({
      url: 'http://localhost:3000/',
      criticalPaths: [],
      maxRoutes: 1,
      maxActionsPerRoute: 0,
      fetchPage: async () => ({ status: 200, body: '<html><body>   </body></html>' })
    });

    expect(result.findings[0]).toMatchObject({
      severity: 'P0',
      type: 'white_screen',
      title: 'Route rendered an empty body'
    });
  });

  it('uses a browser driver to capture runtime findings and artifacts', async () => {
    const result = await exploreApp({
      url: 'http://localhost:3000/',
      criticalPaths: ['/settings'],
      maxRoutes: 5,
      maxActionsPerRoute: 2,
      artifactsDir: '/tmp/hardening-artifacts',
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: url.endsWith('/settings') ? '<html><body>   </body></html>' : '<html><body><a href="/settings">Settings</a></body></html>',
          bodyText: url.endsWith('/settings') ? '' : 'Home',
          links: url.endsWith('/settings') ? [] : ['http://localhost:3000/settings'],
          consoleErrors: url.endsWith('/settings') ? [] : ['ReferenceError: widget is not defined'],
          pageErrors: [],
          failedRequests: ['GET /api/user 500'],
          artifactFiles: [`/tmp/hardening-artifacts/${url.endsWith('/settings') ? 'settings' : 'home'}.png`],
          interactions: []
        }),
        close: async () => undefined
      }
    });

    expect(result.visitedRoutes).toEqual(['http://localhost:3000/', 'http://localhost:3000/settings']);
    expect(result.artifactFiles).toEqual(['/tmp/hardening-artifacts/home.png', '/tmp/hardening-artifacts/settings.png']);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'P1',
          type: 'console_error',
          title: 'Route emitted browser runtime errors'
        }),
        expect.objectContaining({
          severity: 'P1',
          type: 'network_error',
          title: 'Route emitted failed network requests'
        }),
        expect.objectContaining({
          severity: 'P0',
          type: 'white_screen',
          title: 'Route rendered an empty body'
        })
      ])
    );
  });

  it('expands natural-language critical path intents into route candidates', () => {
    expect(expandCriticalPathInput('测试登录、创建项目并发送一条聊天消息', 'http://localhost:3000/')).toEqual([
      'http://localhost:3000/login',
      'http://localhost:3000/projects/new',
      'http://localhost:3000/projects',
      'http://localhost:3000/chat'
    ]);
  });

  it('ignores full-url critical paths outside the target origin', () => {
    expect(expandCriticalPathInput('https://external.example/login', 'http://localhost:3000/')).toEqual([]);
  });

  it('does not visit external-origin critical paths', async () => {
    const visited: string[] = [];

    await exploreApp({
      url: 'http://localhost:3000/',
      criticalPaths: ['https://external.example/login'],
      maxRoutes: 5,
      maxActionsPerRoute: 0,
      fetchPage: async (url) => {
        visited.push(url);
        return { status: 200, body: '<html><body>ok</body></html>' };
      }
    });

    expect(visited).toEqual(['http://localhost:3000/']);
  });

  it('seeds exploration with natural-language critical path candidates', async () => {
    const visited: string[] = [];

    const result = await exploreApp({
      url: 'http://localhost:3000/',
      criticalPaths: ['测试登录、创建项目并发送一条聊天消息'],
      maxRoutes: 5,
      maxActionsPerRoute: 0,
      fetchPage: async (url) => {
        visited.push(url);
        return { status: 200, body: '<html><body>ok</body></html>' };
      }
    });

    expect(visited).toEqual([
      'http://localhost:3000/',
      'http://localhost:3000/login',
      'http://localhost:3000/projects/new',
      'http://localhost:3000/projects',
      'http://localhost:3000/chat'
    ]);
    expect(result.findings).toEqual([]);
  });

  it('records failed browser interactions as actionable findings', async () => {
    const result = await exploreApp({
      url: 'http://localhost:3000/',
      criticalPaths: [],
      maxRoutes: 1,
      maxActionsPerRoute: 3,
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><button>Save</button></body></html>',
          bodyText: 'Save',
          links: [],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [],
          interactions: [
            {
              description: 'Click "Save"',
              outcome: 'dead_control',
              evidence: ['button_click_no_dom_or_url_change=true']
            },
            {
              description: 'Submit "Email form"',
              outcome: 'form_failure',
              evidence: ['submit_result=validation_error_without_message']
            }
          ]
        }),
        close: async () => undefined
      }
    });

    expect(result.interactions).toEqual(['Click "Save"', 'Submit "Email form"']);
    expect(result.findings).toEqual([
      {
        severity: 'P1',
        type: 'dead_control',
        title: 'Interaction did not produce an observable result',
        reproSteps: ['Go to http://localhost:3000/', 'Click "Save"'],
        evidence: ['button_click_no_dom_or_url_change=true']
      },
      {
        severity: 'P1',
        type: 'form_failure',
        title: 'Form interaction failed',
        reproSteps: ['Go to http://localhost:3000/', 'Submit "Email form"'],
        evidence: ['submit_result=validation_error_without_message']
      }
    ]);
  });

  it('redacts sensitive browser finding evidence before returning findings', async () => {
    const result = await exploreApp({
      url: 'http://localhost:3000/callback?code=oauth-secret#access_token=fragment-secret',
      criticalPaths: [],
      maxRoutes: 1,
      maxActionsPerRoute: 2,
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><button>Save</button></body></html>',
          bodyText: 'Save',
          links: [],
          consoleErrors: ['OPENAI_API_KEY=sk-console-secret'],
          pageErrors: ['Authorization: Bearer page-error-token'],
          failedRequests: [
            'https://api.example.test/oauth/callback?code=failed-request-secret&tab=profile#access_token=failed-fragment-secret :: net::ERR_FAILED'
          ],
          artifactFiles: [],
          interactions: [
            {
              description: 'Click "Save"',
              outcome: 'dead_control',
              evidence: ['session=interaction-session-secret']
            }
          ]
        }),
        close: async () => undefined
      }
    });
    const serializedFindings = JSON.stringify(result.findings);

    expect(serializedFindings).toContain('OPENAI_API_KEY=[REDACTED]');
    expect(serializedFindings).toContain('Authorization: Bearer [REDACTED]');
    expect(serializedFindings).toContain('code=[REDACTED]');
    expect(serializedFindings).toContain('access_token=[REDACTED]');
    expect(serializedFindings).toContain('session=[REDACTED]');
    expect(serializedFindings).not.toContain('oauth-secret');
    expect(serializedFindings).not.toContain('fragment-secret');
    expect(serializedFindings).not.toContain('sk-console-secret');
    expect(serializedFindings).not.toContain('page-error-token');
    expect(serializedFindings).not.toContain('failed-request-secret');
    expect(serializedFindings).not.toContain('failed-fragment-secret');
    expect(serializedFindings).not.toContain('interaction-session-secret');
  });

  it('redacts sensitive visited routes and interaction descriptions before returning exploration results', async () => {
    const result = await exploreApp({
      url: 'http://localhost:3000/callback?code=oauth-secret#access_token=fragment-secret',
      criticalPaths: [],
      maxRoutes: 1,
      maxActionsPerRoute: 1,
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><button>Continue with token=interaction-token-secret</button></body></html>',
          bodyText: 'Continue',
          links: [],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [],
          interactions: [
            {
              description: 'Click "Continue with token=interaction-token-secret"',
              outcome: 'ok',
              evidence: []
            }
          ]
        }),
        close: async () => undefined
      }
    });
    const serializedResult = JSON.stringify({
      visitedRoutes: result.visitedRoutes,
      interactions: result.interactions
    });

    expect(serializedResult).toContain('code=[REDACTED]');
    expect(serializedResult).toContain('access_token=[REDACTED]');
    expect(serializedResult).toContain('token=[REDACTED]');
    expect(serializedResult).not.toContain('oauth-secret');
    expect(serializedResult).not.toContain('fragment-secret');
    expect(serializedResult).not.toContain('interaction-token-secret');
  });

  it('records skipped unsafe interactions without creating findings', async () => {
    const result = await exploreApp({
      url: 'http://localhost:3000/',
      criticalPaths: [],
      maxRoutes: 1,
      maxActionsPerRoute: 1,
      browserDriver: {
        snapshot: async (url) => ({
          url,
          status: 200,
          html: '<html><body><button>Delete account</button></body></html>',
          bodyText: 'Delete account',
          links: [],
          consoleErrors: [],
          pageErrors: [],
          failedRequests: [],
          artifactFiles: [],
          interactions: [
            {
              description: 'Click "Delete account"',
              outcome: 'skipped_unsafe',
              evidence: ['reason=destructive_or_sensitive_action']
            }
          ]
        }),
        close: async () => undefined
      }
    });

    expect(result.interactions).toEqual(['Click "Delete account"']);
    expect(result.findings).toEqual([]);
  });
});
