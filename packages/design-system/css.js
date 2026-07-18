import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(fileURLToPath(import.meta.url));

/* The @import chain in styles/index.css, flattened in the same order.
   Surfaces that generate standalone HTML cannot rely on a bundler to resolve
   @import, and the Project Intelligence Console additionally forbids any
   external reference in its output — so it inlines this string instead. */
const tokenLayerFiles = [
  'styles/tokens/colors.css',
  'styles/tokens/typography.css',
  'styles/tokens/spacing.css',
  'styles/tokens/effects.css',
  'styles/base.css'
];

export function readDesignSystemCss() {
  return tokenLayerFiles.map((file) => readFileSync(join(packageRoot, file), 'utf8').trim()).join('\n\n');
}
