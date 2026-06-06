#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function readArg(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const outFile = readArg('--out', '.seo-cache/seo-source-baseline.json');
const root = process.cwd();

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function normalize(file) {
  return file.split(path.sep).join('/');
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const explicitFiles = [
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'src/app/layout.tsx',
  'src/app/sitemap.ts',
  'src/app/robots.ts',
  'public/robots.txt',
  'public/manifest.webmanifest',
  'public/ads.txt',
  '.github/workflows/seo-local-gates.yml',
  '.github/PULL_REQUEST_TEMPLATE/seo-change-control.md',
  'docs/SEO_DEPLOYMENT_GATES.md',
  'docs/SEO_STRATEGY.md',
  'docs/SEO_FLOW_OPERATING_MODEL.md',
  'docs/SEO_KEYWORD_CLUSTER_MAP.md',
  'docs/SEO_AUTHORITY_OUTREACH_PLAN.md',
  'docs/SEO_GOOGLE_OPERATIONS.md',
  'docs/SEO_DRIFT_BASELINE.md'
];

const collected = new Set(explicitFiles.filter((file) => fs.existsSync(file)));
for (const file of walk('src/data')) collected.add(normalize(file));
for (const file of walk('src/app')) {
  if (/\.(tsx|ts)$/.test(file)) collected.add(normalize(file));
}
for (const file of walk('scripts')) {
  if (/\.mjs$/.test(file)) collected.add(normalize(file));
}
for (const file of walk('public')) {
  if (/\.(txt|xml|webmanifest|json|png|ico|svg)$/.test(file)) collected.add(normalize(file));
}

const files = [...collected].sort();
const fileEntries = files.map((file) => {
  const text = fs.readFileSync(path.join(root, file));
  return {
    path: file,
    bytes: text.length,
    sha256: crypto.createHash('sha256').update(text).digest('hex')
  };
});

function countMatches(file, pattern) {
  if (!fs.existsSync(file)) return 0;
  const text = fs.readFileSync(file, 'utf8');
  return (text.match(pattern) || []).length;
}

const summary = {
  canonicalPageDeclarations: countMatches('src/data/pages.ts', /path:\s*'\//g),
  redirectAliasDeclarations: countMatches('src/data/pages.ts', /from:\s*'\//g),
  machineReadableRoutes: walk('src/app').filter((file) => /\.(json|txt|xml)\/route\.ts$/.test(normalize(file))).length,
  seoDocs: files.filter((file) => file.startsWith('docs/SEO_')).length,
  seoScripts: files.filter((file) => file.startsWith('scripts/') && file.includes('seo')).length,
  publicAssets: files.filter((file) => file.startsWith('public/')).length
};

const body = {
  generatedAt: new Date().toISOString(),
  status: 'captured',
  scope: 'source-level SEO drift baseline; no production crawl, GSC export, PageSpeed export, Bing export, or CSP export required',
  skippedByPolicy: ['npm run build', 'Vitest', 'Playwright', 'local Lighthouse', 'real seo-signals export'],
  summary,
  aggregateSha256: sha256(fileEntries.map((entry) => `${entry.path}:${entry.sha256}`).join('\n')),
  files: fileEntries
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(body, null, 2)}\n`);
console.log(JSON.stringify({ status: body.status, outFile, summary, aggregateSha256: body.aggregateSha256 }, null, 2));
