import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { analyzeRepo, type AnalyzeRepoInput, type RepoProfile } from '../domain/analyze/analyze-repo.js';

export interface AnalyzeRepoToolResult {
  profile: RepoProfile;
  profilePath: string;
}

export async function runAnalyzeRepoTool(input: AnalyzeRepoInput): Promise<AnalyzeRepoToolResult> {
  const profile = await analyzeRepo(input);
  const runDir = join(input.root, '.hardening', 'run');
  const profilePath = join(runDir, 'repo-profile.json');

  await mkdir(runDir, { recursive: true });
  await writeFile(profilePath, `${JSON.stringify(profile, null, 2)}\n`);

  return {
    profile,
    profilePath
  };
}
