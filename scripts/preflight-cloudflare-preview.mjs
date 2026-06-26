import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const title = 'Cloudflare Access Remote Preview Preflight v0.1';
const root = process.cwd();
const outputDir = join(root, 'artifacts/public-website-preview/cloudflare-access-preflight');
const reportPath = join(outputDir, 'preflight-report.json');
const reviewGuidePath = join(outputDir, 'review-guide.md');
const localPreviewManifestPath = join(root, 'artifacts/public-website-preview/local-static-preview/manifest.json');

const requiredEnvironment = [
  {
    name: 'REPOASSURE_CLOUDFLARE_ACCOUNT_ID',
    description: 'Cloudflare account identifier for the private preview host.'
  },
  {
    name: 'REPOASSURE_CLOUDFLARE_PAGES_PROJECT',
    description: 'Cloudflare Pages project name reserved for RepoAssure preview deployments.'
  },
  {
    name: 'REPOASSURE_CLOUDFLARE_ACCESS_POLICY',
    description: 'Cloudflare Access policy name or identifier that protects preview deployments before any URL is shared.'
  },
  {
    name: 'REPOASSURE_REMOTE_PREVIEW_DATA_EXPORT_AUTHORIZED',
    description: 'Must be set to true only after explicit authorization to upload RepoAssure website source/build output.'
  }
];

function isPresent(name) {
  const value = process.env[name];
  return typeof value === 'string' && value.trim().length > 0;
}

function buildCheck(id, status, summary, details = []) {
  return { id, status, summary, details };
}

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function pathIsFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

const localPreviewManifest = await readOptionalJson(localPreviewManifestPath);
const localPreviewReady = await pathIsFile(localPreviewManifestPath);
const dataExportAuthorized = process.env.REPOASSURE_REMOTE_PREVIEW_DATA_EXPORT_AUTHORIZED === 'true';

const envChecks = requiredEnvironment.map((item) =>
  buildCheck(
    `env:${item.name}`,
    isPresent(item.name) ? 'passed' : 'blocked',
    isPresent(item.name) ? `${item.name} is present without value disclosure` : `${item.name} is missing`,
    [item.description]
  )
);

const checks = [
  buildCheck(
    'local-static-preview-package',
    localPreviewReady ? 'passed' : 'blocked',
    localPreviewReady
      ? 'Local static preview package manifest exists for review handoff continuity'
      : 'Run pnpm build:website and pnpm package:website-preview before remote preview execution',
    [localPreviewManifestPath.replace(`${root}/`, '')]
  ),
  ...envChecks,
  buildCheck(
    'data-export-authorization',
    dataExportAuthorized ? 'passed' : 'blocked',
    dataExportAuthorized
      ? 'Explicit remote preview data-export authorization is recorded in the environment'
      : 'Remote preview execution remains blocked until data-export authorization is explicitly set to true',
    ['No website source or build output is uploaded by this preflight']
  ),
  buildCheck(
    'access-before-url-sharing',
    isPresent('REPOASSURE_CLOUDFLARE_ACCESS_POLICY') ? 'passed' : 'blocked',
    isPresent('REPOASSURE_CLOUDFLARE_ACCESS_POLICY')
      ? 'Cloudflare Access policy reference is available for later verification'
      : 'Cloudflare Access policy must be enabled before any preview URL is shared',
    ['Cloudflare Pages preview deployments are public by default']
  ),
  buildCheck(
    'non-authorization-boundary',
    'passed',
    'Preflight does not authorize public launch, production deployment, custom domain binding, or hosted availability claims',
    [
      'No website source or build output is uploaded by this preflight',
      'No preview URL is created by this preflight',
      'No Cloudflare API request is made by this preflight',
      'No Vercel Git integration is restored by this preflight'
    ]
  )
];

const failedOrBlocked = checks.filter((check) => check.status !== 'passed');
const report = {
  title,
  generatedAt: new Date().toISOString(),
  status: failedOrBlocked.length === 0 ? 'ready_for_manual_remote_execution' : 'blocked',
  output: {
    directory: 'artifacts/public-website-preview/cloudflare-access-preflight',
    report: 'artifacts/public-website-preview/cloudflare-access-preflight/preflight-report.json',
    reviewGuide: 'artifacts/public-website-preview/cloudflare-access-preflight/review-guide.md'
  },
  boundaries: {
    noWebsiteUpload: true,
    noRemoteHostingProviderMutation: true,
    noPreviewUrlCreated: true,
    noProductionDeploymentAuthorization: true,
    noPublicLaunchAuthorization: true,
    noVercelGitIntegrationRestore: true
  },
  localStaticPreviewPackage: localPreviewManifest
    ? {
        packageName: localPreviewManifest.packageName,
        packageVersion: localPreviewManifest.packageVersion,
        generatedAt: localPreviewManifest.generatedAt,
        forbiddenClaimSummary: localPreviewManifest.forbiddenClaimSummary
      }
    : null,
  requiredEnvironment: requiredEnvironment.map((item) => ({
    name: item.name,
    present: isPresent(item.name),
    valueRedacted: true,
    description: item.description
  })),
  checks
};

await mkdir(outputDir, { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(
  reviewGuidePath,
  `# ${title}

No website source or build output is uploaded by this preflight.

## Command

\`\`\`bash
pnpm preflight:cloudflare-preview
\`\`\`

## Status

- Current status: \`${report.status}\`
- Report: \`artifacts/public-website-preview/cloudflare-access-preflight/preflight-report.json\`
- Local static preview package required before execution: \`${localPreviewReady ? 'present' : 'missing'}\`

## Required Before Remote Execution

- \`REPOASSURE_CLOUDFLARE_ACCOUNT_ID\`
- \`REPOASSURE_CLOUDFLARE_PAGES_PROJECT\`
- \`REPOASSURE_CLOUDFLARE_ACCESS_POLICY\`
- \`REPOASSURE_REMOTE_PREVIEW_DATA_EXPORT_AUTHORIZED=true\`

## Boundary

- Cloudflare Pages preview deployments are public by default.
- Cloudflare Access policy must be enabled before any preview URL is shared.
- No website source or build output is uploaded by this preflight.
- No remote hosting provider is mutated by this preflight.
- No preview URL is created by this preflight.
- This preflight does not authorize public launch, production deployment, public custom domain binding, repository visibility changes, npm publication, GitHub release creation, external announcements, or SaaS/Team Cloud/Enterprise/hosted dashboard availability claims.
`
);

console.log(JSON.stringify({ status: report.status, output: report.output }, null, 2));
