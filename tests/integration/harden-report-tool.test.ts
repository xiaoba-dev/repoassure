import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runHardenReportTool } from '../../src/tools/harden-report-tool.js';

describe('runHardenReportTool', () => {
  it('writes hardening-report.md and returns report metadata', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hardening-report-tool-'));
    const runDir = join(root, '.hardening', 'run');
    const outputPath = join(root, 'hardening-report.md');

    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'repo-profile.json'), JSON.stringify({ blockers: [], confidence: 'medium' }));
    await writeFile(join(runDir, 'boot-result.json'), JSON.stringify({ status: 'running', blockers: [], errors: [] }));
    await writeFile(join(runDir, 'findings.json'), JSON.stringify({ findings: [] }));
    await writeFile(
      join(runDir, 'test-generation.json'),
      JSON.stringify({ createdFiles: [], testCommand: 'npx playwright test tests/hardening' })
    );

    const result = await runHardenReportTool({ runDir, outputPath });
    const report = await readFile(outputPath, 'utf8');
    const patchDiff = await readFile(result.patchDiffPath, 'utf8');

    expect(result.reportPath).toBe(outputPath);
    expect(result.readinessScore).toBeGreaterThan(0);
    expect(report).toContain('## 摘要');
    expect(patchDiff).toContain('diff --git a/docs/hardening-remediation.md b/docs/hardening-remediation.md');
  });
});
