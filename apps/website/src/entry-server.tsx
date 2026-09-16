import { renderToString } from 'react-dom/server';

import { App } from './App.tsx';

/* Prerender-only entry point. Rendered once at build time (see
   scripts/prerender.mjs) so crawlers get real text in the initial HTML
   instead of an empty #root; the client still boots normally via main.tsx
   and replaces this markup on hydrate. Not shipped to the browser. */
export function render(): string {
  return renderToString(<App />);
}
