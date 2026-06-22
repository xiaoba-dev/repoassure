import { spawn } from 'node:child_process';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatBenchmarkFatalError } from '../dist/internal/benchmark/fatal-error.js';
import { buildBenchmarkMarkdown, summarizeBenchmarkResults } from '../dist/internal/benchmark/report.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixturesDir = join(root, 'fixtures', 'benchmark');
const runDir = join(root, 'artifacts', 'benchmark-runs', `run-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const cliPath = join(root, 'dist', 'adapters', 'cli', 'index.js');
const playwrightPath = join(root, 'node_modules', '.bin', 'playwright');

main().catch((error) => {
  process.stderr.write(`${formatBenchmarkFatalError(error)}\n`);
  process.exitCode = 1;
});

async function main() {
  const results = [];
  const startedAt = Date.now();

  await mkdir(runDir, { recursive: true });

  const fixtures = (await readdir(fixturesDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const fixture of fixtures) {
    const fixtureSource = join(fixturesDir, fixture);
    const repoRoot = join(runDir, fixture);

    await cp(fixtureSource, repoRoot, { recursive: true });
    results.push(await runBenchmarkRepo({ name: fixture, repoRoot }));
  }

  const totalDurationMs = Date.now() - startedAt;
  const summary = summarizeBenchmarkResults(results, totalDurationMs);
  const markdown = buildBenchmarkMarkdown({
    generatedAt: new Date().toISOString(),
    runDir,
    summary,
    results
  });

  await writeFile(join(root, 'docs', 'logs', 'spike-results.md'), markdown);
  process.stdout.write(`${markdown}\n`);

  process.exitCode = summary.status === 'passed' ? 0 : 1;
}

async function runBenchmarkRepo(input) {
  const started = Date.now();
  const childResult = await runCommand(process.execPath, [cliPath, 'run', input.repoRoot, '--browser'], {
    cwd: root,
    timeoutMs: 180000
  });
  const durationMs = Date.now() - started;

  if (childResult.exitCode !== 0) {
    return {
      name: input.name,
      status: 'failed',
      durationMs,
      generatedTests: 0,
      generatedTestValidation: 'skipped',
      findings: 0,
      artifacts: 0,
      error: childResult.stderr || childResult.stdout || `exitCode=${childResult.exitCode}`
    };
  }

  try {
    const output = JSON.parse(childResult.stdout);
    const findingsFile = JSON.parse(await readFile(output.findingsPath, 'utf8'));
    const generatedTests = Array.isArray(output.testGeneration?.createdFiles)
      ? output.testGeneration.createdFiles.length
      : 0;
    const generatedTestPath = output.testGeneration?.createdFiles?.[0];
    const generatedTestValidation = generatedTestPath
      ? await validateGeneratedTest(input.repoRoot, generatedTestPath)
      : { status: 'skipped' };
    const findings = Array.isArray(findingsFile.findings) ? findingsFile.findings.length : 0;
    const artifacts = Array.isArray(output.explore?.artifactFiles) ? output.explore.artifactFiles.length : 0;
    const reportExists = await fileExists(output.reportPath);
    const hasGeneratedTest = generatedTests > 0;
    const generatedTestPassed = generatedTestValidation.status === 'passed';

    return {
      name: input.name,
      status: reportExists && hasGeneratedTest && generatedTestPassed ? 'completed' : 'failed',
      durationMs,
      reportPath: output.reportPath,
      findingsPath: output.findingsPath,
      generatedTests,
      generatedTestValidation: generatedTestValidation.status,
      findings,
      artifacts,
      readinessScore: output.report?.readinessScore,
      ...(reportExists && hasGeneratedTest && generatedTestPassed
        ? {}
        : { error: generatedTestValidation.error ?? 'Missing report, generated test artifact, or generated test validation failed' })
    };
  } catch (error) {
    return {
      name: input.name,
      status: 'failed',
      durationMs,
      generatedTests: 0,
      generatedTestValidation: 'skipped',
      findings: 0,
      artifacts: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function validateGeneratedTest(repoRoot, generatedTestPath) {
  let server = null;

  try {
    server = await startFixtureServer(repoRoot);
    const relativeGeneratedTestPath = relative(repoRoot, generatedTestPath);
    const result = await runCommand(playwrightPath, ['test', relativeGeneratedTestPath, '--reporter=line'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        HARDENING_BASE_URL: server.url
      },
      timeoutMs: 60000
    });

    return result.exitCode === 0
      ? { status: 'passed' }
      : { status: 'failed', error: result.stderr || result.stdout || `exitCode=${result.exitCode}` };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    if (server) {
      await server.stop();
    }
  }
}

function startFixtureServer(repoRoot) {
  return new Promise((resolveStart, rejectStart) => {
    const child = spawn('npm', ['run', 'dev'], {
      cwd: repoRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let logs = '';
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      child.kill('SIGTERM');
      rejectStart(new Error(`Timed out waiting for benchmark validation server URL. Logs: ${logs}`));
    }, 10000);
    const onData = (chunk) => {
      logs += chunk.toString('utf8');
      const url = extractLocalUrl(logs);

      if (!url || settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolveStart({
        url,
        stop: async () => {
          await stopChild(child);
        }
      });
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      rejectStart(new Error(`Benchmark validation server exited before URL: ${code ?? 'unknown'}. Logs: ${logs}`));
    });
  });
}

function extractLocalUrl(logs) {
  const match = logs.match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):\d+\/?/);
  return match ? match[0].replace(/\/$/, '') : null;
}

function stopChild(child) {
  return new Promise((resolveStop) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolveStop();
      return;
    }

    const timeout = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
      }
      resolveStop();
    }, 1000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolveStop();
    });
    child.kill('SIGTERM');
  });
}

function runCommand(command, args, options) {
  return new Promise((resolveResult) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      child.kill('SIGTERM');
      resolveResult({
        exitCode: 124,
        stdout,
        stderr: stderr || `Timed out after ${options.timeoutMs}ms`
      });
    }, options.timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    child.on('exit', (code) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolveResult({
        exitCode: code ?? 1,
        stdout,
        stderr
      });
    });
  });
}

async function fileExists(path) {
  try {
    await readFile(path, 'utf8');
    return true;
  } catch {
    return false;
  }
}
