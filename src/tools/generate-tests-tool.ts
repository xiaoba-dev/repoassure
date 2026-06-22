import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import {
  generatePlaywrightTests,
  type GenerateTestsInput,
  type GenerateTestsResult
} from '../domain/tests/generate-tests.js';

export interface GenerateTestsToolResult extends GenerateTestsResult {
  resultPath: string;
}

export async function runGenerateTestsTool(
  input: GenerateTestsInput
): Promise<GenerateTestsToolResult> {
  const result = await generatePlaywrightTests(input);
  const resultPath = join(dirname(input.findingsPath), 'test-generation.json');

  await mkdir(dirname(resultPath), { recursive: true });
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`);

  return {
    ...result,
    resultPath
  };
}
