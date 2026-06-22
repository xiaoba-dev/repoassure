import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  bootApp,
  type BootAppInput,
  type BootAppResult,
  type BootAppSession
} from '../domain/boot/boot-app.js';
import { redactSensitiveText } from '../shared/privacy-redaction.js';

export interface BootAppToolSession extends BootAppSession {
  resultPath: string;
}

export function toSerializableBootResult(session: BootAppSession): BootAppResult {
  return {
    status: session.status,
    url: session.url ? redactSensitiveText(session.url) : null,
    port: session.port,
    logsPath: redactSensitiveText(session.logsPath),
    blockers: session.blockers.map((blocker) => redactSensitiveText(blocker)),
    errors: session.errors.map((error) => redactSensitiveText(error))
  };
}

export async function runBootAppTool(input: BootAppInput): Promise<BootAppToolSession> {
  const session = await bootApp(input);
  const runDir = join(input.root, '.hardening', 'run');
  const resultPath = join(runDir, 'boot-result.json');

  await mkdir(runDir, { recursive: true });
  await writeFile(resultPath, `${JSON.stringify(toSerializableBootResult(session), null, 2)}\n`);

  return {
    ...session,
    resultPath
  };
}
