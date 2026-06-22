import { extractUrlFromLog, parseStartCommand } from '../../src/domain/boot/boot-app.js';

describe('parseStartCommand', () => {
  it('splits a package manager command into command and args', () => {
    expect(parseStartCommand('npm run dev')).toEqual({
      command: 'npm',
      args: ['run', 'dev'],
      env: {}
    });
    expect(parseStartCommand('pnpm dev')).toEqual({
      command: 'pnpm',
      args: ['dev'],
      env: {}
    });
  });

  it('parses quoted start command arguments', () => {
    expect(parseStartCommand("pnpm --filter 'web app' dev -- --host 127.0.0.1")).toEqual({
      command: 'pnpm',
      args: ['--filter', 'web app', 'dev', '--', '--host', '127.0.0.1'],
      env: {}
    });
    expect(parseStartCommand('node "scripts/dev server.mjs"')).toEqual({
      command: 'node',
      args: ['scripts/dev server.mjs'],
      env: {}
    });
  });

  it('parses leading inline environment assignments', () => {
    expect(parseStartCommand("NODE_ENV=development PORT='3001' pnpm dev")).toEqual({
      command: 'pnpm',
      args: ['dev'],
      env: {
        NODE_ENV: 'development',
        PORT: '3001'
      }
    });
  });

  it('rejects start commands with unclosed quotes', () => {
    expect(() => parseStartCommand("pnpm --filter 'web app dev")).toThrow('Start command has invalid shell quoting');
  });

  it('rejects an empty start command', () => {
    expect(() => parseStartCommand('   ')).toThrow('Start command is empty');
  });
});

describe('extractUrlFromLog', () => {
  it('extracts localhost urls from common dev server logs', () => {
    expect(extractUrlFromLog('Local: http://localhost:5173/')).toBe('http://localhost:5173');
    expect(extractUrlFromLog('ready - started server on 0.0.0.0:3000, url: http://localhost:3000')).toBe(
      'http://localhost:3000'
    );
  });

  it('normalizes 0.0.0.0 log urls to a loopback address clients can visit', () => {
    expect(extractUrlFromLog('Network: http://0.0.0.0:5173/')).toBe('http://127.0.0.1:5173');
  });

  it('normalizes IPv6 unspecified log urls to a loopback address clients can visit', () => {
    expect(extractUrlFromLog('Network: http://[::]:5173/')).toBe('http://127.0.0.1:5173');
  });

  it('preserves local url paths and query strings from dev server logs', () => {
    expect(extractUrlFromLog('Local: http://localhost:5173/app/dashboard?seed=1')).toBe(
      'http://localhost:5173/app/dashboard?seed=1'
    );
  });

  it('strips sentence punctuation after local urls in dev server logs', () => {
    expect(extractUrlFromLog('ready at http://localhost:5173/app/dashboard?seed=1,')).toBe(
      'http://localhost:5173/app/dashboard?seed=1'
    );
    expect(extractUrlFromLog('ready at http://localhost:5173/app.')).toBe('http://localhost:5173/app');
  });

  it('returns null when no local url is present', () => {
    expect(extractUrlFromLog('compiling...')).toBeNull();
  });
});
