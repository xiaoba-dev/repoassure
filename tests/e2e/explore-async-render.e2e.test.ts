import { mkdtemp } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { exploreApp } from '../../packages/browser-explorer/src/explore-app.js';
import { createPlaywrightBrowserDriver } from '../../packages/browser-explorer/src/playwright-driver.js';

const browserIt = process.env.HARDENING_E2E_BROWSER === '1' ? it : it.skip;

/* The shape of an SPA whose router awaits an auth check before rendering anything
   (TanStack Router's `beforeLoad: requireSession(...)`): the body is empty when the
   load event fires and only fills in once the session request resolves. Reading the
   page at the load event reported every such route as a P0 white screen while the
   screenshot taken a moment later showed it fully rendered. */
const asyncRenderPage = `<!doctype html>
<html>
  <head><title>Ops</title><link rel="icon" href="data:,"></head>
  <body>
    <div id="root"></div>
    <script>
      fetch('/api/auth/me')
        .then((response) => response.json())
        .then((session) => {
          document.getElementById('root').innerHTML =
            '<main><h1>Ops dashboard</h1><p>Signed in as ' + session.name + '</p></main>';
        });
    </script>
  </body>
</html>`;

const blankPage = `<!doctype html>
<html>
  <head><title>Blank</title><link rel="icon" href="data:,"></head>
  <body><div id="root"></div></body>
</html>`;

const sessionDelayMs = 300;

describe('browser exploration of asynchronously rendered routes', () => {
  browserIt(
    'reports a genuinely blank route as a white screen but not a route that renders after an async fetch',
    async () => {
      const server = createServer((request, response) => {
        if (request.url === '/api/auth/me') {
          setTimeout(() => {
            response.writeHead(200, { 'content-type': 'application/json' });
            response.end(JSON.stringify({ name: 'ops-admin' }));
          }, sessionDelayMs);
          return;
        }

        response.writeHead(200, { 'content-type': 'text/html' });
        response.end(request.url === '/blank' ? blankPage : asyncRenderPage);
      });

      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

      try {
        const result = await exploreApp({
          url: `${origin}/ops`,
          criticalPaths: ['/blank'],
          maxRoutes: 2,
          maxActionsPerRoute: 0,
          artifactsDir: await mkdtemp(join(tmpdir(), 'hardening-e2e-async-render-')),
          browserDriver: await createPlaywrightBrowserDriver()
        });

        expect(result.visitedRoutes).toEqual([`${origin}/ops`, `${origin}/blank`]);
        expect(
          result.findings.filter((finding) => finding.type === 'white_screen').map((finding) => finding.reproSteps)
        ).toEqual([[`Go to ${origin}/blank`]]);
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
    30_000
  );
});
