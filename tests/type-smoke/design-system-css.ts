import { readDesignSystemCss } from '@repoassure/design-system/css';

/* Proves the Node-side subpath of the design system resolves and is typed under the
   root tsconfig (NodeNext, no JSX). This is the path the Project Intelligence Console
   uses: it emits standalone HTML and inlines the token layer rather than linking it. */
const css: string = readDesignSystemCss();

export const designSystemCssLength: number = css.length;
