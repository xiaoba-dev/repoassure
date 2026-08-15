import { realpath } from 'node:fs/promises';

import {
  verifyEnvironment,
  type VerifyEnvironmentResult
} from '../domain/verify-environment/verify-environment.js';

export interface VerifyEnvironmentToolInput {
  runDir: string;
  deployedUrl: string;
}

export async function runVerifyEnvironmentTool(
  input: VerifyEnvironmentToolInput
): Promise<VerifyEnvironmentResult> {
  return verifyEnvironment({
    runDir: await resolveRunDir(input.runDir),
    deployedUrl: input.deployedUrl
  });
}

/* `.hardening/latest` is a symlink, and the verification writes beside the
   findings it read, so resolve it to the run it points at. */
async function resolveRunDir(runDir: string): Promise<string> {
  try {
    return await realpath(runDir);
  } catch {
    return runDir;
  }
}
