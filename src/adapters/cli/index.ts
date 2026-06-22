#!/usr/bin/env node

import { runCli } from './run.js';

const exitCode = await runCli(process.argv.slice(2), {
  writeStdout: (chunk) => {
    process.stdout.write(chunk);
  },
  writeStderr: (chunk) => {
    process.stderr.write(chunk);
  }
});

process.exitCode = exitCode;
