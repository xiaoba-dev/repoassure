/**
 * Returns the design system's token and base layer as a single CSS string,
 * with the `@import` chain already flattened and no external references.
 *
 * Intended for surfaces that emit standalone HTML rather than going through a
 * bundler. Does not include the self-hosted brand faces: those live in
 * `styles/fonts.css` and reference font files by URL, which the Project
 * Intelligence Console is not permitted to emit.
 */
export declare function readDesignSystemCss(): string;
