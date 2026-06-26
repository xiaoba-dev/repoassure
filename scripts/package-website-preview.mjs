import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'apps/website/dist');
const outDir = join(root, 'artifacts/public-website-preview/local-static-preview');
const packagedDistDir = join(outDir, 'dist');

const forbiddenClaims = [
  { id: 'saas-available', pattern: '\\bSaaS is available\\b' },
  { id: 'team-cloud-available', pattern: '\\bTeam Cloud is available\\b' },
  { id: 'enterprise-available', pattern: '\\bEnterprise is available\\b' },
  { id: 'public-npm-package', pattern: '\\bpublic npm package\\b' },
  { id: 'public-repo-published', pattern: '\\bpublic repository is already published\\b' },
  { id: 'source-upload-default', pattern: '\\bsource code is uploaded by default\\b' },
  { id: 'zh-saas-available', pattern: 'SaaS\\s*已(经)?(上线|可用|开放)' },
  { id: 'zh-team-cloud-available', pattern: 'Team Cloud\\s*已(经)?(上线|可用|开放)' },
  { id: 'zh-enterprise-available', pattern: 'Enterprise\\s*已(经)?(上线|可用|开放)' },
  { id: 'zh-public-npm-available', pattern: '公开\\s*npm\\s*包\\s*已(经)?(发布|可用)' },
  { id: 'zh-public-repo-published', pattern: '公开仓库\\s*已(经)?发布' },
  { id: 'zh-source-upload-default', pattern: '默认上传源代码' }
];

async function assertBuildOutput() {
  const indexPath = join(distDir, 'index.html');
  try {
    const indexStat = await stat(indexPath);
    if (!indexStat.isFile()) {
      throw new Error(`${relative(root, indexPath)} is not a file.`);
    }
  } catch (error) {
    throw new Error(
      `Website build output is missing. Run pnpm build:website before pnpm package:website-preview. ${String(error)}`,
      { cause: error }
    );
  }
}

async function collectFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path, base)));
    } else if (entry.isFile()) {
      files.push(relative(base, path));
    }
  }

  return files.sort();
}

async function hashFile(path) {
  const bytes = await readFile(path);
  return createHash('sha256').update(bytes).digest('hex');
}

async function scanForbiddenClaims(files) {
  const results = [];

  for (const file of files) {
    if (!/\.(html|js|css|json|txt|map)$/i.test(file)) {
      continue;
    }

    const content = await readFile(join(packagedDistDir, file), 'utf8');
    for (const claim of forbiddenClaims) {
      const regex = new RegExp(claim.pattern, 'i');
      const matched = regex.test(content);
      results.push({
        file,
        claimId: claim.id,
        pattern: claim.pattern,
        status: matched ? 'failed' : 'passed'
      });
    }
  }

  return results;
}

await assertBuildOutput();
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(distDir, packagedDistDir, { recursive: true });

const files = await collectFiles(packagedDistDir);
const fileManifest = [];

for (const file of files) {
  const path = join(packagedDistDir, file);
  const fileStat = await stat(path);
  fileManifest.push({
    path: `dist/${file}`,
    bytes: fileStat.size,
    sha256: await hashFile(path)
  });
}

const forbiddenClaimResults = await scanForbiddenClaims(files);
const failedForbiddenClaims = forbiddenClaimResults.filter((result) => result.status === 'failed');

const manifest = {
  packageName: 'RepoAssure Local Static Preview Package',
  packageVersion: 'v0.1',
  generatedAt: new Date().toISOString(),
  source: {
    buildCommand: 'pnpm build:website',
    packageCommand: 'pnpm package:website-preview',
    sourceDirectory: 'apps/website/dist'
  },
  output: {
    directory: 'artifacts/public-website-preview/local-static-preview',
    distDirectory: 'artifacts/public-website-preview/local-static-preview/dist',
    reviewGuide: 'artifacts/public-website-preview/local-static-preview/review-guide.md',
    forbiddenClaims: 'artifacts/public-website-preview/local-static-preview/forbidden-claims.json'
  },
  reviewBoundary: {
    statement: 'This package is a local static preview only.',
    noRemoteHostingProvider: true,
    noPreviewUrl: true,
    noPublicLaunchAuthorization: true,
    noProductionDeploymentAuthorization: true,
    noVercelGitIntegrationRestore: true
  },
  files: fileManifest,
  forbiddenClaimSummary: {
    checked: forbiddenClaimResults.length,
    failed: failedForbiddenClaims.length,
    status: failedForbiddenClaims.length === 0 ? 'passed' : 'failed'
  }
};

await writeFile(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(join(outDir, 'forbidden-claims.json'), `${JSON.stringify(forbiddenClaimResults, null, 2)}\n`);
await writeFile(
  join(outDir, 'review-guide.md'),
  `# RepoAssure Local Static Preview Package

This package is a local static preview only.

## Contents

- \`dist/\`: Static website build output copied from \`apps/website/dist\`.
- \`manifest.json\`: File hashes, package metadata, and review boundary.
- \`forbidden-claims.json\`: Static forbidden-claim scan results.

## Review Commands

\`\`\`bash
pnpm build:website
pnpm package:website-preview
\`\`\`

Open \`artifacts/public-website-preview/local-static-preview/dist/index.html\` locally, or serve the \`dist/\` directory with a local-only static server.

## Boundary

- No remote hosting provider is used.
- No preview URL is created.
- No production deployment is authorized.
- No public launch is authorized.
- Do not restore Vercel Git integration from this package.
- Do not upload this package to Cloudflare, Vercel, or another host without a separate execution goal and explicit authorization.
`
);

if (failedForbiddenClaims.length > 0) {
  console.error(JSON.stringify({ output: manifest.output, forbiddenClaimSummary: manifest.forbiddenClaimSummary }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ output: manifest.output, forbiddenClaimSummary: manifest.forbiddenClaimSummary }, null, 2));
}
