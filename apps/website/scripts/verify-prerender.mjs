// Regression guard for the prerender step: fails the build if dist/index.html
// ever goes back to shipping an empty #root (the CSR-only state this fixed).
// Run this against a clean `git stash` of prerender.mjs/entry-server.tsx to
// confirm it goes red without the fix before trusting it goes green with it.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const indexPath = path.join(appDir, 'dist', 'index.html');

const html = readFileSync(indexPath, 'utf-8');
const visibleText = html
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const MIN_CHARS = 500; // real hero copy alone is >1000 chars; the CSR-only shell was 10

if (visibleText.length < MIN_CHARS) {
  console.error(
    `[verify-prerender] FAIL: dist/index.html has only ${visibleText.length} visible chars ` +
      `(need >= ${MIN_CHARS}). The prerender step likely didn't run or silently produced no output.`
  );
  process.exit(1);
}

console.log(`[verify-prerender] OK: dist/index.html has ${visibleText.length} visible chars.`);
