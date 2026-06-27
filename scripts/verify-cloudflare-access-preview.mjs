import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const title = 'Cloudflare Access Private Preview Reviewer Acceptance v0.1';
const root = process.cwd();
const outputDir = join(root, 'artifacts/public-website-preview/cloudflare-access-acceptance');
const reportPath = join(outputDir, 'acceptance-report.json');
const reviewGuidePath = join(outputDir, 'review-guide.md');

const protectedUrl = process.env.REPOASSURE_PRIVATE_PREVIEW_URL ?? 'https://repoassure-preview.pages.dev';
const publicUrlCandidates = (process.env.REPOASSURE_PRIVATE_PREVIEW_PUBLIC_URLS ?? '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const reviewerAuthenticated =
  process.env.REPOASSURE_PRIVATE_PREVIEW_REVIEWER_AUTHENTICATED === 'true';

function normalizeUrl(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function parseHeaderBlocks(rawHeaders) {
  return rawHeaders
    .replace(/\r\n/g, '\n')
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter((block) => block.startsWith('HTTP/'));
}

function parseLastHeaderBlock(rawHeaders) {
  const blocks = parseHeaderBlocks(rawHeaders);
  const block = blocks.at(-1) ?? '';
  const lines = block.split('\n').filter(Boolean);
  const statusLine = lines[0] ?? '';
  const status = Number(statusLine.match(/^HTTP\/\S+\s+(\d+)/)?.[1] ?? 0);
  const headers = new Map();

  for (const line of lines.slice(1)) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    const existing = headers.get(key);
    headers.set(key, existing ? `${existing}, ${value}` : value);
  }

  return { statusLine, status, headers };
}

async function head(url) {
  const { stdout } = await execFileAsync('curl', ['-sS', '-I', '--max-time', '30', url], {
    maxBuffer: 1024 * 1024
  });
  const parsed = parseLastHeaderBlock(stdout);
  return {
    url,
    status: parsed.status,
    location: redactLocation(parsed.headers.get('location') ?? null),
    wwwAuthenticate: parsed.headers.get('www-authenticate') ?? null,
    cacheControl: parsed.headers.get('cache-control') ?? null,
    rawStatusLine: parsed.statusLine
  };
}

function redactLocation(location) {
  if (!location) {
    return null;
  }

  try {
    const parsed = new URL(location);
    parsed.search = parsed.search ? '?[redacted]' : '';
    parsed.hash = parsed.hash ? '#[redacted]' : '';
    return parsed.toString();
  } catch {
    return location.includes('?') ? `${location.split('?')[0]}?[redacted]` : location;
  }
}

function buildCheck(id, status, summary, details = {}) {
  return { id, status, summary, details };
}

const normalizedProtectedUrl = normalizeUrl(protectedUrl);
const protectedHead = await head(normalizedProtectedUrl);
const metadataHead = await head(`${normalizedProtectedUrl}/.well-known/cloudflare-access-protected-resource/`);
const publicUrlHeads = [];

for (const url of publicUrlCandidates) {
  publicUrlHeads.push(await head(url));
}

const protectedRedirectsToAccess =
  [302, 303].includes(protectedHead.status) &&
  typeof protectedHead.location === 'string' &&
  protectedHead.location.includes('cloudflareaccess.com/cdn-cgi/access/login');
const hasAccessAuthenticateHeader =
  typeof protectedHead.wwwAuthenticate === 'string' &&
  protectedHead.wwwAuthenticate.includes('Cloudflare-Access');
const publicUrlsAreNotAcceptedReviewSurface = publicUrlHeads.every((result) => result.status === 200);

const checks = [
  buildCheck(
    'protected-url-access-redirect',
    protectedRedirectsToAccess ? 'passed' : 'failed',
    protectedRedirectsToAccess
      ? 'Protected review URL redirects unauthenticated users to Cloudflare Access login'
      : 'Protected review URL did not redirect unauthenticated users to Cloudflare Access login',
    protectedHead
  ),
  buildCheck(
    'protected-resource-metadata',
    hasAccessAuthenticateHeader ? 'passed' : 'failed',
    hasAccessAuthenticateHeader
      ? 'Protected review URL advertises Cloudflare Access protected-resource metadata'
      : 'Protected review URL is missing Cloudflare Access www-authenticate metadata',
    { wwwAuthenticate: protectedHead.wwwAuthenticate, metadataHead }
  ),
  buildCheck(
    'deployment-subdomains-not-review-surface',
    publicUrlHeads.length === 0 || publicUrlsAreNotAcceptedReviewSurface ? 'passed' : 'failed',
    publicUrlHeads.length === 0
      ? 'No deployment subdomain candidates were supplied for negative documentation'
      : 'Deployment subdomain candidates were checked and remain excluded from the accepted review surface',
    { publicUrlHeads }
  ),
  buildCheck(
    'reviewer-authenticated-content-smoke',
    reviewerAuthenticated ? 'passed' : 'manual_required',
    reviewerAuthenticated
      ? 'Reviewer authenticated content smoke was externally confirmed'
      : 'Reviewer authenticated content smoke requires manual email/OTP login and is not automated by this script',
    {
      expectedManualAction:
        'Open the protected review URL, authenticate through Cloudflare Access as an allowed reviewer, and verify the RepoAssure website renders.'
    }
  ),
  buildCheck(
    'rollback-boundary',
    'manual_required',
    'Rollback or shutdown remains a manual Cloudflare operation for this private preview',
    {
      expectedManualAction:
        'Disable/delete the Access application or delete the Cloudflare Pages deployment/project if private preview must be shut down.'
    }
  )
];

const failed = checks.filter((check) => check.status === 'failed');
const manualRequired = checks.filter((check) => check.status === 'manual_required');
const report = {
  title,
  generatedAt: new Date().toISOString(),
  status: failed.length > 0 ? 'failed' : manualRequired.length > 0 ? 'manual_required' : 'passed',
  input: {
    protectedUrl: normalizedProtectedUrl,
    publicUrlCandidates,
    reviewerAuthenticated,
    valuesRedacted: true
  },
  output: {
    directory: 'artifacts/public-website-preview/cloudflare-access-acceptance',
    report: 'artifacts/public-website-preview/cloudflare-access-acceptance/acceptance-report.json',
    reviewGuide: 'artifacts/public-website-preview/cloudflare-access-acceptance/review-guide.md'
  },
  checks
};

await mkdir(outputDir, { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(
  reviewGuidePath,
  `# ${title}

## Command

\`\`\`bash
pnpm verify:cloudflare-preview
\`\`\`

Optional negative-boundary check:

\`\`\`bash
REPOASSURE_PRIVATE_PREVIEW_PUBLIC_URLS="https://997feaee.repoassure-preview.pages.dev,https://main.repoassure-preview.pages.dev" pnpm verify:cloudflare-preview
\`\`\`

## Status

- Current status: \`${report.status}\`
- Protected review URL: \`${normalizedProtectedUrl}\`
- Report: \`artifacts/public-website-preview/cloudflare-access-acceptance/acceptance-report.json\`

## Reviewer-Side Acceptance

- Unauthenticated Access redirect: \`${checks[0].status}\`
- Cloudflare Access metadata header: \`${checks[1].status}\`
- Deployment subdomains excluded from accepted review surface: \`${checks[2].status}\`
- Authenticated content smoke: \`${checks[3].status}\`
- Rollback or shutdown: \`${checks[4].status}\`

## Manual Required Items

- Authenticate through Cloudflare Access as an allowed reviewer using the configured identity provider and email/OTP flow.
- Verify the RepoAssure public website renders after authentication.
- Use only \`${normalizedProtectedUrl}\` as the accepted private preview URL.
- Do not share deployment subdomains or branch aliases that are not covered by the Access application.
- If private preview must be shut down, disable/delete the Access application or remove the Cloudflare Pages deployment/project.
`
);

console.log(JSON.stringify({ status: report.status, output: report.output }, null, 2));

if (failed.length > 0) {
  process.exitCode = 1;
}
