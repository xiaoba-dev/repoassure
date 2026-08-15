import { describe, expect, it } from 'vitest';

import { isIgnoredSnapshotPath } from '../../packages/acceptance/src/run-project-intelligence-snapshot.js';

describe('project intelligence path filtering', () => {
  it('ignores vendor and build directories wherever they are nested', () => {
    // The filter was root-anchored, so `node_modules/` only matched at the repository
    // root. 2149 of 2502 code graph nodes were apps/website/node_modules files — 85.9%
    // of the graph — and they filled the 80-item display window, hiding all 357 test
    // relationship edges the console specification asks it to show.
    expect(isIgnoredSnapshotPath('apps/website/node_modules/lucide-react/index.js')).toBe(true);
    expect(isIgnoredSnapshotPath('packages/acceptance/dist/index.js')).toBe(true);
    expect(isIgnoredSnapshotPath('apps/website/dist/assets/index.css')).toBe(true);
    expect(isIgnoredSnapshotPath('some/deep/path/coverage/report.json')).toBe(true);
  });

  it('still ignores the root-anchored cases it always caught', () => {
    expect(isIgnoredSnapshotPath('node_modules/typescript/lib/tsc.js')).toBe(true);
    expect(isIgnoredSnapshotPath('dist/index.js')).toBe(true);
    expect(isIgnoredSnapshotPath('artifacts/project-graph/snapshot.json')).toBe(true);
    expect(isIgnoredSnapshotPath('.git/config')).toBe(true);
  });

  it('keeps real source files', () => {
    expect(isIgnoredSnapshotPath('src/adapters/cli/run.ts')).toBe(false);
    expect(isIgnoredSnapshotPath('packages/acceptance/src/goal-audit.ts')).toBe(false);
    expect(isIgnoredSnapshotPath('apps/website/src/App.tsx')).toBe(false);
    expect(isIgnoredSnapshotPath('docs/adr/0022-repoassure-design-system-v2-and-information-architecture.md')).toBe(false);
  });

  it('does not ignore a path merely because a segment contains an ignored name', () => {
    // `dist` as a substring is not `dist` as a directory.
    expect(isIgnoredSnapshotPath('src/distribution/packager.ts')).toBe(false);
    expect(isIgnoredSnapshotPath('docs/artifacts-overview.md')).toBe(false);
  });
});
