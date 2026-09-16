// Injects a static server-rendered snapshot of <App/> into dist/index.html so
// crawlers (search engines, AI agents) see real text on first fetch instead of
// an empty #root that only fills in after client-side JS runs. The client
// still boots normally via main.tsx and replaces this markup.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const indexPath = path.join(appDir, 'dist', 'index.html');
const ssrEntryPath = path.join(appDir, 'dist-ssr', 'entry-server.js');

const { render } = await import(ssrEntryPath);
const appHtml = render();

const html = readFileSync(indexPath, 'utf-8');
const marker = '<div id="root"></div>';
if (!html.includes(marker)) {
  throw new Error(`prerender: expected exactly "${marker}" in ${indexPath}, found none — check index.html hasn't changed shape`);
}
writeFileSync(indexPath, html.replace(marker, `<div id="root">${appHtml}</div>`));

console.log(`[prerender] injected ${appHtml.length} chars of server-rendered markup into dist/index.html`);
