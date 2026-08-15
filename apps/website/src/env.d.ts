/* The design system exports its stylesheets as subpath entries with no type side. These
   declarations let the side-effect imports in main.tsx typecheck without loosening
   module resolution for anything else. */
declare module '@repoassure/design-system/styles';
declare module '@repoassure/design-system/styles/fonts';
