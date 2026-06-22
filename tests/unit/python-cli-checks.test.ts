import {
  buildPythonCliSmokeCommands,
  buildPythonCliExecutionAcceptanceChecks,
  detectPythonCliStaticCheckCommands,
  isSafeCliSmokeCommand,
  runPythonCliCheckCommands,
  runPythonCliCheckCommand
} from '../../packages/acceptance/src/python-cli-checks.js';
import type { PythonCliProfile } from '../../packages/acceptance/src/python-cli-profile.js';

const baseProfile: PythonCliProfile = {
  repoRoot: '/tmp/python-cli-repo',
  pyprojectPath: '/tmp/python-cli-repo/pyproject.toml',
  projectName: 'agent-reach',
  requiresPython: '>=3.10',
  dependencies: ['requests>=2.28'],
  optionalDependencies: {
    dev: ['pytest>=8.0', 'ruff>=0.8', 'mypy>=1.12']
  },
  consoleScripts: {
    'agent-reach': 'agent_reach.cli:main'
  },
  blockers: [],
  confidence: 'high'
};

describe('python CLI checks', () => {
  it('builds safe help-only smoke commands from console scripts', () => {
    expect(buildPythonCliSmokeCommands(baseProfile)).toEqual([
      {
        kind: 'cli-smoke',
        command: 'agent-reach',
        args: ['--help'],
        required: true,
        reason: 'console script help smoke'
      }
    ]);
  });

  it('treats only help/version CLI smoke commands as safe by default', () => {
    expect(isSafeCliSmokeCommand({ command: 'agent-reach', args: ['--help'] })).toBe(true);
    expect(isSafeCliSmokeCommand({ command: 'agent-reach', args: ['-h'] })).toBe(true);
    expect(isSafeCliSmokeCommand({ command: 'agent-reach', args: ['--version'] })).toBe(true);
    expect(isSafeCliSmokeCommand({ command: 'agent-reach', args: ['search', 'openai'] })).toBe(false);
    expect(isSafeCliSmokeCommand({ command: 'agent-reach', args: [] })).toBe(false);
  });

  it('detects configured pytest, ruff, and mypy static commands from optional dev dependencies', () => {
    expect(detectPythonCliStaticCheckCommands(baseProfile)).toEqual([
      { kind: 'test', command: 'pytest', args: [], required: false, reason: 'configured dev dependency' },
      { kind: 'static', command: 'ruff', args: ['check', '.'], required: false, reason: 'configured dev dependency' },
      { kind: 'static', command: 'mypy', args: ['.'], required: false, reason: 'configured dev dependency' }
    ]);
  });

  it('runs a bounded command and redacts captured output', async () => {
    const result = await runPythonCliCheckCommand({
      command: process.execPath,
      args: ['-e', 'console.log("ok SECRET_TOKEN=abc123")'],
      cwd: process.cwd(),
      timeoutMs: 5_000,
      maxOutputChars: 200
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('ok');
    expect(result.stdout).not.toContain('SECRET_TOKEN=abc123');
    expect(result.stdout).toContain('SECRET_TOKEN=[REDACTED]');
  });

  it('summarizes real command results as acceptance checks', () => {
    const commands = [
      { kind: 'cli-smoke' as const, command: 'agent-reach', args: ['--help'], required: true, reason: 'console script help smoke' },
      { kind: 'test' as const, command: 'pytest', args: [], required: false, reason: 'configured dev dependency' },
      { kind: 'static' as const, command: 'ruff', args: ['check', '.'], required: false, reason: 'configured dev dependency' }
    ];
    const results = [
      { command: 'agent-reach', args: ['--help'], exitCode: 0, stdout: 'usage: agent-reach', stderr: '', timedOut: false },
      { command: 'pytest', args: [], exitCode: 0, stdout: '162 passed', stderr: '', timedOut: false },
      { command: 'ruff', args: ['check', '.'], exitCode: 1, stdout: 'Found 46 errors', stderr: '', timedOut: false }
    ];

    expect(buildPythonCliExecutionAcceptanceChecks(commands, results)).toEqual([
      {
        name: 'Python CLI check 执行: agent-reach --help',
        required: true,
        status: 'passed',
        evidence: 'exit=0 stdout=usage: agent-reach'
      },
      {
        name: 'Python CLI check 执行: pytest',
        required: false,
        status: 'passed',
        evidence: 'exit=0 stdout=162 passed'
      },
      {
        name: 'Python CLI check 执行: ruff check .',
        required: false,
        status: 'failed',
        evidence: 'exit=1 stdout=Found 46 errors'
      }
    ]);
  });

  it('runs command batches with an isolated HOME and cleared common API keys', async () => {
    const [result] = await runPythonCliCheckCommands({
      commands: [
        {
          kind: 'test',
          command: process.execPath,
          args: ['-e', 'console.log(process.env.HOME); console.log(`OPENAI=${process.env.OPENAI_API_KEY ?? ""}`);'],
          required: false,
          reason: 'environment isolation smoke'
        }
      ],
      cwd: process.cwd(),
      timeoutMs: 5_000,
      maxOutputChars: 500
    });

    expect(result?.exitCode).toBe(0);
    expect(result?.stdout).toContain('.hardening/python-cli-home');
    expect(result?.stdout).toContain('OPENAI=');
  });
});
