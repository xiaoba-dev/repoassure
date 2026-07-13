process.stderr.write(`discarded-stderr-prefix-${'x'.repeat(70 * 1024)}`);
process.stderr.end('API_KEY=early-exit-secret\n', () => process.exit(1));
