#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function readArg(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const cacheDir = readArg('--cache', '.seo-cache');
const outDir = readArg('--out-dir', path.join(cacheDir, 'signal-runs'));
const label = readArg('--label', new Date().toISOString().replace(/[:.]/g, '-'));
const runDir = path.join(outDir, label);
const files = [
  'seo-signal-files-verification.json',
  'production-signals-summary.json',
  'seo-change-control-report.json',
  'seo-local-gates-report.json',
  'seo-automation-consistency-report.json',
  'seo-offline-skills-report.json',
  'seo-source-baseline.json',
  'seo-source-current.json',
  'seo-source-drift-report.json',
  'production-seo-check.json',
  'npm-audit-prod.json',
  'npm-audit-full.json'
];

fs.mkdirSync(runDir, { recursive: true });
const copied = [];
const missing = [];
for (const file of files) {
  const src = path.join(cacheDir, file);
  if (fs.existsSync(src)) {
    const dest = path.join(runDir, file);
    fs.copyFileSync(src, dest);
    copied.push(dest);
  } else {
    missing.push(src);
  }
}
const manifest = {
  generatedAt: new Date().toISOString(),
  label,
  runDir,
  copied,
  missing,
  note: 'Archive contains local derived summaries only. Raw Search Console, PageSpeed, crawl, Bing, backlink, competitor, and CSP exports remain in seo-signals/ unless intentionally copied by the operator.'
};
fs.writeFileSync(path.join(runDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));
