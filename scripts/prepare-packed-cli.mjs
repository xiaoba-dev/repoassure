#!/usr/bin/env node
/* Rewrites `@hardening-mcp/*` bare imports in the built output into relative paths.

   The workspace packages are private and never published, so a bare specifier that
   resolves fine inside the workspace throws ERR_MODULE_NOT_FOUND on every installed
   copy. The tarball ships each package's `dist/` alongside the CLI's own, so the
   imports only need to point at where the files actually land.

   The rewrite list is discovered rather than hardcoded: a hardcoded table silently
   misses the next bare import someone adds, and drifts the moment a tool is renamed. */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

const roots = ['dist', 'packages'];
/* Only import positions. A bare `'@hardening-mcp/x'` also appears inside audit prose,
   and rewriting a sentence would corrupt the report rather than fix a module graph. */
const specifier = /(from\s+|import\(|require\()(['"])@hardening-mcp\/([a-z0-9-]+)(\/[a-z0-9-/]+)?\2/gu;

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      yield* walk(full);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts')) {
      yield full;
    }
  }
}

/** `@hardening-mcp/shared/privacy-redaction` → `packages/shared/dist/privacy-redaction.js` */
function targetFor(packageName, subpath) {
  const file = subpath ? `${subpath.slice(1)}.js` : 'index.js';
  return join('packages', packageName, 'dist', file);
}

function toRelative(fromFile, target) {
  const rel = relative(dirname(fromFile), target).split(sep).join('/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

let rewritten = 0;
const touched = [];

for (const root of roots) {
  for await (const file of walk(root)) {
    const source = await readFile(file, 'utf8');
    if (!source.includes('@hardening-mcp/')) continue;

    const next = source.replace(specifier, (match, lead, quote, packageName, subpath) => {
      const target = targetFor(packageName, subpath);
      rewritten += 1;
      return `${lead}${quote}${toRelative(file, target)}${quote}`;
    });

    if (next !== source) {
      await writeFile(file, next);
      touched.push(file);
    }
  }
}

console.log(`Packed CLI: rewrote ${rewritten} workspace specifier(s) across ${touched.length} file(s).`);

/* A silent no-op would mean the build output changed shape and this stopped protecting
   anything, so say so rather than exiting 0 into a broken tarball. */
if (rewritten === 0) {
  console.warn('Packed CLI: no @hardening-mcp/* specifiers found — verify the build ran first.');
}
